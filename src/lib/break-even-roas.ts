import { ToolError } from "./errors";

/**
 * Break-even ROAS (return on ad spend).
 *
 * Arithmetic only. ROAS = revenue ÷ ad spend. An ad sale breaks even when the
 * gross profit it earns equals the ad spend, so with a profit margin m (after
 * product cost, shipping, fees — whatever the user includes) the break-even
 * ROAS is 1 ÷ m, and the break-even cost of sale (ACoS) is m.
 * Margin can be entered directly or built from price and per-order costs.
 */

export interface RoasInput {
  mode: "margin" | "costs";
  marginPct: number;
  price: number;
  productCost: number;
  shipping: number;
  fees: number;
  /** Optional: actual ROAS achieved, to compare. */
  actualRoas: number | null;
  /** Optional: target profit after ads, % of revenue. */
  targetProfitPct: number | null;
}

export interface RoasResult {
  marginPct: number;
  breakEvenRoas: number;
  breakEvenAcosPct: number;
  /** ROAS needed to keep the target profit %, or null. */
  targetRoas: number | null;
  /** Profit per $1 of ad spend at the actual ROAS, or null. */
  profitPerDollar: number | null;
  /** Max CPA (cost per acquisition) at break-even, when price is known. */
  maxCpa: number | null;
}

export function breakEvenRoas(i: RoasInput): RoasResult {
  let marginPct: number;
  let maxCpa: number | null = null;
  if (i.mode === "margin") {
    if (!Number.isFinite(i.marginPct) || i.marginPct <= 0 || i.marginPct > 100) throw new ToolError("bad-input", "Enter your profit margin before ad costs, as a percentage above 0.");
    marginPct = i.marginPct;
  } else {
    if (!Number.isFinite(i.price) || i.price <= 0) throw new ToolError("bad-input", "Enter the selling price.");
    for (const [v, n] of [[i.productCost, "Product cost"], [i.shipping, "Shipping"], [i.fees, "Fees"]] as const)
      if (!Number.isFinite(v) || v < 0) throw new ToolError("bad-input", `${n} should be zero or more.`);
    const profit = i.price - i.productCost - i.shipping - i.fees;
    if (profit <= 0) throw new ToolError("no-data", "Costs are equal to or above the price, so every sale loses money before ads — no ROAS breaks even.");
    marginPct = (profit / i.price) * 100;
    maxCpa = profit;
  }
  const m = marginPct / 100;
  let targetRoas: number | null = null;
  if (i.targetProfitPct !== null) {
    if (!Number.isFinite(i.targetProfitPct) || i.targetProfitPct < 0) throw new ToolError("bad-input", "Target profit should be zero or more percent.");
    const t = i.targetProfitPct / 100;
    if (t >= m) throw new ToolError("bad-input", "The target profit is at or above your margin, which no ROAS can reach.");
    targetRoas = 1 / (m - t);
  }
  let profitPerDollar: number | null = null;
  if (i.actualRoas !== null) {
    if (!Number.isFinite(i.actualRoas) || i.actualRoas < 0) throw new ToolError("bad-input", "Enter your actual ROAS as a number (for example 3.5).");
    profitPerDollar = i.actualRoas * m - 1;
  }
  return { marginPct, breakEvenRoas: 1 / m, breakEvenAcosPct: marginPct, targetRoas, profitPerDollar, maxCpa };
}
