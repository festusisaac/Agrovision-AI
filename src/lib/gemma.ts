/**
 * Central Gemma inference client.
 *
 * Phase 1 (current): cloud inference, either via Google's Gemini API (which
 * hosts Gemma 4 directly — the default, most reliable option) or via
 * Hugging Face's router as an alternative.
 *
 * Phase 2 (future, zero-connectivity): set GEMMA_PROVIDER=local to route the
 * exact same calls to a local Ollama instance (e.g. `ollama run gemma3`),
 * so no other code in the app needs to change when moving to edge/offline.
 */

type Provider = "google" | "huggingface" | "local";

function getProvider(): Provider {
  const provider = process.env.GEMMA_PROVIDER;
  if (provider === "huggingface" || provider === "local") return provider;
  return "google";
}

export class GemmaNotConfiguredError extends Error {
  constructor(message = "Gemma provider is not configured") {
    super(message);
    this.name = "GemmaNotConfiguredError";
  }
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_TEXT_MODEL = process.env.OLLAMA_TEXT_MODEL || "gemma3:2b";
const OLLAMA_VISION_MODEL = process.env.OLLAMA_VISION_MODEL || "gemma3:4b";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
// gemma-4-26b-a4b-it is a mixture-of-experts variant — noticeably faster than the
// dense gemma-4-31b-it for the same task, at comparable quality for short answers.
const GOOGLE_MODEL = process.env.GOOGLE_MODEL || "gemma-4-26b-a4b-it";

const HF_API_KEY = process.env.HF_API_KEY;
// Hugging Face's inference marketplace routes each model through specific
// third-party providers; not every provider serves every model, so this
// must match a provider that actually hosts HF_MODEL (see the model's
// "Inference Providers" section on huggingface.co).
const HF_PROVIDER = process.env.HF_PROVIDER || "featherless-ai";
const HF_MODEL = process.env.HF_MODEL || "google/gemma-3-27b-it";

interface GooglePart {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

interface HfContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

/** Retries on 503/429 (transient overload/rate-limit) with backoff — cloud providers occasionally return these under load. */
async function fetchWithRetry(url: string, init: RequestInit, retries = 2, backoffMs = 800): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, init);
    if (res.ok || attempt >= retries || (res.status !== 503 && res.status !== 429)) {
      return res;
    }
    await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)));
  }
}

async function ollamaGenerate(
  model: string,
  prompt: string,
  system?: string,
  images?: string[]
): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, system, images, stream: false }),
  });
  if (!res.ok) {
    throw new Error(`Ollama request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.response as string;
}

async function googleGenerateContent(parts: GooglePart[], systemInstruction?: string): Promise<string> {
  if (!GOOGLE_API_KEY) {
    throw new GemmaNotConfiguredError("GOOGLE_API_KEY is not set");
  }
  const res = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
        contents: [{ parts }],
        generationConfig: { thinkingConfig: { thinkingLevel: "minimal" } },
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Google Gemini API request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const responseParts = data.candidates?.[0]?.content?.parts ?? [];
  return responseParts
    .filter((p: { thought?: boolean }) => !p.thought)
    .map((p: { text?: string }) => p.text ?? "")
    .join("");
}

/** Streams text deltas as they arrive from Gemini's SSE endpoint — used for chat, so replies appear progressively instead of after one long wait. */
async function* googleGenerateContentStream(
  parts: GooglePart[],
  systemInstruction?: string
): AsyncGenerator<string> {
  if (!GOOGLE_API_KEY) {
    throw new GemmaNotConfiguredError("GOOGLE_API_KEY is not set");
  }
  const res = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_MODEL}:streamGenerateContent?alt=sse&key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
        contents: [{ parts }],
        generationConfig: { thinkingConfig: { thinkingLevel: "minimal" } },
      }),
    }
  );
  if (!res.ok || !res.body) {
    throw new Error(`Google Gemini API request failed: ${res.status} ${await res.text()}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    // Google's SSE stream uses CRLF line endings; normalize so "\n\n" reliably
    // marks a frame boundary regardless of how chunks split across reads.
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

    let boundary: number;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const dataLine = frame.split("\n").find((l) => l.startsWith("data:"));
      if (!dataLine) continue;
      const jsonStr = dataLine.slice(5).trim();
      if (!jsonStr) continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const responseParts = parsed.candidates?.[0]?.content?.parts ?? [];
        for (const p of responseParts as { thought?: boolean; text?: string }[]) {
          if (!p.thought && p.text) yield p.text;
        }
      } catch {
        // Ignore partial/malformed SSE frames.
      }
    }
  }
}

async function hfChatCompletion(content: string | HfContentPart[], systemInstruction?: string): Promise<string> {
  if (!HF_API_KEY) {
    throw new GemmaNotConfiguredError("HF_API_KEY is not set");
  }
  const messages = systemInstruction
    ? [{ role: "system", content: systemInstruction }, { role: "user", content }]
    : [{ role: "user", content }];
  const res = await fetchWithRetry(`https://router.huggingface.co/${HF_PROVIDER}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: HF_MODEL, messages }),
  });
  if (!res.ok) {
    throw new Error(`Hugging Face request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export function isGemmaConfigured(): boolean {
  const provider = getProvider();
  if (provider === "local") return true;
  if (provider === "huggingface") return Boolean(HF_API_KEY);
  return Boolean(GOOGLE_API_KEY);
}

/** Plain text generation (used by the chat assistant). */
export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const provider = getProvider();
  if (provider === "local") return ollamaGenerate(OLLAMA_TEXT_MODEL, prompt, systemInstruction);
  if (provider === "huggingface") return hfChatCompletion(prompt, systemInstruction);
  return googleGenerateContent([{ text: prompt }], systemInstruction);
}

/**
 * Streamed text generation so chat replies appear progressively. Only the
 * Google provider streams token-by-token; other providers yield the full
 * response as a single chunk once it's ready.
 */
export async function* generateTextStream(prompt: string, systemInstruction?: string): AsyncGenerator<string> {
  const provider = getProvider();
  if (provider === "google") {
    yield* googleGenerateContentStream([{ text: prompt }], systemInstruction);
    return;
  }
  yield await generateText(prompt, systemInstruction);
}

/**
 * Multimodal generation for crop/pest image diagnosis.
 * `imageBase64` must NOT include the `data:image/...;base64,` prefix.
 */
export async function generateVisionText(
  imageBase64: string,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const provider = getProvider();
  if (provider === "local") {
    return ollamaGenerate(OLLAMA_VISION_MODEL, prompt, systemInstruction, [imageBase64]);
  }
  if (provider === "huggingface") {
    return hfChatCompletion(
      [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      ],
      systemInstruction
    );
  }
  return googleGenerateContent(
    [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }],
    systemInstruction
  );
}

/**
 * Streamed multimodal generation for crop/pest diagnosis, so the raw JSON
 * arrives progressively instead of after one long wait. Only the Google
 * provider streams token-by-token; other providers yield the full response
 * as a single chunk once it's ready.
 */
export async function* generateVisionTextStream(
  imageBase64: string,
  prompt: string,
  systemInstruction?: string
): AsyncGenerator<string> {
  const provider = getProvider();
  if (provider === "google") {
    yield* googleGenerateContentStream(
      [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }],
      systemInstruction
    );
    return;
  }
  yield await generateVisionText(imageBase64, prompt, systemInstruction);
}
