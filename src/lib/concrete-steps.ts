import { ToolError } from "./errors";
import { bagsFor } from "./concrete-bags";

/**
 * Concrete for solid steps poured on grade.
 *
 * Geometry: with n steps of rise r and tread run t, step k (k = 1 at the
 * bottom) is a block t deep and k × r tall, so the side profile area is
 * r × t × n(n + 1) ÷ 2. A top platform (landing) of depth p sits at full
 * height n × r and adds p × n × r. Volume = profile area × width. This is the
 * solid-fill case; steps formed over fill or with a sloped underside use less.
 * Bags from QUIKRETE Concrete Mix yields (see concrete-bags.ts).
 */

export interface StepsInput {
  steps: number;
  /** Rise and run per step, inches. */
  riseIn: number;
  runIn: number;
  /** Width of the steps, inches. */
  widthIn: number;
  /** Top platform depth, inches (0 = none). */
  platformIn: number;
  wastePct: number;
}

export interface StepsResult {
  profileSqFt: number;
  cuFt: number;
  cuYd: number;
  cuM: number;
  totalRiseIn: number;
  totalRunIn: number;
  bags: { lb: number; yieldCuFt: number; bags: number }[];
}

export function concreteSteps(i: StepsInput): StepsResult {
  if (!Number.isInteger(i.steps) || i.steps < 1 || i.steps > 30) throw new ToolError("bad-input", "Number of steps should be a whole number from 1 to 30.");
  for (const [v, n, max] of [[i.riseIn, "rise", 24], [i.runIn, "tread run", 60], [i.widthIn, "width", 600]] as const)
    if (!Number.isFinite(v) || v <= 0 || v > max) throw new ToolError("bad-input", `Enter the ${n} in inches.`);
  if (!Number.isFinite(i.platformIn) || i.platformIn < 0 || i.platformIn > 240) throw new ToolError("bad-input", "Platform depth should be between 0 and 240 inches.");
  if (!Number.isFinite(i.wastePct) || i.wastePct < 0 || i.wastePct > 100) throw new ToolError("bad-input", "Extra allowance should be between 0 and 100 percent.");
  const n = i.steps;
  const profileSqIn = i.riseIn * i.runIn * (n * (n + 1)) / 2 + i.platformIn * n * i.riseIn;
  const cuFt = ((profileSqIn * i.widthIn) / 1728) * (1 + i.wastePct / 100);
  return {
    profileSqFt: profileSqIn / 144,
    cuFt,
    cuYd: cuFt / 27,
    cuM: cuFt * 0.028316846592,
    totalRiseIn: n * i.riseIn,
    totalRunIn: n * i.runIn + i.platformIn,
    bags: bagsFor(cuFt),
  };
}
