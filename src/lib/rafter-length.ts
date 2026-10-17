import { ToolError } from "./errors";

/**
 * Common rafter length for a gable roof.
 *
 * Ira S. Griffith, "Carpentry", §17 "To Find The Length Of A Common Rafter"
 * (public-domain textbook): "the length of a common rafter is the hypotenuse
 * of a right triangle whose legs are the rise and the run of the roof", and the
 * length per foot of run is constant for a pitch, so
 *   length = run (ft) × sqrt(12² + rise²) (in per ft of run)
 * Griffith's worked example: 25 ft span, quarter pitch (6 in rise per ft) ->
 * 12.5 × 13.42 in = 167.75 in = 13.98 ft. "When a tail is a part of the rafter,
 * proceed in the manner described adding the run of the tail".
 *
 * Ridge board: the run to the ridge's face is shortened by half the ridge
 * thickness, measured level (plain geometry; Griffith §25 applies the same
 * idea to hips). Lengths are theoretical line lengths along the rafter's
 * measuring line, before the birdsmouth and plumb cuts.
 */

export const GRIFFITH_RAFTER_URL =
  "https://chestofbooks.com/home-improvement/woodworking/Ira-S-Griffith/Carpentry/17-To-Find-The-Length-Of-A-Common-Rafter.html";
export const RAFTER_RETRIEVED = "2026-10-17";

export interface RafterInput {
  /** Building span (outside of wall plates), feet. */
  spanFt: number;
  /** Rise in inches per 12 in of run. */
  pitch: number;
  /** Horizontal overhang (run of the tail), inches. */
  overhangIn: number;
  /** Ridge board thickness, inches (0 = no ridge board). */
  ridgeIn: number;
}

export interface RafterResult {
  /** Run to the centre of the ridge, ft. */
  run: number;
  /** Run after the half-ridge deduction, ft. */
  netRun: number;
  /** Total rise at centre of ridge, ft. */
  rise: number;
  perFootIn: number;
  /** Line length plate-to-ridge (after ridge deduction), ft. */
  mainLength: number;
  /** Tail length along the slope, ft. */
  tailLength: number;
  totalLength: number;
  /** Smallest common stock length (even feet) that covers the total. */
  stockFt: number | null;
  angleDeg: number;
  slopePct: number;
}

export function rafterLength(i: RafterInput): RafterResult {
  if (!Number.isFinite(i.spanFt) || i.spanFt <= 0 || i.spanFt > 200) throw new ToolError("bad-input", "Enter the building span in feet.");
  if (!Number.isFinite(i.pitch) || i.pitch <= 0 || i.pitch > 36) throw new ToolError("bad-input", "Enter the pitch as inches of rise per 12 in of run (for example 6).");
  if (!Number.isFinite(i.overhangIn) || i.overhangIn < 0 || i.overhangIn > 120) throw new ToolError("bad-input", "Overhang should be between 0 and 120 inches.");
  if (!Number.isFinite(i.ridgeIn) || i.ridgeIn < 0 || i.ridgeIn > 12) throw new ToolError("bad-input", "Ridge thickness should be between 0 and 12 inches.");
  const run = i.spanFt / 2;
  const netRun = run - i.ridgeIn / 2 / 12;
  if (netRun <= 0) throw new ToolError("bad-input", "The ridge board is wider than the span.");
  const perFootIn = Math.sqrt(144 + i.pitch * i.pitch);
  const k = perFootIn / 12;
  const mainLength = netRun * k;
  const tailLength = (i.overhangIn / 12) * k;
  const totalLength = mainLength + tailLength;
  const stock = [8, 10, 12, 14, 16, 18, 20, 22, 24].find((s) => s >= totalLength - 1e-9) ?? null;
  return {
    run,
    netRun,
    rise: (run * i.pitch) / 12,
    perFootIn,
    mainLength,
    tailLength,
    totalLength,
    stockFt: stock,
    angleDeg: (Math.atan(i.pitch / 12) * 180) / Math.PI,
    slopePct: (i.pitch / 12) * 100,
  };
}

/** Feet as 13' 11-3/4" to the nearest 1/16 in. */
export function feetInches(ft: number): string {
  let totalSixteenths = Math.round(ft * 12 * 16);
  const feet = Math.floor(totalSixteenths / (12 * 16));
  totalSixteenths -= feet * 12 * 16;
  const inches = Math.floor(totalSixteenths / 16);
  let frac = totalSixteenths - inches * 16;
  let fracStr = "";
  if (frac) {
    let den = 16;
    while (frac % 2 === 0) {
      frac /= 2;
      den /= 2;
    }
    fracStr = `-${frac}/${den}`;
  }
  return `${feet}' ${inches}${fracStr}"`;
}
