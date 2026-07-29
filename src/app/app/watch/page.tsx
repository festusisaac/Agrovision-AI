"use client";

import { useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import { getBrowserLocation, FALLBACK_LAT, FALLBACK_LON } from "@/lib/weatherService";
import { getHistorySnapshot, getServerHistorySnapshot, subscribeHistory } from "@/lib/storage";
import { getProfileSnapshot } from "@/lib/profile";
import { useAppPrefs } from "@/lib/appPrefs";
import { tpl } from "@/lib/i18n";
import { roundCoordTo500m, type OutbreakStatus } from "@/lib/outbreak";
import { getDeviceId } from "@/lib/deviceId";

interface ApiFarm {
  id: string;
  name: string;
  distanceKm: number;
  bearing: string;
  crop: string;
  status: OutbreakStatus;
  daysAgo: number;
  x: number;
  y: number;
}

interface OutbreakApiResponse {
  center: { lat: number; lon: number };
  radiusKm: number;
  scans: number;
  confirmed: number;
  suspected: number;
  clear: number;
  spreadKmPerDay: number | null;
  spreadBearing: string | null;
  originDistanceKm: number | null;
  originDaysAgo: number | null;
  farms: ApiFarm[];
  officer?: { wards: { ward: string; confirmedCases: number }[] };
  demo: boolean;
  generatedAt: number;
}

const STATUS_COLOR: Record<OutbreakStatus, string> = {
  confirmed: "oklch(0.68 0.20 28)",
  suspected: "oklch(0.80 0.16 70)",
  clear: "oklch(0.72 0.10 150)",
};

const CACHE_KEY = "agrovision:outbreakCache";

function loadCache(): { data: OutbreakApiResponse; cachedAt: number } | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCache(data: OutbreakApiResponse) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ data, cachedAt: Date.now() }));
  } catch {
    // best-effort
  }
}

function daysAgoLabel(n: number): string {
  if (n <= 0) return "today";
  if (n === 1) return "yesterday";
  return `${n} days ago`;
}

/** This device's own real status for the outbreak map — derived from real local history, not the seeded demo dataset. */
function myRealStatus(): OutbreakStatus {
  const history = getHistorySnapshot();
  const active = history.find((e) => e.diagnosis && e.diagnosis.type !== "healthy" && e.resolved !== true);
  if (!active?.diagnosis) return "clear";
  return active.diagnosis.severity === "high" ? "confirmed" : "suspected";
}

