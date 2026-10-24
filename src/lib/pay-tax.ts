import { ToolError } from "./errors";
import stateData from "@/data/state-income-tax-2026.json";

/**
 * Take-home pay and hourly/salary conversion.
 *
 * Federal (tax year 2026): IRS newsroom release on 2026 inflation adjustments (incl. One, Big,
 * Beautiful Bill amendments) - standard deduction $16,100 single / $32,200 married filing jointly;
 * brackets 10/12/22/24/32/35/37% at $12,400 / $50,400 / $105,700 / $201,775 / $256,225 / $640,600
 * (single) and $24,800 / $100,800 / $211,400 / $403,550 / $512,450 / $768,700 (joint).
 * FICA: IRS Topic 751 - Social Security 6.2% to the 2026 wage base of $184,500; Medicare 1.45%.
 * Additional Medicare 0.9%: IRS Topic 560 - over $200,000 single, $250,000 joint (liability).
 * State: Tax Foundation 2026 table (brackets, standard deduction, personal exemption or credit).
 *
 * Simplifications, all stated on the page: no tax credits other than the state exemption credits in
 * the table, no itemizing, no local income tax, no state payroll taxes (SDI, PFML), state taxable
 * income starts from wages minus pre-tax deductions (each state's own starting point differs).
 * Hourly <-> salary: hours per week x weeks per year; OPM's 2,087-hour divisor is shown for reference.
 */

export const IRS_2026_URL = "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill";
export const IRS_751_URL = "https://www.irs.gov/taxtopics/tc751";
export const IRS_560_URL = "https://www.irs.gov/taxtopics/tc560";
export const OPM_2087_URL = "https://www.opm.gov/policy-data-oversight/pay-leave/pay-administration/fact-sheets/computing-hourly-rates-of-pay-using-the-2087-hour-divisor/";
export const STATE_TAX_URL = stateData.url;
export const STATE_TAX_SOURCE = stateData.source;
export const TAX_RETRIEVED = stateData.retrieved;

export type Filing = "single" | "married";
type Ex = number | { credit: number } | null;

interface StateRow {
  state: string;
  notes: string;
  none?: boolean;
  detail?: string;
  single?: number[][];
  married?: number[][];
  stdS?: Ex;
  stdM?: Ex;
  exS?: Ex;
  exM?: Ex;
  exD?: Ex;
}

export const STATES = stateData.states as StateRow[];
export const STATE_NAMES = STATES.map((s) => s.state);

const FED = {
  single: { std: 16_100, brackets: [[0, 10], [12_400, 12], [50_400, 22], [105_700, 24], [201_775, 32], [256_225, 35], [640_600, 37]] },
  married: { std: 32_200, brackets: [[0, 10], [24_800, 12], [100_800, 22], [211_400, 24], [403_550, 32], [512_450, 35], [768_700, 37]] },
} as const;
export const SS_WAGE_BASE = 184_500;

/** Progressive tax: brackets are [threshold, rate%] with income over the threshold taxed at that rate. */
export function bracketTax(taxable: number, brackets: readonly (readonly number[])[]): number {
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const [lo, rate] = brackets[i];
    const hi = i + 1 < brackets.length ? brackets[i + 1][0] : Infinity;
    if (taxable > lo) tax += (Math.min(taxable, hi) - lo) * (rate / 100);
  }
  return tax;
}

const amount = (e: Ex | undefined) => (typeof e === "number" ? e : 0);
const credit = (e: Ex | undefined) => (e && typeof e === "object" ? e.credit : 0);

export interface TakeHomeInput {
  gross: number;
  filing: Filing;
  state: string;
  dependents: number;
  /** Pre-tax 401(k)/403(b) etc., per year: reduces income tax, not FICA. */
  pretaxRetirement: number;
  /** Pre-tax section 125 (health premiums etc.), per year: reduces income tax and FICA. */
  pretaxHealth: number;
  periods: number;
}

export interface TakeHomeResult {
  gross: number;
  federalTaxable: number;
  federal: number;
  socialSecurity: number;
  medicare: number;
  stateTaxable: number;
  state: number;
  stateNote: string | null;
  pretax: number;
  net: number;
  perPeriod: number;
  marginalFederal: number;
  effectiveTotal: number;
}

