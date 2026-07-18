export type Confidence = "low" | "medium" | "high";

export interface SniffResult {
  /** 0–10 Bones of Suspicion. 10 = definitely a scam. */
  score: number;
  confidence: Confidence;
  /** Basil's one-liner verdict, e.g. "I wouldn't chew this." */
  verdict: string;
  /** One short plain-English summary sentence. */
  summary: string;
  /** Specific reasons, plain English, no jargon. */
  reasons: string[];
  /** What the person should actually do. */
  actions: string[];
  /** Which engine answered: "ai" or "nose" (built-in). */
  source: "ai" | "nose";
}

export interface SniffRequest {
  text: string;
}
