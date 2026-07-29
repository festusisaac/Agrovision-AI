export interface DiagnosisSafety {
  protectiveEquipment: string[]; // e.g. ["Gloves", "Face mask"] — empty if no chemical treatment needed
  applicationTiming: string; // best time/conditions to apply treatment, or "Not applicable"
  reEntryInterval: string; // how long to wait before re-entering the treated area, or "Not applicable"
  harvestWaitingPeriod: string; // how long to wait before harvesting, or "Not applicable"
}

/** One piece of visual evidence the model weighed, and how confident it is in that specific signal — chosen per-case, not a fixed checklist. */
export interface ConfidenceSignal {
  label: string;
  score: number; // 0-1
}

/** What the model can and can't tell from the photo alone — shown before a farmer answers clarifying questions. */
export interface PhotoQuality {
  ok: boolean;
  cautions: string[]; // e.g. "The whorl is in shadow — I can see feeding holes but not the larva itself."
}

export interface TreatmentProduct {
  name: string; // a real, appropriate product or method for this exact diagnosis
  category: "organic" | "chemical" | "cultural";
  dose: string;
  timing: string;
  reEntryInterval: string; // or "Not applicable"
  harvestWaitingPeriod: string; // or "Not applicable"
  /** Cost relative to the other listed options — never a currency figure, which the model can't ground. */
  costTier: "low" | "medium" | "high";
}

export interface DiagnosisResult {
  label: string;
  crop: string; // common name of the crop shown in the photo, or "Unknown"
  type: "disease" | "pest" | "healthy" | "unknown";
  confidence: number; // 0-1
  severity: "low" | "moderate" | "high" | "unknown";
  description: string; // 1-2 short sentences — used in lists/cards/history
  explanation: string; // fuller 3-5 sentence walkthrough — used in the diagnosis report's "Gemma's reading"
  visualEvidence: string; // what specifically in the photo indicates this — for the evidence panel
  confidenceBreakdown: ConfidenceSignal[]; // 2-4 case-specific visual signals behind the overall confidence
  treatment: string[]; // short, simple, TTS-friendly steps
  products: TreatmentProduct[]; // structured product/dose detail for the same treatment, most-recommended first
  prevention: string[];
  safety: DiagnosisSafety;
  photoQuality: PhotoQuality;
  /** True when confidence is too low or the photo is genuinely unreadable — render the retake prompt instead of the fields above. */
  needsRetake: boolean;
  /** One specific, actionable instruction for a better photo — only meaningful when needsRetake is true. */
  retakeInstruction: string;
}

/** The two clarifying answers a farmer gives before Gemma commits to a diagnosis. */
export interface ScanClarifications {
  where: string;
  when: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface FarmHistoryEntry {
  id: string;
  type: "diagnosis" | "activity";
  title: string;
  notes?: string;
  imageDataUrl?: string;
  diagnosis?: DiagnosisResult;
  createdAt: number;
  /** Whether the farmer later reported the treatment worked — undefined until they answer. */
  resolved?: boolean;
}

export interface FarmCrop {
  id: string;
  name: string;
  plantedAt: number;
  /** Field size in hectares, if the farmer has entered it — powers real yield/impact estimates. */
  areaHectares?: number;
}
