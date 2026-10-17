"use client";

import { useState } from "react";
import { gambrelRoof, type GambrelResult } from "@/lib/gambrel-roof";
import { feetInches } from "@/lib/rafter-length";
import { NumField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

function Diagram({ d, span }: { d: GambrelResult; span: number }) {
  const W = 320;
  const s = W / span;
  const H = d.totalRise * s;
  const pad = 10;
  const pts = [
    [0, H],
    [d.lowerRun * s, H - d.lowerRise * s],
    [(span / 2) * s, 0],
    [(span - d.lowerRun) * s, H - d.lowerRise * s],
    [span * s, H],
  ]
    .map(([x, y]) => `${x + pad},${y + pad}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W + 2 * pad} ${H + 2 * pad}`} className="mb-5 w-full max-w-md" role="img" aria-label="Gambrel roof cross-section">
      <polygon points={pts} fill="var(--color-accent-soft)" stroke="currentColor" strokeWidth="2" />
      <line x1={pad} y1={H + pad} x2={W + pad} y2={H + pad} stroke="currentColor" strokeDasharray="4 3" />
    </svg>
  );
}

export default function GambrelRoofTool() {
  const [span, setSpan] = useState("24");
  const [len, setLen] = useState("32");
  const [run, setRun] = useState("4");
  const [p1, setP1] = useState("24");
  const [p2, setP2] = useState("6");
  const [over, setOver] = useState("6");

  const result = attempt(() => gambrelRoof({ spanFt: num(span), lengthFt: num(len), lowerRunFt: num(run), lowerPitch: num(p1), upperPitch: num(p2), overhangIn: num(over) }));

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Building span (ft)" value={span} onChange={setSpan} />
        <NumField label="Building length (ft)" value={len} onChange={setLen} />
        <NumField label="Lower section run, wall to break (ft)" value={run} onChange={setRun} hint="Level distance from the wall to where the slope changes." />
      </Grid>
      <Grid cols={3}>
        <NumField label="Lower pitch (rise per 12)" value={p1} onChange={setP1} />
        <NumField label="Upper pitch (rise per 12)" value={p2} onChange={setP2} />
        <NumField label="Eave overhang, level (in)" value={over} onChange={setOver} />
      </Grid>
      <Hint>Symmetric gambrel: both sides the same. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Gambrel roof"
            headline={`Lower rafter ${feetInches(d.lowerRafter + d.tail)} · upper rafter ${feetInches(d.upperRafter)}`}
            sub={`Ridge ${feetInches(d.totalRise)} above the wall plates · ${fmt(d.roofAreaSqFt, 0)} ft² of roof (${fmt(d.squares, 2)} squares)`}
            rows={[
              ["Lower section: run / rise / angle", `${fmt(d.lowerRun, 2)} ft / ${feetInches(d.lowerRise)} / ${fmt(d.lowerAngle, 1)}°`],
              ["Upper section: run / rise / angle", `${fmt(d.upperRun, 2)} ft / ${feetInches(d.upperRise)} / ${fmt(d.upperAngle, 1)}°`],
              ["Lower rafter (incl. tail)", `${feetInches(d.lowerRafter + d.tail)} (tail ${feetInches(d.tail)})`],
              ["Upper rafter", feetInches(d.upperRafter)],
              ["Width between the breaks", `${fmt(d.widthAtBreak, 2)} ft`],
              ["Gable end wall area (one end, above the plates)", `${fmt(d.gableEndSqFt, 1)} ft²`],
            ]}
            limits="Rafter sizes, gusset plates, collar ties or whether the frame can carry snow and wind. Gambrel framing puts thrust on the walls at the break; members and connections need design under your building code. Lengths are line lengths before cuts and ridge deductions."
            method={<p>Method: each section is a right triangle — rise = run × pitch ÷ 12, rafter = run × √(144 + pitch²) ÷ 12; roof area = 2 × (rafters + tail) × length. Plain geometry in your browser.</p>}
          >
            <Diagram d={d} span={num(span)} />
          </ResultCard>
        )}
      />
    </div>
  );
}
