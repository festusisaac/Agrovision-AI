"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, RefreshCw, Square, Volume2 } from "lucide-react";
import { getCropsSnapshot, getServerCropsSnapshot, subscribeCrops } from "@/lib/crops";
import { getHistorySnapshot, getServerHistorySnapshot, subscribeHistory } from "@/lib/storage";
import { getBrowserLocation, getWeatherWithForecast, type WeatherWithForecast } from "@/lib/weatherService";
import { useDailyReport } from "@/lib/useDailyReport";
import { useAppPrefs } from "@/lib/appPrefs";
import { timeOfDayGreeting, tpl } from "@/lib/i18n";
import { monoDateTime, relativeTime, daysSince } from "@/lib/format";
import { speakText, type SpeakController } from "@/lib/tts";
import { getProfileSnapshot, getServerProfileSnapshot, subscribeProfile, DEMO_PROFILE } from "@/lib/profile";

export default function DashboardPage() {
  const { language, t } = useAppPrefs();
  const crops = useSyncExternalStore(subscribeCrops, getCropsSnapshot, getServerCropsSnapshot);
  const history = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getServerHistorySnapshot);
  const profile = useSyncExternalStore(subscribeProfile, getProfileSnapshot, getServerProfileSnapshot) ?? DEMO_PROFILE;
  const { report, loading: reportLoading, error: reportError, refresh: refreshReport } = useDailyReport(language);

  const [now, setNow] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherWithForecast | null>(null);
  const [speechStatus, setSpeechStatus] = useState<"idle" | "loading" | "speaking">("idle");
  const [speechProgress, setSpeechProgress] = useState(0);
  const speechControllerRef = useRef<SpeakController | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    Promise.resolve().then(() => setNow(new Date()));
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const location = await getBrowserLocation();
      const w = await getWeatherWithForecast(
        location?.lat ?? 6.5244,
        location?.lon ?? 3.3792,
        location !== null
      ).catch(() => null);
      if (!cancelled) setWeather(w);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const primaryCrop = crops.find((c) => c.name.toLowerCase() === profile.crop.toLowerCase()) ?? crops[0];
  const firstName = profile.name.trim().split(" ")[0] || profile.name;
  const locationLine = [profile.lga, profile.state].filter(Boolean).join(", ") || profile.country;
  const diagnosisEntries = history.filter((e) => e.diagnosis);
  const unresolvedIssues = diagnosisEntries.filter((e) => e.diagnosis!.type !== "healthy" && e.resolved !== true);
  const severeCount = unresolvedIssues.filter((e) => e.diagnosis!.severity === "high").length;
  const advisoryCount = unresolvedIssues.length - severeCount;
  const latest = history[0];
  const recent = history.slice(0, 3);

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
    <div className="animate-agv-rise max-w-[1100px]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="font-mono text-[10.5px] tracking-[0.12em] text-warn uppercase">
            {profile.farm} · {locationLine}
          </div>
          <h1 className="font-heading mt-2.5 text-[38px] font-semibold tracking-[-0.03em]">
            {timeOfDayGreeting(t)}, {firstName}
          </h1>
        </div>
        {now && <div className="font-mono text-[11.5px] text-fg-faint">{monoDateTime(now)}</div>}
      </div>

      <div className="relative mt-6 h-[230px] overflow-hidden rounded-[20px] border border-[var(--color-border)]">
        <Image src="/images/background4.jpg" alt="Rows of leafy vegetables in a furrowed field" fill sizes="1100px" className="object-cover" style={{ objectPosition: "55% 78%" }} />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, rgba(10,15,12,0.88) 12%, rgba(10,15,12,0.15) 78%)" }}
        />
        <div className="absolute bottom-[26px] left-7 right-7">
          <div className="font-mono text-[10px] tracking-[0.1em] text-leaf-dark">
            {crops.length > 0 ? crops.map((c) => c.name).join(" · ").toUpperCase() : t.noCropsTrackedYet}
          </div>
          <div className="font-heading mt-1.5 text-[22px] font-semibold">
            {latest?.diagnosis && latest.diagnosis.type !== "healthy" && latest.resolved !== true
              ? latest.diagnosis.label
              : history.length > 0
                ? t.healthyNoAction
                : t.photographToStart}
          </div>
          <div className="mt-1 text-[12.5px] text-fg-muted">
            {history.length > 0
              ? tpl(t.lastScannedTpl, { time: relativeTime(latest.createdAt), count: history.length })
              : t.noScansYetSeason}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-[18px]">
          <div className="text-[11.5px] text-fg-faint">
            {profile.crop} · {profile.size}
          </div>
          <div className="font-heading mt-1.5 text-[26px] font-semibold">
            {primaryCrop ? `Day ${daysSince(primaryCrop.plantedAt)}` : "—"}
          </div>
          <div className="mt-1 text-[11.5px] text-leaf">
            {profile.stage} {t.stageSuffix}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-[18px]">
          <div className="text-[11.5px] text-fg-faint">{t.rainForecast}</div>
          <div className="font-heading mt-1.5 text-[26px] font-semibold">
            {weather ? `${weather.tomorrow.precipitationChance}%` : "—"}
          </div>
          <div className="mt-1 text-[11.5px] text-warn">{t.chanceTomorrow}</div>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-[18px]">
          <div className="text-[11.5px] text-fg-faint">{t.openAlerts}</div>
          <div className="font-heading mt-1.5 text-[26px] font-semibold">{unresolvedIssues.length}</div>
          <div className="mt-1 text-[11.5px] text-warn">
            {unresolvedIssues.length > 0 ? tpl(t.severeAdvisoryTpl, { severe: severeCount, advisory: advisoryCount }) : t.allClear}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-[18px]">
          <div className="text-[11.5px] text-fg-faint">{t.diagnosesLogged}</div>
          <div className="font-heading mt-1.5 text-[26px] font-semibold">{diagnosisEntries.length}</div>
          <div className="mt-1 text-[11.5px] text-leaf">{tpl(t.totalScansTpl, { count: history.length })}</div>
        </div>
      </div>

      <div className="mt-[26px] grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="mb-3 font-mono text-[10.5px] tracking-[0.12em] text-fg-faint uppercase">{t.recommends}</div>
          {crops.length === 0 ? (
            <div className="rounded-2xl border border-[var(--color-border)] p-5 text-[13.5px] text-fg-dim">
              {t.trackCropPrefix}{" "}
              <Link href="/app/history" className="text-leaf hover:underline">
                {t.historyLinkLabel}
              </Link>{" "}
              {t.trackCropSuffix}
            </div>
          ) : reportLoading ? (
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] p-5 text-[13.5px] text-fg-dim">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-leaf/30 border-t-leaf" />
              {t.preparingBriefing}
            </div>
          ) : reportError ? (
            <p className="rounded-2xl border border-[var(--color-border)] p-5 text-[13.5px] text-red-400">{reportError}</p>
          ) : report ? (
            <div
              className="rounded-2xl border p-5"
              style={{ background: "rgba(163,230,53,0.07)", borderColor: "rgba(163,230,53,0.22)" }}
            >
              <p className="text-[13.5px] leading-[1.6] text-fg-muted">{report}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleListen}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs hover:bg-[var(--color-surface)]"
                >
                  {speechStatus === "loading" ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-fg-dim/30 border-t-leaf" />
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
                    refreshReport();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs hover:bg-[var(--color-surface)]"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> {t.refresh}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="rounded-2xl border border-[var(--color-border)] p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-[10.5px] tracking-[0.12em] text-fg-faint uppercase">{t.farmProfile}</div>
              <Link href="/onboarding?step=1" className="p-0.5 text-[12px] text-leaf hover:underline">
                {t.edit}
              </Link>
            </div>
            <div className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-3.5">
              <div>
                <div className="text-[11px] text-fg-faint">{t.farmer}</div>
                <div className="mt-[3px] text-[13.5px] font-semibold">{profile.name}</div>
              </div>
              <div>
                <div className="text-[11px] text-fg-faint">{t.location}</div>
                <div className="mt-[3px] text-[13.5px] font-semibold">{locationLine}</div>
              </div>
              <div>
                <div className="text-[11px] text-fg-faint">{t.cropLabel}</div>
                <div className="mt-[3px] text-[13.5px] font-semibold">{profile.crop}</div>
              </div>
              <div>
                <div className="text-[11px] text-fg-faint">{t.farmSize}</div>
                <div className="mt-[3px] text-[13.5px] font-semibold">{profile.size}</div>
              </div>
              <div>
                <div className="text-[11px] text-fg-faint">{t.growthStage}</div>
                <div className="mt-[3px] text-[13.5px] font-semibold text-leaf">{profile.stage}</div>
              </div>
              <div>
                <div className="text-[11px] text-fg-faint">{t.today}</div>
                <div className="mt-[3px] text-[13.5px] font-semibold">
                  {weather ? `${weather.temperature}°C · ${weather.description.toLowerCase()}` : "—"}
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl border border-[var(--color-border)] p-5"
            style={{ background: "linear-gradient(180deg, rgba(242,240,230,0.045), rgba(242,240,230,0))" }}
          >
            <div className="font-heading text-[16px] font-semibold">{t.spotSomethingUnusual}</div>
            <p className="mt-1.5 text-[13px] leading-[1.55] text-fg-dim">{t.spotSomethingBody}</p>
            <Link
              href="/app/scan"
              className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-[11px] bg-leaf py-3 font-medium text-[14px] text-[#0A0F0C] transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              <Camera className="h-4 w-4" /> {t.startAScan}
            </Link>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] p-5">
            <div className="font-mono text-[10.5px] tracking-[0.12em] text-fg-faint uppercase">{t.recentActivity}</div>
            <div className="mt-3.5 flex flex-col gap-3">
              {recent.length === 0 ? (
                <p className="text-[13px] text-fg-faint">{t.noActivityYet}</p>
              ) : (
                recent.map((e) => {
                  const active = e.diagnosis && e.diagnosis.type !== "healthy" && e.resolved !== true;
                  const dotColor = active ? "var(--color-leaf)" : e.diagnosis ? "var(--color-warn)" : "var(--color-fg-faint)";
                  return (
                    <div key={e.id} className="flex items-start gap-2.5">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: dotColor }} />
                      <div>
                        <div className="text-[13px] font-medium">{e.title}</div>
                        <div className="mt-0.5 font-mono text-[10px] text-fg-faint">{relativeTime(e.createdAt)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <Link
              href="/app/history"
              className="mt-4 flex w-full items-center justify-center rounded-[10px] border border-[var(--color-border)] py-2.5 text-[13px] hover:bg-[var(--color-surface)]"
            >
              {t.openFarmHistory}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
