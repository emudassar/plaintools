import { ToolError } from "./errors";

/**
 * Chainsaw file sizes and sharpening angles.
 *
 * Source 1 (the chart): Oregon catalog page FOR 149, "Saw Chain — Filing
 * Angles / Grinding Angles" (2020). Retrieved 2026-10-05 from
 *   https://www.oregonproducts.com/medias/2020-FilingGrindingAngles.pdf
 * Columns, as the page's own pictograms and footnote 3 name them:
 *   A top-plate angle, B down angle, C side-plate angle, D depth-gauge setting.
 * Rows marked (3) are square-ground chisel chain: no round file size is
 * printed; footnote 3 says a 15° cutting edge results when the file is held at
 * 45° top-plate and 45° down angle. A dash (—) in the side-plate column is
 * stored as null.
 *
 * Source 2 (drive-link numbers): Oregon "Maintenance and Safety Manual",
 * "Chain Drive-Link Number Identification" (p. 12). The number stamped on the
 * drive links gives pitch and gauge. Retrieved 2026-10-05 from
 *   https://apps.oregonproducts.com/pro/pdf/maintenance_manual/ms_02.pdf
 * That manual predates chains 68 and 80; their pitch comes from the chart's
 * own row grouping (80TXL under .325" Low Profile, 68 under .404").
 *
 * mm = inches x 25.4; the 4.5 mm file for 90PX/90SG is printed in mm.
 */

export const CHAINSAW_RETRIEVED = "2026-10-05";
export const OREGON_CHART_URL =
  "https://www.oregonproducts.com/medias/2020-FilingGrindingAngles.pdf?context=bWFzdGVyfHJvb3R8NDA2MDY0fGFwcGxpY2F0aW9uL3BkZnxoNjUvaGJmLzg4NTMxOTkzODg3MDIucGRmfGQ4MmNmZWZjZDA5MWQ3MmM0NmY0OTM4ZmFhN2MxZWUwMDA2MzgzM2Q4Y2U1MzgyYjQwMzZmYzZhZmY3ZWMzNjQ&attachment=true";
export const OREGON_MANUAL_URL =
  "https://apps.oregonproducts.com/pro/pdf/maintenance_manual/ms_02.pdf";

export type PitchId = "1/4" | ".325-lp" | "3/8-lp" | ".325" | "3/8" | ".404";

export const PITCHES: readonly { id: PitchId; label: string }[] = [
  { id: "1/4", label: '1/4"' },
  { id: ".325-lp", label: '.325" Low Profile' },
  { id: "3/8-lp", label: '3/8" Low Profile' },
  { id: ".325", label: '.325"' },
  { id: "3/8", label: '3/8"' },
  { id: ".404", label: '.404"' },
];

export interface FileSize {
  label: string;
  mm: number;
}

export interface Angles {
  top: number;
  down: number;
  /** null where the chart prints a dash. */
  side: number | null;
  /** Depth-gauge setting in inches. */
  depth: number;
}

export interface ChainRow {
  pitch: PitchId;
  /** Chain types exactly as the chart prints them. */
  chains: string;
  /** Drive-link numbers covered by the row. */
  numbers: readonly number[];
  /** null = square-ground chisel chain (footnote 3), no round file printed. */
  file: FileSize | null;
  filing: Angles;
  /** null = no grinding wheel thickness printed. */
  wheel: FileSize | null;
  grinding: Angles;
}

const inch = (label: string, num: number, den: number): FileSize => ({
  label,
  mm: (num / den) * 25.4,
});
const F532 = inch('5/32"', 5, 32);
const F316 = inch('3/16"', 3, 16);
const F732 = inch('7/32"', 7, 32);
const W18 = inch('1/8"', 1, 8);
const W316 = inch('3/16"', 3, 16);
const MM45: FileSize = { label: "4.5 mm", mm: 4.5 };

const a = (top: number, down: number, side: number | null, depth: number): Angles => ({
  top,
  down,
  side,
  depth,
});

