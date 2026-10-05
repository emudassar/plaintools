import { ToolError } from "./errors";

/**
 * Deck joist spans and cantilevers.
 *
 * Source: International Residential Code, Table R507.6 "Maximum Deck Joist
 * Spans". Read on codes.iccsafe.org (2021 IRC and 2024 IRC) on 2026-10-05; the
 * 528 span and cantilever cells are identical in both editions. The 40 psf
 * live-load spans also match AWC DCA 6-2015 Table 2.
 *
 * Footnotes, as printed: (a) dead load = 10 psf, snow load not assumed to be
 * concurrent with live load; (b) No. 2 grade, wet service factor included;
 * (c) L/360 at main span; (d) L/180 at cantilever with a 220-pound point load
 * applied to end; (e) includes incising factor (DFL / Hem-fir / SPF);
 * (f) incising factor not included (redwood, western cedars, ponderosa pine,
 * red pine); (g) interpolation allowed, extrapolation is not allowed (joist
 * back span). NP = not permitted.
 *
 * R507.6 also says joist spacing is limited by the decking per Table R507.7.
 */

export const DECK_RETRIEVED = "2026-10-05";
export const IRC2024_URL = "https://codes.iccsafe.org/content/IRC2024P2/chapter-5-floors";
export const IRC2021_URL = "https://codes.iccsafe.org/content/IRC2021P2/chapter-5-floors";
export const DCA6_URL =
  "https://web-media.awc.org/wp-content/uploads/2022/02/17210514/AWC-DCA62015-DeckGuide-1804.pdf";

export type LoadId = "40" | "50" | "60" | "70";
export type SpeciesId = "sp" | "dfl" | "rw";
export type SizeId = "2x6" | "2x8" | "2x10" | "2x12";
export type Spacing = 12 | 16 | 24;

export const LOADS: readonly { id: LoadId; label: string }[] = [
  { id: "40", label: "40 psf live load" },
  { id: "50", label: "50 psf ground snow load" },
  { id: "60", label: "60 psf ground snow load" },
  { id: "70", label: "70 psf ground snow load" },
];

export const SPECIES: readonly { id: SpeciesId; label: string; incised: boolean }[] = [
  { id: "sp", label: "Southern pine", incised: false },
  { id: "dfl", label: "Douglas fir-larch, Hem-fir, Spruce-pine-fir", incised: true },
  { id: "rw", label: "Redwood, Western cedars, Ponderosa pine, Red pine", incised: false },
];

export const SIZES: readonly SizeId[] = ["2x6", "2x8", "2x10", "2x12"];
export const SPACINGS: readonly Spacing[] = [12, 16, 24];
export const BACK_SPANS_FT: readonly number[] = [4, 6, 8, 10, 12, 14, 16, 18];

