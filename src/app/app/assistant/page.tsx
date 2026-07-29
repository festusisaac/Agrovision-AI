"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Volume2 } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { FormattedText } from "@/components/FormattedText";
import { prefetchSpeech, speakText, type SpeakController } from "@/lib/tts";
import { useAppPrefs } from "@/lib/appPrefs";
import { LANGUAGES } from "@/lib/languages";
import { takePendingQuestion } from "@/lib/pendingQuestion";
import { buildProfileContext, getProfileSnapshot } from "@/lib/profile";

function makeMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { role, content, timestamp: Date.now() };
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="animate-bounce-dot h-1.5 w-1.5 rounded-full bg-leaf/60" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

export default function AssistantPage() {
  const { language, t, engineLabel } = useAppPrefs();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceState, setVoiceState] = useState<{ index: number; status: "loading" | "speaking"; progress?: number } | null>(
    null
  );
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechControllerRef = useRef<SpeakController | null>(null);
  const preparedSpeechRef = useRef<Map<number, Promise<Blob | null>>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);
  const quickPrompts = [t.quickPrompt1, t.quickPrompt2, t.quickPrompt3];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage = makeMessage("user", trimmed);
    const nextMessages = [...messages, userMessage];
    const assistantIndex = nextMessages.length;
    setMessages([...nextMessages, makeMessage("assistant", "")]);
    setInput("");
    setLoading(true);

    const updateLastMessage = (content: string) => {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...copy[copy.length - 1], content };
        return copy;
      });
    };

    try {
      const profile = getProfileSnapshot();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages,
          language,
          profileContext: profile ? buildProfileContext(profile) : undefined,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        const reply = res.ok ? data.reply : data.error || t.somethingWentWrong;
        updateLastMessage(reply);
        if (res.ok && reply) preparedSpeechRef.current.set(assistantIndex, prefetchSpeech(reply, language));
      } else if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          updateLastMessage(full);
        }
        if (full) preparedSpeechRef.current.set(assistantIndex, prefetchSpeech(full, language));
      } else {
        updateLastMessage(t.somethingWentWrong);
      }
    } catch {
      updateLastMessage(t.somethingWentWrong);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const question = takePendingQuestion();
    if (question) Promise.resolve().then(() => sendMessage(question));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function speak(text: string, index: number) {
    if (voiceState?.index === index) {
      speechControllerRef.current?.stop();
      setVoiceState(null);
      return;
    }
    speechControllerRef.current?.stop();
    setVoiceState({ index, status: "loading", progress: 0 });
    speechControllerRef.current = speakText(
      text,
      language,
      {
        onStart: () => setVoiceState({ index, status: "speaking" }),
        onEnd: () => setVoiceState(null),
        onProgress: (progress) => setVoiceState((prev) => (prev?.index === index ? { ...prev, progress } : prev)),
      },
      preparedSpeechRef.current.get(index)
    );
  }

  function toggleVoiceInput() {
    const SpeechRecognitionCtor =
      typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;
    if (!SpeechRecognitionCtor) {
      alert(t.voiceNotSupported);
      return;
    }
    // Mic access requires a secure context (https, or localhost) — over a
    // plain LAN address .start() can fail silently on some mobile browsers
    // without ever firing onerror, which would otherwise leave the button
    // stuck pulsing in "listening" state forever with no feedback.
    if (typeof window !== "undefined" && !window.isSecureContext) {
      alert(t.voiceNeedsSecureConnection);
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const speechLang = LANGUAGES.find((l) => l.code === language)?.speechLang ?? "en-US";
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = speechLang;
    recognition.interimResults = true;

    const safetyTimer = setTimeout(() => {
      if (recognitionRef.current === recognition) {
        recognition.stop();
        setListening(false);
      }
    }, 8000);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      const transcript = last[0].transcript;
      setInput(transcript);
      if (last.isFinal) sendMessage(transcript);
    };
    recognition.onend = () => {
      clearTimeout(safetyTimer);
      setListening(false);
    };
    recognition.onerror = () => {
      clearTimeout(safetyTimer);
      setListening(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  return (
    <div className="animate-agv-rise mx-auto flex max-w-[820px] flex-col" style={{ height: "calc(100vh - 124px)" }}>
      <div className="font-mono text-[10.5px] tracking-[0.12em] text-warn uppercase">{engineLabel}</div>
      <h1 className="font-heading mt-2.5 text-[32px] font-semibold tracking-[-0.03em]">{t.askTitle}</h1>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-3.5 overflow-y-auto py-[22px]">
        {messages.length === 0 && (
          <p className="mt-6 text-center text-[13.5px] text-fg-faint">{t.askAnything}</p>
        )}
        {messages.map((m, i) => {
          const isLast = i === messages.length - 1;
          const showTyping = m.role === "assistant" && loading && isLast && !m.content;
          const isUser = m.role === "user";
          return (
            <div
              key={i}
              className="max-w-[74%] rounded-2xl px-[17px] py-3.5 text-[14.5px] leading-[1.6]"
              style={
                isUser
                  ? { alignSelf: "flex-end", background: "var(--color-leaf)", color: "#0A0F0C" }
                  : {
                      alignSelf: "flex-start",
                      background: "rgba(242,240,230,0.06)",
                      border: "1px solid rgba(242,240,230,0.1)",
                      color: "var(--color-fg-muted)",
                    }
              }
            >
              {showTyping ? (
                <TypingDots />
              ) : (
                <>
                  <FormattedText text={m.content} />
                  {!isUser && m.content && (
                    <button
                      onClick={() => speak(m.content, i)}
                      className="mt-1.5 inline-flex items-center gap-1 text-xs text-fg-faint hover:text-leaf"
                    >
                      {voiceState?.index === i && voiceState.status === "loading" ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-fg-dim/30 border-t-leaf" />
                      ) : voiceState?.index === i ? (
                        <Square className="h-3.5 w-3.5 fill-current" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5" />
                      )}
                      {voiceState?.index === i && voiceState.status === "loading"
                        ? `${voiceState.progress ?? 0}%`
                        : voiceState?.index === i
                          ? t.stop
                          : t.listen}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 py-2.5">
        {quickPrompts.map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            className="rounded-full border px-3.5 py-2 text-[13px] text-fg-muted hover:bg-[var(--color-surface)]"
            style={{ borderColor: "rgba(242,240,230,0.12)" }}
          >
            {p}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex items-center gap-2.5 rounded-2xl border p-2.5 pl-4.5"
        style={{ borderColor: "rgba(242,240,230,0.14)", background: "rgba(242,240,230,0.04)" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? t.listeningEllipsis : t.placeholder}
          className="flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-fg-faint"
        />
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] text-[#0A0F0C] transition-colors ${
            listening ? "animate-pulse-ring bg-red-500" : "bg-leaf"
          }`}
          aria-label={listening ? "Stop voice input" : "Voice input"}
        >
          <Mic className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
