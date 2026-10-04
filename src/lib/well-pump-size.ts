import { ToolError } from "./errors";

/**
 * Well pump sizing — Water Systems Council, wellcare information sheet
 * "Sizing a Well Pump". Retrieved 2026-10-04 from
 *   https://www.watersystemscouncil.org/download/wellcare_information_sheets/basic_well_information_sheets/Sizing-a-Well-Pump.pdf
 *
 * Method 1, fixture count (verbatim): "The capacity of the pump system in
 * gallons per minute should equal the number of fixtures in the home."
 * Worked example: two bathrooms (three outlets each), kitchen sink,
 * dishwasher, washing machine, laundry tub and two outside hose outlets
 * = 12 fixtures = 12 gpm. That example is a test case.
 *
 * Method 2, Table 1 "Seven-minute peak demand period usage", by bathrooms:
 *   1 bath: 45 gal peak, 7 gpm minimum pump
 *   1.5:    70 gal,      10 gpm
 *   2-2.5:  98 gal,      14 gpm
 *   3-4:    122 gal,     17 gpm
 *
 * Well capacity (verbatim): "The general rule is to never install a pump that
 * has a greater capacity than your well." and "If the peak demand exceeds the
 * maximum rate of water available, the pump must be sized within the well
 * capacity and the peak demand reached through added storage capacity."
 *
 * Half bathrooms count as 2 outlets (lavatory + toilet) — an assumption the
 * page states, since the source's example only has full baths (3 outlets).
 */

export const WELL_RETRIEVED = "2026-10-04";
export const WSC_URL =
  "https://www.watersystemscouncil.org/download/wellcare_information_sheets/basic_well_information_sheets/Sizing-a-Well-Pump.pdf";

export interface PeakColumn {
  label: string;
  peakGallons: number;
  minGpm: number;
}

export const TABLE_1: readonly PeakColumn[] = [
  { label: "1 bathroom", peakGallons: 45, minGpm: 7 },
  { label: "1.5 bathrooms", peakGallons: 70, minGpm: 10 },
  { label: "2–2.5 bathrooms", peakGallons: 98, minGpm: 14 },
  { label: "3–4 bathrooms", peakGallons: 122, minGpm: 17 },
];

export const QUOTES = {
  neverExceed: "The general rule is to never install a pump that has a greater capacity than your well.",
  lowYield:
    "If the peak demand exceeds the maximum rate of water available, the pump must be sized within the well capacity and the peak demand reached through added storage capacity.",
  similar: "There are two common methods for sizing a residential pump system that give similar results",
  pressure: "Most modern water systems are set to operate between 30 psi to 50 psi or between 40 psi to 60 psi.",
} as const;

export interface WellPumpInput {
  fullBaths: number;
  halfBaths: number;
  kitchenSink: number;
  dishwasher: number;
  washer: number;
  laundryTub: number;
  hoseBibs: number;
  other: number;
  /** gpm, or null when unknown. */
  wellYieldGpm: number | null;
}

export interface WellPumpResult {
  bathrooms: number;
  fixtureCount: number;
  fixtureBreakdown: { label: string; count: number }[];
  table: PeakColumn | null;
  wellYieldGpm: number | null;
  /** Gallons the well can supply over the 7-minute peak period. */
  wellSevenMinuteGallons: number | null;
  /** True when a method's figure exceeds the stated well yield. */
  tableExceedsYield: boolean | null;
  fixturesExceedYield: boolean | null;
  retrievedAt: string;
}

function count(label: string, v: number, max = 50): number {
  if (!Number.isFinite(v)) throw new ToolError("bad-input", `${label} must be a number.`);
  if (v < 0) throw new ToolError("bad-input", `${label} cannot be negative.`);
  if (!Number.isInteger(v)) throw new ToolError("bad-input", `${label} must be a whole number.`);
  if (v > max) throw new ToolError("bad-input", `${label} looks too high for a home. Check the figure.`);
  return v;
}

export function tableColumnFor(bathrooms: number): PeakColumn | null {
  if (bathrooms <= 0) return null;
  if (bathrooms <= 1) return TABLE_1[0];
  if (bathrooms <= 1.5) return TABLE_1[1];
  if (bathrooms <= 2.5) return TABLE_1[2];
  if (bathrooms <= 4) return TABLE_1[3];
  return null;
}

export function sizeWellPump(input: WellPumpInput): WellPumpResult {
  const full = count("Full bathrooms", input.fullBaths, 20);
  const half = count("Half bathrooms", input.halfBaths, 20);
  const breakdown = [
    { label: `Full bathrooms × 3 outlets`, count: full * 3 },
    { label: `Half bathrooms × 2 outlets`, count: half * 2 },
    { label: "Kitchen sink", count: count("Kitchen sinks", input.kitchenSink) },
    { label: "Dishwasher", count: count("Dishwashers", input.dishwasher) },
    { label: "Washing machine", count: count("Washing machines", input.washer) },
    { label: "Laundry tub", count: count("Laundry tubs", input.laundryTub) },
    { label: "Outside hose outlets", count: count("Hose outlets", input.hoseBibs) },
    { label: "Other fixtures (irrigation, pool, hot tub…)", count: count("Other fixtures", input.other) },
  ];
  const fixtureCount = breakdown.reduce((s, b) => s + b.count, 0);
  if (fixtureCount === 0) throw new ToolError("bad-input", "Enter at least one bathroom or fixture.");

  let y: number | null = input.wellYieldGpm;
  if (y !== null) {
    if (!Number.isFinite(y)) throw new ToolError("bad-input", "Well yield must be a number, or leave it blank.");
    if (y <= 0) throw new ToolError("bad-input", "Well yield must be more than zero, or leave it blank.");
    if (y > 1000) throw new ToolError("bad-input", "That well yield is far beyond a household well. Check the units (gallons per minute).");
  } else y = null;

  const bathrooms = full + half * 0.5;
  const table = tableColumnFor(bathrooms);

  return {
    bathrooms,
    fixtureCount,
    fixtureBreakdown: breakdown.filter((b) => b.count > 0),
    table,
    wellYieldGpm: y,
    wellSevenMinuteGallons: y === null ? null : y * 7,
    tableExceedsYield: y === null || !table ? null : table.minGpm > y,
    fixturesExceedYield: y === null ? null : fixtureCount > y,
    retrievedAt: WELL_RETRIEVED,
  };
}
