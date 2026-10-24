import { ToolError } from "./errors";
import weights from "@/data/ingredient-weights.json";

/**
 * Kitchen conversions and sizing.
 *
 * Grams <-> cups: King Arthur Baking "Ingredient Weight Chart" (grams for a listed volume, scaled to
 *   one US cup). 1 US cup = 16 tbsp = 48 tsp = 236.5882365 mL (NIST Handbook 44 Appendix C / NIST SP 811).
 * Oven: C = (F - 32) x 5/9. Gas mark (Wikipedia "Gas mark"): mark 1 = 275 F, +25 F per mark above 1;
 *   below 1 the marks halve (1/2 = 250 F, 1/4 = 225 F).
 * Shoe sizes (Wikipedia "Shoe size", ISO/TS 19407 section): from foot length L in mm,
 *   EU = (L + 2 x 6.67) / 6.67 = 3/20 L + 2; UK = (L + 2 x 8.47)/8.47 - 25 = 3/25.4 L - 23;
 *   US men = UK + 1, US women = UK + 2 (US customary offsets: barleycorns minus 22 men / 21 women vs 23 UK).
 *   Mondopoint = foot length in mm.
 * Ring sizes (Wikipedia "Ring size"): ISO 8653 size = inner circumference in mm; US/Canada
 *   C = 2.55 s + 36.5 mm (d = 0.8128 s + 11.63); UK/Ireland/Australia (BS 6820:1987) 1.25 mm of
 *   circumference per letter with C = 40 mm; Italy/Spain/Switzerland = circumference - 40;
 *   Germany/Netherlands = inner diameter in mm.
 */

export const KA_URL = weights.url;
export const KA_SOURCE = weights.source;
export const KA_RETRIEVED = weights.retrieved;
export const INGREDIENTS = weights.items;
export const GAS_MARK_URL = "https://en.wikipedia.org/wiki/Gas_mark";
export const SHOE_URL = "https://en.wikipedia.org/wiki/Shoe_size";
export const RING_URL = "https://en.wikipedia.org/wiki/Ring_size";
export const NIST_SP811_URL = "https://www.nist.gov/pml/special-publication-811";
export const KITCHEN_RETRIEVED = "2026-10-24";

export const ML_PER_CUP = 236.5882365;

export type VolUnit = "cup" | "tbsp" | "tsp" | "ml";
const CUPS_PER: Record<VolUnit, number> = { cup: 1, tbsp: 1 / 16, tsp: 1 / 48, ml: 1 / ML_PER_CUP };

export interface GramsCupsResult {
  gPerCup: number;
  grams: number;
  cups: number;
  tbsp: number;
  tsp: number;
  ml: number;
  ounces: number;
  listed: string;
  listedGrams: number;
}

export function gramsCups(ingredient: string, amount: number, from: "g" | "oz" | VolUnit): GramsCupsResult {
  const item = INGREDIENTS.find((i) => i.name === ingredient);
  if (!item) throw new ToolError("bad-input", "Pick an ingredient from the list.");
  if (!Number.isFinite(amount) || amount <= 0) throw new ToolError("bad-input", "Enter the amount as a positive number.");
  if (amount > 100_000) throw new ToolError("bad-input", "That amount is too large for a kitchen conversion.");
  const grams = from === "g" ? amount : from === "oz" ? amount * 28.349523125 : amount * CUPS_PER[from] * item.gPerCup;
  const cups = grams / item.gPerCup;
  return { gPerCup: item.gPerCup, grams, cups, tbsp: cups * 16, tsp: cups * 48, ml: cups * ML_PER_CUP, ounces: grams / 28.349523125, listed: item.listed, listedGrams: item.grams };
}

/** Nearest kitchen fraction: 1 1/3 cups etc. Eighths and thirds. */
export function kitchenFraction(x: number): string {
  if (!Number.isFinite(x) || x <= 0) return "0";
  const whole = Math.floor(x + 1e-9);
  const frac = x - whole;
  const cands: [number, string][] = [[0, ""], [1 / 8, "1/8"], [1 / 4, "1/4"], [1 / 3, "1/3"], [3 / 8, "3/8"], [1 / 2, "1/2"], [5 / 8, "5/8"], [2 / 3, "2/3"], [3 / 4, "3/4"], [7 / 8, "7/8"], [1, ""]];
  let best = cands[0];
  for (const c of cands) if (Math.abs(c[0] - frac) < Math.abs(best[0] - frac)) best = c;
  const w = best[0] === 1 ? whole + 1 : whole;
  if (!best[1]) return String(w);
  return w ? `${w} ${best[1]}` : best[1];
}

