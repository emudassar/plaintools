import { ToolError } from "./errors";

/**
 * Calendar-day helpers shared by the gestation tools.
 * Everything is in UTC on whole calendar days so daylight-saving changes
 * never move a result.
 */

export interface DateRange {
  from: Date;
  to: Date;
}

const DAY_MS = 86_400_000;

export function parseDate(s: string, label: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m)
    throw new ToolError("bad-input", `Enter the ${label} as a full date.`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== mo - 1 ||
    dt.getUTCDate() !== d
  ) {
    throw new ToolError(
      "bad-input",
      `The ${label} is not a real calendar date.`,
    );
  }
  if (y < 1900 || y > 2200)
    throw new ToolError("bad-input", `The ${label} year looks wrong.`);
  return dt;
}

/** Adds a (possibly fractional) number of days and rounds to the nearest calendar day. */
export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + Math.round(days) * DAY_MS);
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatRange(r: DateRange): string {
  return r.from.getTime() === r.to.getTime()
    ? formatDate(r.from)
    : `${formatDate(r.from)} – ${formatDate(r.to)}`;
}
