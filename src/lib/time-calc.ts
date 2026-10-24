import { ToolError } from "./errors";
import { fmt12, fmt24, parseClock } from "./date-calc";

/**
 * Clock arithmetic for the military-time, hours-worked and sleep tools.
 *
 * Military time: the 24-hour clock written without a colon (0000-2359); midnight starts the day at 0000.
 * Hours worked: each shift = end - start (an end earlier than the start is an overnight shift) - unpaid break.
 *   Overtime = hours over the weekly threshold, paid at the multiplier (FLSA: over 40 hours in a workweek,
 *   at least 1.5x the regular rate - U.S. DOL Fact Sheet #23). Thresholds are inputs; state daily rules differ.
 * Sleep: cycles of about 90 minutes (NINDS, "Brain Basics: Understanding Sleep": REM first occurs about
 *   90 minutes after falling asleep) plus the user's own minutes to fall asleep. CDC lists 7 or more hours
 *   for adults 18-60.
 */

export const DOL_OT_URL = "https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime";
export const NINDS_SLEEP_URL = "https://www.ninds.nih.gov/health-information/public-education/brain-basics/brain-basics-understanding-sleep";
export const CDC_SLEEP_URL = "https://www.cdc.gov/sleep/about/index.html";

export interface MilitaryResult {
  minutes: number;
  military: string;
  withColon: string;
  twelve: string;
  spoken: string;
}

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty"];
const word = (n: number) => (n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? "-" + ONES[n % 10] : ""}`);

/** Spoken form, e.g. 0800 "zero eight hundred", 1430 "fourteen thirty", 0005 "zero zero zero five". */
export function spokenMilitary(min: number): string {
  const h = Math.floor(min / 60), m = min % 60;
  const hh = h < 10 ? `zero ${ONES[h]}` : word(h);
  if (m === 0) return `${h === 0 ? "zero zero" : hh} hundred`;
  const mm = m < 10 ? `zero ${ONES[m]}` : word(m);
  return `${h === 0 ? "zero zero" : hh} ${mm}`;
}

export function toMilitary(input: string): MilitaryResult {
  const s = input.trim();
  if (!s) throw new ToolError("bad-input", "Enter a time.");
  // Four bare digits read as military time.
  const bare = /^(\d{2})(\d{2})$/.exec(s);
  let minutes: number;
  if (bare) {
    const h = Number(bare[1]), m = Number(bare[2]);
    if (h > 24 || m > 59 || (h === 24 && m > 0)) throw new ToolError("bad-input", "Military time runs from 0000 to 2359.");
    minutes = (h % 24) * 60 + m;
  } else minutes = parseClock(s);
  return { minutes, military: fmt24(minutes).replace(":", ""), withColon: fmt24(minutes), twelve: fmt12(minutes), spoken: spokenMilitary(minutes) };
}

export interface Shift {
  start: string;
  end: string;
  breakMin: number;
}

export interface ShiftResult {
  minutes: number;
  overnight: boolean;
}

export interface HoursWorkedResult {
  shifts: (ShiftResult | null)[];
  totalMinutes: number;
  regularHours: number;
  overtimeHours: number;
  pay: { regular: number; overtime: number; total: number } | null;
}

export function shiftMinutes(s: Shift): ShiftResult | null {
  if (!s.start.trim() && !s.end.trim()) return null;
  const a = parseClock(s.start);
  const b = parseClock(s.end);
  const overnight = b <= a;
  const span = overnight ? b + 1440 - a : b - a;
  if (!Number.isFinite(s.breakMin) || s.breakMin < 0) throw new ToolError("bad-input", "Enter the break in minutes, or 0.");
  if (s.breakMin >= span) throw new ToolError("bad-input", "A break is as long as the whole shift. Check the times.");
  return { minutes: span - s.breakMin, overnight };
}

export function hoursWorked(shifts: Shift[], otThreshold: number, rate: number | null, otMultiplier: number): HoursWorkedResult {
  if (!Number.isFinite(otThreshold) || otThreshold < 0) throw new ToolError("bad-input", "Enter the weekly overtime threshold in hours (40 under the FLSA).");
  if (!Number.isFinite(otMultiplier) || otMultiplier < 1) throw new ToolError("bad-input", "The overtime multiplier should be 1 or more (1.5 under the FLSA).");
  const res = shifts.map(shiftMinutes);
  const totalMinutes = res.reduce((t, r) => t + (r ? r.minutes : 0), 0);
  if (totalMinutes === 0) throw new ToolError("bad-input", "Enter a start and end time for at least one day.");
  const hours = totalMinutes / 60;
  const regularHours = Math.min(hours, otThreshold);
  const overtimeHours = Math.max(0, hours - otThreshold);
  let pay: HoursWorkedResult["pay"] = null;
  if (rate !== null) {
    if (!Number.isFinite(rate) || rate < 0) throw new ToolError("bad-input", "Enter the hourly rate as a positive number, or leave it blank.");
    const regular = regularHours * rate, overtime = overtimeHours * rate * otMultiplier;
    pay = { regular, overtime, total: regular + overtime };
  }
  return { shifts: res, totalMinutes, regularHours, overtimeHours, pay };
}

/** 7.5 -> "7 h 30 min"; also decimal. */
export const hm = (minutes: number) => `${Math.floor(minutes / 60)} h ${String(Math.round(minutes % 60)).padStart(2, "0")} min`;

export interface SleepOption {
  cycles: number;
  minutes: number;
  /** Minutes after midnight, mod 1440. */
  clock: number;
}

/** mode "wake": user knows the wake time -> bedtimes. mode "bed": user goes to bed at time -> wake times. */
export function sleepTimes(mode: "wake" | "bed", time: string, fallAsleepMin: number, cycleMin: number): SleepOption[] {
  const t = parseClock(time);
  if (!Number.isFinite(fallAsleepMin) || fallAsleepMin < 0 || fallAsleepMin > 120) throw new ToolError("bad-input", "Minutes to fall asleep should be between 0 and 120.");
  if (!Number.isFinite(cycleMin) || cycleMin < 60 || cycleMin > 120) throw new ToolError("bad-input", "Cycle length should be between 60 and 120 minutes.");
  const out: SleepOption[] = [];
  for (const cycles of [6, 5, 4, 3]) {
    const sleep = cycles * cycleMin;
    const clock = mode === "wake" ? (((t - sleep - fallAsleepMin) % 1440) + 1440) % 1440 : (t + fallAsleepMin + sleep) % 1440;
    out.push({ cycles, minutes: sleep, clock });
  }
  return out;
}
