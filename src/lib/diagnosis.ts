import type { ConfidenceSignal, DiagnosisResult, DiagnosisSafety, PhotoQuality, TreatmentProduct } from "./types";

const NOT_APPLICABLE = "Not applicable";
const CATEGORIES = new Set(["organic", "chemical", "cultural"]);
const COST_TIERS = new Set(["low", "medium", "high"]);

/** A confident wrong answer is worse than asking again — treat low-confidence results as a retake even if the model forgot to set the flag itself. */
const CONFIDENCE_RETAKE_THRESHOLD = 0.55;

export function parsePhotoQuality(raw: unknown): PhotoQuality {
  const q = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    ok: typeof q.ok === "boolean" ? q.ok : true,
    cautions: Array.isArray(q.cautions) ? (q.cautions.filter((c) => typeof c === "string") as string[]) : [],
  };
}

function parseSafety(raw: unknown): DiagnosisSafety {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    protectiveEquipment: Array.isArray(s.protectiveEquipment) ? (s.protectiveEquipment as string[]) : [],
    applicationTiming: typeof s.applicationTiming === "string" ? s.applicationTiming : NOT_APPLICABLE,
    reEntryInterval: typeof s.reEntryInterval === "string" ? s.reEntryInterval : NOT_APPLICABLE,
    harvestWaitingPeriod: typeof s.harvestWaitingPeriod === "string" ? s.harvestWaitingPeriod : NOT_APPLICABLE,
  };
}

function parseConfidenceBreakdown(raw: unknown): ConfidenceSignal[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
    .map((s) => ({
      label: typeof s.label === "string" ? s.label : "",
      score: typeof s.score === "number" ? Math.max(0, Math.min(1, s.score)) : 0,
    }))
    .filter((s) => s.label);
}

function parseProducts(raw: unknown): TreatmentProduct[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p): p is Record<string, unknown> => Boolean(p) && typeof p === "object")
    .map((p) => ({
      name: typeof p.name === "string" ? p.name : "",
      category: CATEGORIES.has(p.category as string) ? (p.category as TreatmentProduct["category"]) : "cultural",
      dose: typeof p.dose === "string" ? p.dose : "",
      timing: typeof p.timing === "string" ? p.timing : "",
      reEntryInterval: typeof p.reEntryInterval === "string" ? p.reEntryInterval : NOT_APPLICABLE,
      harvestWaitingPeriod: typeof p.harvestWaitingPeriod === "string" ? p.harvestWaitingPeriod : NOT_APPLICABLE,
      costTier: COST_TIERS.has(p.costTier as string) ? (p.costTier as TreatmentProduct["costTier"]) : "medium",
    }))
    .filter((p) => p.name);
}

/** Parses the model's raw JSON reply into a DiagnosisResult, tolerating the trailing-comma quirk LLMs commonly produce. */
export function parseDiagnosisJson(raw: string): DiagnosisResult {
  const cleaned = raw
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .replace(/,(\s*[\]}])/g, "$1");
  try {
    const parsed = JSON.parse(cleaned);
    const description: string = parsed.description ?? cleaned;
    const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0;
    return {
      label: parsed.label ?? "Unknown",
      crop: typeof parsed.crop === "string" ? parsed.crop : "Unknown",
      type: parsed.type ?? "unknown",
      confidence,
      severity: parsed.severity ?? "unknown",
      description,
      explanation: typeof parsed.explanation === "string" && parsed.explanation ? parsed.explanation : description,
      visualEvidence: typeof parsed.visualEvidence === "string" ? parsed.visualEvidence : "",
      confidenceBreakdown: parseConfidenceBreakdown(parsed.confidenceBreakdown),
      treatment: Array.isArray(parsed.treatment) ? parsed.treatment : [],
      products: parseProducts(parsed.products),
      prevention: Array.isArray(parsed.prevention) ? parsed.prevention : [],
      safety: parseSafety(parsed.safety),
      photoQuality: parsePhotoQuality(parsed.photoQuality),
      needsRetake: parsed.needsRetake === true || (parsed.type !== "healthy" && confidence < CONFIDENCE_RETAKE_THRESHOLD),
      retakeInstruction:
        typeof parsed.retakeInstruction === "string" && parsed.retakeInstruction
          ? parsed.retakeInstruction
          : "Shoot the affected area again in daylight, filling the frame with a single leaf or the whorl.",
    };
  } catch {
    return {
      label: "Unable to parse result",
      crop: "Unknown",
      type: "unknown",
      confidence: 0,
      severity: "unknown",
      description: cleaned,
      explanation: cleaned,
      visualEvidence: "",
      confidenceBreakdown: [],
      treatment: [],
      products: [],
      prevention: [],
      safety: parseSafety(undefined),
      photoQuality: { ok: false, cautions: [] },
      needsRetake: true,
      retakeInstruction: "Shoot the affected area again in daylight, filling the frame with a single leaf or the whorl.",
    };
  }
}

