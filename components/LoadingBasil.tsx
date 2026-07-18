"use client";

import { useEffect, useState } from "react";
import Basil from "./Basil";
import { LOADING_MESSAGES } from "@/lib/verdicts";

export default function LoadingBasil() {
  const [i, setI] = useState(() => Math.floor(Math.random() * LOADING_MESSAGES.length));

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % LOADING_MESSAGES.length), 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="flex flex-col items-center gap-4 py-10"
      role="status"
      aria-live="polite"
    >
      <div className="sniff-bob">
        <Basil mood="sniffing" size={110} />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-soft text-center px-4">
        {LOADING_MESSAGES[i]}
      </p>
    </div>
  );
}
