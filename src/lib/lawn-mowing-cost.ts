import { ToolError } from "./errors";

/**
 * Lawn mowing price from time and costs.
 *
 * Time: effective field capacity (acres/hour) = deck width (ft) × speed (mph)
 * × field efficiency ÷ 8.25, where 8.25 = 43,560 ft² per acre ÷ 5,280 ft per
 * mile. Theoretical capacity is "equipment swath width times field travel
 * speed"; field efficiency is "actual amount of useful work performed versus
 * the amount of work theoretically possible" — Mark Hanna, Iowa State
 * University, Progressive Forage / agproud.com, Apr 30, 2020.
 *
 * Price = (mowing hours + extra hours for trimming/edging/blowing + travel) ×
 * labour rate + fuel + other per-visit costs, then markup. All rates are the
 * user's own.
 */

export const HANNA_URL = "https://agproud.com/articles/46612-farm-field-equipment-efficiency-versus-capacity";
export const MOW_RETRIEVED = "2026-10-17";

export interface MowInput {
  areaSqFt: number;
  /** Deck width, inches. */
  deckIn: number;
  speedMph: number;
  efficiencyPct: number;
  /** Extra on-site minutes (trimming, edging, blowing). */
  extraMin: number;
  travelMin: number;
  hourlyRate: number;
  fuelPerVisit: number;
  otherPerVisit: number;
  markupPct: number;
  visitsPerMonth: number;
}

export interface MowResult {
  acres: number;
  acresPerHour: number;
  mowMinutes: number;
  totalMinutes: number;
  labour: number;
  cost: number;
  price: number;
  perMonth: number;
  per1000SqFt: number;
}

export function mowingCost(i: MowInput): MowResult {
  if (!Number.isFinite(i.areaSqFt) || i.areaSqFt <= 0 || i.areaSqFt > 43_560 * 500) throw new ToolError("bad-input", "Enter the lawn area in square feet.");
  if (!Number.isFinite(i.deckIn) || i.deckIn <= 0 || i.deckIn > 240) throw new ToolError("bad-input", "Enter the mower deck width in inches (for example 21 or 54).");
  if (!Number.isFinite(i.speedMph) || i.speedMph <= 0 || i.speedMph > 20) throw new ToolError("bad-input", "Enter a mowing speed in mph (for example 3 for a walk-behind).");
  if (!Number.isFinite(i.efficiencyPct) || i.efficiencyPct <= 0 || i.efficiencyPct > 100) throw new ToolError("bad-input", "Efficiency should be between 1 and 100 percent.");
  for (const [v, n] of [
    [i.extraMin, "Extra minutes"],
    [i.travelMin, "Travel minutes"],
    [i.hourlyRate, "Hourly rate"],
    [i.fuelPerVisit, "Fuel"],
    [i.otherPerVisit, "Other costs"],
    [i.markupPct, "Markup"],
  ] as const)
    if (!Number.isFinite(v) || v < 0) throw new ToolError("bad-input", `${n} should be zero or more.`);
  if (!Number.isFinite(i.visitsPerMonth) || i.visitsPerMonth < 0 || i.visitsPerMonth > 31) throw new ToolError("bad-input", "Visits per month should be between 0 and 31.");
  const acres = i.areaSqFt / 43_560;
  const acresPerHour = ((i.deckIn / 12) * i.speedMph * (i.efficiencyPct / 100)) / 8.25;
  const mowMinutes = (acres / acresPerHour) * 60;
  const totalMinutes = mowMinutes + i.extraMin + i.travelMin;
  const labour = (totalMinutes / 60) * i.hourlyRate;
  const cost = labour + i.fuelPerVisit + i.otherPerVisit;
  const price = cost * (1 + i.markupPct / 100);
  return { acres, acresPerHour, mowMinutes, totalMinutes, labour, cost, price, perMonth: price * i.visitsPerMonth, per1000SqFt: (price / i.areaSqFt) * 1000 };
}
