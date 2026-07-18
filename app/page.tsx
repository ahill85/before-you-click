"use client";

import { useEffect, useRef, useState } from "react";
import Basil from "@/components/Basil";
import SniffBox from "@/components/SniffBox";
import LoadingBasil from "@/components/LoadingBasil";
import Result from "@/components/Result";
import Community from "@/components/Community";
import { scansLeft as getScansLeft, useOneScan } from "@/lib/limits";
import { addRecent } from "@/lib/recent";
import type { SniffResult } from "@/lib/types";

type Phase = "idle" | "sniffing" | "done";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<SniffResult | null>(null);
  const [scans, setScans] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScans(getScansLeft());
  }, []);

  async function sniff(text: string) {
    setPhase("sniffing");
    const started = Date.now();
    let data: SniffResult;
    try {
      const res = await fetch("/api/sniff", {
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

    setScans(useOneScan());
    addRecent(text, data.score);
    setRefreshKey((k) => k + 1);
    setResult(data);
    setPhase("done");
  }

  useEffect(() => {
    if (phase === "done") resultRef.current?.focus();
  }, [phase]);

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 pb-20">
      {/* Hero */}
      <header className="pt-12 sm:pt-20 text-center">
        <div className="flex justify-center">
          <Basil mood={phase === "done" && result && result.score >= 7 ? "alarmed" : "happy"} size={140} />
        </div>
        <h1 className="mt-4 text-4xl sm:text-6xl font-black tracking-tight text-ink">
          Before You Click
        </h1>
        <p className="mt-4 text-xl sm:text-2xl text-soft font-semibold max-w-xl mx-auto leading-relaxed">
          Got a message that feels off? Paste it below and Basil will sniff out
          whether it&apos;s a scam. Free. No account. Plain English.
        </p>
        <p className="mt-3 text-lg text-soft italic">
          Built to protect my mum... and my sanity.
        </p>
      </header>

      {/* Sniffer */}
      <section id="sniff" aria-label="Scam checker" className="mt-10 scroll-mt-8">
        {phase === "sniffing" ? (
          <LoadingBasil />
        ) : phase === "done" && result ? (
          <div ref={resultRef} tabIndex={-1} aria-live="polite" className="outline-none">
            <Result
              result={result}
              onReset={() => {
                setResult(null);
                setPhase("idle");
                document.getElementById("sniff-input")?.focus();
              }}
            />
          </div>
        ) : (
          <SniffBox onSniff={sniff} scansLeft={scans} disabled={false} />
        )}
      </section>

      {/* Community */}
      <div className="mt-20">
        <Community refreshKey={refreshKey} />
      </div>

      {/* The story + footer */}
      <footer className="mt-24 border-t-2 border-line pt-10 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-extrabold text-ink">Why this exists</h2>
          <p className="mt-4 text-lg text-soft leading-relaxed">
            My mum kept forwarding me every suspicious email, text and Facebook
            message asking <em>&ldquo;Andrew, is this a scam?&rdquo;</em> Eventually I
            thought: there has to be a better way. So I built one — and gave the
            job to a pug.
          </p>
          <p className="mt-6 text-base text-soft leading-relaxed">
            Basil checks for scam tricks, not your identity. Nothing you paste is
            stored or shared, and the &ldquo;recently sniffed&rdquo; titles are
            generic labels only. Basil is clever, but he&apos;s still a dog — if
            real money is on the line, check with your bank too. Community numbers
            are illustrative while Basil&apos;s pack grows.
          </p>
          <p className="mt-8 text-lg font-bold text-ink">
            🐶 Before You Click · Trust your gut. Then ask the pug.
          </p>
        </div>
      </footer>
    </main>
  );
}
