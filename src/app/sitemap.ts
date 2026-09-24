import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { liveTools } from "@/config/tools";

export const dynamic = "force-static";

/**
 * Registry-driven. Adding a tool to `tools.ts` puts it in the sitemap with no
 * edit here. Only LIVE tools are listed — never submit a URL that 404s.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { path: "/", priority: 1.0 },
    { path: "/tools/", priority: 0.9 },
    { path: "/about/", priority: 0.6 },
    { path: "/privacy-policy/", priority: 0.3 },
    { path: "/terms-of-use/", priority: 0.3 },
    { path: "/disclaimer/", priority: 0.3 },
  ];

  return [
    ...staticPages.map((p) => ({
      url: absoluteUrl(p.path),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p.priority,
    })),
    ...liveTools.map((tool) => ({
      url: absoluteUrl(`/tools/${tool.slug}/`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
