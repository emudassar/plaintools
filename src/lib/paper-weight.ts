import { ToolError } from "./errors";

/**
 * Paper weight conversion (US basis weight <-> gsm).
 *
 * Sylvamo basis weight calculator, retrieved 2026-10-17: "To convert basis
 * weight of a given standard size of paper to grams per square meter (GSM),
 * multiply its basis weight by 1406.5 and divide the results by the area of
 * its basic size." Basic sizes (inches): Bond 17 × 22 = 374 in², Book &
 * Offset (text) 25 × 38 = 950, Tag 24 × 36 = 864, Index 25.5 × 30.5 = 778
 * (777.75), Vellum Bristol 22.5 × 28.5 = 641 (641.25), Cover 20 × 26 = 520.
 * Basis weight = pounds per 500-sheet ream of the basic size.
 * (1406.5 = 453.59237 g/lb × 1550.0031 in²/m² ÷ 500 sheets.)
 */

export const SYLVAMO_URL = "https://shop.sylvamo.com/en/resources/calculator/basisweight";
export const PAPER_RETRIEVED = "2026-10-17";
export const GSM_FACTOR = 1406.5;

export const GRADES = {
  bond: { label: "Bond / writing", w: 17, h: 22 },
  text: { label: "Text / book / offset", w: 25, h: 38 },
  cover: { label: "Cover", w: 20, h: 26 },
  index: { label: "Index", w: 25.5, h: 30.5 },
  bristol: { label: "Vellum bristol", w: 22.5, h: 28.5 },
  tag: { label: "Tag", w: 24, h: 36 },
} as const;
export type Grade = keyof typeof GRADES;

export const area = (g: Grade) => GRADES[g].w * GRADES[g].h;

export function lbToGsm(lb: number, g: Grade) {
  if (!Number.isFinite(lb) || lb <= 0 || lb > 2000) throw new ToolError("bad-input", "Enter the basis weight in pounds (for example 20 or 80).");
  return (lb * GSM_FACTOR) / area(g);
}

export function gsmToLb(gsm: number, g: Grade) {
  if (!Number.isFinite(gsm) || gsm <= 0 || gsm > 2000) throw new ToolError("bad-input", "Enter the weight in grams per square metre.");
  return (gsm * area(g)) / GSM_FACTOR;
}

/** Equivalent weight in every grade for one paper. */
export function equivalents(gsm: number) {
  return (Object.keys(GRADES) as Grade[]).map((g) => ({ grade: g, label: GRADES[g].label, lb: gsmToLb(gsm, g) }));
}
