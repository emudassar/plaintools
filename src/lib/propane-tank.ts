import { ToolError } from "./errors";
import {
  addYears,
  dueStatus,
  monthIndex,
  validateMonthYear,
  type DueStatus,
  type MonthYear,
} from "./month";

export { formatMonthYear, formatMonths, type MonthYear } from "./month";

/**
 * When a portable propane cylinder next needs requalifying, from
 * 49 CFR 180.209 (requalification periods) and 49 CFR 180.213 (the marks a
 * requalifier stamps on the cylinder). Text read from eCFR, current as of
 * 2026-10-01 (the 2026-08-04 amendment, 91 FR 49357, changed only the DOT 3A/3AA
 * bundle rules in paragraph (b), not the paragraphs used here):
 *   https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-180/subpart-C/section-180.209
 *   https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-180/subpart-C/section-180.213
 *
 * The rules used, each read from the regulation text:
 *
 * - 180.209(e): a DOT 4B, 4BA, 4BW or 4E cylinder with a corrosion-resistant
 *   coating, used only for non-corrosive gas, "may be requalified by volumetric
 *   expansion testing every 12 years instead of every 5 years". The proof
 *   pressure alternative "must be repeated every 10 years after expiration of
 *   the initial 12-year period".
 * - 180.209(g) + Table 2: for liquefied petroleum gas, an external visual
 *   inspection may replace the hydrostatic test; "subsequent inspections are
 *   required at five-year intervals after the first inspection."
 * - 180.213(f)(1), (f)(4), (f)(5): the 12-year volumetric expansion test is
 *   marked with the date and RIN alone; a proof pressure test adds "S"; the
 *   5-year external visual inspection adds "E".
 *
 * Note: the "12 years, then every 7" wording in 180.209 is paragraph (j), which
 * applies to cylinders used as fire extinguishers. It is not used here.
 *
 * This module makes NO network request. It reports the date the cited rule
 * gives for the marks entered. It does not say whether a cylinder is safe.
 */

export const SOURCE_RETRIEVED = "2026-10-04";
export const REGULATION_CURRENT_AS_OF = "2026-10-01";

/** Years from the original (manufacture) test date to the first requalification, 180.209(e). */
export const INITIAL_PERIOD_YEARS = 12;
/** Table 1 base period for 4B/4BA/4BW/4E when 180.209(e)'s conditions are not met. */
export const BASE_PERIOD_YEARS = 5;

export type RequalMark = "none" | "plain" | "S" | "E";

export interface MarkRule {
  mark: Exclude<RequalMark, "none">;
  label: string;
  method: string;
  years: number;
  section: string;
}

export const MARK_RULES: readonly MarkRule[] = [
  {
    mark: "plain",
    label: "Date and RIN only, no letter",
    method: "volumetric expansion (hydrostatic) test",
    years: 12,
    section: "§180.209(e), marked per §180.213(f)(1)",
  },
  {
    mark: "S",
    label: "Date, RIN and the letter S",
    method: "proof pressure test",
    years: 10,
    section: "§180.209(e), marked per §180.213(f)(4)",
  },
  {
    mark: "E",
    label: "Date, RIN and the letter E",
    method: "external visual inspection",
    years: 5,
    section: "§180.209(g), marked per §180.213(f)(5)",
  },
] as const;

export interface PropaneInput {
  /** The original test (manufacture) date stamped on the collar. */
  manufactured: MonthYear;
  /** The most recent requalification mark, or "none" if there is only the manufacture date. */
  lastMark: RequalMark;
  /** Required when lastMark is not "none". */
  requalified: MonthYear | null;
  /** Today's month, passed in so the logic stays testable. */
  today: MonthYear;
}

export interface PropaneResult {
  /** The month and year by the end of which the next requalification is due. */
  due: MonthYear;
  /** The date the period is counted from. */
  countedFrom: MonthYear;
  /** Which basis was used. */
  basis: "initial" | MarkRule["mark"];
  periodYears: number;
  method: string;
  section: string;
  status: DueStatus;
  /** Whole months from today's month to the due month. Negative when overdue. */
  monthsRemaining: number;
  /** The Table 1 five-year date, shown for cylinders that do not meet 180.209(e). */
  baseDueIfNotQualified: MonthYear | null;
  retrievedAt: string;
}

export function checkPropaneCylinder(input: PropaneInput): PropaneResult {
  validateMonthYear(input.manufactured, "manufacture date", input.today);

  let countedFrom: MonthYear;
  let basis: PropaneResult["basis"];
  let periodYears: number;
  let method: string;
  let section: string;

  if (input.lastMark === "none") {
    countedFrom = input.manufactured;
    basis = "initial";
    periodYears = INITIAL_PERIOD_YEARS;
    method = "first requalification after manufacture";
    section = "§180.209(e)";
  } else {
    const rule = MARK_RULES.find((r) => r.mark === input.lastMark);
    if (!rule) throw new ToolError("bad-input", "Pick which mark is on the cylinder.");
    if (!input.requalified) {
      throw new ToolError("bad-input", "Enter the month and year of the requalification mark.");
    }
    validateMonthYear(input.requalified, "requalification date", input.today);
    if (monthIndex(input.requalified) < monthIndex(input.manufactured)) {
      throw new ToolError(
        "bad-input",
        "The requalification date is earlier than the manufacture date. The manufacture date is the first date stamped at the time the cylinder was made; check which date is which.",
      );
    }
    countedFrom = input.requalified;
    basis = rule.mark;
    periodYears = rule.years;
    method = rule.method;
    section = rule.section;
  }

  const due = addYears(countedFrom, periodYears);
  const { monthsRemaining, status } = dueStatus(due, input.today);

  return {
    due,
    countedFrom,
    basis,
    periodYears,
    method,
    section,
    status,
    monthsRemaining,
    baseDueIfNotQualified:
      input.lastMark === "none" ? addYears(input.manufactured, BASE_PERIOD_YEARS) : null,
    retrievedAt: SOURCE_RETRIEVED,
  };
}
