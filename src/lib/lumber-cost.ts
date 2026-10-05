import { ToolError } from "./errors";

/**
 * Lumber cost from a cut list.
 *
 * Source: NIST Handbook 130 (2026 edition), IV.B Uniform Regulation for the
 * Method of Sale of Commodities. Retrieved 2026-10-05 from
 *   https://doi.org/10.6028/NIST.HB.130-2026
 *
 *  - §2.12.1.1: "A board foot is the volume of a board 1 ft long, 1 ft wide,
 *    and 1 in thick or its equivalent (144 in3 of wood)."
 *    So board feet = thickness (in) x width (in) x length (ft) / 12.
 *  - §2.10: nominal sizes "are always greater than the actual or minimum dressed
 *    dimensions; thus, a dry '2 x 4' is surfaced to the actual dimensions of
 *    1 1/2 in x 3 1/2 in". Table 1 (Softwood Lumber Sizes) gives the dry
 *    minimum dressed sizes used in NOMINAL_SIZES below.
 *  - §2.10.3: softwood representations are by piece count, size and length or
 *    lineal footage — so a yard may price per piece, per linear foot or per
 *    board foot. MBF = 1,000 board feet.
 *
 * Board feet here are computed from whatever thickness and width the user
 * selects: nominal (the trade's usual description) or actual.
 */

export const LUMBER_RETRIEVED = "2026-10-05";
export const HB130_URL = "https://doi.org/10.6028/NIST.HB.130-2026";

export interface NominalSize {
  id: string;
  /** Nominal thickness x width, inches. */
  t: number;
  w: number;
  /** Dry minimum dressed size from HB 130 Table 1, as printed. */
  dryLabel: string;
  dryT: number;
  dryW: number;
}

/** HB 130 (2026) Table 1, dry column. */
export const NOMINAL_SIZES: readonly NominalSize[] = [
  { id: "1x2", t: 1, w: 2, dryLabel: "3/4 × 1 1/2", dryT: 0.75, dryW: 1.5 },
  { id: "1x3", t: 1, w: 3, dryLabel: "3/4 × 2 1/2", dryT: 0.75, dryW: 2.5 },
  { id: "1x4", t: 1, w: 4, dryLabel: "3/4 × 3 1/2", dryT: 0.75, dryW: 3.5 },
  { id: "1x6", t: 1, w: 6, dryLabel: "3/4 × 5 1/2", dryT: 0.75, dryW: 5.5 },
  { id: "1x8", t: 1, w: 8, dryLabel: "3/4 × 7 1/4", dryT: 0.75, dryW: 7.25 },
  { id: "1x10", t: 1, w: 10, dryLabel: "3/4 × 9 1/4", dryT: 0.75, dryW: 9.25 },
  { id: "1x12", t: 1, w: 12, dryLabel: "3/4 × 11 1/4", dryT: 0.75, dryW: 11.25 },
  { id: "2x2", t: 2, w: 2, dryLabel: "1 1/2 × 1 1/2", dryT: 1.5, dryW: 1.5 },
  { id: "2x3", t: 2, w: 3, dryLabel: "1 1/2 × 2 1/2", dryT: 1.5, dryW: 2.5 },
  { id: "2x4", t: 2, w: 4, dryLabel: "1 1/2 × 3 1/2", dryT: 1.5, dryW: 3.5 },
  { id: "2x6", t: 2, w: 6, dryLabel: "1 1/2 × 5 1/2", dryT: 1.5, dryW: 5.5 },
  { id: "2x8", t: 2, w: 8, dryLabel: "1 1/2 × 7 1/4", dryT: 1.5, dryW: 7.25 },
  { id: "2x10", t: 2, w: 10, dryLabel: "1 1/2 × 9 1/4", dryT: 1.5, dryW: 9.25 },
  { id: "2x12", t: 2, w: 12, dryLabel: "1 1/2 × 11 1/4", dryT: 1.5, dryW: 11.25 },
  { id: "4x4", t: 4, w: 4, dryLabel: "3 1/2 × 3 1/2", dryT: 3.5, dryW: 3.5 },
  { id: "4x6", t: 4, w: 6, dryLabel: "3 1/2 × 5 1/2", dryT: 3.5, dryW: 5.5 },
];

