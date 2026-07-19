import { VERCEL_ORIGIN } from "./site";

/**
 * On astarmedia the UI is static; /api/sniff still lives on Vercel (same as hoops leaderboard).
 * On Vercel / localhost, same-origin relative URLs are fine.
 */
export function sniffApiUrl(): string {
  if (typeof window === "undefined") return `${VERCEL_ORIGIN}/api/sniff`;
  const host = window.location.hostname;
  if (host === "astarmedia.net" || host.endsWith(".astarmedia.net")) {
    return `${VERCEL_ORIGIN}/api/sniff`;
  }
  return "/api/sniff";
}
