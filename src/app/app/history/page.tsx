"use client";

import { useState, useSyncExternalStore } from "react";
import { getHistorySnapshot, getServerHistorySnapshot, subscribeHistory } from "@/lib/storage";
import { useAppPrefs } from "@/lib/appPrefs";
import TodayReport from "@/components/history/TodayReport";
import Insights from "@/components/history/Insights";
import HistoryList from "@/components/history/HistoryList";

type TabId = "timeline" | "today" | "insights";

export default function HistoryPage() {
  const { t } = useAppPrefs();
  const [tab, setTab] = useState<TabId>("timeline");
  const history = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getServerHistorySnapshot);

  const diagnosisCount = history.filter((e) => e.diagnosis).length;
  const tabs: { id: TabId; label: string }[] = [
    { id: "timeline", label: t.tabTimeline },
    { id: "today", label: t.tabToday },
    { id: "insights", label: t.tabInsights },
  ];

  return (
    <div className="animate-agv-rise max-w-[1100px]">
      <div className="font-mono text-[10.5px] tracking-[0.12em] text-warn uppercase">{t.storedOnDevice}</div>
      <h1 className="font-heading mt-2.5 text-[38px] font-semibold tracking-[-0.03em]">{t.historyTitle}</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
              tab === tb.id ? "bg-leaf text-[#0A0F0C]" : "border border-[var(--color-border)] text-fg-muted"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="mt-7">
        {tab === "timeline" && (
          <>
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-[18px]">
                <div className="text-[11.5px] text-fg-faint">{t.eventsLogged}</div>
                <div className="font-heading mt-1.5 text-[26px] font-semibold">{history.length}</div>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-[18px]">
                <div className="text-[11.5px] text-fg-faint">{t.diagnosesLogged}</div>
                <div className="font-heading mt-1.5 text-[26px] font-semibold">{diagnosisCount}</div>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-[18px]">
                <div className="text-[11.5px] text-fg-faint">{t.syncedToCloud}</div>
                <div className="font-heading mt-1.5 text-[26px] font-semibold">0</div>
                <div className="mt-1 text-[11.5px] text-leaf">{t.offlineFirstNote}</div>
              </div>
            </div>
            <HistoryList />
          </>
        )}

        {tab === "today" && <TodayReport />}
        {tab === "insights" && <Insights />}
      </div>
    </div>
  );
}
