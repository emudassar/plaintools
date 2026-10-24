"use client";

import { useState } from "react";
import { Grid, Hint, NumField, ResultCard, Output, SelectField, attempt, num, fmt } from "./CalcBits";
import { Ext } from "./GeoBits";
import { fence } from "@/lib/home-calc";
import { CONCRETE_RETRIEVED, QUIKRETE_1101_URL } from "@/lib/concrete-bags";

export default function FenceTool() {
  const [len, setLen] = useState("150");
  const [spacing, setSpacing] = useState("8");
  const [gates, setGates] = useState("1");
  const [gateW, setGateW] = useState("4");
  const [rails, setRails] = useState("2");
  const [picketW, setPicketW] = useState("5.5");
  const [gap, setGap] = useState("0.5");
  const [holeD, setHoleD] = useState("10");
  const [holeDepth, setHoleDepth] = useState("24");
  const [post, setPost] = useState("3.5");
  const [bag, setBag] = useState("50");

  const result = attempt(() =>
    fence({
      length: num(len),
      postSpacing: num(spacing),
      gates: num(gates),
      gateWidth: num(gateW),
      rails: num(rails),
      picketWidth: num(picketW),
      picketGap: num(gap),
      holeDiameter: num(holeD),
      holeDepth: num(holeDepth),
      postSide: num(post),
      bagLb: num(bag),
    }),
  );

  return (
    <div>
      <Grid cols={4}>
        <NumField label="Total fence length (ft)" value={len} onChange={setLen} />
        <NumField label="Post spacing (ft)" value={spacing} onChange={setSpacing} hint="Maximum, centre to centre." />
        <NumField label="Gates" value={gates} onChange={setGates} step="1" />
        <NumField label="Gate width (ft)" value={gateW} onChange={setGateW} />
      </Grid>
      <Grid cols={3}>
        <NumField label="Rails per section" value={rails} onChange={setRails} step="1" />
        <NumField label="Picket width (in), 0 = none" value={picketW} onChange={setPicketW} hint="A nominal 1×6 is 5.5 in actual." />
        <NumField label="Gap between pickets (in)" value={gap} onChange={setGap} />
      </Grid>
      <Grid cols={4}>
        <NumField label="Post hole diameter (in)" value={holeD} onChange={setHoleD} />
        <NumField label="Post hole depth (in)" value={holeDepth} onChange={setHoleDepth} />
        <NumField label="Post size (in, actual)" value={post} onChange={setPost} hint="A 4×4 is 3.5 in." />
        <SelectField label="Concrete bag" value={bag} onChange={setBag} options={[["40", "40 lb"], ["50", "50 lb"], ["60", "60 lb"], ["80", "80 lb"]]} />
      </Grid>
      <Hint>Post spacing, hole size and depth are set by your fence design, local code and frost depth; the page uses whatever you enter.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`${fmt(d.fenceLength, 1)} ft of fence${num(gates) ? ` plus ${gates} gate${num(gates) === 1 ? "" : "s"}` : ""}`}
            headline={`${d.posts} posts · ${d.rails} rails${d.pickets ? ` · ${d.pickets.toLocaleString("en-US")} pickets` : ""}`}
            sub={`${d.sections} sections · ${d.concreteBags} bags of ${d.bagLb} lb concrete (${fmt(d.concreteCuFtPerPost, 2)} cu ft per post)`}
            rows={[
              ["Sections", `${d.sections} (no wider than ${spacing} ft)`],
              ["Posts", `${d.posts} (sections + 1, plus 1 per gate)`],
              ["Rails", `${d.rails} (${rails} per section, each about one section long)`],
              ...(d.pickets ? ([["Pickets", d.pickets.toLocaleString("en-US")]] as const) : []),
              ["Concrete", `${d.concreteBags} × ${d.bagLb} lb bags`],
            ]}
            limits="Corners and ends sometimes take heavier posts, and a run broken by gates may need an extra post where sections do not divide evenly. Gate hardware, the gate panels themselves, fasteners and gravel at the base of the hole are not counted. Call 811 before digging in the US."
            method={
              <p>
                Method: (length − gate widths) ÷ spacing, rounded up = sections; posts = sections + 1 + gates; pickets = fence inches ÷ (picket + gap); concrete per post = hole cylinder − post. Bag yields from the{" "}
                <Ext href={QUIKRETE_1101_URL}>QUIKRETE Concrete Mix No. 1101 data sheet</Ext>. Retrieved {CONCRETE_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