export type PriceBasis = "piece" | "linear-ft" | "board-ft" | "mbf";

export interface LumberLine {
  qty: number;
  thicknessIn: number;
  widthIn: number;
  lengthFt: number;
  price: number;
  basis: PriceBasis;
}

export interface LumberInput {
  lines: readonly LumberLine[];
  /** Extra percent added for waste/offcuts, 0–100. */
  wastePct: number;
  /** Sales tax percent, 0–30. */
  taxPct: number;
}

export interface LumberLineResult {
  qty: number;
  boardFeetEach: number;
  boardFeet: number;
  linearFeet: number;
  cost: number;
}

export interface LumberResult {
  lines: LumberLineResult[];
  boardFeet: number;
  linearFeet: number;
  pieces: number;
  subtotal: number;
  waste: number;
  tax: number;
  total: number;
  costPerBoardFoot: number;
  retrievedAt: string;
}

export function boardFeet(thicknessIn: number, widthIn: number, lengthFt: number): number {
  return (thicknessIn * widthIn * lengthFt) / 12;
}

function check(label: string, v: number, max: number, allowZero = false) {
  if (!Number.isFinite(v)) throw new ToolError("bad-input", `${label} must be a number.`);
  if (allowZero ? v < 0 : v <= 0) throw new ToolError("bad-input", `${label} must be ${allowZero ? "zero or more" : "more than zero"}.`);
  if (v > max) throw new ToolError("bad-input", `${label} is over ${max.toLocaleString("en-US")}. Check the units.`);
}

export function calculateLumberCost(input: LumberInput): LumberResult {
  if (input.lines.length === 0) throw new ToolError("bad-input", "Add at least one line.");
  check("Waste allowance", input.wastePct, 100, true);
  check("Sales tax", input.taxPct, 30, true);

  const lines = input.lines.map((l, i) => {
    const n = `Line ${i + 1}`;
    check(`${n} quantity`, l.qty, 100000);
    if (!Number.isInteger(l.qty)) throw new ToolError("bad-input", `${n} quantity must be a whole number of pieces.`);
    check(`${n} thickness`, l.thicknessIn, 48);
    check(`${n} width`, l.widthIn, 96);
    check(`${n} length`, l.lengthFt, 100);
    check(`${n} price`, l.price, 1000000, true);
    const bfEach = boardFeet(l.thicknessIn, l.widthIn, l.lengthFt);
    const bf = bfEach * l.qty;
    const lf = l.lengthFt * l.qty;
    const cost =
      l.basis === "piece" ? l.price * l.qty : l.basis === "linear-ft" ? l.price * lf : l.basis === "board-ft" ? l.price * bf : (l.price / 1000) * bf;
    return { qty: l.qty, boardFeetEach: bfEach, boardFeet: bf, linearFeet: lf, cost };
  });

  const bf = lines.reduce((s, l) => s + l.boardFeet, 0);
  const subtotal = lines.reduce((s, l) => s + l.cost, 0);
  const waste = subtotal * (input.wastePct / 100);
  const tax = (subtotal + waste) * (input.taxPct / 100);
  const total = subtotal + waste + tax;
  return {
    lines,
    boardFeet: bf,
    linearFeet: lines.reduce((s, l) => s + l.linearFeet, 0),
    pieces: lines.reduce((s, l) => s + l.qty, 0),
    subtotal,
    waste,
    tax,
    total,
    costPerBoardFoot: bf > 0 ? subtotal / bf : 0,
    retrievedAt: LUMBER_RETRIEVED,
  };
}
