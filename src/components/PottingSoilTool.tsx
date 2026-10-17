"use client";

import { useState } from "react";
import { pottingSoil, type PotShape } from "@/lib/potting-soil";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

interface P {
  shape: PotShape;
  a: string;
  b: string;
  h: string;
  n: string;
}

export default function PottingSoilTool() {
  const [pots, setPots] = useState<P[]>([{ shape: "round", a: "12", b: "9", h: "11", n: "4" }]);
  const [head, setHead] = useState("1");
  const [bag, setBag] = useState("16");
  const [bagUnit, setBagUnit] = useState<"qt" | "cuft" | "l">("qt");
  const set = <K extends keyof P>(i: number, k: K, v: P[K]) => setPots((x) => x.map((y, j) => (j === i ? { ...y, [k]: v } : y)));
  const btn = "rounded-md border border-[var(--color-line)] px-3 py-1.5 text-sm";

  const result = attempt(() =>
    pottingSoil({ pots: pots.map((p) => ({ shape: p.shape, a: num(p.a), b: num(p.b), heightIn: num(p.h), count: num(p.n) })), headspaceIn: num(head), bagSize: num(bag), bagUnit }),
  );

  return (
    <div>
      {pots.map((p, i) => (
        <div key={i} className="mb-3 rounded-md border border-[var(--color-line)] p-3">
          <Grid cols={4}>
            <SelectField label={`Container ${i + 1}`} value={p.shape} onChange={(v) => set(i, "shape", v)} options={[["round", "Round pot"], ["square", "Square pot"], ["rect", "Planter / raised bed"]]} />
            <NumField label={p.shape === "rect" ? "Length (in)" : p.shape === "round" ? "Top diameter (in)" : "Top side (in)"} value={p.a} onChange={(v) => set(i, "a", v)} />
            <NumField label={p.shape === "rect" ? "Width (in)" : p.shape === "round" ? "Bottom diameter (in)" : "Bottom side (in)"} value={p.b} onChange={(v) => set(i, "b", v)} />
            <NumField label="Height (in)" value={p.h} onChange={(v) => set(i, "h", v)} />
          </Grid>
          <Grid cols={4}>
            <NumField label="How many" value={p.n} onChange={(v) => set(i, "n", v)} step="1" />
          </Grid>
        </div>
      ))}
      <div className="mb-4 flex gap-2">
        <button type="button" className={btn} onClick={() => setPots((x) => [...x, { shape: "round", a: "10", b: "8", h: "9", n: "1" }])}>
          Add a container
        </button>
        {pots.length > 1 && (
          <button type="button" className={btn} onClick={() => setPots((x) => x.slice(0, -1))}>
            Remove last
          </button>
        )}
      </div>
      <Grid cols={3}>
        <NumField label="Headspace below the rim (in)" value={head} onChange={setHead} />
        <NumField label="Bag size" value={bag} onChange={setBag} />
        <SelectField label="Bag unit" value={bagUnit} onChange={setBagUnit} options={[["qt", "dry quarts"], ["cuft", "cubic feet"], ["l", "litres"]]} />
      </Grid>
      <Hint>Measure inside the pot. For straight-sided pots, enter the same top and bottom size. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Potting mix needed"
            headline={`${d.bags} bag${d.bags === 1 ? "" : "s"} of ${bag} ${bagUnit === "qt" ? "qt" : bagUnit === "cuft" ? "cu ft" : "L"}`}
            sub={`${fmt(d.dryQuarts, 1)} dry quarts · ${fmt(d.cuFt, 2)} cu ft · ${fmt(d.liters, 1)} litres`}
            rows={d.perPotIn3.map((v, k) => [`Container ${k + 1} (× ${pots[k].n})`, `${fmt(v / 67.200625, 1)} dry qt`] as const)}
            limits="How much the mix settles after watering, or how loosely it was packed in the bag. Fluffy mixes compress, so you may want a little extra; the page adds nothing on its own. 'Gallon' nursery pot sizes are trade names, not true volumes — measure the pot."
            method={<p>Method: round pots as a cone frustum π·h/3·(R² + Rr + r²), square pots as a square frustum, planters L × W × H, filled to the headspace; US dry quart = 67.200625 in³ (NIST Handbook 44). Plain arithmetic in your browser.</p>}
          />
        )}
      />
    </div>
  );
}
