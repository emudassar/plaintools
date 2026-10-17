import { ToolError } from "./errors";

/**
 * 37° flare (SAE J514) dash sizes — Ham-Let "SAE37 Flare 3-Piece Tube
 * Assembly" catalog (2025), "Flared tube fittings, compliant with SAE J514
 * standard", Table 2 "Allowable Working Pressure Ratings", retrieved
 * 2026-10-17. Columns as printed: nominal SAE dash size, nominal tube O.D.
 * (in), 37° flare straight thread, nominal pipe size (in), psi for union and
 * bulkhead, psi for fittings with pipe threads (316/316L stainless; the
 * catalog notes the values "should not be construed as guaranteed minimum").
 *
 * Dash number = tube O.D. in sixteenths of an inch. Thread major diameter is
 * the fraction before the dash, used to identify a fitting from a measured
 * male thread.
 */

export const HAMLET_URL = "https://s29.q4cdn.com/619069826/files/doc_downloads/2025/Jan/SAE37-FLARE-2025.pdf";
export const AN_RETRIEVED = "2026-10-17";

export interface DashRow {
  dash: number;
  tubeOd: string;
  thread: string;
  /** Thread major diameter, inches. */
  threadMajor: number;
  tpi: number;
  pipe: string;
  psiUnion: number;
  psiPipe: number;
}

export const DASH_TABLE: readonly DashRow[] = [
  { dash: 2, tubeOd: "1/8", thread: "5/16-24", threadMajor: 5 / 16, tpi: 24, pipe: "1/8", psiUnion: 5000, psiPipe: 5000 },
  { dash: 3, tubeOd: "3/16", thread: "3/8-24", threadMajor: 3 / 8, tpi: 24, pipe: "1/8", psiUnion: 5000, psiPipe: 5000 },
  { dash: 4, tubeOd: "1/4", thread: "7/16-20", threadMajor: 7 / 16, tpi: 20, pipe: "1/8", psiUnion: 5000, psiPipe: 5000 },
  { dash: 5, tubeOd: "5/16", thread: "1/2-20", threadMajor: 1 / 2, tpi: 20, pipe: "1/8", psiUnion: 5000, psiPipe: 5000 },
  { dash: 6, tubeOd: "3/8", thread: "9/16-18", threadMajor: 9 / 16, tpi: 18, pipe: "1/4", psiUnion: 5000, psiPipe: 5000 },
  { dash: 8, tubeOd: "1/2", thread: "3/4-16", threadMajor: 3 / 4, tpi: 16, pipe: "3/8", psiUnion: 4500, psiPipe: 4000 },
  { dash: 10, tubeOd: "5/8", thread: "7/8-14", threadMajor: 7 / 8, tpi: 14, pipe: "1/2", psiUnion: 3500, psiPipe: 3000 },
  { dash: 12, tubeOd: "3/4", thread: "1-1/16-12", threadMajor: 1 + 1 / 16, tpi: 12, pipe: "3/4", psiUnion: 3500, psiPipe: 3000 },
  { dash: 14, tubeOd: "7/8", thread: "1-3/16-12", threadMajor: 1 + 3 / 16, tpi: 12, pipe: "3/4", psiUnion: 3000, psiPipe: 2500 },
  { dash: 16, tubeOd: "1", thread: "1-5/16-12", threadMajor: 1 + 5 / 16, tpi: 12, pipe: "1", psiUnion: 3000, psiPipe: 2000 },
  { dash: 20, tubeOd: "1-1/4", thread: "1-5/8-12", threadMajor: 1 + 5 / 8, tpi: 12, pipe: "1-1/4", psiUnion: 2500, psiPipe: 1150 },
  { dash: 24, tubeOd: "1-1/2", thread: "1-7/8-12", threadMajor: 1 + 7 / 8, tpi: 12, pipe: "1-1/2", psiUnion: 2000, psiPipe: 1000 },
  { dash: 32, tubeOd: "2", thread: "2-1/2-12", threadMajor: 2.5, tpi: 12, pipe: "2", psiUnion: 1500, psiPipe: 1000 },
];

export function byDash(dash: number): DashRow {
  const r = DASH_TABLE.find((x) => x.dash === dash);
  if (!r) throw new ToolError("no-data", `There is no -${dash} size in the SAE J514 table used here. Sizes listed: ${DASH_TABLE.map((x) => "-" + x.dash).join(", ")}.`);
  return r;
}

/** Closest rows by measured male thread OD (inches or mm). */
export function byThreadOd(od: number, unit: "in" | "mm") {
  if (!Number.isFinite(od) || od <= 0) throw new ToolError("bad-input", "Enter the measured outside diameter of the male thread.");
  const inches = unit === "in" ? od : od / 25.4;
  if (inches < 0.2 || inches > 2.8) throw new ToolError("no-data", "That diameter is outside the -2 to -32 range of the table (about 5/16 in to 2-1/2 in).");
  const ranked = [...DASH_TABLE].map((r) => ({ row: r, diff: Math.abs(r.threadMajor - inches) })).sort((a, b) => a.diff - b.diff);
  return { inches, best: ranked[0], next: ranked[1] };
}
