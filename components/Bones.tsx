/** The Bones of Suspicion meter. Big, obvious, readable at arm's length. */

export default function Bones({ score }: { score: number }) {
  const color = score >= 7 ? "text-danger" : score >= 4 ? "text-warn" : "text-safe";
  return (
    <div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={score}
        aria-label={`${score} out of 10 Bones of Suspicion`}
        className="flex gap-1.5 flex-wrap"
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`text-2xl sm:text-3xl ${i < score ? color : "text-line"} transition-colors`}
          >
            🦴
          </span>
        ))}
      </div>
      <p className={`mt-2 text-xl font-extrabold ${color}`}>
        {score}/10 Bones of Suspicion
      </p>
    </div>
  );
}
