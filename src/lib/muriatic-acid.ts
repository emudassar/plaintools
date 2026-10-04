import { ToolError } from "./errors";
import {
  ALKALINITY_DOWN,
  DOSING_RETRIEVED,
  scaleDose,
  validatePpm,
  validateVolume,
} from "./pool-dosing";

/**
 * Muriatic acid to lower total alkalinity.
 *
 * Source: Indiana Department of Health, "Adjusting Chemical Levels in a
 * Swimming Pool" (see pool-dosing.ts):
 *  - Water Chemistry Adjustment Guide, "Decrease Total Alkalinity", Muriatic
 *    Acid (31.4%): 26 fl.oz. for a 10 ppm change in 10,000 gallons.
 *  - "Do not add more than one quart of acid per 10,000 gallons at one time.
 *    If more acid than this is needed, then make one adjustment, and then
 *    retest 12 hours later before making another adjustment."
 *
 * Only the 31.4% strength the table prints is supported. Converting to other
 * strengths needs density data the source does not give, so the page says so
 * instead of approximating.
 *
 * Lowering pH is deliberately NOT calculated: the source says to use an acid
 * demand test, because the acid a given pH drop needs depends on the water's
 * buffering, which a pH reading alone does not reveal.
 */

export const MURIATIC = ALKALINITY_DOWN.find((f) => f.id === "muriatic")!;

/** One US quart = 32 fl oz; the source's per-addition cap is 1 quart per 10,000 gallons. */
const FLOZ_PER_QUART = 32;

export const QUOTES = {
  cap: "Do not add more than one quart of acid per 10,000 gallons at one time. If more acid than this is needed, then make one adjustment, and then retest 12 hours later before making another adjustment.",
  dilute:
    "dilute acid by adding one quart of muriatic acid (or one pound of sodium bisulfate) slowly to a gallon of water (remember AAA, always add acid to water).",
  demand:
    "It is important to use the Acid or Base Demand Procedure to help determine how much chemical you need to add to the pool water to achieve the desired results.",
} as const;

export interface MuriaticInput {
  volume: number;
  unit: "gal" | "l";
  currentTa: number;
  targetTa: number;
}

export interface MuriaticResult {
  gallons: number;
  currentTa: number;
  targetTa: number;
  ppmDrop: number;
  action: "add" | "none";
  /** Total acid, US fl oz. */
  flOz: number;
  /** The source's per-addition cap for this pool, fl oz. */
  capFlOz: number;
  /** Number of separate additions the cap implies (each followed by a 12-hour retest). */
  additions: number;
  retrievedAt: string;
}

export function calculateMuriatic(input: MuriaticInput): MuriaticResult {
  const gallons = validateVolume(input.volume, input.unit);
  validatePpm("Current total alkalinity", input.currentTa, 1000);
  validatePpm("Target total alkalinity", input.targetTa, 1000);

  const ppmDrop = input.currentTa - input.targetTa;
  const capFlOz = FLOZ_PER_QUART * (gallons / 10_000);

  if (ppmDrop <= 0) {
    return {
      gallons,
      currentTa: input.currentTa,
      targetTa: input.targetTa,
      ppmDrop,
      action: "none",
      flOz: 0,
      capFlOz,
      additions: 0,
      retrievedAt: DOSING_RETRIEVED,
    };
  }
  if (input.targetTa === 0) {
    throw new ToolError("bad-input", "A target of 0 ppm alkalinity is not a pool water level. Enter the target you are aiming for.");
  }

  const flOz = scaleDose(MURIATIC, gallons, ppmDrop);
  return {
    gallons,
    currentTa: input.currentTa,
    targetTa: input.targetTa,
    ppmDrop,
    action: "add",
    flOz,
    capFlOz,
    additions: Math.ceil(flOz / capFlOz - 1e-9),
    retrievedAt: DOSING_RETRIEVED,
  };
}
