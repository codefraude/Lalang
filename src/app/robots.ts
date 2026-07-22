import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private/authenticated and transactional routes out of the index.
      disallow: [
        "/api/",
        "/account",
        "/admin",
        "/profile",
        "/reset-password",
        "/verify-email",
        "/verify-email-change",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
