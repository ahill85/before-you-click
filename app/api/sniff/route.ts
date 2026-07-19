import { NextResponse } from "next/server";
import { heuristicSniff } from "@/lib/heuristics";
import { aiSniff } from "@/lib/ai";
import { verdictFor } from "@/lib/verdicts";
import type { SniffResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_INPUT = 20000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  let text: unknown;
  try {
    ({ text } = await req.json());
  } catch {
    return NextResponse.json({ error: "Basil couldn't read that." }, { status: 400, headers: CORS });
  }

  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json(
      { error: "Paste something for Basil to sniff first." },
      { status: 400, headers: CORS }
    );
  }

  const input = text.slice(0, MAX_INPUT);

  // Always run the built-in nose (free, instant, reliable).
  const nose = heuristicSniff(input);

  // If any free AI key is configured, let it refine the verdict.
  const ai = await aiSniff(input);

  let result: SniffResult;
  if (ai) {
    // Blend: trust the AI's explanation, but never let it score wildly
    // below obvious heuristic red flags (belt and braces for safety).
    const score = Math.max(ai.score, nose.score >= 7 ? Math.min(nose.score, ai.score + 2) : ai.score);
    result = {
      ...ai,
      score,
      verdict: verdictFor(score, ai.confidence),
    };
  } else {
    result = nose;
  }

  return NextResponse.json(result, { headers: CORS });
}
