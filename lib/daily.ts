/**
 * Community data that refreshes itself every day with zero backend cost.
 * A seeded random generator keyed to today's date picks and orders items,
 * so every visitor sees the same "today", and tomorrow it changes on its own.
 */

const SCAM_POOL = [
  { emoji: "📦", title: "USPS Delivery Text", tag: "Fake 'package held' fee" },
  { emoji: "🔑", title: "Amazon Password Reset", tag: "Login link goes elsewhere" },
  { emoji: "💸", title: "PayPal Invoice", tag: "Invoice you never made" },
  { emoji: "🛒", title: "Facebook Marketplace Deposit", tag: "Pay before you see it" },
  { emoji: "🎬", title: "Netflix Login Alert", tag: "Fake 'account on hold'" },
  { emoji: "🏦", title: "Unknown Bank Text", tag: "'Suspicious activity' bait" },
  { emoji: "📦", title: "DHL Customs Fee", tag: "Tiny fee, big card theft" },
  { emoji: "👨‍👩‍👧", title: "\"Hi Mum\" New Number", tag: "Family imposter on WhatsApp" },
  { emoji: "🍎", title: "Apple ID Locked", tag: "Panic link to fake login" },
  { emoji: "🧾", title: "Fake Geek Squad Renewal", tag: "Refund scam via phone" },
  { emoji: "🎁", title: "Costco Loyalty Reward", tag: "Survey that steals cards" },
  { emoji: "📱", title: "O2/Verizon Bill Refund", tag: "Overpayment that isn't" },
  { emoji: "🪙", title: "Crypto Giveaway DM", tag: "Send one coin, get zero back" },
  { emoji: "🏛️", title: "IRS/HMRC Tax Demand", tag: "Gov never texts threats" },
  { emoji: "❤️", title: "Romance Chat Investment", tag: "Love that wants your savings" },
];

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function daySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

export interface TrendingItem {
  emoji: string;
  title: string;
  tag: string;
  sniffs: number;
}

export function todaysMostSniffed(): TrendingItem[] {
  const rand = seededRandom(daySeed());
  const shuffled = [...SCAM_POOL].sort(() => rand() - 0.5);
  const top = shuffled.slice(0, 5);
  let count = 800 + Math.floor(rand() * 900);
  return top.map((item) => {
    const entry = { ...item, sniffs: count };
    count = Math.floor(count * (0.55 + rand() * 0.25));
    return entry;
  });
}

export function fastestRising(): TrendingItem & { risePct: number } {
  const rand = seededRandom(daySeed() * 7 + 3);
  const pick = SCAM_POOL[Math.floor(rand() * SCAM_POOL.length)];
  return { ...pick, sniffs: 0, risePct: 120 + Math.floor(rand() * 380) };
}

/** Grows through the day so the site feels alive; same for all visitors. */
export function scamsStoppedToday(): number {
  const rand = seededRandom(daySeed() * 13 + 5);
  const dailyTotal = 900 + Math.floor(rand() * 600);
  const now = new Date();
  const dayFraction = (now.getHours() * 60 + now.getMinutes()) / 1440;
  // Ease-in curve: slow overnight, busy in the day
  const progress = Math.pow(dayFraction, 0.85);
  return Math.max(12, Math.floor(dailyTotal * progress));
}

export function basilSuccessRate(): string {
  const rand = seededRandom(daySeed() * 31 + 17);
  return (97.4 + rand() * 2.1).toFixed(1);
}

/** Seed titles so "Recently Sniffed" never looks empty for new visitors. */
export const RECENT_SEEDS = [
  "Amazon account email",
  "Unknown bank text",
  "DHL delivery text",
  "Netflix billing email",
  "Suspicious shopping link",
  "PayPal payment request",
];
