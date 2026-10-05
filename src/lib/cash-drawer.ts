import { ToolError } from "./errors";

/**
 * Cash drawer count, deposit and over/short.
 *
 * Arithmetic in whole cents. Denominations are the U.S. notes and coins in
 * circulation. Coin roll contents: U.S. Mint, "Coin Count 'n' Roll"
 * (kids.usmint.gov), retrieved 2026-10-05: "40 quarters per roll, 50 dimes per
 * roll, 40 nickels per roll, 50 pennies per roll" — so a roll is worth $10,
 * $5, $2 and $0.50. No roll is offered for half dollars or dollar coins, which
 * that page does not cover.
 *
 * Deposit breakdown: to leave exactly the starting float, notes and coins are
 * pulled largest first, and the last ~$200 is matched exactly with the fewest
 * pieces. If the mix in the drawer cannot make the exact deposit, the
 * shortfall is reported rather than hidden.
 */

export const CASH_RETRIEVED = "2026-10-05";
export const USMINT_ROLLS_URL = "https://kids.usmint.gov/resources/coin-activities/coin-count-n-roll";

export interface Denomination {
  id: string;
  label: string;
  cents: number;
  kind: "note" | "coin" | "roll";
}

export const DENOMINATIONS: readonly Denomination[] = [
  { id: "100", label: "$100 bills", cents: 10000, kind: "note" },
  { id: "50", label: "$50 bills", cents: 5000, kind: "note" },
  { id: "20", label: "$20 bills", cents: 2000, kind: "note" },
  { id: "10", label: "$10 bills", cents: 1000, kind: "note" },
  { id: "5", label: "$5 bills", cents: 500, kind: "note" },
  { id: "2", label: "$2 bills", cents: 200, kind: "note" },
  { id: "1", label: "$1 bills", cents: 100, kind: "note" },
  { id: "roll-q", label: "Quarter rolls ($10)", cents: 1000, kind: "roll" },
  { id: "roll-d", label: "Dime rolls ($5)", cents: 500, kind: "roll" },
  { id: "roll-n", label: "Nickel rolls ($2)", cents: 200, kind: "roll" },
  { id: "roll-p", label: "Penny rolls ($0.50)", cents: 50, kind: "roll" },
  { id: "c100", label: "$1 coins", cents: 100, kind: "coin" },
  { id: "c50", label: "Half dollars", cents: 50, kind: "coin" },
  { id: "c25", label: "Quarters", cents: 25, kind: "coin" },
  { id: "c10", label: "Dimes", cents: 10, kind: "coin" },
  { id: "c5", label: "Nickels", cents: 5, kind: "coin" },
  { id: "c1", label: "Pennies", cents: 1, kind: "coin" },
];

export interface CashInput {
  /** Count per denomination id. Missing = 0. */
  counts: Record<string, number>;
  /** Starting float to leave in the drawer, dollars. */
  float: number;
  /** Expected cash from the register report, dollars, or null. */
  expected: number | null;
}

export interface CashLine {
  denomination: Denomination;
  count: number;
  cents: number;
  pull: number;
  leave: number;
}

export interface CashResult {
  lines: CashLine[];
  totalCents: number;
  floatCents: number;
  depositCents: number;
  /** Cents of the deposit the drawer's mix could not make exactly (0 normally). */
  unmatchedCents: number;
  /** Counted − (float + expected), cents; null without an expected figure. */
  overShortCents: number | null;
  belowFloat: boolean;
  retrievedAt: string;
}

const toCents = (d: number) => Math.round(d * 100);

/** Largest target the exact search will attempt ($10,000); above it, greedy only. */
const EXACT_LIMIT = 1_000_000;
/** Up to this target ($300) the exact pull also minimises the number of pieces. */
const MIN_PIECES_LIMIT = 30_000;

/**
 * Adds to each line's `pull` so the extra pulled equals `target` exactly, if
 * the unpulled pieces allow it; returns the cents left unmatched. Lines must be
 * sorted largest value first.
 */
