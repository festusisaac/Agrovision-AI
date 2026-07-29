import { NextRequest, NextResponse } from "next/server";
import { generateTextStream, isGemmaConfigured } from "@/lib/gemma";
import type { ChatMessage } from "@/lib/types";
import { LANGUAGE_NAMES } from "@/lib/languages";

const BASE_SYSTEM_PROMPT = `You are AgroVision's Farm Assistant, a friendly farming assistant for smallholder and
commercial farmers in Africa. Give practical, concise, locally-relevant advice on crops, pests,
diseases, fertilizer, irrigation, and planting/harvest timing. Keep answers short and actionable
— reply with only the final answer, no preamble or draft options.`;

function buildPrompt(message: string, history: ChatMessage[]): string {
  const historyText = history
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Farmer" : "AgroVision"}: ${m.content}`)
    .join("\n");
  return historyText ? `${historyText}\nFarmer: ${message}` : message;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const message: string | undefined = body?.message;
  const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];
  const language: string | undefined = body?.language;
  const profileContext: string | undefined = body?.profileContext;

  if (!message || !message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  if (!isGemmaConfigured()) {
    return NextResponse.json({
      demoMode: true,
      reply:
        "AgroVision isn't connected to a Gemma model yet. Set GOOGLE_API_KEY (cloud) or GEMMA_PROVIDER=local with Ollama running in .env.local to enable real answers.",
    });
  }

  let systemPrompt = BASE_SYSTEM_PROMPT;
  if (profileContext) {
    systemPrompt += ` Farm profile context — use this to make advice stage- and location-aware: ${profileContext}`;
  }
  const languageName = language ? LANGUAGE_NAMES[language] : undefined;
  if (languageName && languageName !== "English") {
    systemPrompt += ` Respond entirely in ${languageName}, in a way an everyday ${languageName} speaker with no technical background would understand.`;
  }

  const prompt = buildPrompt(message, history);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generateTextStream(prompt, systemPrompt)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        console.error("[/api/chat]", err);
        controller.enqueue(encoder.encode("Sorry, something went wrong. Please try again."));
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
