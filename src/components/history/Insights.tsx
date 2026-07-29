"use client";

import { useSyncExternalStore } from "react";
import { Bug, CheckCircle2, HeartPulse, ScanLine, Sprout, type LucideIcon } from "lucide-react";
import { getHistorySnapshot, getServerHistorySnapshot, subscribeHistory } from "@/lib/storage";
import { useAppPrefs } from "@/lib/appPrefs";

const SEVERITY_SCORE: Record<string, number> = { low: 75, moderate: 50, high: 25 };

function StatTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf/15 text-leaf">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="text-xs text-foreground/60">{label}</p>
    </div>
  );
}

function RankedList({
  icon: Icon,
  title,
  items,
  emptyLabel,
}: {
  icon: LucideIcon;
  title: string;
  items: [string, number][];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold">
        <Icon className="h-4 w-4 text-leaf" /> {title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-foreground/50">{emptyLabel}</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm">
          {items.map(([label, count]) => (
            <li key={label} className="flex items-center justify-between">
              <span>{label}</span>
              <span className="text-foreground/50">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Insights() {
  const { t } = useAppPrefs();
  const entries = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getServerHistorySnapshot);

  if (entries.length === 0) {
    return <p className="mt-8 text-sm text-foreground/50">{t.noScansInsights}</p>;
  }

  const diagnosisEntries = entries.filter((e) => e.diagnosis);

  const now = new Date();
  const scansThisMonth = entries.filter((e) => {
    const d = new Date(e.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const healthScores = diagnosisEntries
    .map((e) => {
      const d = e.diagnosis!;
      if (d.type === "healthy") return 100;
      return SEVERITY_SCORE[d.severity] ?? null;
    })
    .filter((v): v is number => v !== null);
  const avgHealth = healthScores.length
    ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
    : null;

  const rated = entries.filter((e) => e.resolved !== undefined);
  const successRate = rated.length
    ? Math.round((rated.filter((e) => e.resolved).length / rated.length) * 100)
    : null;

  const issueCounts = new Map<string, number>();
  diagnosisEntries.forEach((e) => {
    const d = e.diagnosis!;
    if (d.type === "disease" || d.type === "pest") {
      issueCounts.set(d.label, (issueCounts.get(d.label) ?? 0) + 1);
    }
  });
  const topIssues = [...issueCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);

  const cropCounts = new Map<string, number>();
  diagnosisEntries.forEach((e) => {
    const d = e.diagnosis!;
    if (d.crop && d.crop !== "Unknown" && d.type !== "healthy") {
      cropCounts.set(d.crop, (cropCounts.get(d.crop) ?? 0) + 1);
    }
  });
  const topCrops = [...cropCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile icon={ScanLine} label={t.scansThisMonth} value={String(scansThisMonth)} />
        <StatTile icon={HeartPulse} label={t.avgCropHealth} value={avgHealth !== null ? `${avgHealth}%` : "—"} />
        <StatTile
          icon={CheckCircle2}
          label={t.treatmentSuccessRate}
          value={successRate !== null ? `${successRate}%` : t.notEnoughData}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <RankedList icon={Bug} title={t.mostCommonIssues} items={topIssues} emptyLabel={t.noIssuesRecorded} />
        <RankedList icon={Sprout} title={t.mostAffectedCrops} items={topCrops} emptyLabel={t.cropNotIdentified} />
      </div>

      {rated.length === 0 && <p className="mt-3 text-xs text-foreground/50">{t.tipAnswerQuestion}</p>}
    </div>
  );
}
