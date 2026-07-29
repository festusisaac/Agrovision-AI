"use client";

import { useEffect } from "react";
import Link from "next/link";

// Root-level boundary for everything outside /app/* (the marketing page,
// onboarding) — without this, a render error there also unmounts silently
// with no visible feedback, same failure mode as the one fixed in
// src/app/app/error.tsx.
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[root] render error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="font-heading text-[20px] font-semibold">Something went wrong</div>
      <p className="max-w-[46ch] text-[14px] leading-[1.6] text-fg-dim">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="rounded-xl bg-leaf px-5 py-2.5 font-medium text-[14px] text-[#0A0F0C]">
          Try again
        </button>
        <Link href="/" className="rounded-xl border border-[var(--color-border)] px-5 py-2.5 font-medium text-[14px] text-fg-dim">
          Back to home
        </Link>
      </div>
    </div>
  );
}
