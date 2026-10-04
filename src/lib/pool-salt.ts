import { ToolError } from "./errors";

/**
 * Pool salt dose for a salt chlorine generator.
 *
 * Method: salt is dosed by mass of water. One US gallon of water weighs
 * 8.34 lb, so raising N gallons by D ppm (parts per million by weight) needs
 *
 *   pounds = gallons x D x 8.34 / 1,000,000
 *
 * Cross-check: Hayward's AquaRite manual (092538 Rev D and earlier editions)
 * prints a table "POUNDS and (Kg) OF SALT NEEDED FOR 3200 PPM". Its cells agree
 * with this formula to the pound, e.g.
 *   8,000 gal from 0 ppm    -> 213 lb   (formula 213.5)
 *   10,000 gal from 0 ppm   -> 267 lb   (formula 266.9)
 *   40,000 gal from 0 ppm   -> 1067 lb  (formula 1067.5)
 * Retrieved 2026-10-04 from
 *   https://hayward.com/media/wysiwyg/pdf/aqua_rite_product_manual.pdf
 *
 * Lowering salt: the same manual states the only way is to partially drain and
 * refill with fresh water. With fresh (salt-free) refill water the fraction to
 * replace is 1 - target/current, which is the same mass balance run backwards.
 *
 * No network request. It reports arithmetic and what the manual says; it does
 * not know which generator someone owns or what their test strip really reads.
 */

const RETRIEVED = "2026-10-04";
export const LB_PER_GALLON = 8.34;
export const LITRES_PER_GALLON = 3.785411784;
export const KG_PER_LB = 0.45359237;

export type VolumeUnit = "gal" | "l";

export const QUOTES = {
  ideal: {
    source: "Hayward AquaRite manual, Water Chemistry",
    text: "The ideal salt level is between 2700-3400 ppm (parts per million) with 3200 ppm being optimal.",
  },
  evaporation: {
    source: "Hayward AquaRite manual, Salt Level",
    text: "Salt is not lost due to evaporation.",
  },
  lowering: {
    source: "Hayward AquaRite manual, How to Add or Remove Salt",
    text: "The only way to lower the salt concentration is to partially drain the pool and refill with fresh water.",
  },
  saltType: {
    source: "Hayward AquaRite manual, Type of Salt to Use",
    text: "It is important to use only sodium chloride (NaCl) salt that is greater than 99% pure.",
  },
} as const;

/**
 * Hayward's printed table, first row only ("0" ppm current salt), pounds to reach 3200 ppm.
 * Only this row is reproduced because its label is unambiguous in the source PDF.
 * The 20,000-gallon cell is omitted: its pound figure is not legible in the text layer.
 */
export const HAYWARD_ZERO_ROW: readonly { gallons: number; pounds: number }[] = [
  { gallons: 8000, pounds: 213 },
  { gallons: 10000, pounds: 267 },
  { gallons: 12000, pounds: 320 },
  { gallons: 14000, pounds: 373 },
  { gallons: 16000, pounds: 427 },
  { gallons: 18000, pounds: 480 },
  { gallons: 22000, pounds: 587 },
  { gallons: 24000, pounds: 640 },
  { gallons: 30000, pounds: 800 },
  { gallons: 40000, pounds: 1067 },
];

export interface PoolSaltInput {
  volume: number;
  unit: VolumeUnit;
  currentPpm: number;
  targetPpm: number;
  /** Bag size in pounds, for the bag count. */
  bagLb: number;
}

export interface PoolSaltResult {
  gallons: number;
  litres: number;
  currentPpm: number;
  targetPpm: number;
  /** "add" when below target, "ok" when equal, "drain" when above. */
  action: "add" | "ok" | "drain";
  pounds: number;
  kilograms: number;
  bags: number;
  bagLb: number;
  /** Fraction of the water to replace with fresh water when above target. Null otherwise. */
  drainFraction: number | null;
  drainGallons: number | null;
  /** True when the target is outside the manual's 2700-3400 ppm band. */
  targetOutsideHaywardRange: boolean;
  retrievedAt: string;
}

export function calculatePoolSalt(input: PoolSaltInput): PoolSaltResult {
  const { volume, unit, currentPpm, targetPpm, bagLb } = input;

  for (const [label, v] of [
    ["Pool volume", volume],
    ["Current salt reading", currentPpm],
    ["Target salt level", targetPpm],
    ["Bag size", bagLb],
  ] as const) {
    if (!Number.isFinite(v)) throw new ToolError("bad-input", `${label} must be a number.`);
  }
  if (volume <= 0) throw new ToolError("bad-input", "Enter the pool volume — it must be more than zero.");
  const gallons = unit === "gal" ? volume : volume / LITRES_PER_GALLON;
  if (gallons > 2_000_000) {
    throw new ToolError("bad-input", "That volume is larger than any residential or commercial pool. Check the units.");
  }
  if (currentPpm < 0 || targetPpm < 0) {
    throw new ToolError("bad-input", "Salt readings cannot be negative.");
  }
  if (currentPpm > 40_000 || targetPpm > 40_000) {
    throw new ToolError(
      "bad-input",
      "Readings above 40,000 ppm are seawater strength or higher. Check that the reading is in ppm, not g/L × 1000.",
    );
  }
  if (targetPpm === 0) throw new ToolError("bad-input", "Enter a target salt level above zero.");
  if (bagLb <= 0) throw new ToolError("bad-input", "Bag size must be more than zero.");

  const litres = gallons * LITRES_PER_GALLON;
  const delta = targetPpm - currentPpm;

  if (delta > 0) {
    const pounds = (gallons * delta * LB_PER_GALLON) / 1_000_000;
    return {
      gallons,
      litres,
      currentPpm,
      targetPpm,
      action: "add",
      pounds,
      kilograms: pounds * KG_PER_LB,
      bags: Math.ceil(pounds / bagLb - 1e-9),
      bagLb,
      drainFraction: null,
      drainGallons: null,
      targetOutsideHaywardRange: targetPpm < 2700 || targetPpm > 3400,
      retrievedAt: RETRIEVED,
    };
  }

  if (delta === 0) {
    return {
      gallons,
      litres,
      currentPpm,
      targetPpm,
      action: "ok",
      pounds: 0,
      kilograms: 0,
      bags: 0,
      bagLb,
      drainFraction: null,
      drainGallons: null,
      targetOutsideHaywardRange: targetPpm < 2700 || targetPpm > 3400,
      retrievedAt: RETRIEVED,
    };
  }

  const drainFraction = 1 - targetPpm / currentPpm;
  return {
    gallons,
    litres,
    currentPpm,
    targetPpm,
    action: "drain",
    pounds: 0,
    kilograms: 0,
    bags: 0,
    bagLb,
    drainFraction,
    drainGallons: gallons * drainFraction,
    targetOutsideHaywardRange: targetPpm < 2700 || targetPpm > 3400,
    retrievedAt: RETRIEVED,
  };
}

export function fmt(n: number, digits = 0): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}
