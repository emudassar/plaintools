import { ToolError } from "./errors";

/**
 * Hip roof geometry for a rectangular building with the same pitch on all
 * four sides.
 *
 * Geometry (pitch stated as rise per 12 in of run, the US convention):
 *  - slope factor = sqrt(12^2 + rise^2) / 12
 *  - every plane of the roof has the same pitch, so true roof area =
 *    plan area (outside the overhang) x slope factor
 *  - common rafter run = half the building width
 *  - ridge = building length - building width (0 = pyramid hip)
 *  - hip run = common run x sqrt(2); hip length per 12 in of common run =
 *    sqrt(2 x 12^2 + rise^2) — the "17 on the tongue and the rise on the
 *    blade" of the framing square (12 x sqrt(2) = 16.97 in).
 *
 * Method source for the hip: Ira S. Griffith, "Carpentry", section 23
 * "Determining Length of Hip or Valley Rafter" (public-domain textbook):
 * multiply the hip's unit length per foot of run of COMMON rafter by the total
 * run of common rafter. Retrieved 2026-10-05 from
 *   https://chestofbooks.com/home-improvement/woodworking/Ira-S-Griffith/Carpentry/23-Determining-Length-Of-Hip-Or-Valley-Rafter.html
 *
 * Lengths are theoretical line lengths: no deduction for a ridge board, no
 * plumb-cut allowance.
 */

export const HIP_RETRIEVED = "2026-10-05";
export const GRIFFITH_URL =
  "https://chestofbooks.com/home-improvement/woodworking/Ira-S-Griffith/Carpentry/23-Determining-Length-Of-Hip-Or-Valley-Rafter.html";

const FT_PER_M = 1 / 0.3048;
const SQM_PER_SQFT = 0.09290304;

export interface HipRoofInput {
  length: number;
  width: number;
  unit: "ft" | "m";
  /** Rise in inches per 12 in of run. */
  pitch: number;
  /** Horizontal eave overhang in inches (0 for none). */
  overhangIn: number;
}

export interface HipRoofResult {
  lengthFt: number;
  widthFt: number;
  swapped: boolean;
  pitch: number;
  slopeFactor: number;
  hipUnitIn: number;
  angleDeg: number;
  overhangIn: number;
  planAreaSqft: number;
  roofAreaSqft: number;
  roofAreaSqm: number;
  squares: number;
  /** Two hip ends (triangles) and two sides (trapezoids), sloped area each. */
  endAreaSqft: number;
  sideAreaSqft: number;
  ridgeFt: number;
  commonRunFt: number;
  roofRiseFt: number;
  commonRafterFt: number;
  commonRafterWithOverhangFt: number;
  hipRafterFt: number;
  hipRafterWithOverhangFt: number;
  hipLengthTotalFt: number;
  retrievedAt: string;
}

function pos(label: string, v: number) {
  if (!Number.isFinite(v)) throw new ToolError("bad-input", `${label} must be a number.`);
  if (v <= 0) throw new ToolError("bad-input", `${label} must be more than zero.`);
}

export function calculateHipRoof(input: HipRoofInput): HipRoofResult {
  pos("Length", input.length);
  pos("Width", input.width);
  pos("Pitch", input.pitch);
  if (!Number.isFinite(input.overhangIn) || input.overhangIn < 0) {
    throw new ToolError("bad-input", "Overhang must be zero or more.");
  }
  if (input.pitch > 24) {
    throw new ToolError("bad-input", "Enter the pitch as inches of rise per 12 inches of run (for example 6 for a 6/12 roof), up to 24.");
  }
  const k = input.unit === "m" ? FT_PER_M : 1;
  let L = input.length * k;
  let W = input.width * k;
  if (L > 1000 || W > 1000) throw new ToolError("bad-input", "That building is over 1,000 ft. Check the units.");
  const swapped = W > L;
  if (swapped) [L, W] = [W, L];
  const oFt = input.overhangIn / 12;
  if (oFt > W / 2) throw new ToolError("bad-input", "The overhang is larger than half the building width. Check it is in inches.");

  const slopeFactor = Math.sqrt(144 + input.pitch ** 2) / 12;
  const hipUnitIn = Math.sqrt(2 * 144 + input.pitch ** 2);
  const hipFactor = hipUnitIn / 12;

  const Lo = L + 2 * oFt;
  const Wo = W + 2 * oFt;
  const planAreaSqft = Lo * Wo;
  const roofAreaSqft = planAreaSqft * slopeFactor;
  // Plan shapes (outside the overhang): each end triangle base Wo, depth Wo/2;
  // each side trapezoid parallel sides Lo and (Lo - Wo), depth Wo/2.
  const endPlan = (Wo * (Wo / 2)) / 2;
  const sidePlan = ((Lo + (Lo - Wo)) / 2) * (Wo / 2);

  const commonRunFt = W / 2;
  const hipRafterFt = commonRunFt * hipFactor;
  const hipRafterWithOverhangFt = (commonRunFt + oFt) * hipFactor;

  return {
    lengthFt: L,
    widthFt: W,
    swapped,
    pitch: input.pitch,
    slopeFactor,
    hipUnitIn,
    angleDeg: (Math.atan(input.pitch / 12) * 180) / Math.PI,
    overhangIn: input.overhangIn,
    planAreaSqft,
    roofAreaSqft,
    roofAreaSqm: roofAreaSqft * SQM_PER_SQFT,
    squares: roofAreaSqft / 100,
    endAreaSqft: endPlan * slopeFactor,
    sideAreaSqft: sidePlan * slopeFactor,
    ridgeFt: L - W,
    commonRunFt,
    roofRiseFt: (commonRunFt * input.pitch) / 12,
    commonRafterFt: commonRunFt * slopeFactor,
    commonRafterWithOverhangFt: (commonRunFt + oFt) * slopeFactor,
    hipRafterFt,
    hipRafterWithOverhangFt,
    hipLengthTotalFt: 4 * hipRafterWithOverhangFt,
    retrievedAt: HIP_RETRIEVED,
  };
}

/** 12.3456 ft -> 12′-4 1/8″ (nearest 1/8 in). */
export function ftIn(feet: number): string {
  let eighths = Math.round(feet * 12 * 8);
  const ft = Math.floor(eighths / 96);
  eighths -= ft * 96;
  const inch = Math.floor(eighths / 8);
  let frac = eighths % 8;
  let den = 8;
  while (frac > 0 && frac % 2 === 0) {
    frac /= 2;
    den /= 2;
  }
  return `${ft}′-${inch}${frac ? ` ${frac}/${den}` : ""}″`;
}
