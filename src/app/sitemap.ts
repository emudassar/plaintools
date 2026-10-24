import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { liveTools } from "@/config/tools";
import { blankMaps } from "@/config/blank-maps";
import lastmod from "@/data/lastmod.json";

export const dynamic = "force-static";

/**
 * Registry-driven. Adding a tool to `tools.ts` puts it in the sitemap with no
 * edit here. Only LIVE tools are listed — never submit a URL that 404s.
 */
/**
 * lastModified is the date the page's source last changed in git (scripts/build-lastmod.mjs,
 * run before every build), not the build time. A page with no committed history yet is new,
 * so it gets the build time.
 */
const dates = lastmod as Record<string, string>;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const changed = (path: string) => (dates[path] ? new Date(dates[path]) : now);

  const staticPages = [
    { path: "/", priority: 1.0 },
    { path: "/tools/", priority: 0.9 },
    { path: "/maps/blank/", priority: 0.8 },
    { path: "/about/", priority: 0.6 },
    { path: "/privacy-policy/", priority: 0.3 },
    { path: "/terms-of-use/", priority: 0.3 },
    { path: "/disclaimer/", priority: 0.3 },
  ];

  return [
    ...staticPages.map((p) => ({
      url: absoluteUrl(p.path),
      lastModified: changed(p.path),
      changeFrequency: "monthly" as const,
      priority: p.priority,
    })),
    ...liveTools.map((tool) => ({
      url: absoluteUrl(`/tools/${tool.slug}/`),
      lastModified: changed(`/tools/${tool.slug}/`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...blankMaps.map((m) => ({
      url: absoluteUrl(`/maps/blank/${m.slug}/`),
      lastModified: changed("/maps/blank/*"),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
