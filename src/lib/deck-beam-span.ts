import { ToolError } from "./errors";

/**
 * Deck beam spans.
 *
 * Source: International Residential Code 2024, Tables R507.5(1)–(4) "Maximum
 * Deck Beam Span" (40 psf live load; 50, 60 and 70 psf ground snow load), read
 * on codes.iccsafe.org on 2026-10-16. Every cell below is transcribed as the
 * page prints it. The 2024 tables key each column to joist span + joist
 * cantilever pairs (the header rows, transcribed in COLUMNS).
 *
 * Cross-check: the 2021 IRC prints the same tables keyed by "effective joist
 * span" 6–18 ft. Those seven columns equal 2024 columns 2, 4, 5, 7, 8, 9, 10
 * cell for cell, except where one edition's web text is visibly garbled
 * (e.g. 2021 "604", "6-22", "5-20"). Cells that fail the cross-check, or that
 * break the table's own ordering (a span longer than the next-larger beam's,
 * or longer than the column to its left), are listed in SUSPECT and shown as
 * "check printed table" rather than guessed. See scripts in the research note.
 *
 * Footnotes (2021 wording, same table): (a) interpolation permitted,
 * extrapolation not permitted; (b) beams supporting a single span of joists
 * with or without cantilever; (c) dead load 10 psf, L/Δ = 360 at main span,
 * L/Δ = 180 at cantilever, snow load not concurrent with live load;
 * (d) No. 2 grade, wet service factor included; (e) beam depth ≥ depth of
 * intersecting joist for a flush beam connection; (f) beam cantilevers limited
 * to the adjacent beam's span divided by 4; (g) includes incising factor;
 * (h) incising factor not included.
 */

export const BEAM_RETRIEVED = "2026-10-16";
export const IRC2024_URL = "https://codes.iccsafe.org/content/IRC2024P2/chapter-5-floors";
export const IRC2021_URL = "https://codes.iccsafe.org/content/IRC2021P2/chapter-5-floors";

export type LoadId = "40" | "50" | "60" | "70";
export type SpeciesId = "sp" | "dfl" | "rw";

export const LOADS: readonly { id: LoadId; label: string; table: string }[] = [
  { id: "40", label: "40 psf live load", table: "R507.5(1)" },
  { id: "50", label: "50 psf ground snow load", table: "R507.5(2)" },
  { id: "60", label: "60 psf ground snow load", table: "R507.5(3)" },
  { id: "70", label: "70 psf ground snow load", table: "R507.5(4)" },
];

export const SPECIES: readonly { id: SpeciesId; label: string; footnote: string }[] = [
  { id: "sp", label: "Southern pine", footnote: "" },
  { id: "dfl", label: "Douglas fir-larch, Hem-fir, Spruce-pine-fir", footnote: "incising factor included" },
  { id: "rw", label: "Redwood, Western cedars, Ponderosa pine, Red pine", footnote: "incising factor not included" },
];

export const BEAM_SIZES = [
  "1-2x6", "1-2x8", "1-2x10", "1-2x12",
  "2-2x6", "2-2x8", "2-2x10", "2-2x12",
  "3-2x6", "3-2x8", "3-2x10", "3-2x12",
] as const;
export type BeamSize = (typeof BEAM_SIZES)[number];

export const beamLabel = (s: BeamSize) => {
  const [ply, size] = s.split("-");
  return `${ply} – ${size.replace("x", " × ")}`;
};

/**
 * Column (0-based) for each joist span & cantilever pair, as printed in the
 * header rows. "6:0" = 6 ft joist span, 0 ft cantilever.
 */
const COLS_BASE: Record<string, number> = {
  "6:0": 0, "6:1.5": 1,
  "8:0": 1, "8:1": 2, "8:2": 3,
  "10:0": 2, "10:1": 3, "10:2.5": 4,
  "12:0": 3, "12:1": 4, "12:2": 5, "12:3": 6,
  "14:0": 4, "14:1": 5, "14:2": 6, "14:3.5": 7,
  "16:0": 5, "16:1": 6, "16:2.5": 7,
  "18:0": 6, "18:1.5": 7, "18:3": 8, "18:4.5": 9,
};
export const COLUMNS: Record<LoadId, Record<string, number>> = {
  "40": COLS_BASE,
  "50": COLS_BASE,
  "60": { ...COLS_BASE, "16:4": 8 },
  // Table R507.5(4) prints "18 & 1" where the other three print "18 & 1.5".
  "70": (() => {
    const c: Record<string, number> = { ...COLS_BASE, "16:4": 8 };
    delete c["18:1.5"];
    c["18:1"] = 7;
    return c;
  })(),
};

