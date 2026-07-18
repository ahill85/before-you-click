import type { SniffResult, Confidence } from "./types";
import { verdictFor } from "./verdicts";

/**
 * Basil's built-in nose. A weighted rule engine that needs no API key
 * and costs nothing to run. Every signal is written so its "reason"
 * string reads as plain English for a non-technical person.
 */

interface Signal {
  weight: number; // how many bones this is worth (fractions fine)
  reason: string;
  test: (text: string, urls: URLInfo[]) => boolean;
}

interface URLInfo {
  raw: string;
  host: string;
  https: boolean;
}

const KNOWN_BRANDS: Record<string, string[]> = {
  paypal: ["paypal.com"],
  amazon: ["amazon.com", "amazon.co.uk", "amazon.ca", "amazon.com.au", "amazon.de"],
  netflix: ["netflix.com"],
  apple: ["apple.com", "icloud.com"],
  microsoft: ["microsoft.com", "live.com", "outlook.com"],
  google: ["google.com", "gmail.com"],
  facebook: ["facebook.com", "fb.com", "meta.com"],
  instagram: ["instagram.com"],
  usps: ["usps.com"],
  ups: ["ups.com"],
  fedex: ["fedex.com"],
  dhl: ["dhl.com", "dhl.de", "dhl.co.uk"],
  "royal mail": ["royalmail.com"],
  irs: ["irs.gov"],
  hmrc: ["gov.uk", "hmrc.gov.uk"],
  medicare: ["medicare.gov"],
  venmo: ["venmo.com"],
  zelle: ["zellepay.com"],
  chase: ["chase.com"],
  wellsfargo: ["wellsfargo.com"],
  barclays: ["barclays.co.uk"],
  hsbc: ["hsbc.com", "hsbc.co.uk"],
  ebay: ["ebay.com", "ebay.co.uk"],
  walmart: ["walmart.com"],
  costco: ["costco.com"],
};

const SHORTENERS = [
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly",
  "rebrand.ly", "cutt.ly", "shorturl.at", "rb.gy", "tiny.cc", "lnkd.in",
];

const SKETCHY_TLDS = [
  ".xyz", ".top", ".club", ".online", ".site", ".live", ".icu", ".vip",
  ".cam", ".rest", ".zip", ".mov", ".click", ".link", ".gq", ".tk", ".ml",
  ".cf", ".buzz", ".monster", ".quest", ".cyou",
];

