/**
 * USDA soil texture classification from sand/silt/clay percentages.
 *
 * Implements the 12 classes of the USDA textural triangle as defined in the
 * Soil Survey Manual (USDA Handbook 18), Chapter 3, and the Soil Science
 * Division Staff definitions used by NRCS.
 * https://www.nrcs.usda.gov/resources/education-and-teaching-materials/soil-texture-calculator
 *
 * WHY WE COMPUTE THIS OURSELVES: SSURGO's own `texdesc` field is per-horizon
 * and frequently carries a particle-size modifier ("very fine sandy loam",
 * "gravelly silt loam") that the triangle cannot produce from percentages
 * alone. We show USDA's own label as authoritative and use this function only
 * to (a) fill gaps where texdesc is absent and (b) cross-check.
 *
 * The boundary conventions below follow the NRCS Soil Texture Calculator.
 */

export const TEXTURE_CLASSES = [
  "Sand",
  "Loamy sand",
  "Sandy loam",
  "Loam",
  "Silt loam",
  "Silt",
  "Sandy clay loam",
  "Clay loam",
  "Silty clay loam",
  "Sandy clay",
  "Silty clay",
  "Clay",
] as const;

export type TextureClass = (typeof TEXTURE_CLASSES)[number];

/**
 * Returns the USDA texture class, or null if the inputs are absent or do not
 * form a usable composition. Null is a normal result, not an error — plenty of
 * SSURGO horizons have no measured particle size data.
 */
export function classifyTexture(
  sand: number | null,
  silt: number | null,
  clay: number | null,
): TextureClass | null {
  if (sand === null || silt === null || clay === null) return null;
  if (![sand, silt, clay].every((v) => Number.isFinite(v) && v >= 0)) return null;

  const total = sand + silt + clay;
  // Allow for rounding in the source data, but reject nonsense.
  if (total < 95 || total > 105) return null;

  // Normalise to exactly 100 so boundary tests are consistent.
  const s = (sand / total) * 100;
  const si = (silt / total) * 100;
  const c = (clay / total) * 100;

  if (c >= 40 && si < 40 && s <= 45) return "Clay";
  if (c >= 40 && si >= 40) return "Silty clay";
  if (c >= 35 && s > 45) return "Sandy clay";
  if (c >= 27 && c < 40 && s > 20 && s <= 45) return "Clay loam";
  if (c >= 27 && c < 40 && s <= 20) return "Silty clay loam";
  if (c >= 20 && c < 35 && si < 28 && s > 45) return "Sandy clay loam";
  if (c >= 7 && c < 27 && si >= 28 && si < 50 && s <= 52) return "Loam";
  if (si >= 50 && c >= 12 && c < 27) return "Silt loam";
  if (si >= 50 && si < 80 && c < 12) return "Silt loam";
  if (si >= 80 && c < 12) return "Silt";

  // Sand / loamy sand / sandy loam are separated by the sloping boundaries
  // silt + 1.5*clay and silt + 2*clay.
  if (c < 20) {
    if (si + 1.5 * c < 15) return "Sand";
    if (si + 2 * c < 30) return "Loamy sand";
    return "Sandy loam";
  }

  return "Sandy clay loam";
}

/**
 * A plain-language note on what the class means for water and handling.
 * Descriptive only — this is NOT advice about what to do with the soil.
 */
export const TEXTURE_NOTES: Record<TextureClass, string> = {
  Sand: "Drains very quickly and holds little water or nutrients.",
  "Loamy sand": "Drains quickly, holds slightly more water than pure sand.",
  "Sandy loam": "Drains freely while holding some moisture.",
  Loam: "A balanced mix of sand, silt and clay.",
  "Silt loam": "Holds moisture well; can form a surface crust when dry.",
  Silt: "Very high silt content; holds water and compacts easily.",
  "Sandy clay loam": "Moderate clay content with enough sand to drain.",
  "Clay loam": "Holds water well and is sticky when wet.",
  "Silty clay loam": "High silt and clay; slow to drain.",
  "Sandy clay": "High clay with substantial sand; drains slowly.",
  "Silty clay": "Very high silt and clay; drains slowly.",
  Clay: "Very high clay content; slow draining and sticky when wet.",
};
