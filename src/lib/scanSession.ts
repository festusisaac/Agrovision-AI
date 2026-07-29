import type { DiagnosisResult } from "./types";

export interface ScanSession {
  imageDataUrl: string;
  crop: string;
  result: DiagnosisResult;
  capturedAt: number;
  /** Real wall-clock time the /api/diagnose request took, in ms — shown on the diagnosis page. */
  elapsedMs: number;
  savedToHistory: boolean;
}

let current: ScanSession | null = null;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function setScanSession(session: Omit<ScanSession, "savedToHistory">) {
  current = { ...session, savedToHistory: false };
  emitChange();
}

export function markScanSessionSaved() {
  if (!current) return;
  current = { ...current, savedToHistory: true };
  emitChange();
}

export function clearScanSession() {
  current = null;
  emitChange();
}

export function getScanSessionSnapshot(): ScanSession | null {
  return current;
}

export function getServerScanSessionSnapshot(): ScanSession | null {
  return null;
}

export function subscribeScanSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
