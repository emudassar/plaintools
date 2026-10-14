import { ToolError } from "./errors";

/**
 * Ski boot size conversion: shoe sizes ↔ Mondopoint.
 *
 * Source: Nordica, "Ski Boot Sizing Chart" (nordica.com/assets/downloads/size-boot-sl.pdf),
 * read 2026-10-14. Men's and women's tables give US, Euro and UK foot sizes with two
 * Mondopoint recommendations, "Standard Fit" (beginner to intermediate, less frequent,
 * lower speeds) and "Performance Fit" (intermediate to advanced, regularly, higher
 * speeds). The junior table gives US child, US youth, UK and one Mondopoint size.
 * "Mondopoint is calculated by the length of one's foot in centimeters, from the heel
 * to the big toe." A "-" in the chart (no size) is null here. Rows transcribed exactly.
 */

export const BOOT_RETRIEVED = "2026-10-14";
export const NORDICA_BOOT_URL = "https://www.nordica.com/assets/downloads/size-boot-sl.pdf";

export interface AdultBootRow {
  us: number;
  /** Euro size as printed, e.g. "40-41". */
  eu: string;
  uk: number;
  standard: number | null;
  performance: number | null;
}

export interface JuniorBootRow {
  child: number | null;
  youth: number | null;
  uk: number;
  mondo: number;
}

const a = (us: number, eu: string, uk: number, standard: number | null, performance: number | null): AdultBootRow => ({ us, eu, uk, standard, performance });

export const MEN: readonly AdultBootRow[] = [
  a(4.5, "36", 4, 22.5, 21.5),
  a(5, "37", 4.5, 23, 22),
  a(5.5, "38", 5, 23.5, 22.5),
  a(6, "39", 5.5, 24, 23),
  a(6.5, "39", 6, 24.5, 23.5),
  a(7, "40", 6.5, 25, 24),
  a(7.5, "40-41", 7, 25.5, 24.5),
  a(8, "41", 7.5, 26, 25),
  a(8.5, "41-42", 8, 26.5, 25.5),
  a(9, "42", 8.5, 27, 26),
  a(9.5, "42-43", 9, 27.5, 26.5),
  a(10, "43", 9.5, 28, 27),
  a(10.5, "43-44", 10, 28.5, 27.5),
  a(11, "44", 10.5, 29, 28),
  a(11.5, "44-45", 11, 29.5, 28.5),
  a(12, "45", 11.5, 30, 29),
  a(12.5, "46", 12, 30.5, 29.5),
  a(13, "46-47", 12.5, 31, 30),
  a(13.5, "47", 13, 31.5, 30.5),
  a(14, "48", 13.5, 32, 31),
  a(14.5, "48-49", 14, 32.5, 31.5),
  a(15, "49", 14.5, null, 32),
  a(15.5, "50", 15, null, 32.5),
];

export const WOMEN: readonly AdultBootRow[] = [
  a(4.5, "35", 2.5, 21.5, null),
  a(5, "35-36", 3, 22, null),
  a(5.5, "36", 3.5, 22.5, 21.5),
  a(6, "36-37", 4, 23, 22),
  a(6.5, "37", 4.5, 23.5, 22.5),
  a(7, "37-38", 5, 24, 23),
  a(7.5, "38", 5.5, 24.5, 23.5),
  a(8, "38-39", 6, 25, 24),
  a(8.5, "39", 6.5, 25.5, 24.5),
  a(9, "39-40", 7, 26, 25),
  a(9.5, "40", 7.5, 26.5, 25.5),
  a(10, "40-41", 8, 27, 26),
  a(10.5, "41", 8.5, 27.5, 26.5),
];

const j = (child: number | null, youth: number | null, uk: number, mondo: number): JuniorBootRow => ({ child, youth, uk, mondo });

export const JUNIOR: readonly JuniorBootRow[] = [
  j(8, null, 7, 14),
  j(8.5, null, 8, 14.5),
  j(9, null, 8.5, 15),
  j(9.5, null, 9, 15.5),
  j(10, null, 9.5, 16),
  j(10.5, null, 10, 16.5),
  j(11, null, 10.5, 17),
  j(11.5, null, 11, 17.5),
  j(12, null, 11.5, 18),
  j(12.5, null, 12, 18.5),
  j(13, 1, 12.5, 19),
  j(13.5, 1.5, 13, 19.5),
  j(null, 2, 1, 20),
  j(null, 2.5, 1.5, 20.5),
  j(null, 3, 2, 21),
  j(null, 3.5, 2.5, 21.5),
  j(null, 4, 3, 22),
  j(null, 4.5, 3.5, 22.5),
  j(null, 5, 4, 23),
  j(null, 5.5, 4.5, 23.5),
  j(null, 6, 5, 24),
  j(null, 6.5, 5.5, 24.5),
  j(null, 7, 6, 25),
  j(null, 7.5, 6.5, 25.5),
  j(null, 8, 7, 26),
  j(null, 8.5, 7.5, 26.5),
  j(null, 9, 8, 27),
  j(null, 9.5, 8.5, 27.5),
  j(null, 10, 9, 28),
];

