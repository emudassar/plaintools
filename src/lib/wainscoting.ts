import { ToolError } from "./errors";

/**
 * Wainscoting materials for a room.
 *
 * Arithmetic only:
 *  - run   = Σ wall lengths − openings (ft)
 *  - area  = run × wainscot height
 *  - sheet panels (e.g. 4 × 8 beadboard/MDF installed vertically): each sheet
 *    cut across yields floor(sheet length ÷ height) strips the sheet's width;
 *    strips needed = ceil(run ÷ sheet width); sheets = ceil(strips ÷ strips
 *    per sheet). If the height is more than the sheet length, sheets are
 *    stacked: ceil(height ÷ sheet length) per column.
 *  - cap/chair rail and baseboard = run (ft), pieces = ceil(run × (1 + waste)
 *    ÷ stock length)
 *  - optional panel layout per wall: n panels with stiles of width s at both
 *    ends and between: panel width = (wall − (n + 1)·s) ÷ n.
 */

export interface WainscotInput {
  /** Wall lengths, ft. */
  walls: number[];
  /** Total width of doors and other openings, ft. */
  openingsFt: number;
  /** Wainscot height, inches. */
  heightIn: number;
  /** Sheet size, inches (width installed horizontally, length vertical). */
  sheetW: number;
  sheetL: number;
  /** Trim stock length, ft. */
  stockFt: number;
  wastePct: number;
}

export interface WainscotResult {
  run: number;
  areaSqFt: number;
  stripsPerSheet: number;
  columns: number;
  sheets: number;
  trimFt: number;
  trimPieces: number;
}

export function wainscoting(i: WainscotInput): WainscotResult {
  if (!i.walls.length || i.walls.some((w) => !Number.isFinite(w) || w <= 0 || w > 500)) throw new ToolError("bad-input", "Enter every wall length in feet as a positive number.");
  if (!Number.isFinite(i.openingsFt) || i.openingsFt < 0) throw new ToolError("bad-input", "Openings should be zero or more feet.");
  if (!Number.isFinite(i.heightIn) || i.heightIn <= 0 || i.heightIn > 144) throw new ToolError("bad-input", "Enter the wainscot height in inches (for example 36).");
  if (!Number.isFinite(i.sheetW) || i.sheetW <= 0 || !Number.isFinite(i.sheetL) || i.sheetL <= 0) throw new ToolError("bad-input", "Enter the panel sheet width and length in inches.");
  if (!Number.isFinite(i.stockFt) || i.stockFt <= 0 || i.stockFt > 24) throw new ToolError("bad-input", "Enter the trim stock length in feet.");
  if (!Number.isFinite(i.wastePct) || i.wastePct < 0 || i.wastePct > 100) throw new ToolError("bad-input", "Waste allowance should be between 0 and 100 percent.");
  const run = i.walls.reduce((a, b) => a + b, 0) - i.openingsFt;
  if (run <= 0) throw new ToolError("bad-input", "The openings add up to more than the walls.");
  const areaSqFt = (run * i.heightIn) / 12;
  const columns = Math.ceil((run * 12 * (1 + i.wastePct / 100)) / i.sheetW - 1e-9);
  let sheets: number;
  let stripsPerSheet: number;
  if (i.heightIn <= i.sheetL) {
    stripsPerSheet = Math.floor(i.sheetL / i.heightIn + 1e-9);
    sheets = Math.ceil(columns / stripsPerSheet - 1e-9);
  } else {
    stripsPerSheet = 0;
    sheets = columns * Math.ceil(i.heightIn / i.sheetL - 1e-9);
  }
  const trimPieces = Math.ceil((run * (1 + i.wastePct / 100)) / i.stockFt - 1e-9);
  return { run, areaSqFt, stripsPerSheet, columns, sheets, trimFt: run, trimPieces };
}

export function panelLayout(wallIn: number, panels: number, stileIn: number) {
  if (!Number.isFinite(wallIn) || wallIn <= 0) throw new ToolError("bad-input", "Enter the wall width in inches.");
  if (!Number.isInteger(panels) || panels < 1 || panels > 50) throw new ToolError("bad-input", "Number of panels should be a whole number from 1 to 50.");
  if (!Number.isFinite(stileIn) || stileIn < 0) throw new ToolError("bad-input", "Stile width should be zero or more.");
  const panelW = (wallIn - (panels + 1) * stileIn) / panels;
  if (panelW <= 0) throw new ToolError("bad-input", "The stiles take up the whole wall.");
  return { panelW, starts: Array.from({ length: panels }, (_, k) => stileIn + k * (panelW + stileIn)) };
}