export default function WatchPage() {
  const { t } = useAppPrefs();
  const history = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getServerHistorySnapshot);
  const profile = getProfileSnapshot();

  const [data, setData] = useState<OutbreakApiResponse | null>(null);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertJustSent, setAlertJustSent] = useState(false);
  const [alertBlockedNoChange, setAlertBlockedNoChange] = useState(false);
  const [alertKey, setAlertKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const location = await getBrowserLocation();
      const lat = location?.lat ?? FALLBACK_LAT;
      const lng = location?.lon ?? FALLBACK_LON;
      const center = roundCoordTo500m(lat, lng);
      const key = `${center.lat.toFixed(3)},${center.lon.toFixed(3)}`;
      if (!cancelled) setAlertKey(key);

      let json: OutbreakApiResponse | null = null;
      try {
        const res = await fetch(`/api/outbreaks?lat=${lat}&lng=${lng}&radiusKm=5&officer=1&deviceId=${getDeviceId()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const parsed: OutbreakApiResponse = await res.json();
        json = parsed;
        if (cancelled) return;
        setData(parsed);
        setCachedAt(null);
        setOffline(false);
        saveCache(parsed);
      } catch {
        if (cancelled) return;
        const cached = loadCache();
        if (cached) {
          json = cached.data;
          setData(cached.data);
          setCachedAt(cached.cachedAt);
        }
        setOffline(true);
      }

      // The server remembers "already alerted this exact data" even after a
      // page refresh wipes this component's own React state — check it up
      // front instead of only finding out via a failed send.
      if (!json || cancelled) return;
      try {
        const params = new URLSearchParams({
          key,
          confirmed: String(json.confirmed),
          suspected: String(json.suspected),
          clear: String(json.clear),
          scans: String(json.scans),
        });
        const statusRes = await fetch(`/api/alerts?${params.toString()}`);
        const statusJson = await statusRes.json();
        if (!cancelled && statusRes.ok && statusJson.blocked) {
          setAlertSent(true);
          setAlertBlockedNoChange(true);
        }
      } catch {
        // best-effort — the button falls back to finding out on click
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const myStatus = myRealStatus();
  const lga = profile?.lga || profile?.state || "your area";

  if (!data) {
    return (
      <div className="animate-agv-rise max-w-[1100px]">
        <div className="flex items-center gap-2 text-[13px] text-fg-faint">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-fg-dim/30 border-t-leaf" />
          {t.checkingPhoto}
        </div>
      </div>
    );
  }

  const totalConfirmed = data.confirmed + (myStatus === "confirmed" ? 1 : 0);
  const farmsInRing = data.scans + 1; // +1 for "you"
  const activeFarms = data.farms.filter((f) => f.status !== "clear");
  const nearestActive = [...activeFarms].sort((a, b) => a.distanceKm - b.distanceKm)[0];
  const originFarm = [...data.farms].filter((f) => f.status === "confirmed").sort((a, b) => b.daysAgo - a.daysAgo)[0];

  const alertBody = `AgroVision: Fall armyworm confirmed on ${totalConfirmed} maize farms within ${data.radiusKm} km of you, moving ${
    data.spreadBearing ?? "nearby"
  }. Check your whorls this evening. Neem oil 5 ml/L at dusk works now; it will not in a week.`;

  async function sendAlert() {
    if (!alertKey || !data) return;
    const snapshot = { confirmed: data.confirmed, suspected: data.suspected, clear: data.clear, scans: data.scans };
    setSendingAlert(true);
    setAlertError(null);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: alertKey, message: alertBody, snapshot }),
      });
      const json = await res.json();
      if (res.status === 429) {
        setAlertSent(true);
        setAlertBlockedNoChange(true);
        return;
      }
      if (!res.ok) throw new Error(json.error || "Failed to send alert");
      setAlertSent(true);
      setAlertJustSent(true);
      setAlertBlockedNoChange(false);
    } catch (err) {
      setAlertError(err instanceof Error ? err.message : t.somethingWentWrong);
    } finally {
      setSendingAlert(false);
    }
  }

  return (
    <div className="animate-agv-rise max-w-[1100px]">
      <div className="font-mono text-[10.5px] tracking-[0.12em] text-warn uppercase">{tpl(t.watchEyebrowTpl, { lga })}</div>
      <h1 className="font-heading mt-2.5 mb-2 text-[38px] font-semibold tracking-[-0.03em]">{t.watchHeading}</h1>
      <p className="mb-6 max-w-[66ch] text-[15.5px] leading-[1.6] text-fg-dim">{t.watchSubline}</p>

      {offline && (
        <div className="mb-5 rounded-xl border p-3.5 text-[13px]" style={{ borderColor: "rgba(233,160,60,0.28)", background: "rgba(233,160,60,0.06)" }}>
          {t.watchOffline}
          {cachedAt && <span className="ml-1.5 text-fg-faint">{tpl(t.watchCachedAsOfTpl, { time: new Date(cachedAt).toLocaleString() })}</span>}
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--color-border)] p-5">
          <div className="font-heading text-[30px] font-semibold tracking-[-0.02em]">{data.scans + 1}</div>
          <div className="mt-1 text-[12.5px] text-fg-dim">{t.statScansThisWeek}</div>
        </div>
        <div className="rounded-2xl border p-5" style={{ borderColor: "rgba(232,120,90,0.28)", background: "rgba(232,120,90,0.07)" }}>
          <div className="font-heading text-[30px] font-semibold tracking-[-0.02em]" style={{ color: "oklch(0.72 0.19 28)" }}>
            {totalConfirmed}
          </div>
          <div className="mt-1 text-[12.5px]" style={{ color: "oklch(0.74 0.02 30)" }}>
            {tpl(t.statFarmsConfirmedTpl, { disease: "armyworm" })}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] p-5">
          <div className="font-heading text-[30px] font-semibold tracking-[-0.02em]">
            {data.spreadKmPerDay ?? "—"} <span className="text-[16px] font-normal text-fg-dim">km/day</span>
          </div>
          <div className="mt-1 text-[12.5px] text-fg-dim">{tpl(t.statSpreadingTpl, { direction: data.spreadBearing ?? "—" })}</div>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] p-5">
          <div className="font-heading text-[30px] font-semibold tracking-[-0.02em]">{farmsInRing}</div>
          <div className="mt-1 text-[12.5px] text-fg-dim">{t.statFarmsInRing}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-[22px] lg:grid-cols-[1.45fr_1fr]">
        <div className="rounded-[20px] border border-[var(--color-border)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="font-mono text-[10.5px] tracking-[0.12em] text-fg-faint uppercase">{t.mapPanelTitle}</div>
            <div className="flex gap-3.5 font-mono text-[10px] tracking-[0.06em] text-fg-dim">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR.confirmed }} />
                {t.legendConfirmed}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR.suspected }} />
                {t.legendSuspected}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR.clear }} />
                {t.legendClear}
              </span>
            </div>
          </div>

          <div
            className="relative mt-4 h-[390px] overflow-hidden rounded-2xl"
            style={{
              background: "#101a14",
              backgroundImage:
                "linear-gradient(rgba(242,240,230,0.045) 1px,transparent 1px),linear-gradient(90deg,rgba(242,240,230,0.045) 1px,transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          >
            <div className="pointer-events-none absolute rounded-full border border-dashed" style={{ left: "47%", top: "52%", width: 300, height: 300, marginLeft: -150, marginTop: -150, borderColor: "rgba(163,230,53,0.3)" }} />
            <div className="pointer-events-none absolute rounded-full border border-dashed" style={{ left: "47%", top: "52%", width: 180, height: 180, marginLeft: -90, marginTop: -90, borderColor: "rgba(163,230,53,0.18)" }} />
            {originFarm && (
              <div
                className="pointer-events-none absolute font-mono text-[9.5px] tracking-[0.08em] whitespace-nowrap"
                style={{ left: `${originFarm.x}%`, top: `${originFarm.y}%`, marginLeft: 16, marginTop: -20, color: "oklch(0.72 0.19 28)" }}
              >
                {tpl(t.originLabelTpl, { days: originFarm.daysAgo })}
              </div>
            )}
            {data.farms.map((f) => (
              <div
                key={f.id}
                title={f.name}
                className="absolute rounded-full"
                style={{
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  width: 20,
                  height: 20,
                  marginLeft: -10,
                  marginTop: -10,
                  background: STATUS_COLOR[f.status],
                  boxShadow: "0 0 0 1px rgba(10,15,12,0.6)",
                  opacity: f.status === "clear" ? 0.72 : 1,
                }}
              />
            ))}
            <div
              className="absolute rounded-full"
              style={{ left: "47%", top: "52%", width: 26, height: 26, marginLeft: -13, marginTop: -13, background: STATUS_COLOR[myStatus], boxShadow: "0 0 0 3px rgba(163,230,53,0.55)" }}
            />
            <div className="pointer-events-none absolute font-mono text-[10px] tracking-[0.06em] text-leaf" style={{ left: "47%", top: "52%", marginLeft: 20, marginTop: -8 }}>
              {t.yourFarmLabel}
            </div>
            <div className="pointer-events-none absolute bottom-3.5 left-4 font-mono text-[9.5px] tracking-[0.06em] text-fg-faint">{t.gridCaption}</div>
          </div>

          <div className="mt-4 border-t border-[var(--color-border)] pt-3.5">
            <div className="grid gap-2.5 pb-2.5 font-mono text-[9.5px] tracking-[0.1em] text-fg-faint uppercase" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 0.9fr" }}>
              <div>{t.tableFarm}</div>
              <div>{t.tableDistance}</div>
              <div>{t.tableCrop}</div>
              <div>{t.tableStatus}</div>
            </div>
            {data.farms.map((f) => (
              <div
                key={f.id}
                className="grid items-center gap-2.5 border-t border-[var(--color-border)] py-2.5 text-[13px]"
                style={{ gridTemplateColumns: "1.5fr 1fr 1fr 0.9fr" }}
              >
                <div>{f.name}</div>
                <div className="font-mono text-[11.5px] text-fg-dim">
                  {f.distanceKm} km {f.bearing}
                </div>
                <div className="text-fg-dim">{f.crop}</div>
                <div className="text-[12.5px] font-semibold" style={{ color: STATUS_COLOR[f.status] }}>
                  {f.status === "confirmed" ? t.statusConfirmed : f.status === "suspected" ? t.statusSuspected : t.statusClear}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {nearestActive && originFarm && (
            <div className="rounded-2xl border p-5" style={{ borderColor: "rgba(163,230,53,0.24)", background: "rgba(163,230,53,0.07)" }}>
              <div className="font-mono text-[10.5px] tracking-[0.12em] text-leaf uppercase">{t.yourFarmNextTitle}</div>
              <p className="mt-2.5 text-[14px] leading-[1.6] text-fg-muted">
                {tpl(t.yourFarmNextBodyTpl, {
                  originDist: originFarm.distanceKm,
                  originBearing: originFarm.bearing,
                  speed: data.spreadKmPerDay ?? "—",
                  nearestName: nearestActive.name,
                  nearestDist: nearestActive.distanceKm,
                  nearestBearing: nearestActive.bearing,
                  nearestWhen: daysAgoLabel(nearestActive.daysAgo),
                })}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-[var(--color-border)] p-5">
            <div className="font-mono text-[10.5px] tracking-[0.12em] text-fg-faint uppercase">{tpl(t.warnFarmsTitleTpl, { count: data.farms.length })}</div>
            <div className="mt-3 border-l-2 py-0.5 pl-3.5 text-[13.5px] leading-[1.6] text-fg-muted" style={{ borderColor: "rgba(163,230,53,0.4)" }}>
              {alertBody}
            </div>
            <div className="mt-3 font-mono text-[10px] tracking-[0.06em] text-fg-faint">
              {tpl(t.alertMetaTpl, { chars: alertBody.length })}
            </div>
            {alertError && <p className="mt-2 text-[12.5px] text-red-400">{alertError}</p>}
            {alertSent && alertBlockedNoChange && <p className="mt-2 text-[12.5px] text-fg-faint">{t.alertNoChangeMessage}</p>}
            {alertSent && !alertBlockedNoChange && alertJustSent && (
              <p className="mt-2 text-[12.5px] text-leaf">{t.liveAlertSentMessage}</p>
            )}
            <button
              onClick={sendAlert}
              disabled={alertSent || sendingAlert || !alertKey}
              className="mt-4 w-full rounded-xl py-3.5 font-semibold text-[14.5px] transition-colors disabled:cursor-not-allowed"
              style={alertSent ? { background: "rgba(163,230,53,0.14)", color: "var(--color-leaf)" } : { background: "var(--color-leaf)", color: "#0A0F0C" }}
            >
              {sendingAlert ? "…" : tpl(alertSent ? t.alertSentBtnTpl : t.sendAlertBtnTpl, { count: data.farms.length })}
            </button>
          </div>

          {data.officer && (
            <div className="rounded-2xl border border-[var(--color-border)] p-5">
              <div className="font-mono text-[10.5px] tracking-[0.12em] text-fg-faint uppercase">{t.officerTitle}</div>
              <p className="mt-2.5 text-[13.5px] leading-[1.6] text-fg-dim">{tpl(t.officerBodyTpl, { lga })}</p>
              <div className="mt-3.5 flex flex-col gap-2">
                {data.officer.wards.map((w) => (
                  <div key={w.ward} className="flex items-center justify-between gap-3 text-[13px]">
                    <span>{w.ward}</span>
                    <span className="font-mono text-[11.5px]" style={{ color: w.confirmedCases > 5 ? STATUS_COLOR.confirmed : w.confirmedCases > 1 ? STATUS_COLOR.suspected : "var(--color-fg-dim)" }}>
                      {tpl(t.casesTpl, { count: w.confirmedCases })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[12.5px] leading-[1.55] text-fg-faint">
            {data.demo ? t.watchDemoDisclaimer : t.watchLiveDataNote}
          </p>
          <p className="text-[11px] leading-[1.5] text-fg-faint">{history.length} scan{history.length === 1 ? "" : "s"} logged on this device.</p>
        </div>
      </div>
    </div>
  );
}
