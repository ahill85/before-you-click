import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://before-you-click.vercel.app";
const TITLE = "Before You Click — Is this a scam? Ask Basil.";
const DESCRIPTION =
  "Free scam checker. Paste any suspicious email, text, link or screenshot. Basil the pug sniffs it and tells you in plain English if it's a scam. No account. No jargon.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Before You Click",
  },
  description: DESCRIPTION,
  applicationName: "Before You Click",
  keywords: [
    "scam checker",
    "is this a scam",
    "phishing detector",
    "fake email checker",
    "suspicious text message",
    "scam link checker",
    "before you click",
    "Basil the pug",
  ],
  authors: [{ name: "Before You Click" }],
  creator: "Before You Click",
  category: "security",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Before You Click",
    title: "Before You Click 🐶 — Is this a scam?",
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Before You Click 🐶 — Is this a scam?",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d97706",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Before You Click",
  url: SITE_URL,
  description: DESCRIPTION,
  applicationCategory: "SecurityApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Scam email checker",
    "Suspicious text message checker",
    "Phishing link detector",
    "Screenshot OCR sniff",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
