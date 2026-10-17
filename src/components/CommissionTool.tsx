"use client";

import { useState } from "react";
import { commission } from "@/lib/real-estate-commission";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, fmt, money } from "./CalcBits";

export default function CommissionTool() {
  const [price, setPrice] = useState("400000");
  const [mode, setMode] = useState<"percent" | "flat">("percent");
  const [rate, setRate] = useState("5");
  const [flat, setFlat] = useState("10000");
  const [share, setShare] = useState("50");
  const [split, setSplit] = useState("70");
  const [other, setOther] = useState("0");
  const [payoff, setPayoff] = useState("0");

  const result = attempt(() =>
    commission({ price: num(price), mode, ratePct: num(rate), flat: num(flat), listingSharePct: num(share), agentSplitPct: num(split), otherCosts: num(other), payoff: num(payoff) }),
  );

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Sale price (USD)" value={price} onChange={setPrice} />
        <SelectField label="Commission is" value={mode} onChange={setMode} options={[["percent", "A percentage of the price"], ["flat", "A flat fee"]]} />
        {mode === "percent" ? <NumField label="Total commission rate (%)" value={rate} onChange={setRate} /> : <NumField label="Flat fee (USD)" value={flat} onChange={setFlat} />}
      </Grid>
      <Grid cols={2}>
        <NumField label="Listing side's share of the commission (%)" value={share} onChange={setShare} hint="100 if the seller pays only their own agent." />
        <NumField label="Listing agent's split with their brokerage (%)" value={split} onChange={setSplit} />
      </Grid>
      <Grid cols={2}>
        <NumField label="Other seller closing costs (USD)" value={other} onChange={setOther} />
        <NumField label="Mortgage payoff (USD)" value={payoff} onChange={setPayoff} />
      </Grid>
      <Hint>Use the rate and splits in your own listing or buyer agreement. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Total commission"
            headline={money(d.total)}
            sub={`${fmt(d.effectiveRatePct, 3)}% of ${money(num(price))} · seller nets about ${money(d.sellerNet)}`}
            rows={[
              ["Listing side", money(d.listingSide)],
              ["Buyer side", money(d.buyerSide)],
              ["Listing agent (after brokerage split)", money(d.listingAgent)],
              ["Listing brokerage", money(d.listingBrokerage)],
              ["Seller net after commission, other costs and payoff", money(d.sellerNet)],
            ]}
            limits="What your agreement actually says. Commissions are set by the written agreement between the parties; there is no standard rate. The seller net leaves out taxes, prorations, credits and anything else on your settlement statement."
            method={<p>Method: price × rate (or the flat fee); × listing share; × agent split. Seller net = price − commission − other costs − payoff. Plain arithmetic in your browser.</p>}
          />
        )}
      />
    </div>
  );
}
