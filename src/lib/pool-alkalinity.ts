import { ToolError } from "./errors";
import {
  ALKALINITY_DOWN,
  ALKALINITY_UP,
  DOSING_RETRIEVED,
  scaleDose,
  validatePpm,
  validateVolume,
  type Measure,
} from "./pool-dosing";

/**
 * Total alkalinity adjustment, both directions.
 *
 * Source: Indiana Department of Health guide (see pool-dosing.ts),
 * Water Chemistry Adjustment Guide, "Increase Total Alkalinity" and
 * "Decrease Total Alkalinity" rows, scaled with the guide's own formula.
 *
 * Printed rows used as the cross-check (10 / 30 / 50 ppm, 10,000 gallons):
 *   Sodium bicarbonate     1.4 / 4.2 / 7.0 lbs
 *   Sodium carbonate       0.9 / 2.6 / 4.4 lbs
 *   Sodium sesquicarbonate 1.25 / 3.75 / 6.25 lbs
 *   Muriatic acid (31.4%)  26 fl.oz. / 2.4 qts / 1 gal
 *   Sodium bisulfate       2.1 / 6.4 / 10.5 lbs
 *
 * Rules quoted from the same guide's text:
 *   "Do not attempt to raise it more than about 50 ppm at one time."
 *   "If the TA is at or below 50 ppm, be sure to test for metals in solution
 *    before adding Soda Ash or Baking Soda to the pool."
 */

export const PRINTED: Record<string, readonly [string, string, string]> = {
  bicarb: ["1.4 lbs", "4.2 lbs", "7.0 lbs"],
  carbonate: ["0.9 lbs", "2.6 lbs", "4.4 lbs"],
  sesqui: ["1.25 lbs", "3.75 lbs", "6.25 lbs"],
  muriatic: ["26 fl.oz.", "2.4 qts", "1 gal"],
  bisulfate: ["2.1 lbs", "6.4 lbs", "10.5 lbs"],
};

export const QUOTES = {
  raiseCap: "Do not attempt to raise it more than about 50 ppm at one time.",
  metals:
    "If the TA is at or below 50 ppm, be sure to test for metals in solution before adding Soda Ash or Baking Soda to the pool.",
  pairing:
    "If you need to raise both the pH and TA, then use Sodium Carbonate (Soda Ash) until the pH comes to the proper level, then use Sodium Bicarbonate to make further adjustments to the TA if needed.",
  acidCap: "Do not add more than one quart of acid per 10,000 gallons at one time.",
} as const;

export interface AlkalinityInput {
  volume: number;
  unit: "gal" | "l";
  currentTa: number;
  targetTa: number;
}

export interface ProductAmount {
  id: string;
  label: string;
  measure: Measure;
  amount: number;
  printed: readonly [string, string, string];
}

export interface AlkalinityResult {
  gallons: number;
  currentTa: number;
  targetTa: number;
  direction: "raise" | "lower" | "none";
  ppmChange: number;
  products: ProductAmount[];
  /** Raise only: change exceeds the guide's ~50 ppm-at-once advice. */
  overRaiseCap: boolean;
  /** Raise only: current TA at or below 50 ppm, where the guide says to test for metals first. */
  metalsWarning: boolean;
  retrievedAt: string;
}

export function calculateAlkalinity(input: AlkalinityInput): AlkalinityResult {
  const gallons = validateVolume(input.volume, input.unit);
  validatePpm("Current total alkalinity", input.currentTa, 1000);
  validatePpm("Target total alkalinity", input.targetTa, 1000);
  if (input.targetTa === 0) {
    throw new ToolError("bad-input", "Enter the total alkalinity you are aiming for — 0 ppm is not a pool water level.");
  }

  const diff = input.targetTa - input.currentTa;
  const base = {
    gallons,
    currentTa: input.currentTa,
    targetTa: input.targetTa,
    retrievedAt: DOSING_RETRIEVED,
  };

  if (diff === 0) {
    return { ...base, direction: "none", ppmChange: 0, products: [], overRaiseCap: false, metalsWarning: false };
  }

  const list = diff > 0 ? ALKALINITY_UP : ALKALINITY_DOWN;
  const ppmChange = Math.abs(diff);
  const products = list.map((f) => ({
    id: f.id,
    label: f.label,
    measure: f.measure,
    amount: scaleDose(f, gallons, ppmChange),
    printed: PRINTED[f.id],
  }));

  return {
    ...base,
    direction: diff > 0 ? "raise" : "lower",
    ppmChange,
    products,
    overRaiseCap: diff > 50,
    metalsWarning: diff > 0 && input.currentTa <= 50,
  };
}
