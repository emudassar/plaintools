import { ToolError } from "./errors";

/**
 * Standard cubic feet per minute (SCFM) <-> actual cubic feet per minute
 * (ACFM) for air, by the combined gas law: P₁V₁/T₁ = P₂V₂/T₂ (OpenStax
 * Chemistry 2e §9.2), with absolute pressure and absolute temperature:
 *   ACFM = SCFM × (P_std ÷ P_act) × (T_act ÷ T_std)
 * Dry-air ideal-gas treatment: humidity is not corrected (noted on the page).
 *
 * Reference ("standard") conditions differ between standards; there is no
 * single SCFM. Presets offered:
 *  - 14.7 psia, 68 °F — the CAGI/ASME basis quoted in the Roots "SCFM vs
 *    ACFM" guidebook (as reproduced by PD Blowers; that basis also carries 36%
 *    RH, which this dry calculation ignores)
 *  - 14.696 psia, 60 °F
 *  - custom
 * Atmospheric pressure at elevation for a gauge reading: user-entered
 * barometric pressure (psia); sea level 14.696.
 */

export const OPENSTAX_GAS_URL = "https://openstax.org/books/chemistry-2e/pages/9-2-relating-pressure-volume-amount-and-temperature-the-ideal-gas-law";
export const PDB_URL = "https://www.pdblowers.com/wp-content/uploads/2016/11/scfm_vs_acfm_with_sample_calculation_1.pdf";
export const SCFM_RETRIEVED = "2026-10-17";

export const STANDARDS = {
  cagi: { label: "14.7 psia, 68 °F (CAGI/ASME basis per Roots guidebook)", psia: 14.7, f: 68 },
  sea60: { label: "14.696 psia, 60 °F", psia: 14.696, f: 60 },
} as const;
export type StdKey = keyof typeof STANDARDS | "custom";

export interface ScfmInput {
  direction: "s2a" | "a2s";
  flow: number;
  stdPsia: number;
  stdF: number;
  /** Actual gauge pressure, psig. */
  psig: number;
  /** Barometric pressure where the air is measured, psia. */
  baroPsia: number;
  actualF: number;
}

export interface ScfmResult {
  scfm: number;
  acfm: number;
  actualPsia: number;
  ratio: number;
}

export function scfmConvert(i: ScfmInput): ScfmResult {
  if (!Number.isFinite(i.flow) || i.flow <= 0 || i.flow > 1e7) throw new ToolError("bad-input", "Enter the flow in cubic feet per minute.");
  if (!Number.isFinite(i.stdPsia) || i.stdPsia <= 0 || i.stdPsia > 30) throw new ToolError("bad-input", "Standard pressure should be an absolute pressure in psia (about 14.7).");
  if (!Number.isFinite(i.baroPsia) || i.baroPsia < 5 || i.baroPsia > 16) throw new ToolError("bad-input", "Barometric pressure should be in psia (14.696 at sea level).");
  if (!Number.isFinite(i.psig) || i.psig < -i.baroPsia || i.psig > 10_000) throw new ToolError("bad-input", "Enter the gauge pressure in psig (0 for open air).");
  for (const [v, n] of [[i.stdF, "Standard temperature"], [i.actualF, "Actual temperature"]] as const)
    if (!Number.isFinite(v) || v < -100 || v > 1000) throw new ToolError("bad-input", `${n} should be in °F.`);
  const actualPsia = i.psig + i.baroPsia;
  if (actualPsia <= 0) throw new ToolError("bad-input", "Absolute pressure must be above zero.");
  const tStd = i.stdF + 459.67;
  const tAct = i.actualF + 459.67;
  // ACFM per SCFM
  const ratio = (i.stdPsia / actualPsia) * (tAct / tStd);
  const acfm = i.direction === "s2a" ? i.flow * ratio : i.flow;
  const scfm = i.direction === "s2a" ? i.flow : i.flow / ratio;
  return { scfm, acfm, actualPsia, ratio };
}
