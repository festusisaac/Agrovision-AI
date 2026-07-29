import { neon } from "@neondatabase/serverless";

// Village Watch is the only feature that genuinely needs data shared across
// devices, so it's the only part of the app backed by a real hosted
// database instead of localStorage. Vercel's serverless functions have an
// ephemeral, non-shared filesystem — a local SQLite file would silently
// reset on every request in production — so this talks to a real Postgres
// database (Neon) over Neon's HTTP driver, which needs no persistent
// connection and works from a stateless function.
type NeonClient = ReturnType<typeof neon>;

let client: NeonClient | null = null;

// Lazy on purpose: throwing here only when a route actually queries the
// database (not at module import time) keeps `next build` working even
// before DATABASE_URL is configured — Next.js loads every route module to
// collect build metadata, which would otherwise fail the whole build.
function getClient(): NeonClient {
  if (client) return client;
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL (or POSTGRES_URL) is not set. Connect a Postgres database in the Vercel dashboard " +
        "(Storage -> Create Database -> Postgres) and run `vercel env pull .env.local` to get it locally."
    );
  }
  client = neon(connectionString);
  return client;
}

export function sql(strings: TemplateStringsArray, ...values: unknown[]): Promise<Record<string, unknown>[]> {
  return getClient()(strings, ...values) as Promise<Record<string, unknown>[]>;
}

let schemaReady: Promise<void> | null = null;

/** Idempotent; memoized per warm function instance so repeat calls are free. */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS scans (
          id SERIAL PRIMARY KEY,
          device_id TEXT NOT NULL,
          lat DOUBLE PRECISION NOT NULL,
          lon DOUBLE PRECISION NOT NULL,
          crop TEXT NOT NULL,
          status TEXT NOT NULL,
          label TEXT NOT NULL,
          created_at DOUBLE PRECISION NOT NULL
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans (created_at)`;

      await sql`
        CREATE TABLE IF NOT EXISTS alert_sends (
          area_key TEXT PRIMARY KEY,
          sent_at DOUBLE PRECISION NOT NULL,
          confirmed INTEGER NOT NULL DEFAULT 0,
          suspected INTEGER NOT NULL DEFAULT 0,
          clear_count INTEGER NOT NULL DEFAULT 0,
          scans INTEGER NOT NULL DEFAULT 0
        )
      `;

      // Replaces the old in-memory pub/sub (alertBus.ts), which couldn't
      // work across Vercel's separate serverless instances — open tabs poll
      // this table for anything newer than the last message they saw.
      await sql`
        CREATE TABLE IF NOT EXISTS live_alerts (
          id SERIAL PRIMARY KEY,
          area_key TEXT NOT NULL,
          message TEXT NOT NULL,
          sent_at DOUBLE PRECISION NOT NULL
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_live_alerts_sent_at ON live_alerts (sent_at)`;
    })();
  }
  return schemaReady;
}