function extractUrls(text: string): URLInfo[] {
  const matches =
    text.match(/(?:https?:\/\/|www\.)[^\s<>"')\]]+/gi) ?? [];
  // Also catch bare domains like "amazon-refunds.xyz/claim"
  const bare =
    text.match(/\b[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+\.[a-z]{2,}(?:\/[^\s<>"')\]]*)?/gi) ?? [];
  const all = Array.from(new Set([...matches, ...bare]));
  return all
    .map((raw) => {
      try {
        const u = new URL(raw.startsWith("http") ? raw : `http://${raw}`);
        return { raw, host: u.hostname.toLowerCase(), https: u.protocol === "https:" };
      } catch {
        return null;
      }
    })
    .filter((u): u is URLInfo => u !== null && u.host.includes("."));
}

function hostMatchesBrand(host: string, domains: string[]): boolean {
  return domains.some((d) => host === d || host.endsWith(`.${d}`));
}

function looksLikeLookalike(host: string): string | null {
  // paypa1.com, amaz0n-support.net, netfIix.com etc.
  const deleeted = host.replace(/1/g, "l").replace(/0/g, "o").replace(/3/g, "e").replace(/5/g, "s");
  for (const [brand, domains] of Object.entries(KNOWN_BRANDS)) {
    const b = brand.replace(/\s/g, "");
    if (hostMatchesBrand(host, domains)) continue;
    if (host.includes(b) || (deleeted !== host && deleeted.includes(b))) {
      return brand;
    }
  }
  return null;
}

const SIGNALS: Signal[] = [
  {
    weight: 2,
    reason: "It's pushing you to act urgently — real companies don't give you 24-hour ultimatums.",
    test: (t) =>
      /\b(urgent|immediately|right away|act now|within (24|48) hours?|final (notice|warning)|last chance|expires? (today|soon)|asap|don'?t delay|time.sensitive)\b/i.test(t),
  },
  {
    weight: 2,
    reason: "It threatens something bad (account closed, arrest, fines) if you don't comply. That's a classic pressure tactic.",
    test: (t) =>
      /\b(account (will be |has been )?(suspended|closed|locked|terminated|deactivated|limited)|legal action|arrest(ed)?|lawsuit|warrant|penalt(y|ies)|prosecut)/i.test(t),
  },
  {
    weight: 2.5,
    reason: "It asks you to \"verify\", \"confirm\" or log in via a link. Real companies ask you to go to their website yourself.",
    test: (t) =>
      /\b(verify your (account|identity|information|payment)|confirm your (account|identity|details|password|payment)|re-?activate|validate your|update your (payment|billing|account) (info|information|details|method))\b/i.test(t),
  },
  {
    weight: 3,
    reason: "It asks for payment by gift card, crypto or wire transfer. No real business or government does that. Ever.",
    test: (t) =>
      /\b(gift ?cards?|itunes card|google play card|steam card|bitcoin|btc\b|crypto(currency)?|wire transfer|western union|moneygram)\b/i.test(t),
  },
  {
    weight: 2.5,
    reason: "It asks for sensitive details like card numbers, PINs, passwords or one-time codes. Never share those from a message.",
    test: (t) =>
      /\b(social security|ssn\b|national insurance|card number|cvv|pin number|one.?time (code|password)|otp\b|security code|mother'?s maiden|date of birth|bank details|routing number|sort code)\b/i.test(t),
  },
  {
    weight: 2,
    reason: "You've apparently won something you never entered. Surprise prizes that need your details are bait.",
    test: (t) =>
      /\b(you('ve| have)? (won|been selected|been chosen)|congratulations.{0,40}(winner|won|prize)|claim your (prize|reward|gift)|lottery|jackpot|lucky (winner|draw))\b/i.test(t),
  },
  {
    weight: 1.5,
    reason: "There's a fake-looking delivery problem (\"your package is held\"). Couriers text you from their real app, not random links.",
    test: (t) =>
      /\b(package|parcel|shipment|delivery)\b.{0,80}\b(held|pending|failed|suspended|unable|redelivery|customs? fee|address (issue|problem)|unpaid)\b/is.test(t),
  },
  {
    weight: 1.5,
    reason: "It promises easy money or guaranteed returns. Real investments never guarantee anything.",
    test: (t) =>
      /\b(guaranteed (returns?|profit|income)|double your (money|investment)|risk.?free|earn \$?\d+.{0,20}(day|week|home)|passive income opportunity|get rich)\b/i.test(t),
  },
  {
    weight: 1,
    reason: "It opens with a generic greeting like \"Dear Customer\" — your real bank knows your name.",
    test: (t) => /\b(dear (customer|user|member|sir|madam|account holder|client)|valued customer)\b/i.test(t),
  },
  {
    weight: 1.5,
    reason: "It asks you to move the chat to WhatsApp, Telegram or a personal number — scammers love leaving platforms that protect you.",
    test: (t) => /\b(whatsapp|telegram|signal)\b.{0,40}\b(me|us|chat|message|contact)\b|\bcontact (me|us) on (whatsapp|telegram)/i.test(t),
  },
  {
    weight: 1.5,
    reason: "There's a suspicious \"refund\" or unexpected charge story designed to make you call or click in a panic.",
    test: (t) =>
      /\b(refund (of|for)? ?\$?\d|you (were|have been) charged|auto.?renew(al|ed)|subscription (renewed|charged)|invoice (attached|#?\d)|receipt for your (payment|purchase))\b/i.test(t),
  },
  {
    weight: 2,
    reason: "Someone claiming to be family from a new number asking for money is one of the oldest tricks going.",
    test: (t) =>
      /\b(hi )?(mum|mom|dad)\b.{0,60}\b(new (number|phone)|lost my phone|broke my phone)|new number.{0,60}(mum|mom|dad)/is.test(t),
  },
  {
    weight: 2,
    reason: "It asks you to send money directly. Anyone who genuinely needs help can wait while you call them to check it's really them.",
    test: (t) =>
      /\b(send (me|us)? ?[£$€]?\d+|can you (send|transfer|lend)|need (you to send|money|cash)|pay (a |the )?(bill|fee|fine) (for me|today|now)|transfer (the )?money)\b/i.test(t),
  },
  {
    weight: 1.5,
    reason: "It uses a link-shortener (like bit.ly) to hide where the link really goes.",
    test: (_t, urls) => urls.some((u) => SHORTENERS.includes(u.host)),
  },
  {
    weight: 2,
    reason: "The web address ends in an odd domain (like .xyz or .top) that scammers use because it's cheap.",
    test: (_t, urls) => urls.some((u) => SKETCHY_TLDS.some((tld) => u.host.endsWith(tld))),
  },
  {
    weight: 2.5,
    reason: "The link uses a raw number address instead of a name — no legitimate company does that.",
    test: (_t, urls) => urls.some((u) => /^\d{1,3}(\.\d{1,3}){3}$/.test(u.host)),
  },
  {
    weight: 1,
    reason: "A link starts with http:// instead of https:// — no padlock, no protection.",
    test: (t, urls) => /https?:\/\//i.test(t) && urls.some((u) => !u.https && u.raw.startsWith("http://")),
  },
  {
    weight: 2,
    reason: "The link has far too many dots and dashes — a favourite trick for dressing up a fake address as a real one.",
    test: (_t, urls) => urls.some((u) => u.host.split(".").length >= 5 || (u.host.match(/-/g) ?? []).length >= 3),
  },
];

function brandMismatchSignals(text: string, urls: URLInfo[]): { weight: number; reason: string }[] {
  const found: { weight: number; reason: string }[] = [];
  const lower = text.toLowerCase();

  // Brand mentioned in text but links go somewhere else entirely
  for (const [brand, domains] of Object.entries(KNOWN_BRANDS)) {
    if (!lower.includes(brand)) continue;
    const offDomain = urls.filter((u) => !hostMatchesBrand(u.host, domains));
    if (urls.length > 0 && offDomain.length === urls.length) {
      found.push({
        weight: 3,
        reason: `It talks about ${brand.charAt(0).toUpperCase() + brand.slice(1)} but the link doesn't go to ${domains[0]}. That mismatch is the biggest red flag there is.`,
      });
      break;
    }
  }

  // Lookalike domains (paypa1.com etc.)
  for (const u of urls) {
    const brand = looksLikeLookalike(u.host);
    if (brand) {
      found.push({
        weight: 3,
        reason: `The address "${u.host}" is dressed up to look like ${brand.charAt(0).toUpperCase() + brand.slice(1)}, but it isn't the real site.`,
      });
      break;
    }
  }
  return found;
}

const SAFE_ACTIONS_HIGH = [
  "Don't click any links or reply to this message.",
  "Delete it. If it claims to be a company, contact them via their official app or the number on your card or statement.",
  "If you already clicked or paid, contact your bank right away — they deal with this daily and won't judge.",
  "Report it: forward scam texts to 7726, or use your email's \"Report phishing\" button.",
];

const SAFE_ACTIONS_MEDIUM = [
  "Don't click the link. Go to the company's website by typing the address yourself or using their app.",
  "Contact the sender through a channel you already trust to check if it's real.",
  "When in doubt, wait. Nothing legitimate falls apart because you took an hour to check.",
];

const SAFE_ACTIONS_LOW = [
  "It looks okay, but stay sharp — never share passwords or codes, even with messages that seem fine.",
  "If it asks you to do anything with money or passwords later, come back and sniff that too.",
];

export function heuristicSniff(text: string): SniffResult {
  const urls = extractUrls(text);
  const hits: { weight: number; reason: string }[] = [];

  for (const s of SIGNALS) {
    try {
      if (s.test(text, urls)) hits.push({ weight: s.weight, reason: s.reason });
    } catch {
      /* one bad regex shouldn't stop the sniff */
    }
  }
  hits.push(...brandMismatchSignals(text, urls));

  // Sort by importance, keep the clearest reasons
  hits.sort((a, b) => b.weight - a.weight);
  const totalWeight = hits.reduce((sum, h) => sum + h.weight, 0);
  const score = Math.max(0, Math.min(10, Math.round(totalWeight * 1.15)));

  // Recognised, genuine brand link with nothing else wrong? Say so plainly.
  const allBrandUrls =
    urls.length > 0 &&
    urls.every((u) =>
      Object.values(KNOWN_BRANDS).some((domains) => hostMatchesBrand(u.host, domains))
    );

  const trimmed = text.trim();
  const veryShort = trimmed.length < 40 && !allBrandUrls;
  let confidence: Confidence;
  if (veryShort && hits.length === 0) confidence = "low";
  else if (hits.length >= 3 || score >= 7) confidence = "high";
  else if (hits.length >= 1) confidence = "medium";
  else confidence = allBrandUrls || trimmed.length > 120 ? "medium" : "low";

  const reasons =
    hits.length > 0
      ? hits.slice(0, 5).map((h) => h.reason)
      : allBrandUrls
        ? [`The link goes to the genuine website (${urls[0].host}) — no tricks hiding in the address.`]
        : veryShort
        ? ["There isn't much here to sniff. Paste the whole message — including any links — for a proper verdict."]
        : ["No classic scam tricks found: no fake urgency, no requests for money or passwords, no dodgy links."];

  let summary: string;
  if (score >= 7) {
    summary = "This has the classic markings of a scam. Multiple pressure tactics, all pointed at your money or your passwords.";
  } else if (score >= 4) {
    summary = "Something here smells off. It might be legitimate, but it's using tricks scammers love, so treat it with caution.";
  } else if (confidence === "low") {
    summary = "Honest answer: there isn't enough here for a confident verdict. More context would help.";
  } else {
    summary = "Nothing set the nose off. It looks okay — but 'looks okay' is never a reason to share passwords or send money.";
  }

  const actions = score >= 7 ? SAFE_ACTIONS_HIGH : score >= 4 ? SAFE_ACTIONS_MEDIUM : SAFE_ACTIONS_LOW;

  return {
    score,
    confidence,
    verdict: verdictFor(score, confidence),
    summary,
    reasons,
    actions,
    source: "nose",
  };
}
