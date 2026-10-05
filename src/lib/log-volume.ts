import { ToolError } from "./errors";

/**
 * Log volume: board feet by the Doyle and International 1/4-inch log rules, and
 * cubic volume.
 *
 * Source: Briggs, D. (1994) "Forest Products Measurements and Conversion
 * Factors: With Special Emphasis on the U.S. Pacific Northwest", College of
 * Forest Resources, University of Washington. Retrieved 2026-10-05 from
 * ruraltech.org (Chapter 2 "Measurement of Logs" and Appendix 3).
 *
 *  - Doyle: "BF = [(d - 4) / 4)]^2 L" (d = small-end scaling diameter, inches;
 *    L = length, feet). Checked against all 150 cells of Appendix 3 Table 1
 *    (6–30 in x 6–16 ft) rounded half up: 150/150 match.
 *  - International 1/4 inch: the log is a series of 4 ft scaling cylinders whose
 *    diameter grows 1/2 inch each; "BF (1/8 inch) = 0.22 d^2 - 0.71 d" per
 *    cylinder, and the 1/4-inch rule is 0.905 x the 1/8-inch rule (the standard
 *    kerf conversion). Rounded to the nearest 5 BF this matches 147 of the 150
 *    tabled values; the other 3 (15x16, 17x14, 28x14) differ by one 5-BF step.
 *    So: inside the table the PUBLISHED value is returned; outside it, the
 *    formula value, labelled as such.
 *    (Briggs's text prints the 1/4-inch cylinder as 0.20 d^2 - 0.71 d, which
 *    reproduces the table worse: a 10 x 20 ft log gives 82.5, vs 85 in his own
 *    text. The 0.905 conversion gives 85.6 -> 85.)
 *  - Cubic: Table 2-1. Smalian V = f (ds^2 + dl^2) L / 2; with only the small
 *    end, a cylinder V = f ds^2 L. f = 0.005454 (ft^3 from inches and feet).
 *
 * Scribner Decimal C is a diagram rule with no formula; it is deliberately NOT
 * offered here.
 */

export const LOG_RETRIEVED = "2026-10-05";
export const BRIGGS_CH2_URL = "http://www.ruraltech.org/projects/conversions/briggs_conversions/briggs_ch02/chapter02_combined.pdf";
export const BRIGGS_APP3_URL = "https://www.ruraltech.org/projects/conversions/briggs_conversions/briggs_append3/appendix03_combined.pdf";

const LENGTHS = [6, 8, 10, 12, 14, 16];

/** Briggs Appendix 3, Table 1 — International 1/4 inch, board feet. */
const INTL: Record<number, readonly number[]> = {6: [5, 10, 10, 15, 15, 20], 7: [10, 10, 15, 20, 25, 30], 8: [10, 15, 20, 25, 35, 40], 9: [15, 20, 30, 35, 45, 50], 10: [20, 30, 35, 45, 55, 65], 11: [25, 35, 45, 55, 70, 80], 12: [30, 45, 55, 70, 85, 95], 13: [40, 55, 70, 85, 100, 115], 14: [45, 65, 80, 100, 115, 135], 15: [55, 75, 95, 115, 135, 160], 16: [60, 85, 110, 130, 155, 180], 17: [70, 95, 125, 150, 180, 205], 18: [80, 110, 140, 170, 200, 230], 19: [90, 125, 155, 190, 225, 260], 20: [100, 135, 175, 210, 250, 290], 21: [115, 155, 195, 235, 280, 320], 22: [125, 170, 215, 260, 305, 355], 23: [140, 185, 235, 285, 335, 390], 24: [150, 205, 255, 310, 370, 425], 25: [165, 220, 280, 340, 400, 460], 26: [180, 240, 305, 370, 435, 500], 27: [195, 260, 330, 400, 470, 540], 28: [210, 280, 355, 430, 510, 585], 29: [225, 305, 385, 465, 545, 630], 30: [245, 325, 410, 495, 585, 675]};

