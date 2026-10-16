import { ToolError } from "./errors";

/**
 * Knitting needle sizes: millimetres ↔ US numbers.
 *
 * Source: Craft Yarn Council, "Hooks & Needles" standard, knitting needle table
 * (craftyarncouncil.com/standards/hooks-and-needles), read 2026-10-16 directly
 * from the page's HTML table. Rows exactly as printed; a blank US cell (3 mm,
 * 7 mm) is stored as null. Two mm sizes can share one US number (3 for
 * 3.125/3.25, 6 for 4/4.25, 9 for 5.25/5.5, 10 for 5.75/6, 17 for 12.5/12.75).
 *
 * The page's own advice on sizing: letter and number sizing vary from company
 * to company, so rely on the package millimetre size.
 */

export const NEEDLE_RETRIEVED = "2026-10-16";
export const CYC_URL = "https://www.craftyarncouncil.com/standards/hooks-and-needles";
export const CYC_NOTE =
  "Because letter and number sizing vary from company to company, rely on the package millimeter (mm) sizing, which is an accurate measurement.";

export interface NeedleRow {
  mm: number;
  us: string | null;
}

export const NEEDLES: readonly NeedleRow[] = [
  { mm: 1.5, us: "000" },
  { mm: 1.75, us: "00" },
  { mm: 2, us: "0" },
  { mm: 2.25, us: "1" },
  { mm: 2.75, us: "2" },
  { mm: 3, us: null },
  { mm: 3.125, us: "3" },
  { mm: 3.25, us: "3" },
  { mm: 3.5, us: "4" },
  { mm: 3.75, us: "5" },
  { mm: 4, us: "6" },
  { mm: 4.25, us: "6" },
  { mm: 4.5, us: "7" },
  { mm: 5, us: "8" },
  { mm: 5.25, us: "9" },
  { mm: 5.5, us: "9" },
  { mm: 5.75, us: "10" },
  { mm: 6, us: "10" },
  { mm: 6.5, us: "10½" },
  { mm: 7, us: null },
  { mm: 8, us: "11" },
  { mm: 9, us: "13" },
  { mm: 10, us: "15" },
  { mm: 12.5, us: "17" },
  { mm: 12.75, us: "17" },
  { mm: 15, us: "19" },
  { mm: 19, us: "35" },
  { mm: 25, us: "50" },
  { mm: 35, us: "70" },
];

export const US_SIZES: readonly string[] = [...new Set(NEEDLES.map((n) => n.us).filter((u): u is string => u !== null))];

export const fmtMm = (mm: number) => `${mm.toLocaleString("en-US", { maximumFractionDigits: 3 })} mm`;

export type NeedleQuery = { kind: "mm"; value: number } | { kind: "us"; value: string };

export interface NeedleResult {
  query: NeedleQuery;
  /** Rows that match exactly (a US number can match two mm sizes). */
  matches: NeedleRow[];
  /** For an mm size not in the table: the nearest listed sizes either side. */
  nearest: { below: NeedleRow | null; above: NeedleRow | null } | null;
  retrievedAt: string;
}

/** Accepts "10.5", "10 1/2", "10½". */
export function normaliseUs(s: string): string {
  return s.trim().replace(/\s*1\/2$/, "½").replace(/\.5$/, "½").replace(/\s+/g, "");
}

export function lookupNeedle(q: NeedleQuery): NeedleResult {
  if (q.kind === "mm") {
    const v = q.value;
    if (!Number.isFinite(v) || v <= 0) throw new ToolError("bad-input", "Enter a needle size in millimetres, for example 4 or 3.75.");
    if (v > 50) throw new ToolError("bad-input", "That is larger than any needle in the standard (it ends at 35 mm). Check the unit.");
    const matches = NEEDLES.filter((n) => Math.abs(n.mm - v) < 1e-6);
    if (matches.length) return { query: q, matches, nearest: null, retrievedAt: NEEDLE_RETRIEVED };
    const below = [...NEEDLES].reverse().find((n) => n.mm < v) ?? null;
    const above = NEEDLES.find((n) => n.mm > v) ?? null;
    return { query: q, matches: [], nearest: { below, above }, retrievedAt: NEEDLE_RETRIEVED };
  }
  const us = normaliseUs(q.value);
  const matches = NEEDLES.filter((n) => n.us === us);
  if (!matches.length)
    throw new ToolError("no-data", `US size ${q.value} is not in the Craft Yarn Council chart. Pick one of the listed US sizes.`);
  return { query: { kind: "us", value: us }, matches, nearest: null, retrievedAt: NEEDLE_RETRIEVED };
}
