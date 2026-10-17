import { ToolError } from "./errors";

/**
 * Water stored in a drilled well casing, and chlorine bleach for a target
 * concentration.
 *
 * Gallons per foot of casing = π × (ID ÷ 2)² × 12 ÷ 231 (ID in inches; a US
 * gallon is 231 in³, NIST Handbook 44). Water column = total depth − static
 * water level.
 *
 * Bleach: mg/L (ppm) is mass of chlorine per litre of water. With bleach of
 * P % available chlorine (taken as mass per volume, as labels state it — an
 * approximation since bleach density is slightly above 1), the bleach volume
 * for C ppm in V gallons of water is V × C ÷ (P × 10,000). The target ppm and
 * the procedure are the user's (from their state or local health department).
 */

export const WELL_RETRIEVED = "2026-10-17";

export interface WellInput {
  /** Casing inside diameter, inches. */
  casingIn: number;
  /** Total well depth from the top of the casing. */
  depth: number;
  /** Static water level: depth from the top of the casing to the water. */
  staticLevel: number;
  unit: "ft" | "m";
  /** Optional chlorination. */
  targetPpm: number | null;
  bleachPct: number;
}

export interface WellResult {
  galPerFoot: number;
  litersPerMetre: number;
  columnFt: number;
  gallons: number;
  liters: number;
  bleachGal: number | null;
  bleachCups: number | null;
  bleachMl: number | null;
}

export function wellVolume(i: WellInput): WellResult {
  if (!Number.isFinite(i.casingIn) || i.casingIn <= 0 || i.casingIn > 60) throw new ToolError("bad-input", "Enter the casing inside diameter in inches (for example 6).");
  const k = i.unit === "ft" ? 1 : 1 / 0.3048;
  if (!Number.isFinite(i.depth) || i.depth <= 0) throw new ToolError("bad-input", "Enter the total well depth.");
  if (!Number.isFinite(i.staticLevel) || i.staticLevel < 0) throw new ToolError("bad-input", "Enter the static water level (0 if the casing is full).");
  const depthFt = i.depth * k;
  const swlFt = i.staticLevel * k;
  if (depthFt > 5000) throw new ToolError("bad-input", "A well deeper than 5,000 ft looks like a unit mix-up.");
  if (swlFt >= depthFt) throw new ToolError("no-data", "The static water level is at or below the bottom of the well, so the casing holds no standing water.");
  const galPerFoot = (Math.PI * (i.casingIn / 2) ** 2 * 12) / 231;
  const columnFt = depthFt - swlFt;
  const gallons = galPerFoot * columnFt;
  let bleachGal: number | null = null;
  if (i.targetPpm !== null) {
    if (!Number.isFinite(i.targetPpm) || i.targetPpm <= 0 || i.targetPpm > 5000) throw new ToolError("bad-input", "Enter the target chlorine concentration in ppm (mg/L), or leave it blank.");
    if (!Number.isFinite(i.bleachPct) || i.bleachPct <= 0 || i.bleachPct > 15) throw new ToolError("bad-input", "Enter the bleach strength from its label (for example 6 or 8.25 percent).");
    bleachGal = (gallons * i.targetPpm) / (i.bleachPct * 10_000);
  }
  return {
    galPerFoot,
    litersPerMetre: galPerFoot * 3.785411784 / 0.3048,
    columnFt,
    gallons,
    liters: gallons * 3.785411784,
    bleachGal,
    bleachCups: bleachGal === null ? null : bleachGal * 16,
    bleachMl: bleachGal === null ? null : bleachGal * 3785.411784,
  };
}
