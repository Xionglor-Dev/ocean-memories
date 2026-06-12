import type { MetadataRoute } from "next";
import { getPublishedMemoryUrls } from "@/lib/data/memories";
import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  // Only published memories are indexed in the public sitemap.
  const memories = await getPublishedMemoryUrls();

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...memories.map((memory) => ({
      url: `${siteUrl}/memory/${memory.id}`,
      lastModified: new Date(memory.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
