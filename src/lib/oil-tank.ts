import { ToolError } from "./errors";

/**
 * Oil tank chart: depth of oil (inches on the stick) → gallons.
 *
 * Method: the tank is a prism (an obround or circular cross-section, extruded along its length)
 * or an upright cylinder/box. The fraction full is the filled cross-section area ÷ the whole
 * cross-section area — pure geometry, using the circular-segment area
 *   A(h) = r²·acos((r−h)/r) − (r−h)·√(2rh − h²),  0 ≤ h ≤ 2r.
 * Gallons = fraction full × the tank's rated capacity (when a rating is given), which is how
 * dealer charts are built: checked 2026-10-14 against pickhvac.com's 275-gallon charts, which
 * this reproduces row by row to within 1.6 gal (vertical, all 44 rows) and 2.8 gal (horizontal,
 * all 27 rows; that chart's own steps are uneven), e.g. vertical 10" → 51, 20" → 123.
 * The geometric volume of the nominal outside dimensions is also reported (1 US gal = 231 in³).
 *
 * Preset dimensions: pickhvac.com "Oil Tank Standard Sizes" (275 and 330 gal obround 27"×44",
 * 60" and 72" long; 500/550/1000 gal cylinders 48" diameter, 65"/72"/130" long), consistent
 * with Granby's 27" wide × 44" tall 330-gallon vertical tank listing (Ferguson). Read 2026-10-14.
 */

export const OIL_RETRIEVED = "2026-10-14";
export const IN3_PER_GAL = 231;

export type Shape = "obround-vertical" | "obround-horizontal" | "cylinder-horizontal" | "cylinder-vertical" | "box";

export interface TankSpec {
  shape: Shape;
  /** Inches. Obround: width = the short side (diameter of the rounded ends) for vertical,
   *  the long side for horizontal. Cylinder: width = diameter. */
  width: number;
  /** Inches, top to bottom as installed — the full stick depth. */
  height: number;
  /** Inches, end to end (unused for an upright cylinder). */
  length: number;
  /** Rated capacity in US gallons, or null to use the geometric volume. */
  rated: number | null;
}

export interface Preset {
  id: string;
  label: string;
  spec: TankSpec;
}

export const PRESETS: readonly Preset[] = [
  { id: "275v", label: "275 gal oval, vertical (standing on end, 44\" tall)", spec: { shape: "obround-vertical", width: 27, height: 44, length: 60, rated: 275 } },
  { id: "275h", label: "275 gal oval, horizontal (lying flat, 27\" tall)", spec: { shape: "obround-horizontal", width: 44, height: 27, length: 60, rated: 275 } },
  { id: "330v", label: "330 gal oval, vertical (44\" tall)", spec: { shape: "obround-vertical", width: 27, height: 44, length: 72, rated: 330 } },
  { id: "330h", label: "330 gal oval, horizontal (27\" tall)", spec: { shape: "obround-horizontal", width: 44, height: 27, length: 72, rated: 330 } },
  { id: "500", label: "500 gal round, lying on its side (48\" × 65\")", spec: { shape: "cylinder-horizontal", width: 48, height: 48, length: 65, rated: 500 } },
  { id: "550", label: "550 gal round, lying on its side (48\" × 72\")", spec: { shape: "cylinder-horizontal", width: 48, height: 48, length: 72, rated: 550 } },
  { id: "1000", label: "1000 gal round, lying on its side (48\" × 130\")", spec: { shape: "cylinder-horizontal", width: 48, height: 48, length: 130, rated: 1000 } },
];

/** Area of a circular segment of radius r filled to depth h (clamped to 0..2r). */
export function segmentArea(r: number, h: number): number {
  const d = Math.min(Math.max(h, 0), 2 * r);
  if (d === 0) return 0;
  if (d === 2 * r) return Math.PI * r * r;
  return r * r * Math.acos((r - d) / r) - (r - d) * Math.sqrt(2 * r * d - d * d);
}

