import { ToolError } from "./errors";

/**
 * Drawer box size from the cabinet opening, for two published slide systems.
 *
 * Blum TANDEM plus BLUMOTION 563H (undermount), installation/spec sheet
 * tdm563h (© 2016 Blum Inc.), retrieved 2026-10-05:
 *  - "Inside drawer width must equal opening width minus 42 (1-21/32")".
 *  - Outside width = opening minus 10 / 12 / 14 / 16 / 18 mm for drawer sides
 *    16 / 15 / 14 / 13 / 12 mm thick (13/32, 15/32, 9/16, 5/8, 23/32 in).
 *    Example printed: 21" opening, 5/8" sides -> 20-19/32".
 *  - "Maximum drawer height = opening minus 20 (25/32")"; bottom recess 13 mm.
 *  - Drawer length = runner length; inside cabinet depth minimum per runner:
 *    533 (21") -> 557 mm, 457 (18") -> 480, 381 (15") -> 404, 305 (12") -> 328.
 *
 * Accuride 3832EC (side mount) quick reference, retrieved 2026-10-05:
 *  - "Side space: 1/2" + 1/32" x 2"; "construct drawer 1-1/16" [27.0 mm] less
 *    than cabinet opening"; "Slides may not function properly if side space is
 *    less than .50" [12.7 mm]".
 *  - Lengths 14"–28" (part numbers C14..C28 in 2" steps); "Drawer width should
 *    not exceed slide length"; minimum drawer height 1-7/8".
 *  Accuride gives no top/bottom clearance; the user may enter one.
 */

export const DRAWER_RETRIEVED = "2026-10-05";
export const BLUM_URL = "https://d2.blum.com/services/BEC003/tdm563h_ma_dok_bus_$sen-us_$aof_$v4.pdf";
export const ACCURIDE_URL = "https://www.accuride.com/media/amasty/amfile/attach/lsENsMwHMdlHk0OlD2EpkPTjq1u8ZoYw.pdf";

const MM = 25.4;

export const BLUM_SIDE_DEDUCTIONS: readonly { sideMm: number; label: string; deductMm: number }[] = [
  { sideMm: 16, label: "16 mm (5/8 in)", deductMm: 10 },
  { sideMm: 15, label: "15 mm (19/32 in)", deductMm: 12 },
  { sideMm: 14, label: "14 mm (9/16 in)", deductMm: 14 },
  { sideMm: 13, label: "13 mm (1/2 in)", deductMm: 16 },
  { sideMm: 12, label: "12 mm (15/32 in)", deductMm: 18 },
];

const BLUM_RUNNERS: readonly { lengthMm: number; lengthIn: number; minDepthMm: number }[] = [
  { lengthMm: 533, lengthIn: 21, minDepthMm: 557 },
  { lengthMm: 457, lengthIn: 18, minDepthMm: 480 },
  { lengthMm: 381, lengthIn: 15, minDepthMm: 404 },
  { lengthMm: 305, lengthIn: 12, minDepthMm: 328 },
];

const ACCURIDE_LENGTHS_IN = [28, 26, 24, 22, 20, 18, 16, 14];

export type Slide = "blum-563h" | "accuride-3832ec" | "custom";

export interface DrawerInput {
  slide: Slide;
  unit: "in" | "mm";
  openingWidth: number;
  openingHeight: number;
  /** Inside cabinet depth, or null to skip the length. */
  insideDepth: number | null;
  /** Blum only: drawer side thickness in mm (12–16). */
  blumSideMm: number;
  /** Custom only: total width clearance (both sides) in the chosen unit. */
  customWidthClearance: number | null;
  /** Side mount / custom: top + bottom clearance in the chosen unit, or null. */
  verticalClearance: number | null;
  /** Side thickness for inside width (side mount / custom), chosen unit, or null. */
  sideThickness: number | null;
}

export interface DrawerResult {
  outsideWidthMm: number;
  insideWidthMm: number | null;
  heightMm: number | null;
  lengthMm: number | null;
  slideLengthLabel: string | null;
  depthTooShallow: boolean;
  widthExceedsSlide: boolean;
  belowMinHeight: boolean;
  rule: string;
  retrievedAt: string;
}

function pos(label: string, v: number, maxMm: number, k: number) {
  if (!Number.isFinite(v) || v <= 0) throw new ToolError("bad-input", `${label} must be more than zero.`);
  if (v * k > maxMm) throw new ToolError("bad-input", `${label} looks too large. Check the units.`);
}

