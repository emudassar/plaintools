import { ToolError } from "./errors";

/**
 * Paid time off accrual.
 *
 * Arithmetic only. There is no federal accrual rule to apply: the U.S.
 * Department of Labor's "Vacation Leave" page states "The Fair Labor Standards
 * Act (FLSA) does not require payment for time not worked, such as vacations"
 * and that such benefits "are matters of agreement between an employer and an
 * employee". The policy figures are therefore the user's own.
 *
 * Two policy shapes:
 *  - annual: H hours a year spread evenly over P pay periods -> H / P per period
 *  - hourly: 1 hour earned per N hours worked -> hours worked / N
 * Balance projection: start balance + periods × per-period accrual − hours
 * taken, capped at the policy cap if one is entered.
 */

export const DOL_URL = "https://www.dol.gov/general/topic/workhours/vacation_leave";
export const PTO_RETRIEVED = "2026-10-17";

export const PAY_PERIODS = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
} as const;
export type PayFrequency = keyof typeof PAY_PERIODS;

export interface PtoInput {
  mode: "annual" | "hourly";
  /** annual: hours per year. */
  annualHours: number;
  /** hourly: hours worked per 1 hour earned (e.g. 30). */
  workedPerHour: number;
  /** Hours worked per week (used to convert both ways). */
  hoursPerWeek: number;
  frequency: PayFrequency;
  startBalance: number;
  /** Pay periods to project forward. */
  periods: number;
  /** Hours used during the projection. */
  hoursTaken: number;
  cap: number | null;
  /** Hours in one workday, to express hours as days. */
  dayLength: number;
}

export interface PtoResult {
  perPeriod: number;
  perHourWorked: number;
  perYear: number;
  perYearDays: number;
  /** Balance at the end of each projected period (after cap). */
  schedule: { period: number; balance: number; capped: boolean }[];
  endBalance: number;
  endBalanceDays: number;
  /** First period where the cap stopped accrual, or null. */
  capHitAt: number | null;
}

export function ptoAccrual(i: PtoInput): PtoResult {
  const periodsPerYear = PAY_PERIODS[i.frequency];
  if (!periodsPerYear) throw new ToolError("bad-input", "Pick a pay frequency.");
  if (!Number.isFinite(i.hoursPerWeek) || i.hoursPerWeek <= 0 || i.hoursPerWeek > 100)
    throw new ToolError("bad-input", "Hours worked per week should be between 0 and 100.");
  if (!Number.isFinite(i.dayLength) || i.dayLength <= 0 || i.dayLength > 24) throw new ToolError("bad-input", "Hours in a workday should be between 0 and 24.");
  let perYear: number;
  if (i.mode === "annual") {
    if (!Number.isFinite(i.annualHours) || i.annualHours < 0 || i.annualHours > 2000)
      throw new ToolError("bad-input", "Enter the yearly PTO in hours (for example 80 for two 40-hour weeks).");
    perYear = i.annualHours;
  } else {
    if (!Number.isFinite(i.workedPerHour) || i.workedPerHour < 1 || i.workedPerHour > 1000)
      throw new ToolError("bad-input", "Enter how many hours worked earn one hour of PTO (for example 30).");
    perYear = (i.hoursPerWeek * 52) / i.workedPerHour;
  }
  const perPeriod = perYear / periodsPerYear;
  const perHourWorked = perYear / (i.hoursPerWeek * 52);

  if (!Number.isFinite(i.startBalance) || i.startBalance < 0) throw new ToolError("bad-input", "Starting balance should be zero or more.");
  if (!Number.isInteger(i.periods) || i.periods < 1 || i.periods > 260) throw new ToolError("bad-input", "Pay periods to project should be a whole number from 1 to 260.");
  if (!Number.isFinite(i.hoursTaken) || i.hoursTaken < 0) throw new ToolError("bad-input", "Hours taken should be zero or more.");
  if (i.cap !== null && (!Number.isFinite(i.cap) || i.cap <= 0)) throw new ToolError("bad-input", "Enter the cap in hours, or leave it blank.");

  // Hours taken are spread evenly over the projection.
  const takenPer = i.hoursTaken / i.periods;
  let bal = i.startBalance;
  let capHitAt: number | null = null;
  const schedule: PtoResult["schedule"] = [];
  for (let p = 1; p <= i.periods; p++) {
    bal += perPeriod;
    let capped = false;
    if (i.cap !== null && bal > i.cap) {
      bal = i.cap;
      capped = true;
      if (capHitAt === null) capHitAt = p;
    }
    bal -= takenPer;
    schedule.push({ period: p, balance: bal, capped });
  }
  if (bal < -1e-9) throw new ToolError("bad-input", "The hours taken are more than the balance plus what accrues in that time.");
  return {
    perPeriod,
    perHourWorked,
    perYear,
    perYearDays: perYear / i.dayLength,
    schedule,
    endBalance: Math.max(0, bal),
    endBalanceDays: Math.max(0, bal) / i.dayLength,
    capHitAt,
  };
}
