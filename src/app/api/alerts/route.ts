import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

interface AlertSendRow {
  sent_at: number;
  confirmed: number;
  suspected: number;
  clear_count: number;
  scans: number;
}

interface Snapshot {
  confirmed: number;
  suspected: number;
  clear: number;
  scans: number;
}

function parseSnapshot(searchParams: URLSearchParams): Snapshot | null {
  const confirmed = Number(searchParams.get("confirmed"));
  const suspected = Number(searchParams.get("suspected"));
  const clear = Number(searchParams.get("clear"));
  const scans = Number(searchParams.get("scans"));
  if (![confirmed, suspected, clear, scans].every(Number.isFinite)) return null;
  return { confirmed, suspected, clear, scans };
}

function unchanged(existing: AlertSendRow | undefined, snapshot: Snapshot): boolean {
  if (!existing) return false;
  return (
    existing.confirmed === snapshot.confirmed &&
    existing.suspected === snapshot.suspected &&
    existing.clear_count === snapshot.clear &&
    existing.scans === snapshot.scans
  );
}

// GET /api/alerts?key=<lat,lon>&confirmed=&suspected=&clear=&scans= — lets the
// client learn the real block state up front (e.g. on page load), instead of
// only finding out an alert was already sent for this exact data by getting
// a rejection back from a click. Without this, a page refresh wipes the
// client's own "already sent" state (it's plain React state) while the
// server still remembers, so the button silently looked clickable again.
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }
  const snapshot = parseSnapshot(req.nextUrl.searchParams);
  if (!snapshot) {
    return NextResponse.json({ error: "confirmed, suspected, clear and scans are required" }, { status: 400 });
  }
  await ensureSchema();
  const rows = (await sql`
    SELECT sent_at, confirmed, suspected, clear_count, scans FROM alert_sends WHERE area_key = ${key}
  `) as unknown as AlertSendRow[];
  const existing = rows[0];
  return NextResponse.json({ blocked: unchanged(existing, snapshot), sentAt: existing?.sent_at ?? null });
}

// POST /api/alerts — writes a real row into the `live_alerts` table, which
// every open tab's AlertToast polls (see /api/alerts/poll and
// components/app/AlertToast.tsx). This replaces an earlier in-memory
// pub/sub design: that worked for a single long-lived Node process, but
// Vercel routes different requests to different, isolated serverless
// instances, so an in-memory broadcast from one would never reach a
// listener held by another. A shared table is the real, working
// equivalent — instead of sending SMS to phone numbers this app doesn't
// actually have on file.
//
// Rate-limiting is tied to real data change rather than a fixed calendar
// window: a new alert for the same area is only blocked while the outbreak
// snapshot (confirmed/suspected/clear/scans counts) is identical to the one
// last alerted — the moment Village Watch's own data changes (a new scan,
// a case moving from suspected to confirmed), sending unblocks again.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const key: string | undefined = body?.key; // the sender's rounded lat,lon — identifies "this outbreak area"
  const message: string | undefined = body?.message;
  const snapshot: Snapshot | undefined = body?.snapshot;

  if (!key || !message || !snapshot || ![snapshot.confirmed, snapshot.suspected, snapshot.clear, snapshot.scans].every(Number.isFinite)) {
    return NextResponse.json({ error: "key, message and a valid snapshot are required" }, { status: 400 });
  }

  await ensureSchema();
  const rows = (await sql`
    SELECT sent_at, confirmed, suspected, clear_count, scans FROM alert_sends WHERE area_key = ${key}
  `) as unknown as AlertSendRow[];
  const existing = rows[0];

  if (unchanged(existing, snapshot)) {
    return NextResponse.json(
      { error: "Nothing has changed in this area since the last alert — no new activity to warn about yet.", blocked: true },
      { status: 429 }
    );
  }

  const sentAt = Date.now();
  await sql`INSERT INTO live_alerts (area_key, message, sent_at) VALUES (${key}, ${message}, ${sentAt})`;

  await sql`
    INSERT INTO alert_sends (area_key, sent_at, confirmed, suspected, clear_count, scans)
    VALUES (${key}, ${sentAt}, ${snapshot.confirmed}, ${snapshot.suspected}, ${snapshot.clear}, ${snapshot.scans})
    ON CONFLICT (area_key) DO UPDATE SET
      sent_at = excluded.sent_at, confirmed = excluded.confirmed, suspected = excluded.suspected,
      clear_count = excluded.clear_count, scans = excluded.scans
  `;

  return NextResponse.json({ ok: true, sentAt });
}
