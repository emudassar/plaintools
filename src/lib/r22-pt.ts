import { ToolError } from "./errors";

/**
 * R-22 saturation pressure-temperature data.
 *
 * Source: NIST Chemistry WebBook, NIST Standard Reference Database 69,
 * "Thermophysical Properties of Fluid Systems", Methane, chlorodifluoro- (R22),
 * CAS 75-45-6, saturation properties (temperature increments), -40 to 150 F
 * in 1 F steps, pressure in psia. Retrieved 2026-10-04 from
 *   https://webbook.nist.gov/cgi/fluid.cgi?ID=C75456&Action=Page
 *
 * Cross-check: the iGas USA "R22 Pressure-Temperature Chart" (psig) agrees with
 * these values minus 14.696 psi to within 0.05 psi at -40, -30, -20, 1, 10,
 * 51, 60, 101, 110, 120 and 130 F (e.g. 40 F -> 68.6 psig, 100 F -> 195.9).
 *
 * R-22 is a single-component refrigerant, so bubble and dew point coincide:
 * one saturation pressure per temperature. Gauge pressure here assumes a
 * standard atmosphere of 14.696 psia (sea level).
 */

export const R22_RETRIEVED = "2026-10-04";
export const NIST_R22_URL =
  "https://webbook.nist.gov/cgi/fluid.cgi?ID=C75456&Action=Page";
export const T_MIN_F = -40;
export const T_MAX_F = 150;
export const ATM_PSIA = 14.696;
const PSI_TO_KPA = 6.894757293168;

/** Saturation pressure, psia, for T_MIN_F + index (1 F steps). */
export const PSIA: readonly number[] = [
  15.262, 15.661, 16.067, 16.482, 16.904, 17.336, 17.776, 18.225, 18.682,
  19.149, 19.624, 20.109, 20.603, 21.106, 21.62, 22.142, 22.675, 23.217, 23.77,
  24.332, 24.905, 25.489, 26.083, 26.687, 27.303, 27.929, 28.567, 29.215,
  29.875, 30.547, 31.23, 31.925, 32.631, 33.35, 34.081, 34.824, 35.579, 36.347,
  37.128, 37.922, 38.728, 39.548, 40.38, 41.227, 42.086, 42.959, 43.847, 44.748,
  45.663, 46.592, 47.536, 48.494, 49.467, 50.454, 51.457, 52.475, 53.508,
  54.556, 55.62, 56.699, 57.794, 58.906, 60.033, 61.177, 62.337, 63.514, 64.707,
  65.917, 67.144, 68.389, 69.651, 70.93, 72.227, 73.541, 74.874, 76.225, 77.593,
  78.981, 80.387, 81.811, 83.255, 84.717, 86.199, 87.7, 89.221, 90.761, 92.321,
  93.901, 95.501, 97.122, 98.763, 100.42, 102.11, 103.81, 105.53, 107.28,
  109.05, 110.84, 112.65, 114.48, 116.33, 118.21, 120.11, 122.03, 123.98,
  125.94, 127.93, 129.95, 131.99, 134.05, 136.13, 138.24, 140.37, 142.53,
  144.71, 146.92, 149.15, 151.41, 153.69, 155.99, 158.33, 160.68, 163.07,
  165.48, 167.91, 170.38, 172.87, 175.38, 177.92, 180.49, 183.09, 185.72,
  188.37, 191.05, 193.76, 196.49, 199.26, 202.05, 204.88, 207.73, 210.61,
  213.52, 216.46, 219.43, 222.43, 225.46, 228.51, 231.61, 234.73, 237.88,
  241.06, 244.28, 247.52, 250.8, 254.11, 257.45, 260.83, 264.23, 267.67, 271.14,
  274.65, 278.19, 281.76, 285.37, 289.01, 292.68, 296.39, 300.14, 303.92,
  307.73, 311.58, 315.47, 319.39, 323.34, 327.34, 331.37, 335.43, 339.54,
  343.68, 347.86, 352.08, 356.33, 360.62, 364.95, 369.32, 373.73, 378.18,
  382.67, 387.2, 391.77, 396.38,
];

export type TempUnit = "F" | "C";
export type PressUnit = "psig" | "psia" | "kPa" | "bar";

export function fToC(f: number): number {
  return ((f - 32) * 5) / 9;
}
export function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}

/** Linear interpolation on the 1 F table. */
export function psiaAtF(f: number): number {
  if (f < T_MIN_F || f > T_MAX_F)
    throw new ToolError(
      "no-data",
      `The table covers ${T_MIN_F}°F to ${T_MAX_F}°F.`,
    );
  const x = f - T_MIN_F;
  const i = Math.min(Math.floor(x), PSIA.length - 2);
  const t = x - i;
  return PSIA[i] + (PSIA[i + 1] - PSIA[i]) * t;
}

/** Inverse lookup: saturation temperature (F) for an absolute pressure. */
export function fAtPsia(psia: number): number {
  if (psia < PSIA[0] || psia > PSIA[PSIA.length - 1]) {
    throw new ToolError(
      "no-data",
      `That pressure is outside the table, which covers ${T_MIN_F}°F to ${T_MAX_F}°F (${(PSIA[0] - ATM_PSIA).toFixed(1)} to ${(PSIA[PSIA.length - 1] - ATM_PSIA).toFixed(1)} psig).`,
    );
  }
  let i = 0;
  while (i < PSIA.length - 2 && PSIA[i + 1] < psia) i++;
  return T_MIN_F + i + (psia - PSIA[i]) / (PSIA[i + 1] - PSIA[i]);
}

export function toPsia(value: number, unit: PressUnit): number {
  switch (unit) {
    case "psig":
      return value + ATM_PSIA;
    case "psia":
      return value;
    case "kPa":
      return value / PSI_TO_KPA + ATM_PSIA; // kPa gauge
    case "bar":
      return (value * 100) / PSI_TO_KPA + ATM_PSIA; // bar gauge
  }
}

export interface Pressures {
  psig: number;
  psia: number;
  kPaG: number;
  barG: number;
}

export function pressuresFromPsia(psia: number): Pressures {
  const g = psia - ATM_PSIA;
  return { psig: g, psia, kPaG: g * PSI_TO_KPA, barG: (g * PSI_TO_KPA) / 100 };
}

export type R22Query =
  | { kind: "temp"; value: number; unit: TempUnit }
  | { kind: "pressure"; value: number; unit: PressUnit };

export interface R22Result {
  tempF: number;
  tempC: number;
  pressures: Pressures;
  query: R22Query;
  retrievedAt: string;
}

export function lookupR22(q: R22Query): R22Result {
  if (!Number.isFinite(q.value))
    throw new ToolError("bad-input", "Enter a number.");
  let tempF: number;
  let psia: number;
  if (q.kind === "temp") {
    tempF = q.unit === "F" ? q.value : cToF(q.value);
    psia = psiaAtF(tempF);
  } else {
    psia = toPsia(q.value, q.unit);
    if (psia <= 0)
      throw new ToolError(
        "bad-input",
        "That is below a perfect vacuum. Check the units.",
      );
    tempF = fAtPsia(psia);
  }
  return {
    tempF,
    tempC: fToC(tempF),
    pressures: pressuresFromPsia(psia),
    query: q,
    retrievedAt: R22_RETRIEVED,
  };
}
