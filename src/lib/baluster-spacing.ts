import { ToolError } from "./errors";

/**
 * Baluster (spindle) spacing for a guard section between two posts.
 *
 * IRC 2021 R312.1.3 "Opening limitations" (read on codes.iccsafe.org
 * 2026-10-17): "Required guards shall not have openings from the walking
 * surface to the required guard height that allow passage of a sphere 4
 * inches (102 mm) in diameter." Exception 2: "Guards on the open side of
 * stairs shall not have openings that allow passage of a sphere 4-3/8 inches
 * (111 mm) in diameter."
 *
 * With n balusters of width w between posts a clear distance L apart there are
 * n + 1 equal gaps: gap = (L − n·w) ÷ (n + 1). The smallest n with
 * gap < limit is n = floor((L − limit) ÷ (w + limit)) + 1 (strictly less, so a
 * sphere of the limit's diameter cannot pass).
 */

export const IRC_CH3_URL = "https://codes.iccsafe.org/content/IRC2021P2/chapter-3-building-planning";
export const BALUSTER_RETRIEVED = "2026-10-17";

export const LIMITS = {
  guard: { label: "Deck or floor guard — 4 in sphere (IRC R312.1.3)", inches: 4 },
  stair: { label: "Open side of stairs — 4-3/8 in sphere (R312.1.3 exc. 2)", inches: 4.375 },
} as const;

export interface BalusterInput {
  /** Clear distance between posts, inches. */
  spanIn: number;
  /** Baluster width at its narrowest point, inches. */
  widthIn: number;
  /** Maximum opening allowed, inches. */
  limitIn: number;
  /** Optional: preferred count (null = minimum that meets the limit). */
  count: number | null;
  /** Number of identical sections. */
  sections: number;
}

export interface BalusterResult {
  minCount: number;
  count: number;
  gap: number;
  onCenter: number;
  /** Centre of each baluster from the left post face, inches. */
  centers: number[];
  meetsLimit: boolean;
  totalBalusters: number;
}

export function balusterSpacing(i: BalusterInput): BalusterResult {
  if (!Number.isFinite(i.spanIn) || i.spanIn <= 0 || i.spanIn > 600) throw new ToolError("bad-input", "Enter the clear distance between posts in inches.");
  if (!Number.isFinite(i.widthIn) || i.widthIn <= 0 || i.widthIn > 12) throw new ToolError("bad-input", "Enter the baluster width in inches (for example 1.5).");
  if (!Number.isFinite(i.limitIn) || i.limitIn <= 0 || i.limitIn > 12) throw new ToolError("bad-input", "Enter the maximum opening in inches.");
  if (!Number.isInteger(i.sections) || i.sections < 1 || i.sections > 500) throw new ToolError("bad-input", "Number of sections should be a whole number of at least 1.");
  const minCount = i.spanIn < i.limitIn ? 0 : Math.floor((i.spanIn - i.limitIn) / (i.widthIn + i.limitIn) + 1e-12) + 1;
  let count = minCount;
  if (i.count !== null) {
    if (!Number.isInteger(i.count) || i.count < 0 || i.count > 500) throw new ToolError("bad-input", "Baluster count should be a whole number.");
    count = i.count;
  }
  const gap = (i.spanIn - count * i.widthIn) / (count + 1);
  if (gap <= 0) throw new ToolError("bad-input", "That many balusters do not fit between the posts.");
  const onCenter = gap + i.widthIn;
  const centers = Array.from({ length: count }, (_, k) => gap + i.widthIn / 2 + k * onCenter);
  return { minCount, count, gap, onCenter, centers, meetsLimit: gap < i.limitIn, totalBalusters: count * i.sections };
}
