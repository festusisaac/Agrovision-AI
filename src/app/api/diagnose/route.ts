import { NextRequest, NextResponse } from "next/server";
import { generateVisionTextStream, isGemmaConfigured } from "@/lib/gemma";
import type { DiagnosisResult } from "@/lib/types";
import { LANGUAGE_NAMES } from "@/lib/languages";

const DIAGNOSIS_PROMPT = `You are explaining a crop photo to a smallholder farmer who has no scientific
or botanical background and may have limited literacy. Look at this crop/leaf photo and identify any
disease or pest. Respond with ONLY a JSON object (no markdown fences, no commentary) matching this shape:
{
  "label": string,            // common, everyday name of the disease/pest, or "Healthy" if no issue
  "crop": string,              // common name of the crop/plant shown (e.g. "Tomato", "Maize"), or "Unknown"
  "type": "disease" | "pest" | "healthy" | "unknown",
  "confidence": number,       // 0 to 1
  "severity": "low" | "moderate" | "high" | "unknown",
  "description": string,      // 1-2 SIMPLE sentences a non-expert can understand — no technical/botanical
                               // jargon (e.g. say "a fungus that spreads in wet weather", not the pathogen's
                               // scientific name). Used in short previews/history lists.
  "explanation": string,      // 3-5 SIMPLE sentences for a farmer reading a full report: what is happening
                               // to the plant, why it matters at this point in the crop's life, and what
                               // happens if it's ignored — still plain language, no jargon, no invented
                               // specifics (no fake latin names, block numbers, or exact day-counts).
  "visualEvidence": string,   // 1 SIMPLE sentence: what specifically in THIS photo (colour, pattern,
                               // location on the plant, damage type) led to the diagnosis. Empty string
                               // only if the photo genuinely shows nothing relevant.
  "confidenceBreakdown": [     // 2-4 SPECIFIC visual signals YOU actually weighed for THIS photo — choose
                               // whatever dimensions genuinely apply to this case (they will differ between
                               // a fungal disease and an insect pest); do not reuse a fixed checklist.
                               // Empty array only if type is "healthy" or "unknown".
    { "label": string, "score": number }   // label e.g. "Lesion shape and colour"; score 0 to 1, your own
                                            // confidence in that specific signal (can differ from the others)
  ],
  "treatment": string[],      // EXACTLY 3 short, actionable steps. Each string is a short imperative
                               // sentence under 12 words (e.g. "Stop watering the leaves directly.") —
                               // for TTS/low-literacy use. No emoji, no markdown.
  "products": [                 // 1-3 REAL, appropriate products/methods for treating THIS diagnosis,
                                 // most-recommended first (prefer organic/cultural options first where they
                                 // are genuinely effective). Empty array if type is "healthy" or "unknown",
                                 // or if treatment is purely cultural with no product involved.
    {
      "name": string,                 // e.g. "Neem oil" — a real product/method, not a placeholder
      "category": "organic" | "chemical" | "cultural",
      "dose": string,                 // e.g. "5 ml per litre, into the whorl"
      "timing": string,               // e.g. "Apply at dusk when larvae are active"
      "reEntryInterval": string,      // or "Not applicable"
      "harvestWaitingPeriod": string, // or "Not applicable"
      "costTier": "low" | "medium" | "high"  // cost RELATIVE to the other products listed here — never
                                              // a currency amount, which you cannot know reliably
    }
  ],
  "prevention": string[],     // EXACTLY 3 short, actionable steps, same short-sentence format, no emoji
  "safety": {                  // general precautions covering whichever product above is used — use
                               // "Not applicable" (or an empty array) for any part that doesn't apply
                               // to a purely cultural/organic treatment
    "protectiveEquipment": string[], // e.g. ["Gloves", "Face mask"] — empty array if none needed
    "applicationTiming": string,     // best time/conditions to apply (e.g. "Early morning, calm wind")
    "reEntryInterval": string,       // how long before it's safe to re-enter the treated area
    "harvestWaitingPeriod": string   // how long to wait before harvesting after treatment
  },
  "photoQuality": {            // your own honest read of whether THIS photo actually supports a diagnosis
    "ok": boolean,              // false if lighting, focus, distance or framing genuinely limit what you can see
    "cautions": string[]        // 0-2 short notes on specifically what the photo does NOT let you confirm
                                 // (e.g. "The whorl is in shadow — I can see feeding holes but not the larva
                                 // itself"). Empty array if the photo is genuinely clear.
  },
  "needsRetake": boolean,      // set true whenever your real confidence is below 0.55, OR the image is too
                               // dark/blurry/distant/off-subject to support a reliable read. A confident
                               // WRONG answer is worse than asking the farmer to try again — when genuinely
                               // unsure, ask, do not guess. When true, "treatment"/"products"/"prevention"
                               // may be left empty since they will not be shown.
  "retakeInstruction": string  // ONLY when needsRetake is true: ONE specific, actionable instruction for a
                               // better photo (e.g. "Shoot the whorl from directly above, in daylight, filling
                               // the frame."). Empty string otherwise.
}

IMPORTANT: Always keep "type" and "severity" as exactly one of the English enum values listed above, and
keep "crop" as a plain English crop name — never translate or change these three fields, regardless of
what language the rest of the response is in.`;

