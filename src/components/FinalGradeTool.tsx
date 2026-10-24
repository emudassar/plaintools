"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, attempt, num, fmt } from "./CalcBits";
import { finalGrade } from "@/lib/study-calc";

export default function FinalGradeTool() {
  const [current, setCurrent] = useState("84");
  const [target, setTarget] = useState("80");
  const [weight, setWeight] = useState("25");
  const result = attempt(() => finalGrade(num(current), num(target), num(weight)));

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Current grade (%)" value={current} onChange={setCurrent} />
        <NumField label="Grade you want (%)" value={target} onChange={setTarget} hint="A = 90, B = 80 on many scales." />
        <NumField label="Final exam weight (%)" value={weight} onChange={setWeight} hint="From the syllabus." />
      </Grid>
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`To finish with ${target}% when the final is worth ${weight}%`}
            headline={d.needed <= 0 ? "Any score on the final gets you there" : `You need ${fmt(d.needed, 1)}% on the final`}
            sub={d.needed > 100 ? "That is more than 100%, so the target is out of reach unless the final has extra credit." : d.needed <= 0 ? `Even 0% on the final leaves you at ${fmt(num(current) * (1 - num(weight) / 100), 1)}%.` : undefined}
            limits="This assumes your current grade already counts everything except the final, and that the course uses a simple weighted average. Curves, dropped scores, points-based grading and minimum-score rules on the final change the answer; check the syllabus."
            method={<p>Method: needed = (target − current × (1 − w)) ÷ w, where w is the final&apos;s weight as a fraction. Calculated in your browser.</p>}
          >
            <DataTable head={["Score on final", "Final course grade"]} rows={d.table.map((r) => [`${r.finalScore}%`, `${fmt(r.overall, 1)}%`])} />
          </ResultCard>
        )}
      />
    </div>
  );
}
