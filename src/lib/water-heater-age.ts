import { ToolError } from "./errors";
import { decodeBradfordWhite, monthsBetween, MONTHS, type YM } from "./bradford-white-age";

/**
 * Water heater age from the serial number, for brands whose maker publishes the format.
 *
 * Sources (read 2026-10-14):
 *  - A. O. Smith: "Service and Warranty Guide for Contracted Service Providers", Dec. 2018
 *    (assets.hotwater.com/damroot/Original/10009/ServiceWarrantyGuide.pdf), p.10 "How to read
 *    the Serial Number": sample 1719106145074; "17: The first two digits of the serial number
 *    represent the year of manufacturing. In this case the year is 2017." "19: The second two
 *    digits represent the week of manufacturing. There can be up to fifty-three (53) weeks in a
 *    given manufacturing year."
 *  - Rheem: rheem.com "How to Locate and Read your Rheem Water Heating Serial Numbers":
 *    "The serial number identification on all Rheem water heating product rating labels contain
 *    ten(10) digits", e.g. "12 09 D 01234" = Month Manufactured, Year Manufactured, Plant Line
 *    Code, Consecutive Serial Number.
 *  - Bradford White: see bradford-white-age.ts.
 * Brands whose makers publish no format (Ruud, State, American, Whirlpool, Rinnai …) are not decoded;
 * ruud.com offers only a lookup, so Ruud is linked, not decoded.
 */

export const WH_RETRIEVED = "2026-10-14";
export const AOS_GUIDE_URL = "https://assets.hotwater.com/damroot/Original/10009/ServiceWarrantyGuide.pdf";
export const AOS_VERIFY_URL = "https://www.hotwater.com/support/warranty-verification.html";
export const RHEEM_URL = "https://www.rheem.com/how-to-locate-and-read-your-rheem-water-heating-serial-numbers/";
export const RUUD_AGE_URL = "https://www.ruud.com/how-old-is-my-water-heater/";

export type Brand = "aosmith" | "rheem" | "bradford";

export interface WhResult {
  brand: Brand;
  serial: string;
  /** Possible manufacture months (more than one only when the code genuinely can't decide). */
  dates: YM[];
  /** A. O. Smith only: the week number printed in the serial. */
  week: number | null;
  /** How each part of the serial was read. */
  parts: { chars: string; meaning: string }[];
  ageMonths: number | null;
  note: string;
  retrievedAt: string;
}

/** Month containing day (week−1)·7 + 1 of the year — an approximation, labelled as such in the UI. */
export function weekToMonth(year: number, week: number): number {
  const d = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  return d.getUTCFullYear() > year ? 12 : d.getUTCMonth() + 1;
}

export function decodeWaterHeater(brand: Brand, raw: string, today: YM): WhResult {
  const serial = raw.toUpperCase().replace(/[\s-]/g, "");
  if (serial === "") throw new ToolError("bad-input", "Enter the serial number from the rating plate.");

  if (brand === "bradford") {
    const r = decodeBradfordWhite(serial, today);
    return {
      brand,
      serial: r.serial,
      dates: r.matches,
      week: null,
      parts: [
        { chars: r.yearLetter, meaning: "year letter" },
        { chars: r.monthLetter, meaning: "month letter" },
        { chars: serial.slice(2), meaning: `production number (${r.digits} digits)` },
      ],
      ageMonths: r.ageMonths,
      note: r.note,
      retrievedAt: WH_RETRIEVED,
    };
  }

  if (brand === "rheem") {
    const m = /^(\d{2})(\d{2})([A-Z])(\d{5})$/.exec(serial);
    if (!m)
      throw new ToolError(
        "no-data",
        "Rheem says its water heater serials are ten characters: month (2 digits), year (2 digits), a plant letter, then 5 digits — like 1209D01234. This one doesn't match, so it may be an older or different product's format. Rheem's warranty lookup reads any serial.",
      );
    const month = Number(m[1]);
    const yy = Number(m[2]);
    if (month < 1 || month > 12) throw new ToolError("no-data", `The first two digits should be the month (01–12), but they read ${m[1]}. Check the serial, or whether it is the model number.`);
    // Two-digit year: the most recent year ending in those digits that isn't after today.
    let year = 2000 + yy;
    if (year === today.year && month > today.month)
      throw new ToolError("no-data", `${m[1]}/${m[2]} would be ${MONTHS[month - 1]} ${year}, which is still to come. Check the serial.`);
    if (year > today.year) year -= 100;
    const date = { year, month };
    return {
      brand,
      serial,
      dates: [date],
      week: null,
      parts: [
        { chars: m[1], meaning: `month manufactured (${MONTHS[month - 1]})` },
        { chars: m[2], meaning: `year manufactured (${year})` },
        { chars: m[3], meaning: "plant line code" },
        { chars: m[4], meaning: "consecutive serial number" },
      ],
      ageMonths: monthsBetween(date, today),
      note: "Rheem gives the year as two digits; the most recent matching year not after today is used.",
      retrievedAt: WH_RETRIEVED,
    };
  }

  // A. O. Smith
  const m = /^(\d{2})(\d{2})(\d{5,})$/.exec(serial);
  if (!m)
    throw new ToolError(
      "no-data",
      "A. O. Smith's guide shows an all-digit serial whose first two digits are the year and next two the week (sample 1719106145074). This one doesn't match — it may be an older format with letters. A. O. Smith's warranty verification reads any serial.",
    );
  const yy = Number(m[1]);
  const week = Number(m[2]);
  if (week < 1 || week > 53) throw new ToolError("no-data", `Digits 3–4 should be the week (01–53), but they read ${m[2]}. This may be an older serial format.`);
  const year = 2000 + yy;
  if (year > today.year)
    throw new ToolError("no-data", `Read with A. O. Smith's matrix, ${m[1]} would be the year ${year}, which hasn't happened. This is probably an older serial format the guide doesn't cover; A. O. Smith's warranty verification can read it.`);
  const month = weekToMonth(year, week);
  if (year === today.year && month > today.month) throw new ToolError("no-data", `Week ${week} of ${year} is still to come. Check the serial.`);
  const date = { year, month };
  return {
    brand,
    serial,
    dates: [date],
    week,
    parts: [
      { chars: m[1], meaning: `year of manufacturing (${year})` },
      { chars: m[2], meaning: `week of manufacturing (week ${week}, around ${MONTHS[month - 1]})` },
      { chars: m[3], meaning: "rest of the serial" },
    ],
    ageMonths: monthsBetween(date, today),
    note: "A. O. Smith gives the week, not the month; the month shown is the one that week falls in, counting 7-day weeks from 1 January.",
    retrievedAt: WH_RETRIEVED,
  };
}
