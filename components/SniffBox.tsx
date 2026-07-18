"use client";

import { useRef, useState } from "react";
import { scansLeftMessage } from "@/lib/verdicts";

const SUPPORTED = [
  { emoji: "📧", label: "Email" },
  { emoji: "💬", label: "Text" },
  { emoji: "🌐", label: "Website" },
  { emoji: "📷", label: "Screenshot" },
];

export default function SniffBox({
  onSniff,
  scansLeft,
  disabled,
}: {
  onSniff: (text: string) => void;
  scansLeft: number;
  disabled: boolean;
}) {
  const [text, setText] = useState("");
  const [ocrBusy, setOcrBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const outOfScans = scansLeft <= 0;

  async function handleScreenshot(file: File) {
    setError(null);
    setOcrBusy(true);
    try {
      const { default: Tesseract } = await import("tesseract.js");
      const { data } = await Tesseract.recognize(file, "eng");
      const found = (data.text ?? "").trim();
      if (found.length < 10) {
        setError("Basil squinted at that picture but couldn't read any words. Try a clearer screenshot, or paste the text instead.");
      } else {
        setText((prev) => (prev ? `${prev}\n\n${found}` : found));
      }
    } catch {
      setError("That picture wouldn't open. Try pasting the message text instead.");
    } finally {
      setOcrBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function submit() {
    setError(null);
    if (!text.trim()) {
      setError("Paste the suspicious message first, then press Sniff It.");
      return;
    }
    onSniff(text);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label htmlFor="sniff-input" className="sr-only">
        Paste the suspicious email, text message or website link here
      </label>
      <textarea
        id="sniff-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"Paste the suspicious email, text or link here...\n\nFor example: \"Your package is held. Pay £1.99 at royalmail-fees.xyz\""}
        rows={6}
        disabled={disabled || outOfScans}
        className="w-full rounded-3xl border-2 border-line bg-card p-5 sm:p-6 text-lg sm:text-xl leading-relaxed text-ink placeholder:text-soft/70 focus:border-basil focus:bg-white transition-colors resize-y min-h-44 disabled:opacity-60"
      />

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2" aria-label="Supported input types">
        {SUPPORTED.map((s) => (
          <span
            key={s.label}
            className="inline-flex items-center gap-1.5 rounded-full bg-card border border-line px-4 py-2 text-base font-bold text-soft"
          >
            <span aria-hidden="true">{s.emoji}</span> {s.label}
          </span>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl bg-danger-bg border-2 border-danger/30 text-danger text-lg font-bold p-4 text-center">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={submit}
          disabled={disabled || ocrBusy || outOfScans}
          className="min-h-16 px-10 py-4 rounded-2xl bg-basil hover:bg-basil-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-2xl font-black shadow-lg shadow-basil/25 transition-colors"
        >
          🐶 Sniff It
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={disabled || ocrBusy || outOfScans}
          className="min-h-16 px-6 py-4 rounded-2xl border-2 border-line bg-white hover:bg-card disabled:opacity-50 text-ink text-xl font-bold transition-colors"
        >
          {ocrBusy ? "📷 Reading picture..." : "📷 Add a screenshot"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Upload a screenshot of the suspicious message"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleScreenshot(f);
          }}
        />
      </div>

      <p className="mt-4 text-center text-lg text-soft" aria-live="polite">
        {outOfScans ? (
          <span className="font-bold">
            {scansLeftMessage(0)}
          </span>
        ) : (
          <>
            <span className="font-extrabold text-ink">{scansLeft}</span> free sniff{scansLeft === 1 ? "" : "s"} left today.{" "}
            <span className="italic">&ldquo;{scansLeftMessage(scansLeft)}&rdquo;</span>
          </>
        )}
      </p>
    </div>
  );
}
