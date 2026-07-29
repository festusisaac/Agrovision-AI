import type { DiagnosisResult, FarmCrop, FarmHistoryEntry } from "./types";
import { getCropReference, SEVERITY_LOSS_RANGE } from "./cropReference";
import { tpl, type AppStrings } from "./i18n";

export type Tone = "accent" | "warn" | "dim";

export interface RiskProfile {
  riskLabel: string;
  riskTone: Tone;
  actWithin: string;
  actWithinTone: Tone;
  outlook: string;
  outlookTone: Tone;
}

/** Derived from the real severity/type Gemma returned — not a separate fabricated score. */
export function getRiskProfile(result: DiagnosisResult, t: AppStrings): RiskProfile {
  if (result.type === "healthy") {
    return {
      riskLabel: t.riskNone,
      riskTone: "accent",
      actWithin: t.actNoActionNeeded,
      actWithinTone: "accent",
      outlook: t.outlookExcellent,
      outlookTone: "accent",
    };
  }
  switch (result.severity) {
    case "high":
      return {
        riskLabel: t.riskHigh,
        riskTone: "warn",
        actWithin: t.act24to48,
        actWithinTone: "warn",
        outlook: t.outlookGuarded,
        outlookTone: "warn",
      };
    case "moderate":
      return {
        riskLabel: t.riskModerate,
        riskTone: "warn",
        actWithin: t.actThisWeek,
        actWithinTone: "warn",
        outlook: t.outlookGoodSoon,
        outlookTone: "accent",
      };
    case "low":
      return {
        riskLabel: t.riskLow,
        riskTone: "accent",
        actWithin: t.actWhenConvenient,
        actWithinTone: "accent",
        outlook: t.outlookGood,
        outlookTone: "accent",
      };
    default:
      return {
        riskLabel: t.riskUnclear,
        riskTone: "dim",
        actWithin: t.actReviewManually,
        actWithinTone: "dim",
        outlook: t.outlookUncertain,
        outlookTone: "dim",
      };
  }
}

export interface ActionStep {
  stage: string;
  dateLabel: string;
  title: string;
  note?: string;
}

function productNote(p: DiagnosisResult["products"][number]): string {
  return [p.dose, p.timing].filter(Boolean).join(" — ");
}

/**
 * Maps Gemma's real treatment steps and recommended products onto a real
 * calendar timeline (today, +2-3 days, +7 days, ongoing) — the step content,
 * product names and doses are genuine model output; only the cadence between
 * them is a generic, non-crop-specific assumption, not a fabricated schedule.
 */
export function buildActionPlan(result: DiagnosisResult, t: AppStrings): ActionStep[] {
  const today = new Date();
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  const plusDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  const [primaryProduct, rotationProduct] = result.products;

  const stages: ActionStep[] = [
    { stage: t.stageToday, dateLabel: fmt(today), title: result.treatment[0] ?? "", note: undefined },
    primaryProduct
      ? {
          stage: t.stageIn2to3Days,
          dateLabel: fmt(plusDays(3)),
          title: tpl(t.applyProductTpl, { product: primaryProduct.name }),
          note: productNote(primaryProduct),
        }
      : { stage: t.stageIn2to3Days, dateLabel: fmt(plusDays(3)), title: result.treatment[1] ?? "", note: undefined },
    rotationProduct
      ? {
          stage: t.stageDay7,
          dateLabel: fmt(plusDays(7)),
          title: tpl(t.repeatWithProductTpl, { product: rotationProduct.name }),
          note: productNote(rotationProduct),
        }
      : { stage: t.stageDay7, dateLabel: fmt(plusDays(7)), title: result.treatment[2] ?? "", note: undefined },
    { stage: t.stageOngoing, dateLabel: t.nextSeason, title: result.prevention[0] ?? "", note: undefined },
  ];

  return stages.filter((s) => s.title);
}

