"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, SelectField, attempt, fmt, money, num } from "./CalcBits";
import { Ext } from "./GeoBits";
import { IRS_2026_URL, IRS_560_URL, IRS_751_URL, STATE_NAMES, STATE_TAX_SOURCE, STATE_TAX_URL, TAX_RETRIEVED, takeHome, type Filing } from "@/lib/pay-tax";

const PERIODS = [
  ["52", "Weekly (52)"],
  ["26", "Every two weeks (26)"],
  ["24", "Twice a month (24)"],
  ["12", "Monthly (12)"],
  ["1", "Yearly (1)"],
] as const;

export default function TakeHomeTool() {
  const [gross, setGross] = useState("75000");
  const [state, setState] = useState("Texas");
  const [filing, setFiling] = useState<Filing>("single");
  const [periods, setPeriods] = useState<(typeof PERIODS)[number][0]>("26");
  const [k401, setK401] = useState("0");
  const [health, setHealth] = useState("0");
  const [deps, setDeps] = useState("0");

  const result = attempt(() =>
    takeHome({ gross: num(gross), filing, state, dependents: num(deps), pretaxRetirement: num(k401), pretaxHealth: num(health), periods: Number(periods) }),
  );
  const pp = Number(periods);
  const pct = (x: number, g: number) => `${fmt((x / g) * 100, 1)}%`;

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Gross pay per year ($)" value={gross} onChange={setGross} />
        <SelectField label="State" value={state} onChange={setState} options={STATE_NAMES.map((s) => [s, s] as const)} />
        <SelectField label="Filing status" value={filing} onChange={setFiling} options={[["single", "Single"], ["married", "Married filing jointly"]]} />
      </Grid>
      <Grid cols={4}>
        <SelectField label="Paid" value={periods} onChange={setPeriods} options={PERIODS} />
        <NumField label="401(k) / 403(b) per year ($)" value={k401} onChange={setK401} hint="Pre-tax; still pays Social Security and Medicare." />
        <NumField label="Pre-tax health etc. per year ($)" value={health} onChange={setHealth} hint="Section 125 deductions." />
        <NumField label="Dependents (state exemptions)" value={deps} onChange={setDeps} step="1" />
      </Grid>
      <Hint>For married filing jointly, enter the household's combined wages. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`Estimated 2026 take-home pay in ${state}`}
            headline={`${money(d.perPeriod)} per paycheck · ${money(d.net)} a year`}
            sub={`${money(d.net / 12)} a month · total tax ${pct(d.gross - d.net - d.pretax, d.gross)} of gross · federal marginal rate ${d.marginalFederal}%`}
            limits="An estimate, not your payslip. It leaves out tax credits (the child tax credit, earned income credit and others), itemized deductions, local income taxes (New York City, many Ohio and Pennsylvania towns, Maryland counties and others), state payroll taxes such as disability or paid-leave insurance, and each state's own adjustments listed in the Tax Foundation table's footnotes. Your employer's withholding also follows your W-4, which can differ from the tax you finally owe."
            method={
              <p>
                Federal: 2026 standard deduction and brackets from the <Ext href={IRS_2026_URL}>IRS 2026 inflation adjustments</Ext>; Social Security 6.2% up to $184,500 and Medicare 1.45% (
                <Ext href={IRS_751_URL}>IRS Topic 751</Ext>), plus 0.9% Additional Medicare over $200,000 single / $250,000 joint (<Ext href={IRS_560_URL}>Topic 560</Ext>). State: brackets,
                standard deduction and personal exemption or credit from <Ext href={STATE_TAX_URL}>{STATE_TAX_SOURCE}</Ext>. Retrieved {TAX_RETRIEVED}.
              </p>
            }
          >
            <DataTable
              head={["", "Per year", `Per paycheck (${pp})`, "% of gross"]}
              rows={[
                ["Gross pay", money(d.gross), money(d.gross / pp), "100%"],
                ["Pre-tax deductions", "−" + money(d.pretax), "−" + money(d.pretax / pp), pct(d.pretax, d.gross)],
                ["Federal income tax", "−" + money(d.federal), "−" + money(d.federal / pp), pct(d.federal, d.gross)],
                ["Social Security", "−" + money(d.socialSecurity), "−" + money(d.socialSecurity / pp), pct(d.socialSecurity, d.gross)],
                ["Medicare", "−" + money(d.medicare), "−" + money(d.medicare / pp), pct(d.medicare, d.gross)],
                [`${state} income tax`, d.stateNote ? d.stateNote : "−" + money(d.state), d.stateNote ? "$0.00" : "−" + money(d.state / pp), pct(d.state, d.gross)],
                ["Take-home pay", money(d.net), money(d.perPeriod), pct(d.net, d.gross)],
              ]}
              highlight={6}
            />
            <p className="mb-5 text-xs text-[var(--color-muted)]">
              Federal taxable income {money(d.federalTaxable)}
              {d.stateNote ? "" : ` · state taxable income ${money(d.stateTaxable)}`}.
            </p>
          </ResultCard>
        )}
      />
    </div>
  );
}
