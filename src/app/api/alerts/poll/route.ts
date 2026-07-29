import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

const MAX_RESULTS = 20;

interface LiveAlertRow {
  id: number;
  area_key: string;
  message: string;
  sent_at: number;
}

// GET /api/alerts/poll?since=<epoch ms> — the real delivery mechanism behind
// AlertToast now that Vercel's serverless model rules out the old in-memory
// SSE broadcast (see the comment in ../route.ts). Each open tab polls this
// every few seconds with the timestamp of the last alert it already saw;
// this returns anything newer. A few seconds of latency instead of an
// instant push, but it's real delivery against a real shared table, not a
// simulated notification.
export async function GET(req: NextRequest) {
  const sinceParam = req.nextUrl.searchParams.get("since");
  const since = sinceParam === null ? Date.now() : Number(sinceParam);
  if (!Number.isFinite(since)) {
    return NextResponse.json({ error: "since must be a number" }, { status: 400 });
  }

  await ensureSchema();
  const rows = (await sql`
    SELECT id, area_key, message, sent_at FROM live_alerts
    WHERE sent_at > ${since}
    ORDER BY sent_at ASC
    LIMIT ${MAX_RESULTS}
  `) as unknown as LiveAlertRow[];

  return NextResponse.json({
    alerts: rows.map((r) => ({ id: r.id, areaKey: r.area_key, message: r.message, sentAt: r.sent_at })),
    polledAt: Date.now(),
  });
}
