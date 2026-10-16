import { ToolError } from "./errors";

/**
 * Screws per sheet of drywall at the IRC's maximum fastener spacing.
 *
 * Source: International Residential Code 2024, Table R702.3.5, "Application
 * without adhesive", column "Maximum spacing of fasteners (inches) — Screws",
 * read on codes.iccsafe.org on 2026-10-16. Rows (thickness · application ·
 * orientation to framing · max framing spacing → screw spacing):
 *   3/8  ceiling (d)  perpendicular   16 → 12
 *   3/8  wall         either          16 → 16
 *   1/2  ceiling      either          16 → 12
 *   1/2  ceiling (d)  perpendicular   24 → 12
 *   1/2  wall         either          24 → 12
 *   1/2  wall         either          16 → 16
 *   5/8  ceiling      either          16 → 12
 *   5/8  ceiling      perpendicular   24 → 12
 *   5/8  Type X garage ceiling beneath habitable rooms, perpendicular 24 → 6
 *   5/8  wall         either          24 → 12
 *   5/8  wall         either          16 → 16
 * R702.3.5.1: screws Type W or Type S (ASTM C1002), penetrating wood ≥ 5/8 in.
 *
 * Count model (arithmetic, not from the code): the sheet's edges land on
 * framing; framing lines under the sheet = floor(dimension across framing ÷
 * framing spacing) + 1; screws per line = ceil(dimension along framing ÷ screw
 * spacing) + 1 (one at each end of the line).
 */

export const DRYWALL_RETRIEVED = "2026-10-16";
export const IRC_CH7_URL = "https://codes.iccsafe.org/content/IRC2024P2/chapter-7-wall-covering";

export type Thickness = "3/8" | "1/2" | "5/8" | "5/8x-garage";
export type Application = "wall" | "ceiling";
export type Orientation = "perpendicular" | "parallel";

export const THICKNESSES: readonly { id: Thickness; label: string }[] = [
  { id: "1/2", label: "1/2 in" },
  { id: "5/8", label: "5/8 in" },
  { id: "3/8", label: "3/8 in" },
  { id: "5/8x-garage", label: "5/8 in Type X — garage ceiling beneath habitable rooms" },
];

interface Row {
  t: Thickness;
  app: Application;
  orient: "either" | "perpendicular";
  framing: 16 | 24;
  screw: number;
}

const ROWS: readonly Row[] = [
  { t: "3/8", app: "ceiling", orient: "perpendicular", framing: 16, screw: 12 },
  { t: "3/8", app: "wall", orient: "either", framing: 16, screw: 16 },
  { t: "1/2", app: "ceiling", orient: "either", framing: 16, screw: 12 },
  { t: "1/2", app: "ceiling", orient: "perpendicular", framing: 24, screw: 12 },
  { t: "1/2", app: "wall", orient: "either", framing: 24, screw: 12 },
  { t: "1/2", app: "wall", orient: "either", framing: 16, screw: 16 },
  { t: "5/8", app: "ceiling", orient: "either", framing: 16, screw: 12 },
  { t: "5/8", app: "ceiling", orient: "perpendicular", framing: 24, screw: 12 },
  { t: "5/8x-garage", app: "ceiling", orient: "perpendicular", framing: 24, screw: 6 },
  { t: "5/8", app: "wall", orient: "either", framing: 24, screw: 12 },
  { t: "5/8", app: "wall", orient: "either", framing: 16, screw: 16 },
];

export const SHEETS: readonly { id: string; w: number; l: number; label: string }[] = [
  { id: "4x8", w: 48, l: 96, label: "4 × 8 ft" },
  { id: "4x10", w: 48, l: 120, label: "4 × 10 ft" },
  { id: "4x12", w: 48, l: 144, label: "4 × 12 ft" },
  { id: "54x12", w: 54, l: 144, label: "54 in × 12 ft" },
];

export interface DrywallInput {
  sheet: string;
  thickness: Thickness;
  app: Application;
  framing: 16 | 24;
  orientation: Orientation;
  sheets: number;
}

export interface DrywallResult {
  screwSpacing: number;
  /** The table row's own framing limit (16 or 24 in o.c.). */
  tableFraming: number;
  framingLines: number;
  screwsPerLine: number;
  perSheet: number;
  total: number;
  edgesOnFraming: boolean;
  retrievedAt: string;
}

export function drywallScrews(input: DrywallInput): DrywallResult {
  const sheet = SHEETS.find((s) => s.id === input.sheet);
  if (!sheet) throw new ToolError("bad-input", "Pick a sheet size.");
  if (input.thickness === "5/8x-garage" && input.app !== "ceiling")
    throw new ToolError("no-data", "The Type X garage row in Table R702.3.5 is for ceilings only.");
  if (!Number.isInteger(input.sheets) || input.sheets < 1 || input.sheets > 10000)
    throw new ToolError("bad-input", "Number of sheets should be a whole number from 1 to 10,000.");

  // The row whose framing limit covers the user's spacing, with the tightest limit first.
  const row = ROWS.filter(
    (r) =>
      r.t === input.thickness &&
      r.app === input.app &&
      (r.orient === "either" || r.orient === input.orientation) &&
      input.framing <= r.framing,
  ).sort((a, b) => a.framing - b.framing)[0];
  if (!row) {
    throw new ToolError(
      "no-data",
      `Table R702.3.5 has no row for ${input.thickness.replace("x-garage", " Type X")} in board on a ${input.app} installed ${input.orientation} to framing at ${input.framing} in on center. The table does not list that combination.`,
    );
  }

  const across = input.orientation === "perpendicular" ? sheet.l : sheet.w;
  const along = input.orientation === "perpendicular" ? sheet.w : sheet.l;
  const framingLines = Math.floor(across / input.framing + 1e-9) + 1;
  const screwsPerLine = Math.ceil(along / row.screw - 1e-9) + 1;
  const perSheet = framingLines * screwsPerLine;
  return {
    screwSpacing: row.screw,
    tableFraming: row.framing,
    framingLines,
    screwsPerLine,
    perSheet,
    total: perSheet * input.sheets,
    edgesOnFraming: Math.abs(across / input.framing - Math.round(across / input.framing)) < 1e-9,
    retrievedAt: DRYWALL_RETRIEVED,
  };
}
