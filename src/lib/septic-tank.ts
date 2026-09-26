import { ToolError } from "./errors";

/**
 * Septic tank sizing by bedroom count, from the table published in the
 * USEPA Onsite Wastewater Treatment Systems Manual (EPA/625/R-00/008,
 * February 2002), Table 4-13, page 4-40 — itself attributed by EPA to the
 * International Private Sewage Disposal Code (ICC, 1995).
 *
 * Text and table retrieved 2026-09-26 from:
 *   https://www.epa.gov/sites/default/files/2015-06/documents/2004_07_07_septics_septic_2002_osdm_all.pdf
 *
 * This is a LOOKUP, not a calculation — the table is the answer for 1-8
 * bedrooms. The only arithmetic here is the manual's own stated daily
 * design-flow range (bedrooms x 100-150 gallons/bedroom/day).
 *
 * This module makes NO network request — the table is compiled in, so
 * there is no service to be down and no third party receives anything.
 *
 * It reports what the cited table says. It does not tell anyone what tank
 * to buy or install, does not know local code amendments, and treats the
 * two-to-three-times-daily-flow rule for larger buildings as a clearly
 * separate, less specific rule rather than a table lookup.
 */

const SOURCE_RETRIEVED = "2026-09-26";
const STATE_MINIMUM_FOOTNOTE =
  "Many states have established 1,000 gallons or more as the minimum size.";

export interface TankCapacityRow {
  bedrooms: number;
  gallons: number;
  /** True for the two rows the manual's own footnote (a) applies to. */
  hasStateMinimumFootnote: boolean;
}

/** Verbatim, Table 4-13, page 4-40, retrieved 2026-09-26. */
export const TABLE_4_13: readonly TankCapacityRow[] = [
  { bedrooms: 1, gallons: 750, hasStateMinimumFootnote: true },
  { bedrooms: 2, gallons: 750, hasStateMinimumFootnote: true },
  { bedrooms: 3, gallons: 1000, hasStateMinimumFootnote: false },
  { bedrooms: 4, gallons: 1200, hasStateMinimumFootnote: false },
  { bedrooms: 5, gallons: 1425, hasStateMinimumFootnote: false },
  { bedrooms: 6, gallons: 1650, hasStateMinimumFootnote: false },
  { bedrooms: 7, gallons: 1875, hasStateMinimumFootnote: false },
  { bedrooms: 8, gallons: 2100, hasStateMinimumFootnote: false },
] as const;

const MAX_TABLE_BEDROOMS = 8;

/** Manual's own stated range, page 3-19: "100 to 150 gallons/bedroom/day". */
const DESIGN_FLOW_LOW_GPD_PER_BEDROOM = 100;
const DESIGN_FLOW_HIGH_GPD_PER_BEDROOM = 150;

export interface SepticSizeInput {
  bedrooms: number;
  hasGarbageDisposal: boolean;
}

export interface SepticSizeResult {
  bedrooms: number;
  /** Null when bedrooms exceeds the table's range (above 8). */
  tableRow: TankCapacityRow | null;
  /** True when the table has no row for this bedroom count. */
  outsideTableRange: boolean;
  designFlowLowGpd: number;
  designFlowHighGpd: number;
  /** Only populated when outsideTableRange, per the manual's separate rule. */
  ruleOfThumbRangeGallons: { low: number; high: number } | null;
  hasGarbageDisposal: boolean;
  retrievedAt: string;
  stateMinimumFootnote: string;
}

export function sizeSepticTank(input: SepticSizeInput): SepticSizeResult {
  if (!Number.isFinite(input.bedrooms)) {
    throw new ToolError("bad-input", "Number of bedrooms must be a number.");
  }
  if (!Number.isInteger(input.bedrooms)) {
    throw new ToolError("bad-input", "Enter a whole number of bedrooms.");
  }
  if (input.bedrooms < 1) {
    throw new ToolError(
      "bad-input",
      "Table 4-13 is scoped to one- and two-family dwellings, which have at least one bedroom. Enter 1 or more.",
    );
  }
  if (input.bedrooms > 50) {
    throw new ToolError(
      "bad-input",
      "That bedroom count is far outside single-family residential range. Check the figure.",
    );
  }

  const designFlowLowGpd = input.bedrooms * DESIGN_FLOW_LOW_GPD_PER_BEDROOM;
  const designFlowHighGpd = input.bedrooms * DESIGN_FLOW_HIGH_GPD_PER_BEDROOM;

  const outsideTableRange = input.bedrooms > MAX_TABLE_BEDROOMS;
  const tableRow = outsideTableRange
    ? null
    : (TABLE_4_13.find((row) => row.bedrooms === input.bedrooms) ?? null);

  const ruleOfThumbRangeGallons = outsideTableRange
    ? { low: designFlowLowGpd * 2, high: designFlowHighGpd * 3 }
    : null;

  return {
    bedrooms: input.bedrooms,
    tableRow,
    outsideTableRange,
    designFlowLowGpd,
    designFlowHighGpd,
    ruleOfThumbRangeGallons,
    hasGarbageDisposal: input.hasGarbageDisposal,
    retrievedAt: SOURCE_RETRIEVED,
    stateMinimumFootnote: STATE_MINIMUM_FOOTNOTE,
  };
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
