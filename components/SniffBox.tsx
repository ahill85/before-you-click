"use client";

import { useRef, useState } from "react";

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
  const [focused, setFocused] = useState(false);
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

  const textareaClass =
    "w-full rounded-3xl border-2 border-line bg-card p-5 sm:p-6 text-lg sm:text-xl leading-relaxed text-ink placeholder:text-soft/70 focus:border-basil focus:bg-white transition-[min-height,colors] resize-y disabled:opacity-60";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label htmlFor="sniff-input" className="sr-only">
        Paste the suspicious email, text message or website link here
      </label>

      {/* Desktop: original in-flow search box */}
      <textarea
        id="sniff-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          'Paste the suspicious email, text or link here...\n\nFor example: "Your package is held. Pay £1.99 at royalmail-fees.xyz"'
        }
        rows={6}
        disabled={disabled || outOfScans}
        className={`hidden sm:block min-h-44 ${textareaClass}`}
      />

      <div
        className="mt-3 flex flex-wrap items-center justify-center gap-2"
        aria-label="Supported input types"
      >
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
        <p
          role="alert"
          className="mt-3 rounded-2xl bg-danger-bg border-2 border-danger/30 text-danger text-lg font-bold p-4 text-center"
        >
          {error}
        </p>
      )}

      {/* Desktop: original buttons in flow */}
      <div className="mt-4 hidden sm:flex flex-col sm:flex-row gap-3 justify-center">
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
      </div>

      {/* Mobile: search + buttons locked to bottom; tap search to expand */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t-2 border-line bg-white px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-6px_20px_rgba(0,0,0,0.08)] sm:hidden">
        <textarea
          id="sniff-input-mobile"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            focused
              ? 'Paste the suspicious email, text or link here...\n\nFor example: "Your package is held. Pay £1.99 at royalmail-fees.xyz"'
              : "Paste email, text or link..."
          }
          rows={focused ? 8 : 1}
          disabled={disabled || outOfScans}
          style={focused ? { minHeight: "42vh", maxHeight: "55vh" } : { height: "4rem", minHeight: "4rem", maxHeight: "4rem" }}
          className={`w-full rounded-2xl border-2 border-line bg-card px-5 text-lg text-ink placeholder:text-soft/70 focus:border-basil focus:bg-white disabled:opacity-60 ${
            focused
              ? "py-4 leading-relaxed resize-y overflow-auto whitespace-pre-wrap"
              : "py-0 leading-[4rem] overflow-hidden whitespace-nowrap resize-none"
          }`}
          aria-label="Paste the suspicious email, text message or website link here"
        />

        <div className="mt-3 mb-2 flex flex-col gap-3">
          <button
            onClick={submit}
            onMouseDown={(e) => e.preventDefault()}
            disabled={disabled || ocrBusy || outOfScans}
            className="min-h-16 px-10 py-4 rounded-2xl bg-basil hover:bg-basil-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-2xl font-black shadow-lg shadow-basil/25 transition-colors"
          >
            🐶 Sniff It
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            onMouseDown={(e) => e.preventDefault()}
            disabled={disabled || ocrBusy || outOfScans}
            className="min-h-16 px-6 py-4 rounded-2xl border-2 border-line bg-white hover:bg-card disabled:opacity-50 text-ink text-xl font-bold transition-colors"
          >
            {ocrBusy ? "📷 Reading picture..." : "📷 Add a screenshot"}
          </button>
        </div>
      </div>

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
  );
}