const DEMO_DIAGNOSIS: DiagnosisResult = {
  label: "Demo mode — no model connected",
  crop: "Unknown",
  type: "unknown",
  confidence: 0,
  severity: "unknown",
  description:
    "AgroVision isn't connected to a Gemma model yet. Set GOOGLE_API_KEY (cloud) or GEMMA_PROVIDER=local with Ollama running in .env.local to get real diagnoses.",
  explanation:
    "AgroVision isn't connected to a Gemma model yet. Set GOOGLE_API_KEY (cloud) or GEMMA_PROVIDER=local with Ollama running in .env.local to get real diagnoses.",
  visualEvidence: "",
  confidenceBreakdown: [],
  treatment: [],
  products: [],
  prevention: [],
  safety: {
    protectiveEquipment: [],
    applicationTiming: "Not applicable",
    reEntryInterval: "Not applicable",
    harvestWaitingPeriod: "Not applicable",
  },
  photoQuality: { ok: true, cautions: [] },
  needsRetake: false,
  retakeInstruction: "",
};

interface Clarifications {
  where: string;
  when: string;
}

const WHERE_GUIDANCE: Record<string, string> = {
  "New leaves in the whorl":
    "The farmer reports damage is worst in the new leaves/whorl. Weight this toward whorl-feeding pests like fall armyworm over stem/root causes, even if the photo alone looked ambiguous.",
  "Older leaves near the base":
    "The farmer reports damage is worst on older, lower leaves. This reads more like stem borer or a nutrient deficiency than a classic whorl pest — weight accordingly.",
  "Stem and base":
    "The farmer reports damage at the stem and base of the plant. Favor stem borer or a soil-borne/root issue over whorl-feeding pests.",
  "The cobs themselves":
    "The farmer reports damage directly on the cobs/fruit. This suggests late-instar larvae or a fruit/ear-stage pest — the treatment window is narrower than for early feeding.",
};

const WHEN_GUIDANCE: Record<string, string> = {
  Today: "The farmer first noticed this today — likely an early infestation; a single treatment pass may be sufficient.",
  "2–4 days ago":
    "The farmer noticed this 2-4 days ago — likely second-instar larvae, still reachable by a single well-timed treatment.",
  "Over a week ago":
    "The farmer noticed this over a week ago — larvae are likely deep in the whorl or advanced; plan a two-pass treatment since one spray will likely miss some.",
  "I am not sure":
    "The farmer isn't sure when this started — assume a mid-stage infestation and recommend a two-pass treatment to be safe.",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const imageBase64: string | undefined = body?.imageBase64;
  const notes: string | undefined = body?.notes;
  const weatherContext: string | undefined = body?.weatherContext;
  const language: string | undefined = body?.language;
  const profileContext: string | undefined = body?.profileContext;
  const clarifications: Clarifications | undefined = body?.clarifications;

  if (!imageBase64) {
    return NextResponse.json({ error: "imageBase64 is required" }, { status: 400 });
  }

  if (!isGemmaConfigured()) {
    return NextResponse.json({ demoMode: true, diagnosis: DEMO_DIAGNOSIS });
  }

  let prompt = DIAGNOSIS_PROMPT;
  if (profileContext) {
    prompt += `\n\nFarm profile context — use this to make the diagnosis stage- and location-aware (e.g. some pests only matter at certain growth stages, or are more likely in certain regions): ${profileContext}`;
  }
  if (weatherContext) {
    prompt += `\n\nLocal weather context: ${weatherContext}. Factor this into your diagnosis where relevant (e.g. high humidity favors fungal disease, prolonged dryness favors certain pests).`;
  }
  if (clarifications?.where || clarifications?.when) {
    prompt += `\n\nThe farmer answered two clarifying questions before you diagnose. Treat these as first-hand
observations that OUTWEIGH ambiguous visual cues in the photo — a farmer's report of where and when they saw
damage is more reliable than an uncertain visual read:`;
    if (clarifications.where) {
      prompt += `\n- Where the damage is worst: "${clarifications.where}". ${WHERE_GUIDANCE[clarifications.where] ?? ""}`;
    }
    if (clarifications.when) {
      prompt += `\n- When first noticed: "${clarifications.when}". ${WHEN_GUIDANCE[clarifications.when] ?? ""}`;
    }
  }
  if (notes) {
    prompt += `\n\nFarmer's notes: ${notes}`;
  }
  const languageName = language ? LANGUAGE_NAMES[language] : undefined;
  if (languageName && languageName !== "English") {
    prompt += `\n\nWrite the "label", "description", "explanation", "visualEvidence", "treatment", "prevention", "safety", "retakeInstruction", the "cautions" strings inside "photoQuality", and the "label"/"dose"/"timing" fields inside "confidenceBreakdown"/"products" in ${languageName}, in a way an everyday ${languageName} speaker with no technical background would understand. Keep "type", "severity", "crop", "category", and "costTier" in English exactly as specified above.`;
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generateVisionTextStream(imageBase64, prompt)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        console.error("[/api/diagnose]", err);
        // Emit nothing parseable — the client treats a stream that never
        // yields valid JSON as a failure and shows an error.
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
