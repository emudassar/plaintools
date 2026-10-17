"use client";

import { useState } from "react";
import { selfLeveling, QK_SL_URL, QK_SL_YIELD, SL_RETRIEVED } from "@/lib/self-leveling";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

export default function SelfLevelingTool() {
  const [mode, setMode] = useState<"dims" | "area">("dims");
  const [l, setL] = useState("12");
  const [w, setW] = useState("10");
  const [area, setArea] = useState("120");
  const [t, setT] = useState("0.25");
  const [product, setProduct] = useState<"qk" | "custom">("qk");
  const [yieldCf, setYield] = useState("0.45");
  const [bag, setBag] = useState("50");
  const [waste, setWaste] = useState("10");
  const sqft = mode === "dims" ? num(l) * num(w) : num(area);

  const result = attempt(() => selfLeveling({ areaSqFt: sqft, thicknessIn: num(t), yieldCuFt: product === "qk" ? QK_SL_YIELD : num(yieldCf), bagLb: product === "qk" ? 50 : num(bag), wastePct: num(waste) }));

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Area from" value={mode} onChange={setMode} options={[["dims", "Length × width"], ["area", "Total square feet"]]} />
        {mode === "dims" ? (
          <>
            <NumField label="Length (ft)" value={l} onChange={setL} />
            <NumField label="Width (ft)" value={w} onChange={setW} />
          </>
        ) : (
          <NumField label="Area (ft²)" value={area} onChange={setArea} />
        )}
      </Grid>
      <Grid cols={3}>
        <NumField label="Average thickness (in)" value={t} onChange={setT} hint="0.125 = 1/8, 0.25 = 1/4, 0.5 = 1/2. Average across low spots." />
        <SelectField label="Product" value={product} onChange={setProduct} options={[["qk", "QUIKRETE Self-Leveling Floor Resurfacer, 50 lb"], ["custom", "Another product (enter its yield)"]]} />
        <NumField label="Extra allowance (%)" value={waste} onChange={setWaste} />
      </Grid>
      {product === "custom" && (
        <Grid cols={2}>
          <NumField label="Yield per bag (ft³)" value={yieldCf} onChange={setYield} />
          <NumField label="Bag weight (lb)" value={bag} onChange={setBag} />
        </Grid>
      )}
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Self-leveler needed"
            headline={`${d.bags} bags (${d.lbs.toLocaleString("en-US")} lb)`}
            sub={`${fmt(d.cuFt, 2)} ft³ for ${fmt(sqft, 0)} ft² at ${t} in with your ${waste}% allowance · ${fmt(d.coveragePerBag, 1)} ft² per bag at this thickness`}
            rows={[
              ["Volume", `${fmt(d.cuFt, 2)} ft³`],
              ["Coverage per bag at this thickness", `${fmt(d.coveragePerBag, 1)} ft²`],
              ...(product === "qk" && num(t) > 0.625 ? ([["Layers (5/8 in maximum each, per Quikrete)", String(d.layers)]] as const) : []),
            ]}
            limits="How uneven your floor really is. Low spots take far more than the average, so map the floor with a long level first. Priming, dams and the substrate's condition are in the product's instructions, not here."
            method={
              <p>
                Method: area × thickness = volume; ÷ yield per bag, rounded up. QUIKRETE Self-Leveling Floor Resurfacer (No. 1249-50): a 50 lb bag gives
                0.45 ft³ and covers 21 ft² at 1/4 in; installs from 5/8 in to a feather edge, deeper in layers of 5/8 in or less (
                <a className="underline" href={QK_SL_URL}>
                  data sheet
                </a>
                ). Retrieved {SL_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
