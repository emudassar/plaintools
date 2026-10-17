"use client";

import { useState } from "react";
import { boardAndBatten } from "@/lib/board-and-batten";
import { feetInches } from "@/lib/rafter-length";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

export default function BoardAndBattenTool() {
  const [wallW, setWallW] = useState("144");
  const [h, setH] = useState("60");
  const [bw, setBw] = useState("3.5");
  const [mode, setMode] = useState<"count" | "gap">("gap");
  const [count, setCount] = useState("8");
  const [gap, setGap] = useState("16");
  const [rails, setRails] = useState("1");
  const [stock, setStock] = useState("8");
  const [waste, setWaste] = useState("10");

  const result = attempt(() =>
    boardAndBatten({ wallW: num(wallW), battenH: num(h), battenW: num(bw), mode, count: num(count), targetGap: num(gap), rails: num(rails), stockFt: num(stock), wastePct: num(waste) }),
  );
  const inch = (x: number) => feetInches(x / 12).replace(/^0' /, "");

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Wall width (in)" value={wallW} onChange={setWallW} />
        <NumField label="Batten height (in)" value={h} onChange={setH} hint="Floor or baseboard top to the top rail." />
        <NumField label="Batten width (in)" value={bw} onChange={setBw} hint="Actual face width; a 1×4 is 3.5 in." />
      </Grid>
      <Grid cols={3}>
        <SelectField label="Space the battens by" value={mode} onChange={setMode} options={[["gap", "A target gap"], ["count", "A number of battens"]]} />
        {mode === "gap" ? <NumField label="Target gap between battens (in)" value={gap} onChange={setGap} /> : <NumField label="Number of vertical battens" value={count} onChange={setCount} step="1" />}
        <NumField label="Full-width horizontal rails" value={rails} onChange={setRails} step="1" hint="Top rail = 1." />
      </Grid>
      <Grid cols={2}>
        <NumField label="Stock length (ft)" value={stock} onChange={setStock} />
        <NumField label="Waste allowance (%)" value={waste} onChange={setWaste} />
      </Grid>
      <Hint>A batten sits at each end of the wall and every gap is equal. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Batten layout"
            headline={`${d.count} battens, ${inch(d.gap)} gaps`}
            sub={`${inch(d.onCenter)} on centre · ${fmt(d.totalLf, 1)} linear ft · ${d.pieces} pieces of ${stock} ft with allowance`}
            rows={[
              ["Gap between battens", `${fmt(d.gap, 3)} in (${inch(d.gap)})`],
              ["On-centre spacing", `${fmt(d.onCenter, 3)} in`],
              ["Vertical battens", `${d.count} × ${fmt(num(h), 2)} in = ${fmt(d.verticalLf, 1)} ft`],
              ["Horizontal rails", `${fmt(d.railLf, 1)} ft`],
              ["Total with allowance", `${fmt(d.withWaste, 1)} ft`],
            ]}
            limits="Whether the battens land on studs, how outlets and switches fall between them, or how corners and a baseboard meet. Mark the layout on the wall before cutting. A vertical batten taller than one stock piece needs a joint."
            method={<p>Method: gap = (wall width − battens × batten width) ÷ (battens − 1); positions are k × (gap + batten width) from the left end. Plain arithmetic in your browser.</p>}
          >
            {d.needsJoint && <p className="mb-5">Each vertical batten is taller than one {stock} ft piece and will need a joint.</p>}
            <p className="mb-2 font-medium">Left edge of each batten, measured from the left end of the wall</p>
            <p className="mb-5 font-mono text-xs leading-6">{d.positions.map((p, k) => `${k + 1}: ${inch(p)}`).join("   ")}</p>
          </ResultCard>
        )}
      />
    </div>
  );
}
