"use client";

import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";

interface ToastAlert {
  id: string;
  message: string;
}

const AUTO_DISMISS_MS = 20_000;
const POLL_INTERVAL_MS = 4_000;

interface PolledAlert {
  id: number;
  message: string;
  sentAt: number;
}

/**
 * Mounted once in the /app shell layout so any page shows a real
 * notification when someone sends a Village Watch alert. Polls a real
 * shared table (see /api/alerts/poll) rather than holding an SSE connection
 * open — Vercel routes requests to separate, short-lived serverless
 * instances, so an in-memory push from one instance could never reach a
 * listener on another. Polling trades instant delivery for a few seconds of
 * latency, but it's real delivery against real state either way.
 */
export default function AlertToast() {
  const [alerts, setAlerts] = useState<ToastAlert[]>([]);

  useEffect(() => {
    let cancelled = false;
    let since = Date.now();

    async function poll() {
      try {
        const res = await fetch(`/api/alerts/poll?since=${since}`);
        if (!res.ok || cancelled) return;
        const data: { alerts?: PolledAlert[] } = await res.json();
        for (const a of data.alerts ?? []) {
          if (a.sentAt > since) since = a.sentAt;
          const id = `${a.id}`;
          setAlerts((prev) => (prev.some((x) => x.id === id) ? prev : [...prev, { id, message: a.message }]));
          setTimeout(() => setAlerts((prev) => prev.filter((x) => x.id !== id)), AUTO_DISMISS_MS);
        }
      } catch {
        // best-effort — the next interval tick tries again
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 z-[100] flex w-auto flex-col gap-2.5 sm:top-5 sm:right-5 sm:left-auto sm:w-[340px]">
      {alerts.map((a) => (
        <div
          key={a.id}
          className="animate-agv-rise rounded-2xl border p-4 shadow-lg"
          style={{ borderColor: "rgba(232,120,90,0.35)", background: "#0A0F0C" }}
        >
          <div className="flex items-start gap-2.5">
            <Megaphone className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "oklch(0.72 0.19 28)" }} />
            <p className="flex-1 text-[13px] leading-[1.5] text-fg-muted">{a.message}</p>
            <button
              onClick={() => setAlerts((prev) => prev.filter((x) => x.id !== a.id))}
              className="shrink-0 text-fg-faint hover:text-fg-dim"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
