"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, ResultCard, Output, SelectField, TextField, attempt, fmt } from "./CalcBits";
import { Ext } from "./GeoBits";
import { KITCHEN_RETRIEVED, RING_URL, ringSizes, type RingSystem } from "@/lib/kitchen-calc";

const CHART = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export default function RingSizeTool() {
  const [from, setFrom] = useState<RingSystem>("us");
  const [value, setValue] = useState("7");
  const result = attempt(() => ringSizes(value, from));

  return (
    <div>
      <Grid cols={2}>
        <SelectField
          label="I know"
          value={from}
          onChange={setFrom}
          options={[
            ["us", "US / Canada size (e.g. 7 or 7.25)"],
            ["uk", "UK / Australia letter (e.g. N or N½)"],
            ["iso", "ISO / EU size = inner circumference (mm)"],
            ["diameter", "Inner diameter of a ring that fits (mm)"],
            ["swiss", "Italy / Spain / Swiss size"],
          ]}
        />
        <TextField label="Size or measurement" value={value} onChange={setValue} hint="A finger circumference measured with string or paper is the ISO size in mm." />
      </Grid>
      <Hint>Measure at room temperature; fingers change size with heat and time of day.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`Inner circumference ${fmt(d.circumference, 1)} mm · diameter ${fmt(d.diameter, 1)} mm`}
            headline={`US ${fmt(d.us, 2)} · UK ${d.uk} · EU ${fmt(d.iso, 1)}`}
            rows={[
              ["US / Canada / Mexico", fmt(d.us, 2)],
              ["UK / Ireland / Australia / NZ", d.uk],
              ["ISO 8653 (France, Nordics, much of Europe)", fmt(d.iso, 1)],
              ["Italy / Spain / Switzerland", fmt(d.swiss, 1)],
              ["Germany / Netherlands (diameter, mm)", fmt(d.germany, 1)],
              ["Inner diameter", `${fmt(d.diameter, 2)} mm (${fmt(d.diameter / 25.4, 3)} in)`],
            ]}
            limits="Jewellers' sizing tools differ slightly, and US sizes were never set by a precise national standard. India, Japan and China use their own non-linear scales, which are not converted here. A jeweller's sizer on the actual finger is the most reliable measure."
            method={
              <p>
                Relations from <Ext href={RING_URL}>Wikipedia: Ring size</Ext>: ISO size = inner circumference in mm; US circumference = 2.55 × size + 36.5 mm; UK (BS 6820:1987) 1.25 mm per letter with C = 40 mm; Swiss = circumference − 40;
                German = diameter. Retrieved {KITCHEN_RETRIEVED}.
              </p>
            }
          >
            <DataTable
              head={["US", "UK", "Circumference (mm)", "Diameter (mm)"]}
              rows={CHART.map((u) => {
                const r = ringSizes(String(u), "us");
                return [u, r.uk, fmt(r.circumference, 1), fmt(r.diameter, 1)];
              })}
              highlight={CHART.indexOf(Math.round(d.us))}
            />
          </ResultCard>
        )}
      />
    </div>
  );
}
