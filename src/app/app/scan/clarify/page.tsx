"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import {
  clearPendingCapture,
  getPendingCaptureSnapshot,
  getServerPendingCaptureSnapshot,
  setPendingClarifications,
  subscribePendingCapture,
} from "@/lib/pendingCapture";
import { getHistorySnapshot, getServerHistorySnapshot, subscribeHistory } from "@/lib/storage";
import { resizeForDiagnosis } from "@/lib/image";
import { getWeatherContext } from "@/lib/weather";
import { parseDiagnosisJson, extractPartialStringField } from "@/lib/diagnosis";
import { setScanSession } from "@/lib/scanSession";
import { useAppPrefs } from "@/lib/appPrefs";
import { buildProfileContext, getProfileSnapshot } from "@/lib/profile";
import { tpl, type AppStrings } from "@/lib/i18n";
import type { DiagnosisResult, PhotoQuality } from "@/lib/types";

const WHERE_OPTIONS: { key: keyof AppStrings; noteKey: keyof AppStrings }[] = [
  { key: "whereOptWhorl", noteKey: "whereNoteWhorl" },
  { key: "whereOptBase", noteKey: "whereNoteBase" },
  { key: "whereOptStem", noteKey: "whereNoteStem" },
  { key: "whereOptCobs", noteKey: "whereNoteCobs" },
];

const WHEN_OPTIONS: { key: keyof AppStrings; noteKey: keyof AppStrings }[] = [
  { key: "whenOptToday", noteKey: "whenNoteToday" },
  { key: "whenOpt2to4", noteKey: "whenNote2to4" },
  { key: "whenOptWeek", noteKey: "whenNoteWeek" },
  { key: "whenOptUnsure", noteKey: "whenNoteUnsure" },
];

// Same floor as the plain scan flow — real diagnosis is often fast enough
// that the analysing screen would otherwise flash by unnoticed.
const MIN_ANALYZING_MS = 2200;

