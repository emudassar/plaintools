import { ToolError } from "./errors";

/**
 * Mercury outboard year of manufacture from the serial number decal.
 *
 * Source: Mercury Marine, Operation Maintenance and Installation Manual, 15/20 EFI FourStroke,
 * 8M0165094 (© 2019), "Recording Serial Number" and "Model Year Production Code", p.13–14
 * (servicelit.mercurymarine.com/mnetdata/SERVICE/MERMAR/OWNER/19/8M0165094.PDF), read with
 * pdftotext 2026-10-14. The decal callouts are "a - Serial number, b - Model designation,
 * c - Year manufactured". "The serial number decal lists the year of manufacture as an alpha
 * code. This code can be deciphered into a corresponding number using the following table."
 *   Alpha Production Code  A B C D E F G H K X
 *   Corresponding Number   1 2 3 4 5 6 7 8 9 0
 * "Examples: BX = 2020, HK = 2089, AG = 2017" — each letter is one digit of the two-digit year.
 * The serial number itself is not decoded: Mercury does not publish a serial-to-year table.
 */

export const MERC_RETRIEVED = "2026-10-14";
export const MERC_MANUAL_URL = "https://servicelit.mercurymarine.com/mnetdata/SERVICE/MERMAR/OWNER/19/8M0165094.PDF";

export const CODE: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, K: 9, X: 0 };

export interface MercResult {
  input: string;
  kind: "alpha" | "digits";
  digits: string;
  year: number;
  /** Other century reading, shown for context when plausible. */
  alternative: number | null;
  ageYears: number;
  retrievedAt: string;
}

export function decodeMercuryYear(raw: string, todayYear: number): MercResult {
  const s = raw.toUpperCase().replace(/[\s-]/g, "");
  if (s === "") throw new ToolError("bad-input", "Enter the two-character code from the year box on the serial number decal.");
  let digits: string;
  let kind: MercResult["kind"];
  if (/^[A-Z]{2}$/.test(s)) {
    const bad = [...s].filter((c) => !(c in CODE));
    if (bad.length)
      throw new ToolError(
        "no-data",
        `Mercury's year code uses only A B C D E F G H K X. ${bad.join(" and ")} ${bad.length > 1 ? "aren't" : "isn't"} in the table — check you are reading the year box (bottom right of the decal), not part of the serial or model number.`,
      );
    digits = [...s].map((c) => String(CODE[c])).join("");
    kind = "alpha";
  } else if (/^\d{2}$/.test(s)) {
    digits = s;
    kind = "digits";
  } else
    throw new ToolError(
      "no-data",
      "Enter just the two characters in the year box — two letters (e.g. BX) or two digits (e.g. 20). The full serial number (e.g. 2B123456) does not carry the year in a published format.",
    );
  const yy = Number(digits);
  const century = Math.floor(todayYear / 100) * 100;
  let year = century + yy;
  if (year > todayYear) year -= 100;
  if (year < 1950)
    throw new ToolError("no-data", `${s} reads as ${digits}, which would be ${year + 100} — a year still to come. Check the code on the decal.`);
  const alternative = year - 100 >= 1950 ? year - 100 : null;
  return { input: s, kind, digits, year, alternative, ageYears: todayYear - year, retrievedAt: MERC_RETRIEVED };
}
