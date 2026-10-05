import { ToolError } from "./errors";

/**
 * Pressure washer nozzle (orifice) size.
 *
 * Source: General Pump, "General Pump Nozzle Chart" (2021, PDF), gallons per
 * minute by nozzle size at 40–5000 PSI, with a reference orifice diameter.
 * Retrieved 2026-10-05 from
 *   https://www.generalpump.com/wp-content/uploads/2021/04/NozzleChart-2021.pdf
 *
 * In the chart a size's flow at 4000 PSI equals its size number, and the other
 * columns follow GPM = size x sqrt(PSI / 4000). Checked cell by cell: 490 of
 * the 496 printed cells are within 0.015 GPM of that formula. The six that are
 * not are printing slips (size 3.5 @ 600 = 1.26, formula 1.36; 3.75 @ 5000 =
 * 4.17 vs 4.19; 4 @ 600 = 1.45 vs 1.55; 7 @ 2000 = 1.95 vs 4.95; 15 @ 600 =
 * 5.91 vs 5.81; 30 @ 2000 = 21.12 vs 21.21). So:
 *   size = GPM x sqrt(4000 / PSI)       PSI = 4000 x (GPM / size)^2
 * The chart notes the orifice diameter is "for reference only".
 */

export const NOZZLE_RETRIEVED = "2026-10-05";
export const GP_CHART_URL = "https://www.generalpump.com/wp-content/uploads/2021/04/NozzleChart-2021.pdf";

/** [size, reference orifice diameter in inches], as printed. */
export const NOZZLE_SIZES: readonly (readonly [number, number])[] = [
  [2, 0.032], [2.5, 0.036], [3, 0.04], [3.25, 0.042], [3.5, 0.043], [3.75, 0.045], [4, 0.046],
  [4.5, 0.049], [5, 0.052], [5.5, 0.054], [6, 0.057], [6.5, 0.059], [7, 0.062], [7.5, 0.063],
  [8, 0.065], [8.5, 0.069], [9, 0.07], [9.5, 0.072], [10, 0.073], [11, 0.077], [12, 0.081],
  [12.5, 0.082], [13, 0.084], [14, 0.087], [15, 0.09], [20, 0.104], [25, 0.117], [30, 0.129],
  [40, 0.149], [50, 0.167], [60, 0.183],
];

export interface NozzleOption {
  size: number;
  diameterIn: number;
  /** Pressure this size gives at the machine's flow. */
  psi: number;
  /** Flow this size passes at the machine's rated pressure. */
  gpmAtRated: number;
}

export interface NozzleResult {
  gpm: number;
  psi: number;
  exactSize: number;
  exactMatch: NozzleOption | null;
  smaller: NozzleOption | null;
  larger: NozzleOption | null;
  nearby: NozzleOption[];
  retrievedAt: string;
}

export function sizeFor(gpm: number, psi: number): number {
  return gpm * Math.sqrt(4000 / psi);
}
export function psiFor(gpm: number, size: number): number {
  return 4000 * (gpm / size) ** 2;
}
export function gpmFor(size: number, psi: number): number {
  return size * Math.sqrt(psi / 4000);
}

function option(gpm: number, psi: number, [size, dia]: readonly [number, number]): NozzleOption {
  return { size, diameterIn: dia, psi: psiFor(gpm, size), gpmAtRated: gpmFor(size, psi) };
}

export function nozzleFor(gpm: number, psi: number): NozzleResult {
  if (!Number.isFinite(gpm) || gpm <= 0) throw new ToolError("bad-input", "Enter the machine's flow in GPM, more than zero.");
  if (!Number.isFinite(psi) || psi <= 0) throw new ToolError("bad-input", "Enter the machine's pressure in PSI, more than zero.");
  if (gpm > 100) throw new ToolError("bad-input", "That is over 100 GPM. Check the flow — pressure washers are usually 1–10 GPM.");
  if (psi > 10000) throw new ToolError("bad-input", "That is over 10,000 PSI. Check the pressure.");
  if (psi < 40) throw new ToolError("bad-input", "The chart starts at 40 PSI. Check the pressure is in PSI, not bar (1 bar ≈ 14.5 PSI).");

  const exactSize = sizeFor(gpm, psi);
  const first = NOZZLE_SIZES[0][0];
  const last = NOZZLE_SIZES[NOZZLE_SIZES.length - 1][0];
  if (exactSize < first * 0.5 || exactSize > last * 1.5) {
    throw new ToolError(
      "no-data",
      `That combination needs a size ${exactSize.toFixed(2)} nozzle, far outside the chart's sizes ${first}–${last}. Check the GPM and PSI.`,
    );
  }

  const idx = NOZZLE_SIZES.findIndex(([s]) => Math.abs(s - exactSize) < 0.005);
  const exactMatch = idx >= 0 ? option(gpm, psi, NOZZLE_SIZES[idx]) : null;
  const below = [...NOZZLE_SIZES].reverse().find(([s]) => s < exactSize - 0.005);
  const above = NOZZLE_SIZES.find(([s]) => s > exactSize + 0.005);
  const centre = idx >= 0 ? idx : NOZZLE_SIZES.findIndex(([s]) => s > exactSize);
  const from = Math.min(Math.max(0, (centre < 0 ? NOZZLE_SIZES.length : centre) - 3), NOZZLE_SIZES.length - 6);
  const nearby = NOZZLE_SIZES.slice(from, from + 6).map((row) => option(gpm, psi, row));

  return {
    gpm,
    psi,
    exactSize,
    exactMatch,
    smaller: below ? option(gpm, psi, below) : null,
    larger: above ? option(gpm, psi, above) : null,
    nearby,
    retrievedAt: NOZZLE_RETRIEVED,
  };
}
