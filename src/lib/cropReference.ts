export interface CropReference {
  /** Typical smallholder yield, tonnes per hectare, under normal (healthy) conditions. */
  yieldPerHectare: number;
  /** Indicative market price, ₦ per tonne. Not a live price feed — order-of-magnitude only. */
  pricePerTonne: number;
}

// Rough, published-order-of-magnitude figures for Nigerian smallholder farming —
// intentionally conservative and clearly surfaced as "typical/indicative" in the
// UI, never presented as a live or farm-specific measurement.
const CROP_REFERENCE: Record<string, CropReference> = {
  maize: { yieldPerHectare: 2.0, pricePerTonne: 350_000 },
  tomato: { yieldPerHectare: 8.0, pricePerTonne: 150_000 },
  cassava: { yieldPerHectare: 12.0, pricePerTonne: 90_000 },
  cowpea: { yieldPerHectare: 1.0, pricePerTonne: 600_000 },
  beans: { yieldPerHectare: 1.0, pricePerTonne: 600_000 },
  rice: { yieldPerHectare: 2.5, pricePerTonne: 400_000 },
};

const FALLBACK_REFERENCE: CropReference = { yieldPerHectare: 1.5, pricePerTonne: 300_000 };

export function getCropReference(cropName: string): CropReference {
  return CROP_REFERENCE[cropName.trim().toLowerCase()] ?? FALLBACK_REFERENCE;
}

/** Severity → estimated yield loss range (%) if left untreated. A generic agronomic heuristic, not a per-case prediction. */
export const SEVERITY_LOSS_RANGE: Record<"low" | "moderate" | "high", [number, number]> = {
  low: [5, 10],
  moderate: [15, 25],
  high: [30, 50],
};
