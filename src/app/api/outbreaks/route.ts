import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";
import {
  SEED_FARMS,
  bearingLabel,
  destinationPoint,
  haversineKm,
  bearingDegBetween,
  projectToMap,
  roundCoordTo500m,
  suppressSmallCells,
  estimateSpread,
  type OutbreakStatus,
} from "@/lib/outbreak";

// There's no real auth/role system yet, so "officer" access is a hardcoded
// demo value rather than a permissions check that would look real but
// isn't — the gate itself (the `if` below) is real and would work
// unchanged once real roles exist.
const DEMO_OFFICER_ROLE = true;

const DEMO_WARDS = [
  { ward: "Maikunkele ward", confirmedCases: 9 },
  { ward: "Garatu ward", confirmedCases: 4 },
  { ward: "Beji ward", confirmedCases: 1 },
];

const RECENCY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_REAL_FARMS = 3; // below this, real data would be individually identifiable — show clearly-labelled demo data instead

interface ScanRow {
  device_id: string;
  lat: number;
  lon: number;
  crop: string;
  status: OutbreakStatus;
  label: string;
  created_at: number;
}

interface ResolvedFarm {
  id: string;
  name: string;
  distanceKm: number;
  bearingDeg: number;
  bearing: string;
  crop: string;
  status: OutbreakStatus;
  daysAgo: number;
  x: number;
  y: number;
}

function resolveFromCenter(center: { lat: number; lon: number }, lat: number, lon: number) {
  const distanceKm = Math.round(haversineKm(center.lat, center.lon, lat, lon) * 10) / 10;
  const bearingDeg = bearingDegBetween(center.lat, center.lon, lat, lon);
  const { x, y } = projectToMap(distanceKm, bearingDeg);
  return { distanceKm, bearingDeg, bearing: bearingLabel(bearingDeg), x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

/** Real scans, privacy-suppressed (any 1 km cell with fewer than 3 farms is dropped so no single farm is identifiable). */
async function realFarmsNear(center: { lat: number; lon: number }, radiusKm: number, excludeDeviceId: string): Promise<ResolvedFarm[]> {
  await ensureSchema();
  const rows = (await sql`
    SELECT device_id, lat, lon, crop, status, label, created_at FROM scans
    WHERE created_at > ${Date.now() - RECENCY_WINDOW_MS} AND device_id != ${excludeDeviceId}
  `) as unknown as ScanRow[];

  const suppressed = suppressSmallCells(rows, 3);

  return suppressed
    .map((r, i) => {
      const geo = resolveFromCenter(center, r.lat, r.lon);
      return {
        id: `r${i}`,
        // Real farmers' names are never collected against scans in the
        // first place — label anonymously rather than exposing anything.
        name: `Nearby farm ${i + 1}`,
        crop: r.crop,
        status: r.status,
        daysAgo: Math.floor((Date.now() - r.created_at) / (24 * 60 * 60 * 1000)),
        ...geo,
      };
    })
    .filter((f) => f.distanceKm <= radiusKm);
}

/** Illustrative seed farms — see the module comment in src/lib/outbreak.ts. Used only when real data is too sparse to safely show. */
function demoFarmsNear(center: { lat: number; lon: number }, radiusKm: number): ResolvedFarm[] {
  return SEED_FARMS.filter((f) => f.distanceKm <= radiusKm).map((f, i) => {
    // Real chain: seed distance/bearing -> destination point -> round to
    // 500 m for privacy -> recompute the real distance/bearing from the
    // ROUNDED point, so the displayed numbers reflect what's actually kept.
    const raw = destinationPoint(center.lat, center.lon, f.bearingDeg, f.distanceKm);
    const rounded = roundCoordTo500m(raw.lat, raw.lon);
    const geo = resolveFromCenter(center, rounded.lat, rounded.lon);
    return { id: `f${i}`, name: f.name, crop: f.crop, status: f.status, daysAgo: f.daysAgo, ...geo };
  });
}

// GET /api/outbreaks?lat=&lng=&radiusKm=5&deviceId=[&officer=1]
//
// Returns aggregated, privacy-rounded scan data for the area around a
// farmer's (rounded) location. Prefers real opted-in scans from the last 7
// days; falls back to a clearly-labelled illustrative seed when there
// aren't yet enough real nearby farms to aggregate safely (see
// MIN_REAL_FARMS). The geometry (distance, bearing, 500 m rounding, map
// projection, spread-rate centroid math) is identical either way.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const wantsOfficerView = searchParams.get("officer") === "1";
  const deviceId = searchParams.get("deviceId") ?? "";

  // Number(null) is 0, not NaN — check the raw params are present before
  // converting, or a missing lat/lng silently resolves to (0,0).
  if (latParam === null || lngParam === null) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }
  const lat = Number(latParam);
  const lng = Number(lngParam);
  const radiusKm = Number(searchParams.get("radiusKm")) || 5;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng must be numbers" }, { status: 400 });
  }

  // Round the requester's own location before it's used for anything else —
  // never compute against the exact coordinate server-side either.
  const center = roundCoordTo500m(lat, lng);

  const real = await realFarmsNear(center, radiusKm, deviceId);
  const demo = real.length >= MIN_REAL_FARMS ? null : demoFarmsNear(center, radiusKm);
  const farms = demo ?? real;

  const confirmedFarms = farms.filter((f) => f.status === "confirmed");
  const spread = estimateSpread(confirmedFarms.map((f) => ({ distanceKm: f.distanceKm, bearingDeg: f.bearingDeg, daysAgo: f.daysAgo })));
  const origin = [...confirmedFarms].sort((a, b) => b.daysAgo - a.daysAgo)[0];

  return NextResponse.json({
    center,
    radiusKm,
    scans: farms.length,
    confirmed: confirmedFarms.length,
    suspected: farms.filter((f) => f.status === "suspected").length,
    clear: farms.filter((f) => f.status === "clear").length,
    spreadKmPerDay: spread?.kmPerDay ?? null,
    spreadBearing: spread?.bearingLabel ?? null,
    originDistanceKm: origin?.distanceKm ?? null,
    originDaysAgo: origin?.daysAgo ?? null,
    farms,
    officer: wantsOfficerView && DEMO_OFFICER_ROLE ? { wards: DEMO_WARDS } : undefined,
    demo: demo !== null,
    generatedAt: Date.now(),
  });
}
