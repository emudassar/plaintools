import { ToolError } from "./errors";

/**
 * Suspended (drop) ceiling grid and panels.
 *
 * Armstrong, "How to Install Your Suspended Ceiling" (homeowner instructions,
 * copy hosted by Home Depot, retrieved 2026-10-17):
 *  - "Main beams run the opposite direction of the joists." "Main beams are on
 *    4 foot centers." "The minimum drop is 3 inches."
 *  - Cross tees 2' apart; 2' × 2': "additional tees at midpoint of 4' cross
 *    tees".
 *  - Wire fasteners 4' apart along the main beam lines; "Add extra wires for
 *    light fixtures, one at each corner of the light."
 *  - Border panels, worksheet: divide the room dimension by the panel
 *    dimension, add the remainder to one panel dimension, divide by 2.
 *    Sample (2' × 4' panels, 9' × 10'6" room): 9' ÷ 4 -> remainder 1' ->
 *    (1' + 4') ÷ 2 = 2'6"; 10'6" ÷ 2 -> remainder 6" -> (6" + 2') ÷ 2 = 1'3".
 *
 * Geometry used here. Side A = the direction the main beams run (across the
 * joists); side B = the direction they are spaced along (parallel to joists).
 *  - 2' × 4': grid module 4' along B (main beam lines), 2' along A (cross tee
 *    lines). 2' × 2': module 2' both ways; main beams on every other 2' line
 *    across B (4' centres), 2' tees on the lines in between.
 *  - Grid lines across a side = (side − 2 × border) ÷ module + 1.
 *  - Panels = cells along A × cells along B, a border cell counting as a full
 *    panel (one panel cut per border cell).
 *  - 4' cross tees = cross-tee lines × (main beam lines + 1) bays.
 *  - 2' tees (2' × 2' only) = in-between lines × (cross-tee lines + 1).
 *  - Main beam pieces = lines × ceil(A ÷ main beam length).
 *  - Wall molding pieces = ceil(perimeter ÷ molding length).
 *  - Hanger wires ≈ lines × ceil(A ÷ 4) + 4 per light fixture.
 * Piece lengths are the user's (12 ft main beams and wall molding are typical
 * pack lengths; check the packaging).
 */

export const ARMSTRONG_URL = "https://images.homedepot-static.com/catalog/pdfImages/f0/f0594e38-95e1-4950-a669-dbf0726e763e.pdf";
export const CEILING_RETRIEVED = "2026-10-17";

/** Armstrong's border worksheet: (remainder + module) ÷ 2. */
export function border(side: number, module: number) {
  const rem = side - Math.floor(side / module + 1e-9) * module;
  return (Math.max(0, rem) + module) / 2;
}

export interface CeilingInput {
  /** Room side the main beams run along (across the joists), ft. */
  sideA: number;
  /** Room side parallel to the joists (mains spaced along it), ft. */
  sideB: number;
  panel: "2x4" | "2x2";
  mainLenFt: number;
  moldingLenFt: number;
  fixtures: number;
  wastePct: number;
}

export interface CeilingResult {
  borderA: number;
  borderB: number;
  mainLines: number;
  crossLines: number;
  midLines: number;
  panels: number;
  fullPanels: number;
  mainPieces: number;
  crossTees4: number;
  tees2: number;
  moldingPieces: number;
  wires: number;
  areaSqFt: number;
}

export function dropCeiling(i: CeilingInput): CeilingResult {
  for (const [v, n] of [[i.sideA, "first room side"], [i.sideB, "second room side"]] as const)
    if (!Number.isFinite(v) || v < 2 || v > 200) throw new ToolError("bad-input", `Enter the ${n} in feet (2 to 200).`);
  if (!Number.isFinite(i.mainLenFt) || i.mainLenFt <= 0 || !Number.isFinite(i.moldingLenFt) || i.moldingLenFt <= 0) throw new ToolError("bad-input", "Enter the main beam and wall molding lengths in feet.");
  if (!Number.isInteger(i.fixtures) || i.fixtures < 0 || i.fixtures > 200) throw new ToolError("bad-input", "Light fixtures should be a whole number.");
  if (!Number.isFinite(i.wastePct) || i.wastePct < 0 || i.wastePct > 100) throw new ToolError("bad-input", "Extra allowance should be between 0 and 100 percent.");

  const modA = 2;
  const modB = i.panel === "2x4" ? 4 : 2;
  const borderA = border(i.sideA, modA);
  const borderB = border(i.sideB, modB);
  const linesA = Math.round((i.sideA - 2 * borderA) / modA) + 1; // cross-tee lines
  const linesB = Math.round((i.sideB - 2 * borderB) / modB) + 1; // grid lines across B
  const mainLines = i.panel === "2x4" ? linesB : Math.ceil(linesB / 2);
  const midLines = i.panel === "2x4" ? 0 : linesB - mainLines;
  const crossLines = linesA;
  const cellsA = linesA + 1;
  const cellsB = linesB + 1;
  const fullPanels = (cellsA - 2) * (cellsB - 2);
  const w = 1 + i.wastePct / 100;
  const panels = Math.ceil(cellsA * cellsB * w - 1e-9);
  return {
    borderA,
    borderB,
    mainLines,
    crossLines,
    midLines,
    panels,
    fullPanels: Math.max(0, fullPanels),
    mainPieces: Math.ceil(mainLines * Math.ceil(i.sideA / i.mainLenFt - 1e-9) * w - 1e-9),
    crossTees4: Math.ceil(crossLines * (mainLines + 1) * w - 1e-9),
    tees2: Math.ceil(midLines * (crossLines + 1) * w - 1e-9),
    moldingPieces: Math.ceil((2 * (i.sideA + i.sideB) * w) / i.moldingLenFt - 1e-9),
    wires: mainLines * Math.ceil(i.sideA / 4 - 1e-9) + 4 * i.fixtures,
    areaSqFt: i.sideA * i.sideB,
  };
}
