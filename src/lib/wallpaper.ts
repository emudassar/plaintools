import { ToolError } from "./errors";

/**
 * Wallpaper rolls — James Dunlop Textiles, "How to calculate wallpaper
 * requirements", retrieved 2026-10-17:
 *  - drops (widths) per wall = wall width ÷ roll width, part-widths counted as
 *    full widths ("any part-widths should be calculated as full-widths")
 *  - drop length = height + 30 cm trim (15 cm top and bottom) + pattern
 *    repeat; no repeat for random/free match
 *  - drops per roll = floor(roll length ÷ drop length) ("only count full drops")
 *  - rolls = drops needed ÷ drops per roll; "Add 10% up to the nearest full
 *    roll ... pattern match of up to 26cm. For ... over 26cm add 15 - 20%."
 *  - doors and windows are treated as full wall.
 * Worked example: 3.5 m wall, 52 cm roll -> 7 drops; 2.5 m + 0.30 + 0.52 =
 * 3.32 m -> 3 drops per 10 m roll.
 */

export const DUNLOP_URL = "https://manufacturer.jamesdunloptextiles.com/journal/tips-how-to/how-to-calculate-wallpaper-requirements";
export const WALLPAPER_RETRIEVED = "2026-10-17";

export interface WallpaperInput {
  /** Wall widths, in the length unit. */
  walls: number[];
  height: number;
  unit: "m" | "ft";
  /** Roll width and length, in cm (m mode) or inches/feet. */
  rollWidth: number;
  rollLength: number;
  /** Pattern repeat in cm (m mode) or inches (ft mode); 0 = random match. */
  repeat: number;
  /** Trim allowance total (top + bottom) in cm / inches. */
  trim: number;
  allowancePct: number;
}

export interface WallpaperResult {
  dropsPerWall: number[];
  drops: number;
  dropLength: number;
  dropsPerRoll: number;
  rollsExact: number;
  rollsNoAllowance: number;
  rolls: number;
}

export function wallpaperRolls(i: WallpaperInput): WallpaperResult {
  if (!i.walls.length || i.walls.some((w) => !Number.isFinite(w) || w <= 0 || w > 1000)) throw new ToolError("bad-input", "Enter every wall width as a positive number.");
  if (!Number.isFinite(i.height) || i.height <= 0 || i.height > 100) throw new ToolError("bad-input", "Enter the wall height.");
  if (!Number.isFinite(i.rollWidth) || i.rollWidth <= 0 || !Number.isFinite(i.rollLength) || i.rollLength <= 0) throw new ToolError("bad-input", "Enter the roll width and length from the label.");
  if (!Number.isFinite(i.repeat) || i.repeat < 0 || !Number.isFinite(i.trim) || i.trim < 0) throw new ToolError("bad-input", "Pattern repeat and trim allowance should be zero or more.");
  if (!Number.isFinite(i.allowancePct) || i.allowancePct < 0 || i.allowancePct > 100) throw new ToolError("bad-input", "Extra allowance should be between 0 and 100 percent.");
  // Work in the small unit: cm (metric) or inches (imperial).
  const toSmall = i.unit === "m" ? 100 : 12;
  const rollW = i.rollWidth; // cm or in
  const rollL = i.rollLength * toSmall; // m->cm or ft->in
  const dropsPerWall = i.walls.map((w) => Math.ceil((w * toSmall) / rollW - 1e-9));
  const drops = dropsPerWall.reduce((a, b) => a + b, 0);
  const dropLength = i.height * toSmall + i.trim + i.repeat;
  const dropsPerRoll = Math.floor(rollL / dropLength + 1e-9);
  if (dropsPerRoll < 1) throw new ToolError("no-data", "One drop is longer than a whole roll, so no full drop can be cut from a roll. Check the height, repeat and roll length.");
  const rollsExact = drops / dropsPerRoll;
  return {
    dropsPerWall,
    drops,
    dropLength,
    dropsPerRoll,
    rollsExact,
    rollsNoAllowance: Math.ceil(rollsExact - 1e-9),
    rolls: Math.ceil(rollsExact * (1 + i.allowancePct / 100) - 1e-9),
  };
}
