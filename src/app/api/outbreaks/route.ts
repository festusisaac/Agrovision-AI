import { NextRequest, NextResponse } from "next/server";
import { getOutbreakSummary, roundCoordTo500m } from "@/lib/outbreak";

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

// GET /api/outbreaks?lat=&lng=&radiusKm=5&deviceId=[&officer=1]
//
// Returns aggregated, privacy-rounded scan data for the area around a
// farmer's (rounded) location. The actual real-vs-demo aggregation lives in
// src/lib/outbreak.ts's getOutbreakSummary, shared with the USSD handler
// (src/lib/ussd.ts) so both read the exact same data through the exact
// same privacy rules.
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

  const summary = await getOutbreakSummary(center, radiusKm, deviceId);

  return NextResponse.json({
    ...summary,
    officer: wantsOfficerView && DEMO_OFFICER_ROLE ? { wards: DEMO_WARDS } : undefined,
    generatedAt: Date.now(),
  });
}