export const JOIST_SPANS = [6, 8, 10, 12, 14, 16, 18] as const;

export function cantileversFor(load: LoadId, joistSpan: number): number[] {
  return Object.keys(COLUMNS[load])
    .map((k) => k.split(":").map(Number))
    .filter(([s]) => s === joistSpan)
    .map(([, c]) => c)
    .sort((a, b) => a - b);
}

type Rows = Record<BeamSize, string>;
/** Ten cells per row, space-separated, exactly as printed (feet-inches). */
const T: Record<LoadId, Record<SpeciesId, Rows>> = {
  "40": {
    sp: {
      "1-2x6": "4-10 4-7 4-3 4-0 3-7 3-5 3-3 3-0 2-10 2-8",
      "1-2x8": "6-4 5-11 5-6 5-1 4-7 4-4 4-2 3-10 3-7 3-5",
      "1-2x10": "7-6 7-0 6-6 6-0 5-5 5-2 4-11 4-7 4-3 4-0",
      "1-2x12": "8-8 8-3 7-8 7-1 6-4 6-1 5-10 5-5 5-0 4-9",
      "2-2x6": "7-4 6-11 6-5 5-11 5-4 5-1 4-10 4-6 4-3 4-0",
      "2-2x8": "9-4 8-9 8-2 7-7 6-9 6-5 6-2 5-9 5-4 5-0",
      "2-2x10": "11-0 10-4 9-8 9-0 8-0 7-8 7-4 6-9 6-4 6-0",
      "2-2x12": "13-0 12-2 11-4 10-7 9-5 9-0 8-7 8-0 7-5 7-0",
      "3-2x6": "9-0 8-6 7-11 7-5 6-8 6-4 6-1 5-8 5-3 4-11",
      "3-2x8": "11-7 10-11 10-3 9-6 8-6 8-1 7-9 7-2 6-8 6-4",
      "3-2x10": "13-11 13-0 12-1 11-2 10-0 9-7 9-2 8-6 7-11 7-6",
      "3-2x12": "16-3 15-3 14-3 13-3 11-10 11-3 10-9 10-0 9-4 8-10",
    },
    dfl: {
      "1-2x6": "4-5 4-1 3-9 3-6 3-0 2-10 2-8 2-5 2-3 2-1",
      "1-2x8": "5-11 5-6 5-1 4-8 4-0 3-9 3-6 3-2 2-11 2-9",
      "1-2x10": "7-1 6-8 6-3 5-10 5-1 4-9 4-6 4-1 3-9 3-6",
      "1-2x12": "8-3 7-9 7-3 6-9 6-0 5-9 5-6 5-0 3-9 3-6",
      "2-2x6": "6-6 6-1 5-8 5-3 4-9 4-6 4-4 3-11 3-7 3-3",
      "2-2x8": "8-8 8-2 7-7 7-1 6-4 6-0 5-9 5-2 4-8 4-4",
      "2-2x10": "10-8 10-0 9-3 8-7 7-9 7-4 7-0 6-6 6-0 5-6",
      "2-2x12": "12-4 11-7 10-9 10-0 8-11 8-6 8-2 7-7 7-1 6-8",
      "3-2x6": "8-2 7-8 7-2 6-8 6-0 5-9 5-6 5-1 4-9 4-6",
      "3-2x8": "10-11 10-3 9-6 8-10 7-11 7-7 7-3 6-8 6-3 5-11",
      "3-2x10": "13-4 12-6 11-8 10-10 9-8 9-3 8-10 8-2 7-8 7-2",
      "3-2x12": "15-6 14-6 13-6 12-7 11-3 10-9 10-3 9-6 8-11 8-5",
    },
    rw: {
      "1-2x6": "4-5 4-2 3-10 3-7 3-1 2-11 2-9 2-6 2-3 2-2",
      "1-2x8": "5-8 5-4 4-11 4-7 4-1 3-10 3-7 3-3 3-0 2-10",
      "1-2x10": "6-11 6-6 6-0 5-7 5-0 4-9 4-7 4-2 3-10 3-7",
      "1-2x12": "8-0 7-6 7-0 6-6 5-10 5-7 5-4 4-11 4-7 4-4",
      "2-2x6": "6-7 6-2 5-9 5-4 4-10 4-7 4-5 4-0 3-8 3-4",
      "2-2x8": "8-4 7-10 7-4 6-10 6-1 5-10 5-7 5-2 4-10 4-5",
      "2-2x10": "12-2 9-7 8-11 8-4 7-5 7-1 6-9 6-3 5-10 5-6",
      "2-2x12": "11-9 11-1 10-4 9-8 8-7 8-2 7-10 7-3 6-10 6-5",
      "3-2x6": "8-1 7-8 7-2 6-9 6-0 5-9 5-6 5-1 4-9 4-6",
      "3-2x8": "10-6 9-10 9-2 8-6 7-7 7-3 6-11 6-5 6-0 5-8",
      "3-2x10": "12-9 12-0 11-2 10-5 9-4 8-11 8-6 7-10 7-4 6-11",
      "3-2x12": "14-10 13-11 13-0 12-1 10-9 10-3 9-10 9-1 8-6 8-1",
    },
  },
  "50": {
    sp: {
      "1-2x6": "4-9 4-6 4-2 3-11 3-6 3-4 3-2 2-11 2-9 2-7",
      "1-2x8": "6-2 5-9 5-4 4-11 4-5 4-2 4-0 3-9 3-6 3-3",
      "1-2x10": "7-2 6-9 6-3 5-10 5-3 5-0 4-9 4-5 4-2 3-11",
      "1-2x12": "8-6 8-0 7-5 6-11 6-2 5-11 5-8 5-3 4-11 4-7",
      "2-2x6": "7-1 6-8 6-2 5-9 5-2 4-11 4-9 4-4 4-1 3-10",
      "2-2x8": "9-1 8-6 7-11 7-4 6-7 6-3 6-0 5-7 5-2 4-11",
      "2-2x10": "10-9 10-1 9-5 8-9 7-10 7-5 7-1 6-7 6-2 5-10",
      "2-2x12": "12-9 11-11 11-1 10-3 9-2 8-9 8-5 7-9 7-3 6-10",
      "3-2x6": "8-3 7-11 7-6 7-2 6-6 6-2 5-11 5-6 5-1 4-10",
      "3-2x8": "11-0 10-5 9-10 9-3 8-3 7-10 7-6 6-11 6-6 6-2",
      "3-2x10": "13-6 12-8 11-9 10-11 9-9 8-4 8-11 8-3 7-9 7-3",
      "3-2x12": "15-11 14-11 13-11 12-11 11-6 11-0 10-6 9-9 9-1 8-7",
    },
    dfl: {
      "1-2x6": "4-3 4-0 3-8 3-5 2-11 2-9 2-7 2-4 2-2 2-0",
      "1-2x8": "5-9 5-4 4-11 4-7 3-11 3-8 3-5 3-1 2-10 2-8",
      "1-2x10": "7-0 6-7 6-1 5-8 4-11 4-8 4-5 4-0 3-8 3-5",
      "1-2x12": "8-1 7-7 7-1 6-7 5-11 5-7 5-4 4-10 4-6 4-2",
      "2-2x6": "6-5 6-0 5-7 5-2 4-7 4-4 4-2 3-10 3-5 3-2",
      "2-2x8": "8-6 8-0 7-5 6-11 6-2 5-11 5-8 5-0 4-7 4-2",
      "2-2x10": "10-5 9-9 9-1 8-5 7-7 7-3 6-11 6-4 5-10 5-4",
      "2-2x12": "12-1 11-4 10-7 9-10 8-9 8-4 8-0 7-5 6-11 6-6",
      "3-2x6": "8-0 7-6 7-0 6-6 5-9 5-6 5-3 4-11 4-7 4-4",
      "3-2x8": "10-8 10-0 9-4 8-8 7-9 7-5 7-1 6-6 6-1 5-8",
      "3-2x10": "13-1 12-3 11-5 10-7 9-6 9-1 8-8 8-0 7-6 7-0",
      "3-2x12": "15-2 14-3 13-3 12-4 11-0 10-6 10-1 9-4 8-9 8-3",
    },
    rw: {
      "1-2x6": "4-4 4-1 3-9 3-6 3-0 2-10 2-8 2-5 2-3 2-1",
      "1-2x8": "5-6 5-2 4-10 4-6 4-0 3-9 3-6 3-2 2-11 2-9",
      "1-2x10": "6-9 6-4 5-11 5-6 4-11 4-8 4-6 4-1 3-9 3-6",
      "1-2x12": "7-10 7-4 6-10 6-4 5-8 5-5 5-2 4-10 4-6 4-3",
      "2-2x6": "6-6 6-1 5-8 5-3 4-8 4-6 4-4 3-11 3-6 3-3",
      "2-2x8": "8-2 7-8 7-2 6-8 5-11 5-8 5-5 5-0 4-8 4-3",
      "2-2x10": "10-0 9-5 8-9 8-2 7-3 6-11 6-8 6-2 5-9 5-5",
      "2-2x12": "11-8 10-11 10-2 9-5 8-5 8-0 7-8 7-2 6-8 6-3",
      "3-2x6": "7-5 7-1 6-9 6-5 5-11 5-8 5-5 5-0 4-8 4-5",
      "3-2x8": "9-10 9-4 8-10 8-4 7-5 7-1 6-10 6-4 5-11 5-7",
      "3-2x10": "12-6 11-9 10-11 10-2 9-1 8-8 8-4 7-8 7-2 6-9",
      "3-2x12": "14-7 13-8 12-9 11-10 10-7 10-1 9-8 8-11 8-4 7-10",
    },
  },
  "60": {
    sp: {
      "1-2x6": "4-5 4-2 3-10 3-7 3-3 3-1 2-11 2-9 2-6 2-5",
      "1-2x8": "5-7 5-3 4-11 4-7 4-1 3-11 3-9 3-5 3-3 3-0",
      "1-2x10": "6-8 6-3 5-10 5-5 4-10 4-7 4-5 4-1 3-10 3-7",
      "1-2x12": "7-11 7-5 6-11 6-5 5-9 5-6 5-3 4-10 4-6 4-3",
      "2-2x6": "6-7 6-2 5-9 5-4 4-9 4-6 4-4 4-0 3-9 3-7",
      "2-2x8": "8-4 7-10 7-4 6-10 6-1 5-10 5-7 5-2 4-10 4-6",
      "2-2x10": "9-10 9-4 8-8 8-1 7-3 6-11 6-7 6-1 5-8 5-4",
      "2-2x12": "11-9 11-0 10-3 9-6 8-6 8-1 7-9 7-2 6-9 6-4",
      "3-2x6": "7-9 7-5 7-1 6-9 6-0 5-9 5-6 5-1 4-9 4-6",
      "3-2x8": "10-4 9-9 9-1 8-6 7-8 7-3 6-11 6-5 6-0 5-8",
      "3-2x10": "12-5 11-8 10-11 10-2 9-1 8-8 8-3 7-8 7-2 6-9",
      "3-2x12": "14-8 13-9 12-10 11-11 10-8 10-2 9-9 9-0 8-5 7-11",
    },
    dfl: {
      "1-2x6": "3-11 3-8 3-4 3-1 2-8 2-6 2-4 2-2 2-0 1-10",
      "1-2x8": "5-5 5-0 4-6 4-1 3-6 3-3 3-1 2-10 2-7 2-5",
      "1-2x10": "6-6 6-1 5-7 5-2 4-6 4-3 4-0 3-7 3-4 3-2",
      "1-2x12": "7-7 7-1 6-7 6-1 5-5 5-1 4-10 4-5 4-1 3-10",
      "2-2x6": "5-10 5-6 5-1 4-9 4-3 4-0 3-10 3-5 3-1 2-10",
      "2-2x8": "7-11 7-5 6-11 6-5 5-9 5-4 5-0 4-6 4-1 3-9",
      "2-2x10": "9-7 9-0 8-5 7-10 7-0 6-8 6-4 5-9 5-2 4-10",
      "2-2x12": "11-2 10-6 9-9 9-1 8-1 7-9 7-5 6-10 6-4 5-10",
      "3-2x6": "7-4 6-11 6-5 6-0 5-4 5-1 4-11 4-6 4-2 3-10",
      "3-2x8": "9-10 9-3 8-7 8-0 7-2 6-10 6-6 6-1 5-6 5-0",
      "3-2x10": "12-1 11-4 10-7 9-10 8-9 8-4 8-0 7-5 6-11 6-5",
      "3-2x12": "13-6 13-2 11-9 11-5 10-2 9-9 9-4 8-7 8-1 7-7",
    },
    rw: {
      "1-2x6": "4-0 3-9 3-5 3-2 2-9 2-7 2-5 2-2 2-0 1-11",
      "1-2x8": "5-2 4-10 4-6 4-2 3-7 3-4 3-2 2-11 2-8 2-6",
      "1-2x10": "6-2 5-10 5-5 5-1 4-6 4-3 4-1 3-8 3-5 3-3",
      "1-2x12": "7-3 6-10 6-4 5-11 5-3 5-0 4-10 4-5 4-2 3-11",
      "2-2x6": "5-11 5-7 5-2 4-10 4-4 4-1 3-11 3-6 3-2 2-11",
      "2-2x8": "7-6 7-1 6-7 6-2 5-6 5-3 5-0 4-7 4-2 3-10",
      "2-2x10": "9-3 8-8 8-1 7-6 6-9 6-5 6-2 5-8 5-4 4-11",
      "2-2x12": "10-8 10-1 9-5 8-9 7-10 7-6 7-2 6-7 6-2 5-10",
      "3-2x6": "6-11 6-8 6-4 6-1 5-5 5-2 5-0 4-7 4-3 3-11",
      "3-2x8": "9-3 8-9 8-3 7-9 6-11 6-7 6-4 5-10 5-5 5-3",
      "3-2x10": "11-8 10-11 10-2 9-5 8-5 8-0 7-8 7-3 6-8 6-3",
      "3-2x12": "13-6 12-8 11-9 10-11 9-9 8-4 8-11 8-3 7-9 7-3",
    },
  },
  "70": {
    sp: {
      "1-2x6": "4-2 3-11 3-7 3-4 3-0 2-10 2-9 2-6 2-4 2-3",
      "1-2x8": "5-4 4-11 4-8 4-3 3-10 3-8 3-6 3-3 3-0 2-10",
      "1-2x10": "6-2 5-10 5-5 5-1 4-6 4-4 4-2 3-10 3-7 3-4",
      "1-2x12": "7-4 6-11 6-5 6-0 5-4 5-1 4-11 4-6 4-3 4-0",
      "2-2x6": "6-3 5-9 5-4 5-0 4-6 4-3 4-1 3-9 3-6 3-4",
      "2-2x8": "7-10 7-4 6-10 6-4 5-8 5-5 5-2 4-10 4-6 4-3",
      "2-2x10": "9-6 8-9 8-2 7-7 6-9 6-5 6-2 5-8 5-4 5-0",
      "2-2x12": "10-11 10-3 9-7 8-11 8-0 7-7 7-3 6-9 6-3 5-11",
      "3-2x6": "7-4 7-0 6-7 6-3 5-7 5-4 5-1 4-9 4-5 4-2",
      "3-2x8": "9-10 9-3 8-7 8-0 7-2 6-10 6-6 6-0 5-8 5-4",
      "3-2x10": "11-7 10-11 10-2 9-6 8-6 8-1 7-9 7-2 6-8 6-4",
      "3-2x12": "13-9 12-11 12-0 11-2 10-0 9-6 9-1 8-5 7-11 7-5",
    },
    dfl: {
      "1-2x6": "3-8 3-5 3-1 2-10 2-5 2-3 2-2 2-0 1-10 1-9",
      "1-2x8": "4-10 4-7 4-1 3-8 3-2 3-0 2-10 2-7 2-5 2-4",
      "1-2x10": "6-1 5-8 5-2 4-9 4-1 3-10 3-8 3-4 3-1 2-11",
      "1-2x12": "7-0 6-7 6-1 5-8 5-0 4-9 4-6 4-1 3-10 3-7",
      "2-2x6": "5-6 5-2 4-10 4-6 4-0 3-8 3-5 3-1 2-10 2-7",
      "2-2x8": "7-4 6-11 6-5 6-0 5-3 4-11 4-7 4-1 3-8 3-5",
      "2-2x10": "8-11 8-5 7-10 7-4 6-6 6-2 5-10 5-2 4-9 4-5",
      "2-2x12": "10-6 9-10 9-2 8-6 7-7 7-3 6-11 6-4 5-9 5-4",
      "3-2x6": "6-11 6-6 6-0 5-7 5-0 4-9 4-7 4-2 3-9 3-5",
      "3-2x8": "9-3 8-8 8-1 7-6 6-8 6-4 6-1 5-6 5-0 4-7",
      "3-2x10": "11-3 10-7 9-10 9-2 8-2 7-10 7-6 6-11 6-4 5-10",
      "3-2x12": "13-2 12-4 11-6 10-8 9-7 9-2 8-9 8-1 7-7 7-1",
    },
    rw: {
      "1-2x6": "3-9 3-6 3-2 2-11 2-6 2-4 2-3 2-0 1-11 1-9",
      "1-2x8": "4-10 4-6 4-2 3-10 3-3 3-1 2-11 2-8 2-6 2-4",
      "1-2x10": "5-10 5-6 5-1 4-9 4-2 3-11 3-9 3-5 3-2 3-0",
      "1-2x12": "6-9 6-4 5-11 5-6 4-11 4-8 4-6 4-2 3-11 3-8",
      "2-2x6": "5-7 5-3 4-11 4-7 4-1 3-9 3-6 3-2 2-11 2-8",
      "2-2x8": "7-1 6-8 6-2 5-9 5-2 4-11 4-8 4-2 3-10 3-6",
      "2-2x10": "8-8 8-2 7-7 7-1 6-4 6-0 5-9 5-4 4-10 4-6",
      "2-2x12": "10-0 9-5 8-9 8-2 7-4 7-0 6-8 6-2 5-9 5-5",
      "3-2x6": "6-8 6-4 6-0 5-8 5-1 4-10 4-8 4-3 3-10 3-6",
      "3-2x8": "8-10 8-4 7-9 7-3 6-5 6-2 5-11 5-5 5-1 4-8",
      "3-2x10": "10-10 10-2 9-6 8-10 7-11 7-6 7-2 6-8 6-3 5-11",
      "3-2x12": "12-7 11-10 11-0 10-3 9-2 8-9 8-4 7-9 7-3 6-10",
    },
  },
};

