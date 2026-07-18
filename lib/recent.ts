"use client";

/**
 * "Recently Sniffed" — stored locally, always genericised.
 * Raw message content NEVER leaves the analysis flow or gets stored.
 * We reduce every sniff to a harmless generic title like "Amazon account email".
 */

const KEY = "basil-recent";
const MAX = 8;

const BRANDS = [
  "Amazon", "PayPal", "Netflix", "Apple", "Microsoft", "Google", "Facebook",
  "Instagram", "USPS", "UPS", "FedEx", "DHL", "Royal Mail", "IRS", "HMRC",
  "eBay", "Walmart", "Costco", "Venmo", "Zelle", "Chase", "Barclays", "HSBC",
  "WhatsApp", "Spotify", "Disney",
];

export interface RecentSniff {
  title: string;
  score: number;
  at: number;
}

function detectChannel(text: string): string {
  const t = text.toLowerCase();
  if (/^https?:\/\/\S+$/.test(text.trim())) return "link";
  if (t.includes("unsubscribe") || t.includes("dear ") || t.length > 500) return "email";
  if (t.length < 220) return "text";
  return "message";
}

/** Turn raw content into a safe generic title. Never include user content. */
export function genericTitle(text: string): string {
  const channel = detectChannel(text);
  const lower = text.toLowerCase();
  const brand = BRANDS.find((b) => lower.includes(b.toLowerCase()));
  if (brand) {
    if (/(deliver|package|parcel|shipment)/.test(lower)) return `${brand} delivery ${channel}`;
    if (/(password|login|sign.?in|verify|account)/.test(lower)) return `${brand} account ${channel}`;
    if (/(invoice|payment|charge|billing|refund)/.test(lower)) return `${brand} payment ${channel}`;
    return `${brand} ${channel}`;
  }
  if (/(bank|account.{0,20}(locked|suspended)|card)/.test(lower)) return `Unknown bank ${channel}`;
  if (/(deliver|package|parcel)/.test(lower)) return `Delivery ${channel}`;
  if (/(won|prize|winner|lottery)/.test(lower)) return `Prize ${channel}`;
  if (/(mum|mom|dad).{0,40}(number|phone)/.test(lower)) return "Family imposter text";
  if (channel === "link") return "Suspicious link";
  return `Suspicious ${channel}`;
}

export function readRecent(): RecentSniff[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as RecentSniff[];
  } catch {
    return [];
  }
}

export function addRecent(text: string, score: number): RecentSniff[] {
  const entry: RecentSniff = { title: genericTitle(text), score, at: Date.now() };
  const list = [entry, ...readRecent()].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  return list;
}

export function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${hrs >= 48 ? "s" : ""} ago`;
}
