"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppPrefsProvider } from "@/lib/appPrefs";
import { hasProfile } from "@/lib/profile";
import Sidebar from "@/components/app/Sidebar";
import MobileNav from "@/components/app/MobileNav";
import AlertToast from "@/components/app/AlertToast";
import UssdPromoCard from "@/components/app/UssdPromoCard";

const REDIRECT_FALLBACK_MS = 2500;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [showFallbackLink, setShowFallbackLink] = useState(false);

  useEffect(() => {
    if (hasProfile()) {
      Promise.resolve().then(() => setReady(true));
      return;
    }
    // A hard navigation here, not the client-side router — this redirect is
    // the one thing that must never silently get stuck, and a full
    // navigation is the most reliable way to leave this page across browsers.
    window.location.href = "/onboarding";
    // Safety valve: if for any reason the navigation above doesn't go
    // through, don't leave the visitor staring at a spinner forever with no
    // way out — surface a real link after a short wait.
    const timer = setTimeout(() => setShowFallbackLink(true), REDIRECT_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-fg-dim/30 border-t-leaf" />
        {showFallbackLink && (
          <Link href="/onboarding" className="text-[13px] text-leaf underline">
            Taking a while — tap here to continue
          </Link>
        )}
      </div>
    );
  }

  return (
    <AppPrefsProvider>
      <div className="flex min-h-screen flex-col bg-background lg:flex-row">
        <Sidebar />
        <MobileNav />
        <main className="min-w-0 flex-1 px-4 pt-6 pb-16 sm:px-6 lg:px-11 lg:pt-[34px] lg:pb-[90px]">{children}</main>
      </div>
      <AlertToast />
      <UssdPromoCard />
    </AppPrefsProvider>
  );
}
