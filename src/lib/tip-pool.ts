import { ToolError } from "./errors";

/**
 * Tip pool split.
 *
 * The split is arithmetic: each person's share = pool x (their weight / total
 * weight), where weight is hours worked, hours x points, or 1 each (equal
 * split). Shares are worked in whole cents with the largest-remainder method,
 * so they always add up to the pool exactly.
 *
 * Rules context (not used in the arithmetic) comes from U.S. Department of
 * Labor, Wage and Hour Division, Fact Sheet #15 "Tipped Employees Under the
 * Fair Labor Standards Act (FLSA)", retrieved 2026-10-05 from
 *   https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa
 * It says an employer may not receive tips from a tip pool and may not allow
 * managers and supervisors to receive tips from the pool; with a tip credit,
 * a mandatory pool is limited to employees in occupations that customarily
 * and regularly receive tips.
 */

export const TIP_RETRIEVED = "2026-10-05";
export const DOL_FS15_URL = "https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa";

export type SplitMethod = "hours" | "points" | "equal";

export interface TipPerson {
  name: string;
  hours: number;
  points: number;
}

export interface TipShare {
  name: string;
  hours: number;
  points: number;
  weight: number;
  percent: number;
  cents: number;
  perHour: number | null;
}

export interface TipPoolResult {
  method: SplitMethod;
  poolCents: number;
  totalWeight: number;
  totalHours: number;
  shares: TipShare[];
  /** Cents moved by rounding (0 when every share divides evenly). */
  roundedCents: number;
  retrievedAt: string;
}

export function splitTips(poolDollars: number, people: readonly TipPerson[], method: SplitMethod): TipPoolResult {
  if (!Number.isFinite(poolDollars)) throw new ToolError("bad-input", "Enter the total tips as a number.");
  if (poolDollars <= 0) throw new ToolError("bad-input", "The tip pool must be more than zero.");
  if (poolDollars > 10_000_000) throw new ToolError("bad-input", "That pool is over $10 million. Check the number.");
  if (people.length === 0) throw new ToolError("bad-input", "Add at least one person.");
  if (people.length > 200) throw new ToolError("bad-input", "That is more than 200 people.");

  const weights = people.map((p, i) => {
    const who = p.name.trim() || `Person ${i + 1}`;
    if (method !== "equal") {
      if (!Number.isFinite(p.hours) || p.hours < 0) throw new ToolError("bad-input", `${who}: hours must be zero or more.`);
      if (p.hours > 744) throw new ToolError("bad-input", `${who}: ${p.hours} hours is more than a month. Check it.`);
    }
    if (method === "points" && (!Number.isFinite(p.points) || p.points < 0)) {
      throw new ToolError("bad-input", `${who}: points must be zero or more.`);
    }
    return method === "equal" ? 1 : method === "hours" ? p.hours : p.hours * p.points;
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight <= 0) {
    throw new ToolError(
      "bad-input",
      method === "points"
        ? "Everyone has zero hours or zero points, so there is nothing to divide the pool by."
        : "Everyone has zero hours, so there is nothing to divide the pool by.",
    );
  }

  const poolCents = Math.round(poolDollars * 100);
  const exact = weights.map((w) => (poolCents * w) / totalWeight);
  const floors = exact.map((x) => Math.floor(x + 1e-9));
  let left = poolCents - floors.reduce((a, b) => a + b, 0);
  // Largest remainder first; ties go to the earlier row so results are stable.
  const order = exact
    .map((x, i) => ({ i, r: x - floors[i] }))
    .sort((a, b) => b.r - a.r || a.i - b.i);
  const cents = floors.slice();
  for (const { i } of order) {
    if (left <= 0) break;
    if (weights[i] > 0) {
      cents[i] += 1;
      left -= 1;
    }
  }

  const roundedCents = exact.reduce((acc, x, i) => acc + Math.abs(cents[i] - x), 0);

  return {
    method,
    poolCents,
    totalWeight,
    totalHours: people.reduce((a, p) => a + (Number.isFinite(p.hours) ? p.hours : 0), 0),
    shares: people.map((p, i) => ({
      name: p.name.trim() || `Person ${i + 1}`,
      hours: p.hours,
      points: p.points,
      weight: weights[i],
      percent: (weights[i] / totalWeight) * 100,
      cents: cents[i],
      perHour: Number.isFinite(p.hours) && p.hours > 0 ? cents[i] / 100 / p.hours : null,
    })),
    roundedCents: Math.round(roundedCents),
    retrievedAt: TIP_RETRIEVED,
  };
}