/** Each row: spans at 12/16/24 in, then cantilevers at back spans 4..18 ft. "NP" = not permitted. */
type Row = readonly string[];
const T: Record<LoadId, Record<SpeciesId, Record<SizeId, Row>>> = {
  "40": {
    sp: {
      "2x6": ["9-11", "9-0", "7-7", "1-0", "1-6", "1-5", "NP", "NP", "NP", "NP", "NP"],
      "2x8": ["13-1", "11-10", "9-8", "1-0", "1-6", "2-0", "2-6", "2-3", "NP", "NP", "NP"],
      "2x10": ["16-2", "14-0", "11-5", "1-0", "1-6", "2-0", "2-6", "3-0", "3-4", "3-4", "NP"],
      "2x12": ["18-0", "16-6", "13-6", "1-0", "1-6", "2-0", "2-6", "3-0", "3-6", "4-0", "4-1"],
    },
    dfl: {
      "2x6": ["9-6", "8-4", "6-10", "1-0", "1-6", "1-4", "NP", "NP", "NP", "NP", "NP"],
      "2x8": ["12-6", "11-1", "9-1", "1-0", "1-6", "2-0", "2-3", "2-0", "NP", "NP", "NP"],
      "2x10": ["15-8", "13-7", "11-1", "1-0", "1-6", "2-0", "2-6", "3-0", "3-3", "NP", "NP"],
      "2x12": ["18-0", "15-9", "12-10", "1-0", "1-6", "2-0", "2-6", "3-0", "3-6", "3-11", "3-11"],
    },
    rw: {
      "2x6": ["8-10", "8-0", "6-10", "1-0", "1-4", "1-1", "NP", "NP", "NP", "NP", "NP"],
      "2x8": ["11-8", "10-7", "8-8", "1-0", "1-6", "2-0", "1-11", "NP", "NP", "NP", "NP"],
      "2x10": ["14-11", "13-0", "10-7", "1-0", "1-6", "2-0", "2-6", "3-0", "2-9", "NP", "NP"],
      "2x12": ["17-5", "15-1", "12-4", "1-0", "1-6", "2-0", "2-6", "3-0", "3-6", "3-8", "NP"],
    },
  },
  "50": {
    sp: {
      "2x6": ["9-2", "8-4", "7-4", "1-0", "1-6", "1-5", "NP", "NP", "NP", "NP", "NP"],
      "2x8": ["12-1", "11-0", "9-5", "1-0", "1-6", "2-0", "2-5", "2-3", "NP", "NP", "NP"],
      "2x10": ["15-5", "13-9", "11-3", "1-0", "1-6", "2-0", "2-6", "3-0", "3-1", "NP", "NP"],
      "2x12": ["18-0", "16-2", "13-2", "1-0", "1-6", "2-0", "2-6", "3-0", "3-6", "3-10", "3-10"],
    },
    dfl: {
      "2x6": ["8-10", "8-0", "6-8", "1-0", "1-6", "1-4", "NP", "NP", "NP", "NP", "NP"],
      "2x8": ["11-7", "10-7", "8-11", "1-0", "1-6", "2-0", "2-3", "NP", "NP", "NP", "NP"],
      "2x10": ["14-10", "13-3", "10-10", "1-0", "1-6", "2-0", "2-6", "3-0", "3-0", "NP", "NP"],
      "2x12": ["17-9", "15-5", "12-7", "1-0", "1-6", "2-0", "2-6", "3-0", "3-6", "3-8", "NP"],
    },
    rw: {
      "2x6": ["8-3", "7-6", "6-6", "1-0", "1-4", "1-1", "NP", "NP", "NP", "NP", "NP"],
      "2x8": ["10-10", "9-10", "8-6", "1-0", "1-6", "2-0", "1-11", "NP", "NP", "NP", "NP"],
      "2x10": ["13-10", "12-7", "10-5", "1-0", "1-6", "2-0", "2-6", "2-9", "NP", "NP", "NP"],
      "2x12": ["16-10", "14-9", "12-1", "1-0", "1-6", "2-0", "2-6", "3-0", "3-5", "3-5", "NP"],
    },
  },
  "60": {
    sp: {
      "2x6": ["8-8", "7-10", "6-10", "1-0", "1-6", "1-5", "NP", "NP", "NP", "NP", "NP"],
      "2x8": ["11-5", "10-4", "8-9", "1-0", "1-6", "2-0", "2-4", "NP", "NP", "NP", "NP"],
      "2x10": ["14-7", "12-9", "10-5", "1-0", "1-6", "2-0", "2-6", "2-11", "2-11", "NP", "NP"],
      "2x12": ["17-3", "15-0", "12-3", "1-0", "1-6", "2-0", "2-6", "3-0", "3-6", "3-7", "NP"],
    },
    dfl: {
      "2x6": ["8-4", "7-6", "6-2", "1-0", "1-6", "1-4", "NP", "NP", "NP", "NP", "NP"],
      "2x8": ["10-11", "9-11", "8-3", "1-0", "1-6", "2-0", "2-2", "NP", "NP", "NP", "NP"],
      "2x10": ["13-11", "12-4", "10-0", "1-0", "1-6", "2-0", "2-6", "2-10", "NP", "NP", "NP"],
      "2x12": ["16-6", "14-3", "11-8", "1-0", "1-6", "2-0", "2-6", "3-0", "3-5", "3-5", "NP"],
    },
    rw: {
      "2x6": ["7-9", "7-0", "6-2", "1-0", "1-4", "NP", "NP", "NP", "NP", "NP", "NP"],
      "2x8": ["10-2", "9-3", "7-11", "1-0", "1-6", "2-0", "1-11", "NP", "NP", "NP", "NP"],
      "2x10": ["13-0", "11-9", "9-7", "1-0", "1-6", "2-0", "2-6", "2-7", "NP", "NP", "NP"],
      "2x12": ["15-9", "13-8", "11-2", "1-0", "1-6", "2-0", "2-6", "3-0", "3-2", "NP", "NP"],
    },
  },
  "70": {
    sp: {
      "2x6": ["8-3", "7-6", "6-5", "1-0", "1-6", "1-5", "NP", "NP", "NP", "NP", "NP"],
      "2x8": ["10-10", "9-10", "8-2", "1-0", "1-6", "2-0", "2-2", "NP", "NP", "NP", "NP"],
      "2x10": ["13-9", "11-11", "9-9", "1-0", "1-6", "2-0", "2-6", "2-9", "NP", "NP", "NP"],
      "2x12": ["16-2", "14-0", "11-5", "1-0", "1-6", "2-0", "2-6", "3-0", "3-5", "3-5", "NP"],
    },
    dfl: {
      "2x6": ["7-11", "7-1", "5-9", "1-0", "1-6", "NP", "NP", "NP", "NP", "NP", "NP"],
      "2x8": ["10-5", "9-5", "7-8", "1-0", "1-6", "2-0", "2-1", "NP", "NP", "NP", "NP"],
      "2x10": ["13-3", "11-6", "9-5", "1-0", "1-6", "2-0", "2-6", "2-8", "NP", "NP", "NP"],
      "2x12": ["15-5", "13-4", "10-11", "1-0", "1-6", "2-0", "2-6", "3-0", "3-3", "NP", "NP"],
    },
    rw: {
      "2x6": ["7-4", "6-8", "5-10", "1-0", "1-4", "NP", "NP", "NP", "NP", "NP", "NP"],
      "2x8": ["9-8", "8-10", "7-4", "1-0", "1-6", "1-11", "NP", "NP", "NP", "NP", "NP"],
      "2x10": ["12-4", "11-0", "9-0", "1-0", "1-6", "2-0", "2-6", "2-6", "NP", "NP", "NP"],
      "2x12": ["14-9", "12-9", "10-5", "1-0", "1-6", "2-0", "2-6", "3-0", "3-0", "NP", "NP"],
    },
  },
};

