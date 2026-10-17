import { ToolError } from "./errors";

/**
 * Pond liner size.
 *
 * A flexible liner must cover the bottom, run down and up both sides, and lie
 * flat past the edge to be anchored:
 *   liner length = pond length + 2 × maximum depth + 2 × edge overlap
 *   liner width  = pond width  + 2 × maximum depth + 2 × edge overlap
 * All Pond Solutions, "Calculating the size of your pond liner", retrieved
 * 2026-10-17: "Overlap + Depth + Width + Depth + Overlap = TOTAL" (same for
 * length); "Overlap should always be 0.6m (2 feet)" so "the liner can be
 * secured to the ground. If not secured, the liner will sink into the pond";
 * round totals up.
 * Using the maximum depth on both sides is conservative for sloped sides and
 * shelves. Underlay is the same size.
 */

export const APS_URL = "https://www.allpondsolutions.co.uk/blogs/fishkeeping-advice/calculating-the-size-of-your-pond-liner";
export const LINER_RETRIEVED = "2026-10-17";

export interface LinerInput {
  length: number;
  width: number;
  maxDepth: number;
  /** Overlap on each edge. */
  overlap: number;
  unit: "ft" | "m";
  /** Optional: liner roll widths available (same unit), for a check. */
  pricePerArea: number | null;
}

export interface LinerResult {
  linerLength: number;
  linerWidth: number;
  area: number;
  cost: number | null;
}

export function pondLiner(i: LinerInput): LinerResult {
  for (const [v, n] of [[i.length, "pond length"], [i.width, "pond width"], [i.maxDepth, "maximum depth"]] as const)
    if (!Number.isFinite(v) || v <= 0 || v > 1000) throw new ToolError("bad-input", `Enter the ${n} as a positive number.`);
  if (!Number.isFinite(i.overlap) || i.overlap < 0 || i.overlap > 50) throw new ToolError("bad-input", "Edge overlap should be zero or more.");
  if (i.pricePerArea !== null && (!Number.isFinite(i.pricePerArea) || i.pricePerArea < 0)) throw new ToolError("bad-input", "Enter the price per square unit, or leave it blank.");
  const linerLength = i.length + 2 * i.maxDepth + 2 * i.overlap;
  const linerWidth = i.width + 2 * i.maxDepth + 2 * i.overlap;
  const area = linerLength * linerWidth;
  return { linerLength, linerWidth, area, cost: i.pricePerArea === null ? null : area * i.pricePerArea };
}
