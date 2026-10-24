import { ToolError } from "./errors";
import { parseDate } from "./calendar-days";

/**
 * Calendar arithmetic shared by the date tools (days between two dates, chronological age, holiday
 * countdowns). Whole calendar days in UTC, so daylight-saving changes never move a result.
 *
 * Years-months-days uses the calendar method: count whole years, then whole months, then the days
 * left; when the day of month runs short, borrow the length of the month before the end date.
 * Holiday rules: 5 U.S.C. 6103 (federal holidays, as listed by OPM); Easter by the Anonymous
 * Gregorian algorithm (Meeus/Jones/Butcher) as given on Wikipedia's "Date of Easter".
 */

export const OPM_HOLIDAYS_URL = "https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/";
export const EASTER_URL = "https://en.wikipedia.org/wiki/Date_of_Easter";

const DAY = 86_400_000;

export const dayNumber = (d: Date) => Math.round(d.getTime() / DAY);
export const fromDayNumber = (n: number) => new Date(n * DAY);
export const utcDate = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
export const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

export interface Ymd {
  years: number;
  months: number;
  days: number;
}

/** `d` plus whole months, clamped to the last day of a shorter month (Jan 31 + 1 month = Feb 28/29). */
export function addMonths(d: Date, months: number): Date {
  const total = d.getUTCFullYear() * 12 + d.getUTCMonth() + months;
  const y = Math.floor(total / 12), m = (total % 12) + 1;
  return utcDate(y, m, Math.min(d.getUTCDate(), daysInMonth(y, m)));
}

/** Calendar difference from `a` to `b` (a <= b): the most whole months that still land on or before `b`, then days. */
export function ymdBetween(a: Date, b: Date): Ymd {
  let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
  if (addMonths(a, months) > b) months -= 1;
  const days = dayNumber(b) - dayNumber(addMonths(a, months));
  return { years: Math.floor(months / 12), months: months % 12, days };
}

/** Monday-Friday days in the half-open range [a, b). */
export function weekdaysBetween(a: number, b: number): number {
  let n = 0;
  for (let d = a; d < b; d++) {
    const w = fromDayNumber(d).getUTCDay();
    if (w !== 0 && w !== 6) n++;
  }
  return n;
}

export interface DaysBetweenResult {
  start: Date;
  end: Date;
  swapped: boolean;
  days: number;
  weeks: number;
  remDays: number;
  ymd: Ymd;
  weekdays: number;
  weekendDays: number;
  hours: number;
}

export function daysBetween(startIso: string, endIso: string, includeEnd: boolean): DaysBetweenResult {
  let a = parseDate(startIso, "start date");
  let b = parseDate(endIso, "end date");
  const swapped = b < a;
  if (swapped) [a, b] = [b, a];
  const da = dayNumber(a);
  const db = dayNumber(b) + (includeEnd ? 1 : 0);
  const days = db - da;
  const weekdays = weekdaysBetween(da, db);
  return {
    start: a,
    end: b,
    swapped,
    days,
    weeks: Math.floor(days / 7),
    remDays: days % 7,
    ymd: ymdBetween(a, fromDayNumber(db)),
    weekdays,
    weekendDays: days - weekdays,
    hours: days * 24,
  };
}

export interface AgeResult {
  birth: Date;
  on: Date;
  ymd: Ymd;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  /** Decimal years to 2 dp (days / 365.2425). */
  decimalYears: number;
  nextBirthday: Date;
  daysToNextBirthday: number;
  birthWeekday: string;
}

/** Birthday in a given year; 29 Feb falls on 28 Feb in common years (a common legal convention, flagged on the page). */
export function birthdayIn(birth: Date, year: number): Date {
  const m = birth.getUTCMonth() + 1;
  const d = Math.min(birth.getUTCDate(), daysInMonth(year, m));
  return utcDate(year, m, d);
}

export function chronologicalAge(birthIso: string, onIso: string): AgeResult {
  const birth = parseDate(birthIso, "date of birth");
  const on = parseDate(onIso, "age-at date");
  if (on < birth) throw new ToolError("bad-input", "The age-at date is before the date of birth.");
  const ymd = ymdBetween(birth, on);
  const totalDays = dayNumber(on) - dayNumber(birth);
  let next = birthdayIn(birth, on.getUTCFullYear());
  if (next <= on) next = birthdayIn(birth, on.getUTCFullYear() + 1);
  return {
    birth,
    on,
    ymd,
    totalMonths: ymd.years * 12 + ymd.months,
    totalWeeks: Math.floor(totalDays / 7),
    totalDays,
    decimalYears: Math.round((totalDays / 365.2425) * 100) / 100,
    nextBirthday: next,
    daysToNextBirthday: dayNumber(next) - dayNumber(on),
    birthWeekday: birth.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }),
  };
}

/** n-th weekday (0=Sun) of a month; n = -1 for the last one. */
export function nthWeekday(y: number, m: number, weekday: number, n: number): Date {
  if (n > 0) {
    const first = utcDate(y, m, 1).getUTCDay();
    return utcDate(y, m, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7);
  }
  const lastDay = daysInMonth(y, m);
  const last = utcDate(y, m, lastDay).getUTCDay();
  return utcDate(y, m, lastDay - ((last - weekday + 7) % 7));
}

