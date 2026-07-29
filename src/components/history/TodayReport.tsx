"use client";

import { useRef, useState } from "react";
import { CalendarPlus, RefreshCw, Sprout, Square, Trash2, Volume2 } from "lucide-react";
import { addCrop, removeCrop } from "@/lib/crops";
import { speakText, type SpeakController } from "@/lib/tts";
import { useDailyReport } from "@/lib/useDailyReport";
import { useAppPrefs } from "@/lib/appPrefs";

function daysSince(timestamp: number): number {
  return Math.max(0, Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24)));
}

export default function TodayReport() {
  const { language, t } = useAppPrefs();
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [plantedDate, setPlantedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const { crops, report, loading, error, refresh: generateReport } = useDailyReport(language);
  const [speechStatus, setSpeechStatus] = useState<"idle" | "loading" | "speaking">("idle");
  const [speechProgress, setSpeechProgress] = useState(0);
  const speechControllerRef = useRef<SpeakController | null>(null);

  function handleAddCrop(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const areaHectares = area.trim() ? Number(area) : undefined;
    addCrop(name.trim(), new Date(plantedDate).getTime(), areaHectares && areaHectares > 0 ? areaHectares : undefined);
    setName("");
    setArea("");
  }

  function handleListen() {
    if (!report) return;
    if (speechStatus !== "idle") {
      speechControllerRef.current?.stop();
      setSpeechStatus("idle");
      return;
    }
    setSpeechStatus("loading");
    setSpeechProgress(0);
    speechControllerRef.current = speakText(report, language, {
      onStart: () => setSpeechStatus("speaking"),
      onEnd: () => setSpeechStatus("idle"),
      onProgress: setSpeechProgress,
    });
  }

  return (
    <div>
      <p className="text-sm text-foreground/70">{t.dailyBriefingSubtitle}</p>

      <form onSubmit={handleAddCrop} className="mt-4 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.cropNamePlaceholder}
          className="min-w-[140px] flex-1 rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={plantedDate}
          onChange={(e) => setPlantedDate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
        />
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder={t.areaPlaceholder}
          title={t.areaTooltip}
          className="w-[168px] rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg bg-leaf px-4 py-2 text-sm font-medium text-[#0A0F0C] transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          <CalendarPlus className="h-4 w-4" /> {t.addCrop}
        </button>
      </form>

      {crops.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {crops.map((c) => (
            <li
              key={c.id}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs"
            >
              <Sprout className="h-3.5 w-3.5 text-leaf" />
              {c.name}
              {c.areaHectares ? ` · ${c.areaHectares}ha` : ""} · {daysSince(c.plantedAt)}d
              <button
                onClick={() => removeCrop(c.id)}
                aria-label={`Remove ${c.name}`}
                className="text-foreground/40 hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {crops.length === 0 ? (
        <p className="mt-6 text-sm text-foreground/50">{t.addCropAboveNote}</p>
      ) : loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-foreground/60">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-leaf/30 border-t-leaf" />
          {t.preparingTodayReport}
        </div>
      ) : error ? (
        <p className="mt-6 text-sm text-red-400">{error}</p>
      ) : report ? (
        <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
          <p className="text-sm leading-relaxed">{report}</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleListen}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs hover:bg-[var(--color-surface)]"
            >
              {speechStatus === "loading" ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-foreground/30 border-t-leaf-dark" />
              ) : speechStatus === "speaking" ? (
                <Square className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
              {speechStatus === "loading" ? `${speechProgress}%` : speechStatus === "speaking" ? t.stop : t.listen}
            </button>
            <button
              onClick={() => {
                speechControllerRef.current?.stop();
                setSpeechStatus("idle");
                generateReport();
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs hover:bg-[var(--color-surface)]"
            >
              <RefreshCw className="h-3.5 w-3.5" /> {t.refresh}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
