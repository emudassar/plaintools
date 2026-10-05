import { ToolError } from "./errors";

/**
 * Trolling motor size: thrust, battery voltage and shaft length.
 *
 * Minn Kota "Motor Size" selection guide / boat size chart (Johnson Outdoors
 * Marine Electronics, Rev. 8.21.2020), read in the browser 2026-10-05 (the
 * file is behind a bot check for scripts):
 *  - "at least 2 pounds of thrust for every 100 pounds of fully loaded boat
 *    weight (people and gear included)"; extra thrust for wind or current.
 *  - Chart rows (weight, max length, minimum thrust, batteries), copied below.
 *  - Bow and transom shaft charts (mounting surface to waterline), copied
 *    below exactly, including the bow chart's missing 10-16 in row.
 *  - Footnotes: add 5 in to the waterline measurement for rough water; add
 *    9 in for bow-mount Hand Control motors; prop tip at least 12 in under.
 * Minn Kota buying guide (same day): 55 lb or less = 12 V, 1 battery;
 * 68-80 lb = 24 V, 2 batteries; 101-115 lb = 36 V, 3 batteries.
 */

export const MK_RETRIEVED = "2026-10-05";
export const MK_GUIDE_PDF = "https://minnkota.johnsonoutdoors.com/sites/default/files/2023-02/min_productmanual_motor-select-guide.pdf";
export const MK_BUYING_GUIDE = "https://minnkota.johnsonoutdoors.com/us/learn/buying-guide/trolling-motors";

export const THRUST_PER_100LB = 2;
const LB_PER_KG = 2.2046226218;

export interface ChartRow {
  /** Upper weight of the row in lb (Infinity for "4,500 or more"). */
  maxLb: number;
  weight: string;
  length: string;
  thrust: string;
  batteries: string;
}

export const THRUST_CHART: ChartRow[] = [
  { maxLb: 1500, weight: "1,500 or less", length: "14'", thrust: "30", batteries: "1 battery (12 V)" },
  { maxLb: 2000, weight: "2,000", length: "17'-18'", thrust: "40-45", batteries: "1 battery (12 V)" },
  { maxLb: 2500, weight: "2,500", length: "20'-21'", thrust: "50-55", batteries: "1 battery (12 V)" },
  { maxLb: 3500, weight: "3,000-3,500", length: "23'", thrust: "70", batteries: "2 batteries (24 V)" },
  { maxLb: 4000, weight: "4,000", length: "25'", thrust: "80", batteries: "2 batteries (24 V)" },
  { maxLb: Infinity, weight: "4,500 or more", length: "25'+", thrust: "101-112", batteries: "3 batteries (36 V)" },
];

export interface ShaftRow {
  lo: number;
  /** Inclusive upper bound in inches; Infinity for open-ended rows. */
  hi: number;
  range: string;
  shaft: string;
}

export const BOW_SHAFT: ShaftRow[] = [
  { lo: 0, hi: 10, range: '0" to 10"', shaft: '36"' },
  { lo: 16, hi: 22, range: '16" to 22"', shaft: '42" to 45"' },
  { lo: 22, hi: 28, range: '22" to 28"', shaft: '48" to 52"' },
  { lo: 28, hi: 44, range: '28" to 44"', shaft: '54" to 72"' },
  { lo: 45, hi: Infinity, range: '45"+', shaft: '87"' },
];

export const TRANSOM_SHAFT: ShaftRow[] = [
  { lo: 0, hi: 10, range: '0" to 10"', shaft: '30"' },
  { lo: 10, hi: 16, range: '10" to 16"', shaft: '36"' },
  { lo: 16, hi: 22, range: '16" to 22"', shaft: '42"' },
  { lo: 22, hi: Infinity, range: 'Over 22"', shaft: "Consult factory" },
];

export const ROUGH_WATER_ADD_IN = 5;

export interface ThrustResult {
  weightLb: number;
  minThrustLb: number;
  /** System voltage tier from the buying guide, or null if the rule figure is above every tier. */
  voltage: { volts: number; batteries: number; band: string } | null;
  chartRow: ChartRow;
  retrievedAt: string;
}

export function thrustFor(weight: number, unit: "lb" | "kg"): ThrustResult {
  if (!Number.isFinite(weight)) throw new ToolError("bad-input", "Weight must be a number.");
  if (weight <= 0) throw new ToolError("bad-input", "Weight must be more than zero.");
  const lb = unit === "kg" ? weight * LB_PER_KG : weight;
  if (lb > 20000) throw new ToolError("bad-input", "That is over 20,000 lb, far beyond Minn Kota's chart. Check the units.");
  const minThrust = (lb / 100) * THRUST_PER_100LB;
  // Smallest tier whose top thrust covers the minimum.
  const voltage =
    minThrust <= 55
      ? { volts: 12, batteries: 1, band: "55 lb of thrust or less" }
      : minThrust <= 80
        ? { volts: 24, batteries: 2, band: "68-80 lb of thrust" }
        : minThrust <= 115
          ? { volts: 36, batteries: 3, band: "101-115 lb of thrust" }
          : null;
  const chartRow = THRUST_CHART.find((r) => lb <= r.maxLb)!;
  return { weightLb: lb, minThrustLb: minThrust, voltage, chartRow, retrievedAt: MK_RETRIEVED };
}

export interface ShaftResult {
  /** Measurement used for the chart, inches (after the rough-water addition). */
  usedIn: number;
  rows: ShaftRow[];
  /** True when the measurement falls in a gap the chart does not cover. */
  gap: boolean;
  below: ShaftRow | null;
  above: ShaftRow | null;
}

export function shaftFor(mount: "bow" | "transom", measure: number, unit: "in" | "cm", rough: boolean): ShaftResult {
  if (!Number.isFinite(measure)) throw new ToolError("bad-input", "Measurement must be a number.");
  if (measure < 0) throw new ToolError("bad-input", "Measurement cannot be negative.");
  let inches = unit === "cm" ? measure / 2.54 : measure;
  if (inches > 120) throw new ToolError("bad-input", "That is over 10 ft to the waterline. Check the units.");
  if (rough) inches += ROUGH_WATER_ADD_IN;
  const table = mount === "bow" ? BOW_SHAFT : TRANSOM_SHAFT;
  // Rows share their end values (e.g. 22" ends one row and starts the next): show both.
  const rows = table.filter((r) => inches >= r.lo && inches <= r.hi);
  const below = [...table].reverse().find((r) => r.hi < inches) ?? null;
  const above = table.find((r) => r.lo > inches) ?? null;
  return { usedIn: inches, rows, gap: rows.length === 0, below: rows.length ? null : below, above: rows.length ? null : above };
}
