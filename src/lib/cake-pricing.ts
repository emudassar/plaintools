import { ToolError } from "./errors";

/**
 * Cake price from the baker's own costs.
 *
 * Arithmetic only:
 *   cost      = ingredients + packaging + labour hours × hourly rate + overhead
 *   price     = cost × (1 + markup %)          (markup on cost)
 *        or   = cost ÷ (1 − margin %)           (margin on price)
 *   per serving = price ÷ servings
 * No prices, rates or margins are assumed: every figure is the user's.
 */

export interface IngredientLine {
  name: string;
  /** Price paid for the package. */
  packagePrice: number;
  /** Package size and amount used, same unit (g, oz, cups, eggs…). */
  packageSize: number;
  used: number;
}

export interface CakeInput {
  ingredients: IngredientLine[];
  packaging: number;
  labourHours: number;
  hourlyRate: number;
  overhead: number;
  mode: "markup" | "margin";
  pct: number;
  servings: number | null;
}

export interface CakeResult {
  lines: { name: string; cost: number }[];
  ingredientCost: number;
  labourCost: number;
  totalCost: number;
  price: number;
  profit: number;
  marginPct: number;
  markupPct: number;
  perServing: number | null;
}

export function cakePrice(i: CakeInput): CakeResult {
  const lines = i.ingredients.map((l) => {
    if (![l.packagePrice, l.packageSize, l.used].every(Number.isFinite) || l.packagePrice < 0 || l.packageSize <= 0 || l.used < 0)
      throw new ToolError("bad-input", `Check the numbers for "${l.name || "an ingredient"}": price and amount used must be zero or more, package size above zero.`);
    return { name: l.name, cost: (l.packagePrice / l.packageSize) * l.used };
  });
  for (const [v, n] of [[i.packaging, "Packaging"], [i.labourHours, "Labour hours"], [i.hourlyRate, "Hourly rate"], [i.overhead, "Overhead"]] as const)
    if (!Number.isFinite(v) || v < 0) throw new ToolError("bad-input", `${n} should be zero or more.`);
  if (!Number.isFinite(i.pct) || i.pct < 0) throw new ToolError("bad-input", "Enter the markup or margin as a percentage.");
  if (i.mode === "margin" && i.pct >= 100) throw new ToolError("bad-input", "A margin must be below 100% of the price.");
  if (i.servings !== null && (!Number.isInteger(i.servings) || i.servings <= 0)) throw new ToolError("bad-input", "Servings should be a whole number, or leave it blank.");
  const ingredientCost = lines.reduce((a, b) => a + b.cost, 0);
  const labourCost = i.labourHours * i.hourlyRate;
  const totalCost = ingredientCost + i.packaging + labourCost + i.overhead;
  if (totalCost <= 0) throw new ToolError("bad-input", "Enter at least one cost.");
  const price = i.mode === "markup" ? totalCost * (1 + i.pct / 100) : totalCost / (1 - i.pct / 100);
  const profit = price - totalCost;
  return {
    lines,
    ingredientCost,
    labourCost,
    totalCost,
    price,
    profit,
    marginPct: (profit / price) * 100,
    markupPct: (profit / totalCost) * 100,
    perServing: i.servings ? price / i.servings : null,
  };
}
