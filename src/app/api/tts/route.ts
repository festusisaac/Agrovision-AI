import { NextRequest, NextResponse } from "next/server";

const YARNGPT_API_KEY = process.env.YARNGPT_API_KEY;

// Best-guess defaults based on each voice's apparent language association;
// override via env once you've confirmed actual behavior against the API.
const DEFAULT_VOICE = "Idera";

const VOICES: Record<string, string | undefined> = {
  en: process.env.YARNGPT_VOICE_EN || "Emma",
  ha: process.env.YARNGPT_VOICE_HA || "Zainab",
  yo: process.env.YARNGPT_VOICE_YO || "Wura",
  ig: process.env.YARNGPT_VOICE_IG || "Chinenye",
};

// YarnGPT accepts up to 2000 chars per request, but generation time scales
// with length (~14s observed for ~200 chars) — keep chunks small so each
// individual request finishes in a bounded, predictable time. Chunks run in
// parallel, so splitting more doesn't add to the total wait; it's bounded by
// the slowest single chunk either way.
const MAX_CHUNK_CHARS = 400;

function splitIntoChunks(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && (current + sentence).length > MAX_CHUNK_CHARS) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// Generously above the worst-case latency for a single MAX_CHUNK_CHARS chunk
// (observed ~14s for ~200 chars, non-English) — long enough to let a real
// slow-but-successful response through, short enough to still fail fast if
// YarnGPT genuinely hangs.
const REQUEST_TIMEOUT_MS = 40000;

async function synthesizeChunk(text: string, voice: string): Promise<Buffer> {
  const res = await fetch("https://yarngpt.ai/api/v1/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${YARNGPT_API_KEY}`,
    },
    body: JSON.stringify({ text, voice, response_format: "mp3" }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`YarnGPT request failed: ${res.status} ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const text: string | undefined = body?.text;
  const language: string | undefined = body?.language;

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  if (!YARNGPT_API_KEY) {
    return NextResponse.json({ error: "TTS is not configured" }, { status: 501 });
  }

  const voice = VOICES[language ?? "en"] || VOICES.en || DEFAULT_VOICE;

  try {
    const chunks = splitIntoChunks(text);
    const buffers = await Promise.all(chunks.map((chunk) => synthesizeChunk(chunk, voice)));
    const stitched = Buffer.concat(buffers);
    return new NextResponse(stitched, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[/api/tts]", err);
    return NextResponse.json({ error: "Speech generation failed" }, { status: 502 });
  }
}
