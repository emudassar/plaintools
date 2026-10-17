import { ToolError } from "./errors";

/**
 * Linear feet for boards and trim.
 *
 * Arithmetic only:
 *  - square feet -> linear feet: area × 12 ÷ coverage width (in)
 *    (coverage width = the face each board covers once installed, which is
 *    narrower than the nominal width for tongue-and-groove or lapped boards)
 *  - pieces -> linear feet: Σ count × length
 *  - linear feet -> square feet: linear ft × coverage width ÷ 12
 */

export interface SqFtToLinearInput {
  sqft: number;
  /** Coverage (exposed face) width in inches. */
  widthIn: number;
  wastePct: number;
  /** Stock length in feet, for a piece count. Optional. */
  stockFt: number | null;
  pricePerLf: number | null;
}

export interface SqFtToLinearResult {
  linearFt: number;
  withWaste: number;
  pieces: number | null;
  cost: number | null;
}

function check(v: number, name: string, max: number) {
  if (!Number.isFinite(v) || v <= 0 || v > max) throw new ToolError("bad-input", `Enter ${name} as a positive number.`);
}

export function sqftToLinear(i: SqFtToLinearInput): SqFtToLinearResult {
  check(i.sqft, "the area in square feet", 1_000_000);
  check(i.widthIn, "the board's coverage width in inches", 48);
  if (!Number.isFinite(i.wastePct) || i.wastePct < 0 || i.wastePct > 100) throw new ToolError("bad-input", "Waste allowance should be between 0 and 100 percent.");
  if (i.stockFt !== null) check(i.stockFt, "the stock length in feet", 40);
  if (i.pricePerLf !== null && (!Number.isFinite(i.pricePerLf) || i.pricePerLf < 0)) throw new ToolError("bad-input", "Enter the price as a positive number, or leave it blank.");
  const linearFt = (i.sqft * 12) / i.widthIn;
  const withWaste = linearFt * (1 + i.wastePct / 100);
  const pieces = i.stockFt ? Math.ceil(withWaste / i.stockFt - 1e-9) : null;
  const billedFt = pieces && i.stockFt ? pieces * i.stockFt : withWaste;
  return { linearFt, withWaste, pieces, cost: i.pricePerLf === null ? null : billedFt * i.pricePerLf };
}

export interface PieceRow {
  count: number;
  /** Length of each piece: feet + inches. */
  feet: number;
  inches: number;
}

export function piecesToLinear(rows: PieceRow[], pricePerLf: number | null) {
  if (!rows.length) throw new ToolError("bad-input", "Add at least one row of pieces.");
  let total = 0;
  for (const r of rows) {
    if (!Number.isInteger(r.count) || r.count < 0 || r.count > 100_000) throw new ToolError("bad-input", "Piece counts should be whole numbers.");
    if (!Number.isFinite(r.feet) || r.feet < 0 || !Number.isFinite(r.inches) || r.inches < 0) throw new ToolError("bad-input", "Lengths should be zero or more.");
    total += r.count * (r.feet + r.inches / 12);
  }
  if (total <= 0) throw new ToolError("bad-input", "The pieces add up to zero length.");
  if (pricePerLf !== null && (!Number.isFinite(pricePerLf) || pricePerLf < 0)) throw new ToolError("bad-input", "Enter the price as a positive number, or leave it blank.");
  return { linearFt: total, meters: total * 0.3048, yards: total / 3, cost: pricePerLf === null ? null : total * pricePerLf };
}

export function linearToSqft(linearFt: number, widthIn: number) {
  check(linearFt, "the linear feet", 1_000_000);
  check(widthIn, "the board's coverage width in inches", 48);
  return { sqft: (linearFt * widthIn) / 12 };
}
