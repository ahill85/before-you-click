import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Before You Click — Is this a scam? Ask Basil.",
  description:
    "Paste any suspicious email, text or link. Basil the pug sniffs it and tells you in plain English if it's a scam. Free, no account, no jargon.",
  openGraph: {
    title: "Before You Click 🐶",
    description:
      "Paste any suspicious email, text or link. Basil the pug sniffs it and tells you if it's a scam.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen bg-white">
        <a
          href="#sniff"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-basil focus:text-white focus:px-6 focus:py-3 focus:rounded-2xl focus:text-lg font-bold"
        >
          Skip to scam checker
        </a>
        {children}
      </body>
    </html>
  );
}