export function takeHome(i: TakeHomeInput): TakeHomeResult {
  if (!Number.isFinite(i.gross) || i.gross <= 0) throw new ToolError("bad-input", "Enter your yearly gross pay as a positive number.");
  if (i.gross > 50_000_000) throw new ToolError("bad-input", "That pay figure is outside what this page models.");
  for (const [v, l] of [[i.pretaxRetirement, "retirement contribution"], [i.pretaxHealth, "pre-tax health deduction"]] as const)
    if (!Number.isFinite(v) || v < 0) throw new ToolError("bad-input", `Enter the ${l} as 0 or more.`);
  if (i.pretaxRetirement + i.pretaxHealth >= i.gross) throw new ToolError("bad-input", "Pre-tax deductions are as large as the pay itself.");
  if (!Number.isInteger(i.dependents) || i.dependents < 0 || i.dependents > 20) throw new ToolError("bad-input", "Dependents should be a whole number from 0 to 20.");
  const st = STATES.find((s) => s.state === i.state);
  if (!st) throw new ToolError("bad-input", "Pick a state.");

  const fed = FED[i.filing];
  const incomeWages = i.gross - i.pretaxRetirement - i.pretaxHealth;
  const ficaWages = i.gross - i.pretaxHealth;
  const federalTaxable = Math.max(0, incomeWages - fed.std);
  const federal = bracketTax(federalTaxable, fed.brackets);
  const marginalFederal = [...fed.brackets].reverse().find(([lo]) => federalTaxable > lo)?.[1] ?? 10;

  const socialSecurity = Math.min(ficaWages, SS_WAGE_BASE) * 0.062;
  const addlThreshold = i.filing === "married" ? 250_000 : 200_000;
  const medicare = ficaWages * 0.0145 + Math.max(0, ficaWages - addlThreshold) * 0.009;

  let stateTax = 0, stateTaxable = 0, stateNote: string | null = null;
  if (st.none) stateNote = st.detail ?? "No individual income tax";
  else {
    const m = i.filing === "married";
    const std = m ? st.stdM : st.stdS;
    const ex = m ? st.exM : st.exS;
    const deduction = amount(std) + amount(ex) + i.dependents * amount(st.exD);
    stateTaxable = Math.max(0, incomeWages - deduction);
    const raw = bracketTax(stateTaxable, (m ? st.married : st.single) ?? []);
    const credits = credit(std) + credit(ex) + i.dependents * credit(st.exD);
    stateTax = Math.max(0, raw - credits);
  }

  const totalTax = federal + socialSecurity + medicare + stateTax;
  const pretax = i.pretaxRetirement + i.pretaxHealth;
  const net = i.gross - pretax - totalTax;
  if (!Number.isInteger(i.periods) || i.periods < 1) throw new ToolError("bad-input", "Pick a pay frequency.");
  return {
    gross: i.gross,
    federalTaxable,
    federal,
    socialSecurity,
    medicare,
    stateTaxable,
    state: stateTax,
    stateNote,
    pretax,
    net,
    perPeriod: net / i.periods,
    marginalFederal,
    effectiveTotal: totalTax / i.gross,
  };
}

export interface PayBreakdown {
  hourly: number;
  daily: number;
  weekly: number;
  biweekly: number;
  semimonthly: number;
  monthly: number;
  annual: number;
  hoursPerYear: number;
  opmHourly: number;
}

export function payFrom(amount: number, per: "hour" | "year" | "month" | "week", hoursPerWeek: number, weeksPerYear: number): PayBreakdown {
  if (!Number.isFinite(amount) || amount <= 0) throw new ToolError("bad-input", "Enter the pay as a positive number.");
  if (!Number.isFinite(hoursPerWeek) || hoursPerWeek <= 0 || hoursPerWeek > 168) throw new ToolError("bad-input", "Hours per week should be between 0 and 168.");
  if (!Number.isFinite(weeksPerYear) || weeksPerYear <= 0 || weeksPerYear > 52.18) throw new ToolError("bad-input", "Weeks per year should be between 0 and 52.");
  const hoursPerYear = hoursPerWeek * weeksPerYear;
  const annual = per === "hour" ? amount * hoursPerYear : per === "week" ? amount * weeksPerYear : per === "month" ? amount * 12 : amount;
  const hourly = annual / hoursPerYear;
  return {
    hourly,
    daily: hourly * (hoursPerWeek / 5),
    weekly: annual / weeksPerYear,
    biweekly: (annual / weeksPerYear) * 2,
    semimonthly: annual / 24,
    monthly: annual / 12,
    annual,
    hoursPerYear,
    opmHourly: annual / 2087,
  };
}
