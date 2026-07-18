"use client";

import Basil from "./Basil";
import Bones from "./Bones";
import type { SniffResult } from "@/lib/types";

const CONFIDENCE_LABEL = {
  high: "Basil is confident about this one.",
  medium: "Basil is fairly sure, but keep your wits about you.",
  low: "Basil isn't certain — treat this as a first opinion, not a final one.",
};

export default function Result({
  result,
  onReset,
}: {
  result: SniffResult;
  onReset: () => void;
}) {
  const danger = result.score >= 7;
  const warn = result.score >= 4 && result.score < 7;
  const mood = danger ? "alarmed" : warn ? "neutral" : "happy";
  const bg = danger ? "bg-danger-bg" : warn ? "bg-warn-bg" : "bg-safe-bg";
  const border = danger ? "border-danger/30" : warn ? "border-warn/30" : "border-safe/30";
  const headline = danger ? "Looks like a scam" : warn ? "Be careful with this" : "Looks okay";
  const headlineColor = danger ? "text-danger" : warn ? "text-warn" : "text-safe";

  return (
    <section aria-label="Basil's verdict" className="fade-up">
      <div className={`rounded-3xl border-2 ${border} ${bg} p-6 sm:p-10`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Basil mood={mood} size={130} className="shrink-0" />
          <div className="text-center sm:text-left">
            <p className="text-lg font-bold text-soft uppercase tracking-wide">
              🐶 Basil&apos;s Verdict
            </p>
            <h2 className={`text-3xl sm:text-4xl font-black mt-1 ${headlineColor}`}>
              {headline}
            </h2>
            <p className="text-2xl font-bold mt-2 text-ink">
              &ldquo;{result.verdict}&rdquo;
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Bones score={result.score} />
        </div>

        <p className="mt-6 text-xl leading-relaxed text-ink">{result.summary}</p>
        <p className="mt-2 text-lg text-soft">{CONFIDENCE_LABEL[result.confidence]}</p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border-2 border-line bg-card p-6 sm:p-8">
          <h3 className="text-2xl font-extrabold text-ink">Why?</h3>
          <ul className="mt-4 space-y-4">
            {result.reasons.map((r, i) => (
              <li key={i} className="flex gap-3 text-lg leading-relaxed text-ink">
                <span aria-hidden="true" className="shrink-0 mt-0.5">
                  {danger || warn ? "🚩" : "✅"}
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border-2 border-line bg-card p-6 sm:p-8">
          <h3 className="text-2xl font-extrabold text-ink">What should I do?</h3>
          <ol className="mt-4 space-y-4">
            {result.actions.map((a, i) => (
              <li key={i} className="flex gap-3 text-lg leading-relaxed text-ink">
                <span
                  aria-hidden="true"
                  className="shrink-0 w-8 h-8 rounded-full bg-basil text-white font-extrabold flex items-center justify-center text-base"
                >
                  {i + 1}
                </span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="min-h-14 px-8 py-4 rounded-2xl bg-ink text-white text-xl font-extrabold hover:bg-soft transition-colors"
        >
          🐶 Sniff something else
        </button>
      </div>
    </section>
  );
}
