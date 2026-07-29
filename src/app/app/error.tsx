"use client";

import { useEffect } from "react";
import Link from "next/link";

// Without this boundary, any client-side render/hydration error anywhere
// under /app/* unmounts the whole tree and shows nothing — visible on some
// mobile browsers as a silent blank page with no way to tell "still
// loading" from "actually broken." This at least surfaces the error and
// gives a way back in instead of a dead end.
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[/app] render error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="font-heading text-[20px] font-semibold">Something went wrong loading this page</div>
      <p className="max-w-[46ch] text-[14px] leading-[1.6] text-fg-dim">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="rounded-xl bg-leaf px-5 py-2.5 font-medium text-[14px] text-[#0A0F0C]">
          Try again
        </button>
        <Link href="/app/dashboard" className="rounded-xl border border-[var(--color-border)] px-5 py-2.5 font-medium text-[14px] text-fg-dim">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