/** Briggs Appendix 3, Table 1 — Doyle, board feet. */
const DOYLE: Record<number, readonly number[]> = {6: [2, 2, 3, 3, 4, 4], 7: [3, 5, 6, 7, 8, 9], 8: [6, 8, 10, 12, 14, 16], 9: [9, 13, 16, 19, 22, 25], 10: [14, 18, 23, 27, 32, 36], 11: [18, 25, 31, 37, 43, 49], 12: [24, 32, 40, 48, 56, 64], 13: [30, 41, 51, 61, 71, 81], 14: [38, 50, 63, 75, 88, 100], 15: [45, 61, 76, 91, 106, 121], 16: [54, 72, 90, 108, 126, 144], 17: [63, 85, 106, 127, 148, 169], 18: [74, 98, 123, 147, 172, 196], 19: [84, 113, 141, 169, 197, 225], 20: [96, 128, 160, 192, 224, 256], 21: [108, 145, 181, 217, 253, 289], 22: [122, 162, 203, 243, 284, 324], 23: [135, 181, 226, 271, 316, 361], 24: [150, 200, 250, 300, 350, 400], 25: [165, 221, 276, 331, 386, 441], 26: [182, 242, 303, 363, 424, 484], 27: [198, 265, 331, 397, 463, 529], 28: [216, 288, 360, 432, 504, 576], 29: [234, 313, 391, 469, 547, 625], 30: [254, 338, 423, 507, 592, 676]};

const F = 0.005454;
const FT3_TO_M3 = 0.028316846592;

export function doyleFormula(d: number, L: number): number {
  return ((d - 4) / 4) ** 2 * L;
}

/** International 1/4-inch by 4 ft cylinders; a remainder shorter than 4 ft is prorated. */
export function internationalFormula(d: number, L: number): number {
  const cyl = (x: number) => 0.905 * (0.22 * x * x - 0.71 * x);
  const full = Math.floor(L / 4);
  let s = 0;
  for (let i = 0; i < full; i++) s += cyl(d + 0.5 * i);
  const rem = L - full * 4;
  if (rem > 1e-9) s += (cyl(d + 0.5 * full) * rem) / 4;
  return s;
}

export interface RuleValue {
  boardFeet: number;
  /** "table" = Briggs Appendix 3 printed value; "formula" = computed. */
  basis: "table" | "formula";
  formulaValue: number;
}

export interface LogInput {
  /** Small-end diameter inside bark, inches. */
  smallDiameterIn: number;
  /** Large-end diameter inside bark, inches, or null. */
  largeDiameterIn: number | null;
  lengthFt: number;
  /** Number of identical logs. */
  count: number;
}

export interface LogResult {
  doyle: RuleValue;
  international: RuleValue;
  cubicFeet: number;
  cubicMetres: number;
  cubicMethod: "smalian" | "cylinder";
  count: number;
  doyleSmallLogNote: boolean;
  retrievedAt: string;
}

function rule(table: Record<number, readonly number[]>, d: number, L: number, formula: number): RuleValue {
  const col = LENGTHS.indexOf(L);
  const row = Number.isInteger(d) ? table[d] : undefined;
  if (row && col >= 0) return { boardFeet: row[col], basis: "table", formulaValue: formula };
  return { boardFeet: formula, basis: "formula", formulaValue: formula };
}

export function calculateLogVolume(input: LogInput): LogResult {
  const { smallDiameterIn: d, largeDiameterIn: D, lengthFt: L, count } = input;
  if (!Number.isFinite(d) || d <= 0) throw new ToolError("bad-input", "Enter the small-end diameter in inches.");
  if (!Number.isFinite(L) || L <= 0) throw new ToolError("bad-input", "Enter the log length in feet.");
  if (d > 120) throw new ToolError("bad-input", "That diameter is over 120 inches. Check it is in inches.");
  if (L > 100) throw new ToolError("bad-input", "That log is over 100 ft long. Check it is in feet.");
  if (!Number.isInteger(count) || count < 1 || count > 10000) throw new ToolError("bad-input", "Number of logs must be a whole number from 1 to 10,000.");
  if (D !== null) {
    if (!Number.isFinite(D) || D <= 0) throw new ToolError("bad-input", "Large-end diameter must be more than zero, or left blank.");
    if (D < d) throw new ToolError("bad-input", "The large end is smaller than the small end. Swap them.");
  }
  if (d <= 4) throw new ToolError("no-data", "At 4 inches or less, the Doyle rule's 4-inch slab allowance leaves no board feet, and the International table starts at 6 inches. Board-foot rules are not meant for logs this small.");

  const doyleF = Math.max(0, doyleFormula(d, L));
  const intlF = Math.max(0, internationalFormula(d, L));
  const doyle = rule(DOYLE, d, L, doyleF);
  const international = rule(INTL, d, L, intlF);
  const cubicOne = D !== null ? (F * (d * d + D * D) * L) / 2 : F * d * d * L;

  return {
    doyle: { ...doyle, boardFeet: doyle.boardFeet * count },
    international: { ...international, boardFeet: international.boardFeet * count },
    cubicFeet: cubicOne * count,
    cubicMetres: cubicOne * count * FT3_TO_M3,
    cubicMethod: D !== null ? "smalian" : "cylinder",
    count,
    doyleSmallLogNote: d <= 7,
    retrievedAt: LOG_RETRIEVED,
  };
}
