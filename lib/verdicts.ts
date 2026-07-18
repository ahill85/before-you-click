import type { Confidence } from "./types";

/** Basil's one-liners, keyed by how bad it smells. */
const HIGH: string[] = [
  "I wouldn't chew this.",
  "Basil buried this in the backyard.",
  "This smells worse than the bin on a hot day.",
  "Drop it. Drop it now.",
];

const MEDIUM: string[] = [
  "This smells funny.",
  "My ears went back on this one.",
  "I'm not growling... but I'm not wagging either.",
];

const LOW: string[] = [
  "Wagging tail. Looks okay.",
  "Sniffed it twice. Nothing nasty.",
  "This one can stay on the sofa.",
];

const UNSURE: string[] = [
  "My nose needs more to work with.",
  "Hmm. Sniff inconclusive — got any more of it?",
];

function pick(list: string[], seed: number): string {
  return list[seed % list.length];
}

export function verdictFor(score: number, confidence: Confidence): string {
  const seed = Math.floor(Date.now() / 60000); // varies over time, stable within a minute
  if (confidence === "low" && score < 4) return pick(UNSURE, seed);
  if (score >= 7) return pick(HIGH, seed);
  if (score >= 4) return pick(MEDIUM, seed);
  return pick(LOW, seed);
}

/** Rotating loading messages while Basil works. */
export const LOADING_MESSAGES = [
  "Teaching Basil about phishing...",
  "Reading the tiny print...",
  "Consulting the neighbourhood dogs...",
  "Sniffing suspicious links...",
  "Checking if your uncle forwarded this...",
  "Looking for nonsense...",
  "Comparing smells to known scams...",
  "Double-checking with the cat (reluctantly)...",
];

/** Scan-limit messages, keyed by scans remaining. */
export function scansLeftMessage(left: number): string {
  if (left >= 10) return "Fresh nose.";
  if (left >= 7) return "Still behaving.";
  if (left >= 4) return "You've been busy...";
  if (left >= 2) return "Basil is getting tired.";
  if (left === 1) return "One last sniff.";
  return "That's enough detective work today. Come back tomorrow.";
}
