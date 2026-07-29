"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_LANGUAGES, type AppLanguage } from "@/lib/i18n";
import { useAppPrefs } from "@/lib/appPrefs";
import { getProfileSnapshot, getServerProfileSnapshot, subscribeProfile } from "@/lib/profile";

export const NAV_ITEMS = [
  { href: "/app/dashboard", key: "navDash" as const },
  { href: "/app/scan", key: "navScan" as const },
  { href: "/app/diagnosis", key: "navDiag" as const },
  { href: "/app/watch", key: "navWatch" as const },
  { href: "/app/assistant", key: "navAsst" as const },
  { href: "/app/history", key: "navHist" as const },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[252px] shrink-0 flex-col border-r border-[var(--color-border)] bg-background-panel p-4 lg:flex">
      <SidebarContent />
    </aside>
  );
}

/** Shared between the desktop sidebar and the mobile slide-over drawer (see MobileNav.tsx) so nav items, language and profile controls never drift out of sync between the two. */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useAppPrefs();
  const profile = useSyncExternalStore(subscribeProfile, getProfileSnapshot, getServerProfileSnapshot);

  return (
    <>
      <Link href="/" onClick={onNavigate} className="flex items-center gap-2.5 px-2 pb-5">
        <Image src="/images/logo.png" alt="AgroVision AI" width={32} height={32} className="object-contain" />
        <div>
          <div className="font-heading text-[15px] font-semibold tracking-[-0.01em]">AgroVision AI</div>
          <div className="font-mono text-[9.5px] tracking-[0.08em] text-fg-faint">
            {(profile?.farm || t.myFarmFallback).toUpperCase()}
          </div>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`rounded-[11px] px-3.5 py-[11px] text-left text-[14px] font-medium transition-colors ${
                active ? "bg-leaf text-[#0A0F0C]" : "text-fg-dim hover:bg-[var(--color-surface)]"
              }`}
            >
              {t[item.key]}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="flex flex-col gap-2.5 border-t border-[var(--color-border)] px-2 pt-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as AppLanguage)}
          aria-label="Language"
          className="flex-1 rounded-[9px] border px-2 py-2 font-mono text-[11px]"
          style={{ background: "rgba(242,240,230,0.06)", borderColor: "rgba(242,240,230,0.14)" }}
        >
          {APP_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="text-black">
              {l.label}
            </option>
          ))}
        </select>

        <Link href="/onboarding?step=1" onClick={onNavigate} className="px-0 py-1.5 text-left text-[12.5px] text-fg-faint hover:text-fg-dim">
          {t.editFarmProfile}
        </Link>
        <Link href="/" onClick={onNavigate} className="px-0 py-1.5 text-left text-[12.5px] text-fg-faint hover:text-fg-dim">
          {t.backToSite}
        </Link>
      </div>
    </>
  );
}
