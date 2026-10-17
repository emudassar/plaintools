import { ToolError } from "./errors";

/**
 * Board and batten wall layout (battens over a flat wall).
 *
 * Arithmetic only. With N vertical battens of width w spread across a wall of
 * width W, a batten at each end and equal gaps between them:
 *   gap        = (W − N·w) ÷ (N − 1)
 *   on-centre  = gap + w
 * Given a target gap instead, N = round((W + gap) ÷ (w + gap)) and the gap is
 * then recomputed so the spacing is exactly equal.
 * Linear feet = N × batten height + horizontal rails × W.
 */

export interface BattenInput {
  /** Wall width, inches. */
  wallW: number;
  /** Height of the vertical battens, inches. */
  battenH: number;
  /** Batten face width, inches. */
  battenW: number;
  mode: "count" | "gap";
  count: number;
  /** Target gap, inches (mode = gap). */
  targetGap: number;
  /** Full-width horizontal rails (top rail, middle rails). */
  rails: number;
  /** Stock length, feet. */
  stockFt: number;
  wastePct: number;
}

export interface BattenResult {
  count: number;
  gap: number;
  onCenter: number;
  /** Left edge of each batten from the wall's left end, inches. */
  positions: number[];
  verticalLf: number;
  railLf: number;
  totalLf: number;
  withWaste: number;
  pieces: number;
  /** Battens taller than one stock piece. */
  needsJoint: boolean;
}

export function boardAndBatten(i: BattenInput): BattenResult {
  for (const [v, n] of [[i.wallW, "wall width"], [i.battenH, "batten height"], [i.battenW, "batten width"]] as const)
    if (!Number.isFinite(v) || v <= 0) throw new ToolError("bad-input", `Enter the ${n} in inches.`);
  if (i.wallW > 1200) throw new ToolError("bad-input", "A wall over 100 ft wide looks like a unit mix-up — enter inches.");
  if (i.battenH > 240) throw new ToolError("bad-input", "Batten height over 20 ft looks like a unit mix-up — enter inches.");
  if (i.battenW >= i.wallW) throw new ToolError("bad-input", "The batten is wider than the wall.");
  if (!Number.isInteger(i.rails) || i.rails < 0 || i.rails > 20) throw new ToolError("bad-input", "Horizontal rails should be a whole number from 0 to 20.");
  if (!Number.isFinite(i.stockFt) || i.stockFt <= 0 || i.stockFt > 24) throw new ToolError("bad-input", "Enter the stock length in feet (for example 8).");
  if (!Number.isFinite(i.wastePct) || i.wastePct < 0 || i.wastePct > 100) throw new ToolError("bad-input", "Waste allowance should be between 0 and 100 percent.");

  let n: number;
  if (i.mode === "count") {
    if (!Number.isInteger(i.count) || i.count < 2 || i.count > 200) throw new ToolError("bad-input", "Number of battens should be a whole number of at least 2 (one at each end).");
    n = i.count;
  } else {
    if (!Number.isFinite(i.targetGap) || i.targetGap <= 0) throw new ToolError("bad-input", "Enter the gap you want between battens, in inches.");
    n = Math.max(2, Math.round((i.wallW + i.targetGap) / (i.battenW + i.targetGap)));
  }
  const gap = (i.wallW - n * i.battenW) / (n - 1);
  if (gap <= 0) throw new ToolError("bad-input", "That many battens do not fit across the wall.");
  const onCenter = gap + i.battenW;
  const positions = Array.from({ length: n }, (_, k) => k * onCenter);
  const verticalLf = (n * i.battenH) / 12;
  const railLf = (i.rails * i.wallW) / 12;
  const totalLf = verticalLf + railLf;
  const withWaste = totalLf * (1 + i.wastePct / 100);
  // Count pieces by cut: each vertical batten needs ceil(H / stock) pieces; rails by length.
  const stockIn = i.stockFt * 12;
  const vPieces = n * Math.ceil(i.battenH / stockIn - 1e-9);
  const rPieces = Math.ceil((i.rails * i.wallW) / stockIn - 1e-9);
  const pieces = Math.ceil((vPieces + rPieces) * (1 + i.wastePct / 100) - 1e-9);
  return { count: n, gap, onCenter, positions, verticalLf, railLf, totalLf, withWaste, pieces, needsJoint: i.battenH > stockIn };
}
