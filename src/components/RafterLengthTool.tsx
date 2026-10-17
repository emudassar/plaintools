"use client";

import { useState } from "react";
import { rafterLength, feetInches, GRIFFITH_RAFTER_URL, RAFTER_RETRIEVED } from "@/lib/rafter-length";
import { NumField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

export default function RafterLengthTool() {
  const [span, setSpan] = useState("24");
  const [pitch, setPitch] = useState("6");
  const [over, setOver] = useState("12");
  const [ridge, setRidge] = useState("1.5");

  const result = attempt(() => rafterLength({ spanFt: num(span), pitch: num(pitch), overhangIn: num(over), ridgeIn: num(ridge) }));

  return (
    <div>
      <Grid cols={4}>
        <NumField label="Building span (ft)" value={span} onChange={setSpan} hint="Outside of wall plate to outside." />
        <NumField label="Pitch (rise per 12 in)" value={pitch} onChange={setPitch} />
        <NumField label="Overhang, level (in)" value={over} onChange={setOver} />
        <NumField label="Ridge board thickness (in)" value={ridge} onChange={setRidge} hint="1.5 for a 2× ridge, 0 for none." />
      </Grid>
      <Hint>Common rafters on a gable roof with the same pitch both sides. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Common rafter length"
            headline={`${feetInches(d.totalLength)} (${fmt(d.totalLength, 2)} ft)`}
            sub={`${feetInches(d.mainLength)} plate to ridge + ${feetInches(d.tailLength)} tail · ${d.stockFt ? `fits a ${d.stockFt} ft board` : "longer than 24 ft stock"}`}
            rows={[
              ["Run (half the span)", `${fmt(d.run, 3)} ft`],
              ["Run after half-ridge deduction", `${fmt(d.netRun, 3)} ft`],
              ["Total rise at the ridge centre", `${feetInches(d.rise)} (${fmt(d.rise, 2)} ft)`],
              ["Rafter length per foot of run", `${fmt(d.perFootIn, 2)} in`],
              ["Roof angle", `${fmt(d.angleDeg, 2)}° (${fmt(d.slopePct, 1)}% slope)`],
              ["Plumb cut / seat cut on a framing square", `${pitch} on the blade, 12 on the tongue`],
            ]}
            limits="Rafter size, species, grade or allowed span — those come from the span tables in your building code and the loads where you build. Lengths are theoretical line lengths along the rafter's measuring line before the birdsmouth and plumb cuts; cut one pattern rafter and test it before cutting the rest."
            method={
              <p>
                Method: run × √(12² + rise²) ÷ 12, with the tail&rsquo;s run added and half the ridge thickness taken off the run. Source: Ira S. Griffith,{" "}
                <a className="underline" href={GRIFFITH_RAFTER_URL}>
                  Carpentry §17, To Find the Length of a Common Rafter
                </a>{" "}
                (public domain); reproduces his 25 ft span, quarter-pitch example of 13.98 ft. Retrieved {RAFTER_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
