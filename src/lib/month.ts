import { ToolError } from "./errors";

/**
 * Month-precision dates, for tools whose source works in "month and year"
 * (cylinder stamps, test labels). No day, no time zone, no Date objects.
 */

/** `month` is 1–12. */
export interface MonthYear {
  month: number;
  year: number;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export function formatMonthYear(d: MonthYear): string {
  return `${MONTH_NAMES[d.month - 1]} ${d.year}`;
}

export function monthIndex(d: MonthYear): number {
  return d.year * 12 + (d.month - 1);
}

export function addYears(d: MonthYear, years: number): MonthYear {
  return { month: d.month, year: d.year + years };
}

export function laterOf(a: MonthYear, b: MonthYear): MonthYear {
  return monthIndex(a) >= monthIndex(b) ? a : b;
}

export type DueStatus = "ok" | "due-this-month" | "overdue";

/** Whole months from `today` to `due` (negative when past) and the status that implies. */
export function dueStatus(due: MonthYear, today: MonthYear): { monthsRemaining: number; status: DueStatus } {
  const monthsRemaining = monthIndex(due) - monthIndex(today);
  const status: DueStatus =
    monthsRemaining < 0 ? "overdue" : monthsRemaining === 0 ? "due-this-month" : "ok";
  return { monthsRemaining, status };
}

/** Throws a bad-input ToolError naming `what` for an invalid or future month/year. */
export function validateMonthYear(d: MonthYear, what: string, today: MonthYear): void {
  if (!Number.isInteger(d.month) || d.month < 1 || d.month > 12) {
    throw new ToolError("bad-input", `Pick the month of the ${what}.`);
  }
  if (!Number.isInteger(d.year)) {
    throw new ToolError("bad-input", `Enter the ${what} year as four digits, for example 2019.`);
  }
  if (d.year < 1900) {
    throw new ToolError(
      "bad-input",
      `The ${what} year must be four digits. A two-digit "19" means 2019 and "98" means 1998.`,
    );
  }
  if (monthIndex(d) > monthIndex(today)) {
    throw new ToolError("bad-input", `The ${what} is in the future. Check the date again.`);
  }
}

/** "3 years 4 months", "1 month", "0 months". */
export function formatMonths(total: number): string {
  const n = Math.abs(total);
  const y = Math.floor(n / 12);
  const m = n % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} ${y === 1 ? "year" : "years"}`);
  if (m || !y) parts.push(`${m} ${m === 1 ? "month" : "months"}`);
  return parts.join(" ");
}

/** The visitor's current month, from their clock. Components only; lib code takes `today` as input. */
export function currentMonth(): MonthYear {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}
