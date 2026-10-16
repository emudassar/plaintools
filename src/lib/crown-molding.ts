import { ToolError } from "./errors";

/**
 * Crown molding miter and bevel angles for cutting flat on a compound miter saw.
 *
 * Formulas as given in Wikipedia, "Crown molding" (read 2026-10-16):
 *   miter = arctan( sin(spring angle) / tan(wall angle / 2) )
 *   bevel = arcsin( cos(spring angle) × cos(wall angle / 2) )
 * where the wall angle is the angle between the two walls at the corner
 * (90° for a square corner) and the spring angle is the molding's angle off
 * the wall (sold as 38° and 45° profiles).
 *
 * Checks worked by hand: 38° spring at a 90° corner → miter 31.62°, bevel
 * 33.86° (the detents many compound miter saws carry); 45° spring at 90° →
 * miter 35.26°, bevel 30.00°; a 180° "corner" (straight wall) → 0°, 0°.
 */

export const CROWN_RETRIEVED = "2026-10-16";
export const WIKI_URL = "https://en.wikipedia.org/wiki/Crown_molding";

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export interface CrownAngles {
  miter: number;
  bevel: number;
}

export function crownAngles(wallAngle: number, springAngle: number): CrownAngles {
  if (!Number.isFinite(wallAngle) || wallAngle <= 0 || wallAngle >= 360)
    throw new ToolError("bad-input", "Enter the corner (wall) angle in degrees — 90 for a square corner.");
  if (wallAngle < 30 || wallAngle > 180)
    throw new ToolError("bad-input", "Enter the angle between the walls, between 30° and 180°. For an outside corner use the same angle measured on the room side (e.g. 90°).");
  if (!Number.isFinite(springAngle) || springAngle <= 0 || springAngle >= 90)
    throw new ToolError("bad-input", "The spring angle should be between 0° and 90° (38° and 45° are the common profiles).");
  const half = rad(wallAngle / 2);
  const s = rad(springAngle);
  const miter = wallAngle === 180 ? 0 : deg(Math.atan(Math.sin(s) / Math.tan(half)));
  const bevel = deg(Math.asin(Math.cos(s) * Math.cos(half)));
  return { miter, bevel: Math.abs(bevel) < 1e-9 ? 0 : bevel };
}

/** Interior angle of a regular polygon with n sides — the wall angle for bay windows and n-sided rooms. */
export const polygonAngle = (sides: number) => (180 * (sides - 2)) / sides;

export const CHART_WALLS: readonly number[] = [60, 72, 90, 100, 108, 112.5, 120, 128.57, 135, 144, 150, 157.5, 160, 170];
export const CHART_SPRINGS: readonly number[] = [38, 45];
