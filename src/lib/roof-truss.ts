import { ToolError } from "./errors";

/**
 * Roof truss count and common-truss outline geometry.
 *
 * Count: trusses at a fixed on-centre spacing along the building length, one
 * at each end -> floor(length ÷ spacing) + 1, plus one more if the last space
 * is shorter than the spacing (so no space exceeds the spacing).
 * Outline of a symmetric common (gable) truss: run = span ÷ 2,
 * rise = run × pitch ÷ 12, top chord line length = (run + overhang) ×
 * sqrt(144 + pitch²) ÷ 12 per side, bottom chord = span.
 *
 * This is quantity and outline arithmetic only. IRC 2021 R802.10.1 requires
 * truss design drawings "provided to the building official and approved prior
 * to installation"; R802.10.2: "Wood trusses shall be designed in accordance
 * with accepted engineering practice" (ANSI/TPI 1); R802.10.4: truss members
 * shall not be cut, notched, drilled, spliced or otherwise altered without
 * approval. Read on codes.iccsafe.org 2026-10-17.
 */

export const IRC_CH8_URL = "https://codes.iccsafe.org/content/IRC2021P2/chapter-8-roof-ceiling-construction";
export const TRUSS_RETRIEVED = "2026-10-17";

export interface TrussInput {
  /** Building length along the ridge, ft. */
  lengthFt: number;
  /** On-centre spacing, inches (commonly 24). */
  spacingIn: number;
  /** Span (outside of walls), ft. */
  spanFt: number;
  pitch: number;
  /** Horizontal overhang each side, inches. */
  overhangIn: number;
  /** Gable-end trusses counted separately? (they're in the count either way) */
  pricePerTruss: number | null;
}

export interface TrussResult {
  count: number;
  /** Actual largest spacing used, inches. */
  lastSpace: number;
  run: number;
  rise: number;
  topChord: number;
  bottomChord: number;
  heightAtRidgeIn: number;
  angleDeg: number;
  cost: number | null;
}

export function roofTruss(i: TrussInput): TrussResult {
  if (!Number.isFinite(i.lengthFt) || i.lengthFt <= 0 || i.lengthFt > 500) throw new ToolError("bad-input", "Enter the building length in feet.");
  if (!Number.isFinite(i.spacingIn) || i.spacingIn < 6 || i.spacingIn > 96) throw new ToolError("bad-input", "Spacing should be between 6 and 96 inches on centre.");
  if (!Number.isFinite(i.spanFt) || i.spanFt <= 0 || i.spanFt > 120) throw new ToolError("bad-input", "Enter the span in feet.");
  if (!Number.isFinite(i.pitch) || i.pitch <= 0 || i.pitch > 24) throw new ToolError("bad-input", "Enter the pitch as inches of rise per 12 in of run.");
  if (!Number.isFinite(i.overhangIn) || i.overhangIn < 0 || i.overhangIn > 72) throw new ToolError("bad-input", "Overhang should be between 0 and 72 inches.");
  if (i.pricePerTruss !== null && (!Number.isFinite(i.pricePerTruss) || i.pricePerTruss < 0)) throw new ToolError("bad-input", "Enter the price as a positive number, or leave it blank.");
  const lenIn = i.lengthFt * 12;
  const full = Math.floor(lenIn / i.spacingIn + 1e-9);
  const rem = lenIn - full * i.spacingIn;
  const count = full + 1 + (rem > 1e-6 ? 1 : 0);
  const run = i.spanFt / 2;
  const k = Math.sqrt(144 + i.pitch * i.pitch) / 12;
  return {
    count,
    lastSpace: rem > 1e-6 ? rem : i.spacingIn,
    run,
    rise: (run * i.pitch) / 12,
    topChord: (run + i.overhangIn / 12) * k,
    bottomChord: i.spanFt,
    heightAtRidgeIn: run * i.pitch,
    angleDeg: (Math.atan(i.pitch / 12) * 180) / Math.PI,
    cost: i.pricePerTruss === null ? null : count * i.pricePerTruss,
  };
}
