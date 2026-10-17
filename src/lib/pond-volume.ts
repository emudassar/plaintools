import { ToolError } from "./errors";

/**
 * Pond volume.
 *
 * Penn State Extension, "Pond Measurements: Area, Volume, and Residence Time"
 * (Swistock & McCarty, updated May 19, 2025), retrieved 2026-10-17:
 *  - volume (acre-feet) = surface area (acres) × average depth (ft)
 *  - "For a typical bowl-shaped pond the average depth can be estimated as
 *    0.4 times the maximum depth."
 *  - circular pond: shoreline distance² ÷ 547,390 = acres
 *  - irregular: average length × average width
 *  - "one acre-foot of water is equal to 325,851 gallons"
 * Gallons per cubic foot: 1728 ÷ 231 = 7.48052 (US gallon = 231 in³, NIST).
 * Oval: π/4 × length × width (ellipse area).
 */

export const PSU_POND_URL = "https://extension.psu.edu/pond-measurements-area-volume-and-residence-time";
export const POND_RETRIEVED = "2026-10-17";
export const GAL_PER_CUFT = 1728 / 231;
export const GAL_PER_ACRE_FT = 325_851;
export const BOWL_FACTOR = 0.4;

export type PondShape = "rect" | "circle" | "shoreline" | "oval" | "trapezoid";

export interface PondInput {
  shape: PondShape;
  unit: "ft" | "m";
  /** rect/oval/trapezoid: length (trapezoid: first long side); circle: diameter; shoreline: perimeter. */
  a: number;
  /** rect/oval: width; trapezoid: width. */
  b: number;
  /** trapezoid: second (shorter) side. */
  c: number;
  depthMode: "average" | "max";
  depth: number;
}

export interface PondResult {
  areaSqFt: number;
  acres: number;
  avgDepthFt: number;
  cuFt: number;
  gallons: number;
  liters: number;
  cuM: number;
  acreFeet: number;
  /** Gallons via the acre-foot figure, as a cross-check. */
  gallonsViaAcreFt: number;
}

const M = 0.3048;

export function pondVolume(i: PondInput): PondResult {
  const k = i.unit === "ft" ? 1 : 1 / M;
  const pos = (v: number, n: string) => {
    if (!Number.isFinite(v) || v <= 0) throw new ToolError("bad-input", `Enter the ${n} as a positive number.`);
    return v * k;
  };
  let areaSqFt: number;
  switch (i.shape) {
    case "rect":
      areaSqFt = pos(i.a, "length") * pos(i.b, "width");
      break;
    case "circle":
      areaSqFt = Math.PI * (pos(i.a, "diameter") / 2) ** 2;
      break;
    case "shoreline": {
      const s = pos(i.a, "shoreline distance");
      areaSqFt = (s * s) / 547_390 * 43_560;
      break;
    }
    case "oval":
      areaSqFt = (Math.PI / 4) * pos(i.a, "length") * pos(i.b, "width");
      break;
    case "trapezoid":
      areaSqFt = ((pos(i.a, "first side") + pos(i.c, "second side")) / 2) * pos(i.b, "width");
      break;
    default:
      throw new ToolError("bad-input", "Pick a pond shape.");
  }
  if (areaSqFt > 43_560 * 1000) throw new ToolError("bad-input", "That is over 1,000 acres. Check the unit.");
  const d = pos(i.depth, i.depthMode === "max" ? "maximum depth" : "average depth");
  if (d > 300) throw new ToolError("bad-input", "A depth over 300 ft looks like a unit mix-up.");
  const avgDepthFt = i.depthMode === "max" ? d * BOWL_FACTOR : d;
  const cuFt = areaSqFt * avgDepthFt;
  const acres = areaSqFt / 43_560;
  const acreFeet = acres * avgDepthFt;
  const gallons = cuFt * GAL_PER_CUFT;
  return {
    areaSqFt,
    acres,
    avgDepthFt,
    cuFt,
    gallons,
    liters: gallons * 3.785411784,
    cuM: cuFt * 0.028316846592,
    acreFeet,
    gallonsViaAcreFt: acreFeet * GAL_PER_ACRE_FT,
  };
}
