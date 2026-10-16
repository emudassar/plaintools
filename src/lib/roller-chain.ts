import { ToolError } from "./errors";

/**
 * ANSI roller chain sizes.
 *
 * Source: Tsubaki Europe, "ANSI G8" standard roller chain page, single-strand
 * tables (dimensions and strength), read 2026-10-16:
 *   https://tsubaki.eu/products/chain/drive-chain/standard-roller-chain/ansi-g8/
 * Values in mm as printed. RS37 and RS38 (Tsubaki-specific) are left out; RS41
 * is the standard ANSI 41 light-duty chain. Strength is "min. tensile strength
 * acc. to ISO 606" (kN) as printed; RS37/38 have none and RS25's is 3.6 kN.
 *
 * The ANSI number's leading digit(s) give the pitch in eighths of an inch
 * (40 → 4/8 = 1/2 in); that is visible in the table itself.
 */

export const CHAIN_RETRIEVED = "2026-10-16";
export const TSUBAKI_URL = "https://tsubaki.eu/products/chain/drive-chain/standard-roller-chain/ansi-g8/";

export interface Chain {
  no: string;
  pitchMm: number;
  pitchIn: string;
  rollerMm: number;
  innerWidthMm: number;
  pinMm: number;
  plateThickMm: number;
  plateHeightMm: number;
  isoKn: number | null;
  massKgM: number;
}

export const CHAINS: readonly Chain[] = [
  { no: "25", pitchMm: 6.35, pitchIn: "1/4", rollerMm: 3.3, innerWidthMm: 3.18, pinMm: 2.31, plateThickMm: 0.74, plateHeightMm: 5.84, isoKn: 3.6, massKgM: 0.14 },
  { no: "35", pitchMm: 9.525, pitchIn: "3/8", rollerMm: 5.08, innerWidthMm: 4.78, pinMm: 3.59, plateThickMm: 1.25, plateHeightMm: 9.0, isoKn: 8.7, massKgM: 0.33 },
  { no: "40", pitchMm: 12.7, pitchIn: "1/2", rollerMm: 7.92, innerWidthMm: 7.95, pinMm: 3.97, plateThickMm: 1.5, plateHeightMm: 12.0, isoKn: 15.2, massKgM: 0.64 },
  { no: "41", pitchMm: 12.7, pitchIn: "1/2", rollerMm: 7.77, innerWidthMm: 6.38, pinMm: 3.59, plateThickMm: 1.25, plateHeightMm: 9.8, isoKn: 7.4, massKgM: 0.41 },
  { no: "50", pitchMm: 15.875, pitchIn: "5/8", rollerMm: 10.16, innerWidthMm: 9.53, pinMm: 5.09, plateThickMm: 2.0, plateHeightMm: 15.0, isoKn: 24.0, massKgM: 1.04 },
  { no: "60", pitchMm: 19.05, pitchIn: "3/4", rollerMm: 11.91, innerWidthMm: 12.7, pinMm: 5.96, plateThickMm: 2.4, plateHeightMm: 18.1, isoKn: 34.2, massKgM: 1.53 },
  { no: "80", pitchMm: 25.4, pitchIn: "1", rollerMm: 15.88, innerWidthMm: 15.88, pinMm: 7.94, plateThickMm: 3.2, plateHeightMm: 24.1, isoKn: 61.2, massKgM: 2.66 },
  { no: "100", pitchMm: 31.75, pitchIn: "1 1/4", rollerMm: 19.05, innerWidthMm: 19.05, pinMm: 9.54, plateThickMm: 4.0, plateHeightMm: 30.1, isoKn: 95.4, massKgM: 3.99 },
  { no: "120", pitchMm: 38.1, pitchIn: "1 1/2", rollerMm: 22.23, innerWidthMm: 25.4, pinMm: 11.11, plateThickMm: 4.8, plateHeightMm: 36.2, isoKn: 137.1, massKgM: 5.93 },
  { no: "140", pitchMm: 44.45, pitchIn: "1 3/4", rollerMm: 25.4, innerWidthMm: 25.4, pinMm: 12.71, plateThickMm: 5.6, plateHeightMm: 42.2, isoKn: 185.9, massKgM: 7.49 },
  { no: "160", pitchMm: 50.8, pitchIn: "2", rollerMm: 28.58, innerWidthMm: 31.75, pinMm: 14.29, plateThickMm: 6.4, plateHeightMm: 48.2, isoKn: 244.6, massKgM: 10.1 },
  { no: "180", pitchMm: 57.15, pitchIn: "2 1/4", rollerMm: 35.71, innerWidthMm: 35.72, pinMm: 17.46, plateThickMm: 7.15, plateHeightMm: 54.2, isoKn: 308.2, massKgM: 13.45 },
  { no: "200", pitchMm: 63.5, pitchIn: "2 1/2", rollerMm: 39.68, innerWidthMm: 38.1, pinMm: 19.85, plateThickMm: 8.0, plateHeightMm: 60.3, isoKn: 381.7, massKgM: 16.49 },
  { no: "240", pitchMm: 76.2, pitchIn: "3", rollerMm: 47.63, innerWidthMm: 47.63, pinMm: 23.81, plateThickMm: 9.5, plateHeightMm: 72.4, isoKn: 550.4, massKgM: 24.5 },
];

