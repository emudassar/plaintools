import { ToolError } from "./errors";
import sales from "@/data/sales-tax-2026.json";
import eia from "@/data/eia-residential-price.json";

/**
 * Everyday money arithmetic: sales tax, tips, car loan payments, electricity cost, trip fuel cost.
 *
 * Sales tax rates: Tax Foundation midyear 2026 table (state rate, population-weighted average local
 * rate, maximum local rate, as of July 1, 2026). City rates are not in any free nationwide dataset,
 * so the page takes the local rate as an input.
 * Loan payment: standard amortizing-loan formula M = P r / (1 - (1 + r)^-n), r = APR / 12; at 0% APR
 * M = P / n.
 * Electricity: kWh = watts x hours / 1000; price from EIA Electric Power Monthly Table 5.6.A
 * (average residential price by state, cents per kWh).
 */

export const SALES_URL = sales.url;
export const SALES_SOURCE = sales.source;
export const SALES_STATES = sales.states;
export const EIA_URL = eia.url;
export const EIA_SOURCE = eia.source;
export const EIA_PRICES = eia.centsPerKwh as Record<string, number>;
export const RETRIEVED = "2026-10-24";

const pos = (v: number, label: string, allowZero = false) => {
  if (!Number.isFinite(v) || v < 0 || (!allowZero && v === 0)) throw new ToolError("bad-input", `Enter the ${label} as a ${allowZero ? "" : "positive "}number.`);
};

export interface SalesTaxResult {
  rate: number;
  price: number;
  tax: number;
  total: number;
}

/** mode "add": amount is before tax. mode "remove": amount already includes tax (reverse sales tax). */
export function salesTax(amount: number, ratePct: number, mode: "add" | "remove"): SalesTaxResult {
  pos(amount, "amount");
  if (!Number.isFinite(ratePct) || ratePct < 0 || ratePct > 30) throw new ToolError("bad-input", "Enter a tax rate between 0 and 30 percent.");
  const r = ratePct / 100;
  if (mode === "add") return { rate: ratePct, price: amount, tax: amount * r, total: amount * (1 + r) };
  const price = amount / (1 + r);
  return { rate: ratePct, price, tax: amount - price, total: amount };
}

export interface TipResult {
  tip: number;
  total: number;
  perPerson: number;
  tipPerPerson: number;
  roundedPerPerson: number | null;
  effectivePct: number;
}

export function tip(bill: number, tipPct: number, people: number, tipBase: number | null, roundUp: boolean): TipResult {
  pos(bill, "bill");
  if (!Number.isFinite(tipPct) || tipPct < 0 || tipPct > 100) throw new ToolError("bad-input", "Enter a tip between 0 and 100 percent.");
  if (!Number.isInteger(people) || people < 1 || people > 100) throw new ToolError("bad-input", "Number of people should be a whole number from 1 to 100.");
  const base = tipBase ?? bill;
  if (tipBase !== null && (!Number.isFinite(tipBase) || tipBase < 0 || tipBase > bill)) throw new ToolError("bad-input", "The pre-tax amount should be between 0 and the bill total.");
  const t = base * (tipPct / 100);
  const total = bill + t;
  const perPerson = total / people;
  const roundedPerPerson = roundUp ? Math.ceil(perPerson - 1e-9) : null;
  const finalTotal = roundedPerPerson !== null ? roundedPerPerson * people : total;
  return {
    tip: finalTotal - bill,
    total: finalTotal,
    perPerson: finalTotal / people,
    tipPerPerson: (finalTotal - bill) / people,
    roundedPerPerson,
    effectivePct: base > 0 ? ((finalTotal - bill) / base) * 100 : 0,
  };
}

