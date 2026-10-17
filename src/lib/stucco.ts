import { ToolError } from "./errors";

/**
 * Stucco bags for a wall area, by coat.
 *
 * QUIKRETE Scratch and Brown Base Coat Stucco (No. 1139) data sheet,
 * retrieved 2026-10-17: an 80 lb bag yields "approximately 0.75 ft³"; coverage
 * per 80 lb bag 3/8 in: 20–24 ft², 1/2 in: 15–18 ft², 3/4 in: 10–12 ft²; "All
 * coverages are approximate and vary with thickness, waste, etc."
 * QUIKRETE Finish Coat Stucco (No. 1201) data sheet: an 80 lb bag yields
 * "approximately 0.75 ft³" and covers "approximately 70 ft² at 1/8"",
 * "Coverage will vary with texture."
 *
 * Bags per coat = area × thickness ÷ 0.75 ft³, rounded up after the user's
 * waste allowance. (0.75 ft³ ÷ (3/8 in) = 24 ft², the top of Quikrete's range;
 * ÷ (1/8 in) = 72 ft² vs the printed ≈70.)
 */

export const QK_BASE_URL = "https://www.quikrete.com/pdfs/data_sheet-scratch%20and%20brown%20base%20coat%20stucco%20%201139.pdf";
export const QK_FINISH_URL = "https://www.quikrete.com/pdfs/data_sheet-finish%20coat%20stucco%201201.pdf";
export const STUCCO_RETRIEVED = "2026-10-17";
export const YIELD_CUFT_80LB = 0.75;

/** Quikrete's printed coverage ranges for base coat, per 80 lb bag. */
export const BASE_COVERAGE = [
  { thicknessIn: 3 / 8, label: '3/8"', low: 20, high: 24 },
  { thicknessIn: 1 / 2, label: '1/2"', low: 15, high: 18 },
  { thicknessIn: 3 / 4, label: '3/4"', low: 10, high: 12 },
] as const;

export interface Coat {
  name: string;
  thicknessIn: number;
}

export interface StuccoInput {
  areaSqFt: number;
  openingsSqFt: number;
  coats: Coat[];
  wastePct: number;
}

export interface StuccoResult {
  netArea: number;
  rows: { name: string; thicknessIn: number; cuFt: number; bags: number; printedRange: { low: number; high: number } | null; bagsFromRange: { low: number; high: number } | null }[];
  totalBags: number;
}

export function stuccoBags(i: StuccoInput): StuccoResult {
  if (!Number.isFinite(i.areaSqFt) || i.areaSqFt <= 0 || i.areaSqFt > 1_000_000) throw new ToolError("bad-input", "Enter the wall area in square feet.");
  if (!Number.isFinite(i.openingsSqFt) || i.openingsSqFt < 0) throw new ToolError("bad-input", "Openings should be zero or more square feet.");
  if (!Number.isFinite(i.wastePct) || i.wastePct < 0 || i.wastePct > 100) throw new ToolError("bad-input", "Waste allowance should be between 0 and 100 percent.");
  const netArea = i.areaSqFt - i.openingsSqFt;
  if (netArea <= 0) throw new ToolError("bad-input", "The openings are larger than the wall.");
  if (!i.coats.length) throw new ToolError("bad-input", "Add at least one coat.");
  const w = 1 + i.wastePct / 100;
  const rows = i.coats.map((c) => {
    if (!Number.isFinite(c.thicknessIn) || c.thicknessIn <= 0 || c.thicknessIn > 2) throw new ToolError("bad-input", `Enter the ${c.name || "coat"} thickness in inches (for example 0.375).`);
    const cuFt = netArea * (c.thicknessIn / 12);
    const range = BASE_COVERAGE.find((r) => Math.abs(r.thicknessIn - c.thicknessIn) < 1e-6) ?? null;
    return {
      name: c.name,
      thicknessIn: c.thicknessIn,
      cuFt,
      bags: Math.ceil((cuFt * w) / YIELD_CUFT_80LB - 1e-9),
      printedRange: range ? { low: range.low, high: range.high } : null,
      bagsFromRange: range ? { low: Math.ceil((netArea * w) / range.high - 1e-9), high: Math.ceil((netArea * w) / range.low - 1e-9) } : null,
    };
  });
  return { netArea, rows, totalBags: rows.reduce((a, r) => a + r.bags, 0) };
}
