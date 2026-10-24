"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, SelectField, attempt, money, num } from "./CalcBits";
import { carLoan, payment } from "@/lib/money-calc";

const TERMS = ["24", "36", "48", "60", "72", "84"] as const;

export default function CarPaymentTool() {
  const [price, setPrice] = useState("32000");
  const [down, setDown] = useState("4000");
  const [trade, setTrade] = useState("0");
  const [tax, setTax] = useState("6");
  const [fees, setFees] = useState("500");
  const [apr, setApr] = useState("6.5");
  const [months, setMonths] = useState<string>("60");
  const [after, setAfter] = useState(true);

  const result = attempt(() =>
    carLoan({ price: num(price), down: num(down), tradeIn: num(trade), taxPct: num(tax), fees: num(fees), aprPct: num(apr), months: num(months), taxAfterTrade: after }),
  );

  return (
    <div>
      <Grid cols={4}>
        <NumField label="Vehicle price ($)" value={price} onChange={setPrice} />
        <NumField label="Down payment ($)" value={down} onChange={setDown} />
        <NumField label="Trade-in value ($)" value={trade} onChange={setTrade} hint="Minus any loan still owed on it." />
        <NumField label="Sales tax (%)" value={tax} onChange={setTax} />
      </Grid>
      <Grid cols={4}>
        <NumField label="Fees financed ($)" value={fees} onChange={setFees} hint="Title, registration, dealer fees." />
        <NumField label="APR (%)" value={apr} onChange={setApr} />
        <SelectField label="Term (months)" value={months as (typeof TERMS)[number]} onChange={setMonths} options={TERMS.map((t) => [t, `${t} months (${Number(t) / 12} yr)`] as const)} />
        <label className="flex items-center gap-2 pt-6 text-sm">
          <input type="checkbox" checked={after} onChange={(e) => setAfter(e.target.checked)} />
          <span>Tax only the price after trade-in</span>
        </label>
      </Grid>
      <Hint>States differ on whether the trade-in lowers the taxed price; untick the box if yours taxes the full price.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`${months}-month loan at ${apr}% APR`}
            headline={`${money(d.monthly)} a month`}
            sub={`Amount financed ${money(d.financed)} · total interest ${money(d.totalInterest)} · total of payments ${money(d.totalPaid)}`}
            rows={[
              ["Sales tax", money(d.salesTax)],
              ["Amount financed", money(d.financed)],
              ["Total interest", money(d.totalInterest)],
              ["Total cost (payments + down + trade-in)", money(d.totalCost)],
            ]}
            limits="The lender's figure can differ by a few cents because of rounding, the first payment date and how interest accrues between payments. It leaves out insurance, gap coverage, warranties and any add-ons sold with the loan. The APR you qualify for is set by the lender."
            method={<p>Method: standard amortizing loan, payment = P × r ÷ (1 − (1 + r)^−n), with r = APR ÷ 12 and n = months; at 0% the payment is P ÷ n. Financed = price + tax + fees − down − trade-in. Calculated in your browser.</p>}
          >
            <h3 className="mb-2 font-semibold tracking-wide uppercase">Same loan, other terms</h3>
            <DataTable
              head={["Term", "Monthly", "Total interest"]}
              rows={TERMS.map((t) => {
                const m = payment(d.financed, num(apr), Number(t));
                return [`${t} months`, money(m), money(m * Number(t) - d.financed)];
              })}
              highlight={TERMS.indexOf(months as (typeof TERMS)[number])}
            />
            <h3 className="mb-2 font-semibold tracking-wide uppercase">Year-by-year</h3>
            <DataTable head={["Year", "Interest paid", "Principal paid", "Balance left"]} rows={d.schedule.map((r) => [r.year, money(r.interest), money(r.principal), money(r.balance)])} />
          </ResultCard>
        )}
      />
    </div>
  );
}
