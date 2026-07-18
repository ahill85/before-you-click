import type { SniffResult } from "./types";

/**
 * Optional free AI providers. All are tried only if their env key exists.
 * The app runs at zero cost with zero keys — heuristics take over.
 * Order: Groq (fast free tier) → Gemini (free tier) → Anthropic.
 */

const SYSTEM_PROMPT = `You are Basil, a scam-detection expert (who happens to be a pug). Analyse the user's suspicious message, email, text, or URL.

Respond with ONLY valid JSON, no markdown fences, matching exactly:
{
  "score": <integer 0-10, 10 = certainly a scam>,
  "confidence": "low" | "medium" | "high",
  "summary": "<one plain-English sentence for a non-technical older person>",
  "reasons": ["<3-5 short specific reasons in plain English, no jargon>"],
  "actions": ["<2-4 simple recommended actions>"]
}

Rules:
- Plain English. No jargon. Never say "phishing vector" — say "fake link".
- Never exaggerate. If uncertain, use low confidence and say so in the summary.
- Reasons must be specific to THIS message, not generic advice.
- Actions must be doable by a non-technical person.`;

interface AiJson {
  score: number;
  confidence: "low" | "medium" | "high";
  summary: string;
  reasons: string[];
  actions: string[];
}

function parseAiJson(raw: string): AiJson | null {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    const obj = JSON.parse(cleaned.slice(start, end + 1));
    if (
      typeof obj.score !== "number" ||
      !["low", "medium", "high"].includes(obj.confidence) ||
      typeof obj.summary !== "string" ||
      !Array.isArray(obj.reasons) ||
      !Array.isArray(obj.actions)
    ) {
      return null;
    }
    obj.score = Math.max(0, Math.min(10, Math.round(obj.score)));
    obj.reasons = obj.reasons.slice(0, 5).map(String);
    obj.actions = obj.actions.slice(0, 4).map(String);
    return obj as AiJson;
  } catch {
    return null;
  }
}

async function withTimeout(url: string, init: RequestInit, ms = 12000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function tryGroq(text: string): Promise<AiJson | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  try {
    const res = await withTimeout("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return parseAiJson(data.choices?.[0]?.message?.content ?? "");
  } catch {
    return null;
  }
}

async function tryGemini(text: string): Promise<AiJson | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const res = await withTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text }] }],
          generationConfig: { temperature: 0.2 },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return parseAiJson(data.candidates?.[0]?.content?.parts?.[0]?.text ?? "");
  } catch {
    return null;
  }
}

async function tryAnthropic(text: string): Promise<AiJson | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const res = await withTimeout("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: text }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return parseAiJson(data.content?.[0]?.text ?? "");
  } catch {
    return null;
  }
}

export async function aiSniff(text: string): Promise<Omit<SniffResult, "verdict"> | null> {
  const result = (await tryGroq(text)) ?? (await tryGemini(text)) ?? (await tryAnthropic(text));
  if (!result) return null;
  return { ...result, source: "ai" };
}
