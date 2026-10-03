import { ToolError } from "./errors";

/**
 * Minimum number of accessible and van-accessible parking spaces under the
 * 2010 ADA Standards for Accessible Design (U.S. Department of Justice).
 *
 * Text read 2026-10-03 from:
 *   https://www.ada.gov/law-and-regs/design-standards/2010-stds/
 *
 * The rules used:
 *   Table 208.2  minimum accessible spaces by total spaces in the facility
 *   208.2.1      hospital outpatient facilities: 10% of patient and visitor spaces
 *   208.2.2      rehabilitation / outpatient physical therapy: 20% of patient and visitor spaces
 *   208.2.4      at least one van space for every six (or fraction of six) accessible spaces
 *   104.2        where a ratio or percentage leaves a fraction, the next greater
 *                whole number is provided
 *   502.2/502.3  car 96 in, van 132 in (or 96 in with a 96 in aisle), aisle 60 in minimum
 *
 * The count is calculated per parking facility (208.2 advisory), never from a
 * site total. Residential resident parking (208.2.3.1-208.2.3.2) depends on
 * the number of dwelling units with mobility features, which this module does
 * not try to model — it says so instead.
 *
 * This module makes NO network request. It reports what the standard's
 * arithmetic gives; it is not legal advice and does not know state or local
 * rules, which can require more.
 */

const SOURCE_RETRIEVED = "2026-10-03";

export type FacilityType = "general" | "hospital-outpatient" | "rehabilitation";

export interface TableRow {
  from: number;
  to: number | null;
  required: string;
}

/** Verbatim, Table 208.2, as published. */
export const TABLE_208_2: readonly TableRow[] = [
  { from: 1, to: 25, required: "1" },
  { from: 26, to: 50, required: "2" },
  { from: 51, to: 75, required: "3" },
  { from: 76, to: 100, required: "4" },
  { from: 101, to: 150, required: "5" },
  { from: 151, to: 200, required: "6" },
  { from: 201, to: 300, required: "7" },
  { from: 301, to: 400, required: "8" },
  { from: 401, to: 500, required: "9" },
  { from: 501, to: 1000, required: "2 percent of total" },
  { from: 1001, to: null, required: "20, plus 1 for each 100, or fraction thereof, over 1000" },
] as const;

const FIXED_BANDS: readonly [number, number][] = [
  [25, 1],
  [50, 2],
  [75, 3],
  [100, 4],
  [150, 5],
  [200, 6],
  [300, 7],
  [400, 8],
  [500, 9],
];

/** Guards against obviously mistyped totals; the largest US facilities are well under this. */
const MAX_PLAUSIBLE_SPACES = 100_000;

export interface ParkingInput {
  totalSpaces: number;
  facility: FacilityType;
}

export interface ParkingResult {
  totalSpaces: number;
  facility: FacilityType;
  accessible: number;
  van: number;
  /** Accessible spaces that are not required to be van spaces. */
  car: number;
  /** The rule that produced `accessible`, written out. */
  rule: string;
  section: string;
  /** Index into TABLE_208_2 for the row used, or null for the medical-facility percentages. */
  tableRowIndex: number | null;
  /** The plain-arithmetic working, for display. */
  working: string;
  retrievedAt: string;
}

function requiredByTable(total: number): { accessible: number; rowIndex: number; working: string } {
  for (let i = 0; i < FIXED_BANDS.length; i++) {
    const [upTo, required] = FIXED_BANDS[i];
    if (total <= upTo) {
      return { accessible: required, rowIndex: i, working: `Table row ${TABLE_208_2[i].from}–${upTo}: ${required}` };
    }
  }
  if (total <= 1000) {
    const exact = total * 0.02;
    return {
      accessible: Math.ceil(exact),
      rowIndex: 9,
      working: `2% of ${total} = ${trim(exact)}, rounded up to ${Math.ceil(exact)} (§104.2)`,
    };
  }
  const over = total - 1000;
  const extra = Math.ceil(over / 100);
  return {
    accessible: 20 + extra,
    rowIndex: 10,
    working: `20 + 1 for each 100 (or fraction) over 1,000: ${over} over → ${extra} more → ${20 + extra}`,
  };
}

function trim(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export function calculateAdaParking(input: ParkingInput): ParkingResult {
  const total = input.totalSpaces;
  if (!Number.isFinite(total)) {
    throw new ToolError("bad-input", "Enter the total number of parking spaces as a number.");
  }
  if (!Number.isInteger(total)) {
    throw new ToolError("bad-input", "Parking spaces are counted in whole spaces — enter a whole number.");
  }
  if (total < 1) {
    throw new ToolError(
      "bad-input",
      "Enter at least 1 space. Table 208.2 starts at 1 — a facility with no parking has no parking requirement under it.",
    );
  }
  if (total > MAX_PLAUSIBLE_SPACES) {
    throw new ToolError("bad-input", "That total is larger than any single parking facility — check the number.");
  }

  let accessible: number;
  let rule: string;
  let section: string;
  let tableRowIndex: number | null;
  let working: string;

  if (input.facility === "general") {
    const t = requiredByTable(total);
    accessible = t.accessible;
    tableRowIndex = t.rowIndex;
    working = t.working;
    rule = `Table 208.2 — ${TABLE_208_2[t.rowIndex].required}`;
    section = "§208.2";
  } else {
    const pct = input.facility === "hospital-outpatient" ? 10 : 20;
    const exact = (total * pct) / 100;
    accessible = Math.ceil(exact);
    tableRowIndex = null;
    working = `${pct}% of ${total} = ${trim(exact)}, rounded up to ${accessible} (§104.2)`;
    rule =
      input.facility === "hospital-outpatient"
        ? "Ten percent of patient and visitor parking spaces"
        : "Twenty percent of patient and visitor parking spaces";
    section = input.facility === "hospital-outpatient" ? "§208.2.1" : "§208.2.2";
  }

  const van = Math.ceil(accessible / 6);

  return {
    totalSpaces: total,
    facility: input.facility,
    accessible,
    van,
    car: accessible - van,
    rule,
    section,
    tableRowIndex,
    working,
    retrievedAt: SOURCE_RETRIEVED,
  };
}
