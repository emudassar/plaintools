import { ToolError } from "./errors";

/**
 * Hydraulic cylinder force.
 *
 * Pressure is force per unit area, P = F ÷ A (OpenStax College Physics 2e
 * §11.3 "Pressure"), so F = P × A.
 *  - extend (push): A = π × bore² ÷ 4
 *  - retract (pull): A = π × (bore² − rod²) ÷ 4 (the rod takes up area)
 * Units: psi × in² = lbf; bar → psi ×14.5038; 1 lbf = 4.448222 N;
 * 1 short ton-force = 2,000 lbf; 1 tonne-force = 1,000 kgf = 9,806.65 N.
 * Optional: pressure needed for a target force (inverse).
 */

export const OPENSTAX_PRESSURE_URL = "https://openstax.org/books/college-physics-2e/pages/11-3-pressure";
export const HYD_RETRIEVED = "2026-10-17";
const PSI_PER_BAR = 14.5037738;
const N_PER_LBF = 4.4482216152605;

export interface CylInput {
  /** Bore and rod diameters, inches or mm. */
  bore: number;
  rod: number;
  unit: "in" | "mm";
  pressure: number;
  pressureUnit: "psi" | "bar";
  /** Optional cylinders working together. */
  cylinders: number;
}

export interface CylResult {
  boreAreaIn2: number;
  annulusAreaIn2: number;
  pushLbf: number;
  pullLbf: number;
  pushN: number;
  pullN: number;
  pushTons: number;
  pullTons: number;
  pushTonnes: number;
  pullTonnes: number;
}

export function cylinderForce(i: CylInput): CylResult {
  const toIn = i.unit === "in" ? 1 : 1 / 25.4;
  const bore = i.bore * toIn;
  const rod = i.rod * toIn;
  if (!Number.isFinite(bore) || bore <= 0 || bore > 60) throw new ToolError("bad-input", `Enter the bore diameter in ${i.unit === "in" ? "inches" : "mm"}.`);
  if (!Number.isFinite(rod) || rod < 0) throw new ToolError("bad-input", "Enter the rod diameter (0 if you only need push force).");
  if (rod >= bore) throw new ToolError("bad-input", "The rod must be smaller than the bore.");
  if (!Number.isFinite(i.pressure) || i.pressure <= 0 || i.pressure > 100_000) throw new ToolError("bad-input", "Enter the working pressure.");
  if (!Number.isInteger(i.cylinders) || i.cylinders < 1 || i.cylinders > 100) throw new ToolError("bad-input", "Number of cylinders should be a whole number of at least 1.");
  const psi = i.pressureUnit === "psi" ? i.pressure : i.pressure * PSI_PER_BAR;
  const boreAreaIn2 = (Math.PI * bore * bore) / 4;
  const annulusAreaIn2 = (Math.PI * (bore * bore - rod * rod)) / 4;
  const pushLbf = psi * boreAreaIn2 * i.cylinders;
  const pullLbf = psi * annulusAreaIn2 * i.cylinders;
  const tonne = 9806.65;
  return {
    boreAreaIn2,
    annulusAreaIn2,
    pushLbf,
    pullLbf,
    pushN: pushLbf * N_PER_LBF,
    pullN: pullLbf * N_PER_LBF,
    pushTons: pushLbf / 2000,
    pullTons: pullLbf / 2000,
    pushTonnes: (pushLbf * N_PER_LBF) / tonne,
    pullTonnes: (pullLbf * N_PER_LBF) / tonne,
  };
}

/** Pressure (psi) needed to push a target force (lbf) with a bore (in). */
export function pressureFor(forceLbf: number, boreIn: number, cylinders = 1) {
  if (!Number.isFinite(forceLbf) || forceLbf <= 0) throw new ToolError("bad-input", "Enter the force needed.");
  if (!Number.isFinite(boreIn) || boreIn <= 0) throw new ToolError("bad-input", "Enter the bore.");
  return forceLbf / (((Math.PI * boreIn * boreIn) / 4) * cylinders);
}
