import { ToolError } from "./errors";

/**
 * Pool chemical dose factors, shared by the shock, muriatic acid, alkalinity
 * and stabilizer tools.
 *
 * Source: Indiana Department of Health, "Adjusting Chemical Levels in a
 * Swimming Pool", Water Chemistry Adjustment Guide (page 6). The guide states
 * its table "was adapted from the National Swimming Pool Foundation Pool & Spa
 * Operator Handbook" and that "Chemical amounts have been rounded off."
 * Retrieved 2026-10-04 from
 *   https://www.in.gov/health/eph/files/Chemical_adjustment_pool.pdf
 *
 * The same document gives the scaling rule every tool here uses (page 1):
 *
 *   Total = amount from table x (pool gallons / 10,000) x (ppm change / table ppm)
 *
 * and, for products not in the table (page 2), a per-ppm amount for 10,000
 * gallons of 0.083 lb divided by the available fraction for solids, or 1.3 fl oz
 * divided by the available fraction for liquids.
 *
 * The table's PDF text layer is laid out in columns; every value below was
 * read off it and then checked against the document's own formula where one
 * applies (e.g. 0.083 lb / 0.67 = 1.98 oz for 67% calcium hypochlorite, table
 * says 2 oz; 1.3 / 0.12 = 10.8 fl oz for 12% sodium hypochlorite, table 10.7).
 *
 * No network request.
 */

export const DOSING_RETRIEVED = "2026-10-04";
export const DOSING_SOURCE_URL = "https://www.in.gov/health/eph/files/Chemical_adjustment_pool.pdf";
export const DOSING_SOURCE_NAME =
  "Indiana Department of Health, Adjusting Chemical Levels in a Swimming Pool (Water Chemistry Adjustment Guide, adapted from the NSPF Pool & Spa Operator Handbook)";

export const GALLONS_PER_LITRE = 1 / 3.785411784;

/** "wt" amounts are in ounces by weight; "vol" amounts are in US fluid ounces. */
export type Measure = "wt" | "vol";

export interface DoseFactor {
  id: string;
  label: string;
  measure: Measure;
  /** Amount for 10,000 gallons at `perPpm` ppm change, in oz (wt) or fl oz (vol). */
  amount: number;
  perPpm: number;
  /** The table cell exactly as printed, for display. */
  printed: string;
}

/** Increase free chlorine — "1 ppm" column. */
export const CHLORINE: readonly DoseFactor[] = [
  { id: "calhypo67", label: "Calcium hypochlorite (67%)", measure: "wt", amount: 2, perPpm: 1, printed: "2 oz" },
  { id: "sodhypo12", label: "Sodium hypochlorite / liquid chlorine (12%)", measure: "vol", amount: 10.7, perPpm: 1, printed: "10.7 fl.oz." },
  { id: "lithium", label: "Lithium hypochlorite", measure: "wt", amount: 3.8, perPpm: 1, printed: "3.8 oz." },
  { id: "dichlor62", label: "Dichlor (62%)", measure: "wt", amount: 2.1, perPpm: 1, printed: "2.1 oz" },
  { id: "dichlor56", label: "Dichlor (56%)", measure: "wt", amount: 2.4, perPpm: 1, printed: "2.4 oz" },
  { id: "trichlor", label: "Trichlor", measure: "wt", amount: 1.5, perPpm: 1, printed: "1.5 oz" },
];

/** Increase total alkalinity — "10 ppm" column. */
export const ALKALINITY_UP: readonly DoseFactor[] = [
  { id: "bicarb", label: "Sodium bicarbonate (baking soda)", measure: "wt", amount: 1.4 * 16, perPpm: 10, printed: "1.4 lbs" },
  { id: "carbonate", label: "Sodium carbonate (soda ash)", measure: "wt", amount: 0.9 * 16, perPpm: 10, printed: "0.9 lbs" },
  { id: "sesqui", label: "Sodium sesquicarbonate", measure: "wt", amount: 1.25 * 16, perPpm: 10, printed: "1.25 lbs" },
];

/** Decrease total alkalinity — "10 ppm" column. */
export const ALKALINITY_DOWN: readonly DoseFactor[] = [
  { id: "muriatic", label: "Muriatic acid (31.4%)", measure: "vol", amount: 26, perPpm: 10, printed: "26 fl.oz." },
  { id: "bisulfate", label: "Sodium bisulfate (dry acid)", measure: "wt", amount: 2.1 * 16, perPpm: 10, printed: "2.1 lbs" },
];

/** Increase stabilizer — "10 ppm" column. */
export const STABILIZER: DoseFactor = {
  id: "cya",
  label: "Cyanuric acid",
  measure: "wt",
  amount: 13,
  perPpm: 10,
  printed: "13 oz",
};

export function toGallons(volume: number, unit: "gal" | "l"): number {
  return unit === "gal" ? volume : volume * GALLONS_PER_LITRE;
}

/** The document's own scaling rule. Returns oz (wt) or fl oz (vol). */
export function scaleDose(f: DoseFactor, gallons: number, ppmChange: number): number {
  return f.amount * (gallons / 10_000) * (ppmChange / f.perPpm);
}

export function validateVolume(volume: number, unit: "gal" | "l"): number {
  if (!Number.isFinite(volume)) throw new ToolError("bad-input", "Pool volume must be a number.");
  if (volume <= 0) throw new ToolError("bad-input", "Enter the pool volume — it must be more than zero.");
  const g = toGallons(volume, unit);
  if (g > 2_000_000) {
    throw new ToolError("bad-input", "That volume is larger than any residential or commercial pool. Check the units.");
  }
  return g;
}

export function validatePpm(label: string, v: number, max: number): void {
  if (!Number.isFinite(v)) throw new ToolError("bad-input", `${label} must be a number.`);
  if (v < 0) throw new ToolError("bad-input", `${label} cannot be negative.`);
  if (v > max) throw new ToolError("bad-input", `${label} above ${max} ppm is outside what a pool test kit reads. Check the figure.`);
}

/** Human amount: weight in oz/lb, volume in fl oz/quarts/gallons. */
export function formatAmount(amount: number, measure: Measure): string {
  const n = (x: number, d: number) =>
    x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: 0 });
  if (measure === "wt") {
    if (amount < 16) return `${n(amount, 1)} oz`;
    return `${n(amount / 16, 2)} lb (${n(amount, 0)} oz)`;
  }
  if (amount < 32) return `${n(amount, 1)} fl oz`;
  const plural = (v: number, one: string, many: string) => (n(v, 2) === "1" ? one : many);
  if (amount < 128)
    return `${n(amount / 32, 2)} ${plural(amount / 32, "quart", "quarts")} (${n(amount, 0)} fl oz)`;
  return `${n(amount / 128, 2)} ${plural(amount / 128, "gallon", "gallons")} (${n(amount, 0)} fl oz)`;
}

/** Metric companion: grams or millilitres. */
export function formatMetric(amount: number, measure: Measure): string {
  if (measure === "wt") {
    const g = amount * 28.349523125;
    return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${Math.round(g)} g`;
  }
  const ml = amount * 29.5735295625;
  return ml >= 1000 ? `${(ml / 1000).toFixed(2)} L` : `${Math.round(ml)} mL`;
}
