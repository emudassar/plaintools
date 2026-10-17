"use client";

import { useState } from "react";
import { wellVolume } from "@/lib/well-volume";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, optNum, fmt } from "./CalcBits";

export default function WellVolumeTool() {
  const [casing, setCasing] = useState("6");
  const [depth, setDepth] = useState("200");
  const [swl, setSwl] = useState("50");
  const [unit, setUnit] = useState<"ft" | "m">("ft");
  const [ppm, setPpm] = useState("");
  const [bleach, setBleach] = useState("6");

  const result = attempt(() => wellVolume({ casingIn: num(casing), depth: num(depth), staticLevel: num(swl), unit, targetPpm: optNum(ppm), bleachPct: num(bleach) }));

  return (
    <div>
      <Grid cols={4}>
        <NumField label="Casing inside diameter (in)" value={casing} onChange={setCasing} />
        <NumField label={`Total well depth (${unit})`} value={depth} onChange={setDepth} />
        <NumField label={`Static water level (${unit})`} value={swl} onChange={setSwl} hint="Depth from the top of the casing down to the water." />
        <SelectField label="Depth unit" value={unit} onChange={setUnit} options={[["ft", "Feet"], ["m", "Metres"]]} />
      </Grid>
      <Grid cols={2}>
        <NumField label="Target chlorine (ppm = mg/L), optional" value={ppm} onChange={setPpm} hint="Use the figure from your state or local health department's procedure." />
        <NumField label="Bleach strength (% from the label)" value={bleach} onChange={setBleach} />
      </Grid>
      <Hint>Depths are measured from the top of the casing. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Water standing in the well"
            headline={`${fmt(d.gallons, 1)} US gallons`}
            sub={`${fmt(d.columnFt, 1)} ft of water × ${fmt(d.galPerFoot, 3)} gal per ft · ${fmt(d.liters, 0)} litres`}
            rows={[
              ["Gallons per foot of casing", `${fmt(d.galPerFoot, 4)} gal/ft (${fmt(d.litersPerMetre, 2)} L/m)`],
              ["Water column", `${fmt(d.columnFt, 2)} ft`],
              ...(d.bleachGal !== null
                ? ([["Bleach for " + ppm + " ppm in the casing water", `${fmt(d.bleachGal, 3)} gal = ${fmt(d.bleachCups!, 1)} cups = ${fmt(d.bleachMl!, 0)} ml`]] as const)
                : []),
            ]}
            limits="How much water the surrounding rock or gravel pack holds, or what's in the pressure tank and plumbing — only the open casing column is counted. Chlorinating a well has its own procedure (unscented bleach, circulating, flushing, testing afterward); follow your health department's instructions, and treat the bleach figure only as the arithmetic for the concentration you enter."
            method={
              <p>
                Method: gallons per foot = π × (inside diameter ÷ 2)² × 12 ÷ 231 (a US gallon is 231 in³, NIST Handbook 44); × (well depth − static water
                level). Bleach volume = water gallons × ppm ÷ (bleach % × 10,000). Plain arithmetic in your browser.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
