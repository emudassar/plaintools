import { ToolError } from "./errors";

/**
 * Dilution ratios (parts) and C1V1 = C2V2 (concentrations).
 *
 * Ratio "1:N" is read two ways in practice, so the user picks:
 *  - "parts": 1 part concentrate + N parts water (total 1 + N parts)
 *  - "total": 1 part concentrate in N total parts (water = N − 1)
 * concentrate = final volume ÷ total parts; water = final − concentrate.
 *
 * C1V1 = C2V2 is the conservation of the amount of solute (see e.g. OpenStax
 * Chemistry 2e §3.3 "Molarity", Dilution of Solutions). For alcohol (ABV) it is
 * a volume approximation: mixing ethanol and water shrinks the total volume,
 * so the made-up volume is slightly less than V1 + water.
 */

export const OPENSTAX_DILUTION_URL = "https://openstax.org/books/chemistry-2e/pages/3-3-molarity";
export const DILUTION_RETRIEVED = "2026-10-17";
/** 26 U.S.C. 5002(a)(10): proof spirits contain "one-half its volume of ethyl alcohol" -> proof = 2 × ABV. */
export const PROOF_URL = "https://www.law.cornell.edu/uscode/text/26/5002";

export const VOLUME_UNITS = {
  floz: { label: "US fl oz", ml: 29.5735295625 },
  cup: { label: "US cups", ml: 236.5882365 },
  qt: { label: "US quarts", ml: 946.352946 },
  gal: { label: "US gallons", ml: 3785.411784 },
  ml: { label: "millilitres", ml: 1 },
  l: { label: "litres", ml: 1000 },
} as const;
export type VolUnit = keyof typeof VOLUME_UNITS;

export const toMl = (v: number, u: VolUnit) => v * VOLUME_UNITS[u].ml;
export const fromMl = (ml: number, u: VolUnit) => ml / VOLUME_UNITS[u].ml;

export interface RatioInput {
  /** N in 1:N. */
  n: number;
  reading: "parts" | "total";
  /** What the user knows: the final amount, or the concentrate on hand. */
  known: "final" | "concentrate";
  amount: number;
  unit: VolUnit;
}

export interface RatioResult {
  totalParts: number;
  concentrateMl: number;
  waterMl: number;
  finalMl: number;
  percentConcentrate: number;
  /** fl oz of concentrate per US gallon of finished mix. */
  ozPerGallon: number;
}

export function dilutionRatio(i: RatioInput): RatioResult {
  if (!Number.isFinite(i.n) || i.n <= 0 || i.n > 100_000) throw new ToolError("bad-input", "Enter the N in 1:N as a positive number (for example 10 for 1:10).");
  if (i.reading === "total" && i.n <= 1) throw new ToolError("bad-input", 'Read as "1 in N total", N must be more than 1.');
  if (!Number.isFinite(i.amount) || i.amount <= 0 || i.amount > 1e9) throw new ToolError("bad-input", "Enter the amount as a positive number.");
  const totalParts = i.reading === "parts" ? 1 + i.n : i.n;
  const amountMl = toMl(i.amount, i.unit);
  const concentrateMl = i.known === "final" ? amountMl / totalParts : amountMl;
  const finalMl = concentrateMl * totalParts;
  return {
    totalParts,
    concentrateMl,
    waterMl: finalMl - concentrateMl,
    finalMl,
    percentConcentrate: 100 / totalParts,
    ozPerGallon: 128 / totalParts,
  };
}

export interface C1V1Input {
  /** Starting strength (any consistent unit: % ABV, proof, mg/ml…). */
  c1: number;
  c2: number;
  /** What the user knows. */
  known: "v1" | "v2";
  amount: number;
  unit: VolUnit;
}

export function c1v1(i: C1V1Input) {
  if (!Number.isFinite(i.c1) || i.c1 <= 0) throw new ToolError("bad-input", "Enter the starting strength as a positive number.");
  if (!Number.isFinite(i.c2) || i.c2 <= 0) throw new ToolError("bad-input", "Enter the target strength as a positive number.");
  if (i.c2 >= i.c1) throw new ToolError("bad-input", "The target must be weaker than the starting strength — adding water can only lower it.");
  if (!Number.isFinite(i.amount) || i.amount <= 0 || i.amount > 1e9) throw new ToolError("bad-input", "Enter the amount as a positive number.");
  const ml = toMl(i.amount, i.unit);
  const v1 = i.known === "v1" ? ml : (i.c2 * ml) / i.c1;
  const v2 = i.known === "v2" ? ml : (i.c1 * ml) / i.c2;
  return { v1Ml: v1, v2Ml: v2, waterMl: v2 - v1, factor: i.c1 / i.c2 };
}
