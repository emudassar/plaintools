import { ToolError } from "./errors";

/**
 * Concrete bag yields and round-form (Sonotube / QUIK-TUBE) volume.
 *
 * QUIKRETE Concrete Mix (No. 1101) data sheet, retrieved 2026-10-17:
 *   40 lb ≈ 0.30 ft³, 50 lb ≈ 0.375 ft³, 60 lb ≈ 0.45 ft³, 80 lb ≈ 0.60 ft³,
 *   90 lb ≈ 0.675 ft³ (regional availability); "Approximately 140 lb/ft³".
 * QUIKRETE QUIK-Tube data sheet bag table (6/8/10/12 in tubes, 1–4 ft deep,
 * 60 lb and 80 lb bags) is reproduced exactly by ceil(volume ÷ yield) — see
 * the tests.
 *
 * Cylinder volume = π × (d/2)² × h. 27 ft³ = 1 yd³.
 */

export const QUIKRETE_1101_URL = "https://www.quikrete.com/pdfs/data_sheet-concrete%20mix%201101.pdf";
export const QUIKTUBE_URL = "https://www.quikrete.com/pdfs/data_sheet-quiktube.pdf";
export const CONCRETE_RETRIEVED = "2026-10-17";

export const BAG_YIELDS = [
  { lb: 40, cuFt: 0.3 },
  { lb: 50, cuFt: 0.375 },
  { lb: 60, cuFt: 0.45 },
  { lb: 80, cuFt: 0.6 },
  { lb: 90, cuFt: 0.675 },
] as const;

export function bagsFor(cuFt: number) {
  return BAG_YIELDS.map((b) => ({ lb: b.lb, yieldCuFt: b.cuFt, bags: Math.ceil(cuFt / b.cuFt - 1e-9) }));
}

export interface TubeInput {
  /** Inside diameter, inches. */
  diameterIn: number;
  /** Depth / height of concrete in the tube, inches. */
  heightIn: number;
  count: number;
  wastePct: number;
  /** Optional flared footing below the tube: diameter & thickness, inches (0 = none). */
  footingDiaIn: number;
  footingThickIn: number;
}

export interface TubeResult {
  perTubeCuFt: number;
  footingCuFt: number;
  totalCuFt: number;
  totalCuYd: number;
  totalCuM: number;
  bags: { lb: number; yieldCuFt: number; bags: number }[];
  /** Bags per tube (one tube on its own). */
  perTubeBags: { lb: number; bags: number }[];
}

export function tubeConcrete(i: TubeInput): TubeResult {
  if (!Number.isFinite(i.diameterIn) || i.diameterIn <= 0 || i.diameterIn > 72) throw new ToolError("bad-input", "Enter the tube diameter in inches (for example 8, 10 or 12).");
  if (!Number.isFinite(i.heightIn) || i.heightIn <= 0 || i.heightIn > 480) throw new ToolError("bad-input", "Enter the depth of concrete in inches.");
  if (!Number.isInteger(i.count) || i.count < 1 || i.count > 1000) throw new ToolError("bad-input", "Number of tubes should be a whole number from 1 to 1,000.");
  if (!Number.isFinite(i.wastePct) || i.wastePct < 0 || i.wastePct > 100) throw new ToolError("bad-input", "Extra allowance should be between 0 and 100 percent.");
  if (!Number.isFinite(i.footingDiaIn) || i.footingDiaIn < 0 || !Number.isFinite(i.footingThickIn) || i.footingThickIn < 0)
    throw new ToolError("bad-input", "Footing size should be zero or more.");
  const cyl = (dIn: number, hIn: number) => (Math.PI * (dIn / 2) ** 2 * hIn) / 1728;
  const perTubeCuFt = cyl(i.diameterIn, i.heightIn);
  const footingCuFt = i.footingDiaIn > 0 && i.footingThickIn > 0 ? cyl(i.footingDiaIn, i.footingThickIn) : 0;
  const one = perTubeCuFt + footingCuFt;
  const totalCuFt = one * i.count * (1 + i.wastePct / 100);
  return {
    perTubeCuFt,
    footingCuFt,
    totalCuFt,
    totalCuYd: totalCuFt / 27,
    totalCuM: totalCuFt * 0.028316846592,
    bags: bagsFor(totalCuFt),
    perTubeBags: bagsFor(one * (1 + i.wastePct / 100)).map((b) => ({ lb: b.lb, bags: b.bags })),
  };
}
