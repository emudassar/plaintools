import { ToolError } from "./errors";

/**
 * Starting dive weight estimate.
 *
 * Sources, read from the raw pages 2026-10-14:
 *  - PADI blog, "Why Proper Weighting is Important When Scuba Diving" (blog.padi.com/diving-overweighted/):
 *    "If you're diving with the most common scuba cylinder (an 11-liter aluminum 80) in saltwater …
 *    Start with: 10% of your body weight if wearing a full wetsuit (5-7mm). For a 3mm wetsuit, you may
 *    only need 5% If you're wearing a dry suit, you may need 15% (or more) Next, add two kilograms
 *    (four to five pounds) to offset the buoyancy of the tank at the end of the dive. Then, do a
 *    buoyancy check."
 *  - DAN Alert Diver, "Weight Up!": "Start with weight equivalent to 10 percent of your body weight,
 *    which is a good baseline for a 6mm full wetsuit. For a 3mm suit, use 5 percent … these
 *    percentages are simply starting points."
 *  - Scuba Diving magazine, "Buoyancy Calculator: How to Figure Out How Much Weight You Need":
 *    fresh ↔ salt: "Multiply by 0.025" the total of diver + equipment + weights, add going to salt,
 *    subtract going to fresh; example gear weights "A standard aluminum 80 tank weighs 32 pounds, a
 *    7mm wetsuit is about 8 pounds. For regulator, mask, fins, etc., figure about 15 pounds"; a
 *    diver who "goes from an aluminum 80 to, say, a HP steel 80 could theoretically take six pounds
 *    off his weight belt".
 */

export const SCUBA_RETRIEVED = "2026-10-14";
export const PADI_URL = "https://blog.padi.com/diving-overweighted/";
export const DAN_URL = "https://dan.org/alert-diver/article/weight-up/";
export const SD_URL = "https://www.scubadiving.com/buoyancy-calculator-how-figure-out-how-much-weight-you-need-scuba-diving";

export const KG_PER_LB = 0.45359237;
export type Suit = "3mm" | "5-7mm" | "drysuit";
export type Water = "salt" | "fresh";
export type Tank = "al80" | "steel-hp80";

export const SUIT_PCT: Record<Suit, number> = { "3mm": 0.05, "5-7mm": 0.1, drysuit: 0.15 };
const TANK_OFFSET_KG = 2;
const STEEL_SAVING_LB = 6;
const FRESH_FACTOR = 0.025;
/** Scuba Diving's example: AL80 32 lb + 7 mm wetsuit 8 lb + regulator, mask, fins 15 lb. */
export const DEFAULT_GEAR_LB = 55;

export interface ScubaInput {
  bodyWeight: number;
  unit: "lb" | "kg";
  suit: Suit;
  water: Water;
  tank: Tank;
  /** Equipment weight excluding lead, in the same unit; used only for the freshwater adjustment. */
  gearWeight: number;
}

export interface Step {
  label: string;
  /** Signed change in kg. */
  kg: number;
}

export interface ScubaResult {
  bodyKg: number;
  steps: Step[];
  totalKg: number;
  totalLb: number;
  retrievedAt: string;
}

export function scubaWeight(input: ScubaInput): ScubaResult {
  const toKg = (v: number) => (input.unit === "kg" ? v : v * KG_PER_LB);
  if (!Number.isFinite(input.bodyWeight) || input.bodyWeight <= 0) throw new ToolError("bad-input", "Enter your body weight.");
  const bodyKg = toKg(input.bodyWeight);
  if (bodyKg < 20 || bodyKg > 250) throw new ToolError("bad-input", "That body weight is outside 20–250 kg (44–550 lb). Check the unit.");
  if (input.water === "fresh" && (!Number.isFinite(input.gearWeight) || input.gearWeight < 0))
    throw new ToolError("bad-input", "Enter your equipment weight (without lead) for the freshwater adjustment.");

  const pct = SUIT_PCT[input.suit];
  const steps: Step[] = [
    { label: `${pct * 100}% of body weight for a ${input.suit === "drysuit" ? "dry suit (PADI: 15% or more)" : `${input.suit} wetsuit`} (PADI)`, kg: pct * bodyKg },
    { label: "Add 2 kg (4–5 lb) to offset the tank's buoyancy at the end of the dive (PADI)", kg: TANK_OFFSET_KG },
  ];
  if (input.tank === "steel-hp80")
    steps.push({ label: "HP steel 80 instead of aluminum 80: up to 6 lb less (Scuba Diving magazine)", kg: -STEEL_SAVING_LB * KG_PER_LB });

  let saltKg = steps.reduce((t, s) => t + s.kg, 0);
  if (input.water === "fresh") {
    const gearKg = toKg(input.gearWeight);
    const total = bodyKg + gearKg + saltKg;
    steps.push({ label: `Fresh water: 2.5% less of diver + gear + weights (${(total / KG_PER_LB).toFixed(0)} lb) (Scuba Diving magazine)`, kg: -FRESH_FACTOR * total });
    saltKg = steps.reduce((t, s) => t + s.kg, 0);
  }
  const totalKg = Math.max(0, saltKg);
  return { bodyKg, steps, totalKg, totalLb: totalKg / KG_PER_LB, retrievedAt: SCUBA_RETRIEVED };
}
