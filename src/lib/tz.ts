/**
 * Time zone arithmetic with the browser's own copy of the IANA tz database (via Intl).
 * Nothing here is hard-coded: offsets and transitions are read from Intl.DateTimeFormat,
 * so they follow whatever tzdata release the visitor's browser ships.
 */

export const IANA_TZ_URL = "https://www.iana.org/time-zones";

/** Offset from UTC in minutes for a zone at an instant (e.g. -240 for EDT). */
export function offsetMinutes(timeZone: string, ms: number): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" }).formatToParts(new Date(ms));
  const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const m = name.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}

export function fmtOffset(min: number): string {
  const s = min < 0 ? "−" : "+";
  const a = Math.abs(min);
  return `UTC${s}${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")}`;
}

/** Short name the browser uses for the zone at that instant ("EDT", "GMT+5:30"). */
export function abbreviation(timeZone: string, ms: number): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" }).formatToParts(new Date(ms)).find((p) => p.type === "timeZoneName")?.value ?? "";
}

export function longName(timeZone: string, ms: number): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "long" }).formatToParts(new Date(ms)).find((p) => p.type === "timeZoneName")?.value ?? timeZone;
}

export interface Transition {
  ms: number;
  fromMin: number;
  toMin: number;
}

/** The next offset change after `fromMs` within `days`, found to the minute. Null if none. */
export function nextTransition(timeZone: string, fromMs: number, days = 400): Transition | null {
  const start = offsetMinutes(timeZone, fromMs);
  let prev = fromMs;
  for (let d = 1; d <= days; d++) {
    const t = fromMs + d * 86400000;
    const off = offsetMinutes(timeZone, t);
    if (off !== start) {
      let lo = prev, hi = t;
      while (hi - lo > 60000) {
        const mid = Math.floor((lo + hi) / 2);
        if (offsetMinutes(timeZone, mid) === start) lo = mid;
        else hi = mid;
      }
      return { ms: hi - (hi % 60000), fromMin: start, toMin: off };
    }
    prev = t;
  }
  return null;
}

/**
 * Daylight saving is in effect when the current offset is larger than the zone's smaller
 * offset of the year (sampled in January and July). Zones with one offset all year: false.
 */
export function dstInfo(timeZone: string, ms: number): { observes: boolean; active: boolean; standardMin: number; daylightMin: number } {
  const y = new Date(ms).getUTCFullYear();
  const jan = offsetMinutes(timeZone, Date.UTC(y, 0, 1));
  const jul = offsetMinutes(timeZone, Date.UTC(y, 6, 1));
  const now = offsetMinutes(timeZone, ms);
  const std = Math.min(jan, jul), dl = Math.max(jan, jul);
  return { observes: jan !== jul, active: jan !== jul && now === dl, standardMin: std, daylightMin: dl };
}

export function fmtInZone(ms: number, timeZone: string, opts: Intl.DateTimeFormatOptions = { dateStyle: "full", timeStyle: "short" }): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, ...opts }).format(new Date(ms));
}

export function isValidZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
