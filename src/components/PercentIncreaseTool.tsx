"use client";

import { useState } from "react";
import { Grid, Hint, NumField, ResultCard, Output, SelectField, attempt, num, fmt } from "./CalcBits";
import { Tabs } from "./ToolBits";
import { applyPercent, percentChange, reversePercent } from "@/lib/study-calc";

type Mode = "change" | "apply" | "reverse";

export default function PercentIncreaseTool() {
  const [mode, setMode] = useState<Mode>("change");
  const [a, setA] = useState("80");
  const [b, setB] = useState("100");
  const [pct, setPct] = useState("15");
  const [dir, setDir] = useState<"increase" | "decrease">("increase");

  const change = attempt(() => percentChange(num(a), num(b)));
  const applied = attempt(() => applyPercent(num(a), num(pct), dir));
  const reversed = attempt(() => reversePercent(num(a), num(pct), dir));

  return (
    <div>
      <Tabs
        value={mode}
        onChange={setMode}
        options={[
          ["change", "% change from A to B"],
          ["apply", "Add or subtract a %"],
          ["reverse", "Original before a %"],
        ]}
      />
      {mode === "change" ? (
        <Grid cols={2}>
          <NumField label="Original value (A)" value={a} onChange={setA} min="" />
          <NumField label="New value (B)" value={b} onChange={setB} min="" />
        </Grid>
      ) : (
        <Grid cols={3}>
          <NumField label={mode === "apply" ? "Starting value" : "Value after the change"} value={a} onChange={setA} min="" />
          <NumField label="Percentage" value={pct} onChange={setPct} />
          <SelectField label="Direction" value={dir} onChange={setDir} options={[["increase", "Increase"], ["decrease", "Decrease"]]} />
        </Grid>
      )}
      <Hint>The result updates as you type.</Hint>
      {mode === "change" && (
        <Output
          result={change}
          render={(d) => (
            <ResultCard
              label={`From ${a} to ${b}`}
              headline={d.direction === "no change" ? "No change (0%)" : `${fmt(Math.abs(d.pct), 2)}% ${d.direction}`}
              sub={`Difference ${fmt(d.change, 4)} · B is ${fmt(d.ratio * 100, 2)}% of A · ${fmt(d.ratio, 4)}×`}
              limits="A percentage change is measured against the starting value, so going up 50% and then down 50% does not return to the start. Percentage points (a change from 5% to 7% is 2 points) are different from percent change (that is a 40% increase)."
              method={<p>Method: (new − original) ÷ |original| × 100. Undefined when the original is 0. Calculated in your browser.</p>}
            />
          )}
        />
      )}
      {mode === "apply" && (
        <Output
          result={applied}
          render={(v) => (
            <ResultCard
              label={`${a} ${dir === "increase" ? "+" : "−"} ${pct}%`}
              headline={fmt(v, 4)}
              sub={`The ${dir} is ${fmt(Math.abs(v - num(a)), 4)}`}
              method={<p>Method: value × (1 {dir === "increase" ? "+" : "−"} percentage ÷ 100).</p>}
            />
          )}
        />
      )}
      {mode === "reverse" && (
        <Output
          result={reversed}
          render={(v) => (
            <ResultCard
              label={`${a} after a ${pct}% ${dir}`}
              headline={`Original value: ${fmt(v, 4)}`}
              sub={`Check: ${fmt(v, 4)} ${dir === "increase" ? "+" : "−"} ${pct}% = ${fmt(applyPercent(v, num(pct), dir), 4)}`}
              method={<p>Method: value after ÷ (1 {dir === "increase" ? "+" : "−"} percentage ÷ 100). Subtracting the same percentage from the new value gives the wrong answer.</p>}
            />
          )}
        />
      )}
    </div>
  );
}
