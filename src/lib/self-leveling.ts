import { ToolError } from "./errors";

/**
 * Self-leveling floor underlayment bags.
 *
 * QUIKRETE Self-Leveling Floor Resurfacer (No. 1249-50) data sheet,
 * retrieved 2026-10-17: "At a pourable consistency, a 50 lb bag will provide
 * 0.45 ft³ of material." "At a thickness of 1/4 in, one 50 lb bag will cover
 * an area of 21 ft²." "can be installed from 5/8 inch (16 mm) thick to a
 * feather edge"; deeper areas "in layers no greater than 5/8 inch (16 mm)
 * each".
 *
 * Bags = area × average thickness ÷ yield. Other products: user-entered yield.
 */

export const QK_SL_URL = "https://www.quikrete.com/PDFs/data_sheet-self-leveling%20floor%20resurfacer%201249-50%20-51.pdf";
export const SL_RETRIEVED = "2026-10-17";
export const QK_SL_YIELD = 0.45;
export const QK_SL_MAX_LAYER_IN = 5 / 8;

export interface SlInput {
  areaSqFt: number;
  /** Average thickness, inches. */
  thicknessIn: number;
  /** Yield per bag, ft³. */
  yieldCuFt: number;
  bagLb: number;
  wastePct: number;
}

export interface SlResult {
  cuFt: number;
  bags: number;
  lbs: number;
  coveragePerBag: number;
  layers: number;
}

export function selfLeveling(i: SlInput): SlResult {
  if (!Number.isFinite(i.areaSqFt) || i.areaSqFt <= 0 || i.areaSqFt > 1_000_000) throw new ToolError("bad-input", "Enter the floor area in square feet.");
  if (!Number.isFinite(i.thicknessIn) || i.thicknessIn <= 0 || i.thicknessIn > 6) throw new ToolError("bad-input", "Enter the average thickness in inches (for example 0.25 for 1/4 in).");
  if (!Number.isFinite(i.yieldCuFt) || i.yieldCuFt <= 0 || i.yieldCuFt > 5) throw new ToolError("bad-input", "Enter the yield per bag in cubic feet from the bag or data sheet.");
  if (!Number.isFinite(i.bagLb) || i.bagLb <= 0) throw new ToolError("bad-input", "Enter the bag weight.");
  if (!Number.isFinite(i.wastePct) || i.wastePct < 0 || i.wastePct > 100) throw new ToolError("bad-input", "Extra allowance should be between 0 and 100 percent.");
  const cuFt = i.areaSqFt * (i.thicknessIn / 12) * (1 + i.wastePct / 100);
  const bags = Math.ceil(cuFt / i.yieldCuFt - 1e-9);
  return {
    cuFt,
    bags,
    lbs: bags * i.bagLb,
    coveragePerBag: i.yieldCuFt / (i.thicknessIn / 12),
    layers: Math.ceil(i.thicknessIn / QK_SL_MAX_LAYER_IN - 1e-9),
  };
}
