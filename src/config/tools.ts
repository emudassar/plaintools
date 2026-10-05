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
  business: {
    label: "Work & Business",
    blurb: "Pay, cost and logistics arithmetic, with the published rules and figures behind it.",
  },
  math: {
    label: "Math & Study",
    blurb: "Math and science questions worked from open textbook definitions, shown step by step.",
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
  {
    slug: "deck-joist-span-calculator",
    name: "Deck Joist Span Calculator",
    tagline:
      "Pick the lumber species, joist size, spacing and load and get the maximum deck joist span from IRC Table R507.6, plus the cantilever for your back span and a check of your own span.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "IRC Table R507.6 Maximum Deck Joist Spans (2021 and 2024, identical); AWC DCA 6-2015 Table 2",
  },
  {
    slug: "hip-roof-calculator",
    name: "Hip Roof Calculator",
    tagline:
      "Enter the building's length, width, pitch and overhang and get the hip roof's area in squares, the ridge length and the common and hip rafter lengths.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Roof geometry by pitch per 12 in of run; hip rafter method from Griffith, Carpentry §23",
  },
  {
    slug: "gutter-coil-calculator",
    name: "Gutter Coil Calculator",
    tagline:
      "Turn a gutter coil's weight into feet, or feet of gutter into pounds of coil, for 11-3/4, 11-7/8 and 15 inch aluminum, copper and Galvalume coil, from a supplier's published yield chart.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "Gutter Supply \"Coil Yields\" spec sheet (lb per ft and ft per lb)",
  },
  {
    slug: "tip-pool-calculator",
    name: "Tip Pool Calculator",
    tagline:
      "Enter the night's pooled tips and each person's hours (or hours and points) and get every share to the cent, adding up to the pool exactly.",
    category: "business",
    status: "live",
    scope: "US",
    dataset: "Proportional split in whole cents; U.S. DOL WHD Fact Sheet #15 for tip-pool rules context",
  },
  {
    slug: "pressure-washer-nozzle-calculator",
    name: "Pressure Washer Nozzle Calculator",
    tagline:
      "Enter your pressure washer's GPM and PSI and get the nozzle orifice size, the nearest standard sizes and the pressure each would give, from a pump maker's nozzle chart.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "General Pump Nozzle Chart (2021): GPM by nozzle size and PSI",
  },
  {
    slug: "truck-cost-per-mile-calculator",
    name: "Truck Cost Per Mile Calculator",
    tagline:
      "Enter a period's truck costs, fuel and miles and get your cost per mile and per loaded mile, split into fixed, variable and fuel, next to ATRI's industry average.",
    category: "business",
    status: "live",
    scope: "US",
    dataset: "Cost ÷ miles; ATRI 2026 Operational Costs of Trucking benchmark ($2.336/mile in 2025)",
  },
  {
    slug: "linear-feet-calculator-freight",
    name: "Freight Linear Feet Calculator",
    tagline:
      "Enter the pallet count, pallet size and whether they stack, and get the linear feet of trailer floor they take — loaded straight and turned — in a 101-inch-wide trailer or your own.",
    category: "business",
    status: "live",
    scope: "US",
    dataset: "Pallet floor geometry; Utility Trailer 53' dry van inside width (101 in)",
  },
  {
    slug: "playground-mulch-calculator",
    name: "Playground Mulch Calculator",
    tagline:
      "Enter the play area and the surfacing — wood chips, wood mulch, rubber, pea gravel or sand — and get the cubic yards to install at CPSC's minimum depth, allowing for compression.",
    category: "safety",
    status: "live",
    scope: "US",
    dataset: "U.S. CPSC Public Playground Safety Handbook, Table 2 and §2.4.2.2",
  },
  {
    slug: "lumber-cost-calculator",
    name: "Lumber Cost Calculator",
    tagline:
      "Enter a cut list and the prices you were quoted — per piece, linear foot, board foot or MBF — and get the board feet, cost per board foot and total with waste and tax.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "NIST Handbook 130 (2026) board foot definition and Table 1 lumber sizes",
  },
  {
    slug: "log-volume-calculator",
    name: "Log Volume Calculator",
    tagline:
      "Enter a log's small-end diameter and length and get its wood volume in board feet by the Doyle and International 1/4-inch rules, plus cubic feet and cubic metres.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Briggs (1994), Univ. of Washington: log rule formulas and Appendix 3 tables",
  },
  {
    slug: "table-top-epoxy-calculator",
    name: "Table Top Epoxy Calculator",
    tagline:
      "Enter a tabletop's size, coat thickness and number of coats and get the gallons of epoxy to mix, with edges, an allowance for drips and the resin/hardener split.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Volume arithmetic (231 in³/gal, NIST HB 44); cross-checked to TotalBoat's 12.8 sq ft/gal at 1/8 in",
  },
  {
    slug: "cash-drawer-calculator",
    name: "Cash Drawer Calculator",
    tagline:
      "Count the drawer by bills, rolls and coins and get the total, the deposit that leaves your starting float, which notes and coins to pull, and whether it is over or short.",
    category: "business",
    status: "live",
    scope: "US",
    dataset: "Whole-cent arithmetic; U.S. Mint coin roll contents",
  },
  {
    slug: "drawer-size-calculator",
    name: "Drawer Size Calculator",
    tagline:
      "Enter the cabinet opening and get the drawer box width, height and length for Blum TANDEM 563H undermount or Accuride 3832EC side-mount slides, from each maker's clearances.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Blum TANDEM 563H spec sheet; Accuride 3832EC quick reference",
  },
  {
    slug: "gridfinity-calculator",
    name: "Gridfinity Calculator",
    tagline:
      "Enter a drawer's inside size and get how many 42 mm Gridfinity units fit, the leftover margin, the tallest bin in 7 mm units, and how to split the baseplate for your print bed.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Gridfinity Design Reference v5 (gridfinity.xyz): 42 mm grid, 7 mm height unit",
  },
  {
    slug: "angle-drawer-calculator",
    name: "Angle Drawer Calculator",
    tagline:
      "Type an angle in degrees or radians and see it drawn in standard position, with its quadrant, reference angle, coterminal angles and sin, cos and tan.",
    category: "math",
    status: "live",
    scope: "Worldwide",
    dataset: "OpenStax Precalculus 2e, §5.1 Angles",
  },
  {
    slug: "stair-stringer-calculator",
    name: "Stair Stringer Calculator",
    tagline:
      "Enter the total rise and tread depth and get the risers, riser height, total run, stringer length, angle and throat, checked against the American Wood Council's DCA 6 deck stair rules.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "American Wood Council DCA 6 (2015 IRC): stair requirements, Figures 27–30",
  },
  {
    slug: "aquarium-volume-calculator",
    name: "Aquarium Volume Calculator",
    tagline:
      "Enter a fish tank's inside dimensions — rectangle, bow front, cylinder, hexagon or corner — and get the water volume in gallons and litres after substrate and rim gap, plus its weight.",
    category: "health",
    status: "live",
    scope: "Worldwide",
    dataset: "Volume geometry; NIST HB 44 gallon/litre; USGS 8.34 lb per gallon",
  },
  {
    slug: "betta-tank-size-calculator",
    name: "Betta Tank Size Calculator",
    tagline:
      "Enter your betta's tank dimensions or volume and see its real water volume, compared with the RSPCA's 10-litre minimum and 20-litre ideal and a 2024 welfare study's figure.",
    category: "health",
    status: "live",
    scope: "Worldwide",
    dataset: "RSPCA Australia betta care (2024); Clark-Shen et al. 2024, Animal Welfare",
  },
  {
    slug: "cichlid-stocking-calculator",
    name: "Cichlid Stocking Calculator",
    tagline:
      "List the cichlids you plan to keep and see their total adult length from FishBase against a published stocking guideline for your tank's volume.",
    category: "health",
    status: "live",
    scope: "Worldwide",
    dataset: "Practical Fishkeeping stocking guideline; FishBase maximum lengths",
  },
  {
    slug: "honey-yield-calculator",
    name: "Honey Yield Calculator",
    tagline:
      "Weigh your supers before and after extraction and get the honey harvested in pounds, kilograms, gallons and full jars, with yield per hive against USDA's U.S. average.",
    category: "farm",
    status: "live",
    scope: "Worldwide",
    dataset: "National Honey Board (12 lb per gallon); USDA NASS Honey, March 2026",
  },
  {
    slug: "honey-production-calculator",
    name: "Honey Production Calculator",
    tagline:
      "Enter your colonies and state to estimate honey production in pounds and its value, from USDA's 2025 yield per colony and honey prices — or your own figures.",
    category: "farm",
    status: "live",
    scope: "US",
    dataset: "USDA NASS Honey (March 2026): 2025 yield and price by state",
  },
  {
    slug: "horse-calorie-calculator",
    name: "Horse Calorie Calculator",
    tagline:
      "Enter a horse's weight and workload and get its daily digestible energy need in Mcal and kcal from the NRC (2007) equations, with an optional hay and grain check.",
    category: "farm",
    status: "live",
    scope: "Worldwide",
    dataset: "Merck Veterinary Manual (2026), NRC Nutrient Requirements of Horses (2007)",
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
