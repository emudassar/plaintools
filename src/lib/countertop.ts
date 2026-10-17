import { ToolError } from "./errors";

/**
 * Countertop square footage.
 *
 * Arithmetic only: each run is length × depth (inches) ÷ 144. Backsplash
 * area = length of wall-side runs × backsplash height ÷ 144. Optional sink or
 * cooktop cut-outs can be subtracted for a net figure; the gross figure is
 * also shown because fabricators usually price the slab area used.
 */

export interface CounterRun {
  lengthIn: number;
  depthIn: number;
  /** Count this run's length for backsplash. */
  backsplash: boolean;
}

export interface CounterInput {
  runs: CounterRun[];
  backsplashIn: number;
  /** Cut-outs to subtract, each W × D inches. */
  cutouts: { w: number; d: number }[];
  pricePerSqFt: number | null;
}

export interface CounterResult {
  runSqFt: number[];
  counterSqFt: number;
  backsplashSqFt: number;
  cutoutSqFt: number;
  grossSqFt: number;
  netSqFt: number;
  cost: number | null;
}

export function countertopArea(i: CounterInput): CounterResult {
  if (!i.runs.length) throw new ToolError("bad-input", "Add at least one countertop section.");
  for (const r of i.runs)
    if (!Number.isFinite(r.lengthIn) || r.lengthIn <= 0 || r.lengthIn > 1200 || !Number.isFinite(r.depthIn) || r.depthIn <= 0 || r.depthIn > 120)
      throw new ToolError("bad-input", "Enter each section's length and depth in inches.");
  if (!Number.isFinite(i.backsplashIn) || i.backsplashIn < 0 || i.backsplashIn > 120) throw new ToolError("bad-input", "Backsplash height should be between 0 and 120 inches.");
  for (const c of i.cutouts) if (!Number.isFinite(c.w) || c.w < 0 || !Number.isFinite(c.d) || c.d < 0) throw new ToolError("bad-input", "Cut-out sizes should be zero or more.");
  if (i.pricePerSqFt !== null && (!Number.isFinite(i.pricePerSqFt) || i.pricePerSqFt < 0)) throw new ToolError("bad-input", "Enter the price as a positive number, or leave it blank.");
  const runSqFt = i.runs.map((r) => (r.lengthIn * r.depthIn) / 144);
  const counterSqFt = runSqFt.reduce((a, b) => a + b, 0);
  const backsplashSqFt = i.runs.filter((r) => r.backsplash).reduce((a, r) => a + (r.lengthIn * i.backsplashIn) / 144, 0);
  const cutoutSqFt = i.cutouts.reduce((a, c) => a + (c.w * c.d) / 144, 0);
  const grossSqFt = counterSqFt + backsplashSqFt;
  const netSqFt = grossSqFt - cutoutSqFt;
  if (netSqFt <= 0) throw new ToolError("bad-input", "The cut-outs are larger than the countertop.");
  return { runSqFt, counterSqFt, backsplashSqFt, cutoutSqFt, grossSqFt, netSqFt, cost: i.pricePerSqFt === null ? null : grossSqFt * i.pricePerSqFt };
}
