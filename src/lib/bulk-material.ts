import { ToolError } from "./errors";

/**
 * Bulk landscape material: volume from area × depth, bags, and weight.
 *
 * Weight factors (short tons per cubic yard) are the New Mexico Energy,
 * Minerals and Natural Resources Department table "Conversion Factors for
 * Construction Materials and Common Minerals", which states it is "Adapted
 * from the BLM publication H-3890-1 Handbook for Mineral Examiners". Values are
 * copied as printed. Retrieved 2026-10-17.
 *
 * Volume: 27 ft³ per yd³; bags are sold by volume printed on the bag
 * (commonly 0.5 cu ft), so bags = ceil(ft³ ÷ bag ft³).
 */

export const NM_URL = "https://www.emnrd.nm.gov/mmd/wp-content/uploads/sites/5/ConvFctrs.pdf";
export const NM_RETRIEVED = "2026-10-17";
export const NM_SOURCE = "New Mexico EMNRD, Conversion Factors for Construction Materials (adapted from BLM Handbook H-3890-1)";

/** Short tons per cubic yard, as printed in the NM EMNRD table. */
export const NM_FACTORS = {
  "gravel-quarter-2": { label: 'Gravel ¼" – 2"', tonsPerYd: 1.42 },
  "gravel-pit-run": { label: "Gravel, pit run", tonsPerYd: 1.62 },
  sand: { label: "Sand", tonsPerYd: 1.45 },
  "base-course": { label: "Base course", tonsPerYd: 1.25 },
  limestone: { label: "Limestone", tonsPerYd: 1.3 },
  flagstone: { label: "Dimension and flagstone", tonsPerYd: 1.3 },
  riprap: { label: "Riprap / gabion", tonsPerYd: 1.05 },
  caliche: { label: "Caliche", tonsPerYd: 1.05 },
  clay: { label: "Clay and shale", tonsPerYd: 1.1 },
  "fill-dirt": { label: "Fill dirt", tonsPerYd: 0.8 },
  topsoil: { label: "Top soil", tonsPerYd: 0.8 },
  cinders: { label: "Scoria / clinker / cinders", tonsPerYd: 0.475 },
} as const;
export type NmMaterial = keyof typeof NM_FACTORS;

export type Shape = "rect" | "circle";
export type LenUnit = "ft" | "m";

export interface BulkInput {
  shape: Shape;
  /** Length & width (rect) or diameter (circle), in lenUnit. */
  a: number;
  b: number;
  lenUnit: LenUnit;
  /** Depth in inches (ft mode) or cm (m mode). */
  depth: number;
  /** Optional area override in ft² or m² (when set, shape dims ignored). */
  areaOverride: number | null;
  /** Bag volume, cubic feet. */
  bagCuFt: number;
  /** Short tons per cubic yard. */
  tonsPerYd: number;
  wastePct: number;
  /** Price per ton (bulk) — optional. */
  pricePerTon: number | null;
  /** Price per bag — optional. */
  pricePerBag: number | null;
}

export interface BulkResult {
  areaSqFt: number;
  cuFt: number;
  cuYd: number;
  cuM: number;
  tons: number;
  lbs: number;
  tonnes: number;
  bags: number;
  bulkCost: number | null;
  bagCost: number | null;
}

const FT_PER_M = 1 / 0.3048;

export function bulkMaterial(i: BulkInput): BulkResult {
  let areaSqFt: number;
  if (i.areaOverride !== null) {
    if (!Number.isFinite(i.areaOverride) || i.areaOverride <= 0) throw new ToolError("bad-input", "Enter the area as a positive number, or leave it blank.");
    areaSqFt = i.lenUnit === "ft" ? i.areaOverride : i.areaOverride * FT_PER_M * FT_PER_M;
  } else {
    const k = i.lenUnit === "ft" ? 1 : FT_PER_M;
    if (!Number.isFinite(i.a) || i.a <= 0 || (i.shape === "rect" && (!Number.isFinite(i.b) || i.b <= 0)))
      throw new ToolError("bad-input", "Enter the dimensions as positive numbers.");
    areaSqFt = i.shape === "rect" ? i.a * k * i.b * k : Math.PI * ((i.a * k) / 2) ** 2;
  }
  if (areaSqFt > 2_000_000) throw new ToolError("bad-input", "That area is over 45 acres. Check the unit.");
  if (!Number.isFinite(i.depth) || i.depth <= 0) throw new ToolError("bad-input", `Enter the depth in ${i.lenUnit === "ft" ? "inches" : "centimetres"}.`);
  const depthFt = i.lenUnit === "ft" ? i.depth / 12 : (i.depth / 100) * FT_PER_M;
  if (depthFt > 10) throw new ToolError("bad-input", "A depth over 10 ft looks like a unit mix-up.");
  if (!Number.isFinite(i.wastePct) || i.wastePct < 0 || i.wastePct > 100) throw new ToolError("bad-input", "Extra allowance should be between 0 and 100 percent.");
  if (!Number.isFinite(i.bagCuFt) || i.bagCuFt <= 0 || i.bagCuFt > 100) throw new ToolError("bad-input", "Enter the bag size in cubic feet (for example 0.5).");
  if (!Number.isFinite(i.tonsPerYd) || i.tonsPerYd <= 0 || i.tonsPerYd > 5) throw new ToolError("bad-input", "Weight per cubic yard should be between 0 and 5 tons.");
  for (const p of [i.pricePerTon, i.pricePerBag]) if (p !== null && (!Number.isFinite(p) || p < 0)) throw new ToolError("bad-input", "Prices must be positive numbers, or blank.");

  const cuFt = areaSqFt * depthFt * (1 + i.wastePct / 100);
  const cuYd = cuFt / 27;
  const tons = cuYd * i.tonsPerYd;
  const bags = Math.ceil(cuFt / i.bagCuFt - 1e-9);
  return {
    areaSqFt,
    cuFt,
    cuYd,
    cuM: cuFt * 0.028316846592,
    tons,
    lbs: tons * 2000,
    tonnes: tons * 0.90718474,
    bags,
    bulkCost: i.pricePerTon === null ? null : tons * i.pricePerTon,
    bagCost: i.pricePerBag === null ? null : bags * i.pricePerBag,
  };
}

/** Cubic yards <-> short tons with a factor; also metric. */
export function yardsToTons(cuYd: number, tonsPerYd: number) {
  if (!Number.isFinite(cuYd) || cuYd <= 0) throw new ToolError("bad-input", "Enter the amount as a positive number.");
  if (!Number.isFinite(tonsPerYd) || tonsPerYd <= 0 || tonsPerYd > 5) throw new ToolError("bad-input", "Weight per cubic yard should be between 0 and 5 tons.");
  const tons = cuYd * tonsPerYd;
  return { cuYd, tons, lbs: tons * 2000, tonnes: tons * 0.90718474, cuM: cuYd * 0.764554857984 };
}

export function tonsToYards(tons: number, tonsPerYd: number) {
  if (!Number.isFinite(tons) || tons <= 0) throw new ToolError("bad-input", "Enter the amount as a positive number.");
  if (!Number.isFinite(tonsPerYd) || tonsPerYd <= 0 || tonsPerYd > 5) throw new ToolError("bad-input", "Weight per cubic yard should be between 0 and 5 tons.");
  const cuYd = tons / tonsPerYd;
  return { cuYd, tons, lbs: tons * 2000, tonnes: tons * 0.90718474, cuM: cuYd * 0.764554857984 };
}
