"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, SelectField, attempt, money, num, fmt } from "./CalcBits";
import { Ext } from "./GeoBits";
import { RETRIEVED, SALES_SOURCE, SALES_STATES, SALES_URL, salesTax } from "@/lib/money-calc";

export default function SalesTaxTool() {
  const [state, setState] = useState("Texas");
  const st = SALES_STATES.find((s) => s.state === state)!;
  const [local, setLocal] = useState(String(st.avg_local));
  const [amount, setAmount] = useState("100");
  const [mode, setMode] = useState<"add" | "remove">("add");

  const pick = (s: string) => {
    setState(s);
    setLocal(String(SALES_STATES.find((x) => x.state === s)!.avg_local));
  };
  const rate = st.state_rate + num(local);
  const result = attempt(() => salesTax(num(amount), rate, mode));

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="State" value={state} onChange={pick} options={SALES_STATES.map((s) => [s.state, s.state] as const)} />
        <NumField label="Local (city + county) rate, %" value={local} onChange={setLocal} hint={`${state}: average local ${st.avg_local}%, highest ${st.max_local}%. Use your city's rate.`} />
        <NumField label={mode === "add" ? "Price before tax ($)" : "Total paid, tax included ($)"} value={amount} onChange={setAmount} />
      </Grid>
      <Grid cols={2}>
        <SelectField label="Calculate" value={mode} onChange={setMode} options={[["add", "Add tax to a price"], ["remove", "Take tax out of a total (reverse)"]]} />
      </Grid>
      <Hint>
        The local rate starts at the state&apos;s population-weighted average local rate; replace it with your city&apos;s combined local rate from your state revenue department or a receipt.
      </Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`${state} sales tax at ${fmt(rate, 3)}% (${st.state_rate}% state + ${fmt(num(local), 3)}% local)`}
            headline={mode === "add" ? `${money(d.total)} total · ${money(d.tax)} tax` : `${money(d.price)} before tax · ${money(d.tax)} tax`}
            rows={[
              ["Price before tax", money(d.price)],
              ["Sales tax", money(d.tax)],
              ["Total", money(d.total)],
            ]}
            limits="Whether an item is taxed at all, and at what rate, depends on the state: many exempt groceries or prescription drugs, some tax clothing differently, and special district taxes can apply. City rates change during the year. Use your state's official rate lookup for a specific address."
            method={
              <p>
                Rates: <Ext href={SALES_URL}>{SALES_SOURCE}</Ext>. The average local rate is population-weighted. Tax = price × combined rate; reverse: price = total ÷ (1 + rate). Retrieved {RETRIEVED}.
              </p>
            }
          >
            <h3 className="mb-2 font-semibold tracking-wide uppercase">{state} in the table</h3>
            <DataTable
              head={["State rate", "Avg. local", "Max local", "Avg. combined"]}
              rows={[[`${st.state_rate}%`, `${st.avg_local}%`, `${st.max_local}%`, `${st.combined}%`]]}
            />
          </ResultCard>
        )}
      />
    </div>
  );
}
