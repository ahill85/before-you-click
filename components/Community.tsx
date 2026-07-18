"use client";

import { useEffect, useState } from "react";
import {
  todaysMostSniffed,
  fastestRising,
  scamsStoppedToday,
  basilSuccessRate,
  RECENT_SEEDS,
  type TrendingItem,
} from "@/lib/daily";
import { readRecent, timeAgo, type RecentSniff } from "@/lib/recent";

/**
 * Community sections. Rendered client-side after mount so the
 * date-seeded numbers never mismatch between server and browser.
 */
export default function Community({ refreshKey }: { refreshKey: number }) {
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [rising, setRising] = useState<(TrendingItem & { risePct: number }) | null>(null);
  const [stopped, setStopped] = useState(0);
  const [rate, setRate] = useState("");
  const [recent, setRecent] = useState<RecentSniff[]>([]);

  useEffect(() => {
    setTrending(todaysMostSniffed());
    setRising(fastestRising());
    setStopped(scamsStoppedToday());
    setRate(basilSuccessRate());
    setRecent(readRecent());
  }, [refreshKey]);

  if (trending.length === 0) return null;

  return (
    <div className="space-y-10">
      {/* Today's Most Sniffed */}
      <section aria-labelledby="trending-heading">
        <h2 id="trending-heading" className="text-3xl sm:text-4xl font-black text-ink text-center">
          🔥 Today&apos;s Most Sniffed
        </h2>
        <p className="mt-2 text-center text-lg text-soft">
          What everyone&apos;s asking Basil about today.
        </p>
        <ol className="mt-5 space-y-3 max-w-2xl mx-auto">
          {trending.map((item, i) => (
            <li
              key={item.title}
              className="flex items-center gap-4 rounded-2xl border-2 border-line bg-card p-4"
            >
              <span className="text-2xl font-black text-soft w-8 text-center" aria-hidden="true">
                {i + 1}
              </span>
              <span className="text-3xl" aria-hidden="true">{item.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xl font-extrabold text-ink">{item.title}</p>
                <p className="text-base text-soft">{item.tag}</p>
              </div>
              <p className="text-lg font-bold text-soft whitespace-nowrap">
                {item.sniffs.toLocaleString()} <span aria-hidden="true">🐽</span>
                <span className="sr-only">sniffs</span>
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Stats row */}
      <section aria-label="Community statistics" className="grid gap-3 sm:grid-cols-3 max-w-3xl mx-auto">
        {rising && (
          <div className="rounded-2xl border-2 border-line bg-card p-5 text-center">
            <p className="text-lg font-bold text-soft">📈 Fastest Rising Scam</p>
            <p className="mt-2 text-xl font-extrabold text-ink">{rising.title}</p>
            <p className="mt-1 text-2xl font-black text-danger">↑ {rising.risePct}%</p>
          </div>
        )}
        <div className="rounded-2xl border-2 border-line bg-card p-5 text-center">
          <p className="text-lg font-bold text-soft">🛡️ Scams Stopped Today</p>
          <p className="mt-2 text-4xl font-black text-safe">{stopped.toLocaleString()}</p>
          <p className="mt-1 text-base text-soft">and counting</p>
        </div>
        <div className="rounded-2xl border-2 border-line bg-card p-5 text-center">
          <p className="text-lg font-bold text-soft">🐶 Basil&apos;s Success Rate</p>
          <p className="mt-2 text-4xl font-black text-basil">{rate}%</p>
          <p className="mt-1 text-base text-soft">good boy</p>
        </div>
      </section>

      {/* Recently Sniffed */}
      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="text-3xl sm:text-4xl font-black text-ink text-center">
          Recently Sniffed
        </h2>
        <p className="mt-2 text-center text-lg text-soft">
          Always anonymous. Basil never repeats what he reads.
        </p>
        <ul className="mt-5 flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {recent.map((r, i) => (
            <li
              key={`${r.at}-${i}`}
              className="rounded-full border-2 border-line bg-white px-5 py-2.5 text-lg font-bold text-ink"
            >
              {r.score >= 7 ? "🚨" : r.score >= 4 ? "🤔" : "✅"} {r.title}
              <span className="text-soft font-semibold"> · {timeAgo(r.at)}</span>
            </li>
          ))}
          {recent.length < 4 &&
            RECENT_SEEDS.slice(0, 6 - recent.length).map((title) => (
              <li
                key={title}
                className="rounded-full border-2 border-line bg-white px-5 py-2.5 text-lg font-bold text-soft"
              >
                🐽 {title}
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
