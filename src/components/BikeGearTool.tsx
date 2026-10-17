"use client";

import { useState } from "react";
import { bikeGear, gearTable, SHELDON_GAIN_URL, GEAR_RETRIEVED } from "@/lib/bike-gear";
import { NumField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

const RINGS = [25, 26, 27, 28, 30, 33, 36];
const COGS = [8, 9, 10, 11, 12, 13, 14];

export default function BikeGearTool() {
  const [ring, setRing] = useState("25");
  const [cog, setCog] = useState("9");
  const [wheel, setWheel] = useState("20");
  const [crank, setCrank] = useState("175");
  const [cad, setCad] = useState("90");

  const result = attempt(() => bikeGear({ chainring: num(ring), cog: num(cog), wheelIn: num(wheel), crankMm: num(crank), cadence: num(cad) }));
  const table = gearTable(RINGS, COGS, num(wheel) || 20);

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Front sprocket (teeth)" value={ring} onChange={setRing} step="1" />
        <NumField label="Rear cog / driver (teeth)" value={cog} onChange={setCog} step="1" />
        <NumField label="Wheel diameter with tyre (in)" value={wheel} onChange={setWheel} hint="About 20 for a 20 in BMX; measure for accuracy." />
      </Grid>
      <Grid cols={2}>
        <NumField label="Crank length (mm)" value={crank} onChange={setCrank} />
        <NumField label="Cadence (rpm)" value={cad} onChange={setCad} />
      </Grid>
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`${ring}/${cog} gearing`}
            headline={`${fmt(d.gearInches, 1)} gear inches · ratio ${fmt(d.ratio, 3)}`}
            sub={`${fmt(d.rolloutIn, 1)} in rollout per pedal turn · ${fmt(d.developmentM, 2)} m development · gain ratio ${fmt(d.gainRatio, 2)} · ${fmt(d.mph, 1)} mph (${fmt(d.kmh, 1)} km/h) at ${cad} rpm`}
            limits="Which gearing suits your riding or track; rider strength and course decide that. The result is only as good as the wheel diameter you enter — tyre size and pressure change it."
            method={
              <p>
                Method: gear inches = wheel diameter × front ÷ rear; development = wheel diameter (m) × front × π ÷ rear; gain ratio = (wheel radius ÷ crank
                length) × front ÷ rear — Sheldon Brown,{" "}
                <a className="underline" href={SHELDON_GAIN_URL}>
                  Gain Ratios
                </a>
                . Retrieved {GEAR_RETRIEVED}.
              </p>
            }
          />
        )}
      />
      <h3 className="mt-8 mb-3 text-lg font-semibold">Gear inches chart for a {wheel} in wheel</h3>
      <div className="overflow-x-auto rounded-md border border-[var(--color-line)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-accent-soft)]">
            <tr>
              <th className="px-3 py-2">Front \ rear</th>
              {COGS.map((c) => (
                <th key={c} className="px-3 py-2">
                  {c}T
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {RINGS.map((r, i) => (
              <tr key={r}>
                <td className="px-3 py-2 font-medium">{r}T</td>
                {table[i].map((v, j) => (
                  <td key={j} className={`px-3 py-2 ${String(r) === ring && String(COGS[j]) === cog ? "bg-[var(--color-accent-soft)] font-semibold" : ""}`}>
                    {fmt(v, 1)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
