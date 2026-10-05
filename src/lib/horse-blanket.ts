import { ToolError } from "./errors";

/**
 * Horse blanket (rug) size from a body-length measurement.
 *
 * Source: WeatherBeeta, "Ultimate Horse Blanket Size Guide"
 * (weatherbeeta.com/horse-blanket-size-guide), table read 2026-10-05:
 *  - Body Length (B): "Measure from the center of the chest to the end of
 *    rump." Sizes in feet-inches, inches and cm.
 *  - Back Seam (A): "Measure from the wither to the top of the tail." Given in
 *    Euro cm alongside each size, and X Small–X Large by back seam.
 *  - "WeatherBeeta blankets are sized in 3 inch increments, if your horse is
 *    between sizes, then choose the bigger size."
 * Rows as printed, including 6'5 / 77" / 195 cm between 6'3 and 6'6.
 */

export const BLANKET_RETRIEVED = "2026-10-05";
export const WEATHERBEETA_URL = "https://www.weatherbeeta.com/horse-blanket-size-guide";

export interface BlanketSize {
  inches: number;
  feet: string;
  cm: number;
  backSeamCm: number;
}

export const SIZES: readonly BlanketSize[] = [
  { backSeamCm: 55, feet: "3'0", inches: 36, cm: 90 },
  { backSeamCm: 60, feet: "3'3", inches: 39, cm: 100 },
  { backSeamCm: 65, feet: "3'6", inches: 42, cm: 105 },
  { backSeamCm: 70, feet: "3'9", inches: 45, cm: 115 },
  { backSeamCm: 75, feet: "4'0", inches: 48, cm: 120 },
  { backSeamCm: 85, feet: "4'3", inches: 51, cm: 130 },
  { backSeamCm: 90, feet: "4'6", inches: 54, cm: 140 },
  { backSeamCm: 95, feet: "4'9", inches: 57, cm: 145 },
  { backSeamCm: 105, feet: "5'0", inches: 60, cm: 155 },
  { backSeamCm: 115, feet: "5'3", inches: 63, cm: 160 },
  { backSeamCm: 120, feet: "5'6", inches: 66, cm: 170 },
  { backSeamCm: 125, feet: "5'9", inches: 69, cm: 175 },
  { backSeamCm: 135, feet: "6'0", inches: 72, cm: 185 },
  { backSeamCm: 140, feet: "6'3", inches: 75, cm: 190 },
  { backSeamCm: 145, feet: "6'5", inches: 77, cm: 195 },
  { backSeamCm: 150, feet: "6'6", inches: 78, cm: 200 },
  { backSeamCm: 155, feet: "6'9", inches: 81, cm: 205 },
  { backSeamCm: 160, feet: "7'0", inches: 84, cm: 215 },
  { backSeamCm: 165, feet: "7'3", inches: 87, cm: 225 },
];

/** WeatherBeeta letter sizes by back seam (cm). */
export const LETTER_SIZES: readonly { label: string; backSeamCm: number }[] = [
  { label: "X Small", backSeamCm: 125 },
  { label: "Small", backSeamCm: 135 },
  { label: "Medium", backSeamCm: 145 },
  { label: "Large", backSeamCm: 155 },
  { label: "X Large", backSeamCm: 165 },
];

export interface BlanketInput {
  measurement: number;
  unit: "in" | "cm";
}

export interface BlanketResult {
  measuredIn: number;
  measuredCm: number;
  size: BlanketSize;
  exact: boolean;
  smaller: BlanketSize | null;
  letter: string | null;
  retrievedAt: string;
}

export function findBlanketSize(input: BlanketInput): BlanketResult {
  if (!Number.isFinite(input.measurement) || input.measurement <= 0) throw new ToolError("bad-input", "Enter the body length measurement.");
  const inches = input.unit === "in" ? input.measurement : input.measurement / 2.54;
  const cm = input.unit === "cm" ? input.measurement : input.measurement * 2.54;
  if (inches < 20) throw new ToolError("bad-input", "That is under 20 inches. Measure from the centre of the chest to the end of the rump, and check the unit.");
  const largest = SIZES[SIZES.length - 1];
  if (input.unit === "in" ? inches > largest.inches + 1e-9 : cm > largest.cm + 1e-9)
    throw new ToolError("no-data", `That is longer than the largest size on WeatherBeeta's chart (${largest.feet}, ${largest.inches}", ${largest.cm} cm), so the chart has no size for it.`);
  // Compare in the unit the user measured in, since the chart's inch and cm columns are rounded separately.
  const idx = SIZES.findIndex((s) => (input.unit === "in" ? s.inches >= inches - 1e-9 : s.cm >= cm - 1e-9));
  const i = idx === -1 ? SIZES.length - 1 : idx;
  const size = SIZES[i];
  const exact = input.unit === "in" ? Math.abs(size.inches - inches) < 1e-9 : Math.abs(size.cm - cm) < 1e-9;
  const letter = LETTER_SIZES.find((l) => l.backSeamCm === size.backSeamCm)?.label ?? null;
  return { measuredIn: inches, measuredCm: cm, size, exact, smaller: !exact && i > 0 ? SIZES[i - 1] : null, letter, retrievedAt: BLANKET_RETRIEVED };
}
