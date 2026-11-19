import { NextRequest, NextResponse } from "next/server";

const YARNGPT_API_KEY = process.env.YARNGPT_API_KEY;

// Default voice (must be lowercase for YarnGPT API)
const DEFAULT_VOICE = "idera";

const VOICES: Record<string, string | undefined> = {
  en: (process.env.YARNGPT_VOICE_EN || "emma").toLowerCase(),
  ha: (process.env.YARNGPT_VOICE_HA || "zainab").toLowerCase(),
  yo: (process.env.YARNGPT_VOICE_YO || "wura").toLowerCase(),
  ig: (process.env.YARNGPT_VOICE_IG || "chinenye").toLowerCase(),
};

// YarnGPT accepts up to 15,000 chars, but chunks keep processing latency bounded
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
  
  // YarnGPT requires a minimum of 20 characters per request
  return chunks.map((c) => (c.length < 20 ? c.padEnd(20, ".") : c));
}

const REQUEST_TIMEOUT_MS = 35000;

async function synthesizeChunk(text: string, voice: string): Promise<Buffer> {
  const cleanText = text.trim().length < 20 ? text.trim().padEnd(20, ".") : text.trim();
  const cleanVoice = voice.toLowerCase();

  // 1. Submit the text-to-speech task to YarnGPT
  const submitRes = await fetch("https://api.yarngpt.ai/api/v1/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${YARNGPT_API_KEY}`,
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      text: cleanText,
      voice: cleanVoice,
      output_format: "mp3",
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!submitRes.ok) {
    const errorText = await submitRes.text();
    console.error(`YarnGPT submit error: ${submitRes.status} ${errorText}`);
    throw new Error(`YarnGPT request failed: ${submitRes.status} ${errorText}`);
  }

  const submitData = (await submitRes.json()) as { job_id?: string; audio_url?: string };

  // If already ready immediately
  if (submitData.audio_url) {
    const audioRes = await fetch(submitData.audio_url);
    return Buffer.from(await audioRes.arrayBuffer());
  }

  const jobId = submitData.job_id;
  if (!jobId) {
    throw new Error("YarnGPT response did not include a job_id");
  }

  // 2. Poll until the synthesis is complete
  const startTime = Date.now();
  while (Date.now() - startTime < REQUEST_TIMEOUT_MS) {
    await new Promise((r) => setTimeout(r, 1000));
    const pollRes = await fetch(`https://api.yarngpt.ai/api/v1/status/${jobId}`, {
      headers: {
        Authorization: `Bearer ${YARNGPT_API_KEY}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!pollRes.ok) {
      continue;
    }

    const pollData = (await pollRes.json()) as {
      status?: string;
      audio_url?: string | null;
      error_code?: string;
    };

    if (pollData.status === "completed" && pollData.audio_url) {
      const audioRes = await fetch(pollData.audio_url);
      if (!audioRes.ok) {
        throw new Error(`Failed to fetch synthesized audio: ${audioRes.status}`);
      }
      return Buffer.from(await audioRes.arrayBuffer());
    }

    if (pollData.status === "failed") {
      throw new Error(`YarnGPT synthesis failed: ${pollData.error_code || "unknown"}`);
    }
  }

  throw new Error("YarnGPT synthesis timed out waiting for audio output");
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