/** Cells that fail the 2021 cross-check or the table's own ordering: "load/species/size/col". */
export const SUSPECT: ReadonlySet<string> = new Set<string>([
  // 2-2×10 printed 12-2, longer than the 2-2×12 beside it (11-9); column 1 has no 2021 counterpart.
  "40/rw/2-2x10/0",
  // Printed 8-4 between 9-9 and 8-11 in the same row; column 6 has no 2021 counterpart.
  "50/sp/3-2x10/5",
  "60/rw/3-2x12/5",
]);

export const toInches = (fi: string): number => {
  const m = /^(\d+)-(\d+)$/.exec(fi);
  if (!m) return NaN;
  return Number(m[1]) * 12 + Number(m[2]);
};

export const fmtFtIn = (fi: string) => {
  const m = /^(\d+)-(\d+)$/.exec(fi);
  return m ? `${m[1]}′ ${m[2]}″` : fi;
};

export function rawCell(load: LoadId, species: SpeciesId, size: BeamSize, col: number): string {
  return T[load][species][size].split(" ")[col];
}

export interface BeamRow {
  size: BeamSize;
  /** Feet-inches as printed, or null where the cell is flagged as suspect. */
  span: string | null;
  inches: number | null;
  /** True when the span is at least the user's required beam span. */
  meets: boolean | null;
}

