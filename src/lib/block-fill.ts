import { ToolError } from "./errors";

/**
 * Grout to fill concrete block (CMU) cores — Concrete Masonry & Hardscapes
 * Association (formerly NCMA), TEK 04-02A "Estimating Concrete Masonry
 * Materials", retrieved 2026-10-17:
 *  - Table 3 "Grout Volume Estimation for Hollow Single Wythe Concrete Masonry
 *    Walls", ft³ per 100 ft² of wall, by wall width (6, 8, 10, 12, 14 in) and
 *    grout spacing (8 in = every cell ... 120 in). Footnote: "Assumes two-core
 *    hollow concrete masonry units and 3% waste."
 *  - Table 4 preblended grout, vertical grouting, cores filled per 80 lb bag:
 *    6 in 3.6, 8 in 2.7, 10 in 2.2, 12 in 1.8; per 3,000 lb bag 150/110/95/80.
 *    "80 lb bag yields approximately 0.66 ft³; 3,000 lb bag ... 25 ft³".
 *  - "walls constructed of 4-in. masonry units are not included in Table 3".
 *  - 8 × 16 unit face = 8/9 ft² ("119 units per 100 ft²" incl. 5% waste).
 */

export const TEK42_URL = "https://www.cmha.org/resource/tek-04-02a/";
export const BLOCK_RETRIEVED = "2026-10-17";

export const WIDTHS = [6, 8, 10, 12, 14] as const;
export type Width = (typeof WIDTHS)[number];
export const SPACINGS = [8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120] as const;
export type Spacing = (typeof SPACINGS)[number];

/** TEK 04-02A Table 3, ft³ per 100 ft² of wall, columns = WIDTHS, rows = SPACINGS. */
export const TABLE3: Record<Width, readonly number[]> = {
  6: [25.6, 12.8, 8.6, 6.4, 5.2, 4.3, 3.7, 3.2, 2.9, 2.6, 2.4, 2.2, 2.0, 1.9, 1.8],
  8: [36.1, 18.1, 12.1, 9.1, 7.3, 6.1, 5.2, 4.6, 4.1, 3.7, 3.3, 3.1, 2.8, 2.6, 2.5],
  10: [47.0, 23.5, 15.7, 11.8, 9.4, 7.9, 6.8, 5.9, 5.3, 4.7, 4.3, 4.0, 3.7, 3.4, 3.2],
  12: [58.9, 29.5, 19.7, 14.8, 11.8, 9.9, 8.5, 7.4, 6.6, 5.9, 5.4, 5.0, 4.6, 4.3, 4.0],
  14: [74.5, 37.3, 24.8, 18.6, 14.9, 12.4, 10.6, 9.3, 8.3, 7.5, 6.8, 6.2, 5.7, 5.3, 4.9],
};

/** Table 4: cores filled per 80 lb and per 3,000 lb preblended bag (no 14 in row). */
export const CORES_PER_BAG: Partial<Record<Width, { bag80: number; bag3000: number }>> = {
  6: { bag80: 3.6, bag3000: 150 },
  8: { bag80: 2.7, bag3000: 110 },
  10: { bag80: 2.2, bag3000: 95 },
  12: { bag80: 1.8, bag3000: 80 },
};

export interface BlockFillInput {
  lengthFt: number;
  heightFt: number;
  openingsSqFt: number;
  width: Width;
  spacing: Spacing;
}

export interface BlockFillResult {
  wallSqFt: number;
  ft3Per100: number;
  cuFt: number;
  cuYd: number;
  bags80: number;
  bags3000: number;
  blocks: number;
}

export function blockFill(i: BlockFillInput): BlockFillResult {
  if (!Number.isFinite(i.lengthFt) || i.lengthFt <= 0 || i.lengthFt > 2000) throw new ToolError("bad-input", "Enter the wall length in feet.");
  if (!Number.isFinite(i.heightFt) || i.heightFt <= 0 || i.heightFt > 100) throw new ToolError("bad-input", "Enter the wall height in feet.");
  if (!Number.isFinite(i.openingsSqFt) || i.openingsSqFt < 0) throw new ToolError("bad-input", "Openings should be zero or more square feet.");
  if (!WIDTHS.includes(i.width)) throw new ToolError("no-data", "TEK 04-02A's table covers 6, 8, 10, 12 and 14 in walls; 4 in units are not included (it does not recommend grouting them).");
  const row = SPACINGS.indexOf(i.spacing);
  if (row < 0) throw new ToolError("bad-input", "Pick a grout spacing from the table.");
  const wallSqFt = i.lengthFt * i.heightFt - i.openingsSqFt;
  if (wallSqFt <= 0) throw new ToolError("bad-input", "The openings are larger than the wall.");
  const ft3Per100 = TABLE3[i.width][row];
  const cuFt = (wallSqFt / 100) * ft3Per100;
  return {
    wallSqFt,
    ft3Per100,
    cuFt,
    cuYd: cuFt / 27,
    bags80: Math.ceil(cuFt / 0.66 - 1e-9),
    bags3000: Math.ceil(cuFt / 25 - 1e-9),
    blocks: Math.ceil((wallSqFt / 100) * 119 - 1e-9),
  };
}
