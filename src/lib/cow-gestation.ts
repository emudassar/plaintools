import { ToolError } from "./errors";

/**
 * Cow gestation / calving date.
 *
 * Source: Sandy Johnson, extension beef specialist, Kansas State University,
 * "When Is She Due? Understanding Gestation Length in Modern Beef Cattle",
 * K-State Beef Tips, 1 July 2026. Retrieved 2026-10-04 from
 *   https://enewsletters.k-state.edu/beeftips/2026/07/01/when-is-she-due-understanding-gestation-length-in-modern-beef-cattle/
 *
 * Verbatim facts used:
 *  - "Traditional beef-cattle references often cite an average gestation length of 283 days."
 *  - Table 1 (101,787 American Angus AI matings, 2000–2020): gestation length
 *    mean 278.6 d, SD 4.69, minimum 264, maximum 292.
 *  - "approximately two-thirds of gestation periods ranged from 274.2 to 283.3 days."
 *  - Table 2, mean gestation length by age of dam: 2 yr 277.7, 3 yr 278.6,
 *    4 yr 279.0, 5 yr 279.2, 6 yr 279.3, 7 yr 279.5, 8 yr 279.6.
 *  - Study source: Gilleland, C. (2022), MS thesis, North Carolina State University.
 *
 * Dates are computed in UTC on calendar days so DST never shifts a result.
 */

export const GESTATION_RETRIEVED = "2026-10-04";
export const GESTATION_URL =
  "https://enewsletters.k-state.edu/beeftips/2026/07/01/when-is-she-due-understanding-gestation-length-in-modern-beef-cattle/";

export const TRADITIONAL_DAYS = 283;
export const STUDY = { mean: 278.6, sd: 4.69, min: 264, max: 292, n: 101_787, oneSdLow: 274.2, oneSdHigh: 283.3 } as const;

/** Table 2, age of dam (years) -> mean gestation days. */
export const BY_DAM_AGE: Readonly<Record<number, number>> = {
  2: 277.7,
  3: 278.6,
  4: 279.0,
  5: 279.2,
  6: 279.3,
  7: 279.5,
  8: 279.6,
};

export interface GestationInput {
  /** YYYY-MM-DD, breeding or AI date (or first day of bull exposure). */
  bredOn: string;
  /** Optional YYYY-MM-DD, last day of bull exposure. Null for a single AI/breeding date. */
  bredUntil: string | null;
  /** 2..8 (8 = 8 or older), or null when unknown. */
  damAge: number | null;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface GestationResult {
  bredOn: Date;
  bredUntil: Date | null;
  traditional: DateRange;
  studyMeanDays: number;
  studyMeanSource: string;
  studyMean: DateRange;
  likelyWindow: DateRange;
  observedRange: DateRange;
  retrievedAt: string;
}

const DAY_MS = 86_400_000;

export function parseDate(s: string, label: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) throw new ToolError("bad-input", `Enter the ${label} as a full date.`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
    throw new ToolError("bad-input", `The ${label} is not a real calendar date.`);
  }
  if (y < 1900 || y > 2200) throw new ToolError("bad-input", `The ${label} year looks wrong.`);
  return dt;
}

/** Adds a (possibly fractional) number of days and rounds to the nearest calendar day. */
export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + Math.round(days) * DAY_MS);
}

function span(start: Date, end: Date, days: number): DateRange {
  return { from: addDays(start, days), to: addDays(end, days) };
}

export function calculateGestation(input: GestationInput): GestationResult {
  const bredOn = parseDate(input.bredOn, "breeding date");
  const bredUntil = input.bredUntil ? parseDate(input.bredUntil, "end of bull exposure") : null;
  if (bredUntil && bredUntil < bredOn) {
    throw new ToolError("bad-input", "The end of bull exposure is before the breeding start date.");
  }
  if (bredUntil && (bredUntil.getTime() - bredOn.getTime()) / DAY_MS > 365) {
    throw new ToolError("bad-input", "A breeding period longer than a year is outside what this calculator handles.");
  }
  if (input.damAge !== null && !(input.damAge in BY_DAM_AGE)) {
    throw new ToolError("bad-input", "Pick the cow's age from the list.");
  }
  const end = bredUntil ?? bredOn;

  const studyMeanDays = input.damAge === null ? STUDY.mean : BY_DAM_AGE[input.damAge];
  const studyMeanSource =
    input.damAge === null
      ? "study mean, all ages"
      : `study mean for ${input.damAge === 8 ? "8-year-old" : `${input.damAge}-year-old`} dams`;

  return {
    bredOn,
    bredUntil,
    traditional: span(bredOn, end, TRADITIONAL_DAYS),
    studyMeanDays,
    studyMeanSource,
    studyMean: span(bredOn, end, studyMeanDays),
    likelyWindow: { from: addDays(bredOn, STUDY.oneSdLow), to: addDays(end, STUDY.oneSdHigh) },
    observedRange: { from: addDays(bredOn, STUDY.min), to: addDays(end, STUDY.max) },
    retrievedAt: GESTATION_RETRIEVED,
  };
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export function formatRange(r: DateRange): string {
  return r.from.getTime() === r.to.getTime() ? formatDate(r.from) : `${formatDate(r.from)} – ${formatDate(r.to)}`;
}
