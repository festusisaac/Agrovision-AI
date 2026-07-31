"use client";

import { useEffect, useState } from "react";
import { Phone, X } from "lucide-react";

const SESSION_KEY = "agrovision:ussdPromoDismissed";

// The real Africa's Talking sandbox shared code this app's USSD webhook
// (src/app/api/ussd/route.ts) is actually wired to — see README.md's
// "USSD access" section. Update this if the sandbox channel's code changes.
const USSD_CODE = "*384*4130#";

// Africa's Talking's public USSD web simulator — dials into whichever
// sandbox app/service code you're logged into, so this only shows the real
// flow for whoever owns that sandbox account (see README.md's USSD section
// for the login-required caveat).
const SIMULATOR_URL = "https://developers.africastalking.com/simulator";

const STEPS = ["Dial the code above", "Pick your language", "Ask a question or check outbreaks near you"];

/**
 * A small, dismissible dashboard card surfacing the USSD entry point — easy
 * to miss otherwise since it has no nav link (a farmer reaches it by
 * dialing, not clicking). Dismissal is session-only (sessionStorage, not
 * localStorage) so it reappears next visit rather than being gone forever.
 */
export default function UssdPromoCard() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {
      // sessionStorage unavailable — just show it, no harm in that
    }
    Promise.resolve().then(() => setVisible(true));
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // best-effort
    }
  }

  if (!visible) return null;

  return (
    <div
      className="fixed right-5 bottom-5 z-20 w-[300px] max-w-[calc(100vw-2.5rem)] rounded-2xl border p-4 shadow-lg"
      style={{ borderColor: "rgba(163,230,53,0.28)", background: "#0A0F0C" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-leaf uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-leaf" />
          No internet? 
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 text-fg-faint hover:text-fg-dim">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <Phone className="h-3.5 w-3.5 text-leaf" />
        <div className="font-heading text-[15px] font-semibold">Ask by USSD — no data needed</div>
      </div>
      <p className="mt-1.5 text-[12.5px] leading-[1.5] text-fg-dim">
        Dial <strong className="text-fg-muted">{USSD_CODE}</strong> and ask Gemma a farming
        question or check nearby outbreaks — live on the call, no internet needed.
      </p>

      {expanded && (
        <ol className="mt-2.5 flex flex-col gap-1 pl-4 text-[12px] leading-[1.5] text-fg-dim" style={{ listStyle: "decimal" }}>
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}

      <a
        href={SIMULATOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center rounded-[10px] bg-leaf py-2.5 text-[13px] font-medium text-[#0A0F0C] transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        Try it in the simulator ↗
      </a>

      <div className="mt-2.5 flex items-center justify-between">
        <button onClick={() => setExpanded((e) => !e)} className="text-[12px] font-medium text-leaf hover:underline">
          {expanded ? "Hide" : "See how it works"}
        </button>
        <span
          className="rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.08em] text-fg-faint uppercase"
          style={{ borderColor: "rgba(242,240,230,0.16)" }}
        >
          Sandbox
        </span>
      </div>
    </div>
  );
}
