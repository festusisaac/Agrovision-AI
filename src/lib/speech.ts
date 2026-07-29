/** Chrome/Edge load voices asynchronously — getVoices() can return [] on the first call. */
export function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) return resolve(existing);

    const handle = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handle);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", handle);
    // Some browsers never fire voiceschanged — don't hang forever.
    setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", handle);
      resolve(window.speechSynthesis.getVoices());
    }, 500);
  });
}

/** Finds an installed voice matching langCode (e.g. "ha-NG"), falling back to a same-language match. */
export function pickVoice(voices: SpeechSynthesisVoice[], langCode: string): SpeechSynthesisVoice | undefined {
  const exact = voices.find((v) => v.lang.toLowerCase() === langCode.toLowerCase());
  if (exact) return exact;
  const prefix = langCode.split("-")[0].toLowerCase();
  return voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
}
