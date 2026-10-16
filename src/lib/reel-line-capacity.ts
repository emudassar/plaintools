import { ToolError } from "./errors";

/**
 * Fishing reel line capacity for a different line diameter.
 *
 * Method: a spool holds a fixed volume of line. Line is a cylinder of
 * diameter d and length L, so its volume is π/4 × d² × L, and for the same
 * spool d₁² × L₁ = d₂² × L₂ — the capacity in length scales with the inverse
 * square of the diameter. Backing uses up d_b² × L_b of that capacity first.
 *
 * This is cylinder geometry, not a published table. It assumes line packs
 * on the spool the same way at either diameter; real braid and mono pack
 * differently, so the result is an estimate.
 */

export const LENGTH_TO_M = { yd: 0.9144, m: 1, ft: 0.3048 } as const;
export const DIAM_TO_MM = { mm: 1, in: 25.4 } as const;
export type LengthUnit = keyof typeof LENGTH_TO_M;
export type DiamUnit = keyof typeof DIAM_TO_MM;

export interface ReelInput {
  ratedDiam: number;
  ratedLength: number;
  newDiam: number;
  diamUnit: DiamUnit;
  lengthUnit: LengthUnit;
  backing: { diam: number; length: number } | null;
}

export interface ReelResult {
  /** Length of the new line the spool holds, in the user's length unit. */
  length: number;
  lengthM: number;
  lengthYd: number;
  /** Share of the spool's capacity taken by the backing, 0..1. */
  backingShare: number | null;
  ratio: number;
}

const posNum = (v: number, what: string) => {
  if (!Number.isFinite(v) || v <= 0) throw new ToolError("bad-input", `Enter the ${what}.`);
};

export function reelCapacity(input: ReelInput): ReelResult {
  posNum(input.ratedDiam, "diameter of the line in the reel's rating");
  posNum(input.ratedLength, "length in the reel's rating");
  posNum(input.newDiam, "diameter of the line you want to spool");
  const dmm = DIAM_TO_MM[input.diamUnit];
  for (const d of [input.ratedDiam, input.newDiam, input.backing?.diam ?? input.newDiam]) {
    if (d * dmm > 3) throw new ToolError("bad-input", "Line diameters over 3 mm look like a unit mix-up — check mm vs inches.");
  }
  const cap = input.ratedDiam ** 2 * input.ratedLength;
  let used = 0;
  let backingShare: number | null = null;
  if (input.backing) {
    posNum(input.backing.diam, "backing diameter");
    posNum(input.backing.length, "backing length");
    used = input.backing.diam ** 2 * input.backing.length;
    backingShare = used / cap;
    if (used >= cap) throw new ToolError("no-data", "That much backing already fills the spool's rated capacity, leaving no room for the main line.");
  }
  const length = (cap - used) / input.newDiam ** 2;
  const lengthM = length * LENGTH_TO_M[input.lengthUnit];
  return {
    length,
    lengthM,
    lengthYd: lengthM / 0.9144,
    backingShare,
    ratio: (input.ratedDiam / input.newDiam) ** 2,
  };
}
