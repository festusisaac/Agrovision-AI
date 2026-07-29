export {};

declare global {
  interface SpeechRecognitionResultItem {
    transcript: string;
  }

  interface SpeechRecognitionResult {
    0: SpeechRecognitionResultItem;
    isFinal: boolean;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResult[];
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
    start(): void;
    stop(): void;
  }

  interface Window {
    SpeechRecognition?: { new (): SpeechRecognition };
    webkitSpeechRecognition?: { new (): SpeechRecognition };
  }
}
