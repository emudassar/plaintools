import { ToolError } from "./errors";
import { addDays, parseDate, type DateRange } from "./calendar-days";

export { formatDate, formatRange } from "./calendar-days";

/**
 * Horse (mare) gestation / foaling date.
 *
 * University of Nebraska–Lincoln Extension NebGuide G1874, "The Foaling Mare"
 * (Kathleen P. Anderson, Extension Horse Specialist; issued July 2008),
 * retrieved 2026-10-17:
 *  - "The average gestation length (duration of pregnancy) of mares is 335 to
 *     340 days, but can range from 320 to 370 days."
 *  - foals are considered "premature if delivered at less than 326 days of
 *    gestation"
 *  - breeders often "calculate the expected foaling date at 11 months following
 *    the last breeding date. Most mares will gestate longer than 11 months."
 * Merck Veterinary Manual table "Approximate Gestation Periods": Horse "11
 * months" (consistent).
 *
 * Dates count from the LAST breeding (or ovulation) date when a first and last
 * date are given, as UNL's 11-month rule does; the window's early edge uses
 * the first date.
 */

export const UNL_G1874_URL = "https://extensionpubs.unl.edu/publication/g1874/na/pdf/view";
export const MERCK_TABLE_URL = "https://www.merckvetmanual.com/multimedia/table/approximate-gestation-periods";
export const HORSE_RETRIEVED = "2026-10-17";

export const RANGE = { low: 320, high: 370 } as const;
export const AVERAGE = { low: 335, high: 340 } as const;
export const PREMATURE_BEFORE = 326;

export interface HorseInput {
  /** YYYY-MM-DD, first (or only) breeding date. */
  firstBred: string;
  /** YYYY-MM-DD or null, last breeding date. */
  lastBred: string | null;
}

export interface HorseResult {
  first: Date;
  last: Date;
  average: DateRange;
  normal: DateRange;
  prematureBefore: Date;
  elevenMonths: Date;
  coverDays: number;
}

export function horseGestation(i: HorseInput): HorseResult {
  const first = parseDate(i.firstBred, "breeding date");
  const last = i.lastBred ? parseDate(i.lastBred, "last breeding date") : first;
  if (last < first) throw new ToolError("bad-input", "The last breeding date is before the first.");
  const coverDays = Math.round((last.getTime() - first.getTime()) / 86_400_000);
  if (coverDays > 120) throw new ToolError("bad-input", "Breeding dates more than 120 days apart look like two different seasons. Enter the dates for this pregnancy.");
  // 11 calendar months after the last breeding, clamped to the month's last day.
  const y = last.getUTCFullYear();
  const m = last.getUTCMonth() + 11;
  const d = last.getUTCDate();
  const lastDayOfTarget = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const elevenMonths = new Date(Date.UTC(y, m, Math.min(d, lastDayOfTarget)));
  return {
    first,
    last,
    average: { from: addDays(first, AVERAGE.low), to: addDays(last, AVERAGE.high) },
    normal: { from: addDays(first, RANGE.low), to: addDays(last, RANGE.high) },
    prematureBefore: addDays(last, PREMATURE_BEFORE),
    elevenMonths,
    coverDays,
  };
}

/** Whole days from the last breeding to `today` (both UTC midnights). */
export function daysPregnant(last: Date, today: Date): number {
  return Math.floor((today.getTime() - last.getTime()) / 86_400_000);
}
