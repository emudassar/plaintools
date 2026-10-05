import { ToolError } from "./errors";
import { NASS_2025 } from "./honey-nass";

/**
 * Honey yield from a harvest, by weighing.
 *
 * Extracted honey = weight of the supers before extraction − their weight after
 * extraction (same boxes, frames and comb). Honey weight to volume: National
 * Honey Board FAQ (honey.com/faq, read 2026-10-05): "A gallon of honey weighs
 * approximately 12 pounds" and "1 cup of honey will actually weigh 12 ounces".
 * The U.S. 2025 average yield per colony (48.0 lb) is from USDA NASS Honey,
 * March 2026, shown for context only.
 */

export const YIELD_RETRIEVED = "2026-10-05";
export const NHB_FAQ_URL = "https://honey.com/faq";
export const LB_PER_GALLON = 12;
const KG_PER_LB = 0.45359237;

export const JAR_SIZES: readonly { id: string; label: string; ozNet: number }[] = [
  { id: "8", label: "8 oz", ozNet: 8 },
  { id: "12", label: "12 oz", ozNet: 12 },
  { id: "16", label: "1 lb (16 oz)", ozNet: 16 },
  { id: "32", label: "2 lb (32 oz)", ozNet: 32 },
  { id: "80", label: "5 lb (80 oz)", ozNet: 80 },
];

export interface YieldInput {
  /** Pounds or kilograms. */
  unit: "lb" | "kg";
  /** Total weight of the supers before extraction. */
  fullWeight: number;
  /** Weight of the same supers after extraction. */
  emptyWeight: number;
  /** Percent lost to straining, buckets and spills, 0–50. */
  lossPct: number;
  /** Number of hives the harvest came from, or null. */
  hives: number | null;
  /** Net ounces per jar. */
  jarOz: number;
}

export interface YieldResult {
  honeyLb: number;
  honeyKg: number;
  gallons: number;
  cups: number;
  jars: number;
  jarOz: number;
  perHiveLb: number | null;
  usAverageLb: number;
  retrievedAt: string;
}

export function calculateHoneyYield(input: YieldInput): YieldResult {
  const k = input.unit === "kg" ? 1 / KG_PER_LB : 1;
  if (!Number.isFinite(input.fullWeight) || input.fullWeight <= 0) throw new ToolError("bad-input", "Enter the weight of the supers before extraction.");
  if (!Number.isFinite(input.emptyWeight) || input.emptyWeight < 0) throw new ToolError("bad-input", "Enter the weight of the same supers after extraction.");
  if (input.emptyWeight >= input.fullWeight) throw new ToolError("bad-input", "The weight after extraction must be less than before — otherwise no honey was taken.");
  if (input.fullWeight * k > 100000) throw new ToolError("bad-input", "That is over 100,000 lb. Check the units.");
  if (!Number.isFinite(input.lossPct) || input.lossPct < 0 || input.lossPct > 50) throw new ToolError("bad-input", "Loss must be between 0 and 50%.");
  if (input.hives !== null && (!Number.isInteger(input.hives) || input.hives < 1 || input.hives > 100000)) throw new ToolError("bad-input", "Number of hives must be a whole number of 1 or more.");
  if (!Number.isFinite(input.jarOz) || input.jarOz <= 0) throw new ToolError("bad-input", "Pick a jar size.");

  const honeyLb = (input.fullWeight - input.emptyWeight) * k * (1 - input.lossPct / 100);
  const us = NASS_2025.find((s) => s.id === "US")!;
  return {
    honeyLb,
    honeyKg: honeyLb * KG_PER_LB,
    gallons: honeyLb / LB_PER_GALLON,
    cups: (honeyLb * 16) / 12,
    jars: Math.floor((honeyLb * 16) / input.jarOz + 1e-9),
    jarOz: input.jarOz,
    perHiveLb: input.hives === null ? null : honeyLb / input.hives,
    usAverageLb: us.yieldLb,
    retrievedAt: YIELD_RETRIEVED,
  };
}
