# 🐶 Before You Click

**Basil the pug sniffs scams so your mum doesn't have to ask.**

Paste any suspicious email, text or link. Basil tells you in plain English if it's a scam — with a verdict, 0–10 Bones of Suspicion, specific reasons, and what to do next. No account, no setup, no jargon.

> Built to protect my mum... and my sanity.

## Runs at zero cost

The whole app works with **no API keys and no database**:

- **Basil's built-in nose** — a weighted rule engine (urgency tactics, gift-card demands, link mismatches, lookalike domains, shady TLDs, family-imposter patterns and more) runs on every sniff for free.
- **Optional free AI** — add any free-tier key to `.env.local` and Basil gets smarter automatically. Providers are tried in order: Groq → Gemini → Anthropic. No key? Heuristics take over seamlessly.
- **Screenshots** — read with free client-side OCR (Tesseract.js, loaded only when needed). The image never leaves the browser.
- **Scan limits** — 10 free sniffs/day, tracked in localStorage.
- **Community sections** — "Today's Most Sniffed" and the stats rotate deterministically from the date, so the site refreshes itself daily with no backend. They're illustrative (and labelled as such on the page) until you connect real analytics.
- **Privacy** — nothing pasted is stored. "Recently Sniffed" keeps only generic local titles like "Amazon account email".

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Optional AI (any one is enough):

```bash
cp .env.example .env.local   # add GROQ_API_KEY / GEMINI_API_KEY / ANTHROPIC_API_KEY
```

## Deploy (free)

Push to GitHub → import in Vercel → done. Add keys in Vercel → Settings → Environment Variables if you want AI mode. Fits comfortably in Vercel's free Hobby tier.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · one serverless route (`/api/sniff`) · Tesseract.js OCR

## Accessibility

Designed for older users first: 18px base type, big touch targets, WCAG AA contrast on white, visible 4px focus rings, skip link, `aria-live` results, screen-reader-labelled meters, respects `prefers-reduced-motion`.