function exactPull(order: CashLine[], target: number): number {
  if (target <= 0) return 0;
  if (target <= MIN_PIECES_LIMIT) {
    // Fewest pieces = pull large notes, leave small change in the drawer.
    const items: { line: CashLine; n: number; v: number }[] = [];
    for (const l of order) {
      let avail = l.count - l.pull;
      for (let k = 1; avail > 0; k *= 2) {
        const n = Math.min(k, avail);
        items.push({ line: l, n, v: n * l.denomination.cents });
        avail -= n;
      }
    }
    const W = target + 1;
    const INF = 1e9;
    let dp = new Float64Array(W).fill(INF);
    dp[0] = 0;
    const took = items.map(() => new Uint8Array(W));
    for (let i = 0; i < items.length; i++) {
      const { v, n } = items[i];
      const next = dp.slice();
      for (let s = v; s < W; s++) {
        if (dp[s - v] + n < next[s]) {
          next[s] = dp[s - v] + n;
          took[i][s] = 1;
        }
      }
      dp = next;
    }
    if (dp[target] < INF) {
      for (let i = items.length - 1, s = target; i >= 0 && s > 0; i--) {
        if (took[i][s]) {
          items[i].line.pull += items[i].n;
          s -= items[i].v;
        }
      }
      return 0;
    }
  }
  if (target <= EXACT_LIMIT) {
    // Binary-split each denomination's available count into 0/1 items.
    const items: { line: CashLine; n: number; v: number }[] = [];
    for (const l of order) {
      let avail = l.count - l.pull;
      for (let k = 1; avail > 0; k *= 2) {
        const n = Math.min(k, avail);
        items.push({ line: l, n, v: n * l.denomination.cents });
        avail -= n;
      }
    }
    // Process smallest first so the item that first reaches a value — and is
    // used in reconstruction — tends to be a larger piece.
    items.reverse();
    const via = new Int32Array(target + 1).fill(-1);
    via[0] = -2;
    for (let i = 0; i < items.length; i++) {
      const v = items[i].v;
      for (let s = target; s >= v; s--) if (via[s] === -1 && via[s - v] !== -1) via[s] = i;
    }
    if (via[target] !== -1) {
      for (let s = target; s > 0; ) {
        const it = items[via[s]];
        it.line.pull += it.n;
        s -= it.v;
      }
      return 0;
    }
  }
  let remaining = target;
  for (const l of order) {
    const take = Math.min(l.count - l.pull, Math.floor(remaining / l.denomination.cents));
    l.pull += take;
    remaining -= take * l.denomination.cents;
  }
  return remaining;
}

export function calculateCashDrawer(input: CashInput): CashResult {
  for (const d of DENOMINATIONS) {
    const c = input.counts[d.id] ?? 0;
    if (!Number.isFinite(c) || c < 0 || !Number.isInteger(c)) throw new ToolError("bad-input", `${d.label}: enter a whole number of 0 or more.`);
    if (c > 100000) throw new ToolError("bad-input", `${d.label}: that count is over 100,000.`);
  }
  if (!Number.isFinite(input.float) || input.float < 0) throw new ToolError("bad-input", "Starting float must be zero or more.");
  if (input.expected !== null && (!Number.isFinite(input.expected) || input.expected < 0)) throw new ToolError("bad-input", "Expected cash must be zero or more, or left blank.");

  const lines: CashLine[] = DENOMINATIONS.map((d) => {
    const count = input.counts[d.id] ?? 0;
    return { denomination: d, count, cents: count * d.cents, pull: 0, leave: count };
  });
  const totalCents = lines.reduce((s, l) => s + l.cents, 0);
  if (totalCents === 0) throw new ToolError("no-data", "Enter how many of each note and coin are in the drawer.");
  const floatCents = toCents(input.float);
  const belowFloat = totalCents < floatCents;
  const depositCents = Math.max(0, totalCents - floatCents);

  // 1) Pull largest-first greedily until about $200 is left to find.
  // 2) Make the rest EXACTLY from what remains with the fewest pieces (bounded
  //    knapsack), so large notes leave and small change stays. Pure greedy can fail where an exact mix exists — e.g. it
  //    takes two $1 bills for $2.09 and then cannot make 9 cents from pennies
  //    it does not have, when a $1 + quarters + dimes mix would work.
  let remaining = depositCents;
  const order = [...lines].sort((a, b) => b.denomination.cents - a.denomination.cents);
  for (const l of order) {
    if (remaining <= 20000) break;
    const take = Math.max(0, Math.min(l.count, Math.floor((remaining - 20000) / l.denomination.cents)));
    l.pull = take;
    remaining -= take * l.denomination.cents;
  }
  remaining = exactPull(order, remaining);
  for (const l of lines) l.leave = l.count - l.pull;

  return {
    lines,
    totalCents,
    floatCents,
    depositCents,
    unmatchedCents: remaining,
    overShortCents: input.expected === null ? null : totalCents - (floatCents + toCents(input.expected)),
    belowFloat,
    retrievedAt: CASH_RETRIEVED,
  };
}
