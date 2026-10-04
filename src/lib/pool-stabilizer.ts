import { ToolError } from "./errors";
import { DOSING_RETRIEVED, STABILIZER, scaleDose, validatePpm, validateVolume } from "./pool-dosing";

/**
 * Pool stabilizer (cyanuric acid, CYA) dose.
 *
 * Source: Indiana Department of Health guide (see pool-dosing.ts), Water
 * Chemistry Adjustment Guide, "Increase Stabilizer", Cyanuric Acid:
 * 13 oz / 2.5 lbs / 4.1 lbs for a 10 / 30 / 50 ppm change in 10,000 gallons.
 * The 30 and 50 ppm cells were read from a column-scrambled text layer and
 * confirmed by scaling: 13 oz x 3 = 39 oz = 2.44 lb, x 5 = 65 oz = 4.06 lb.
 *
 * Lowering: the guide's footnote reads "The only way to reduce the level of
 * cyanuric acid in the water is to drain and refill the pool with fresh
 * water." The fraction to replace is 1 - target/current (fresh water assumed
 * to contain no CYA).
 */

export const PRINTED = [
  { ppm: 10, printed: "13 oz" },
  { ppm: 30, printed: "2.5 lbs" },
  { ppm: 50, printed: "4.1 lbs" },
] as const;

export const QUOTES = {
  lowering:
    "The only way to reduce the level of cyanuric acid in the water is to drain and refill the pool with fresh water. Studies have shown that cyanuric acid residual remains in the plaster, filter elements and media, and scale in heaters and pipes.",
  sequence:
    "Add chemicals in sequence to adjust for: (1) Free Available Chlorine, (2) total alkalinity, (3) pH, (4) cyanuric acid – outdoor pools, and (5) total hardness.",
} as const;

export interface StabilizerInput {
  volume: number;
  unit: "gal" | "l";
  currentCya: number;
  targetCya: number;
}

export interface StabilizerResult {
  gallons: number;
  currentCya: number;
  targetCya: number;
  action: "add" | "ok" | "drain";
  /** Ounces by weight of cyanuric acid. */
  oz: number;
  drainFraction: number | null;
  drainGallons: number | null;
  retrievedAt: string;
}

export function calculateStabilizer(input: StabilizerInput): StabilizerResult {
  const gallons = validateVolume(input.volume, input.unit);
  validatePpm("Current stabilizer (CYA)", input.currentCya, 500);
  validatePpm("Target stabilizer (CYA)", input.targetCya, 500);
  if (input.targetCya === 0 && input.currentCya === 0) {
    throw new ToolError("bad-input", "Enter the stabilizer level you are aiming for.");
  }

  const base = { gallons, currentCya: input.currentCya, targetCya: input.targetCya, retrievedAt: DOSING_RETRIEVED };
  const diff = input.targetCya - input.currentCya;

  if (diff > 0) {
    return { ...base, action: "add", oz: scaleDose(STABILIZER, gallons, diff), drainFraction: null, drainGallons: null };
  }
  if (diff === 0) {
    return { ...base, action: "ok", oz: 0, drainFraction: null, drainGallons: null };
  }
  const drainFraction = 1 - input.targetCya / input.currentCya;
  return { ...base, action: "drain", oz: 0, drainFraction, drainGallons: gallons * drainFraction };
}
