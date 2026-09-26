import { ToolError } from "./errors";

/**
 * Rebar bar size reference, from Illinois DOT Standard 001001-02, "Areas of
 * Reinforcement Bars — English (Metric)," issued 1-1-97, revised 1-1-2009.
 *
 * Text and table retrieved 2026-09-26 from:
 *   https://idot.illinois.gov/content/dam/soi/en/web/idot/documents/doing-business/standards/highway-standards/pdf/226-001001-02_areasofreinfrebars.pdf
 *
 * The bar-numbering system itself is defined by ASTM A615/A706, a paywalled
 * standard not read for this build. Illinois DOT's table republishes the
 * same physical dimensions freely, as every state DOT must for highway
 * design — this module cites IDOT's table, not ASTM directly.
 *
 * This module makes NO network request — the table is compiled in, so
 * there is no service to be down and no third party receives anything.
 *
 * It reports what the cited table says for the bar selected. It does not
 * specify grade, tolerance, bend requirements or anything a real project
 * spec and ASTM A615/A706 itself would need to govern actual construction.
 */

const SOURCE_RETRIEVED = "2026-09-26";

export interface RebarRow {
  size: number;
  diameterIn: number;
  diameterMm: number;
  areaSqIn: number;
  areaSqMm: number;
  weightLbPerFt: number;
  weightKgPerM: number;
}

/** Verbatim, IDOT Standard 001001-02, retrieved 2026-09-26. Stops at #11 because the source does. */
export const REBAR_TABLE: readonly RebarRow[] = [
  { size: 3, diameterIn: 0.375, diameterMm: 9.5, areaSqIn: 0.11, areaSqMm: 71, weightLbPerFt: 0.376, weightKgPerM: 0.56 },
  { size: 4, diameterIn: 0.5, diameterMm: 12.7, areaSqIn: 0.196, areaSqMm: 129, weightLbPerFt: 0.668, weightKgPerM: 0.944 },
  { size: 5, diameterIn: 0.625, diameterMm: 15.9, areaSqIn: 0.307, areaSqMm: 199, weightLbPerFt: 1.043, weightKgPerM: 1.552 },
  { size: 6, diameterIn: 0.75, diameterMm: 19.1, areaSqIn: 0.442, areaSqMm: 284, weightLbPerFt: 1.502, weightKgPerM: 2.235 },
  { size: 7, diameterIn: 0.875, diameterMm: 22.2, areaSqIn: 0.601, areaSqMm: 387, weightLbPerFt: 2.044, weightKgPerM: 3.042 },
  { size: 8, diameterIn: 1.0, diameterMm: 25.4, areaSqIn: 0.785, areaSqMm: 510, weightLbPerFt: 2.67, weightKgPerM: 3.973 },
  { size: 9, diameterIn: 1.128, diameterMm: 28.7, areaSqIn: 1.0, areaSqMm: 645, weightLbPerFt: 3.4, weightKgPerM: 5.06 },
  { size: 10, diameterIn: 1.27, diameterMm: 32.3, areaSqIn: 1.267, areaSqMm: 819, weightLbPerFt: 4.303, weightKgPerM: 6.404 },
  { size: 11, diameterIn: 1.41, diameterMm: 35.8, areaSqIn: 1.561, areaSqMm: 1006, weightLbPerFt: 5.313, weightKgPerM: 7.907 },
] as const;

export function rebarRow(size: number): RebarRow {
  const row = REBAR_TABLE.find((r) => r.size === size);
  if (!row) {
    throw new ToolError(
      "bad-input",
      `Bar size #${size} isn't in the cited table, which covers #3 through #11 only.`,
    );
  }
  return row;
}

export interface WeightInput {
  size: number;
  length: number;
  lengthUnit: "ft" | "m";
}

export interface WeightResult {
  row: RebarRow;
  length: number;
  lengthUnit: "ft" | "m";
  totalWeight: number;
  totalWeightUnit: "lb" | "kg";
  retrievedAt: string;
}

export function calculateWeight(input: WeightInput): WeightResult {
  const row = rebarRow(input.size);

  if (!Number.isFinite(input.length)) {
    throw new ToolError("bad-input", "Length must be a number.");
  }
  if (input.length <= 0) {
    throw new ToolError("bad-input", "Enter a length greater than zero.");
  }
  if (input.length > 100_000) {
    throw new ToolError("bad-input", "That length is far outside a normal job's range. Check the figure.");
  }

  const totalWeight =
    input.lengthUnit === "ft" ? input.length * row.weightLbPerFt : input.length * row.weightKgPerM;

  return {
    row,
    length: input.length,
    lengthUnit: input.lengthUnit,
    totalWeight,
    totalWeightUnit: input.lengthUnit === "ft" ? "lb" : "kg",
    retrievedAt: SOURCE_RETRIEVED,
  };
}

export const RETRIEVED_AT = SOURCE_RETRIEVED;

export function formatNumber(n: number, maxDecimals = 3): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: maxDecimals, minimumFractionDigits: 0 });
}
