import { ToolError } from "./errors";

/**
 * Shiplap boards for walls installed horizontally.
 *
 * Arithmetic only. For each wall:
 *  - courses (rows) = ceil(height ÷ exposure), where exposure is the face each
 *    board shows after the overlap (less than its full width)
 *  - boards per course = ceil(wall width ÷ board length)
 *  - boards = courses × boards per course (a course-by-course count, so
 *    offcuts are not assumed to be reused across courses)
 * Area-based figures are shown too: linear feet = net area × 12 ÷ exposure.
 */

export interface ShiplapWall {
  widthFt: number;
  heightFt: number;
}

export interface ShiplapInput {
  walls: ShiplapWall[];
  openingsSqFt: number;
  /** Exposed face width, inches. */
  exposureIn: number;
  boardLengthFt: number;
  wastePct: number;
  pricePerBoard: number | null;
}

export interface ShiplapResult {
  grossSqFt: number;
  netSqFt: number;
  courses: number[];
  boardsByCourse: number;
  linearFtByArea: number;
  boardsByArea: number;
  cost: number | null;
}

export function shiplap(i: ShiplapInput): ShiplapResult {
  if (!i.walls.length) throw new ToolError("bad-input", "Add at least one wall.");
  for (const w of i.walls)
    if (!Number.isFinite(w.widthFt) || w.widthFt <= 0 || w.widthFt > 200 || !Number.isFinite(w.heightFt) || w.heightFt <= 0 || w.heightFt > 50)
      throw new ToolError("bad-input", "Enter each wall's width and height in feet.");
  if (!Number.isFinite(i.openingsSqFt) || i.openingsSqFt < 0) throw new ToolError("bad-input", "Openings should be zero or more square feet.");
  if (!Number.isFinite(i.exposureIn) || i.exposureIn <= 0 || i.exposureIn > 24) throw new ToolError("bad-input", "Enter the exposed face width of a board in inches (for example 5.125).");
  if (!Number.isFinite(i.boardLengthFt) || i.boardLengthFt <= 0 || i.boardLengthFt > 24) throw new ToolError("bad-input", "Enter the board length in feet.");
  if (!Number.isFinite(i.wastePct) || i.wastePct < 0 || i.wastePct > 100) throw new ToolError("bad-input", "Waste allowance should be between 0 and 100 percent.");
  if (i.pricePerBoard !== null && (!Number.isFinite(i.pricePerBoard) || i.pricePerBoard < 0)) throw new ToolError("bad-input", "Enter the price per board, or leave it blank.");
  const grossSqFt = i.walls.reduce((a, w) => a + w.widthFt * w.heightFt, 0);
  const netSqFt = grossSqFt - i.openingsSqFt;
  if (netSqFt <= 0) throw new ToolError("bad-input", "The openings are larger than the walls.");
  const w = 1 + i.wastePct / 100;
  const courses = i.walls.map((wall) => Math.ceil((wall.heightFt * 12) / i.exposureIn - 1e-9));
  const raw = i.walls.reduce((a, wall, k) => a + courses[k] * Math.ceil(wall.widthFt / i.boardLengthFt - 1e-9), 0);
  const boardsByCourse = Math.ceil(raw * w - 1e-9);
  const linearFtByArea = ((netSqFt * 12) / i.exposureIn) * w;
  const boardsByArea = Math.ceil(linearFtByArea / i.boardLengthFt - 1e-9);
  return { grossSqFt, netSqFt, courses, boardsByCourse, linearFtByArea, boardsByArea, cost: i.pricePerBoard === null ? null : boardsByCourse * i.pricePerBoard };
}