export const MM_PER_IN = 25.4;

export interface ChainInput {
  unit: "in" | "mm";
  /** Length measured over `pitches` pitches (pin centre to pin centre). */
  span: number;
  pitches: number;
  roller: number | null;
  innerWidth: number | null;
}

export interface ChainMatch {
  chain: Chain;
  pitchErrPct: number;
  rollerErrPct: number | null;
  widthErrPct: number | null;
}

export interface ChainResult {
  measuredPitchMm: number;
  best: ChainMatch | null;
  /** Chains sharing the best pitch, ranked by roller/width fit. */
  candidates: ChainMatch[];
  /** True when two chains share the pitch and no roller/width was given to separate them. */
  ambiguous: boolean;
  retrievedAt: string;
}

const pct = (a: number, b: number) => (Math.abs(a - b) / b) * 100;

export function identifyChain(input: ChainInput): ChainResult {
  const k = input.unit === "in" ? MM_PER_IN : 1;
  if (!Number.isFinite(input.span) || input.span <= 0) throw new ToolError("bad-input", "Enter the measured length between pin centres.");
  if (!Number.isInteger(input.pitches) || input.pitches < 1 || input.pitches > 100)
    throw new ToolError("bad-input", "The number of pitches measured should be a whole number from 1 to 100.");
  const pitch = (input.span * k) / input.pitches;
  const roller = input.roller === null ? null : input.roller * k;
  const width = input.innerWidth === null ? null : input.innerWidth * k;
  if (roller !== null && (!Number.isFinite(roller) || roller <= 0)) throw new ToolError("bad-input", "Roller diameter should be a positive number, or leave it blank.");
  if (width !== null && (!Number.isFinite(width) || width <= 0)) throw new ToolError("bad-input", "Inner width should be a positive number, or leave it blank.");

  const nearest = [...CHAINS].sort((a, b) => Math.abs(a.pitchMm - pitch) - Math.abs(b.pitchMm - pitch))[0];
  const pitchErr = pct(pitch, nearest.pitchMm);
  if (pitchErr > 5) {
    return { measuredPitchMm: pitch, best: null, candidates: [], ambiguous: false, retrievedAt: CHAIN_RETRIEVED };
  }
  const candidates = CHAINS.filter((c) => c.pitchMm === nearest.pitchMm)
    .map((c) => ({
      chain: c,
      pitchErrPct: pct(pitch, c.pitchMm),
      rollerErrPct: roller === null ? null : pct(roller, c.rollerMm),
      widthErrPct: width === null ? null : pct(width, c.innerWidthMm),
    }))
    .sort((a, b) => (a.rollerErrPct ?? 0) + (a.widthErrPct ?? 0) - ((b.rollerErrPct ?? 0) + (b.widthErrPct ?? 0)));
  return {
    measuredPitchMm: pitch,
    best: candidates[0],
    candidates,
    ambiguous: candidates.length > 1 && roller === null && width === null,
    retrievedAt: CHAIN_RETRIEVED,
  };
}
