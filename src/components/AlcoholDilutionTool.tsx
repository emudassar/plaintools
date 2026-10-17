"use client";

import { useState } from "react";
import { c1v1, fromMl, VOLUME_UNITS, PROOF_URL, type VolUnit } from "@/lib/dilution";
import { ToolError } from "@/lib/errors";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

const unitOptions = Object.entries(VOLUME_UNITS).map(([k, v]) => [k, v.label] as const) as [VolUnit, string][];

export default function AlcoholDilutionTool() {
  const [scale, setScale] = useState<"abv" | "proof">("abv");
  const [c1, setC1] = useState("60");
  const [c2, setC2] = useState("40");
  const [known, setKnown] = useState<"v1" | "v2">("v1");
  const [amount, setAmount] = useState("750");
  const [unit, setUnit] = useState<VolUnit>("ml");
  const toAbv = (v: number) => (scale === "proof" ? v / 2 : v);

  const result = attempt(() => {
    if (toAbv(num(c1)) > 100) throw new ToolError("bad-input", "Strength can be at most 100% ABV (200 proof).");
    return c1v1({ c1: toAbv(num(c1)), c2: toAbv(num(c2)), known, amount: num(amount), unit });
  });
  const show = (ml: number) => `${fmt(fromMl(ml, unit), 2)} ${VOLUME_UNITS[unit].label}`;
  const s = scale === "proof" ? "proof" : "% ABV";

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Strength in" value={scale} onChange={setScale} options={[["abv", "% alcohol by volume (ABV)"], ["proof", "US proof"]]} />
        <NumField label={`Starting strength (${s})`} value={c1} onChange={setC1} />
        <NumField label={`Target strength (${s})`} value={c2} onChange={setC2} />
      </Grid>
      <Grid cols={3}>
        <SelectField label="You know" value={known} onChange={setKnown} options={[["v1", "How much strong spirit you have"], ["v2", "How much finished drink you want"]]} />
        <NumField label="Amount" value={amount} onChange={setAmount} />
        <SelectField label="Unit" value={unit} onChange={setUnit} options={unitOptions} />
      </Grid>
      <Hint>Adds plain water only. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Water to add"
            headline={show(d.waterMl)}
            sub={`${show(d.v1Ml)} at ${c1} ${s} + ${show(d.waterMl)} water → about ${show(d.v2Ml)} at ${c2} ${s}`}
            rows={[
              ["Starting ABV", `${fmt(toAbv(num(c1)), 2)}% (${fmt(toAbv(num(c1)) * 2, 1)} proof)`],
              ["Target ABV", `${fmt(toAbv(num(c2)), 2)}% (${fmt(toAbv(num(c2)) * 2, 1)} proof)`],
              ["Dilution factor", `${fmt(d.factor, 3)}×`],
            ]}
            limits="The exact final volume. Mixing alcohol and water shrinks the total slightly, so the finished amount is a little less than spirit + water and the strength lands a touch above target; check it with a hydrometer at the right temperature. Nothing here covers distilling, which needs a federal permit in the US."
            method={
              <>
                <p>Method: C₁ × V₁ = C₂ × V₂ (the amount of alcohol stays the same); water = V₂ − V₁. Plain arithmetic in your browser.</p>
                <p className="mt-1">
                  Proof: 26 U.S.C. §5002(a)(10) defines proof spirits as liquid containing &ldquo;one-half its volume of ethyl alcohol&rdquo;, so US proof = 2 × ABV (
                  <a className="underline" href={PROOF_URL}>
                    text
                  </a>
                  ).
                </p>
              </>
            }
          />
        )}
      />
    </div>
  );
}
