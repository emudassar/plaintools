import { ToolError } from "./errors";

/**
 * DC voltage drop in copper or aluminium wire.
 *
 * Copper constants: NBS Handbook 100, "Copper Wire Tables" (1966, NIST):
 * annealed copper standard resistivity 10.371 ohm-circular mil/ft at 20 °C
 * (1.7241 microhm-cm), temperature coefficient 0.00393 per °C at 20 °C. AWG:
 * "the diameter of No. 0000 is defined as 0.4600 inch and of No. 36 as 0.0050
 * inch", with 38 sizes between in geometric progression, so
 * d(n) = 0.005 in × 92^((36 − n) / 39). Check vs the Handbook's table at
 * 20 °C: No. 10 = 0.9988 ohm/1000 ft, No. 6 = 0.3952, No. 4/0 = 0.04901.
 *
 * Copper only: the Handbook is a copper standard, so aluminium is not offered.
 *
 * Two-wire DC circuit: drop = I × R per foot × 2 × one-way length.
 */

export const NBS100_URL = "https://nvlpubs.nist.gov/nistpubs/Legacy/hb/nbshandbook100.pdf";
export const VDROP_RETRIEVED = "2026-10-17";

export const AWG_SIZES = ["4/0", "3/0", "2/0", "1/0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "24", "26", "28", "30"] as const;
export type Awg = (typeof AWG_SIZES)[number];

export function awgNumber(g: Awg): number {
  if (g.includes("/0")) return 1 - Number(g.split("/")[0]);
  return Number(g);
}

/** Diameter in inches. */
export function awgDiameterIn(g: Awg): number {
  return 0.005 * 92 ** ((36 - awgNumber(g)) / 39);
}

export function circularMils(g: Awg): number {
  const mils = awgDiameterIn(g) * 1000;
  return mils * mils;
}

/** Copper ohms per 1000 ft at temperature T °C. */
export function copperOhmsPer1000(g: Awg, tempC = 20): number {
  const r20 = (10.371 * 1000) / circularMils(g);
  return r20 * (1 + 0.00393 * (tempC - 20));
}

export interface VdropInput {
  volts: number;
  amps: number;
  /** One-way length of the run. */
  length: number;
  lengthUnit: "ft" | "m";
  gauge: Awg;
  tempC: number;
  /** Max acceptable drop, % — used to find the smallest gauge. */
  maxPct: number;
}

export interface VdropResult {
  ohmsPer1000: number;
  loopOhms: number;
  dropV: number;
  dropPct: number;
  loadV: number;
  powerLossW: number;
  diameterIn: number;
  areaMm2: number;
  /** Smallest gauge (largest AWG number) meeting maxPct, or null if none in the list. */
  smallestOk: Awg | null;
  smallestOkDropPct: number | null;
}

export function dcVoltageDrop(i: VdropInput): VdropResult {
  if (!Number.isFinite(i.volts) || i.volts <= 0 || i.volts > 1500) throw new ToolError("bad-input", "Enter the supply voltage (for example 12, 24 or 48).");
  if (!Number.isFinite(i.amps) || i.amps <= 0 || i.amps > 5000) throw new ToolError("bad-input", "Enter the current in amps.");
  if (!Number.isFinite(i.length) || i.length <= 0 || i.length > 100_000) throw new ToolError("bad-input", "Enter the one-way length of the run.");
  if (!Number.isFinite(i.tempC) || i.tempC < -40 || i.tempC > 200) throw new ToolError("bad-input", "Conductor temperature should be between −40 and 200 °C.");
  if (!Number.isFinite(i.maxPct) || i.maxPct <= 0 || i.maxPct > 50) throw new ToolError("bad-input", "Maximum drop should be between 0 and 50 percent.");
  const ft = i.lengthUnit === "ft" ? i.length : i.length / 0.3048;
  const drop = (g: Awg) => (i.amps * copperOhmsPer1000(g, i.tempC) * 2 * ft) / 1000;
  const ohmsPer1000 = copperOhmsPer1000(i.gauge, i.tempC);
  const loopOhms = (ohmsPer1000 * 2 * ft) / 1000;
  const dropV = i.amps * loopOhms;
  // Largest AWG number (thinnest wire) that still meets the limit.
  let smallestOk: Awg | null = null;
  for (const g of [...AWG_SIZES].reverse()) {
    if ((drop(g) / i.volts) * 100 <= i.maxPct) {
      smallestOk = g;
      break;
    }
  }
  const d = awgDiameterIn(i.gauge);
  return {
    ohmsPer1000,
    loopOhms,
    dropV,
    dropPct: (dropV / i.volts) * 100,
    loadV: i.volts - dropV,
    powerLossW: i.amps * dropV,
    diameterIn: d,
    areaMm2: Math.PI * ((d * 25.4) / 2) ** 2,
    smallestOk,
    smallestOkDropPct: smallestOk ? (drop(smallestOk) / i.volts) * 100 : null,
  };
}