export const GAS_MARKS: readonly (readonly [string, number])[] = [
  ["1/4", 225], ["1/2", 250], ["1", 275], ["2", 300], ["3", 325], ["4", 350], ["5", 375], ["6", 400], ["7", 425], ["8", 450], ["9", 475], ["10", 500],
];

export const fToC = (f: number) => ((f - 32) * 5) / 9;
export const cToF = (c: number) => (c * 9) / 5 + 32;

export interface OvenResult {
  f: number;
  c: number;
  /** Nearest gas mark and how far the temperature is from it, in F. */
  gasMark: string;
  gasMarkF: number;
  offF: number;
}

export function ovenTemp(value: number, from: "F" | "C" | "gas"): OvenResult {
  let f: number;
  if (from === "gas") {
    const g = GAS_MARKS.find(([m]) => m === String(value) || Number(eval0(m)) === value);
    if (!g) throw new ToolError("bad-input", "Pick a gas mark from 1/4 to 10.");
    f = g[1];
  } else {
    if (!Number.isFinite(value)) throw new ToolError("bad-input", "Enter a temperature.");
    f = from === "F" ? value : cToF(value);
  }
  if (f < 100 || f > 1000) throw new ToolError("bad-input", "That is outside normal oven temperatures (100-1000 F / 38-538 C).");
  let best = GAS_MARKS[0];
  for (const m of GAS_MARKS) if (Math.abs(m[1] - f) < Math.abs(best[1] - f)) best = m;
  return { f, c: fToC(f), gasMark: best[0], gasMarkF: best[1], offF: f - best[1] };
}

function eval0(m: string): number {
  const [a, b] = m.split("/").map(Number);
  return b ? a / b : a;
}

const UNICODE_FRACTIONS: Record<string, string> = { "½": "1/2", "⅓": "1/3", "⅔": "2/3", "¼": "1/4", "¾": "3/4", "⅛": "1/8", "⅜": "3/8", "⅝": "5/8", "⅞": "7/8" };

/** Leading quantity of a recipe line: "1 1/2 cups flour", "2-3 eggs", "½ tsp salt", "250 g butter". */
export function parseQuantity(line: string): { qty: number; qty2: number | null; rest: string } | null {
  let s = line.trim();
  for (const [u, a] of Object.entries(UNICODE_FRACTIONS)) s = s.replace(new RegExp(`(\\d)${u}`, "g"), `$1 ${a}`).replace(new RegExp(u, "g"), a);
  const num = String.raw`(\d+\s+\d+/\d+|\d+/\d+|\d+(?:\.\d+)?)`;
  const m = new RegExp(String.raw`^${num}(?:\s*(?:-|–|to)\s*${num})?\s*(.*)$`).exec(s);
  if (!m) return null;
  const val = (t: string) => t.trim().split(/\s+/).reduce((acc, p) => acc + eval0(p), 0);
  return { qty: val(m[1]), qty2: m[2] ? val(m[2]) : null, rest: m[3] };
}

export interface ScaledLine {
  original: string;
  scaled: string;
  changed: boolean;
}

export function scaleRecipe(text: string, factor: number): ScaledLine[] {
  if (!Number.isFinite(factor) || factor <= 0 || factor > 100) throw new ToolError("bad-input", "The scale factor should be between 0 and 100.");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) throw new ToolError("bad-input", "Paste or type at least one ingredient line.");
  const show = (x: number, metric: boolean) => (metric ? String(Math.round(x * 10) / 10) : kitchenFraction(x));
  return lines.map((original) => {
    const q = parseQuantity(original);
    if (!q) return { original, scaled: original, changed: false };
    const metric = /^(g|kg|ml|l|grams?|millilit|litre|liter)\b/i.test(q.rest.trim()) || /\./.test(original.split(/\s/)[0]);
    const a = show(q.qty * factor, metric);
    const b = q.qty2 !== null ? `-${show(q.qty2 * factor, metric)}` : "";
    return { original, scaled: `${a}${b} ${q.rest}`.trim(), changed: true };
  });
}

