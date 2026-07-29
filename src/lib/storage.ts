import type { FarmHistoryEntry } from "./types";

const STORAGE_KEY = "agrovision:history";
const EMPTY_HISTORY: FarmHistoryEntry[] = [];
const MAX_ENTRIES = 30;

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedSnapshot: FarmHistoryEntry[] = EMPTY_HISTORY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Cached snapshot getter for useSyncExternalStore — stable reference until the store changes. */
export function getHistorySnapshot(): FarmHistoryEntry[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = raw ? (JSON.parse(raw) as FarmHistoryEntry[]) : EMPTY_HISTORY;
  }
  return cachedSnapshot;
}

export function getServerHistorySnapshot(): FarmHistoryEntry[] {
  return EMPTY_HISTORY;
}

export function subscribeHistory(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

/** One-off read for use outside components (e.g. after a diagnosis completes). */
export function getHistory(): FarmHistoryEntry[] {
  if (typeof window === "undefined") return EMPTY_HISTORY;
  return getHistorySnapshot();
}

/** Saves an entry to farm history. Never throws — storage is best-effort. */
export function addHistoryEntry(entry: Omit<FarmHistoryEntry, "id" | "createdAt">): FarmHistoryEntry {
  const full: FarmHistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  let history = [full, ...getHistory()].slice(0, MAX_ENTRIES);

  // Storage is a nice-to-have, not critical to the diagnose/chat flows, so
  // degrade gracefully under quota pressure instead of throwing: drop older
  // entries, then drop images, rather than losing the user's latest result.
  while (history.length > 0) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      emitChange();
      return full;
    } catch {
      if (history.some((h) => h.imageDataUrl)) {
        history = history.map((h) => ({ ...h, imageDataUrl: undefined }));
      } else {
        history = history.slice(0, Math.ceil(history.length / 2));
      }
    }
  }
  return full;
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  emitChange();
}

/** Records whether a treatment worked, so the analytics dashboard can compute a real success rate over time. */
export function markHistoryEntryResolved(id: string, resolved: boolean): void {
  if (typeof window === "undefined") return;
  const history = getHistory().map((entry) => (entry.id === id ? { ...entry, resolved } : entry));
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    emitChange();
  } catch (err) {
    console.error("Failed to save resolution status", err);
  }
}
