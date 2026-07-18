"use client";

import { useEffect } from "react";
import { scansLeftMessage } from "@/lib/verdicts";

export default function ScansToast({
  scansLeft,
  visible,
  onDone,
}: {
  scansLeft: number;
  visible: boolean;
  onDone: () => void;
}) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  if (!visible) return null;

  const out = scansLeft <= 0;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 left-3 right-3 z-50 mx-auto max-w-lg fade-up"
    >
      <div
        className={`rounded-2xl border-2 px-5 py-4 text-center text-lg font-bold shadow-lg ${
          out
            ? "border-warn/40 bg-warn-bg text-warn"
            : "border-line bg-white text-ink"
        }`}
      >
        {out ? (
          scansLeftMessage(0)
        ) : (
          <>
            <span className="font-extrabold">{scansLeft}</span> free sniff
            {scansLeft === 1 ? "" : "s"} left today.{" "}
            <span className="italic font-semibold text-soft">
              &ldquo;{scansLeftMessage(scansLeft)}&rdquo;
            </span>
          </>
        )}
      </div>
    </div>
  );
}