/** Western (Gregorian) Easter Sunday — Anonymous Gregorian algorithm. */
export function easter(y: number): Date {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utcDate(y, month, day);
}

export interface Holiday {
  id: string;
  name: string;
  /** "federal" = 5 U.S.C. 6103 legal public holiday. */
  kind: "federal" | "observance";
  rule: string;
  date: (y: number) => Date;
}

export const HOLIDAYS: readonly Holiday[] = [
  { id: "christmas", name: "Christmas Day", kind: "federal", rule: "December 25", date: (y) => utcDate(y, 12, 25) },
  { id: "christmas-eve", name: "Christmas Eve", kind: "observance", rule: "December 24", date: (y) => utcDate(y, 12, 24) },
  { id: "new-year", name: "New Year's Day", kind: "federal", rule: "January 1", date: (y) => utcDate(y, 1, 1) },
  { id: "mlk", name: "Martin Luther King Jr. Day", kind: "federal", rule: "Third Monday in January", date: (y) => nthWeekday(y, 1, 1, 3) },
  { id: "valentines", name: "Valentine's Day", kind: "observance", rule: "February 14", date: (y) => utcDate(y, 2, 14) },
  { id: "washington", name: "Washington's Birthday (Presidents Day)", kind: "federal", rule: "Third Monday in February", date: (y) => nthWeekday(y, 2, 1, 3) },
  { id: "easter", name: "Easter Sunday", kind: "observance", rule: "Western (Gregorian) computus", date: easter },
  { id: "mothers-day", name: "Mother's Day (US)", kind: "observance", rule: "Second Sunday in May", date: (y) => nthWeekday(y, 5, 0, 2) },
  { id: "memorial", name: "Memorial Day", kind: "federal", rule: "Last Monday in May", date: (y) => nthWeekday(y, 5, 1, -1) },
  { id: "fathers-day", name: "Father's Day (US)", kind: "observance", rule: "Third Sunday in June", date: (y) => nthWeekday(y, 6, 0, 3) },
  { id: "juneteenth", name: "Juneteenth", kind: "federal", rule: "June 19", date: (y) => utcDate(y, 6, 19) },
  { id: "independence", name: "Independence Day", kind: "federal", rule: "July 4", date: (y) => utcDate(y, 7, 4) },
  { id: "labor", name: "Labor Day", kind: "federal", rule: "First Monday in September", date: (y) => nthWeekday(y, 9, 1, 1) },
  { id: "columbus", name: "Columbus Day", kind: "federal", rule: "Second Monday in October", date: (y) => nthWeekday(y, 10, 1, 2) },
  { id: "halloween", name: "Halloween", kind: "observance", rule: "October 31", date: (y) => utcDate(y, 10, 31) },
  { id: "veterans", name: "Veterans Day", kind: "federal", rule: "November 11", date: (y) => utcDate(y, 11, 11) },
  { id: "thanksgiving", name: "Thanksgiving Day", kind: "federal", rule: "Fourth Thursday in November", date: (y) => nthWeekday(y, 11, 4, 4) },
];

/** Next occurrence on or after `today` (a UTC calendar date). Days = 0 means it is today. */
export function nextOccurrence(h: Holiday, today: Date): { date: Date; days: number } {
  const t = dayNumber(today);
  let d = h.date(today.getUTCFullYear());
  if (dayNumber(d) < t) d = h.date(today.getUTCFullYear() + 1);
  return { date: d, days: dayNumber(d) - t };
}

/** Split a millisecond span into days/hours/minutes/seconds. */
export function splitMs(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

/** "15:00" / "3pm" / "3:30 PM" / "1530" -> minutes after midnight. */
export function parseClock(input: string): number {
  const s = input.trim().toLowerCase().replace(/\s+/g, "").replace(/\./g, "");
  let m = /^(\d{1,2})(?::?(\d{2}))?(am|pm|a|p)$/.exec(s);
  if (m) {
    let h = Number(m[1]);
    const min = m[2] ? Number(m[2]) : 0;
    if (h < 1 || h > 12 || min > 59) throw new ToolError("bad-input", "That 12-hour time is not valid. Use 1-12 for the hour.");
    if (h === 12) h = 0;
    if (m[3].startsWith("p")) h += 12;
    return h * 60 + min;
  }
  m = /^(\d{1,2}):?(\d{2})$/.exec(s) ?? /^(\d{1,2})$/.exec(s);
  if (m) {
    const h = Number(m[1]);
    const min = m[2] ? Number(m[2]) : 0;
    if (h > 24 || min > 59 || (h === 24 && min > 0)) throw new ToolError("bad-input", "That 24-hour time is not valid. Use 00:00 to 23:59.");
    return (h % 24) * 60 + min;
  }
  throw new ToolError("bad-input", "Enter a time such as 3pm, 3:30 PM or 15:30.");
}

export const fmt12 = (min: number) => {
  const h = Math.floor(min / 60) % 24, m = min % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
export const fmt24 = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export function fmtUtcDate(d: Date, weekday = true): string {
  return d.toLocaleDateString("en-US", { weekday: weekday ? "long" : undefined, year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
