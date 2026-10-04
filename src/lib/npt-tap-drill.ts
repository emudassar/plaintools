import { ToolError } from "./errors";

/**
 * Pipe tap drill sizes.
 *
 * Source: Sowa Tool, "Tap & Drill Charts" (PDF), sections "TAPER PIPE TAPS
 * (NPT)" and "STRAIGHT PIPE TAPS (NPS)", plus its "Decimal Equivalents" table
 * for letter drills. Retrieved 2026-10-04 from
 *   https://www.sowatool.com/INTERSHOP/static/WFS/Sowa-Webshop_US-Site/-/Sowa-Webshop_CA/en_US/Download%20Centre/Speeds%20and%20Feeds/TapAndDrill-Charts.pdf
 *
 * NPT (as printed): 1/16-27 D, 1/8-27 R, 1/4-18 7/16", 3/8-18 37/64",
 * 1/2-14 23/32", 3/4-14 59/64", 1-11-1/2 1-5/32", 1-1/4-11-1/2 1-1/2",
 * 1-1/2-11-1/2 1-47/64", 2-11-1/2 2-7/32", 2-1/2-8 2-5/8", 3-8 3-1/4".
 * NPS (as printed): 1/8-27 S, 1/4-18 29/64", 3/8-18 19/32", 1/2-14 47/64",
 * 3/4-14 15/16", 1-11-1/2 1-3/16", 1-1/4-11-1/2 1-33/64", 1-1/2-11-1/2 1-3/4",
 * 2-11-1/2 2-7/32".
 * Letter drills (decimal-equivalents table): D .2460, R .3390, S .3480.
 *
 * Fractional drills are converted exactly; mm = inches x 25.4.
 */

export const NPT_RETRIEVED = "2026-10-04";
export const SOWA_URL =
  "https://www.sowatool.com/INTERSHOP/static/WFS/Sowa-Webshop_US-Site/-/Sowa-Webshop_CA/en_US/Download%20Centre/Speeds%20and%20Feeds/TapAndDrill-Charts.pdf";

export interface Drill {
  label: string;
  inches: number;
}

export interface PipeSizeRow {
  size: string;
  tpi: string;
  npt: Drill;
  nps: Drill | null;
}

const frac = (label: string, whole: number, num: number, den: number): Drill => ({
  label,
  inches: whole + num / den,
});

export const PIPE_TAPS: readonly PipeSizeRow[] = [
  { size: "1/16", tpi: "27", npt: { label: "D", inches: 0.246 }, nps: null },
  { size: "1/8", tpi: "27", npt: { label: "R", inches: 0.339 }, nps: { label: "S", inches: 0.348 } },
  { size: "1/4", tpi: "18", npt: frac('7/16"', 0, 7, 16), nps: frac('29/64"', 0, 29, 64) },
  { size: "3/8", tpi: "18", npt: frac('37/64"', 0, 37, 64), nps: frac('19/32"', 0, 19, 32) },
  { size: "1/2", tpi: "14", npt: frac('23/32"', 0, 23, 32), nps: frac('47/64"', 0, 47, 64) },
  { size: "3/4", tpi: "14", npt: frac('59/64"', 0, 59, 64), nps: frac('15/16"', 0, 15, 16) },
  { size: "1", tpi: "11-1/2", npt: frac('1-5/32"', 1, 5, 32), nps: frac('1-3/16"', 1, 3, 16) },
  { size: "1-1/4", tpi: "11-1/2", npt: frac('1-1/2"', 1, 1, 2), nps: frac('1-33/64"', 1, 33, 64) },
  { size: "1-1/2", tpi: "11-1/2", npt: frac('1-47/64"', 1, 47, 64), nps: frac('1-3/4"', 1, 3, 4) },
  { size: "2", tpi: "11-1/2", npt: frac('2-7/32"', 2, 7, 32), nps: frac('2-7/32"', 2, 7, 32) },
  { size: "2-1/2", tpi: "8", npt: frac('2-5/8"', 2, 5, 8), nps: null },
  { size: "3", tpi: "8", npt: frac('3-1/4"', 3, 1, 4), nps: null },
];

export function findPipeSize(size: string): PipeSizeRow {
  const row = PIPE_TAPS.find((r) => r.size === size);
  if (!row) throw new ToolError("bad-input", "Pick a pipe size from the list.");
  return row;
}

export function inchesToMm(inches: number): number {
  return inches * 25.4;
}
