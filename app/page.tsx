"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Basil from "@/components/Basil";
import SniffBox from "@/components/SniffBox";
import LoadingBasil from "@/components/LoadingBasil";
import Result from "@/components/Result";
import Community from "@/components/Community";
import ScansToast from "@/components/ScansToast";
import { scansLeft as getScansLeft, useOneScan } from "@/lib/limits";
import { addRecent } from "@/lib/recent";
import { scansLeftMessage } from "@/lib/verdicts";
import { sniffApiUrl } from "@/lib/api";
import type { SniffResult } from "@/lib/types";

type Phase = "idle" | "sniffing" | "done";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<SniffResult | null>(null);
  const [scans, setScans] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScans(getScansLeft());
  }, []);

  const dismissToast = useCallback(() => setToastOpen(false), []);

  async function sniff(text: string) {
    setPhase("sniffing");
    setToastOpen(false);
    const started = Date.now();
    let data: SniffResult;
    try {
      const res = await fetch(sniffApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("bad response");
      data = (await res.json()) as SniffResult;
    } catch {
      data = {
        score: 0,
        confidence: "low",
        verdict: "My nose glitched. Not your fault.",
        summary: "Something went wrong on our side — Basil couldn't finish the sniff. Please try again in a moment.",
        reasons: ["The checker had a hiccup. This says nothing about your message."],
        actions: ["Try again in a minute.", "If it keeps failing, treat the message with caution until you can check it."],
        source: "nose",
      };
    }

    // Let Basil sniff for at least a moment — instant answers feel untrustworthy.
    const elapsed = Date.now() - started;
    if (elapsed < 1800) await new Promise((r) => setTimeout(r, 1800 - elapsed));

    const left = useOneScan();
    setScans(left);
    addRecent(text, data.score);
    setRefreshKey((k) => k + 1);
    setResult(data);
    setPhase("done");
    setToastOpen(true);
  }

  useEffect(() => {
    if (phase === "done") resultRef.current?.focus();
  }, [phase]);

  return (
    <main
      className={`mx-auto max-w-4xl px-4 sm:px-6 ${
        phase === "idle"
          ? "pb-8 sm:pb-20"
          : "pb-20"
      }`}
    >
      <ScansToast scansLeft={scans} visible={toastOpen} onDone={dismissToast} />

      {scans <= 0 && (
        <div
          role="status"
          className="sticky top-0 z-30 -mx-4 sm:-mx-6 mb-2 border-b-2 border-warn/30 bg-warn-bg px-4 py-3 text-center text-lg font-bold text-warn"
        >
          {scansLeftMessage(0)}
        </div>
      )}

      {/* Hero */}
      <header className="pt-4 sm:pt-14 text-center">
        <div className="flex justify-center">
          <Basil
            mood={phase === "done" && result && result.score >= 7 ? "alarmed" : "happy"}
            size={140}
          />
        </div>
        <h1 className="mt-2 sm:mt-3 text-4xl sm:text-6xl font-black tracking-tight text-ink">
          Before You Click
        </h1>
        <p className="mt-2 sm:mt-3 text-xl sm:text-2xl text-soft font-semibold max-w-xl mx-auto leading-snug">
          Got a message that feels off? Paste it below and Basil will sniff out
          whether it&apos;s a scam. Free. No account. Plain English.
        </p>
      </header>

      {/* Sniffer */}
      <section id="sniff" aria-label="Scam checker" className="mt-4 sm:mt-8 scroll-mt-4">
        {phase === "sniffing" ? (
          <LoadingBasil />
        ) : phase === "done" && result ? (
          <div ref={resultRef} tabIndex={-1} aria-live="polite" className="outline-none">
            <Result
              result={result}
              onReset={() => {
                setResult(null);
                setPhase("idle");
                requestAnimationFrame(() => {
                  (
                    document.getElementById("sniff-input") ??
                    document.getElementById("sniff-input-mobile")
                  )?.focus();
                });
              }}
            />
          </div>
        ) : (
          <SniffBox onSniff={sniff} scansLeft={scans} disabled={false} />
        )}
      </section>

      {/* Community */}
      <div className="mt-12 sm:mt-16">
        <Community refreshKey={refreshKey} />
      </div>

      {/* The story + footer */}
      <footer className="mt-14 border-t-2 border-line pt-8 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-extrabold text-ink">Why this exists</h2>
          <p className="mt-3 text-lg text-soft leading-relaxed">
            Basil kept being forwarded every suspicious email, text and Facebook
            message asking <em>&ldquo;Basil, is this poo okay to eat?&rdquo;</em>{" "}
            Eventually he stole a computer, asked AI for help, and turned himself
            into a full-time sniffing service. You&apos;re welcome.
          </p>
          <p className="mt-4 text-base text-soft leading-relaxed">
            Basil checks for scam tricks, not your identity. Nothing you paste is
            stored or shared, and the &ldquo;recently sniffed&rdquo; titles are
            generic labels only. Basil is clever, but he&apos;s still a dog — if
            real money is on the line, check with your bank too. Community numbers
            are illustrative while Basil&apos;s pack grows.
          </p>
          <p className="mt-6 text-lg font-bold text-ink">
            🐶 Before You Click · Trust your gut. Then ask the pug.
          </p>
        </div>
      </footer>

      {/* Mobile spacer so page content can scroll clear of the locked dock */}
      {phase === "idle" && (
        <div
          className="sm:hidden"
          style={{ height: "calc(24rem + env(safe-area-inset-bottom, 0px))" }}
          aria-hidden="true"
        />
      )}
    </main>
  );
}
