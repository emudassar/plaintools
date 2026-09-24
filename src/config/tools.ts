/**
 * THE registry.
 *
 * Adding one entry here wires a tool into the homepage grid, the tools index,
 * the nav dropdown, the footer, related-tool blocks and the sitemap.
 * THERE IS NO SECOND PLACE TO REGISTER A TOOL. If you find yourself editing a
 * second file to add a tool, the architecture is wrong — fix it.
 */

export type ToolStatus = "live" | "building" | "planned";
export type Scope = "US" | "Worldwide";

/**
 * Categories are added ONLY when a tool needs one. Do not pre-invent buckets.
 * Keep labels broad enough to hold future tools ("Home & Property", not "Soil Data").
 */
export const categories = {
  property: {
    label: "Home & Property",
    blurb: "Questions about a specific building or plot, or the systems that serve it.",
  },
  safety: {
    label: "Workplace & Safety",
    blurb: "What a published standard or regulation actually requires.",
  },
} as const;

export type CategoryId = keyof typeof categories;

export interface Tool {
  /** URL is /tools/<slug>. The slug IS the keyword. Never rename after indexing. */
  slug: string;
  /** H1 + nav label, phrased the way people type it. */
  name: string;
  /** One line naming the specific answer the user gets. */
  tagline: string;
  category: CategoryId;
  status: ToolStatus;
  scope: Scope;
  /** Where the answer comes from. */
  dataset: string;
  emdCandidate?: string;
}

/**
 * Only register tools that exist or are genuinely committed. A registry full of
 * speculative entries makes the nav look padded and the "soon" labels age badly.
 */
export const tools: readonly Tool[] = [
  {
    slug: "what-soil-type-is-my-property",
    name: "What Soil Type Is My Property?",
    tagline:
      "Enter an address and get the soil series, texture, drainage, pH and depth to water table for that exact spot.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "USDA NRCS Soil Data Access (SSURGO)",
    emdCandidate: "whatsoiltype.com",
  },
  {
    slug: "osha-soil-classification",
    name: "OSHA Soil Classification",
    tagline:
      "Answer the questions OSHA's criteria ask and get the soil type — A, B, C or stable rock — with the clause that decides it.",
    category: "safety",
    status: "live",
    scope: "US",
    dataset: "OSHA 29 CFR 1926 Subpart P, Appendix A",
    emdCandidate: "oshasoiltype.com",
  },
  {
    slug: "water-softener-size-calculator",
    name: "Water Softener Size Calculator",
    tagline:
      "Enter your water hardness and household size and get the grains removed per day, the capacity that implies, and how often a given unit would regenerate.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "Penn State Extension and NDSU Extension water softening publications",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Build-time slug guard                                               */
/* ------------------------------------------------------------------ */

const SLUG_SHAPE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 60;

/**
 * Filler words describe your product, not the search. Nobody types "free" or
 * "online" as part of the thing they actually want.
 */
const FILLER_WORDS = new Set([
  "tool",
  "utility",
  "online",
  "free",
  "app",
  "website",
  "page",
]);

/**
 * Runs at build time and THROWS, failing the build, on a malformed slug.
 * If a slug fails this guard, FIX THE SLUG — never weaken the guard.
 */
export function assertValidSlugs(list: readonly Tool[] = tools): void {
  const seen = new Set<string>();

  for (const tool of list) {
    const { slug } = tool;

    if (!SLUG_SHAPE.test(slug)) {
      throw new Error(
        `[tools.ts] Invalid slug "${slug}": must be lowercase words separated by single hyphens.`,
      );
    }

    if (slug.length > MAX_SLUG_LENGTH) {
      throw new Error(
        `[tools.ts] Slug "${slug}" is ${slug.length} chars; the limit is ${MAX_SLUG_LENGTH}.`,
      );
    }

    if (seen.has(slug)) {
      throw new Error(`[tools.ts] Duplicate slug "${slug}".`);
    }
    seen.add(slug);

    for (const word of slug.split("-")) {
      if (FILLER_WORDS.has(word)) {
        throw new Error(
          `[tools.ts] Slug "${slug}" contains the filler word "${word}". ` +
            `Filler words describe the product, not the search. Fix the slug.`,
        );
      }
    }
  }
}

// Fail the build, not the browser.
if (typeof window === "undefined") {
  assertValidSlugs();
}

/* ------------------------------------------------------------------ */
/* Derived views — every consumer reads from these                     */
/* ------------------------------------------------------------------ */

export const liveTools: readonly Tool[] = tools.filter((t) => t.status === "live");

export function toolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

/**
 * Like `toolBySlug`, but throws instead of returning undefined.
 *
 * A tool page can never exist without its registry entry — that is what keeps
 * the nav, footer and sitemap honest — so the page module calls this at import
 * time and fails the build if the entry is missing.
 */
export function requireTool(slug: string): Tool {
  const tool = toolBySlug(slug);
  if (!tool) {
    throw new Error(
      `[tools.ts] No registry entry for slug "${slug}". Add it to tools.ts — there is no second place to register a tool.`,
    );
  }
  return tool;
}

/** Only categories that actually hold a tool. Never render an empty bucket. */
export const usedCategories = (
  Object.keys(categories) as CategoryId[]
).filter((id) => tools.some((t) => t.category === id));

/** Categories that hold at least one LIVE tool. */
export const usedCategoriesLive = (
  Object.keys(categories) as CategoryId[]
).filter((id) => liveTools.some((t) => t.category === id));

export function toolsInCategory(id: CategoryId, liveOnly = false): readonly Tool[] {
  const source = liveOnly ? liveTools : tools;
  return source.filter((t) => t.category === id);
}

/** Same category first, then fill from elsewhere. Live tools only — never link to a page that does not exist. */
export function relatedTools(slug: string, limit = 6): readonly Tool[] {
  const current = toolBySlug(slug);
  const pool = liveTools.filter((t) => t.slug !== slug);
  if (!current) return pool.slice(0, limit);

  const sameCategory = pool.filter((t) => t.category === current.category);
  const others = pool.filter((t) => t.category !== current.category);
  return [...sameCategory, ...others].slice(0, limit);
}

/**
 * The nav flips from a flat list to grouped columns once there are enough tools.
 * A seven-column mega-menu over three tools looks broken.
 */
export const NAV_GROUPING_THRESHOLD = 8;
export const shouldGroupNav = liveTools.length >= NAV_GROUPING_THRESHOLD;
