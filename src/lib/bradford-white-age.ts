import { ToolError } from "./errors";

/**
 * Bradford White water heater age from the serial number.
 *
 * Source: Bradford White "For The Pro" bulletin, "Determining The Age Of A Water Heater"
 * (forthepro.bradfordwhite.com/determining-the-age-of-a-water-heater/), read from the raw page
 * 2026-10-14:
 *  - "The first two characters of the serial number represent the year and month of
 *    manufacture. The remainder of the serial is a sequential production number, seven digits
 *    in length before December 2007 (DM), and eight digits in length after."
 *  - Year letters: "A = 1984 or 2004" (also printed "A = 2004 or 2024"), "B = 1985 or 2005" …
 *    "Z = 2003 or 2023". "For the year column, we do not use the letters : I, O, Q, R U, V".
 *    That leaves 20 letters, so each letter returns every 20 years.
 *  - Months: "A=January … H=August J=September K=October L=November M=December";
 *    "For the month column we do not use the letters: I & N – Z".
 *  - "Due to a computer error there were some OA serial water heaters manufactured. They were
 *    built in January of 1997."
 * Bradford White's own lookup: bradfordwhite.com/my-water-heater/ (enter the serial).
 */

export const BW_RETRIEVED = "2026-10-14";
export const BW_PRO_URL = "https://forthepro.bradfordwhite.com/determining-the-age-of-a-water-heater/";
export const BW_LOOKUP_URL = "https://www.bradfordwhite.com/my-water-heater/";

export const YEAR_LETTERS = "ABCDEFGHJKLMNPSTWXYZ"; // 1984 + index (+20, +40)
export const MONTH_LETTERS = "ABCDEFGHJKLM"; // January … December
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export interface YM {
  year: number;
  /** 1–12 */
  month: number;
}

export interface BwResult {
  serial: string;
  yearLetter: string;
  monthLetter: string;
  digits: number;
  /** Every year the letter can mean, up to today. */
  candidates: YM[];
  /** The candidate(s) the digit-length rule leaves. */
  matches: YM[];
  /** The single answer, or null if still ambiguous. */
  date: YM | null;
  /** Age in whole months at `today`, for `date`. */
  ageMonths: number | null;
  note: string;
  retrievedAt: string;
}

const before = (a: YM, b: YM) => a.year < b.year || (a.year === b.year && a.month < b.month);
const DM2007: YM = { year: 2007, month: 12 };

export function monthsBetween(from: YM, to: YM): number {
  return (to.year - from.year) * 12 + (to.month - from.month);
}

export function formatAge(months: number): string {
  if (months < 0) return "in the future";
  const y = Math.floor(months / 12);
  const m = months % 12;
  const ys = y === 1 ? "1 year" : `${y} years`;
  const ms = m === 1 ? "1 month" : `${m} months`;
  if (y === 0) return ms;
  return m === 0 ? ys : `${ys}, ${ms}`;
}

export function decodeBradfordWhite(raw: string, today: YM): BwResult {
  const serial = raw.toUpperCase().replace(/[\s-]/g, "");
  if (serial === "") throw new ToolError("bad-input", "Enter the serial number from the water heater's rating plate.");
  const m = /^([A-Z])([A-Z])(\d+)[A-Z]?$/.exec(serial);
  if (!m)
    throw new ToolError(
      "no-data",
      "Bradford White serial numbers start with two letters followed by numbers (for example DG6322957). This one doesn't match that pattern — check you are reading the serial, not the model number, and that 0 and O aren't mixed up.",
    );
  const [, yl, ml, num] = m;
  const digits = num.length;
  const base = { serial, yearLetter: yl, monthLetter: ml, digits, retrievedAt: BW_RETRIEVED };

  if (yl === "O" && ml === "A") {
    const date = { year: 1997, month: 1 };
    return {
      ...base,
      candidates: [date],
      matches: [date],
      date,
      ageMonths: monthsBetween(date, today),
      note: "Bradford White: 'Due to a computer error there were some OA serial water heaters manufactured. They were built in January of 1997.'",
    };
  }
  const yi = YEAR_LETTERS.indexOf(yl);
  if (yi === -1)
    throw new ToolError("no-data", `Bradford White does not use the letter ${yl} for the year (it skips I, O, Q, R, U and V). Check the first character — it may be a misread.`);
  const mi = MONTH_LETTERS.indexOf(ml);
  if (mi === -1)
    throw new ToolError("no-data", `Bradford White's month letters run A (January) to M (December), skipping I. ${ml} isn't one of them — check the second character.`);
  const month = mi + 1;

  const candidates: YM[] = [];
  for (let y = 1984 + yi; y <= today.year; y += 20) {
    const c = { year: y, month };
    if (!before(today, c)) candidates.push(c);
  }
  if (candidates.length === 0) throw new ToolError("no-data", `${yl}${ml} would be ${MONTHS[mi]} ${1984 + yi}, but that is later than today.`);

  let matches = candidates;
  let note: string;
  if (digits === 7) {
    matches = candidates.filter((c) => before(c, DM2007));
    note = "Seven digits after the letters: Bradford White says that length was used before December 2007.";
  } else if (digits === 8) {
    matches = candidates.filter((c) => !before(c, DM2007));
    note = "Eight digits after the letters: Bradford White says that length was used from December 2007 on.";
  } else {
    note = `${digits} digits after the letters. Bradford White describes seven (before December 2007) or eight (after); this length doesn't fit either, so every possible year is shown.`;
  }
  if (matches.length === 0) {
    matches = candidates;
    note += " No year fits that rule, so every possible year is shown — check the serial was read correctly.";
  }
  const date = matches.length === 1 ? matches[0] : null;
  return { ...base, candidates, matches, date, ageMonths: date ? monthsBetween(date, today) : null, note };
}
