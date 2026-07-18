/** Basil the pug. Hand-drawn SVG so he loads instantly and scales forever. */

export type BasilMood = "happy" | "sniffing" | "alarmed" | "neutral";

export default function Basil({
  mood = "neutral",
  size = 120,
  className = "",
}: {
  mood?: BasilMood;
  size?: number;
  className?: string;
}) {
  const browY = mood === "alarmed" ? -6 : mood === "sniffing" ? -3 : 0;
  const mouth =
    mood === "happy" ? (
      <path d="M85 118 Q100 132 115 118" stroke="#44403c" strokeWidth="4" fill="none" strokeLinecap="round" />
    ) : mood === "alarmed" ? (
      <ellipse cx="100" cy="122" rx="9" ry="11" fill="#44403c" />
    ) : (
      <path d="M88 120 Q100 126 112 120" stroke="#44403c" strokeWidth="4" fill="none" strokeLinecap="round" />
    );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label={`Basil the pug looking ${mood}`}
      className={className}
    >
      {/* Ears */}
      <path d="M38 52 Q26 20 62 34 Q52 58 46 66 Z" fill="#57534e" />
      <path d="M162 52 Q174 20 138 34 Q148 58 154 66 Z" fill="#57534e" />
      {/* Head */}
      <ellipse cx="100" cy="95" rx="68" ry="62" fill="#e7c894" />
      {/* Forehead wrinkles */}
      <path d="M70 48 Q100 38 130 48" stroke="#d4b078" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M74 58 Q100 50 126 58" stroke="#d4b078" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Muzzle */}
      <ellipse cx="100" cy="112" rx="34" ry="28" fill="#a8a29e" />
      <ellipse cx="100" cy="106" rx="30" ry="20" fill="#78716c" />
      {/* Eyes */}
      <g transform={`translate(0 ${browY})`}>
        <circle cx="72" cy="84" r="13" fill="#fff" />
        <circle cx="128" cy="84" r="13" fill="#fff" />
        <circle cx="74" cy="86" r="8" fill="#292524" />
        <circle cx="126" cy="86" r="8" fill="#292524" />
        <circle cx="77" cy="83" r="3" fill="#fff" />
        <circle cx="129" cy="83" r="3" fill="#fff" />
      </g>
      {/* Nose */}
      <ellipse cx="100" cy="102" rx="12" ry="9" fill="#1c1917" />
      <ellipse cx="96" cy="99" rx="3.5" ry="2.5" fill="#57534e" />
      {/* Mouth */}
      {mouth}
      {/* Tongue when happy */}
      {mood === "happy" && <path d="M93 124 Q100 140 107 124 Z" fill="#f472b6" />}
      {/* Sniff lines when sniffing */}
      {mood === "sniffing" && (
        <g stroke="#d97706" strokeWidth="4" strokeLinecap="round">
          <path d="M136 108 q8 -3 14 1" />
          <path d="M138 118 q9 0 15 4" />
        </g>
      )}
    </svg>
  );
}

/** Basil's curly tail, used standalone for the wagging loader. */
export function BasilTail({ size = 48, wag = false }: { size?: number; wag?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" aria-hidden="true" className={wag ? "tail-wag" : ""}>
      <path
        d="M10 50 Q30 40 34 24 Q36 12 26 12 Q18 12 22 20"
        stroke="#e7c894"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