export const CHAIN_ROWS: readonly ChainRow[] = [
  { pitch: "1/4", chains: "25AP", numbers: [25], file: F532, filing: a(30, 10, 85, 0.025), wheel: W18, grinding: a(30, 10, 55, 0.025) },
  { pitch: ".325-lp", chains: "80TXL", numbers: [80], file: F532, filing: a(25, 10, 70, 0.025), wheel: W18, grinding: a(25, 10, 70, 0.025) },
  { pitch: "3/8-lp", chains: "90PX, 90SG", numbers: [90], file: MM45, filing: a(30, 0, 75, 0.025), wheel: W18, grinding: a(30, 0, 55, 0.025) },
  { pitch: "3/8-lp", chains: "91P, 91PX, 91PXL", numbers: [91], file: F532, filing: a(30, 0, 80, 0.025), wheel: W18, grinding: a(30, 0, 55, 0.025) },
  { pitch: "3/8-lp", chains: "91VXL, M91VXL", numbers: [91], file: F532, filing: a(30, 0, 80, 0.025), wheel: W18, grinding: a(30, 0, 55, 0.025) },
  { pitch: ".325", chains: "95VPX", numbers: [95], file: F316, filing: a(30, 10, 70, 0.025), wheel: W316, grinding: a(30, 10, 55, 0.025) },
  { pitch: ".325", chains: "20, 21, 22BPX, M20, M21, M22BPX", numbers: [20, 21, 22], file: F316, filing: a(30, 10, 70, 0.025), wheel: W316, grinding: a(30, 10, 55, 0.025) },
  { pitch: ".325", chains: "95TXL", numbers: [95], file: F316, filing: a(30, 10, 70, 0.025), wheel: W316, grinding: a(30, 10, 55, 0.025) },
  { pitch: ".325", chains: "20, 21, 22LPX, LGX, M20, M21, M22LPX", numbers: [20, 21, 22], file: F316, filing: a(25, 10, 60, 0.025), wheel: W316, grinding: a(25, 10, 55, 0.025) },
  { pitch: "3/8", chains: "72, 73, 75V", numbers: [72, 73, 75], file: F732, filing: a(25, 10, 60, 0.025), wheel: W316, grinding: a(25, 10, 55, 0.025) },
  { pitch: "3/8", chains: "72, 75CJ, CK, CL", numbers: [72, 75], file: null, filing: a(45, 45, 90, 0.025), wheel: null, grinding: a(15, 45, null, 0.025) },
  { pitch: "3/8", chains: "72APX, 72, 73, 75DPX, M72, M73, M75DPX", numbers: [72, 73, 75], file: F732, filing: a(30, 10, 80, 0.025), wheel: W316, grinding: a(30, 10, 55, 0.025) },
  { pitch: "3/8", chains: "72, 73, 75EXL, EXJ, LGX, JGX, LPX, JPX", numbers: [72, 73, 75], file: F732, filing: a(25, 10, 60, 0.025), wheel: W316, grinding: a(25, 10, 55, 0.025) },
  { pitch: "3/8", chains: "M72, M73, M75LPX", numbers: [72, 73, 75], file: F732, filing: a(25, 10, 60, 0.025), wheel: W316, grinding: a(25, 10, 55, 0.025) },
  { pitch: "3/8", chains: "72, 73, 75RD", numbers: [72, 73, 75], file: F732, filing: a(10, 10, 75, 0.025), wheel: W316, grinding: a(10, 10, 50, 0.025) },
  { pitch: ".404", chains: "27X, 27AX", numbers: [27], file: F732, filing: a(30, 10, 65, 0.03), wheel: W316, grinding: a(30, 10, 55, 0.03) },
  { pitch: ".404", chains: "27R, RX, RA", numbers: [27], file: F732, filing: a(10, 10, 75, 0.03), wheel: W316, grinding: a(10, 10, 50, 0.03) },
  { pitch: ".404", chains: "58CJ, CL, 59CJ, CK, CL", numbers: [58, 59], file: null, filing: a(45, 45, 85, 0.025), wheel: null, grinding: a(15, 45, null, 0.025) },
  { pitch: ".404", chains: "58, 59J, L", numbers: [58, 59], file: F732, filing: a(25, 10, 60, 0.025), wheel: W316, grinding: a(25, 10, 55, 0.025) },
  { pitch: ".404", chains: "68LX, JX", numbers: [68], file: F732, filing: a(25, 10, 60, 0.03), wheel: W316, grinding: a(25, 10, 55, 0.03) },
  { pitch: ".404", chains: "68CJ, CL", numbers: [68], file: null, filing: a(45, 45, null, 0.03), wheel: null, grinding: a(15, 45, null, 0.03) },
];

/**
 * Drive-link numbers from the Oregon manual (p. 12) plus 68 and 80 placed by
 * the chart. Some numbers (11, 16, 18, 33–35, 50–52) have no row in the 2020
 * chart; `rowsFor` reports those as no-data. Gauge is null where neither
 * source prints it.
 */
export interface DriveLink {
  number: number;
  pitch: string;
  gauge: string | null;
}

