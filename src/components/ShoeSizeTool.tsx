"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, SelectField, attempt, num, fmt } from "./CalcBits";
import { Ext } from "./GeoBits";
import { KITCHEN_RETRIEVED, SHOE_URL, shoeSizes, type ShoeSystem } from "@/lib/kitchen-calc";

type From = ShoeSystem | "foot-cm" | "foot-in";

/** One UK/US half size = 1/6 inch of last length, so the chart steps in half sizes. */
const HALF_STEPS = [-3, -2, -1, 0, 1, 2, 3].map((k) => (k * 25.4) / 6);

export default function ShoeSizeTool() {
  const [from, setFrom] = useState<From>("us-men");
  const [value, setValue] = useState("10");
  const result = attempt(() => shoeSizes(num(value), from));
  const s = (x: number) => fmt(x, 1);

  return (
    <div>
      <Grid cols={2}>
        <SelectField
          label="I know my"
          value={from}
          onChange={setFrom}
          options={[
            ["us-men", "US men's size"],
            ["us-women", "US women's size"],
            ["uk", "UK size"],
            ["eu", "EU size"],
            ["mondo", "Mondopoint (mm)"],
            ["foot-cm", "Foot length (cm)"],
            ["foot-in", "Foot length (inches)"],
          ]}
        />
        <NumField label="Size or length" value={value} onChange={setValue} />
      </Grid>
      <Hint>Adult sizes only. To measure a foot, stand on paper, mark heel and longest toe, and measure between the marks.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`Foot length about ${fmt(d.footMm / 10, 1)} cm (${fmt(d.footIn, 2)} in)`}
            headline={`US men's ${s(d.usMen)} · US women's ${s(d.usWomen)} · UK ${s(d.uk)} · EU ${s(d.eu)}`}
            sub={`Mondopoint ${d.mondo} mm`}
            limits="Brands do not all follow these equations, and fit also depends on width and the shoe's shape. Check the brand's own size chart and try shoes on when you can. Children's sizes use a different zero point and are not covered."
            method={
              <p>
                Equations from foot length L in mm (ISO/TS 19407 as summarised on <Ext href={SHOE_URL}>Wikipedia: Shoe size</Ext>): EU = 3/20 × L + 2; UK = 3/25.4 × L − 23; US men&apos;s = UK + 1; US women&apos;s = UK + 2. Rounded to the nearest half
                size. Retrieved {KITCHEN_RETRIEVED}.
              </p>
            }
          >
            <DataTable
              head={["Foot (cm)", "US men's", "US women's", "UK", "EU"]}
              rows={HALF_STEPS.filter((dmm) => d.footMm + dmm >= 180 && d.footMm + dmm <= 340).map((dmm) => {
                const r = shoeSizes(d.footMm + dmm, "mondo");
                return [fmt((d.footMm + dmm) / 10, 1), s(r.usMen), s(r.usWomen), s(r.uk), s(r.eu)];
              })}
              highlight={HALF_STEPS.filter((dmm) => dmm < 0 && d.footMm + dmm >= 180).length}
            />
          </ResultCard>
        )}
      />
    </div>
  );
}
