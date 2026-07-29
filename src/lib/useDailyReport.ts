import { useCallback, useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import { getCropsSnapshot, getServerCropsSnapshot, subscribeCrops } from "./crops";
import { getBrowserLocation } from "./weatherService";

const REPORT_CACHE_KEY = "agrovision:dailyReport";

interface CachedReport {
  date: string;
  cropsKey: string;
  language: string;
  report: string;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function cropsKeyFor(crops: { id: string }[]): string {
  return crops
    .map((c) => c.id)
    .sort()
    .join(",");
}

function loadCachedReport(): CachedReport | null {
  try {
    const raw = window.localStorage.getItem(REPORT_CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedReport) : null;
  } catch {
    return null;
  }
}

function saveCachedReport(entry: CachedReport) {
  try {
    window.localStorage.setItem(REPORT_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // best-effort — a failed cache write shouldn't break the report itself
  }
}

/** Fetches (and caches for the day) a Gemma-generated daily report for the farmer's tracked crops. Shared by the Dashboard and the History "Today" tab so both show the same report without duplicating the fetch/cache logic. */
export function useDailyReport(language: string) {
  const crops = useSyncExternalStore(subscribeCrops, getCropsSnapshot, getServerCropsSnapshot);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async () => {
    if (crops.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const location = await getBrowserLocation();
      const res = await fetch("/api/daily-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crops: crops.map((c) => ({ name: c.name, plantedAt: c.plantedAt })),
          language,
          lat: location?.lat,
          lon: location?.lon,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate report");
      setReport(data.report);
      if (!data.demoMode) {
        saveCachedReport({ date: todayKey(), cropsKey: cropsKeyFor(crops), language, report: data.report });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [crops, language]);

  useEffect(() => {
    if (crops.length === 0) return;
    (async () => {
      const cached = loadCachedReport();
      const key = cropsKeyFor(crops);
      if (cached && cached.date === todayKey() && cached.cropsKey === key && cached.language === language) {
        setReport(cached.report);
      } else {
        await generateReport();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crops.length, language]);

  return { crops, report, loading, error, refresh: generateReport };
}
