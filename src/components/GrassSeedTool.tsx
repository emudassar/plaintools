"use client";

import { useState } from "react";
import { grassSeed, SPECIES, AGR52_URL, SEED_RETRIEVED, type Species } from "@/lib/grass-seed";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, optNum, fmt } from "./CalcBits";

const opts = [...Object.entries(SPECIES).map(([k, v]) => [k, `${v.label} — ${v.low === v.high ? v.low : `${v.low}–${v.high}`} lb${v.pls ? " PLS" : ""}`] as const), ["custom", "Rate from my seed bag"] as const] as [Species, string][];

export default function GrassSeedTool() {
  const [mode, setMode] = useState<"dims" | "area">("dims");
  const [len, setLen] = useState("50");
  const [wid, setWid] = useState("40");
  const [area, setArea] = useState("2000");
  const [species, setSpecies] = useState<Species>("tf");
  const [rate, setRate] = useState("5");
  const [purity, setPurity] = useState("95");
  const [germ, setGerm] = useState("85");
  const [bag, setBag] = useState("");
  const sqft = mode === "dims" ? num(len) * num(wid) : num(area);

  const result = attempt(() => grassSeed({ areaSqFt: sqft, species, customRate: num(rate), purityPct: num(purity), germPct: num(germ), bagLb: optNum(bag) }));

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Area from" value={mode} onChange={setMode} options={[["dims", "Length × width"], ["area", "Total square feet"]]} />
        {mode === "dims" ? (
          <>
            <NumField label="Length (ft)" value={len} onChange={setLen} />
            <NumField label="Width (ft)" value={wid} onChange={setWid} />
          </>
        ) : (
          <NumField label="Area (ft²)" value={area} onChange={setArea} />
        )}
      </Grid>
      <Grid cols={2}>
        <SelectField label="Grass (new lawn rates, UK AGR-52)" value={species} onChange={setSpecies} options={opts} />
        {species === "custom" && <NumField label="Seeding rate (lb per 1,000 ft²)" value={rate} onChange={setRate} />}
      </Grid>
      <Grid cols={3}>
        <NumField label="Purity % (seed tag)" value={purity} onChange={setPurity} />
        <NumField label="Germination % (seed tag)" value={germ} onChange={setGerm} />
        <NumField label="Bag size, lb (optional)" value={bag} onChange={setBag} />
      </Grid>
      <Hint>Rates marked PLS are pure live seed; the page converts them to pounds of bagged seed using your tag&apos;s purity and germination.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Seed to buy"
            headline={d.lbLow === d.lbHigh ? `${fmt(d.lbLow, 1)} lb of seed` : `${fmt(d.lbLow, 1)}–${fmt(d.lbHigh, 1)} lb of seed`}
            sub={`${fmt(sqft, 0)} ft² at ${d.rateLow === d.rateHigh ? d.rateLow : `${d.rateLow}–${d.rateHigh}`} lb${d.isPls ? " PLS" : ""} per 1,000 ft²${d.bagsLow !== null ? ` · ${d.bagsLow === d.bagsHigh ? d.bagsLow : `${d.bagsLow}–${d.bagsHigh}`} bags of ${bag} lb` : ""}`}
            rows={[
              ["Area", `${fmt(sqft, 0)} ft² (${fmt(sqft / 43560, 3)} acres)`],
              ["Seeding rate", `${d.rateLow === d.rateHigh ? d.rateLow : `${d.rateLow}–${d.rateHigh}`} lb per 1,000 ft²${d.isPls ? " pure live seed" : ""}`],
              ...(d.isPls ? ([["Pure live seed in your bag", `${fmt(d.plsFraction * 100, 1)}% (purity × germination)`]] as const) : []),
            ]}
            limits="Which grass suits your yard, or rates for overseeding an existing lawn. The rates are University of Kentucky's for new lawns in Kentucky; other states' extension services publish their own. Seed blends list their own rate on the bag — use 'Rate from my seed bag' for those."
            method={
              <p>
                Method: area ÷ 1,000 × rate; PLS rates ÷ (purity × germination). Rates: University of Kentucky Cooperative Extension,{" "}
                <a className="underline" href={AGR52_URL}>
                  AGR-52 Selecting the Right Grass for Your Kentucky Lawn
                </a>{" "}
                (2019). Retrieved {SEED_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
