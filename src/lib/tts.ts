import { LANGUAGES } from "./languages";
import { getVoicesAsync, pickVoice } from "./speech";

export interface SpeakHandlers {
  /** Fires the moment audio is actually ready to play (after the loading gap). */
  onStart?: () => void;
  onEnd?: () => void;
  onVoiceFallbackNotice?: (message: string) => void;
  /**
   * TTS generation has no real byte-level progress to report (the wait is
   * server-side synthesis time, not a download), so this is a smoothed,
   * ever-slowing 0-99 ramp purely to keep the wait feeling alive — it jumps
   * to 100 the instant audio is actually ready to play.
   */
  onProgress?: (percent: number) => void;
}

export interface SpeakController {
  stop: () => void;
}

const PROGRESS_TICK_MS = 180;
const PROGRESS_SOFT_CAP = 99;
const PROGRESS_EASE = 0.12;

function startProgressRamp(onProgress: (percent: number) => void): () => void {
  let percent = 0;
  onProgress(0);
  const timer = setInterval(() => {
    percent += (PROGRESS_SOFT_CAP - percent) * PROGRESS_EASE;
    onProgress(Math.round(percent));
  }, PROGRESS_TICK_MS);
  return () => clearInterval(timer);
}

/**
 * Kicks off the /api/tts (YarnGPT) request immediately, without playing
 * anything. Call this as soon as text is available (e.g. when a diagnosis or
 * chat reply arrives) so the multi-second generation time happens silently in
 * the background instead of after the user clicks "Listen". Resolves to null
 * on any failure — callers should fall back to on-demand fetch/Web Speech.
 */
export function prefetchSpeech(text: string, language: string): Promise<Blob | null> {
  return fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  })
    .then((res) => (res.ok ? res.blob() : null))
    .catch(() => null);
}

/**
 * Speaks `text`, preferring an already-in-flight prefetch (near-instant if
 * it's ready by the time this is called) over starting a fresh /api/tts
 * request, and falling back to the browser's Web Speech API if both fail.
 * Returns immediately with a controller so the caller can show a loading
 * state and stop playback even while still waiting on the network.
 */
export function speakText(
  text: string,
  language: string,
  handlers: SpeakHandlers = {},
  prefetched?: Promise<Blob | null> | null
): SpeakController {
  const token = { cancelled: false, audio: null as HTMLAudioElement | null };
  const langMeta = LANGUAGES.find((l) => l.code === language);
  const speechLang = langMeta?.speechLang ?? "en-US";

  const stopProgress = handlers.onProgress ? startProgressRamp(handlers.onProgress) : null;
  const finishProgress = () => {
    stopProgress?.();
    handlers.onProgress?.(100);
  };

  (async () => {
    try {
      const blob = await (prefetched ?? prefetchSpeech(text, language));
      if (token.cancelled) return;
      if (!blob) throw new Error("TTS unavailable");

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      token.audio = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        handlers.onEnd?.();
      };
      finishProgress();
      handlers.onStart?.();
      await audio.play();
      return;
    } catch {
      // fall through to Web Speech API below
    }

    if (token.cancelled) return;
    if (typeof window === "undefined" || !window.speechSynthesis) {
      finishProgress();
      handlers.onEnd?.();
      return;
    }

    const voices = await getVoicesAsync();
    if (token.cancelled) return;
    const voice = pickVoice(voices, speechLang);
    if (!voice && language !== "en") {
      handlers.onVoiceFallbackNotice?.(
        `No ${langMeta?.label ?? "matching"} voice is installed on this device — playing with the default voice instead, which may not pronounce it correctly.`
      );
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    if (voice) utterance.voice = voice;
    utterance.onend = () => handlers.onEnd?.();
    utterance.onerror = () => handlers.onEnd?.();

    finishProgress();
    handlers.onStart?.();
    window.speechSynthesis.speak(utterance);
  })();

  return {
    stop: () => {
      token.cancelled = true;
      stopProgress?.();
      token.audio?.pause();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      handlers.onEnd?.();
    },
  };
}
