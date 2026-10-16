import { ToolError } from "./errors";

/**
 * Baseboard quantity.
 *
 * Plain arithmetic, no external figures:
 *   net linear feet = Σ wall lengths − Σ opening widths
 *   with allowance  = net × (1 + waste % / 100)
 *   pieces          = ceil(with allowance ÷ stock length)
 * Walls entered as a rectangle use the perimeter 2 × (L + W).
 * The waste allowance is the user's own figure; the page does not set one.
 */

export interface BaseboardInput {
  /** Wall lengths in feet. */
  walls: number[];
  openings: number;
  /** Width of each opening, feet. */
  openingWidth: number;
  /** Stock piece length, feet. */
  stock: number;
  wastePct: number;
  price: number | null;
  priceUnit: "piece" | "foot";
}

export interface BaseboardResult {
  gross: number;
  deducted: number;
  net: number;
  withWaste: number;
  pieces: number;
  purchasedFeet: number;
  /** Walls longer than one stock piece, which need a joint. */
  wallsNeedingJoints: number;
  cost: number | null;
}

export function baseboard(input: BaseboardInput): BaseboardResult {
  if (!input.walls.length || input.walls.some((w) => !Number.isFinite(w) || w <= 0))
    throw new ToolError("bad-input", "Enter every wall length as a positive number.");
  if (input.walls.some((w) => w > 500)) throw new ToolError("bad-input", "A wall over 500 ft looks like a unit mix-up — enter feet.");
  if (!Number.isInteger(input.openings) || input.openings < 0 || input.openings > 100)
    throw new ToolError("bad-input", "Number of doorways should be a whole number from 0 to 100.");
  if (input.openings > 0 && (!Number.isFinite(input.openingWidth) || input.openingWidth <= 0 || input.openingWidth > 20))
    throw new ToolError("bad-input", "Enter the doorway width in feet (for example 3).");
  if (!Number.isFinite(input.stock) || input.stock <= 0 || input.stock > 24) throw new ToolError("bad-input", "Enter the stock length in feet (for example 8, 12 or 16).");
  if (!Number.isFinite(input.wastePct) || input.wastePct < 0 || input.wastePct > 100) throw new ToolError("bad-input", "Waste allowance should be between 0 and 100 percent.");

  const gross = input.walls.reduce((a, b) => a + b, 0);
  const deducted = input.openings * (input.openings > 0 ? input.openingWidth : 0);
  const net = gross - deducted;
  if (net <= 0) throw new ToolError("bad-input", "The doorways add up to more than the walls. Check the widths.");
  const withWaste = net * (1 + input.wastePct / 100);
  const pieces = Math.ceil(withWaste / input.stock - 1e-9);

  let cost: number | null = null;
  if (input.price !== null) {
    if (!Number.isFinite(input.price) || input.price < 0) throw new ToolError("bad-input", "Enter the price as a positive number, or leave it blank.");
    cost = input.priceUnit === "piece" ? pieces * input.price : pieces * input.stock * input.price;
  }
  return {
    gross,
    deducted,
    net,
    withWaste,
    pieces,
    purchasedFeet: pieces * input.stock,
    wallsNeedingJoints: input.walls.filter((w) => w > input.stock).length,
    cost,
  };
}

