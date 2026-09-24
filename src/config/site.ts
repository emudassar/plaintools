/**
 * THE rebrand file.
 *
 * Changing `name`, `domain` and `url` here must update titles, schema, sitemap,
 * robots, footer and canonical URLs everywhere. No other file should contain the
 * site name or domain as a literal.
 *
 * Keep the name SUBJECT-NEUTRAL. A name tied to one topic boxes the hub in by
 * tool number three, and renaming after indexing is expensive.
 */
export const site = {
  name: "PlainTools",
  domain: "plaintools.site",
  url: "https://plaintools.site",
  tagline: "Free tools that each do one job",
  description:
    "A growing collection of free, single-purpose tools. No sign-up, no downloads, and every result shows where its data came from.",
  founded: "2026",
  contactEmail: "mudassar63663@gmail.com",
  legalUpdated: "2026-09-24",
  jurisdiction: "Pakistan",
  /** Nothing renders while these are empty. */
  adsenseClientId: "",
  gaMeasurementId: "",
} as const;

/**
 * Every third-party service the VISITOR'S BROWSER contacts directly.
 *
 * Tools query sources client-side, so these services receive the visitor's IP
 * address and whatever they typed into the tool. The privacy policy page is
 * GENERATED from this array — adding a tool that calls a new service without
 * adding it here makes the privacy policy factually wrong.
 */
export interface ThirdPartyService {
  name: string;
  purpose: string;
  privacyUrl: string;
  /** What the visitor's browser actually sends to this service. */
  receives: string;
}

export const thirdPartyServices: readonly ThirdPartyService[] = [
  {
    name: "USDA NRCS Soil Data Access",
    purpose:
      "Looks up the soil survey record for a set of coordinates. Used by What Soil Type Is My Property?",
    privacyUrl: "https://www.usda.gov/privacy-policy",
    receives:
      "Your IP address and the latitude/longitude being looked up. Your address text is never sent here — only the coordinates it resolved to.",
  },
  {
    name: "Photon (Komoot)",
    purpose:
      "Turns a typed address into coordinates, and coordinates back into a place name. Used by What Soil Type Is My Property?",
    privacyUrl: "https://www.komoot.com/privacy",
    receives: "Your IP address and the address text or coordinates you entered.",
  },
] as const;

export const isAnalyticsEnabled = site.gaMeasurementId.length > 0;
export const isAdsEnabled = site.adsenseClientId.length > 0;

/** Absolute URL for a site-relative path. Single source of truth for canonicals. */
export function absoluteUrl(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${site.url}${clean}`;
}
