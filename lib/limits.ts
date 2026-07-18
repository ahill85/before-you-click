"use client";

/** Daily scan allowance, tracked locally. No accounts, no servers. */

export const DAILY_SCANS = 10;
const KEY = "basil-scans";

interface ScanState {
  date: string;
  used: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): ScanState {
  if (typeof window === "undefined") return { date: todayKey(), used: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const state = JSON.parse(raw) as ScanState;
      if (state.date === todayKey()) return state;
    }
  } catch {
    /* ignore */
  }
  return { date: todayKey(), used: 0 };
}

export function scansLeft(): number {
  return Math.max(0, DAILY_SCANS - read().used);
}

export function useOneScan(): number {
  const state = read();
  const next = { date: todayKey(), used: state.used + 1 };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private browsing — just allow it */
  }
  return Math.max(0, DAILY_SCANS - next.used);
}
