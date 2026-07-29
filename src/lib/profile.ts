export interface FarmProfile {
  name: string;
  farm: string;
  country: string;
  state: string;
  lga: string;
  crop: string;
  size: string;
  stage: string;
  rainfall: string;
  irrigated: string;
  disease: string;
  /** Explicit opt-in: share this farm's rounded location + diagnosis status to the Village Watch pool. Off by default. */
  shareToVillageWatch: boolean;
}

export const DEMO_PROFILE: FarmProfile = {
  name: "Amina Musa",
  farm: "Kwakwaba Farm",
  country: "Nigeria",
  state: "Niger",
  lga: "Bosso",
  crop: "Maize",
  size: "1–5 hectares",
  stage: "Flowering",
  rainfall: "2–3 days ago",
  irrigated: "No",
  disease: "Armyworm",
  shareToVillageWatch: false,
};

const STORAGE_KEY = "agv-profile";

const listeners = new Set<() => void>();
function emitChange() {
  listeners.forEach((listener) => listener());
}
export function subscribeProfile(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let cachedRaw: string | null = null;
let cachedProfile: FarmProfile | null = null;

export function getProfileSnapshot(): FarmProfile | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable — behave as if no profile exists
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedProfile = raw ? (JSON.parse(raw) as FarmProfile) : null;
    } catch {
      cachedProfile = null;
    }
  }
  return cachedProfile;
}

export function getServerProfileSnapshot(): FarmProfile | null {
  return null;
}

/** Cheap sync check for the /app/* route guard — same read as getProfileSnapshot without the caching. */
export function hasProfile(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function saveProfile(profile: FarmProfile): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // best-effort — device-local storage only, per the onboarding copy's own promise
  }
  emitChange();
}

/** The live "What Gemma will now say" preview shown on onboarding step 4 — recomputed on every field change. */
export function buildContextPreview(p: FarmProfile): string {
  const location = p.lga || p.state || "your area";
  const diseaseClause = p.disease === "None" || !p.disease ? "no previous outbreaks" : `${p.disease.toLowerCase()} before`;
  return `Because your ${p.crop.toLowerCase()} is in the ${p.stage.toLowerCase()} stage on a ${p.size.toLowerCase()} farm near ${location}, and you have had ${diseaseClause}, I will watch for stage-specific pests and treat spread risk as high after rain.`;
}

/** Sent as real system context to /api/diagnose and /api/chat so Gemma's output is stage- and location-aware. */
export function buildProfileContext(p: FarmProfile): string {
  const location = [p.lga, p.state, p.country].filter(Boolean).join(", ");
  return (
    `Farmer: ${p.name || "Unknown"}. Farm: ${p.farm || "Unnamed farm"}${location ? `, ${location}` : ""}. ` +
    `Primary crop: ${p.crop} (${p.size} farm), currently at the ${p.stage} growth stage. ` +
    `Irrigated: ${p.irrigated}. Last rainfall: ${p.rainfall}. ` +
    `Previous pest/disease history on this farm: ${p.disease === "None" ? "none reported" : p.disease}.`
  );
}