export interface BeamInput {
  load: LoadId;
  species: SpeciesId;
  joistSpan: number;
  cantilever: number;
  /** Optional: the beam span the user needs, in feet (post spacing). */
  requiredFt: number | null;
}

export interface BeamResult {
  input: BeamInput;
  col: number;
  table: string;
  rows: BeamRow[];
  retrievedAt: string;
}

export function deckBeamSpans(input: BeamInput): BeamResult {
  const cols = COLUMNS[input.load];
  const col = cols[`${input.joistSpan}:${input.cantilever}`];
  if (col === undefined)
    throw new ToolError("bad-input", "That joist span and cantilever pair is not a column in this table. Pick one of the listed pairs.");
  if (input.requiredFt !== null && (!Number.isFinite(input.requiredFt) || input.requiredFt <= 0 || input.requiredFt > 30))
    throw new ToolError("bad-input", "Enter the beam span you need in feet (between the posts), or leave it blank.");
  const req = input.requiredFt === null ? null : input.requiredFt * 12;
  const rows: BeamRow[] = BEAM_SIZES.map((size) => {
    const suspect = SUSPECT.has(`${input.load}/${input.species}/${size}/${col}`);
    const span = suspect ? null : rawCell(input.load, input.species, size, col);
    const inches = span === null ? null : toInches(span);
    return { size, span, inches, meets: req === null || inches === null ? null : inches >= req };
  });
  return {
    input,
    col,
    table: LOADS.find((l) => l.id === input.load)!.table,
    rows,
    retrievedAt: BEAM_RETRIEVED,
  };
}

export { T as BEAM_TABLES };
