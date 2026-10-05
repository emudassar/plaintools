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
  construction: {
    label: "Construction & DIY",
    blurb: "Measurements, framing and material questions with a concrete numeric or code answer.",
  },
  farm: {
    label: "Farm & Livestock",
    blurb: "Breeding, feeding and field questions answered from extension and agency publications.",
  },
  health: {
    label: "Health & Everyday",
    blurb: "Everyday measurement questions answered from published specifications and agency formulas.",
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
  {
    slug: "roof-pitch-calculator",
    name: "Roof Pitch Calculator",
    tagline:
      "Enter the rise and run and get the pitch as x-in-12, the angle, the slope percentage and the rafter length — plus which roof coverings the IRC allows at that slope.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "Geometry, and the 2021 International Residential Code, Chapter 9",
  },
  {
    slug: "septic-tank-size-calculator",
    name: "Septic Tank Size Calculator",
    tagline:
      "Enter the number of bedrooms and get the minimum tank capacity EPA's design manual reports for one- and two-family homes, with the table and page it comes from.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "USEPA Onsite Wastewater Treatment Systems Manual, Table 4-13",
  },
  {
    slug: "rebar-size-chart",
    name: "Rebar Size Chart",
    tagline:
      "Pick a bar size and get its diameter, cross-sectional area and weight per foot in US and metric units, from a state DOT's published reinforcement table.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "Illinois DOT Standard 001001-02, Areas of Reinforcement Bars",
  },
  {
    slug: "egress-window-calculator",
    name: "Egress Window Calculator",
    tagline:
      "Enter a window's clear opening and sill height and see which IRC R310 egress minimums it meets — area, width, height, sill and window well — with the section for each.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "2021 International Residential Code, Section R310",
  },
  {
    slug: "ada-parking-space-requirements",
    name: "How Many ADA Parking Spaces Are Required?",
    tagline:
      "Enter the total spaces in a parking lot and get the minimum accessible and van-accessible count from the 2010 ADA Standards, with the rule and the arithmetic.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "2010 ADA Standards for Accessible Design, §208.2 and §502",
  },
  {
    slug: "ada-ramp-calculator",
    name: "ADA Ramp Calculator",
    tagline:
      "Enter the rise and get the minimum ramp length, the number of runs and landings, and whether handrails are required under the 2010 ADA Standards §405.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "2010 ADA Standards for Accessible Design, §303 and §405",
  },
  {
    slug: "propane-tank-expiration-date",
    name: "When Does My Propane Tank Expire?",
    tagline:
      "Enter the date stamped on your propane cylinder's collar, and any requalification mark, and get the month it next needs requalifying under 49 CFR 180.209.",
    category: "safety",
    status: "live",
    scope: "US",
    dataset: "49 CFR 180.209(e) and (g), marks per 49 CFR 180.213",
  },
  {
    slug: "fire-extinguisher-expiration-date",
    name: "When Does My Fire Extinguisher Expire?",
    tagline:
      "Pick the extinguisher type and enter its manufacture or last test date to get the next hydrostatic test, and the 6-year maintenance where it applies, from OSHA 1910.157 Table L-1.",
    category: "safety",
    status: "live",
    scope: "US",
    dataset: "OSHA 29 CFR 1910.157(e) and (f), Table L-1",
  },
  {
    slug: "how-many-smoke-detectors-do-i-need",
    name: "How Many Smoke Detectors Do I Need?",
    tagline:
      "Enter your bedrooms, sleeping areas and levels and get the minimum number of smoke alarms the International Residential Code requires, location by location, for the 2024 or 2021 edition.",
    category: "safety",
    status: "live",
    scope: "US",
    dataset: "2024 IRC Section R310.3 / 2021 IRC Section R314.3",
  },
  {
    slug: "pool-salt-calculator",
    name: "Pool Salt Calculator",
    tagline:
      "Enter your pool's volume, current salt reading and target level and get the pounds of salt to add — or how much water to replace if the salt is too high.",
    category: "property",
    status: "live",
    scope: "Worldwide",
    dataset: "Mass-balance formula, cross-checked against Hayward's AquaRite manual salt table",
  },
  {
    slug: "pool-shock-calculator",
    name: "Pool Shock Calculator",
    tagline:
      "Enter your pool's volume, current and target free chlorine and the product you use, and get how much shock to add — from a state health department's published dose table.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "Indiana Department of Health pool chemical adjustment guide (adapted from the NSPF handbook)",
  },
  {
    slug: "muriatic-acid-pool-calculator",
    name: "Muriatic Acid Pool Calculator",
    tagline:
      "Enter your pool's volume and current and target total alkalinity and get how much 31.4% muriatic acid to add, and how many separate additions the one-quart limit means.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "Indiana Department of Health pool chemical adjustment guide (adapted from the NSPF handbook)",
  },
  {
    slug: "pool-alkalinity-calculator",
    name: "Pool Alkalinity Calculator",
    tagline:
      "Enter your pool's volume and current and target total alkalinity and get how much baking soda, soda ash or sesquicarbonate raises it — or acid lowers it — product by product.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "Indiana Department of Health pool chemical adjustment guide (adapted from the NSPF handbook)",
  },
  {
    slug: "pool-stabilizer-calculator",
    name: "Pool Stabilizer Calculator",
    tagline:
      "Enter your pool's volume and current and target stabilizer (cyanuric acid) and get how much to add — or what share of the water to replace if it is too high.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "Indiana Department of Health pool chemical adjustment guide (adapted from the NSPF handbook)",
  },
  {
    slug: "pool-pump-run-time-calculator",
    name: "Pool Pump Run Time Calculator",
    tagline:
      "Enter your pool's volume and the flow through the filter and get how long one turnover takes and how many hours a day the pump must run — with the CDC model code's maximum turnover times for public pools.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "CDC Model Aquatic Health Code 2023, section 4.7.1.10 and Table 4.7.1.10",
  },
  {
    slug: "pool-heater-size-calculator",
    name: "Pool Heater Size Calculator",
    tagline:
      "Enter your pool's size, the temperature you want and the coldest month's average and get the approximate gas heater output in Btu/hour, by the U.S. Department of Energy's formula.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "U.S. Department of Energy, Energy Saver: Gas Pool Heaters (sizing formula)",
  },
  {
    slug: "cow-gestation-calculator",
    name: "Cow Gestation Calculator",
    tagline:
      "Enter a breeding or AI date and get the calving date at the traditional 283 days and at the shorter average a 101,787-mating Angus study found — with the window most calves arrive in.",
    category: "farm",
    status: "live",
    scope: "Worldwide",
    dataset: "K-State Extension Beef Tips (July 2026), gestation length in modern beef cattle",
  },
  {
    slug: "sheep-gestation-calculator",
    name: "Sheep Gestation Calculator",
    tagline:
      "Enter a breeding date — or the dates a ram or crayon colour was on — and get the lambing window from the Merck Veterinary Manual's 144–150-day normal gestation.",
    category: "farm",
    status: "live",
    scope: "Worldwide",
    dataset: "Merck Veterinary Manual (normal sheep gestation 144–150 days)",
  },
  {
    slug: "r22-pt-chart",
    name: "R22 PT Chart",
    tagline:
      "Enter a temperature to get R-22's saturation pressure, or a gauge reading to get its saturation temperature — °F or °C, psig, psia, kPa or bar — from NIST data, −40°F to 150°F.",
    category: "property",
    status: "live",
    scope: "Worldwide",
    dataset: "NIST Chemistry WebBook (SRD 69), R22 saturation properties",
  },
  {
    slug: "well-pump-size-calculator",
    name: "Well Pump Size Calculator",
    tagline:
      "Count your bathrooms and fixtures and get the pump capacity in gallons per minute by the Water Systems Council's two methods — fixture count and seven-minute peak demand — checked against your well's yield.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "Water Systems Council wellcare sheet, Sizing a Well Pump",
  },
  {
    slug: "npt-tap-drill-size",
    name: "NPT Tap Drill Size",
    tagline:
      "Pick a pipe thread size from 1/16 to 3 inch and get the tap drill for NPT — with its decimal and millimetre size and the NPS straight-thread drill — from a tap maker's published chart.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Sowa Tool tap & drill chart, taper pipe taps (NPT) and straight pipe taps (NPS)",
  },
  {
    slug: "sine-bar-calculator",
    name: "Sine Bar Calculator",
    tagline:
      "Enter a sine bar's length and an angle in degrees, minutes and seconds to get the gauge block stack height — or enter the stacks to get the angle. Inches or millimetres.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Sine bar formula, Manufacturing Processes 4-5 (open textbook, CC BY)",
  },
  {
    slug: "asphalt-tonnage-calculator",
    name: "Asphalt Tonnage Calculator",
    tagline:
      "Enter the area and compacted thickness and get the tons of hot-mix asphalt, using the 110 lb per square yard per inch rule of thumb or a state DOT's spread rate.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "Asphalt magazine (Asphalt Institute), Equation 1 and the 110 lb/sq yd/in spread rate",
  },
  {
    slug: "asphalt-millings-calculator",
    name: "Asphalt Millings Calculator",
    tagline:
      "Enter the area and compacted depth and get the cubic yards of asphalt millings and a tons range from FHWA's published weight for reclaimed asphalt — or your supplier's own weight.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "FHWA-RD-97-148, Reclaimed Asphalt Pavement, Table 13-2",
  },
  {
    slug: "shower-floor-slope-calculator",
    name: "Shower Floor Slope Calculator",
    tagline:
      "Enter the distance from the drain to the farthest edge of the shower floor and get how high that edge must sit under the 2021 IRC's ¼ to ½ inch per foot rule — and check a planned slope and curb.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "2021 International Residential Code, Section P2709.1",
  },
  {
    slug: "door-handing-chart",
    name: "Door Handing Chart",
    tagline:
      "Answer three questions — which side you're on, where the hinges are, which way the door swings — and get the door hand: LH, RH, LHR or RHR, by Allegion's published handing rule.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "Allegion Steelcraft handing procedures and Schlage handing instruction",
  },
  {
    slug: "capsule-size-chart",
    name: "Capsule Size Chart",
    tagline:
      "Pick a capsule size, 000 to 5, and get its volume, how many mg it holds at your powder's density, and its length and diameter — or enter a fill and get the smallest size that holds it.",
    category: "health",
    status: "live",
    scope: "Worldwide",
    dataset: "Capsugel Coni-Snap hard gelatin capsule specifications",
  },
  {
    slug: "motorcycle-wind-chill-chart",
    name: "Motorcycle Wind Chill Chart",
    tagline:
      "Enter the air temperature and your riding speed and get the wind chill by the National Weather Service formula, with a full chart from 10 to 80 mph.",
    category: "health",
    status: "live",
    scope: "Worldwide",
    dataset: "National Weather Service wind chill formula (2001)",
  },
  {
    slug: "christmas-tree-light-calculator",
    name: "Christmas Tree Light Calculator",
    tagline:
      "Enter your tree's height and the lights per set and get how many lights and sets to buy, by the 100-lights-per-foot rule, plus how many incandescent sets CPSC says can be joined.",
    category: "health",
    status: "live",
    scope: "Worldwide",
    dataset: "Published lights-per-foot rule of thumb; U.S. CPSC holiday safety guidance",
  },
  {
    slug: "chainsaw-file-size-chart",
    name: "Chainsaw File Size Chart",
    tagline:
      "Pick your chain's pitch or the number stamped on its drive link and get the round file size, filing angles and depth-gauge setting from Oregon's published chart, with STIHL's own figure alongside.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Oregon saw chain filing and grinding angles chart (catalog p. FOR 149); STIHL saw chain files",
  },
  {
    slug: "aquarium-gravel-calculator",
    name: "Aquarium Gravel Calculator",
    tagline:
      "Enter your tank's inside length and width and the bed depth you want and get the pounds of gravel or sand and the number of bags, using CaribSea's published formula and substrate weights.",
    category: "health",
    status: "live",
    scope: "Worldwide",
    dataset: "CaribSea FAQ: length x width x depth / 1,728 x substrate density",
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
