import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Before You Click — Ask Basil",
    short_name: "Before You Click",
    description:
      "Paste a suspicious email, text or link. Basil the pug sniffs out scams in plain English.",
    start_url: "https://astarmedia.net/before-you-click/",
    id: "https://astarmedia.net/before-you-click/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#d97706",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