export type ShoeSystem = "us-men" | "us-women" | "uk" | "eu" | "mondo";

export interface ShoeResult {
  footMm: number;
  footIn: number;
  usMen: number;
  usWomen: number;
  uk: number;
  eu: number;
  mondo: number;
}

const half = (x: number) => Math.round(x * 2) / 2;

/** Foot length (mm) from a size in any system. */
export function footFromSize(size: number, sys: ShoeSystem): number {
  switch (sys) {
    case "eu":
      return (20 / 3) * (size - 2);
    case "uk":
      return (25.4 / 3) * (size + 23);
    case "us-men":
      return (25.4 / 3) * (size - 1 + 23);
    case "us-women":
      return (25.4 / 3) * (size - 2 + 23);
    case "mondo":
      return size;
  }
}

export function shoeSizes(value: number, from: ShoeSystem | "foot-cm" | "foot-in"): ShoeResult {
  if (!Number.isFinite(value) || value <= 0) throw new ToolError("bad-input", "Enter a size or foot length.");
  const footMm = from === "foot-cm" ? value * 10 : from === "foot-in" ? value * 25.4 : footFromSize(value, from);
  if (footMm < 180 || footMm > 340) throw new ToolError("bad-input", "That is outside adult sizes (foot length about 18-34 cm). Children's sizes use different zero points.");
  const uk = (3 / 25.4) * footMm - 23;
  return { footMm, footIn: footMm / 25.4, usMen: half(uk + 1), usWomen: half(uk + 2), uk: half(uk), eu: half((3 / 20) * footMm + 2), mondo: Math.round(footMm / 5) * 5 };
}

export type RingSystem = "us" | "uk" | "iso" | "diameter" | "swiss";

export interface RingResult {
  circumference: number;
  diameter: number;
  us: number;
  uk: string;
  iso: number;
  swiss: number;
  germany: number;
}

const UK_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** UK letter from circumference: C = 40 mm, 1.25 mm per letter, half sizes between. Z+1.. = Z1, Z2... */
export function ukRing(circ: number): string {
  const steps = Math.round(((circ - 40) / 1.25) * 2) / 2 + 2; // index into letters, A = 0
  const whole = Math.floor(steps);
  const halfStep = steps - whole >= 0.5;
  if (whole < 0) return "below A";
  const letter = whole < 26 ? UK_LETTERS[whole] : `Z${whole - 25}`;
  return halfStep ? `${letter}½` : letter;
}

export function ringFromUk(letter: string): number {
  const s = letter.trim().toUpperCase().replace("½", ".5").replace(/\s*1\/2/, ".5");
  const m = /^([A-Z])(\d)?(\.5)?$/.exec(s);
  if (!m) throw new ToolError("bad-input", "Enter a UK size as a letter such as M or M½ (or Z1-Z4).");
  let idx = UK_LETTERS.indexOf(m[1]);
  if (m[2]) {
    if (m[1] !== "Z") throw new ToolError("bad-input", "Only Z takes a number (Z1, Z2...).");
    idx = 25 + Number(m[2]);
  }
  return 40 + (idx - 2 + (m[3] ? 0.5 : 0)) * 1.25;
}

export function ringSizes(input: string, from: RingSystem): RingResult {
  let circ: number;
  if (from === "uk") circ = ringFromUk(input);
  else {
    const v = Number(input.replace(",", "."));
    if (!Number.isFinite(v) || v <= 0) throw new ToolError("bad-input", "Enter a ring size or measurement.");
    circ = from === "us" ? 2.55 * v + 36.5 : from === "iso" ? v : from === "swiss" ? v + 40 : v * Math.PI;
  }
  if (circ < 36 || circ > 80) throw new ToolError("bad-input", "That is outside the ring sizes on the chart (inner circumference about 36-78 mm).");
  circ = Math.round(circ * 1000) / 1000; // drop float noise so 54.35 never shows as 54.3 in one place and 54.4 in another
  const us = Math.round(((circ - 36.5) / 2.55) * 4) / 4;
  return { circumference: circ, diameter: circ / Math.PI, us, uk: ukRing(circ), iso: Math.round(circ * 10) / 10, swiss: Math.round((circ - 40) * 10) / 10, germany: Math.round((circ / Math.PI) * 10) / 10 };
}
