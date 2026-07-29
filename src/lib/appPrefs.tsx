"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { APP_STRINGS, type AppLanguage, type AppStrings } from "./i18n";

const LANG_KEY = "agrovision:appLang";
const EDGE_KEY = "agrovision:appEdge";

const listeners = new Set<() => void>();
function emitChange() {
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let cachedLangRaw: string | null = null;
let cachedLang: AppLanguage = "en";

function getLanguageSnapshot(): AppLanguage {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(LANG_KEY);
  } catch {
    // localStorage unavailable — fall through to the default
  }
  if (raw !== cachedLangRaw) {
    cachedLangRaw = raw;
    cachedLang = raw && raw in APP_STRINGS ? (raw as AppLanguage) : "en";
  }
  return cachedLang;
}

function getServerLanguageSnapshot(): AppLanguage {
  return "en";
}

function setLanguage(lang: AppLanguage) {
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    // best-effort
  }
  emitChange();
}

let cachedEdgeRaw: string | null = null;
// The app is cloud-only for now (no on-device toggle exposed in the UI —
// see Sidebar.tsx), so default to online/cloud inference unless a prior
// explicit preference is somehow still stored.
let cachedEdge = false;

function getEdgeSnapshot(): boolean {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(EDGE_KEY);
  } catch {
    // localStorage unavailable — fall through to the default
  }
  if (raw !== cachedEdgeRaw) {
    cachedEdgeRaw = raw;
    cachedEdge = raw === null ? false : raw === "true";
  }
  return cachedEdge;
}

function getServerEdgeSnapshot(): boolean {
  return false;
}

function setEdge(next: boolean) {
  try {
    window.localStorage.setItem(EDGE_KEY, String(next));
  } catch {
    // best-effort
  }
  emitChange();
}

interface AppPrefsContextValue {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  edge: boolean;
  setEdge: (edge: boolean) => void;
  t: AppStrings;
  engineLabel: string;
}

const AppPrefsContext = createContext<AppPrefsContextValue | null>(null);

export function AppPrefsProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, getLanguageSnapshot, getServerLanguageSnapshot);
  const edge = useSyncExternalStore(subscribe, getEdgeSnapshot, getServerEdgeSnapshot);

  const value = useMemo<AppPrefsContextValue>(
    () => ({
      language,
      setLanguage,
      edge,
      setEdge,
      t: APP_STRINGS[language],
      engineLabel: edge ? "Gemma 4 · on-device via Ollama" : "Gemma 4 · cloud inference",
    }),
    [language, edge]
  );

  return <AppPrefsContext.Provider value={value}>{children}</AppPrefsContext.Provider>;
}

export function useAppPrefs(): AppPrefsContextValue {
  const ctx = useContext(AppPrefsContext);
  if (!ctx) throw new Error("useAppPrefs must be used within AppPrefsProvider");
  return ctx;
}