/** Generic, severity-driven guidance — not a per-case prediction Gemma made. */
export function buildUntreatedPrognosis(result: DiagnosisResult, t: AppStrings): string | null {
  if (result.type === "healthy") return null;
  switch (result.severity) {
    case "high":
      return t.prognosisHigh;
    case "moderate":
      return t.prognosisModerate;
    case "low":
      return t.prognosisLow;
    default:
      return t.prognosisUnknown;
  }
}

export const SEVERITY_LADDER = ["healthy", "low", "moderate", "high"] as const;
export type SeverityLadderStage = (typeof SEVERITY_LADDER)[number];

export function severityLadderLabel(stage: SeverityLadderStage, t: AppStrings): string {
  switch (stage) {
    case "healthy":
      return t.ladderHealthy;
    case "low":
      return t.ladderLow;
    case "moderate":
      return t.ladderModerate;
    case "high":
      return t.ladderHigh;
  }
}

/** Null when the model couldn't classify severity — the ladder then highlights nothing. */
export function currentLadderStage(result: DiagnosisResult): SeverityLadderStage | null {
  if (result.type === "healthy") return "healthy";
  if (result.severity === "unknown") return null;
  return result.severity;
}

export interface FarmImpactEstimate {
  cropLabel: string;
  areaHectares: number;
  expectedYieldTreatedTonnes: number;
  expectedYieldUntreatedTonnes: number;
  incomeProtectedNaira: number;
}

/**
 * Real inputs only: the farmer's own tracked field size and the actual
 * diagnosis severity. Yield-per-hectare and price-per-tonne come from a
 * small typical/indicative reference table (see cropReference.ts), not a
 * live market feed — the UI must disclose that. Returns null when there's
 * no real field size to compute from, rather than guessing one.
 */
export function estimateFarmImpact(result: DiagnosisResult, crop: FarmCrop | undefined): FarmImpactEstimate | null {
  if (!crop?.areaHectares || result.severity === "unknown") return null;
  if (result.type === "healthy") return null;

  const reference = getCropReference(result.crop !== "Unknown" ? result.crop : crop.name);
  const [lossLow, lossHigh] = SEVERITY_LOSS_RANGE[result.severity];
  const untreatedLossPct = (lossLow + lossHigh) / 2;
  // Prompt treatment is assumed to avoid most — not all — of the potential loss.
  const treatedLossPct = untreatedLossPct * 0.15;

  const potentialYield = reference.yieldPerHectare * crop.areaHectares;
  const expectedYieldTreatedTonnes = Math.round(potentialYield * (1 - treatedLossPct / 100) * 10) / 10;
  const expectedYieldUntreatedTonnes = Math.round(potentialYield * (1 - untreatedLossPct / 100) * 10) / 10;
  const incomeProtectedNaira = Math.round(
    (expectedYieldTreatedTonnes - expectedYieldUntreatedTonnes) * reference.pricePerTonne
  );

  return {
    cropLabel: result.crop !== "Unknown" ? result.crop : crop.name,
    areaHectares: crop.areaHectares,
    expectedYieldTreatedTonnes,
    expectedYieldUntreatedTonnes,
    incomeProtectedNaira,
  };
}

export interface SimilarCaseSummary {
  /** Past diagnoses on this farm with the same label, excluding the current one. */
  count: number;
  mostRecent?: { createdAt: number; resolved?: boolean };
}

/** Real personalized history — this farm's own past diagnoses, not an external reference dataset. */
export function summarizeSimilarCases(result: DiagnosisResult, history: FarmHistoryEntry[]): SimilarCaseSummary {
  const matches = history
    .filter((e) => e.diagnosis && e.diagnosis.label.toLowerCase() === result.label.toLowerCase())
    .sort((a, b) => b.createdAt - a.createdAt);

  return {
    count: matches.length,
    mostRecent: matches[0] ? { createdAt: matches[0].createdAt, resolved: matches[0].resolved } : undefined,
  };
}
