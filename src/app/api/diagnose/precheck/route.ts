import { NextRequest, NextResponse } from "next/server";
import { generateVisionText, isGemmaConfigured } from "@/lib/gemma";
import { parsePhotoQuality } from "@/lib/diagnosis";
import { LANGUAGE_NAMES } from "@/lib/languages";

// A short, cheap, non-streamed vision call used only to populate the
// clarify screen's "photo check" panel before the farmer answers the two
// questions — deliberately separate from the full /api/diagnose prompt so
// it stays fast and doesn't commit to a diagnosis yet.
const PRECHECK_PROMPT = `You are about to diagnose a crop photo, but before asking the farmer two clarifying
questions, give an honest, quick read of the photo itself. Respond with ONLY a JSON object (no markdown
fences, no commentary):
{
  "photoQuality": {
    "ok": boolean,        // false if lighting, focus, distance or framing genuinely limit what you can see
    "cautions": string[]  // 1-2 short, specific sentences on what the photo does NOT let you confirm yet
                           // (e.g. "The whorl is in shadow — I can see feeding holes and frass, but not the
                           // larva itself, so I'm reading the pattern, not the insect."). Empty array only
                           // if the photo is genuinely clear with nothing worth flagging.
  }
}

Write the "cautions" strings in plain, everyday words a smallholder farmer would use — the kind of thing
you'd say out loud standing in the field, not a lab report. Say what you can and can't see on the plant
itself ("too blurry to see the small holes clearly", "can't tell if it's wet or just shiny"). Never use
technical or scientific vocabulary — no words like "anatomical", "specimen", "instar", "morphology",
"definitive identification", or naming diseases/pests by unfamiliar terms the farmer hasn't already used.
If you would name a pest or disease, use the same everyday name a farmer would (e.g. "the caterpillar",
"the borer") never a Latin or scientific name.`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const imageBase64: string | undefined = body?.imageBase64;
  const profileContext: string | undefined = body?.profileContext;
  const language: string | undefined = body?.language;

  if (!imageBase64) {
    return NextResponse.json({ error: "imageBase64 is required" }, { status: 400 });
  }

  if (!isGemmaConfigured()) {
    return NextResponse.json({ photoQuality: { ok: true, cautions: [] } });
  }

  let prompt = PRECHECK_PROMPT;
  if (profileContext) {
    prompt += `\n\nFarm profile context: ${profileContext}`;
  }
  const languageName = language ? LANGUAGE_NAMES[language] : undefined;
  if (languageName && languageName !== "English") {
    prompt += `\n\nWrite the "cautions" strings in ${languageName}, in plain language a farmer would understand.`;
  }

  try {
    const raw = await generateVisionText(imageBase64, prompt);
    const cleaned = raw
      .trim()
      .replace(/^```(json)?/i, "")
      .replace(/```$/, "")
      .replace(/,(\s*[\]}])/g, "$1");
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ photoQuality: parsePhotoQuality(parsed.photoQuality) });
  } catch (err) {
    console.error("[/api/diagnose/precheck]", err);
    // Best-effort — the clarify screen falls back to no cautions rather than blocking on this.
    return NextResponse.json({ photoQuality: { ok: true, cautions: [] } });
  }
}