/** Whether a diagnosis has any real safety guidance worth showing (vs. all "Not applicable"). */
export function hasSafetyInfo(safety: DiagnosisSafety): boolean {
  return (
    safety.protectiveEquipment.length > 0 ||
    [safety.applicationTiming, safety.reEntryInterval, safety.harvestWaitingPeriod].some(
      (v) => v && v !== NOT_APPLICABLE
    )
  );
}

/** Builds the full spoken text for a diagnosis — description, treatment, prevention, and safety notes. */
export function buildDiagnosisSpeechText(diagnosis: DiagnosisResult): string {
  const parts = [diagnosis.explanation || diagnosis.description, ...diagnosis.treatment];
  const primaryProduct = diagnosis.products[0];
  if (primaryProduct) {
    parts.push(`Recommended: ${primaryProduct.name}, ${primaryProduct.dose}`);
  }
  if (diagnosis.prevention.length > 0) {
    parts.push("To prevent this in the future:", ...diagnosis.prevention);
  }

  const { safety } = diagnosis;
  if (hasSafetyInfo(safety)) {
    parts.push("For your safety:");
    if (safety.protectiveEquipment.length > 0) {
      parts.push(`Wear ${safety.protectiveEquipment.join(", ")}`);
    }
    if (safety.applicationTiming && safety.applicationTiming !== NOT_APPLICABLE) {
      parts.push(safety.applicationTiming);
    }
    if (safety.reEntryInterval && safety.reEntryInterval !== NOT_APPLICABLE) {
      parts.push(safety.reEntryInterval);
    }
    if (safety.harvestWaitingPeriod && safety.harvestWaitingPeriod !== NOT_APPLICABLE) {
      parts.push(safety.harvestWaitingPeriod);
    }
  }

  return parts.join(". ");
}

/**
 * Best-effort extraction of a string field's value from a possibly-incomplete
 * JSON document, for a live "typing" preview while the response is still
 * streaming in. Not a full JSON parser — just enough to find `"field": "..."`
 * and read as much of the string as has arrived so far.
 */
export function extractPartialStringField(raw: string, field: string): string | null {
  const marker = `"${field}"`;
  const markerIndex = raw.indexOf(marker);
  if (markerIndex === -1) return null;

  let i = raw.indexOf(":", markerIndex + marker.length);
  if (i === -1) return null;
  i++;
  while (raw[i] === " " || raw[i] === "\n" || raw[i] === "\t" || raw[i] === "\r") i++;
  if (raw[i] !== '"') return null;
  i++;

  let out = "";
  for (; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "\\") {
      const next = raw[i + 1];
      if (next === undefined) break; // escape sequence cut off mid-stream
      if (next === "n") out += "\n";
      else if (next === "t") out += "\t";
      else out += next;
      i++;
      continue;
    }
    if (ch === '"') break; // field complete
    out += ch;
  }
  return out;
}
