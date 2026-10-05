import { ToolError } from "./errors";

/**
 * Gutter coil yields: feet <-> pounds.
 *
 * Source: Gutter Supply, "Coil Yields" spec sheet (PDF), linked from its
 * aluminum gutter coil product page as "Aluminum Gutter Coil - Coil Yields".
 * Retrieved 2026-10-05 from
 *   https://guttersupply.asset.akeneo.cloud/Resources/media/SpecSheet_1584396442.pdf
 * The same product page gives "Full Coil approximately 350 lbs."
 *
 * The sheet has two tables, "If you know how many feet" (pounds per foot) and
 * "If you know how many pounds" (feet per pound). Each direction here uses the
 * factor the sheet prints for it, so the page reproduces the sheet exactly.
 * The two are reciprocals to the printed precision except 15" .027" aluminum:
 * 0.476 lb/ft but 2.08 ft/lb (1/0.476 = 2.10). Both are kept as printed and
 * the page notes the difference. The 11.75" and 11.875" rows are printed with
 * identical factors.
 */

export const COIL_RETRIEVED = "2026-10-05";
export const COIL_YIELDS_URL =
  "https://guttersupply.asset.akeneo.cloud/Resources/media/SpecSheet_1584396442.pdf";
export const COIL_PRODUCT_URL = "https://www.guttersupply.com/p/aluminum-gutter-coils";
export const FULL_COIL_LB = 350;

export type WidthId = "11.75" | "11.875" | "15";
export type MaterialId = "al027" | "al032" | "cu16" | "cu20" | "galv26";

export const WIDTHS: readonly { id: WidthId; label: string }[] = [
  { id: "11.75", label: '11-3/4" (11.75")' },
  { id: "11.875", label: '11-7/8" (11.875")' },
  { id: "15", label: '15"' },
];

export const MATERIALS: readonly { id: MaterialId; label: string }[] = [
  { id: "al027", label: '.027" aluminum' },
  { id: "al032", label: '.032" aluminum' },
  { id: "cu16", label: "16 oz. copper" },
  { id: "cu20", label: "20 oz. copper" },
  { id: "galv26", label: "26 gauge Galvalume" },
];

/** [pounds per foot, feet per pound] as printed. */
const NARROW: Record<MaterialId, readonly [number, number]> = {
  al027: [0.377, 2.65],
  al032: [0.446, 2.24],
  cu16: [0.99, 1.01],
  cu20: [1.25, 0.8],
  galv26: [0.768, 1.302],
};
export const YIELDS: Record<WidthId, Record<MaterialId, readonly [number, number]>> = {
  "11.75": NARROW,
  "11.875": NARROW,
  "15": {
    al027: [0.476, 2.08],
    al032: [0.571, 1.75],
    cu16: [1.25, 0.8],
    cu20: [1.56, 0.64],
    galv26: [0.97, 1.03],
  },
};

export interface CoilInput {
  width: WidthId;
  material: MaterialId;
  mode: "feet" | "pounds";
  value: number;
}

export interface CoilResult {
  mode: "feet" | "pounds";
  feet: number;
  pounds: number;
  factor: number;
  factorUnit: "lb per ft" | "ft per lb";
  lbPerFt: number;
  ftPerLb: number;
  /** True for the one row whose two printed factors are not reciprocal. */
  printedMismatch: boolean;
  fullCoils: number;
  retrievedAt: string;
}

export function calculateCoil(input: CoilInput): CoilResult {
  const row = YIELDS[input.width]?.[input.material];
  if (!row) throw new ToolError("bad-input", "Pick a coil width and material from the lists.");
  if (!Number.isFinite(input.value)) throw new ToolError("bad-input", "Enter a number.");
  if (input.value <= 0) throw new ToolError("bad-input", "Enter a value more than zero.");
  if (input.value > 1_000_000) throw new ToolError("bad-input", "That is over a million. Check the number.");

  const [lbPerFt, ftPerLb] = row;
  const feet = input.mode === "feet" ? input.value : input.value * ftPerLb;
  const pounds = input.mode === "feet" ? input.value * lbPerFt : input.value;
  return {
    mode: input.mode,
    feet,
    pounds,
    factor: input.mode === "feet" ? lbPerFt : ftPerLb,
    factorUnit: input.mode === "feet" ? "lb per ft" : "ft per lb",
    lbPerFt,
    ftPerLb,
    printedMismatch: Math.abs(1 / lbPerFt - ftPerLb) > 0.015,
    fullCoils: pounds / FULL_COIL_LB,
    retrievedAt: COIL_RETRIEVED,
  };
}
