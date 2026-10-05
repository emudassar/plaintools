import { ToolError } from "./errors";

/**
 * Truck cost per mile.
 *
 * Arithmetic: cost per mile = total costs in a period / miles driven in that
 * period. Fuel can be entered as a dollar amount or worked out as
 * miles / MPG x price per gallon. Cost per LOADED mile divides by the miles
 * that were not deadhead (empty).
 *
 * Benchmark: American Transportation Research Institute (ATRI), press release
 * "New ATRI Report Details Accelerating Costs and Low Profitability Despite
 * Cuts", 2026-07-15, on the 2026 Analysis of the Operational Costs of Trucking:
 * "The industry-average cost to operate a truck in 2025 was $2.336 per mile";
 * "Excluding fuel, costs rose by 4.2 percent to $1.854 per mile."
 * Retrieved 2026-10-05 from
 *   https://truckingresearch.org/2026/07/new-atri-report-details-accelerating-costs-and-low-profitability-despite-cuts/
 */

export const TRUCK_RETRIEVED = "2026-10-05";
export const ATRI_URL =
  "https://truckingresearch.org/2026/07/new-atri-report-details-accelerating-costs-and-low-profitability-despite-cuts/";
export const ATRI_TOTAL = 2.336;
export const ATRI_EX_FUEL = 1.854;
export const ATRI_YEAR = 2025;

export interface CostLine {
  label: string;
  amount: number;
  kind: "fixed" | "variable";
}

export interface TruckCostInput {
  miles: number;
  lines: readonly CostLine[];
  /** Either a fuel dollar amount for the period, or mpg + price. */
  fuel: { mode: "amount"; amount: number } | { mode: "mpg"; mpg: number; pricePerGallon: number };
  /** Percent of miles driven empty, 0–99. */
  deadheadPct: number;
}

export interface TruckCostResult {
  miles: number;
  fuelCost: number;
  fuelGallons: number | null;
  fixed: number;
  variable: number;
  total: number;
  perMile: number;
  perMileExFuel: number;
  fixedPerMile: number;
  variablePerMile: number;
  fuelPerMile: number;
  loadedMiles: number;
  perLoadedMile: number;
  lines: { label: string; amount: number; kind: "fixed" | "variable"; perMile: number }[];
  vsAtri: number;
  vsAtriExFuel: number;
  retrievedAt: string;
}

function money(label: string, v: number) {
  if (!Number.isFinite(v)) throw new ToolError("bad-input", `${label} must be a number (use 0 if none).`);
  if (v < 0) throw new ToolError("bad-input", `${label} cannot be negative.`);
}

export function truckCostPerMile(input: TruckCostInput): TruckCostResult {
  if (!Number.isFinite(input.miles) || input.miles <= 0) {
    throw new ToolError("bad-input", "Enter the miles driven in the period, more than zero.");
  }
  if (input.miles > 10_000_000) throw new ToolError("bad-input", "That is over 10 million miles. Check the number.");
  for (const l of input.lines) money(l.label || "A cost", l.amount);

  let fuelCost: number;
  let fuelGallons: number | null = null;
  if (input.fuel.mode === "amount") {
    money("Fuel", input.fuel.amount);
    fuelCost = input.fuel.amount;
  } else {
    const { mpg, pricePerGallon } = input.fuel;
    if (!Number.isFinite(mpg) || mpg <= 0) throw new ToolError("bad-input", "Enter fuel economy in miles per gallon, more than zero.");
    if (mpg > 50) throw new ToolError("bad-input", "That is over 50 MPG. Check the figure.");
    money("Fuel price", pricePerGallon);
    fuelGallons = input.miles / mpg;
    fuelCost = fuelGallons * pricePerGallon;
  }

  const d = input.deadheadPct;
  if (!Number.isFinite(d) || d < 0 || d >= 100) {
    throw new ToolError("bad-input", "Deadhead must be from 0 up to (but not including) 100 percent.");
  }

  const fixed = input.lines.filter((l) => l.kind === "fixed").reduce((a, l) => a + l.amount, 0);
  const variable = input.lines.filter((l) => l.kind === "variable").reduce((a, l) => a + l.amount, 0);
  const total = fixed + variable + fuelCost;
  const loadedMiles = input.miles * (1 - d / 100);
  const perMile = total / input.miles;

  return {
    miles: input.miles,
    fuelCost,
    fuelGallons,
    fixed,
    variable,
    total,
    perMile,
    perMileExFuel: (total - fuelCost) / input.miles,
    fixedPerMile: fixed / input.miles,
    variablePerMile: variable / input.miles,
    fuelPerMile: fuelCost / input.miles,
    loadedMiles,
    perLoadedMile: total / loadedMiles,
    lines: input.lines.map((l) => ({ ...l, perMile: l.amount / input.miles })),
    vsAtri: perMile - ATRI_TOTAL,
    vsAtriExFuel: (total - fuelCost) / input.miles - ATRI_EX_FUEL,
    retrievedAt: TRUCK_RETRIEVED,
  };
}
