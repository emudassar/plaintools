import { ToolError } from "./errors";

/**
 * Gambrel roof geometry (symmetric, two slopes each side).
 *
 * Plain right-triangle geometry. Each side has a steep lower section and a
 * shallow upper section meeting at the break:
 *   lower: horizontal run r1, pitch p1 (rise per 12) -> rise h1 = r1 × p1 ÷ 12
 *   upper: horizontal run r2 = span ÷ 2 − r1, pitch p2 -> rise h2 = r2 × p2 ÷ 12
 *   rafter length = run × √(144 + pitch²) ÷ 12 (same as a common rafter)
 * Roof surface = 2 × (lower + upper rafter lengths, plus tail) × building
 * length. Gable-end area (one end) = trapezoid under the lower slopes + triangle
 * of the upper slopes. Loft headroom: width at a chosen height under the roof.
 */

export interface GambrelInput {
  spanFt: number;
  lengthFt: number;
  /** Lower section horizontal run from the wall to the break, ft. */
  lowerRunFt: number;
  lowerPitch: number;
  upperPitch: number;
  /** Level overhang at the eave, inches. */
  overhangIn: number;
}

export interface GambrelResult {
  lowerRun: number;
  upperRun: number;
  lowerRise: number;
  upperRise: number;
  totalRise: number;
  lowerRafter: number;
  upperRafter: number;
  tail: number;
  lowerAngle: number;
  upperAngle: number;
  roofAreaSqFt: number;
  squares: number;
  gableEndSqFt: number;
  /** Width of the floor of the space at the break height (between break points). */
  widthAtBreak: number;
}

const ang = (p: number) => (Math.atan(p / 12) * 180) / Math.PI;

export function gambrelRoof(i: GambrelInput): GambrelResult {
  if (!Number.isFinite(i.spanFt) || i.spanFt <= 0 || i.spanFt > 200) throw new ToolError("bad-input", "Enter the building span in feet.");
  if (!Number.isFinite(i.lengthFt) || i.lengthFt <= 0 || i.lengthFt > 1000) throw new ToolError("bad-input", "Enter the building length in feet.");
  const half = i.spanFt / 2;
  if (!Number.isFinite(i.lowerRunFt) || i.lowerRunFt <= 0 || i.lowerRunFt >= half) throw new ToolError("bad-input", "The lower section's run must be more than 0 and less than half the span.");
  if (!Number.isFinite(i.lowerPitch) || i.lowerPitch <= 0 || i.lowerPitch > 72) throw new ToolError("bad-input", "Enter the lower pitch as rise per 12 in (for example 24 for a steep 24/12).");
  if (!Number.isFinite(i.upperPitch) || i.upperPitch <= 0 || i.upperPitch > 72) throw new ToolError("bad-input", "Enter the upper pitch as rise per 12 in (for example 6).");
  if (i.upperPitch >= i.lowerPitch) throw new ToolError("bad-input", "On a gambrel the upper slope is shallower than the lower one. Check the two pitches.");
  if (!Number.isFinite(i.overhangIn) || i.overhangIn < 0 || i.overhangIn > 60) throw new ToolError("bad-input", "Overhang should be between 0 and 60 inches.");
  const k = (p: number) => Math.sqrt(144 + p * p) / 12;
  const lowerRun = i.lowerRunFt;
  const upperRun = half - lowerRun;
  const lowerRise = (lowerRun * i.lowerPitch) / 12;
  const upperRise = (upperRun * i.upperPitch) / 12;
  const lowerRafter = lowerRun * k(i.lowerPitch);
  const upperRafter = upperRun * k(i.upperPitch);
  const tail = (i.overhangIn / 12) * k(i.lowerPitch);
  const roofAreaSqFt = 2 * (lowerRafter + upperRafter + tail) * i.lengthFt;
  const widthAtBreak = i.spanFt - 2 * lowerRun;
  const gableEndSqFt = ((i.spanFt + widthAtBreak) / 2) * lowerRise + (widthAtBreak * upperRise) / 2;
  return {
    lowerRun,
    upperRun,
    lowerRise,
    upperRise,
    totalRise: lowerRise + upperRise,
    lowerRafter,
    upperRafter,
    tail,
    lowerAngle: ang(i.lowerPitch),
    upperAngle: ang(i.upperPitch),
    roofAreaSqFt,
    squares: roofAreaSqFt / 100,
    gableEndSqFt,
    widthAtBreak,
  };
}
