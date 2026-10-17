"use client";

import { useState } from "react";
import { breakEvenRoas } from "@/lib/break-even-roas";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, optNum, fmt, money } from "./CalcBits";

export default function BreakEvenRoasTool() {
  const [mode, setMode] = useState<"margin" | "costs">("costs");
  const [margin, setMargin] = useState("40");
  const [price, setPrice] = useState("60");
  const [cost, setCost] = useState("22");
  const [ship, setShip] = useState("6");
  const [fees, setFees] = useState("3");
  const [actual, setActual] = useState("");
  const [target, setTarget] = useState("");

  const result = attempt(() =>
    breakEvenRoas({ mode, marginPct: num(margin), price: num(price), productCost: num(cost), shipping: num(ship), fees: num(fees), actualRoas: optNum(actual), targetProfitPct: optNum(target) }),
  );

  return (
    <div>
      <Grid cols={2}>
        <SelectField label="Work from" value={mode} onChange={setMode} options={[["costs", "Price and per-order costs"], ["margin", "A profit margin I know"]]} />
        {mode === "margin" && <NumField label="Profit margin before ads (%)" value={margin} onChange={setMargin} />}
      </Grid>
      {mode === "costs" && (
        <Grid cols={4}>
          <NumField label="Selling price ($)" value={price} onChange={setPrice} />
          <NumField label="Product cost ($)" value={cost} onChange={setCost} />
          <NumField label="Shipping ($)" value={ship} onChange={setShip} />
          <NumField label="Payment / platform fees ($)" value={fees} onChange={setFees} />
        </Grid>
      )}
      <Grid cols={2}>
        <NumField label="Your actual ROAS (optional)" value={actual} onChange={setActual} hint="Revenue ÷ ad spend, e.g. 3.2." />
        <NumField label="Profit you want after ads, % of revenue (optional)" value={target} onChange={setTarget} />
      </Grid>
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Break-even ROAS"
            headline={`${fmt(d.breakEvenRoas, 2)}× (${fmt(d.breakEvenAcosPct, 1)}% ACoS)`}
            sub={`At a ${fmt(d.marginPct, 1)}% margin, every $1 of ads must bring in ${money(d.breakEvenRoas)} in sales to break even${d.maxCpa !== null ? ` · max cost per sale ${money(d.maxCpa)}` : ""}`}
            rows={[
              ["Profit margin before ads", `${fmt(d.marginPct, 2)}%`],
              ["Break-even ROAS (1 ÷ margin)", `${fmt(d.breakEvenRoas, 3)}`],
              ["Break-even ACoS (ad spend ÷ revenue)", `${fmt(d.breakEvenAcosPct, 2)}%`],
              ...(d.targetRoas !== null ? ([[`ROAS for ${target}% profit after ads`, fmt(d.targetRoas, 3)]] as const) : []),
              ...(d.profitPerDollar !== null
                ? ([[`At your ROAS of ${actual}`, `${d.profitPerDollar >= 0 ? "profit" : "loss"} of ${money(Math.abs(d.profitPerDollar))} per $1 of ad spend`]] as const)
                : []),
            ]}
            limits="Repeat purchases and customer lifetime value, returns, or fixed overhead. Break-even here means the first order covers its own ad cost; a business that wins repeat customers may accept a lower ROAS, and one with high overhead needs more."
            method={<p>Method: margin = (price − product − shipping − fees) ÷ price; break-even ROAS = 1 ÷ margin; target ROAS = 1 ÷ (margin − target profit). Plain arithmetic in your browser.</p>}
          />
        )}
      />
    </div>
  );
}
