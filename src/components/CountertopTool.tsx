"use client";

import { useState } from "react";
import { countertopArea } from "@/lib/countertop";
import { NumField, Grid, Hint, ResultCard, Output, attempt, num, optNum, fmt, money } from "./CalcBits";

export default function CountertopTool() {
  const [runs, setRuns] = useState([
    { l: "120", d: "25.5", bs: true },
    { l: "72", d: "25.5", bs: true },
    { l: "60", d: "36", bs: false },
  ]);
  const [bs, setBs] = useState("4");
  const [cut, setCut] = useState([{ w: "33", d: "22" }]);
  const [price, setPrice] = useState("");
  const setRun = (i: number, k: "l" | "d", v: string) => setRuns((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const setCutV = (i: number, k: "w" | "d", v: string) => setCut((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const result = attempt(() =>
    countertopArea({
      runs: runs.map((r) => ({ lengthIn: num(r.l), depthIn: num(r.d), backsplash: r.bs })),
      backsplashIn: num(bs),
      cutouts: cut.map((c) => ({ w: num(c.w), d: num(c.d) })),
      pricePerSqFt: optNum(price),
    }),
  );
  const btn = "rounded-md border border-[var(--color-line)] px-3 py-1.5 text-sm";

  return (
    <div>
      <p className="mb-2 font-medium">Countertop sections — split an L or U into rectangles so corners are counted once</p>
      {runs.map((r, i) => (
        <Grid cols={3} key={i}>
          <NumField label={`Section ${i + 1} length (in)`} value={r.l} onChange={(v) => setRun(i, "l", v)} />
          <NumField label="Depth (in)" value={r.d} onChange={(v) => setRun(i, "d", v)} />
          <label className="mt-7 flex items-center gap-2">
            <input type="checkbox" checked={r.bs} onChange={(e) => setRuns((x) => x.map((y, j) => (j === i ? { ...y, bs: e.target.checked } : y)))} />
            Backsplash along this section
          </label>
        </Grid>
      ))}
      <div className="mb-4 flex gap-2">
        <button type="button" className={btn} onClick={() => setRuns((r) => [...r, { l: "48", d: "25.5", bs: true }])}>
          Add a section
        </button>
        {runs.length > 1 && (
          <button type="button" className={btn} onClick={() => setRuns((r) => r.slice(0, -1))}>
            Remove last
          </button>
        )}
      </div>
      <Grid cols={2}>
        <NumField label="Backsplash height (in, 0 = none)" value={bs} onChange={setBs} />
        <NumField label="Price per ft² (optional)" value={price} onChange={setPrice} />
      </Grid>
      <p className="mb-2 font-medium">Cut-outs to subtract for a net area (sink, cooktop)</p>
      {cut.map((c, i) => (
        <Grid cols={2} key={i}>
          <NumField label={`Cut-out ${i + 1} width (in)`} value={c.w} onChange={(v) => setCutV(i, "w", v)} />
          <NumField label="Depth (in)" value={c.d} onChange={(v) => setCutV(i, "d", v)} />
        </Grid>
      ))}
      <div className="mb-4 flex gap-2">
        <button type="button" className={btn} onClick={() => setCut((r) => [...r, { w: "30", d: "21" }])}>
          Add a cut-out
        </button>
        {cut.length > 0 && (
          <button type="button" className={btn} onClick={() => setCut((r) => r.slice(0, -1))}>
            Remove last
          </button>
        )}
      </div>
      <Hint>Measure to the finished edge, including any overhang. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Countertop area"
            headline={`${fmt(d.grossSqFt, 2)} ft²`}
            sub={`${fmt(d.counterSqFt, 2)} ft² counters + ${fmt(d.backsplashSqFt, 2)} ft² backsplash · ${fmt(d.netSqFt, 2)} ft² net of cut-outs${d.cost !== null ? ` · about ${money(d.cost)}` : ""}`}
            rows={[
              ...d.runSqFt.map((s, k) => [`Section ${k + 1}`, `${fmt(s, 2)} ft²`] as const),
              ["Backsplash", `${fmt(d.backsplashSqFt, 2)} ft²`],
              ["Cut-outs", `− ${fmt(d.cutoutSqFt, 2)} ft²`],
              ["Gross (priced area)", `${fmt(d.grossSqFt, 2)} ft² (${fmt(d.grossSqFt * 0.09290304, 2)} m²)`],
            ]}
            limits="How many slabs your job needs. Fabricators lay pieces out on real slab sizes and seams, so the slab area you pay for can be more than the counter area. Pricing rules for cut-outs, edges and backsplash differ by shop."
            method={<p>Method: Σ length × depth ÷ 144, plus backsplash length × height ÷ 144; cost uses the gross area. Plain arithmetic in your browser.</p>}
          />
        )}
      />
    </div>
  );
}
