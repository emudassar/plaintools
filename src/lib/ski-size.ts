import { ToolError } from "./errors";

/**
 * Ski length from height (adults) or height and weight (children).
 *
 * Source: Nordica, "Ski Sizer" (nordica.com/assets/downloads/ski-sizer_en.pdf),
 * read 2026-10-14. Two printed tables:
 *  - Page 1, "How to choose the right ski length": height (ft & in, cm) →
 *    suggested ski lengths (cm). Last row is "6'2">" (188 cm and over).
 *    "The general rule is for your skis to measure somewhere between your chin
 *    and the top of your head."
 *  - Page 2, "How to choose the right ski size for your child": age, height
 *    (in, cm), weight (lbs, kg), suggested ski length (cm). "Height and weight
 *    for age are based off 50th percentile for children." Between two listed
 *    heights: "If child is light for their height, use the shorter height ...
 *    If child is heavy for their height, use the taller height."
 * Rows transcribed exactly as printed.
 */

export const SKI_RETRIEVED = "2026-10-14";
export const NORDICA_SIZER_URL = "https://www.nordica.com/assets/downloads/ski-sizer_en.pdf";

export interface AdultRow {
  ftIn: string;
  cm: number;
  min: number;
  max: number;
}

export const ADULT_ROWS: readonly AdultRow[] = [
  { ftIn: "4'0\"", cm: 122, min: 100, max: 110 },
  { ftIn: "4'2\"", cm: 127, min: 110, max: 120 },
  { ftIn: "4'4\"", cm: 132, min: 120, max: 130 },
  { ftIn: "4'6\"", cm: 137, min: 125, max: 135 },
  { ftIn: "4'8\"", cm: 142, min: 130, max: 140 },
  { ftIn: "4'10\"", cm: 147, min: 135, max: 145 },
  { ftIn: "5'0\"", cm: 152, min: 140, max: 155 },
  { ftIn: "5'2\"", cm: 158, min: 145, max: 165 },
  { ftIn: "5'4\"", cm: 163, min: 150, max: 170 },
  { ftIn: "5'6\"", cm: 168, min: 155, max: 175 },
  { ftIn: "5'8\"", cm: 173, min: 160, max: 180 },
  { ftIn: "5'10\"", cm: 178, min: 165, max: 185 },
  { ftIn: "6'0\"", cm: 183, min: 170, max: 185 },
  { ftIn: "6'2\" and over", cm: 188, min: 175, max: 193 },
];

export interface ChildRow {
  age: number;
  in: number;
  cm: number;
  lbs: number;
  kg: number;
  min: number;
  max: number;
}

export const CHILD_ROWS: readonly ChildRow[] = [
  { age: 3, in: 37, cm: 94, lbs: 31, kg: 14, min: 70, max: 80 },
  { age: 4, in: 40, cm: 102, lbs: 35, kg: 16, min: 80, max: 90 },
  { age: 5, in: 43, cm: 109, lbs: 40, kg: 18, min: 90, max: 100 },
  { age: 6, in: 45, cm: 114, lbs: 46, kg: 21, min: 100, max: 110 },
  { age: 7, in: 48, cm: 122, lbs: 50, kg: 23, min: 100, max: 110 },
  { age: 8, in: 50, cm: 127, lbs: 57, kg: 26, min: 110, max: 120 },
  { age: 9, in: 53, cm: 135, lbs: 63, kg: 29, min: 120, max: 130 },
  { age: 10, in: 55, cm: 140, lbs: 70, kg: 32, min: 120, max: 130 },
  { age: 11, in: 57, cm: 145, lbs: 79, kg: 36, min: 130, max: 140 },
  { age: 12, in: 59, cm: 149, lbs: 89, kg: 40, min: 140, max: 150 },
  { age: 13, in: 61, cm: 156, lbs: 100, kg: 45, min: 140, max: 150 },
  { age: 14, in: 64, cm: 163, lbs: 110, kg: 50, min: 150, max: 160 },
];

/** Nordica's "go shorter / go longer" reasons, adult and child versions. */
export const ADULT_SHORTER = [
  "Beginner–intermediate level skier",
  "Prefers shorter, quicker turns",
  "Looking for a carving ski",
  "Weighs less than average for their height",
] as const;
export const ADULT_LONGER = [
  "Advanced–expert level skier",
  "Likes skiing fast and making longer turns",
  "Mostly skis off trail",
  "Looking at a ski with a lot of rocker",
  "Weighs more than average for their height",
] as const;
export const CHILD_SHORTER = [
  "Novice and/or cautious skier",
  "Likes quick, short turns",
  "Still developing turning skills",
] as const;
export const CHILD_LONGER = [
  "Advanced ability",
  "Likes to ski fast",
  "Looking at a ski with early rise or powder rocker",
  "Wants “room to grow” (Nordica: not beyond the suggested range)",
] as const;

export type Lean = "shorter" | "longer" | "either";

export interface SkiInput {
  who: "adult" | "child";
  heightCm: number;
  /** Children only; null when not entered. */
  weightKg: number | null;
  shorterCount: number;
  longerCount: number;
}

