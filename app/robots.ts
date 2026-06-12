import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin screens should never be crawled.
      disallow: ["/admin"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
