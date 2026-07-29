"use client";

import { useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAppPrefs } from "@/lib/appPrefs";
import { getProfileSnapshot, getServerProfileSnapshot, subscribeProfile } from "@/lib/profile";
import { SidebarContent } from "./Sidebar";

// Below the `lg` breakpoint the desktop Sidebar hides itself entirely (see
// Sidebar.tsx) — this sticky bar + slide-over drawer is the only nav that
// takes its place, reusing the exact same SidebarContent so nav items never
// drift out of sync between the two.
export default function MobileNav() {
  const { t } = useAppPrefs();
  const profile = useSyncExternalStore(subscribeProfile, getProfileSnapshot, getServerProfileSnapshot);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Reset during render rather than in an effect (React's recommended
  // pattern for "clear state when a prop changes") so navigating closes the
  // drawer even when it wasn't a SidebarContent link that triggered it (e.g.
  // browser back/forward).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-background-panel px-4 py-3 lg:hidden">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Image src="/images/logo.png" alt="AgroVision AI" width={28} height={28} className="object-contain" />
          <div className="min-w-0">
            <div className="font-heading text-[14px] font-semibold tracking-[-0.01em]">AgroVision AI</div>
            <div className="truncate font-mono text-[9px] tracking-[0.08em] text-fg-faint">
              {(profile?.farm || t.myFarmFallback).toUpperCase()}
            </div>
          </div>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-[var(--color-border)] text-fg-dim"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-[85vw] max-w-[300px] flex-col overflow-y-auto border-r border-[var(--color-border)] bg-background-panel p-4 transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="mb-2 flex h-8 w-8 shrink-0 items-center justify-center self-end rounded-[9px] border border-[var(--color-border)] text-fg-dim"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent onNavigate={() => setOpen(false)} />
      </aside>
    </>
  );
}
