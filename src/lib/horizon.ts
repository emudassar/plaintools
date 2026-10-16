import { ToolError } from "./errors";

/**
 * Distance to the horizon.
 *
 * Geometric (no refraction), spherical Earth: d = sqrt(2Rh + h^2), R = 6,371 km
 * (Wikipedia, "Horizon", Distance to the horizon). For h << R this is about
 * 3.57 * sqrt(h) km with h in metres.
 *
 * With standard atmospheric refraction: A. T. Young (San Diego State University,
 * "Distance to the Horizon") replaces R with an effective radius R' = 7R/6, which
 * gives about 3.86 * sqrt(h) km. Real refraction varies with the weather; over
 * water in spring it can be far larger.
 *
 * Hidden part of a distant object: the observer's line of sight grazes the
 * horizon at distance d1; beyond it, an object at distance D has its lower part
 * hidden by the curve. With the same model, hidden height h2 satisfies
 * D - d1 = sqrt(2 R h2 + h2^2), so h2 = sqrt(R^2 + (D - d1)^2) - R.
 * (Distances measured along the line of sight, which for these ranges differ
 * from surface distance by far less than the refraction uncertainty.)
 */

export const EARTH_R_M = 6371000;
export const REFRACTION_FACTOR = 7 / 6;
export const WIKI_HORIZON_URL = "https://en.wikipedia.org/wiki/Horizon#Distance_to_the_horizon";
export const YOUNG_URL = "https://aty.sdsu.edu/explain/atmos_refr/horizon.html";

export function horizonDistanceM(heightM: number, refraction: boolean): number {
  const R = EARTH_R_M * (refraction ? REFRACTION_FACTOR : 1);
  return Math.sqrt(2 * R * heightM + heightM * heightM);
}

/** Height of an object at distance D hidden below the horizon for an observer at height h1. */
export function hiddenHeightM(observerM: number, distanceM: number, refraction: boolean): number {
  const R = EARTH_R_M * (refraction ? REFRACTION_FACTOR : 1);
  const d1 = horizonDistanceM(observerM, refraction);
  if (distanceM <= d1) return 0;
  const rest = distanceM - d1;
  return Math.sqrt(R * R + rest * rest) - R;
}

export interface HorizonResult {
  observerM: number;
  geometricM: number;
  refractedM: number;
  /** Optional target object. */
  target: null | {
    heightM: number;
    /** Max distance at which its top is still on the horizon. */
    maxSeenGeometricM: number;
    maxSeenRefractedM: number;
  };
  /** Optional: hidden height at a given distance. */
  hidden: null | {
    distanceM: number;
    geometricM: number;
    refractedM: number;
  };
}

export function horizon(input: { observerM: number; targetM?: number | null; distanceM?: number | null }): HorizonResult {
  const h = input.observerM;
  if (!Number.isFinite(h) || h < 0) throw new ToolError("bad-input", "Enter a height of zero or more.");
  if (h > 1_000_000) throw new ToolError("bad-input", "Heights above 1,000 km are out of range for this page.");
  const t = input.targetM;
  if (t !== null && t !== undefined && (!Number.isFinite(t) || t < 0)) {
    throw new ToolError("bad-input", "The object's height must be zero or more.");
  }
  const D = input.distanceM;
  if (D !== null && D !== undefined && (!Number.isFinite(D) || D <= 0)) {
    throw new ToolError("bad-input", "The distance must be more than zero.");
  }
  return {
    observerM: h,
    geometricM: horizonDistanceM(h, false),
    refractedM: horizonDistanceM(h, true),
    target:
      t === null || t === undefined
        ? null
        : {
            heightM: t,
            maxSeenGeometricM: horizonDistanceM(h, false) + horizonDistanceM(t, false),
            maxSeenRefractedM: horizonDistanceM(h, true) + horizonDistanceM(t, true),
          },
    hidden:
      D === null || D === undefined
        ? null
        : { distanceM: D, geometricM: hiddenHeightM(h, D, false), refractedM: hiddenHeightM(h, D, true) },
  };
}
