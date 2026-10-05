import { ToolError } from "./errors";

/**
 * Horse daily digestible energy (DE) requirement.
 *
 * Source: Merck Veterinary Manual, "Nutritional Requirements of Horses and
 * Other Equids" (N. R. Liburt; last updated Feb 2026), citing NRC Nutrient
 * Requirements of Horses, 6th ed. (2007). Retrieved 2026-10-05:
 *  - Maintenance: "on average 0.03 Mcal/kg body weight", "a minimum
 *    requirement of 0.03 Mcal/kg for easy keepers ... and 0.04 Mcal/kg for
 *    hard keepers"; the table row is "0.033 x kg BW".
 *  - Work (table "Estimated Energy Requirements of Work for Light Horses"):
 *    light (0.0333 x kg BW) x 1.2 — 1–3 h/week;
 *    moderate (0.0333 x kg BW) x 1.4 — 3–5 h/week;
 *    heavy (0.0333 x kg BW) x 1.6 — 4–5 h/week;
 *    very heavy (0.0363 x kg BW) x 1.9 — "race training, elite 3-day event".
 *    Table footnote: "200–600 kg body weight" — outside it the result is flagged.
 *
 * 1 Mcal = 1,000 kcal ("Calories" on feed labels are kcal).
 */

export const HORSE_CAL_RETRIEVED = "2026-10-05";
export const MERCK_HORSE_URL = "https://www.merckvetmanual.com/management-and-nutrition/nutrition-horses/nutritional-requirements-of-horses-and-other-equids";

const KG_PER_LB = 0.45359237;

export interface Level {
  id: string;
  label: string;
  perKg: number;
  multiplier: number;
  note: string;
}

export const LEVELS: readonly Level[] = [
  { id: "easy", label: "Maintenance — easy keeper", perKg: 0.03, multiplier: 1, note: "Merck: 0.03 Mcal/kg for easy keepers" },
  { id: "maintenance", label: "Maintenance — average", perKg: 0.0333, multiplier: 1, note: "Merck table: 0.033 × kg BW" },
  { id: "hard", label: "Maintenance — hard keeper", perKg: 0.04, multiplier: 1, note: "Merck: 0.04 Mcal/kg for hard keepers" },
  { id: "light", label: "Light work (1–3 h/week)", perKg: 0.0333, multiplier: 1.2, note: "(0.0333 × kg) × 1.2" },
  { id: "moderate", label: "Moderate work (3–5 h/week)", perKg: 0.0333, multiplier: 1.4, note: "(0.0333 × kg) × 1.4" },
  { id: "heavy", label: "Heavy work (4–5 h/week)", perKg: 0.0333, multiplier: 1.6, note: "(0.0333 × kg) × 1.6" },
  { id: "very-heavy", label: "Very heavy work (race training, elite 3-day event)", perKg: 0.0363, multiplier: 1.9, note: "(0.0363 × kg) × 1.9" },
];

export interface FeedLine {
  /** Pounds of feed per day (as fed). */
  lbPerDay: number;
  /** Energy of that feed, Mcal DE per lb (from a hay test or feed tag). */
  mcalPerLb: number;
}

export interface HorseCalInput {
  weight: number;
  unit: "lb" | "kg";
  levelId: string;
  feeds: readonly FeedLine[];
}

export interface HorseCalResult {
  weightKg: number;
  level: Level;
  mcal: number;
  kcal: number;
  allLevels: { level: Level; mcal: number }[];
  diet: { mcal: number; difference: number; percent: number } | null;
  outsideTableRange: boolean;
  retrievedAt: string;
}

export function calculateHorseCalories(input: HorseCalInput): HorseCalResult {
  if (!Number.isFinite(input.weight) || input.weight <= 0) throw new ToolError("bad-input", "Enter the horse's body weight.");
  const kg = input.unit === "kg" ? input.weight : input.weight * KG_PER_LB;
  if (kg < 50) throw new ToolError("bad-input", "That is under 50 kg (110 lb). The equations are for adult horses; check the unit.");
  if (kg > 1500) throw new ToolError("bad-input", "That is over 1,500 kg (3,300 lb). Check the unit.");
  const level = LEVELS.find((l) => l.id === input.levelId);
  if (!level) throw new ToolError("bad-input", "Pick an activity level.");
  const mcalFor = (l: Level) => l.perKg * kg * l.multiplier;
  const mcal = mcalFor(level);

  let diet: HorseCalResult["diet"] = null;
  const used = input.feeds.filter((f) => f.lbPerDay > 0 || f.mcalPerLb > 0);
  if (used.length) {
    for (const f of used) {
      if (!Number.isFinite(f.lbPerDay) || f.lbPerDay < 0 || f.lbPerDay > 200) throw new ToolError("bad-input", "Pounds of feed per day must be between 0 and 200.");
      if (!Number.isFinite(f.mcalPerLb) || f.mcalPerLb < 0 || f.mcalPerLb > 3) throw new ToolError("bad-input", "Feed energy must be between 0 and 3 Mcal per lb — check it is per pound, not per kg or per ton.");
    }
    const dietMcal = used.reduce((s, f) => s + f.lbPerDay * f.mcalPerLb, 0);
    diet = { mcal: dietMcal, difference: dietMcal - mcal, percent: (dietMcal / mcal) * 100 };
  }
  return {
    weightKg: kg,
    level,
    mcal,
    kcal: mcal * 1000,
    allLevels: LEVELS.map((l) => ({ level: l, mcal: mcalFor(l) })),
    diet,
    outsideTableRange: kg < 200 || kg > 600,
    retrievedAt: HORSE_CAL_RETRIEVED,
  };
}