export interface LoanRow {
  year: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface CarLoanResult {
  financed: number;
  salesTax: number;
  monthly: number;
  totalInterest: number;
  totalPaid: number;
  totalCost: number;
  schedule: LoanRow[];
}

export interface CarLoanInput {
  price: number;
  down: number;
  tradeIn: number;
  taxPct: number;
  fees: number;
  aprPct: number;
  months: number;
  /** Many states tax the price after the trade-in credit; some do not. */
  taxAfterTrade: boolean;
}

export function payment(principal: number, aprPct: number, months: number): number {
  const r = aprPct / 1200;
  return r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function carLoan(i: CarLoanInput): CarLoanResult {
  pos(i.price, "vehicle price");
  pos(i.down, "down payment", true);
  pos(i.tradeIn, "trade-in value", true);
  pos(i.fees, "fees", true);
  if (!Number.isFinite(i.taxPct) || i.taxPct < 0 || i.taxPct > 20) throw new ToolError("bad-input", "Sales tax should be between 0 and 20 percent.");
  if (!Number.isFinite(i.aprPct) || i.aprPct < 0 || i.aprPct > 40) throw new ToolError("bad-input", "APR should be between 0 and 40 percent.");
  if (!Number.isInteger(i.months) || i.months < 1 || i.months > 120) throw new ToolError("bad-input", "Loan term should be 1 to 120 months.");
  const taxable = i.taxAfterTrade ? Math.max(0, i.price - i.tradeIn) : i.price;
  const salesTax = taxable * (i.taxPct / 100);
  const financed = i.price + salesTax + i.fees - i.down - i.tradeIn;
  if (financed <= 0) throw new ToolError("bad-input", "The down payment and trade-in cover the whole price, so there is nothing to finance.");
  const monthly = payment(financed, i.aprPct, i.months);
  const r = i.aprPct / 1200;
  const schedule: LoanRow[] = [];
  let bal = financed, yi = 0, yp = 0;
  for (let m = 1; m <= i.months; m++) {
    const int = bal * r;
    const prin = Math.min(bal, monthly - int);
    bal -= prin;
    yi += int;
    yp += prin;
    if (m % 12 === 0 || m === i.months) {
      schedule.push({ year: Math.ceil(m / 12), interest: yi, principal: yp, balance: Math.max(0, bal) });
      yi = yp = 0;
    }
  }
  const totalPaid = monthly * i.months;
  return { financed, salesTax, monthly, totalInterest: totalPaid - financed, totalPaid, totalCost: totalPaid + i.down + i.tradeIn, schedule };
}

export interface ElectricityResult {
  kwhPerDay: number;
  kwhPerMonth: number;
  kwhPerYear: number;
  costPerDay: number;
  costPerMonth: number;
  costPerYear: number;
  costPerHour: number;
}

export function electricityCost(watts: number, hoursPerDay: number, daysPerMonth: number, centsPerKwh: number, quantity: number): ElectricityResult {
  pos(watts, "wattage");
  if (watts > 100_000) throw new ToolError("bad-input", "Over 100,000 W looks like a unit mix-up - enter watts, not milliwatts.");
  if (!Number.isFinite(hoursPerDay) || hoursPerDay <= 0 || hoursPerDay > 24) throw new ToolError("bad-input", "Hours per day should be between 0 and 24.");
  if (!Number.isFinite(daysPerMonth) || daysPerMonth <= 0 || daysPerMonth > 31) throw new ToolError("bad-input", "Days used per month should be between 1 and 31.");
  pos(centsPerKwh, "price per kWh");
  if (centsPerKwh > 200) throw new ToolError("bad-input", "Enter the price in cents per kWh (for example 18.2), not dollars.");
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) throw new ToolError("bad-input", "Quantity should be a whole number from 1 to 1,000.");
  const kw = (watts * quantity) / 1000;
  const kwhPerDay = kw * hoursPerDay;
  const price = centsPerKwh / 100;
  return {
    kwhPerDay,
    kwhPerMonth: kwhPerDay * daysPerMonth,
    kwhPerYear: kwhPerDay * daysPerMonth * 12,
    costPerDay: kwhPerDay * price,
    costPerMonth: kwhPerDay * daysPerMonth * price,
    costPerYear: kwhPerDay * daysPerMonth * 12 * price,
    costPerHour: kw * price,
  };
}

export interface GasCostResult {
  distance: number;
  fuel: number;
  cost: number;
  perPerson: number;
  costPerDistance: number;
}

/** economy: mpg (US) when unit = "mi", L/100 km when unit = "km". price per gallon or per litre. */
export function gasCost(distance: number, unit: "mi" | "km", economy: number, price: number, roundTrip: boolean, people: number): GasCostResult {
  pos(distance, "distance");
  pos(economy, unit === "mi" ? "miles per gallon" : "litres per 100 km");
  pos(price, "fuel price");
  if (!Number.isInteger(people) || people < 1 || people > 50) throw new ToolError("bad-input", "People to split with should be 1 to 50.");
  const d = distance * (roundTrip ? 2 : 1);
  const fuel = unit === "mi" ? d / economy : (d * economy) / 100;
  const cost = fuel * price;
  return { distance: d, fuel, cost, perPerson: cost / people, costPerDistance: cost / d };
}