/** Every cell in table order (load, species, size), for cross-checking against the source. */
export function allCells(): string[] {
  const out: string[] = [];
  for (const l of LOADS) for (const s of SPECIES) for (const z of SIZES) out.push(...T[l.id][s.id][z]);
  return out;
}

/** "13-1" -> 157 inches; "NP" -> null. */
export function parseFtIn(cell: string): number | null {
  if (cell === "NP") return null;
  const [ft, inch] = cell.split("-").map(Number);
  return ft * 12 + inch;
}

export function formatFtIn(inches: number): string {
  const whole = Math.floor(inches + 1e-9);
  return `${Math.floor(whole / 12)}′-${whole % 12}″`;
}

export interface DeckJoistInput {
  load: LoadId;
  species: SpeciesId;
  size: SizeId;
  spacing: Spacing;
  /** Planned span in feet (decimal), or null. */
  plannedSpanFt: number | null;
  /** Back span for the cantilever lookup, in feet, or null. */
  backSpanFt: number | null;
}

export type CantileverResult =
  | { status: "value"; inches: number; interpolated: boolean; between: [number, number] | null }
  | { status: "np" }
  | { status: "below-table" }
  | { status: "above-table" }
  | { status: "exceeds-span"; allowedIn: number };

export interface DeckJoistResult {
  spanIn: number;
  spanCell: string;
  spansBySpacing: { spacing: Spacing; cell: string }[];
  cantileverRow: { backSpanFt: number; cell: string }[];
  planned: { inches: number; within: boolean } | null;
  cantilever: CantileverResult | null;
  retrievedAt: string;
}

function lookupCantilever(row: Row, backFt: number, allowedSpanIn: number): CantileverResult {
  if (backFt * 12 > allowedSpanIn + 1e-9) return { status: "exceeds-span", allowedIn: allowedSpanIn };
  if (backFt < BACK_SPANS_FT[0] - 1e-9) return { status: "below-table" };
  if (backFt > BACK_SPANS_FT[BACK_SPANS_FT.length - 1] + 1e-9) return { status: "above-table" };
  const cells = row.slice(3);
  const exact = BACK_SPANS_FT.findIndex((b) => Math.abs(b - backFt) < 1e-9);
  if (exact >= 0) {
    const v = parseFtIn(cells[exact]);
    return v === null ? { status: "np" } : { status: "value", inches: v, interpolated: false, between: null };
  }
  const hi = BACK_SPANS_FT.findIndex((b) => b > backFt);
  const lo = hi - 1;
  const a = parseFtIn(cells[lo]);
  const b = parseFtIn(cells[hi]);
  // Interpolating toward "not permitted" has no number to use; report NP.
  if (a === null || b === null) return { status: "np" };
  const t = (backFt - BACK_SPANS_FT[lo]) / (BACK_SPANS_FT[hi] - BACK_SPANS_FT[lo]);
  return {
    status: "value",
    inches: a + (b - a) * t,
    interpolated: true,
    between: [BACK_SPANS_FT[lo], BACK_SPANS_FT[hi]],
  };
}

function finite(label: string, v: number) {
  if (!Number.isFinite(v)) throw new ToolError("bad-input", `${label} must be a number.`);
  if (v <= 0) throw new ToolError("bad-input", `${label} must be more than zero.`);
  if (v > 100) throw new ToolError("bad-input", `${label} is over 100 feet. Enter it in feet.`);
}

export function lookupDeckJoist(input: DeckJoistInput): DeckJoistResult {
  const bySpecies = T[input.load]?.[input.species];
  const row = bySpecies?.[input.size];
  const col = SPACINGS.indexOf(input.spacing);
  if (!row || col < 0) throw new ToolError("bad-input", "Pick a load, species, size and spacing from the lists.");

  const spanCell = row[col];
  const spanIn = parseFtIn(spanCell) as number;

  let planned: DeckJoistResult["planned"] = null;
  if (input.plannedSpanFt !== null) {
    finite("Planned span", input.plannedSpanFt);
    const inches = input.plannedSpanFt * 12;
    planned = { inches, within: inches <= spanIn + 1e-9 };
  }
  let cantilever: CantileverResult | null = null;
  if (input.backSpanFt !== null) {
    finite("Back span", input.backSpanFt);
    cantilever = lookupCantilever(row, input.backSpanFt, spanIn);
  }

  return {
    spanIn,
    spanCell,
    spansBySpacing: SPACINGS.map((s, i) => ({ spacing: s, cell: row[i] })),
    cantileverRow: BACK_SPANS_FT.map((b, i) => ({ backSpanFt: b, cell: row[3 + i] })),
    planned,
    cantilever,
    retrievedAt: DECK_RETRIEVED,
  };
}
