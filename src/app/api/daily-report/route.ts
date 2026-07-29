import { NextRequest, NextResponse } from "next/server";
import { generateText, isGemmaConfigured } from "@/lib/gemma";
import { FALLBACK_LAT, FALLBACK_LON, getWeatherWithForecast } from "@/lib/weatherService";
import { LANGUAGE_NAMES } from "@/lib/languages";

interface CropInput {
  name: string;
  plantedAt: number;
}

const SYSTEM_PROMPT = `You are AgroVision's Farm Assistant preparing a short morning briefing for a farmer,
in plain everyday language with no technical jargon. Start with "Good morning." Keep it warm, concise
(4-6 short sentences), and actionable — natural flowing sentences a farmer would say to a neighbor, no
headers, no bullet points, no markdown. Reply with ONLY the briefing text, nothing else.`;

function daysSince(timestamp: number): number {
  return Math.max(0, Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24)));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const crops: CropInput[] = Array.isArray(body?.crops) ? body.crops : [];
  const language: string | undefined = body?.language;
  const latParam = body?.lat;
  const lonParam = body?.lon;

  if (crops.length === 0) {
    return NextResponse.json({ error: "At least one crop is required" }, { status: 400 });
  }

  if (!isGemmaConfigured()) {
    return NextResponse.json({
      demoMode: true,
      report:
        "AgroVision isn't connected to a Gemma model yet. Set GOOGLE_API_KEY (cloud) or GEMMA_PROVIDER=local with Ollama running in .env.local to get your real daily report.",
    });
  }

  const hasClientLocation = typeof latParam === "number" && typeof lonParam === "number";
  const lat = hasClientLocation ? latParam : FALLBACK_LAT;
  const lon = hasClientLocation ? lonParam : FALLBACK_LON;

  try {
    const weather = await getWeatherWithForecast(lat, lon, hasClientLocation);

    const cropLines = crops.map((c) => `- ${c.name}: planted ${daysSince(c.plantedAt)} days ago`).join("\n");
    let prompt = `Farmer's tracked crops:\n${cropLines}\n\nToday's weather in ${weather.location}: ${weather.temperature}°C, ${weather.humidity}% humidity, ${weather.description}.\nTomorrow's forecast: ${weather.tomorrow.precipitationChance}% chance of rain, high ${weather.tomorrow.tempMax}°C, low ${weather.tomorrow.tempMin}°C, ${weather.tomorrow.description}.\n\nFor each crop, briefly note its likely growth stage based on days since planting (use your general knowledge of that crop), then call out any weather-driven action needed today, and end with one proactive thing to monitor this week (e.g. a pest or disease common at this stage/season).`;

    const languageName = language ? LANGUAGE_NAMES[language] : undefined;
    if (languageName && languageName !== "English") {
      prompt += `\n\nWrite the entire briefing in ${languageName}, in a way an everyday ${languageName} speaker with no technical background would understand.`;
    }

    const report = await generateText(prompt, SYSTEM_PROMPT);
    return NextResponse.json({ demoMode: false, report: report.trim() });
  } catch (err) {
    console.error("[/api/daily-report]", err);
    return NextResponse.json({ error: "Failed to generate today's report. Please try again." }, { status: 502 });
  }
}
