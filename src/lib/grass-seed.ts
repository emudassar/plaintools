import { ToolError } from "./errors";

/**
 * Grass seed quantity.
 *
 * Seeding rates (pounds of seed per 1,000 ft², new lawns) from University of
 * Kentucky Cooperative Extension AGR-52, "Selecting the Right Grass for Your
 * Kentucky Lawn" (Munshaw & Shaddox, issued 8-2019), retrieved 2026-10-17:
 *  - Kentucky bluegrass: "2 pounds pure live seed per 1,000 square feet"
 *  - Tall fescue: "6 pounds per 1,000 square feet"
 *  - Perennial ryegrass: "4-6 pounds of pure live seed per 1,000 square feet
 *    when broadcast-seeded"
 *  - KBG + perennial ryegrass mix: ryegrass "approximately a quarter pound per
 *    1,000 square feet" with "Kentucky bluegrass (1½ pounds per 1,000 square
 *    feet)"
 *  - Bermudagrass, seeded cultivars: "1 to 2 pounds of pure live seed per
 *    1,000 square feet"
 * Pure live seed (PLS): PLS fraction = purity × germination (from the seed
 * tag), so bulk pounds = PLS pounds ÷ (purity × germination). Rates written
 * without "pure live seed" in AGR-52 (tall fescue) are used as bulk pounds.
 */

export const AGR52_URL = "https://publications.ca.uky.edu/sites/publications.ca.uky.edu/files/AGR52.pdf";
export const SEED_RETRIEVED = "2026-10-17";

export const SPECIES = {
  kbg: { label: "Kentucky bluegrass", low: 2, high: 2, pls: true },
  tf: { label: "Tall fescue (turf-type)", low: 6, high: 6, pls: false },
  prg: { label: "Perennial ryegrass", low: 4, high: 6, pls: true },
  mix: { label: "Kentucky bluegrass + ~15% perennial ryegrass", low: 1.75, high: 1.75, pls: false },
  bermuda: { label: "Bermudagrass (seeded cultivars)", low: 1, high: 2, pls: true },
} as const;
export type Species = keyof typeof SPECIES | "custom";

export interface SeedInput {
  areaSqFt: number;
  species: Species;
  customRate: number;
  /** Seed tag purity and germination, % (only used for PLS rates). */
  purityPct: number;
  germPct: number;
  /** Bag size in lb, optional. */
  bagLb: number | null;
}

export interface SeedResult {
  rateLow: number;
  rateHigh: number;
  isPls: boolean;
  plsFraction: number;
  lbLow: number;
  lbHigh: number;
  bagsLow: number | null;
  bagsHigh: number | null;
}

export function grassSeed(i: SeedInput): SeedResult {
  if (!Number.isFinite(i.areaSqFt) || i.areaSqFt <= 0 || i.areaSqFt > 43_560 * 1000) throw new ToolError("bad-input", "Enter the area in square feet.");
  let low: number, high: number, isPls: boolean;
  if (i.species === "custom") {
    if (!Number.isFinite(i.customRate) || i.customRate <= 0 || i.customRate > 50) throw new ToolError("bad-input", "Enter the seeding rate in pounds per 1,000 ft².");
    low = high = i.customRate;
    isPls = false;
  } else {
    const s = SPECIES[i.species];
    low = s.low;
    high = s.high;
    isPls = s.pls;
  }
  for (const [v, n] of [[i.purityPct, "Purity"], [i.germPct, "Germination"]] as const)
    if (!Number.isFinite(v) || v <= 0 || v > 100) throw new ToolError("bad-input", `${n} should be a percentage from the seed tag.`);
  const plsFraction = (i.purityPct / 100) * (i.germPct / 100);
  const k = isPls ? 1 / plsFraction : 1;
  const lbLow = (i.areaSqFt / 1000) * low * k;
  const lbHigh = (i.areaSqFt / 1000) * high * k;
  if (i.bagLb !== null && (!Number.isFinite(i.bagLb) || i.bagLb <= 0)) throw new ToolError("bad-input", "Enter the bag size in pounds, or leave it blank.");
  return {
    rateLow: low,
    rateHigh: high,
    isPls,
    plsFraction,
    lbLow,
    lbHigh,
    bagsLow: i.bagLb ? Math.ceil(lbLow / i.bagLb - 1e-9) : null,
    bagsHigh: i.bagLb ? Math.ceil(lbHigh / i.bagLb - 1e-9) : null,
  };
}
