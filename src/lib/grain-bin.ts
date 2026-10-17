import { ToolError } from "./errors";

/**
 * Bushels of grain in a round bin — Iowa Department of Agriculture and Land
 * Stewardship, Grain Warehouse Bureau, "Guidelines on measuring grain",
 * retrieved 2026-10-17:
 *  - "(Diameter) x (Diameter) x (Depth) x (0.7854) = (cubic feet) x (0.80385)
 *     = Standard Bushels"
 *  - bushels per foot = D × D × 0.7854 × 0.80385
 *  - peak: "The height of the peak above the base divided by 3 and multiplied
 *    times the bushels per foot"; if unknown, 0.4 × radius for corn, 0.5 ×
 *    radius for soybeans
 *  - cone (cavity) when grain has been drawn down: measure depth at the side
 *    wall and subtract one-third of the cone depth
 *  - test weight: corn over 54 lb/bu and soybeans over 56 lb/bu yield more
 *    bushels than standard; pack charts via County Extension.
 */

export const IOWA_GRAIN_URL = "https://iowaagriculture.gov/grain-warehouse-bureau/how-measure-your-grain";
export const GRAIN_RETRIEVED = "2026-10-17";

export interface GrainInput {
  diameterFt: number;
  /** Depth of grain at the side wall, ft. */
  depthFt: number;
  top: "level" | "peak" | "cone";
  /** Peak height above the sidewall level, or cone depth below it; null = rule of thumb. */
  topFt: number | null;
  crop: "corn" | "soybeans";
  /** Optional lb per bushel to estimate weight. */
  testWeight: number | null;
}

export interface GrainResult {
  bushelsPerFoot: number;
  levelBushels: number;
  topHeight: number;
  topBushels: number;
  bushels: number;
  cubicFeet: number;
  usedRuleOfThumb: boolean;
  weightLb: number | null;
  weightTons: number | null;
}

export function grainBin(i: GrainInput): GrainResult {
  if (!Number.isFinite(i.diameterFt) || i.diameterFt <= 0 || i.diameterFt > 200) throw new ToolError("bad-input", "Enter the bin diameter in feet.");
  if (!Number.isFinite(i.depthFt) || i.depthFt < 0 || i.depthFt > 300) throw new ToolError("bad-input", "Enter the grain depth at the side wall in feet.");
  const bushelsPerFoot = i.diameterFt * i.diameterFt * 0.7854 * 0.80385;
  const levelBushels = bushelsPerFoot * i.depthFt;
  let topHeight = 0;
  let usedRuleOfThumb = false;
  if (i.top !== "level") {
    if (i.topFt === null) {
      topHeight = (i.diameterFt / 2) * (i.crop === "corn" ? 0.4 : 0.5);
      usedRuleOfThumb = true;
    } else {
      if (!Number.isFinite(i.topFt) || i.topFt < 0 || i.topFt > i.diameterFt) throw new ToolError("bad-input", "Enter the peak height or cone depth in feet, or leave it blank for the rule of thumb.");
      topHeight = i.topFt;
    }
  }
  const sign = i.top === "peak" ? 1 : i.top === "cone" ? -1 : 0;
  const topBushels = sign * (topHeight / 3) * bushelsPerFoot;
  const bushels = levelBushels + topBushels;
  if (bushels < 0) throw new ToolError("bad-input", "The cone is deeper than the grain at the wall. Check the measurements.");
  if (i.testWeight !== null && (!Number.isFinite(i.testWeight) || i.testWeight <= 0 || i.testWeight > 100)) throw new ToolError("bad-input", "Enter the test weight in lb per bushel, or leave it blank.");
  const weightLb = i.testWeight === null ? null : bushels * i.testWeight;
  return {
    bushelsPerFoot,
    levelBushels,
    topHeight,
    topBushels,
    bushels,
    cubicFeet: bushels / 0.80385,
    usedRuleOfThumb,
    weightLb,
    weightTons: weightLb === null ? null : weightLb / 2000,
  };
}
