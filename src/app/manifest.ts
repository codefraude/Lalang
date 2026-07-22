import type { MetadataRoute } from "next";

/**
 * PWA manifest. Lalang is a natural install candidate — the dictionary and the
 * offline translation fallback work without a network — so it declares itself
 * installable with a standalone display and branded icons.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lalang — Translate the languages of our islands",
    short_name: "Lalang",
    description:
      "AI-powered translation between English, French and Mauritian Creole (Kreol Morisien).",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1120",
    theme_color: "#0b1120",
    categories: ["education", "productivity", "reference"],
    lang: "en",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