export type FromSystem = "mondo" | "us-men" | "us-women" | "us-child" | "us-youth" | "eu-men" | "eu-women" | "uk-men" | "uk-women";

export interface Match {
  table: "Men's" | "Women's" | "Junior";
  /** Which column matched for Mondopoint lookups. */
  fit?: "Standard fit" | "Performance fit";
  adult?: AdultBootRow;
  junior?: JuniorBootRow;
}

export interface BootResult {
  from: FromSystem;
  value: number;
  /** For Mondopoint / foot-length input that is not on a half size: the half sizes either side. */
  between: [number, number] | null;
  /** Mondopoint sizes actually looked up. */
  mondoLooked: number[];
  matches: Match[];
  retrievedAt: string;
}

const euMatches = (printed: string, v: number) => {
  const parts = printed.split("-").map(Number);
  return parts.length === 1 ? parts[0] === v : v >= parts[0] && v <= parts[1];
};
const same = (x: number | null, v: number) => x !== null && Math.abs(x - v) < 1e-9;

export function convertBootSize(from: FromSystem, value: number): BootResult {
  if (!Number.isFinite(value) || value <= 0) throw new ToolError("bad-input", "Enter a size.");
  const matches: Match[] = [];
  let between: [number, number] | null = null;
  let mondoLooked: number[] = [];

  if (from === "mondo") {
    let v = value;
    // Foot length entered in millimetres (e.g. 265) — boots are often labelled this way.
    if (v >= 100 && v <= 400) v = v / 10;
    if (v < 10 || v > 40) throw new ToolError("bad-input", "Mondopoint is foot length in centimetres (about 14–33 on Nordica's charts). Enter it in cm, e.g. 26.5, or in mm, e.g. 265.");
    const half = Math.round(v * 2) / 2;
    if (Math.abs(half - v) < 1e-6) mondoLooked = [half];
    else {
      const lo = Math.floor(v * 2) / 2;
      between = [lo, lo + 0.5];
      mondoLooked = [lo, lo + 0.5];
    }
    for (const m of mondoLooked) {
      for (const r of MEN) {
        if (same(r.standard, m)) matches.push({ table: "Men's", fit: "Standard fit", adult: r });
        if (same(r.performance, m)) matches.push({ table: "Men's", fit: "Performance fit", adult: r });
      }
      for (const r of WOMEN) {
        if (same(r.standard, m)) matches.push({ table: "Women's", fit: "Standard fit", adult: r });
        if (same(r.performance, m)) matches.push({ table: "Women's", fit: "Performance fit", adult: r });
      }
      for (const r of JUNIOR) if (same(r.mondo, m)) matches.push({ table: "Junior", junior: r });
    }
    if (matches.length === 0)
      throw new ToolError("no-data", `Nordica's charts run from Mondopoint 14 (junior) to 32.5 (men's). ${v.toFixed(1)} cm is outside them.`);
    return { from, value, between, mondoLooked, matches, retrievedAt: BOOT_RETRIEVED };
  }

  const push = (table: Match["table"], rows: readonly AdultBootRow[], pred: (r: AdultBootRow) => boolean) => {
    for (const r of rows) if (pred(r)) matches.push({ table, adult: r });
  };
  switch (from) {
    case "us-men":
      push("Men's", MEN, (r) => same(r.us, value));
      break;
    case "us-women":
      push("Women's", WOMEN, (r) => same(r.us, value));
      break;
    case "eu-men":
      push("Men's", MEN, (r) => euMatches(r.eu, value));
      break;
    case "eu-women":
      push("Women's", WOMEN, (r) => euMatches(r.eu, value));
      break;
    case "uk-men":
      push("Men's", MEN, (r) => same(r.uk, value));
      break;
    case "uk-women":
      push("Women's", WOMEN, (r) => same(r.uk, value));
      break;
    case "us-child":
      for (const r of JUNIOR) if (same(r.child, value)) matches.push({ table: "Junior", junior: r });
      break;
    case "us-youth":
      for (const r of JUNIOR) if (same(r.youth, value)) matches.push({ table: "Junior", junior: r });
      break;
  }
  if (matches.length === 0) {
    const half = Math.abs(value * 2 - Math.round(value * 2)) > 1e-9;
    throw new ToolError(
      "no-data",
      half
        ? "Nordica's chart lists whole and half sizes only (EU sizes are whole numbers). Round to the nearest listed size."
        : "That size is not on Nordica's chart for this system. The chart's range is shown below the result; check the system you picked.",
    );
  }
  return { from, value, between: null, mondoLooked: [], matches, retrievedAt: BOOT_RETRIEVED };
}

export const RANGES: Record<Exclude<FromSystem, "mondo">, string> = {
  "us-men": "US men's 4.5–15.5",
  "us-women": "US women's 4.5–10.5",
  "us-child": "US child 8–13.5",
  "us-youth": "US youth 1–10",
  "eu-men": "EU men's 36–50",
  "eu-women": "EU women's 35–41",
  "uk-men": "UK men's 4–15",
  "uk-women": "UK women's 2.5–8.5",
};
