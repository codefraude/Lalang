import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/env";

/** Public, indexable routes. Authenticated/transactional pages are omitted. */
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/translator", priority: 0.9, changeFrequency: "weekly" },
  { path: "/dictionary", priority: 0.9, changeFrequency: "weekly" },
  { path: "/learn", priority: 0.8, changeFrequency: "weekly" },
  { path: "/login", priority: 0.3, changeFrequency: "yearly" },
  { path: "/register", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${APP_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
