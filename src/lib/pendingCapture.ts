import type { ScanClarifications } from "./types";

export interface PendingCapture {
  imageDataUrl: string;
  crop: string;
  clarifications: ScanClarifications;
}

let current: PendingCapture | null = null;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

/** Set by /app/scan once a photo is captured/cropped; read by /app/scan/clarify. */
export function setPendingCapture(imageDataUrl: string, crop: string) {
  current = { imageDataUrl, crop, clarifications: { where: "", when: "" } };
  emitChange();
}

export function setPendingClarifications(clarifications: ScanClarifications) {
  if (!current) return;
  current = { ...current, clarifications };
  emitChange();
}

export function clearPendingCapture() {
  current = null;
  emitChange();
}

export function getPendingCaptureSnapshot(): PendingCapture | null {
  return current;
}

export function getServerPendingCaptureSnapshot(): PendingCapture | null {
  return null;
}

export function subscribePendingCapture(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
