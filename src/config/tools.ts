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
  outdoors: {
    label: "Sports & Outdoors",
    blurb: "Gear sizing and outdoor questions answered from manufacturers' published charts and guides.",
  },
  location: {
    label: "Maps & Location",
    blurb: "Where a point is, how far apart places are, and what public datasets record for a set of coordinates.",
  },
  math: {
    label: "Math & Study",
    blurb: "Math and science questions worked from open textbook definitions, shown step by step.",
  },
  yard: {
    label: "Yard & Garden",
    blurb: "Landscape material, lawn and garden quantities worked from published conversion factors and rates.",
  },
  energy: {
    label: "Energy & Electrical",
    blurb: "Power, voltage and fuel-use arithmetic from published constants and the formulas behind them.",
  },
  mechanical: {
    label: "Auto & Mechanical",
    blurb: "Engines, fittings, fluids and machining figures from published standards and textbook formulas.",
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
  /** Optional. Tools sharing a cluster link to each other first in related-tool blocks. */
  cluster?: string;
}

/**
 * Only register tools that exist or are genuinely committed. A registry full of
 * speculative entries makes the nav look padded and the "soon" labels age badly.
 */
export const tools: readonly Tool[] = [
  {
    slug: "what-soil-type-is-my-property",
    cluster: "soil",
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
    cluster: "soil",
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
    cluster: "home-water",
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
    cluster: "roofing",
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
    cluster: "home-water",
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
    cluster: "ada",
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
    cluster: "ada",
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
    cluster: "fire-safety",
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
    cluster: "fire-safety",
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
    cluster: "fire-safety",
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
    cluster: "pool",
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
    cluster: "pool",
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
    cluster: "pool",
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
    cluster: "pool",
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
    cluster: "pool",
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
    cluster: "pool",
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
    cluster: "pool",
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
    cluster: "gestation",
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
    cluster: "gestation",
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
    cluster: "home-water",
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
    cluster: "asphalt",
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
    cluster: "asphalt",
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
    cluster: "aquarium",
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
    cluster: "framing",
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
    cluster: "roofing",
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
    cluster: "roofing",
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
    cluster: "freight",
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
    cluster: "freight",
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
    cluster: "framing",
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
    cluster: "epoxy",
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
    cluster: "drawer",
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
    cluster: "drawer",
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
    cluster: "framing",
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
    cluster: "aquarium",
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
    cluster: "aquarium",
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
    cluster: "aquarium",
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
    cluster: "honey",
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
    cluster: "honey",
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
    cluster: "horse",
    name: "Horse Calorie Calculator",
    tagline:
      "Enter a horse's weight and workload and get its daily digestible energy need in Mcal and kcal from the NRC (2007) equations, with an optional hay and grain check.",
    category: "farm",
    status: "live",
    scope: "Worldwide",
    dataset: "Merck Veterinary Manual (2026), NRC Nutrient Requirements of Horses (2007)",
  },
  {
    slug: "horse-blanket-size-chart",
    cluster: "horse",
    name: "Horse Blanket Size Chart",
    tagline:
      "Enter your horse's chest-to-rump measurement and get the blanket size in US inches, UK feet and centimetres, plus the Euro back-seam size, with the full chart.",
    category: "farm",
    status: "live",
    scope: "Worldwide",
    dataset: "WeatherBeeta horse blanket size guide",
  },
  {
    slug: "horse-feed-cost-calculator",
    cluster: "horse",
    name: "Horse Feed Cost Calculator",
    tagline:
      "Enter hay and grain amounts and your bale and bag prices and get the daily, monthly and yearly cost to feed a horse, plus bales and bags used per month.",
    category: "farm",
    status: "live",
    scope: "Worldwide",
    dataset: "Owner's own prices; Merck Veterinary Manual forage guideline",
  },
  {
    slug: "resin-volume-calculator",
    cluster: "epoxy",
    name: "Resin Volume Calculator",
    tagline:
      "Enter a mold's shape and inside size, or the water it holds, and get the resin to mix in ml and fl oz, its weight, and the part A / part B split.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Solid geometry; specific gravities from Smooth-On and West System technical data sheets",
  },
  {
    slug: "stl-volume-calculator",
    name: "STL Volume Calculator",
    tagline:
      "Open a binary or ASCII STL file in your browser and get its volume, bounding box, a closed-mesh check and the solid weight in PLA, PETG, ASA or your own material.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Signed-tetrahedron volume (Zhang & Chen 2001); Prusament filament densities",
  },
  {
    slug: "boat-fuel-cost-calculator",
    name: "Boat Fuel Cost Calculator",
    tagline:
      "Enter your boat's fuel burn and engine hours, or distance and speed, plus the fuel price, and get the trip's fuel, cost, cost per hour and mile, and rule-of-thirds fuel to carry.",
    category: "business",
    status: "live",
    scope: "Worldwide",
    dataset: "Owner's burn rate and price; NC Sea Grant full-throttle estimate and rule of thirds",
  },
  {
    slug: "what-size-trolling-motor-do-i-need",
    name: "Trolling Motor Size Calculator",
    tagline:
      "Enter your fully loaded boat weight and get the minimum trolling motor thrust, the 12/24/36 V battery setup, and the shaft length for your bow or transom height.",
    category: "health",
    status: "live",
    scope: "Worldwide",
    dataset: "Minn Kota Motor Size selection guide (Rev. 8.21.2020) and buying guide",
  },
  {
    slug: "ski-size-chart",
    cluster: "snow-sports",
    name: "Ski Size Chart",
    tagline:
      "Enter height, and a child's weight, and get the suggested ski length range in cm from Nordica's adult and junior charts, plus which end of the range to lean toward.",
    category: "outdoors",
    status: "live",
    scope: "Worldwide",
    dataset: "Nordica Ski Sizer (adult and child charts)",
  },
  {
    slug: "ski-boot-size-chart",
    cluster: "snow-sports",
    name: "Ski Boot Size Chart",
    tagline:
      "Convert a Mondopoint ski boot size to US men's, women's, kids', EU and UK sizes, or the other way round, with Nordica's standard and performance fit sizes.",
    category: "outdoors",
    status: "live",
    scope: "Worldwide",
    dataset: "Nordica Ski Boot Sizing Chart (men's, women's and junior)",
  },
  {
    slug: "snowboard-size-chart",
    cluster: "snow-sports",
    name: "Snowboard Size Chart",
    tagline:
      "Enter your weight and boot size and get the snowboard length from Jones's adult and kids charts, the middle size when you fall in two ranges, and the minimum waist width if you need a wide board.",
    category: "outdoors",
    status: "live",
    scope: "Worldwide",
    dataset: "Jones Snowboards size guide (weight charts and wide-board chart)",
  },
  {
    slug: "oil-tank-chart",
    name: "Oil Tank Chart",
    tagline:
      "Enter the inches of oil on your dipstick and get the gallons left in a 275 or 330 gallon oval tank, a 500, 550 or 1000 gallon round tank, or your own tank, with the full inch-by-inch chart.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "Tank geometry (circular-segment areas) × rated capacity; pickhvac.com standard tank sizes",
  },
  {
    slug: "bradford-white-water-heater-age",
    cluster: "appliance-age",
    name: "Bradford White Water Heater Age",
    tagline:
      "Type the serial number from a Bradford White water heater and get the month and year it was made and its age, using Bradford White's own date code.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "Bradford White 'Determining The Age Of A Water Heater' bulletin",
  },
  {
    slug: "water-heater-age-by-serial-number",
    cluster: "appliance-age",
    name: "Water Heater Age by Serial Number",
    tagline:
      "Pick the brand, type the serial number from the rating plate, and get when an A. O. Smith, Rheem or Bradford White water heater was made and how old it is.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "Makers' published serial formats: A. O. Smith Service and Warranty Guide, Rheem, Bradford White",
  },
  {
    slug: "scuba-weight-calculator",
    name: "Scuba Weight Calculator",
    tagline:
      "Enter your body weight, suit, water and tank and get a starting dive weight from PADI's and DAN's guidelines, with each adjustment listed.",
    category: "outdoors",
    status: "live",
    scope: "Worldwide",
    dataset: "PADI and DAN weighting guidelines; Scuba Diving magazine buoyancy article",
  },
  {
    slug: "horse-color-calculator",
    cluster: "horse",
    name: "Horse Color Calculator",
    tagline:
      "Enter the sire's and dam's coat color test results and get the odds of each foal color, from chestnut, bay and black to palomino, buckskin, cremello and grullo.",
    category: "farm",
    status: "live",
    scope: "Worldwide",
    dataset: "UC Davis Veterinary Genetics Laboratory gene pages (Extension, Agouti, Cream, Dun, Gray)",
  },
  {
    slug: "what-year-is-my-mercury-outboard",
    name: "What Year Is My Mercury Outboard?",
    tagline:
      "Type the two-letter year code from your Mercury outboard's serial number decal and get the year it was made, using the table in Mercury's own manual.",
    category: "outdoors",
    status: "live",
    scope: "Worldwide",
    dataset: "Mercury Marine owner's manual 8M0165094, Model Year Production Code",
  },
  {
    slug: "go-kart-gear-ratio-calculator",
    name: "Go Kart Gear Ratio Calculator",
    tagline:
      "Enter clutch and axle sprocket teeth, tyre size and engine RPM and get the gear ratio, theoretical top speed and a gear ratio chart, with jackshaft support.",
    category: "outdoors",
    status: "live",
    scope: "Worldwide",
    dataset: "Chain-drive gear ratio and speed formula (CSG Network kart speed calculator)",
  },
  {
    slug: "goat-gestation-calculator",
    cluster: "gestation",
    name: "Goat Gestation Calculator",
    tagline:
      "Enter a breeding date — or the dates a buck ran with the does — and get the kidding window from the Merck Veterinary Manual's 145–155-day goat gestation.",
    category: "farm",
    status: "live",
    scope: "Worldwide",
    dataset: "Merck Veterinary Manual (goat gestation 145–155 days, average 150)",
  },
  {
    slug: "pig-gestation-calculator",
    cluster: "gestation",
    name: "Pig Gestation Calculator",
    tagline:
      "Enter a breeding date and get the farrowing date at 114 days and the 113–116-day farrowing window, plus a gestation chart of key dates.",
    category: "farm",
    status: "live",
    scope: "Worldwide",
    dataset: "Merck Veterinary Manual (pig 114 days); Pork Industry Handbook (113–116 days)",
  },
  {
    slug: "knitting-needle-size-chart",
    name: "Knitting Needle Size Chart",
    tagline:
      "Convert a knitting needle size between millimetres and US numbers using the Craft Yarn Council standard, with the full chart and the sizes that share a US number.",
    category: "health",
    status: "live",
    scope: "Worldwide",
    dataset: "Craft Yarn Council standard — Hooks & Needles",
  },
  {
    slug: "deck-beam-span-chart",
    cluster: "framing",
    name: "Deck Beam Span Chart",
    tagline:
      "Pick the species, load, joist span and joist overhang and get the maximum deck beam span for every built-up beam size from IRC Table R507.5.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "IRC 2024 Tables R507.5(1)–(4) Maximum Deck Beam Span",
  },
  {
    slug: "firewood-calculator",
    name: "Firewood Calculator",
    tagline:
      "Enter the length, height and depth of a woodpile and get its volume in cords (128 cubic feet), face cords and cubic metres, plus the price per full cord.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "NIST Handbook 130 cord definition (128 cubic feet, ranked and well stowed)",
  },
  {
    slug: "baseboard-calculator",
    cluster: "trim",
    name: "Baseboard Calculator",
    tagline:
      "Enter the room's walls, doorways and stock length and get the linear feet of baseboard, the number of pieces to buy with waste, and the cost.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Perimeter arithmetic (walls − openings, plus waste allowance)",
  },
  {
    slug: "how-many-screws-per-sheet-of-drywall",
    name: "How Many Screws per Sheet of Drywall",
    tagline:
      "Pick the sheet size, wall or ceiling and framing spacing and get the screw count per sheet and for the job at the IRC's maximum fastener spacing.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "IRC 2024 Table R702.3.5 (maximum fastener spacing for gypsum board)",
  },
  {
    slug: "roller-chain-size-chart",
    name: "Roller Chain Size Chart",
    tagline:
      "Measure the pitch, roller diameter and inner width of a chain and identify its ANSI number (25 to 240), with the full dimension chart in inches and millimetres.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Tsubaki ANSI roller chain dimension table (RS25–RS240)",
  },
  {
    slug: "crown-molding-angle-chart",
    cluster: "trim",
    name: "Crown Molding Angle Chart",
    tagline:
      "Enter the corner angle and the molding's spring angle and get the miter and bevel settings for cutting crown flat on a compound miter saw, with a full angle chart.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Compound-miter formulas for crown molding (spring angle and wall angle)",
  },
  {
    slug: "fishing-reel-line-capacity-calculator",
    name: "Fishing Reel Line Capacity Calculator",
    tagline:
      "Enter the reel's rated capacity and your line's diameter and get how many yards or metres of that line the spool holds, including braid over mono backing.",
    category: "outdoors",
    status: "live",
    scope: "Worldwide",
    dataset: "Spool capacity ∝ line diameter² × length (cylinder volume)",
  },
  {
    slug: "what-is-my-elevation",
    cluster: "where-am-i",
    name: "What Is My Elevation?",
    tagline:
      "Use your current location or type an address and get the ground elevation above sea level in feet and metres, from USGS 3DEP and the Copernicus 90 m model side by side.",
    category: "location",
    status: "live",
    scope: "Worldwide",
    dataset: "USGS 3D Elevation Program (EPQS) and Copernicus DEM GLO-90",
  },
  {
    slug: "what-county-am-i-in",
    cluster: "where-am-i",
    name: "What County Am I In?",
    tagline:
      "Use your current location or type an address and get the county (or parish, borough or municipio), state and FIPS codes from the 2020 Census, with a warning when you are near a county line.",
    category: "location",
    status: "live",
    scope: "US",
    dataset: "FCC Area API (2020 Census blocks)",
  },
  {
    slug: "what-state-am-i-in",
    cluster: "where-am-i",
    name: "What State Am I In?",
    tagline:
      "Use your current location or type an address and get the US state or territory you are in from the 2020 Census, with a warning when you are close to a state line.",
    category: "location",
    status: "live",
    scope: "US",
    dataset: "FCC Area API (2020 Census blocks)",
  },
  {
    slug: "what-country-am-i-in",
    cluster: "where-am-i",
    name: "What Country Am I In?",
    tagline:
      "Use your device's location or a typed place and get the country it falls in, with its ISO code and region, from OpenStreetMap data — not from your IP address.",
    category: "location",
    status: "live",
    scope: "Worldwide",
    dataset: "OpenStreetMap via the Photon geocoder",
  },
  {
    slug: "as-the-crow-flies-distance-calculator",
    cluster: "distance",
    name: "As the Crow Flies Distance Calculator",
    tagline:
      "Enter two places and get the straight-line distance between them in miles, kilometres and nautical miles, measured on the WGS84 ellipsoid, with the compass bearing and the route on a map.",
    category: "location",
    status: "live",
    scope: "Worldwide",
    dataset: "Vincenty (1975) geodesic on the WGS84 ellipsoid",
  },
  {
    slug: "halfway-point-between-two-cities-calculator",
    cluster: "distance",
    name: "Halfway Point Between Two Cities Calculator",
    tagline:
      "Enter two cities or addresses and get the exact halfway point between them — or any split you choose — with the nearest named place and the distance from each side.",
    category: "location",
    status: "live",
    scope: "Worldwide",
    dataset: "Vincenty (1975) geodesic midpoint on WGS84, OpenStreetMap place names",
  },
  {
    slug: "random-location-generator",
    cluster: "distance",
    name: "Random Location Generator",
    tagline:
      "Generate truly uniform random coordinates anywhere on Earth, inside a box, or within a radius of a place — with an option to skip open sea and the points shown on a map.",
    category: "location",
    status: "live",
    scope: "Worldwide",
    dataset: "Uniform sphere point picking (MathWorld) with Web Crypto randomness",
  },
  {
    slug: "radius-map",
    cluster: "distance",
    name: "Radius Map",
    tagline:
      "Draw one or more true-distance circles in miles or kilometres around any address on a map, see the area each covers, and check whether another place falls inside.",
    category: "location",
    status: "live",
    scope: "Worldwide",
    dataset: "Geodesic circles on WGS84 over OpenStreetMap tiles",
  },
  {
    slug: "sun-position-calculator",
    cluster: "sun-sky",
    name: "Sun Position Calculator",
    tagline:
      "Pick a place, date and time and get the sun's elevation and compass direction, plus sunrise, sunset, solar noon and day length in local time, with a chart of the sun's path that day.",
    category: "location",
    status: "live",
    scope: "Worldwide",
    dataset: "NOAA solar calculator equations (Meeus, Astronomical Algorithms)",
  },
  {
    slug: "distance-to-horizon-calculator",
    cluster: "sun-sky",
    name: "Distance to Horizon Calculator",
    tagline:
      "Enter your eye height and get how far away the horizon is, with and without standard atmospheric refraction, plus how far you can see a tall object and how much of it the curve hides.",
    category: "location",
    status: "live",
    scope: "Worldwide",
    dataset: "Spherical-Earth horizon formula d = √(2Rh + h²), refraction R′ = 7R/6 (A. T. Young)",
  },
  {
    slug: "tile-calculator",
    cluster: "flooring",
    name: "Tile Calculator",
    tagline:
      "Enter the area, tile size and grout joint and get how many tiles and boxes to buy with your waste allowance, and the cost.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Area arithmetic including the grout joint",
  },
  {
    slug: "pto-accrual-calculator",
    name: "PTO Accrual Calculator",
    tagline:
      "Enter your PTO policy and pay schedule and get the hours you earn each paycheck, per hour worked and per year, with a balance projection and cap.",
    category: "business",
    status: "live",
    scope: "US",
    dataset: "Accrual arithmetic; U.S. DOL Vacation Leave guidance",
  },
  {
    slug: "pea-gravel-calculator",
    cluster: "landscape-stone",
    name: "Pea Gravel Calculator",
    tagline:
      "Enter the area and depth and get the pea gravel you need in cubic yards, tons and bags, using a published state conversion factor you can change.",
    category: "yard",
    status: "live",
    scope: "Worldwide",
    dataset: "NM EMNRD conversion factors (from BLM Handbook H-3890-1)",
  },
  {
    slug: "river-rock-calculator",
    cluster: "landscape-stone",
    name: "River Rock Calculator",
    tagline:
      "Enter the bed size and depth and get the river rock you need in cubic yards, tons and bags, with the weight factor and its source shown.",
    category: "yard",
    status: "live",
    scope: "Worldwide",
    dataset: "NM EMNRD conversion factors (from BLM Handbook H-3890-1)",
  },
  {
    slug: "linear-foot-calculator",
    cluster: "trim",
    name: "Linear Foot Calculator",
    tagline:
      "Convert square feet to linear feet of boards by coverage width, add up pieces into total linear feet, or turn linear feet back into square feet.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Length and area arithmetic",
  },
  {
    slug: "board-and-batten-calculator",
    cluster: "wall-panels",
    name: "Board and Batten Calculator",
    tagline:
      "Enter the wall width, batten size and the gap or count you want and get exact equal spacing, each batten's position and the linear feet to buy.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Equal-spacing layout arithmetic",
  },
  {
    slug: "rafter-length-calculator",
    cluster: "roofing",
    name: "Rafter Length Calculator",
    tagline:
      "Enter the span, pitch, overhang and ridge board and get the common rafter length in feet and inches, the rise, the roof angle and the stock length that covers it.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Griffith, Carpentry §17 (common rafter length)",
  },
  {
    slug: "real-estate-commission-calculator",
    name: "Real Estate Commission Calculator",
    tagline:
      "Enter the sale price, rate or flat fee and the splits and get the total commission, each side's share, the agent's cut and the seller's net.",
    category: "business",
    status: "live",
    scope: "US",
    dataset: "Commission split arithmetic",
  },
  {
    slug: "roof-truss-calculator",
    cluster: "roofing",
    name: "Roof Truss Calculator",
    tagline:
      "Enter the building length, spacing, span and pitch and get how many trusses you need, the closing space, top chord length and rise.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "Truss count and outline geometry; IRC 2021 R802.10",
  },
  {
    slug: "dilution-ratio-calculator",
    cluster: "dilution",
    name: "Dilution Ratio Calculator",
    tagline:
      "Enter a 1:N ratio and how much mix you want, or how much product you have, and get exactly how much product and water to measure.",
    category: "health",
    status: "live",
    scope: "Worldwide",
    dataset: "Parts arithmetic; NIST US volume units",
  },
  {
    slug: "pond-volume-calculator",
    cluster: "pond",
    name: "Pond Volume Calculator",
    tagline:
      "Enter the pond's shape, size and average or maximum depth and get its volume in gallons, litres, cubic feet and acre-feet, using Penn State Extension's method.",
    category: "yard",
    status: "live",
    scope: "Worldwide",
    dataset: "Penn State Extension pond measurement method",
  },
  {
    slug: "sonotube-concrete-calculator",
    cluster: "concrete",
    name: "Sonotube Concrete Calculator",
    tagline:
      "Enter the tube diameter, depth and number of tubes and get the concrete in cubic yards and the bags of 40, 50, 60, 80 or 90 lb mix to buy.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "QUIKRETE Concrete Mix 1101 yields; QUIK-Tube bag table",
  },
  {
    slug: "deck-railing-spindle-spacing-calculator",
    cluster: "framing",
    name: "Deck Railing Spindle Spacing Calculator",
    tagline:
      "Enter the space between posts and the spindle width and get the fewest spindles that keep every gap under the IRC's 4-inch sphere, with exact spacing and positions.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "2021 IRC R312.1.3 guard opening limits",
  },
  {
    slug: "cake-pricing-calculator",
    name: "Cake Pricing Calculator",
    tagline:
      "Enter what you paid for each ingredient, how much the recipe uses, your hours and overhead, and get the cake's true cost, a price at your markup or margin, and the price per serving.",
    category: "business",
    status: "live",
    scope: "Worldwide",
    dataset: "Recipe costing arithmetic",
  },
  {
    slug: "wainscoting-calculator",
    cluster: "wall-panels",
    name: "Wainscoting Calculator",
    tagline:
      "Enter the walls, openings and wainscot height and get the area, how many panel sheets to buy when cut into strips, the trim pieces, and an even panel layout for any wall.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Sheet-yield and layout arithmetic",
  },
  {
    slug: "lawn-mowing-cost-calculator",
    name: "Lawn Mowing Cost Calculator",
    tagline:
      "Enter the lawn size, mower width, speed and your rates and get the time each mow takes and a price per visit and per month built from your own costs.",
    category: "business",
    status: "live",
    scope: "US",
    dataset: "Field-capacity formula (width × speed × efficiency ÷ 8.25)",
  },
  {
    slug: "countertop-square-footage-calculator",
    cluster: "flooring",
    name: "Countertop Square Footage Calculator",
    tagline:
      "Enter each countertop section, the backsplash height and any sink cut-outs and get the gross and net square footage and the cost at a price per square foot.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Area arithmetic",
  },
  {
    slug: "cubic-yards-to-tons-calculator",
    cluster: "landscape-stone",
    name: "Cubic Yards to Tons Calculator",
    tagline:
      "Convert cubic yards to tons, or tons to cubic yards, for gravel, sand, base course, topsoil, fill dirt and more, using a published state conversion table.",
    category: "yard",
    status: "live",
    scope: "Worldwide",
    dataset: "NM EMNRD conversion factors (from BLM Handbook H-3890-1)",
  },
  {
    slug: "mini-split-size-calculator",
    name: "Mini Split Size Calculator",
    tagline:
      "Enter each room's size, sun, occupants and whether it's a kitchen and get the cooling BTU/h per zone and in total from ENERGY STAR's sizing chart and adjustments.",
    category: "property",
    status: "live",
    scope: "US",
    dataset: "ENERGY STAR room air conditioner sizing chart",
  },
  {
    slug: "drop-ceiling-calculator",
    name: "Drop Ceiling Calculator",
    tagline:
      "Enter the room size and panel size and get the panels, main beams, cross tees, wall molding and hanger wires, with balanced border panels laid out the way Armstrong's guide does.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Armstrong suspended ceiling installation guide",
  },
  {
    slug: "propane-usage-calculator",
    cluster: "fuel-use",
    name: "Propane Usage Calculator",
    tagline:
      "Enter your propane appliances' Btu ratings and daily run time and get the gallons you burn per day and month, how long your tank will last and the cost.",
    category: "energy",
    status: "live",
    scope: "US",
    dataset: "EIA heat content: propane 91,452 Btu per gallon",
  },
  {
    slug: "dc-voltage-drop-calculator",
    cluster: "electrical",
    name: "DC Voltage Drop Calculator",
    tagline:
      "Enter the voltage, current, run length and copper wire gauge and get the voltage drop, the percent lost, the voltage at the load and the thinnest AWG that stays within your limit.",
    category: "energy",
    status: "live",
    scope: "Worldwide",
    dataset: "NBS Handbook 100, Copper Wire Tables",
  },
  {
    slug: "alcohol-dilution-calculator",
    cluster: "dilution",
    name: "Alcohol Dilution Calculator",
    tagline:
      "Enter the starting and target strength in ABV or proof and how much spirit you have (or want) and get exactly how much water to add.",
    category: "health",
    status: "live",
    scope: "Worldwide",
    dataset: "C1V1 = C2V2; proof per 26 U.S.C. 5002",
  },
  {
    slug: "well-volume-calculator",
    cluster: "home-water",
    name: "Well Volume Calculator",
    tagline:
      "Enter the casing diameter, well depth and static water level and get the gallons standing in the well, gallons per foot, and the bleach for a chlorine concentration you choose.",
    category: "property",
    status: "live",
    scope: "Worldwide",
    dataset: "Cylinder volume (231 in³ per US gallon)",
  },
  {
    slug: "gambrel-roof-calculator",
    cluster: "roofing",
    name: "Gambrel Roof Calculator",
    tagline:
      "Enter the span, the break point and the two pitches and get both rafter lengths, the rise at the break and ridge, the roof area in squares and the gable end area.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Right-triangle roof geometry",
  },
  {
    slug: "window-tint-calculator",
    name: "Window Tint Calculator",
    tagline:
      "Enter the glass VLT and the film VLT and get the combined light transmission, compare it with your state's limit, and find the darkest film that stays legal on your glass.",
    category: "mechanical",
    status: "live",
    scope: "US",
    dataset: "Net VLT = glass × film transmission",
  },
  {
    slug: "caulking-calculator",
    name: "Caulking Calculator",
    tagline:
      "Enter the joint length, width and depth and get the sealant volume and how many 10.1 oz cartridges, sausages or gallons to buy, with a waste factor.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Tremco sealant estimating method",
  },
  {
    slug: "grain-bin-calculator",
    name: "Grain Bin Calculator",
    tagline:
      "Enter the bin diameter and grain depth, with a peak or drawn-down cone, and get standard bushels using the Iowa Department of Agriculture's grain measuring method.",
    category: "farm",
    status: "live",
    scope: "US",
    dataset: "Iowa Dept. of Agriculture grain measuring guidelines",
  },
  {
    slug: "three-phase-power-calculator",
    cluster: "electrical",
    name: "Three Phase Power Calculator",
    tagline:
      "Enter the line voltage, current and power factor and get kW, kVA and kVAR — or enter the power and get the line current — for three-phase or single-phase loads.",
    category: "energy",
    status: "live",
    scope: "Worldwide",
    dataset: "P = √3 × V × I × PF (Kuphaldt, Lessons In Electric Circuits)",
  },
  {
    slug: "an-fitting-size-chart",
    cluster: "fittings",
    name: "AN Fitting Size Chart",
    tagline:
      "Look up 37° flare dash sizes -2 to -32 with tube size, thread and pipe size, or measure a male thread and find which dash size it is.",
    category: "mechanical",
    status: "live",
    scope: "Worldwide",
    dataset: "SAE J514 37° flare table (Ham-Let catalog)",
  },
  {
    slug: "engine-displacement-calculator",
    name: "Engine Displacement Calculator",
    tagline:
      "Enter the bore, stroke and number of cylinders and get the displacement in cubic inches, cc and litres, the bore-to-stroke ratio, or the bore needed for a target size.",
    category: "mechanical",
    status: "live",
    scope: "Worldwide",
    dataset: "Swept-volume formula (stroke × π × (bore ÷ 2)² × cylinders)",
  },
  {
    slug: "wallpaper-calculator",
    cluster: "wall-panels",
    name: "Wallpaper Calculator",
    tagline:
      "Enter your walls, height, roll size and pattern repeat and get the drops you need, full drops per roll and the number of rolls to buy, using a wallpaper maker's method.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "James Dunlop wallpaper calculation method",
  },
  {
    slug: "grass-seed-calculator",
    cluster: "lawn",
    name: "Grass Seed Calculator",
    tagline:
      "Enter your lawn's size and grass type and get the pounds of seed to buy at University of Kentucky Extension's seeding rates, adjusted for your seed tag's pure live seed.",
    category: "yard",
    status: "live",
    scope: "US",
    dataset: "University of Kentucky Extension AGR-52 seeding rates",
  },
  {
    slug: "stucco-calculator",
    cluster: "concrete",
    name: "Stucco Calculator",
    tagline:
      "Enter the wall area, openings and the thickness of each coat and get how many 80 lb bags of stucco to buy, coat by coat, from Quikrete's published yields.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "QUIKRETE stucco data sheets (1139, 1201)",
  },
  {
    slug: "shiplap-calculator",
    cluster: "wall-panels",
    name: "Shiplap Calculator",
    tagline:
      "Enter your walls, the board's exposed face and length and get how many shiplap boards to buy, counted row by row and by area, with linear feet and cost.",
    category: "construction",
    status: "live",
    scope: "Worldwide",
    dataset: "Course and area arithmetic",
  },
  {
    slug: "concrete-step-calculator",
    cluster: "concrete",
    name: "Concrete Step Calculator",
    tagline:
      "Enter the number of steps, rise, run, width and top platform and get the concrete for solid steps in cubic yards and the bags of mix to buy.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "Stair profile geometry; QUIKRETE Concrete Mix 1101 yields",
  },
  {
    slug: "heating-oil-usage-calculator",
    cluster: "fuel-use",
    name: "Heating Oil Usage Calculator",
    tagline:
      "Enter your burner's nozzle size and run time, or your heat load, and get the gallons of heating oil used per day and month, how long your tank will last and the cost.",
    category: "energy",
    status: "live",
    scope: "US",
    dataset: "EIA heat content: heating oil 138,500 Btu per gallon",
  },
  {
    slug: "scfm-to-cfm-calculator",
    name: "SCFM to CFM Calculator",
    tagline:
      "Convert standard cubic feet per minute to actual CFM, or back, for compressed air at your pressure, temperature and altitude, with the standard conditions shown.",
    category: "mechanical",
    status: "live",
    scope: "Worldwide",
    dataset: "Combined gas law (OpenStax Chemistry 2e)",
  },
  {
    slug: "potting-soil-calculator",
    cluster: "lawn",
    name: "Potting Soil Calculator",
    tagline:
      "Enter your pots, planters or raised beds and get the potting mix needed in dry quarts, cubic feet and litres, and how many bags to buy.",
    category: "yard",
    status: "live",
    scope: "Worldwide",
    dataset: "Container geometry; NIST dry quart",
  },
  {
    slug: "time-lapse-photography-calculator",
    name: "Time-Lapse Photography Calculator",
    tagline:
      "Enter how long you'll shoot, your interval and frame rate and get the number of photos, the finished clip length, the speed-up and the storage — or the interval for a clip length you want.",
    category: "health",
    status: "live",
    scope: "Worldwide",
    dataset: "Interval and frame-rate arithmetic",
  },
  {
    slug: "break-even-roas-calculator",
    name: "Break-Even ROAS Calculator",
    tagline:
      "Enter your price and per-order costs, or your margin, and get the ROAS and ACoS where ads break even, the ROAS for a target profit, and what your current ROAS earns per ad dollar.",
    category: "business",
    status: "live",
    scope: "Worldwide",
    dataset: "Break-even arithmetic (1 ÷ margin)",
  },
  {
    slug: "paper-weight-conversion-calculator",
    name: "Paper Weight Conversion Calculator",
    tagline:
      "Convert paper basis weight in pounds to gsm and back for bond, text, cover, index, bristol and tag, and see the same paper's weight in every grade.",
    category: "business",
    status: "live",
    scope: "Worldwide",
    dataset: "Sylvamo basis weight formula and basic sizes",
  },
  {
    slug: "hydraulic-cylinder-force-calculator",
    name: "Hydraulic Cylinder Force Calculator",
    tagline:
      "Enter the bore, rod and pressure and get the cylinder's push and pull force in pounds, tons and kilonewtons, or the pressure needed for a force.",
    category: "mechanical",
    status: "live",
    scope: "Worldwide",
    dataset: "Force = pressure × area (OpenStax College Physics 2e)",
  },
  {
    slug: "bmx-gear-ratio-calculator",
    name: "BMX Gear Ratio Calculator",
    tagline:
      "Enter the front sprocket, rear driver and wheel size and get the gear ratio, gear inches, rollout, development and speed at your cadence, with a gear chart.",
    category: "outdoors",
    status: "live",
    scope: "Worldwide",
    dataset: "Sheldon Brown gear inches and development",
  },
  {
    slug: "block-fill-calculator",
    cluster: "concrete",
    name: "Block Fill Calculator",
    tagline:
      "Enter the wall size, block width and which cells are grouted and get the grout in cubic feet and yards and the bags of preblended grout, from the CMHA (NCMA) estimating tables.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "CMHA TEK 04-02A grout volume tables",
  },
  {
    slug: "self-leveling-concrete-calculator",
    cluster: "concrete",
    name: "Self-Leveling Concrete Calculator",
    tagline:
      "Enter the floor area and average thickness and get how many bags of self-leveling underlayment to buy, from Quikrete's published yield, or any product's yield.",
    category: "construction",
    status: "live",
    scope: "US",
    dataset: "QUIKRETE Self-Leveling Floor Resurfacer (1249-50) data sheet",
  },
  {
    slug: "chip-load-calculator",
    name: "Chip Load Calculator",
    tagline:
      "Enter spindle speed, flutes and feed rate to get chip load per tooth — or chip load to get the feed rate — with feed per rev and surface speed, in inch or metric.",
    category: "mechanical",
    status: "live",
    scope: "Worldwide",
    dataset: "Haas mill speeds and feeds formulas",
  },
  {
    slug: "occupancy-load-calculator",
    name: "Occupancy Load Calculator",
    tagline:
      "Pick the function of each space and enter its floor area and get the occupant load from IBC 2021 Table 1004.5, space by space and in total.",
    category: "safety",
    status: "live",
    scope: "US",
    dataset: "2021 IBC Section 1004.5 and Table 1004.5",
  },
  {
    slug: "pond-liner-calculator",
    cluster: "pond",
    name: "Pond Liner Calculator",
    tagline:
      "Enter your pond's length, width and deepest point and get the liner and underlay size to buy, with edge overlap, in feet or metres.",
    category: "yard",
    status: "live",
    scope: "Worldwide",
    dataset: "Liner sizing formula (length + 2 × depth + 2 × overlap)",
  },
  {
    slug: "horse-gestation-calculator",
    cluster: "gestation",
    name: "Horse Gestation Calculator",
    tagline:
      "Enter the breeding date and get the mare's expected foaling window, the normal 320–370 day range, the premature cutoff and the 11-month date, from university extension figures.",
    category: "farm",
    status: "live",
    scope: "Worldwide",
    dataset: "University of Nebraska Extension G1874, The Foaling Mare",
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

/** Same cluster first, then same category, then the rest. Live tools only — never link to a page that does not exist. */
export function relatedTools(slug: string, limit = 6): readonly Tool[] {
  const current = toolBySlug(slug);
  const pool = liveTools.filter((t) => t.slug !== slug);
  if (!current) return pool.slice(0, limit);

  const sameCluster = current.cluster ? pool.filter((t) => t.cluster === current.cluster) : [];
  const sameCategory = pool.filter((t) => t.category === current.category && !sameCluster.includes(t));
  const others = pool.filter((t) => t.category !== current.category && !sameCluster.includes(t));
  return [...sameCluster, ...sameCategory, ...others].slice(0, limit);
}

/**
 * The nav flips from a flat list to grouped columns once there are enough tools.
 * A seven-column mega-menu over three tools looks broken.
 */
export const NAV_GROUPING_THRESHOLD = 8;
export const shouldGroupNav = liveTools.length >= NAV_GROUPING_THRESHOLD;
