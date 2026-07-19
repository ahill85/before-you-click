import type { MetadataRoute } from "next";

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
        src: "/icon",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
