import { ToolError } from "./errors";

/**
 * Caulk / sealant quantity.
 *
 * Tremco Sealants, "How to Use Sealant Calculators to Estimate Product Needs"
 * (Adam Milter), retrieved 2026-10-17: the calculation is based on "a
 * rectangular prism that is later tooled to an hourglass shape"; depth is
 * measured "from the top of your joint to the top of your backer rod or bond
 * breaker"; inefficiency factor "20-25%" for new applicators, "10-15%" average
 * ("a safe estimate"), "0-5%" for highly experienced.
 *
 * Volume per foot = width × depth × 12 in³ (rectangle) or width² ÷ 2 × 12
 * (a 45° corner fillet with equal legs). Container volume: US fl oz × 231/128
 * in³ (1 US gal = 231 in³ = 128 fl oz, NIST Handbook 44); millilitres ÷
 * 16.387064.
 */

export const TREMCO_URL = "https://www.tremcosealants.com/blog/how-to-use-sealant-calculators-to-estimate-product-needs";
export const CAULK_RETRIEVED = "2026-10-17";
export const IN3_PER_FLOZ = 231 / 128;
export const IN3_PER_ML = 1 / 16.387064;

export const CONTAINERS = {
  "10.1oz": { label: "10.1 fl oz cartridge", in3: 10.1 * (231 / 128) },
  "10.3oz": { label: "10.3 fl oz cartridge", in3: 10.3 * (231 / 128) },
  "20oz": { label: "20 fl oz sausage", in3: 20 * (231 / 128) },
  "28oz": { label: "28 fl oz cartridge", in3: 28 * (231 / 128) },
  "300ml": { label: "300 ml cartridge", in3: 300 / 16.387064 },
  "600ml": { label: "600 ml sausage", in3: 600 / 16.387064 },
  gal: { label: "1 US gallon pail", in3: 231 },
} as const;
export type Container = keyof typeof CONTAINERS;

export interface CaulkInput {
  /** Total joint length, ft. */
  lengthFt: number;
  shape: "rect" | "fillet";
  /** Joint width (and fillet leg), inches. */
  widthIn: number;
  depthIn: number;
  wastePct: number;
}

export interface CaulkResult {
  in3PerFt: number;
  totalIn3: number;
  withWaste: number;
  rows: { key: Container; label: string; ftPerUnit: number; units: number }[];
}

export function caulk(i: CaulkInput): CaulkResult {
  if (!Number.isFinite(i.lengthFt) || i.lengthFt <= 0 || i.lengthFt > 100_000) throw new ToolError("bad-input", "Enter the total joint length in feet.");
  if (!Number.isFinite(i.widthIn) || i.widthIn <= 0 || i.widthIn > 6) throw new ToolError("bad-input", "Enter the joint width in inches (for example 0.25 for 1/4 in).");
  if (i.shape === "rect" && (!Number.isFinite(i.depthIn) || i.depthIn <= 0 || i.depthIn > 6)) throw new ToolError("bad-input", "Enter the joint depth in inches, to the backer rod.");
  if (!Number.isFinite(i.wastePct) || i.wastePct < 0 || i.wastePct > 100) throw new ToolError("bad-input", "Waste factor should be between 0 and 100 percent.");
  const area = i.shape === "rect" ? i.widthIn * i.depthIn : (i.widthIn * i.widthIn) / 2;
  const in3PerFt = area * 12;
  const totalIn3 = in3PerFt * i.lengthFt;
  const withWaste = totalIn3 * (1 + i.wastePct / 100);
  const rows = (Object.keys(CONTAINERS) as Container[]).map((key) => ({
    key,
    label: CONTAINERS[key].label,
    ftPerUnit: CONTAINERS[key].in3 / in3PerFt,
    units: Math.ceil(withWaste / CONTAINERS[key].in3 - 1e-9),
  }));
  return { in3PerFt, totalIn3, withWaste, rows };
}
