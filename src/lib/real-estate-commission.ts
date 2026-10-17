import { ToolError } from "./errors";

/**
 * Real estate commission split.
 *
 * Arithmetic only: commission = sale price × rate (or a flat fee), divided
 * between the listing and buyer sides by the percentages in the agreement,
 * then each side's share split between agent and brokerage. Seller net =
 * price − total commission − other closing costs entered by the user.
 * No rate is assumed: the user enters the figures from their own agreement.
 */

export interface CommissionInput {
  price: number;
  mode: "percent" | "flat";
  /** Total commission rate, % (mode percent). */
  ratePct: number;
  /** Flat fee, dollars (mode flat). */
  flat: number;
  /** Share of the commission going to the listing side, %. */
  listingSharePct: number;
  /** Agent's share of their side, % (rest to brokerage). */
  agentSplitPct: number;
  /** Other seller closing costs, dollars. */
  otherCosts: number;
  /** Mortgage payoff, dollars. */
  payoff: number;
}

export interface CommissionResult {
  total: number;
  effectiveRatePct: number;
  listingSide: number;
  buyerSide: number;
  listingAgent: number;
  listingBrokerage: number;
  sellerNet: number;
}

export function commission(i: CommissionInput): CommissionResult {
  if (!Number.isFinite(i.price) || i.price <= 0 || i.price > 1e10) throw new ToolError("bad-input", "Enter the sale price in dollars.");
  let total: number;
  if (i.mode === "percent") {
    if (!Number.isFinite(i.ratePct) || i.ratePct < 0 || i.ratePct > 20) throw new ToolError("bad-input", "Commission rate should be between 0 and 20 percent.");
    total = (i.price * i.ratePct) / 100;
  } else {
    if (!Number.isFinite(i.flat) || i.flat < 0) throw new ToolError("bad-input", "Enter the flat fee in dollars.");
    if (i.flat > i.price) throw new ToolError("bad-input", "The flat fee is more than the sale price.");
    total = i.flat;
  }
  for (const [v, n] of [[i.listingSharePct, "Listing side share"], [i.agentSplitPct, "Agent split"]] as const)
    if (!Number.isFinite(v) || v < 0 || v > 100) throw new ToolError("bad-input", `${n} should be between 0 and 100 percent.`);
  for (const [v, n] of [[i.otherCosts, "Other closing costs"], [i.payoff, "Mortgage payoff"]] as const)
    if (!Number.isFinite(v) || v < 0) throw new ToolError("bad-input", `${n} should be zero or more.`);
  const listingSide = (total * i.listingSharePct) / 100;
  const buyerSide = total - listingSide;
  const listingAgent = (listingSide * i.agentSplitPct) / 100;
  return {
    total,
    effectiveRatePct: (total / i.price) * 100,
    listingSide,
    buyerSide,
    listingAgent,
    listingBrokerage: listingSide - listingAgent,
    sellerNet: i.price - total - i.otherCosts - i.payoff,
  };
}
