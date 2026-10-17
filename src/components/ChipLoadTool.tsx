"use client";

import { useState } from "react";
import { chipLoad, HAAS_URL, CHIP_RETRIEVED } from "@/lib/chip-load";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, optNum, fmt } from "./CalcBits";

export default function ChipLoadTool() {
  const [unit, setUnit] = useState<"in" | "mm">("in");
  const [solve, setSolve] = useState<"chipload" | "feed">("chipload");
  const [rpm, setRpm] = useState("10000");
  const [flutes, setFlutes] = useState("3");
  const [feed, setFeed] = useState("60");
  const [cl, setCl] = useState("0.002");
  const [dia, setDia] = useState("0.5");
  const fu = unit === "in" ? "in/min" : "mm/min";

  const result = attempt(() => chipLoad({ solveFor: solve, rpm: num(rpm), flutes: num(flutes), feed: num(feed), chipLoad: num(cl), diameter: optNum(dia), unit }));

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Units" value={unit} onChange={setUnit} options={[["in", "Inch"], ["mm", "Metric"]]} />
        <SelectField label="Find" value={solve} onChange={setSolve} options={[["chipload", "Chip load from feed rate"], ["feed", "Feed rate from chip load"]]} />
        <NumField label="Spindle speed (RPM)" value={rpm} onChange={setRpm} />
      </Grid>
      <Grid cols={3}>
        <NumField label="Number of flutes (teeth)" value={flutes} onChange={setFlutes} step="1" />
        {solve === "chipload" ? <NumField label={`Feed rate (${fu})`} value={feed} onChange={setFeed} /> : <NumField label={`Chip load (${unit} per tooth)`} value={cl} onChange={setCl} />}
        <NumField label={`Tool diameter (${unit}, optional)`} value={dia} onChange={setDia} hint="For surface speed." />
      </Grid>
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={solve === "chipload" ? "Chip load" : "Feed rate"}
            headline={solve === "chipload" ? `${fmt(d.chipLoad, unit === "in" ? 5 : 4)} ${unit} per tooth` : `${fmt(d.feed, 1)} ${fu}`}
            sub={`${fmt(d.feed, 1)} ${fu} at ${rpm} RPM with ${flutes} flutes · ${fmt(d.feedPerRev, unit === "in" ? 4 : 3)} ${unit} per revolution${d.surfaceSpeed !== null ? ` · ${fmt(d.surfaceSpeed, 0)} ${unit === "in" ? "SFM" : "m/min"}` : ""}`}
            rows={[
              ["Chip load (feed per tooth)", `${fmt(d.chipLoad, 5)} ${unit}`],
              ["Feed per revolution", `${fmt(d.feedPerRev, 5)} ${unit}`],
              ["Feed rate", `${fmt(d.feed, 2)} ${fu}`],
              ...(d.surfaceSpeed !== null ? ([["Surface speed", `${fmt(d.surfaceSpeed, 1)} ${unit === "in" ? "ft/min (SFM)" : "m/min"}`]] as const) : []),
            ]}
            limits="What chip load your tool and material need — that comes from the cutter maker's chart. Radial chip thinning on light side cuts, machine rigidity and workholding all change the right figure."
            method={
              <p>
                Method: IPM = feed per tooth × number of teeth × RPM, so chip load = IPM ÷ (RPM × teeth); surface speed = RPM × π × D ÷ 12 — Haas Automation,{" "}
                <a className="underline" href={HAAS_URL}>
                  Mill Speeds and Feeds Formulas (inch)
                </a>
                . Retrieved {CHIP_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
