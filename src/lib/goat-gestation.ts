import { ToolError } from "./errors";
import { addDays, parseDate, type DateRange } from "./calendar-days";

export { formatDate, formatRange } from "./calendar-days";

/**
 * Goat gestation / kidding date.
 *
 * Sources, retrieved 2026-10-16:
 *  - Merck Veterinary Manual, Jamie Lynn Stewart (Virginia-Maryland College of
 *    Veterinary Medicine), "Pregnancy in Goats", full review June 2026:
 *      "Gestation length in goats is 145–155 days (average 150 days) and can be
 *       affected by breed, litter weight, environment, and parity."
 *    https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-goats/pregnancy-in-goats
 *  - Merck Veterinary Manual table "Approximate Gestation Periods": Goat 150 (days).
 *    https://www.merckvetmanual.com/multimedia/table/approximate-gestation-periods
 */

export const GOAT_RETRIEVED = "2026-10-16";
export const MERCK_GOAT_URL =
  "https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-goats/pregnancy-in-goats";
export const MERCK_TABLE_URL =
  "https://www.merckvetmanual.com/multimedia/table/approximate-gestation-periods";

export const NORMAL = { low: 145, high: 155 } as const;
export const AVERAGE = 150;

export const QUOTE =
  "Gestation length in goats is 145–155 days (average 150 days) and can be affected by breed, litter weight, environment, and parity.";

export interface GoatInput {
  /** YYYY-MM-DD: hand-mating/AI date, or buck turned in. */
  bredOn: string;
  /** YYYY-MM-DD or null: buck removed. */
  bredUntil: string | null;
}

export interface GoatResult {
  bredOn: Date;
  bredUntil: Date | null;
  exposureDays: number | null;
  normalWindow: DateRange;
  average: DateRange;
  /** Day 150 counted back: the date a doe bred on `bredOn` reaches each month of pregnancy. */
  milestones: { label: string; day: number; date: Date }[];
  retrievedAt: string;
}

export function calculateGoatGestation(input: GoatInput): GoatResult {
  const bredOn = parseDate(input.bredOn, "breeding date");
  const bredUntil =
    input.bredUntil !== null ? parseDate(input.bredUntil, "buck-out date") : null;
  if (bredUntil && bredUntil < bredOn)
    throw new ToolError("bad-input", "The end date is before the start date.");
  const exposureDays = bredUntil
    ? Math.round((bredUntil.getTime() - bredOn.getTime()) / 86_400_000)
    : null;
  if (exposureDays !== null && exposureDays > 365) {
    throw new ToolError(
      "bad-input",
      "A breeding period longer than a year is outside what this calculator handles.",
    );
  }
  const end = bredUntil ?? bredOn;
  const milestones = [30, 60, 90, 120, 145].map((day) => ({
    label: day === 145 ? "Start of the 145–155-day window" : `Day ${day}`,
    day,
    date: addDays(bredOn, day),
  }));
  return {
    bredOn,
    bredUntil,
    exposureDays,
    normalWindow: { from: addDays(bredOn, NORMAL.low), to: addDays(end, NORMAL.high) },
    average: { from: addDays(bredOn, AVERAGE), to: addDays(end, AVERAGE) },
    milestones,
    retrievedAt: GOAT_RETRIEVED,
  };
}