export interface SkiResult {
  who: "adult" | "child";
  heightCm: number;
  /** The chart row used. */
  rowLabel: string;
  min: number;
  max: number;
  /** Why this row: exact, nearest, chosen by weight, or bounded by the chart. */
  rowNote: string;
  /** Child between two rows with no weight: the other candidate row. */
  altRow: { label: string; min: number; max: number } | null;
  lean: Lean;
  /** The part of the range the lean points to, or null for "either". */
  leanTarget: number | null;
  retrievedAt: string;
}

const childLabel = (r: ChildRow) => `age ${r.age} row: ${r.in} in / ${r.cm} cm, ${r.lbs} lb`;
const adultLabel = (r: AdultRow) => `${r.ftIn} (${r.cm} cm)`;

function leanOf(shorter: number, longer: number): Lean {
  if (shorter > longer) return "shorter";
  if (longer > shorter) return "longer";
  return "either";
}

export function skiSize(input: SkiInput): SkiResult {
  const h = input.heightCm;
  if (!Number.isFinite(h) || h <= 0) throw new ToolError("bad-input", "Enter a height.");
  if (h < 60 || h > 250) throw new ToolError("bad-input", "That height is outside 60–250 cm (about 2 ft to 8 ft 2 in). Check the unit.");
  const lean = leanOf(input.shorterCount, input.longerCount);

  if (input.who === "adult") {
    const first = ADULT_ROWS[0];
    if (h < first.cm - 2.5)
      throw new ToolError("no-data", `Nordica's adult chart starts at ${first.ftIn} (${first.cm} cm). For a shorter skier, switch to the child chart, which runs from 94 cm (3 ft 1 in).`);
    let row: AdultRow;
    let rowNote: string;
    const last = ADULT_ROWS[ADULT_ROWS.length - 1];
    if (h >= last.cm) {
      row = last;
      rowNote = `Nordica's chart lists one row for ${last.ftIn}.`;
    } else {
      // Nearest printed height; the chart steps every 2 inches (about 5 cm).
      row = ADULT_ROWS.reduce((best, r) => (Math.abs(r.cm - h) < Math.abs(best.cm - h) ? r : best));
      rowNote = Math.abs(row.cm - h) < 0.5 ? "Your height matches this row." : `Nearest row on the chart (the chart steps every 2 inches).`;
    }
    return {
      who: "adult",
      heightCm: h,
      rowLabel: adultLabel(row),
      min: row.min,
      max: row.max,
      rowNote,
      altRow: null,
      lean,
      leanTarget: lean === "shorter" ? row.min : lean === "longer" ? row.max : null,
      retrievedAt: SKI_RETRIEVED,
    };
  }

  const first = CHILD_ROWS[0];
  const last = CHILD_ROWS[CHILD_ROWS.length - 1];
  if (h < first.cm - 2.5)
    throw new ToolError("no-data", `Nordica's child chart starts at ${first.in} in (${first.cm} cm, the age 3 row). It gives no ski length below that.`);
  if (h > last.cm + 2.5)
    throw new ToolError("no-data", `Nordica's child chart ends at ${last.in} in (${last.cm} cm, the age 14 row). Switch to the adult chart for taller skiers.`);
  if (input.weightKg !== null && (!Number.isFinite(input.weightKg) || input.weightKg <= 0)) throw new ToolError("bad-input", "Enter a weight above zero, or leave it blank.");

  const exact = CHILD_ROWS.find((r) => Math.abs(r.cm - h) <= 1);
  let row: ChildRow;
  let rowNote: string;
  let alt: ChildRow | null = null;
  if (exact) {
    row = exact;
    rowNote = "Your child's height matches this row.";
  } else if (h < first.cm) {
    row = first;
    rowNote = "Just under the first row; the chart's shortest row is used.";
  } else if (h > last.cm) {
    row = last;
    rowNote = "Just over the last row; the chart's tallest row is used.";
  } else {
    const upperIdx = CHILD_ROWS.findIndex((r) => r.cm > h);
    const lower = CHILD_ROWS[upperIdx - 1];
    const upper = CHILD_ROWS[upperIdx];
    if (input.weightKg === null) {
      row = lower;
      alt = upper;
      rowNote = "Between two rows. Nordica picks between them by weight — enter a weight to choose. Both rows are shown.";
    } else {
      // Nordica's 50th-percentile weight, read linearly between the two rows at this height.
      const t = (h - lower.cm) / (upper.cm - lower.cm);
      const typical = lower.kg + t * (upper.kg - lower.kg);
      const light = input.weightKg < typical;
      row = light ? lower : upper;
      rowNote = `Between two rows. At ${input.weightKg.toFixed(1)} kg your child is ${light ? "lighter" : "heavier"} than the chart's typical ${typical.toFixed(1)} kg for this height, so Nordica says to use the ${light ? "shorter" : "taller"} height.`;
    }
  }
  return {
    who: "child",
    heightCm: h,
    rowLabel: childLabel(row),
    min: row.min,
    max: row.max,
    rowNote,
    altRow: alt ? { label: childLabel(alt), min: alt.min, max: alt.max } : null,
    lean,
    leanTarget: lean === "shorter" ? row.min : lean === "longer" ? row.max : null,
    retrievedAt: SKI_RETRIEVED,
  };
}

export const ftInToCm = (ft: number, inch: number) => (ft * 12 + inch) * 2.54;
export const lbToKg = (lb: number) => lb * 0.45359237;
