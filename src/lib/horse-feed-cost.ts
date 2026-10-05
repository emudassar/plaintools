import { ToolError } from "./errors";

/**
 * Horse feed cost: daily, monthly and yearly.
 *
 * Arithmetic on the owner's own amounts and prices. Hay $/lb = bale price /
 * bale weight; concentrate $/lb = bag price / bag weight. Month = 365.25 / 12
 * days; year = 365 days.
 *
 * Forage guideline (optional estimate of hay per day): Merck Veterinary
 * Manual, "Nutritional Requirements of Horses and Other Equids" (Feb 2026),
 * retrieved 2026-10-05: "horses receive at least 1.5–2% of their body weight
 * (BW) in forage per day on a DM basis". Converting dry matter to hay as fed
 * needs the hay's dry matter % from a hay test, which the user enters.
 */

export const FEED_RETRIEVED = "2026-10-05";
export const MERCK_URL = "https://www.merckvetmanual.com/management-and-nutrition/nutrition-horses/nutritional-requirements-of-horses-and-other-equids";
const DAYS_PER_MONTH = 365.25 / 12;
const KG_PER_LB = 0.45359237;

export interface FeedCostInput {
  horses: number;
  hayLbPerDay: number;
  balePrice: number;
  baleLb: number;
  concLbPerDay: number;
  bagPrice: number | null;
  bagLb: number | null;
  /** Supplements, bedding pellets etc. per horse per month, dollars. */
  otherPerMonth: number;
}

export interface FeedCostResult {
  perHorseDay: number;
  perHorseMonth: number;
  perHorseYear: number;
  totalMonth: number;
  totalYear: number;
  hayPerDay: number;
  concPerDay: number;
  otherPerDay: number;
  balesPerMonth: number;
  bagsPerMonth: number | null;
  retrievedAt: string;
}

function num(label: string, v: number, max: number, allowZero = true) {
  if (!Number.isFinite(v) || v < 0 || (!allowZero && v === 0)) throw new ToolError("bad-input", `${label} must be ${allowZero ? "zero or more" : "more than zero"}.`);
  if (v > max) throw new ToolError("bad-input", `${label} looks too large. Check it.`);
}

export function calculateFeedCost(input: FeedCostInput): FeedCostResult {
  if (!Number.isInteger(input.horses) || input.horses < 1 || input.horses > 1000) throw new ToolError("bad-input", "Number of horses must be a whole number from 1 to 1,000.");
  num("Hay per day", input.hayLbPerDay, 200);
  num("Concentrate per day", input.concLbPerDay, 100);
  num("Other costs per month", input.otherPerMonth, 100000);
  let hayPerDay = 0;
  if (input.hayLbPerDay > 0) {
    num("Bale price", input.balePrice, 10000);
    num("Bale weight", input.baleLb, 3000, false);
    hayPerDay = (input.hayLbPerDay * input.balePrice) / input.baleLb;
  }
  let concPerDay = 0;
  let bagsPerMonth: number | null = null;
  if (input.concLbPerDay > 0) {
    if (input.bagPrice === null || input.bagLb === null) throw new ToolError("bad-input", "Enter the bag price and bag weight for the concentrate.");
    num("Bag price", input.bagPrice, 10000);
    num("Bag weight", input.bagLb, 2000, false);
    concPerDay = (input.concLbPerDay * input.bagPrice) / input.bagLb;
    bagsPerMonth = (input.concLbPerDay * DAYS_PER_MONTH * input.horses) / input.bagLb;
  }
  const otherPerDay = input.otherPerMonth / DAYS_PER_MONTH;
  const perHorseDay = hayPerDay + concPerDay + otherPerDay;
  if (perHorseDay === 0) throw new ToolError("no-data", "Enter at least one feed and its price.");
  return {
    perHorseDay,
    perHorseMonth: perHorseDay * DAYS_PER_MONTH,
    perHorseYear: perHorseDay * 365,
    totalMonth: perHorseDay * DAYS_PER_MONTH * input.horses,
    totalYear: perHorseDay * 365 * input.horses,
    hayPerDay,
    concPerDay,
    otherPerDay,
    balesPerMonth: input.hayLbPerDay > 0 ? (input.hayLbPerDay * DAYS_PER_MONTH * input.horses) / input.baleLb : 0,
    bagsPerMonth,
    retrievedAt: FEED_RETRIEVED,
  };
}

/** Merck's 1.5–2% of body weight in forage dry matter, as dry matter and (optionally) as fed. */
export function forageGuideline(weight: number, unit: "lb" | "kg", hayDmPct: number | null) {
  if (!Number.isFinite(weight) || weight <= 0) throw new ToolError("bad-input", "Enter the horse's weight.");
  const lb = unit === "lb" ? weight : weight / KG_PER_LB;
  if (lb < 100 || lb > 3300) throw new ToolError("bad-input", "That weight is outside 100–3,300 lb. Check the unit.");
  const dm = { low: lb * 0.015, high: lb * 0.02 };
  let asFed: { low: number; high: number } | null = null;
  if (hayDmPct !== null) {
    if (!Number.isFinite(hayDmPct) || hayDmPct < 50 || hayDmPct > 100) throw new ToolError("bad-input", "Hay dry matter should be between 50 and 100%.");
    asFed = { low: dm.low / (hayDmPct / 100), high: dm.high / (hayDmPct / 100) };
  }
  return { dmLow: dm.low, dmHigh: dm.high, asFed };
}
