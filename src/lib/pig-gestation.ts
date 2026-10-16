import { addDays, parseDate, type DateRange } from "./calendar-days";

export { formatDate, formatRange } from "./calendar-days";

/**
 * Pig (sow / gilt) gestation and farrowing date.
 *
 * Sources, retrieved 2026-10-16:
 *  - Merck Veterinary Manual table "Approximate Gestation Periods": Pig 114 (days).
 *    https://www.merckvetmanual.com/multimedia/table/approximate-gestation-periods
 *  - Pork Industry Handbook, "Calculating Swine Schedules" (D. D. Jones et al.),
 *    Michigan State University Extension Bulletin E-2139, May 1988 (MSU archive copy):
 *      "The rule of thumb for swine gestation periods is 3 months, 3 weeks and 3 days.
 *       For our purposes, we will use a range of 113-116 days."
 *    https://archive.lib.msu.edu/DMC/extension_publications/e2139/e2139_88.pdf
 *    The archive marks it "do not use for current recommendations"; it is cited
 *    here only for the day range, which the page labels with its date.
 */

export const PIG_RETRIEVED = "2026-10-16";
export const MERCK_TABLE_URL =
  "https://www.merckvetmanual.com/multimedia/table/approximate-gestation-periods";
export const PIH_URL =
  "https://archive.lib.msu.edu/DMC/extension_publications/e2139/e2139_88.pdf";

export const TABLE_DAYS = 114;
export const RANGE = { low: 113, high: 116 } as const;

export const PIH_QUOTE =
  "The rule of thumb for swine gestation periods is 3 months, 3 weeks and 3 days. For our purposes, we will use a range of 113-116 days.";

export interface PigInput {
  /** YYYY-MM-DD: breeding or (last) insemination date. */
  bredOn: string;
}

export interface PigResult {
  bredOn: Date;
  farrowing: Date;
  window: DateRange;
  /** Day-by-day chart points counted from the breeding date. */
  chart: { day: number; date: Date; note: string }[];
  retrievedAt: string;
}

export function calculatePigGestation(input: PigInput): PigResult {
  const bredOn = parseDate(input.bredOn, "breeding date");
  const chart = [
    { day: 21, note: "21 days after breeding" },
    { day: 42, note: "42 days (6 weeks)" },
    { day: 57, note: "Halfway (57 of 114 days)" },
    { day: 84, note: "84 days (12 weeks)" },
    { day: 113, note: "Window opens (113 days)" },
    { day: 114, note: "114 days — Merck table figure" },
    { day: 116, note: "Window closes (116 days)" },
  ].map((c) => ({ ...c, date: addDays(bredOn, c.day) }));
  return {
    bredOn,
    farrowing: addDays(bredOn, TABLE_DAYS),
    window: { from: addDays(bredOn, RANGE.low), to: addDays(bredOn, RANGE.high) },
    chart,
    retrievedAt: PIG_RETRIEVED,
  };
}