/** Filled and total cross-section area (or, for upright shapes, any consistent measure). */
function areas(spec: TankSpec, depth: number): { filled: number; total: number } {
  const h = Math.min(Math.max(depth, 0), spec.height);
  switch (spec.shape) {
    case "obround-vertical": {
      // Rounded ends at top and bottom; flat sides vertical.
      const r = spec.width / 2;
      const straight = spec.height - spec.width;
      const total = Math.PI * r * r + spec.width * straight;
      let filled: number;
      if (h <= r) filled = segmentArea(r, h);
      else if (h <= r + straight) filled = (Math.PI * r * r) / 2 + spec.width * (h - r);
      else filled = total - segmentArea(r, spec.height - h);
      return { filled, total };
    }
    case "obround-horizontal": {
      // Rounded ends left and right; flat top and bottom. Height = diameter.
      const r = spec.height / 2;
      const straight = spec.width - spec.height;
      const total = Math.PI * r * r + spec.height * straight;
      return { filled: segmentArea(r, h) + straight * h, total };
    }
    case "cylinder-horizontal": {
      const r = spec.height / 2;
      return { filled: segmentArea(r, h), total: Math.PI * r * r };
    }
    case "cylinder-vertical":
    case "box":
      return { filled: h, total: spec.height };
  }
}

export function geometricGallons(spec: TankSpec): number {
  switch (spec.shape) {
    case "obround-vertical":
    case "obround-horizontal":
    case "cylinder-horizontal":
      return (areas(spec, spec.height).total * spec.length) / IN3_PER_GAL;
    case "cylinder-vertical":
      return (Math.PI * (spec.width / 2) ** 2 * spec.height) / IN3_PER_GAL;
    case "box":
      return (spec.width * spec.height * spec.length) / IN3_PER_GAL;
  }
}

export function validateSpec(spec: TankSpec): void {
  for (const [k, v] of [["width", spec.width], ["height", spec.height], ["length", spec.length]] as const) {
    if (spec.shape === "cylinder-vertical" && k === "length") continue;
    if (!Number.isFinite(v) || v <= 0) throw new ToolError("bad-input", `Enter the tank's ${k} in inches.`);
    if (v > 600) throw new ToolError("bad-input", `A ${k} over 600 inches is outside what this page handles. Check the unit.`);
  }
  if (spec.shape === "obround-vertical" && spec.height < spec.width)
    throw new ToolError("bad-input", "For an oval tank standing on end, the height must be at least the width. Swap them, or pick the horizontal shape.");
  if (spec.shape === "obround-horizontal" && spec.width < spec.height)
    throw new ToolError("bad-input", "For an oval tank lying flat, the width must be at least the height. Swap them, or pick the vertical shape.");
  if (spec.shape === "cylinder-horizontal" && Math.abs(spec.width - spec.height) > 1e-9)
    throw new ToolError("bad-input", "A round tank's height and width are both its diameter.");
  if (spec.rated !== null && (!Number.isFinite(spec.rated) || spec.rated <= 0)) throw new ToolError("bad-input", "Enter the rated capacity in gallons, or leave it blank.");
}

export interface OilResult {
  depth: number;
  fraction: number;
  gallons: number;
  /** Space left to the rated (or geometric) capacity. */
  roomGallons: number;
  basis: "rated" | "geometric";
  capacity: number;
  geometric: number;
  /** Rated vs geometric differ by more than 10%: the dimensions or rating may be wrong. */
  mismatch: boolean;
  chart: { inches: number; gallons: number }[];
  retrievedAt: string;
}

export function oilTank(spec: TankSpec, depth: number): OilResult {
  validateSpec(spec);
  if (!Number.isFinite(depth) || depth < 0) throw new ToolError("bad-input", "Enter the oil depth in inches (0 or more).");
  if (depth > spec.height + 1e-9)
    throw new ToolError("bad-input", `${depth}" is deeper than the tank is tall (${spec.height}"). Check the reading, or the tank's height.`);
  const geometric = geometricGallons(spec);
  const capacity = spec.rated ?? geometric;
  const frac = (d: number) => {
    const a = areas(spec, d);
    return a.filled / a.total;
  };
  const fraction = frac(depth);
  const chart: { inches: number; gallons: number }[] = [];
  for (let i = 1; i <= Math.floor(spec.height + 1e-9); i++) chart.push({ inches: i, gallons: frac(i) * capacity });
  return {
    depth,
    fraction,
    gallons: fraction * capacity,
    roomGallons: (1 - fraction) * capacity,
    basis: spec.rated === null ? "geometric" : "rated",
    capacity,
    geometric,
    mismatch: spec.rated !== null && Math.abs(spec.rated - geometric) / geometric > 0.1,
    chart,
    retrievedAt: OIL_RETRIEVED,
  };
}
