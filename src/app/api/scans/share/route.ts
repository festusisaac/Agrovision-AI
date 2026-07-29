import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";
import { roundCoordTo500m } from "@/lib/outbreak";

const STATUSES = new Set(["confirmed", "suspected", "clear"]);

// POST /api/scans/share — only called when the farmer has explicitly opted
// in (FarmProfile.shareToVillageWatch) and only for a diagnosis they chose
// to save. Rounds the coordinate server-side too (never trust the client to
// have rounded it) before it's ever written to disk. No name, farm name or
// phone number is accepted here — the table has no columns for them.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const lat = Number(body?.lat);
  const lon = Number(body?.lon);
  const crop: string = typeof body?.crop === "string" ? body.crop.slice(0, 60) : "";
  const status: string = body?.status;
  const label: string = typeof body?.label === "string" ? body.label.slice(0, 80) : "";
  const deviceId: string = typeof body?.deviceId === "string" ? body.deviceId.slice(0, 64) : "";

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "lat and lon must be numbers" }, { status: 400 });
  }
  if (!crop || !STATUSES.has(status) || !deviceId) {
    return NextResponse.json({ error: "crop, a valid status and deviceId are required" }, { status: 400 });
  }

  const rounded = roundCoordTo500m(lat, lon);
  await ensureSchema();
  await sql`
    INSERT INTO scans (device_id, lat, lon, crop, status, label, created_at)
    VALUES (${deviceId}, ${rounded.lat}, ${rounded.lon}, ${crop}, ${status}, ${label}, ${Date.now()})
  `;

  return NextResponse.json({ ok: true });
}