export function calculateDrawerSize(input: DrawerInput): DrawerResult {
  const k = input.unit === "in" ? MM : 1;
  pos("Opening width", input.openingWidth, 2500, k);
  pos("Opening height", input.openingHeight, 2500, k);
  const W = input.openingWidth * k;
  const H = input.openingHeight * k;
  const D = input.insideDepth === null ? null : (pos("Inside depth", input.insideDepth, 2500, k), input.insideDepth * k);

  let outside: number;
  let inside: number | null = null;
  let height: number | null = null;
  let length: number | null = null;
  let slideLabel: string | null = null;
  let tooShallow = false;
  let widthExceeds = false;
  let belowMin = false;
  let rule: string;

  const side = input.sideThickness === null ? null : (pos("Side thickness", input.sideThickness, 50, k), input.sideThickness * k);
  const vert = input.verticalClearance === null ? null : input.verticalClearance * k;
  if (vert !== null && (!Number.isFinite(vert) || vert < 0)) throw new ToolError("bad-input", "Top + bottom clearance must be zero or more.");

  if (input.slide === "blum-563h") {
    const ded = BLUM_SIDE_DEDUCTIONS.find((d) => d.sideMm === input.blumSideMm);
    if (!ded) throw new ToolError("bad-input", "Pick a drawer side thickness Blum lists (12 to 16 mm).");
    outside = W - ded.deductMm;
    inside = W - 42;
    height = H - 20;
    rule = `Blum TANDEM 563H: outside width = opening − ${ded.deductMm} mm for ${ded.label} sides; inside width = opening − 42 mm; height = opening − 20 mm.`;
    if (D !== null) {
      const r = BLUM_RUNNERS.find((x) => D >= x.minDepthMm);
      if (r) {
        length = r.lengthMm;
        slideLabel = `${r.lengthIn}" (${r.lengthMm} mm) runner`;
      } else tooShallow = true;
    }
  } else if (input.slide === "accuride-3832ec") {
    outside = W - 27;
    if (side !== null) inside = outside - 2 * side;
    if (vert !== null) height = H - vert;
    rule = "Accuride 3832EC: drawer = opening − 1-1/16 in (27.0 mm), from 1/2 in side space per side.";
    if (D !== null) {
      const len = ACCURIDE_LENGTHS_IN.find((x) => x * MM <= D);
      if (len) {
        length = len * MM;
        slideLabel = `${len}" slide`;
        widthExceeds = outside > length;
      } else tooShallow = true;
    }
  } else {
    if (input.customWidthClearance === null) throw new ToolError("bad-input", "Enter the slide maker's total width clearance (both sides).");
    pos("Width clearance", input.customWidthClearance, 500, k);
    outside = W - input.customWidthClearance * k;
    if (side !== null) inside = outside - 2 * side;
    if (vert !== null) height = H - vert;
    rule = `Custom: drawer = opening − ${input.unit === "in" ? input.customWidthClearance + " in" : input.customWidthClearance + " mm"} total width clearance.`;
    if (D !== null) length = D;
  }

  if (outside <= 0 || (inside !== null && inside <= 0)) throw new ToolError("no-data", "The opening is too narrow for this slide's clearances — there is no drawer width left.");
  if (height !== null && height <= 0) throw new ToolError("no-data", "The opening is too short for this slide's height allowance.");
  if (input.slide === "accuride-3832ec" && height !== null && height < 1.875 * MM) belowMin = true;

  return {
    outsideWidthMm: outside,
    insideWidthMm: inside,
    heightMm: height,
    lengthMm: length,
    slideLengthLabel: slideLabel,
    depthTooShallow: tooShallow,
    widthExceedsSlide: widthExceeds,
    belowMinHeight: belowMin,
    rule,
    retrievedAt: DRAWER_RETRIEVED,
  };
}

/** mm -> inches as a fraction to the nearest 1/32. */
export function toFraction(mm: number): string {
  const inches = mm / MM;
  let whole = Math.floor(inches);
  let n = Math.round((inches - whole) * 32);
  if (n === 32) {
    whole += 1;
    n = 0;
  }
  if (n === 0) return `${whole}"`;
  let d = 32;
  while (n % 2 === 0) {
    n /= 2;
    d /= 2;
  }
  return whole > 0 ? `${whole}-${n}/${d}"` : `${n}/${d}"`;
}
