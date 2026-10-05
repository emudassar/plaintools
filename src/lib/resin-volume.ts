import { ToolError } from "./errors";

/**
 * Resin volume for a mold, and its weight.
 *
 * Volume is plain solid geometry. Weight = volume x specific gravity
 * (1 g per ml of water). The specific gravities below are the makers' own
 * technical data sheets, retrieved 2026-10-05:
 *  - Smooth-On EpoxAcast 690 / 692 Deep Pour: mixed SG 1.10 / 1.08 g/cc
 *    (ASTM D1475); specific volume 25 / 25.7 cu in per lb.
 *  - Smooth-On Smooth-Cast 300 series (polyurethane): SG 1.05 g/cc;
 *    specific volume 26.4 cu in per lb.
 *  - West System 105 resin / 207 hardener: cured SG 1.15.
 * Cross-check: 27.68 cu in per lb of water / 1.10 = 25.2 cu in per lb, which
 * matches Smooth-On's printed 25 for EpoxAcast 690.
 */

export const RESIN_RETRIEVED = "2026-10-05";
export const EPOXACAST_URL = "https://www.smooth-on.com/tb/files/EPOXACAST_690_TB.pdf";
export const SMOOTHCAST_URL = "https://www.smooth-on.com/tb/files/Smooth-Cast_300q,_300,_305___310.pdf";
export const WEST_URL = "https://www.westsystem.com/app/uploads/2022/12/105-207-Epoxy-Resin.pdf";

export const ML_PER_IN3 = 16.387064;
export const ML_PER_US_FL_OZ = 29.5735295625;
export const G_PER_OZ = 28.349523125;
export const G_PER_LB = 453.59237;

export interface ResinPreset {
  id: string;
  label: string;
  sg: number;
  source: string;
}

export const PRESETS: ResinPreset[] = [
  { id: "epoxacast690", label: "Epoxy casting resin (Smooth-On EpoxAcast 690), SG 1.10", sg: 1.1, source: "Smooth-On EpoxAcast 690 technical bulletin" },
  { id: "epoxacast692", label: "Deep-pour epoxy (Smooth-On EpoxAcast 692), SG 1.08", sg: 1.08, source: "Smooth-On EpoxAcast 692 Deep Pour technical bulletin" },
  { id: "west105", label: "Coating/laminating epoxy (West System 105/207), SG 1.15", sg: 1.15, source: "West System 105/207 technical data sheet (cured)" },
  { id: "smoothcast300", label: "Polyurethane casting resin (Smooth-Cast 300), SG 1.05", sg: 1.05, source: "Smooth-On Smooth-Cast 300 series technical bulletin" },
];

export type MoldShape = "box" | "cylinder" | "sphere" | "hemisphere" | "cone" | "measured";
export type LenUnit = "in" | "cm" | "mm";

export interface ResinInput {
  shape: MoldShape;
  unit: LenUnit;
  /** Box: length. */
  length: number;
  /** Box: width. */
  width: number;
  /** Cylinder, sphere, hemisphere, cone: inside diameter. */
  diameter: number;
  /** Box, cylinder, cone: depth of resin. */
  height: number;
  /** Measured: ml of water the mold holds. */
  measuredMl: number;
  pieces: number;
  extraPct: number;
  specificGravity: number;
  ratioA: number;
  ratioB: number;
  ratioBasis: "volume" | "weight";
}

export interface ResinResult {
  /** One piece, before the extra allowance. */
  pieceMl: number;
  totalMl: number;
  totalFlOz: number;
  totalIn3: number;
  grams: number;
  ounces: number;
  pounds: number;
  /** Part A / part B in ml (volume basis) or grams (weight basis). */
  partA: number;
  partB: number;
  retrievedAt: string;
}

const CM_PER: Record<LenUnit, number> = { in: 2.54, cm: 1, mm: 0.1 };
// Largest single dimension accepted, in cm (about 10 ft).
const MAX_CM = 300;

function dim(label: string, v: number, unit: LenUnit): number {
  if (!Number.isFinite(v)) throw new ToolError("bad-input", `${label} must be a number.`);
  if (v <= 0) throw new ToolError("bad-input", `${label} must be more than zero.`);
  const cm = v * CM_PER[unit];
  if (cm > MAX_CM) throw new ToolError("bad-input", `${label} is over 3 m (about 10 ft). Check the units.`);
  return cm;
}

/** Volume of one mold in ml (1 cm3 = 1 ml). */
export function moldVolumeMl(i: Pick<ResinInput, "shape" | "unit" | "length" | "width" | "diameter" | "height" | "measuredMl">): number {
  switch (i.shape) {
    case "box":
      return dim("Length", i.length, i.unit) * dim("Width", i.width, i.unit) * dim("Depth", i.height, i.unit);
    case "cylinder": {
      const r = dim("Diameter", i.diameter, i.unit) / 2;
      return Math.PI * r * r * dim("Depth", i.height, i.unit);
    }
    case "sphere": {
      const r = dim("Diameter", i.diameter, i.unit) / 2;
      return (4 / 3) * Math.PI * r ** 3;
    }
    case "hemisphere": {
      const r = dim("Diameter", i.diameter, i.unit) / 2;
      return (2 / 3) * Math.PI * r ** 3;
    }
    case "cone": {
      const r = dim("Diameter", i.diameter, i.unit) / 2;
      return (Math.PI * r * r * dim("Height", i.height, i.unit)) / 3;
    }
    case "measured": {
      const v = i.measuredMl;
      if (!Number.isFinite(v)) throw new ToolError("bad-input", "Water volume must be a number.");
      if (v <= 0) throw new ToolError("bad-input", "Water volume must be more than zero.");
      if (v > 1_000_000) throw new ToolError("bad-input", "That is over 1,000 litres. Check the amount.");
      return v;
    }
  }
}

export function calculateResinVolume(input: ResinInput): ResinResult {
  const piece = moldVolumeMl(input);
  if (!Number.isInteger(input.pieces) || input.pieces < 1 || input.pieces > 1000)
    throw new ToolError("bad-input", "Number of pieces must be a whole number from 1 to 1,000.");
  if (!Number.isFinite(input.extraPct) || input.extraPct < 0 || input.extraPct > 100)
    throw new ToolError("bad-input", "Extra allowance must be between 0 and 100%.");
  const sg = input.specificGravity;
  if (!Number.isFinite(sg) || sg < 0.5 || sg > 3)
    throw new ToolError("bad-input", "Specific gravity must be between 0.5 and 3. Most casting resins are about 1.0 to 1.2.");
  for (const [label, v] of [["Part A of the ratio", input.ratioA], ["Part B of the ratio", input.ratioB]] as const) {
    if (!Number.isFinite(v) || v <= 0 || v > 1000) throw new ToolError("bad-input", `${label} must be a number above zero.`);
  }

  const totalMl = piece * input.pieces * (1 + input.extraPct / 100);
  const grams = totalMl * sg;
  const base = input.ratioBasis === "volume" ? totalMl : grams;
  const parts = input.ratioA + input.ratioB;
  return {
    pieceMl: piece,
    totalMl,
    totalFlOz: totalMl / ML_PER_US_FL_OZ,
    totalIn3: totalMl / ML_PER_IN3,
    grams,
    ounces: grams / G_PER_OZ,
    pounds: grams / G_PER_LB,
    partA: (base * input.ratioA) / parts,
    partB: (base * input.ratioB) / parts,
    retrievedAt: RESIN_RETRIEVED,
  };
}