export const DRIVE_LINKS: readonly DriveLink[] = [
  { number: 11, pitch: '3/4"', gauge: '.122"' },
  { number: 16, pitch: '.404"', gauge: '.063"' },
  { number: 18, pitch: '.404"', gauge: '.080"' },
  { number: 20, pitch: '.325"', gauge: '.050"' },
  { number: 21, pitch: '.325"', gauge: '.058"' },
  { number: 22, pitch: '.325"', gauge: '.063"' },
  { number: 25, pitch: '1/4"', gauge: '.050"' },
  { number: 27, pitch: '.404"', gauge: '.063"' },
  { number: 33, pitch: '.325"', gauge: '.050"' },
  { number: 34, pitch: '.325"', gauge: '.058"' },
  { number: 35, pitch: '.325"', gauge: '.063"' },
  { number: 50, pitch: '.404"', gauge: '.050"' },
  { number: 51, pitch: '.404"', gauge: '.058"' },
  { number: 52, pitch: '.404"', gauge: '.063"' },
  { number: 58, pitch: '.404"', gauge: '.058"' },
  { number: 59, pitch: '.404"', gauge: '.063"' },
  { number: 68, pitch: '.404"', gauge: null },
  { number: 72, pitch: '3/8"', gauge: '.050"' },
  { number: 73, pitch: '3/8"', gauge: '.058"' },
  { number: 75, pitch: '3/8"', gauge: '.063"' },
  { number: 80, pitch: '.325" Low Profile', gauge: null },
  { number: 90, pitch: '3/8" Low Profile', gauge: '.043"' },
  { number: 91, pitch: '3/8" Low Profile', gauge: '.050"' },
  { number: 95, pitch: '.325"', gauge: '.050"' },
];

/**
 * STIHL's own file sizes for STIHL chain, by pitch, from its saw chain files
 * product page (stihl.ca). Retrieved 2026-10-05. STIHL lists no file there for
 * .325" Low Profile or .404".
 */
export const STIHL_FILES_URL = "https://shop.stihl.ca/products/saw-chain-files";
export const STIHL_FILES: Partial<Record<PitchId, { file: FileSize; chains: string }>> = {
  "1/4": { file: { label: '5/32"', mm: 4.0 }, chains: '1/4", 13RM' },
  "3/8-lp": { file: { label: '5/32"', mm: 4.0 }, chains: "3/8 P, 61PMM3, 63PM, 63PM3, 63PMX, 63PS3" },
  ".325": { file: { label: '3/16"', mm: 4.8 }, chains: ".325 RM, RM3, RS" },
  "3/8": { file: { label: '13/64"', mm: 5.16 }, chains: "3/8 RM, RM3, RS, RS3, RSCLAS" },
};

/** Pitch id for a drive-link number, via the chart rows. */
export function pitchOfNumber(n: number): PitchId | null {
  return CHAIN_ROWS.find((r) => r.numbers.includes(n))?.pitch ?? null;
}

/** A selection is either a pitch or a drive-link number. */
export type ChainKey = { by: "pitch"; pitch: PitchId } | { by: "number"; number: number };

export function rowsFor(key: ChainKey): readonly ChainRow[] {
  if (key.by === "pitch") {
    if (!PITCHES.some((p) => p.id === key.pitch)) {
      throw new ToolError("bad-input", "Pick a chain pitch from the list.");
    }
    return CHAIN_ROWS.filter((r) => r.pitch === key.pitch);
  }
  const link = DRIVE_LINKS.find((d) => d.number === key.number);
  if (!link) {
    throw new ToolError("bad-input", "Pick the number stamped on your chain's drive link from the list.");
  }
  const rows = CHAIN_ROWS.filter((r) => r.numbers.includes(key.number));
  if (rows.length === 0) {
    throw new ToolError(
      "no-data",
      `Oregon's manual lists chain number ${link.number} as ${link.pitch} pitch${link.gauge ? `, ${link.gauge} gauge` : ""}, but its current filing chart has no row for that chain, so this page does not give a file size for it.`,
    );
  }
  return rows;
}

/** Distinct round-file sizes across a set of rows (square-ground rows skipped). */
export function fileSizes(rows: readonly ChainRow[]): readonly FileSize[] {
  const seen = new Map<string, FileSize>();
  for (const r of rows) if (r.file && !seen.has(r.file.label)) seen.set(r.file.label, r.file);
  return [...seen.values()];
}

export function pitchLabel(id: PitchId): string {
  return PITCHES.find((p) => p.id === id)?.label ?? id;
}
