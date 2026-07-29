const STORAGE_KEY = "agrovision:deviceId";

/**
 * A random, anonymous per-browser identifier — not tied to any real
 * identity. Its only job is letting /api/outbreaks exclude a device's own
 * shared scans from its "nearby farms" list (otherwise a farmer who opted
 * in would see themselves twice: once as "you", once as a stranger).
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}