export default function ClarifyPage() {
  const router = useRouter();
  const { language, t } = useAppPrefs();
  const pending = useSyncExternalStore(subscribePendingCapture, getPendingCaptureSnapshot, getServerPendingCaptureSnapshot);
  const history = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getServerHistorySnapshot);

  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");
  const [phase, setPhase] = useState<"ask" | "analyzing" | "retake">("ask");
  const [retakeInstruction, setRetakeInstruction] = useState("");
  const [photoQuality, setPhotoQuality] = useState<PhotoQuality | null>(null);
  const [error, setError] = useState<string | null>(null);
  const precheckedFor = useRef<string | null>(null);

  const logLines = [t.logLine1, t.logLine2, t.logLine3, t.logLine4];

  useEffect(() => {
    if (!pending || precheckedFor.current === pending.imageDataUrl) return;
    precheckedFor.current = pending.imageDataUrl;
    setPhotoQuality(null);
    (async () => {
      try {
        const resized = await resizeForDiagnosis(pending.imageDataUrl);
        const profile = getProfileSnapshot();
        const res = await fetch("/api/diagnose/precheck", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: resized.split(",")[1],
            profileContext: profile ? buildProfileContext(profile) : undefined,
            language,
          }),
        });
        const data = await res.json();
        setPhotoQuality(data.photoQuality ?? { ok: true, cautions: [] });
      } catch {
        setPhotoQuality({ ok: true, cautions: [] });
      }
    })();
  }, [pending, language]);

  if (!pending) {
    return (
      <div className="animate-agv-rise max-w-[1100px]">
        <div className="rounded-2xl border border-[var(--color-border)] p-10 text-center">
          <p className="text-[15px] text-fg-muted">{t.noScanYet}</p>
          <button
            onClick={() => router.push("/app/scan")}
            className="mt-5 inline-flex items-center gap-1.5 rounded-[11px] bg-leaf px-5 py-3 font-medium text-[14px] text-[#0A0F0C] transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            <Camera className="h-4 w-4" /> {t.startAScan}
          </button>
        </div>
      </div>
    );
  }

  const profile = getProfileSnapshot();
  const ready = Boolean(where) && Boolean(when);

  function retake() {
    clearPendingCapture();
    router.push("/app/scan");
  }

  async function proceed() {
    if (!ready || !pending) return;
    setPendingClarifications({ where, when });
    setPhase("analyzing");
    setError(null);
    const startedAt = Date.now();
    try {
      const [resized, weatherContext] = await Promise.all([
        resizeForDiagnosis(pending.imageDataUrl),
        getWeatherContext(),
      ]);
      const imageBase64 = resized.split(",")[1];
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          notes: `Crop: ${pending.crop}`,
          weatherContext,
          language,
          profileContext: profile ? buildProfileContext(profile) : undefined,
          clarifications: { where, when },
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      let diagnosis: DiagnosisResult;

      if (!res.ok && !contentType.includes("application/json")) {
        throw new Error(tpl(t.diagnosisFailedServerTpl, { status: res.status }));
      }
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t.diagnosisFailed);
        diagnosis = data.diagnosis;
      } else if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let raw = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          raw += decoder.decode(value, { stream: true });
          extractPartialStringField(raw, "description");
        }
        if (!raw.trim()) throw new Error(t.diagnosisFailedRetry);
        diagnosis = parseDiagnosisJson(raw);
      } else {
        throw new Error(t.diagnosisFailedRetry);
      }

      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_ANALYZING_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_ANALYZING_MS - elapsed));
      }

      if (diagnosis.needsRetake) {
        setRetakeInstruction(diagnosis.retakeInstruction);
        setPhase("retake");
        return;
      }

      setScanSession({
        imageDataUrl: resized,
        crop: pending.crop,
        result: diagnosis,
        capturedAt: Date.now(),
        elapsedMs: elapsed,
      });
      clearPendingCapture();
      router.push("/app/diagnosis");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.somethingWentWrong);
      setPhase("ask");
    }
  }

  if (phase === "analyzing") {
    return (
      <div className="animate-agv-rise max-w-[1100px]">
        <div className="font-mono text-[10.5px] tracking-[0.12em] text-warn uppercase">Step 3 of 3</div>
        <h1 className="font-heading mt-2.5 mb-[26px] text-[38px] font-semibold tracking-[-0.03em]">{t.analysing}</h1>
        <div className="grid grid-cols-1 items-start gap-[22px] lg:grid-cols-[1.45fr_1fr]">
          <div className="relative h-[440px] overflow-hidden rounded-[20px] border" style={{ borderColor: "rgba(163,230,53,0.35)", background: "#16211a" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pending.imageDataUrl} alt="Captured leaf sample" className="h-full w-full object-cover" style={{ objectPosition: "50% 45%", filter: "saturate(0.85)" }} />
            <div
              className="animate-agv-sweep absolute inset-x-0 top-0 h-[90px]"
              style={{ background: "linear-gradient(rgba(163,230,53,0) 0%, rgba(163,230,53,0.28) 50%, rgba(163,230,53,0) 100%)" }}
            />
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] p-[22px] font-mono text-[12.5px] text-fg-dim">
            {logLines.map((line, i) => (
              <div key={line} className="animate-agv-rise" style={{ animationDelay: `${i * 350}ms`, animationFillMode: "both" }}>
                {i === 2 ? `${line} · ${history.length} events` : line}
              </div>
            ))}
            <div className="text-leaf animate-agv-rise flex items-center gap-1.5" style={{ animationDelay: `${logLines.length * 350}ms`, animationFillMode: "both" }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-leaf" />
              {t.waitingOnGemma}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "retake") {
    return (
      <div className="animate-agv-rise max-w-[1100px]">
        <div className="rounded-2xl border p-8" style={{ borderColor: "rgba(233,160,60,0.28)", background: "rgba(233,160,60,0.06)" }}>
          <div className="font-mono text-[10.5px] tracking-[0.12em] text-warn uppercase">{t.needsRetakeHeading}</div>
          <h1 className="font-heading mt-2.5 text-[28px] font-semibold tracking-[-0.02em]">{retakeInstruction}</h1>
          <p className="mt-3 text-[14px] leading-[1.6] text-fg-muted">{t.needsRetakeBody}</p>
          <button
            onClick={retake}
            className="mt-6 inline-flex items-center gap-1.5 rounded-[13px] bg-leaf px-5 py-3.5 font-medium text-[14.5px] text-[#0A0F0C] transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            <Camera className="h-4 w-4" /> {t.retakePhoto}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-agv-rise max-w-[1100px]">
      <div className="font-mono text-[10.5px] tracking-[0.12em] text-warn uppercase">{t.clarifyStepLabel}</div>
      <h1 className="font-heading mt-2.5 mb-2 max-w-[22ch] text-[38px] font-semibold tracking-[-0.03em]">{t.clarifyHeading}</h1>
      <p className="mb-[26px] max-w-[62ch] text-[15.5px] leading-[1.6] text-fg-dim">{t.clarifySubline}</p>

      <div className="grid grid-cols-1 items-start gap-[22px] lg:grid-cols-[1.45fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[var(--color-border)] p-6">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[11.5px] text-leaf">Q1</span>
              <div className="font-heading text-[20px] font-semibold tracking-[-0.015em]">{t.clarifyQ1}</div>
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              {WHERE_OPTIONS.map((o) => {
                const label = t[o.key];
                const active = where === label;
                return (
                  <button
                    key={o.key}
                    onClick={() => setWhere(label)}
                    className={`flex items-center gap-2.5 rounded-xl px-4 py-3.5 text-left text-[14.5px] transition-colors ${
                      active ? "bg-leaf font-semibold text-[#0A0F0C]" : "border text-fg-muted"
                    }`}
                    style={active ? undefined : { background: "rgba(242,240,230,0.05)", borderColor: "rgba(242,240,230,0.1)" }}
                  >
                    <span className="text-[11px] opacity-80">{active ? "●" : "○"}</span>
                    {label}
                  </button>
                );
              })}
            </div>
            <div
              className="mt-3.5 text-[13px] italic leading-[1.5]"
              style={{ color: where ? "oklch(0.86 0.13 132)" : "var(--color-fg-faint)" }}
            >
              {where ? t[WHERE_OPTIONS.find((o) => t[o.key] === where)!.noteKey] : t.whereNoteDefault}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] p-6">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[11.5px] text-leaf">Q2</span>
              <div className="font-heading text-[20px] font-semibold tracking-[-0.015em]">{t.clarifyQ2}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {WHEN_OPTIONS.map((o) => {
                const label = t[o.key];
                const active = when === label;
                return (
                  <button
                    key={o.key}
                    onClick={() => setWhen(label)}
                    className={`rounded-full px-[18px] py-3 text-[14px] transition-colors ${
                      active ? "bg-leaf font-semibold text-[#0A0F0C]" : "border text-fg-muted"
                    }`}
                    style={active ? undefined : { background: "rgba(242,240,230,0.05)", borderColor: "rgba(242,240,230,0.14)" }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div
              className="mt-3.5 text-[13px] italic leading-[1.5]"
              style={{ color: when ? "oklch(0.86 0.13 132)" : "var(--color-fg-faint)" }}
            >
              {when ? t[WHEN_OPTIONS.find((o) => t[o.key] === when)!.noteKey] : t.whenNoteDefault}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={proceed}
              disabled={!ready}
              className="flex-[2] rounded-[13px] py-4 font-semibold text-[15px] transition-colors disabled:cursor-not-allowed"
              style={ready ? { background: "var(--color-leaf)", color: "#0A0F0C" } : { background: "rgba(242,240,230,0.06)", color: "oklch(0.55 0.015 150)" }}
            >
              {ready ? t.clarifyBtnReady : t.clarifyBtnNotReady}
            </button>
            <button
              onClick={retake}
              className="flex-1 rounded-[13px] border border-[var(--color-border)] py-4 text-[14px] hover:bg-[var(--color-surface)]"
            >
              {t.retakePhoto}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
            <div className="relative h-[170px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pending.imageDataUrl} alt="Captured leaf" className="h-full w-full object-cover" style={{ objectPosition: "50% 45%" }} />
            </div>
            <div className="p-5">
              <div className="font-mono text-[10.5px] tracking-[0.12em] text-warn uppercase">
                {photoQuality === null
                  ? t.checkingPhoto
                  : photoQuality.cautions.length > 0
                    ? tpl(t.photoCheckCautionTpl, {
                        count: photoQuality.cautions.length,
                        plural: photoQuality.cautions.length === 1 ? "" : "s",
                      })
                    : t.photoCheckOk}
              </div>
              <div className="mt-2.5 text-[13.5px] leading-[1.55] text-fg-muted">
                {photoQuality === null ? (
                  <span className="inline-flex items-center gap-2 text-fg-faint">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-fg-dim/30 border-t-leaf" />
                  </span>
                ) : photoQuality.cautions.length > 0 ? (
                  photoQuality.cautions.join(" ")
                ) : (
                  t.whereNoteDefault
                )}
              </div>
            </div>
          </div>

          {profile && (
            <div className="rounded-2xl border border-[var(--color-border)] p-5">
              <div className="font-mono text-[10.5px] tracking-[0.12em] text-fg-faint uppercase">{t.whatIKnow}</div>
              <div className="mt-3 flex flex-col gap-2 text-[13.5px] leading-[1.5] text-fg-muted">
                <div>
                  {profile.crop} · {profile.stage}
                </div>
                <div>
                  {[profile.lga, profile.state].filter(Boolean).join(", ")} · rain {profile.rainfall}
                </div>
                {profile.disease !== "None" && <div>{profile.disease} treated here before</div>}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-[var(--color-border)] p-5 text-[13px] leading-[1.55] text-fg-dim">
            {t.refusalNote}
          </div>
        </div>
      </div>
    </div>
  );
}
