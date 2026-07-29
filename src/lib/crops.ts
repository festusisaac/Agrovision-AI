import type { FarmCrop } from "./types";

const STORAGE_KEY = "agrovision:crops";
const EMPTY_CROPS: FarmCrop[] = [];

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedSnapshot: FarmCrop[] = EMPTY_CROPS;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getCropsSnapshot(): FarmCrop[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = raw ? (JSON.parse(raw) as FarmCrop[]) : EMPTY_CROPS;
  }
  return cachedSnapshot;
}

export function getServerCropsSnapshot(): FarmCrop[] {
  return EMPTY_CROPS;
}

export function subscribeCrops(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function getCrops(): FarmCrop[] {
  if (typeof window === "undefined") return EMPTY_CROPS;
  return getCropsSnapshot();
}

export function addCrop(name: string, plantedAt: number, areaHectares?: number): FarmCrop {
  const crop: FarmCrop = { id: crypto.randomUUID(), name, plantedAt, areaHectares };
  const crops = [...getCrops(), crop];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(crops));
  emitChange();
  return crop;
}

export function removeCrop(id: string): void {
  if (typeof window === "undefined") return;
  const crops = getCrops().filter((c) => c.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(crops));
  emitChange();
}
