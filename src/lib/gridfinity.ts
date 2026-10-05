import { ToolError } from "./errors";

/**
 * Gridfinity layout for a drawer.
 *
 * Source: "Gridfinity Design Reference v5" (graphic by willtree8, based on Zack
 * Freedman's original designs; CC BY-NC-SA), published on gridfinity.xyz/
 * specification, retrieved 2026-10-05. All measurements in millimetres:
 *  - Baseplate grid: 42 x 42 mm per unit; baseplate "~5mm" tall.
 *  - Bin footprint 41.5 x 41.5 mm ("0.5mm tolerance").
 *  - Height units: 1u = 7 mm, "+1u = +7mm"; a stackable lip adds "+~4.4 mm".
 *
 * Height here is counted from the drawer floor with bins seated in a frame
 * baseplate; a baseplate with a solid floor (or magnets/weights under it) adds
 * its floor thickness, which the user can enter.
 */

export const GRID_RETRIEVED = "2026-10-05";
export const GRIDFINITY_SPEC_URL = "https://gridfinity.xyz/specification/";
export const UNIT_MM = 42;
export const HEIGHT_UNIT_MM = 7;
export const LIP_MM = 4.4;

export interface GridInput {
  /** Drawer inside width, depth, height. */
  width: number;
  depth: number;
  height: number | null;
  unit: "mm" | "in";
  /** Print bed usable size, mm (square), or null to skip splitting. */
  bedMm: number | null;
  stackingLip: boolean;
  /** Extra thickness under the bins, mm (solid-floor baseplate etc). */
  floorMm: number;
}

export interface GridResult {
  widthMm: number;
  depthMm: number;
  unitsX: number;
  unitsY: number;
  cells: number;
  gridWidthMm: number;
  gridDepthMm: number;
  marginXEachMm: number;
  marginYEachMm: number;
  maxHeightUnits: number | null;
  binHeightMm: number | null;
  plates: { maxPerSide: number; piecesX: number[]; piecesY: number[]; count: number } | null;
  retrievedAt: string;
}

/** Split n units into the fewest near-equal pieces of at most `max`. */
export function splitUnits(n: number, max: number): number[] {
  const pieces = Math.ceil(n / max);
  const base = Math.floor(n / pieces);
  const extra = n % pieces;
  return Array.from({ length: pieces }, (_, i) => base + (i < extra ? 1 : 0));
}

export function calculateGridfinity(input: GridInput): GridResult {
  const k = input.unit === "in" ? 25.4 : 1;
  const W = input.width * k;
  const D = input.depth * k;
  for (const [label, v] of [["Width", W], ["Depth", D]] as const) {
    if (!Number.isFinite(v) || v <= 0) throw new ToolError("bad-input", `${label} must be more than zero.`);
    if (v > 5000) throw new ToolError("bad-input", `${label} is over 5 m. Check the units.`);
  }
  if (!Number.isFinite(input.floorMm) || input.floorMm < 0 || input.floorMm > 50) throw new ToolError("bad-input", "Floor thickness must be between 0 and 50 mm.");
  const unitsX = Math.floor(W / UNIT_MM + 1e-9);
  const unitsY = Math.floor(D / UNIT_MM + 1e-9);
  if (unitsX < 1 || unitsY < 1)
    throw new ToolError("no-data", `A Gridfinity unit is ${UNIT_MM} mm square; this drawer is narrower than one unit in at least one direction.`);

  let maxHeightUnits: number | null = null;
  let binHeightMm: number | null = null;
  if (input.height !== null) {
    const H = input.height * k;
    if (!Number.isFinite(H) || H <= 0) throw new ToolError("bad-input", "Height must be more than zero, or left blank.");
    const usable = H - input.floorMm - (input.stackingLip ? LIP_MM : 0);
    maxHeightUnits = Math.max(0, Math.floor(usable / HEIGHT_UNIT_MM + 1e-9));
    binHeightMm = maxHeightUnits * HEIGHT_UNIT_MM + (input.stackingLip ? LIP_MM : 0);
  }

  let plates: GridResult["plates"] = null;
  if (input.bedMm !== null) {
    if (!Number.isFinite(input.bedMm) || input.bedMm <= 0) throw new ToolError("bad-input", "Print bed size must be more than zero, or left blank.");
    const maxPerSide = Math.floor(input.bedMm / UNIT_MM + 1e-9);
    if (maxPerSide < 1) throw new ToolError("bad-input", `The print bed must be at least ${UNIT_MM} mm to print one unit.`);
    const piecesX = splitUnits(unitsX, maxPerSide);
    const piecesY = splitUnits(unitsY, maxPerSide);
    plates = { maxPerSide, piecesX, piecesY, count: piecesX.length * piecesY.length };
  }

  return {
    widthMm: W,
    depthMm: D,
    unitsX,
    unitsY,
    cells: unitsX * unitsY,
    gridWidthMm: unitsX * UNIT_MM,
    gridDepthMm: unitsY * UNIT_MM,
    marginXEachMm: (W - unitsX * UNIT_MM) / 2,
    marginYEachMm: (D - unitsY * UNIT_MM) / 2,
    maxHeightUnits,
    binHeightMm,
    plates,
    retrievedAt: GRID_RETRIEVED,
  };
}
