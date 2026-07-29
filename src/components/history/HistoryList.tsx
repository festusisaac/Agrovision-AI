"use client";

import { useSyncExternalStore } from "react";
import { CheckCircle2, ThumbsDown, ThumbsUp, Trash2, XCircle } from "lucide-react";
import {
  clearHistory,
  getHistorySnapshot,
  getServerHistorySnapshot,
  markHistoryEntryResolved,
  subscribeHistory,
} from "@/lib/storage";
import { useAppPrefs } from "@/lib/appPrefs";

export default function HistoryList() {
  const { t } = useAppPrefs();
  const entries = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getServerHistorySnapshot);

  function handleClear() {
    if (!confirm(t.confirmClearHistory)) return;
    clearHistory();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/70">{t.diagnosesSavedNote}</p>
        {entries.length > 0 && (
          <button
            onClick={handleClear}
            className="inline-flex shrink-0 items-center gap-1 text-sm text-red-400 hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" /> {t.clearAll}
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="mt-8 text-sm text-foreground/50">{t.noHistoryYet}</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {entries.map((entry) => {
            const askResolution = entry.diagnosis && entry.diagnosis.type !== "healthy" && entry.resolved === undefined;
            return (
              <li
                key={entry.id}
                className="flex gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                {entry.imageDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.imageDataUrl}
                    alt={entry.title}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{entry.title}</p>
                  {entry.notes && <p className="text-sm text-foreground/60">{entry.notes}</p>}
                  <p className="mt-1 text-xs text-foreground/40">{new Date(entry.createdAt).toLocaleString()}</p>

                  {askResolution && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-foreground/60">{t.didTreatmentWork}</span>
                      <button
                        onClick={() => markHistoryEntryResolved(entry.id, true)}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-1 hover:bg-[var(--color-surface-muted)]"
                      >
                        <ThumbsUp className="h-3 w-3" /> {t.yes}
                      </button>
                      <button
                        onClick={() => markHistoryEntryResolved(entry.id, false)}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-1 hover:bg-[var(--color-surface-muted)]"
                      >
                        <ThumbsDown className="h-3 w-3" /> {t.notYetLabel}
                      </button>
                    </div>
                  )}
                  {entry.resolved === true && (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-leaf">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {t.resolvedLabel}
                    </p>
                  )}
                  {entry.resolved === false && (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-warn">
                      <XCircle className="h-3.5 w-3.5" /> {t.stillIssueLabel}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
