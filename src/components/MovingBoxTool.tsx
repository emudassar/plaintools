"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, attempt, money, num, optNum, fmt, fieldClass } from "./CalcBits";
import { movingBoxes } from "@/lib/home-calc";

interface Line {
  label: string;
  dims: string;
  count: string;
  price: string;
}

const START: Line[] = [
  { label: "Small", dims: "16 x 12 x 12", count: "20", price: "" },
  { label: "Medium", dims: "18 x 18 x 16", count: "15", price: "" },
  { label: "Large", dims: "18 x 18 x 24", count: "8", price: "" },
  { label: "Extra-large", dims: "24 x 18 x 24", count: "0", price: "" },
  { label: "Wardrobe", dims: "24 x 20 x 34", count: "0", price: "" },
];

/** "18 x 18 x 16" (inches) -> cubic feet. */
const cuFt = (dims: string) => {
  const n = dims.split(/[x×*]/i).map((s) => Number(s.trim()));
  return n.length === 3 && n.every((v) => v > 0) ? (n[0] * n[1] * n[2]) / 1728 : NaN;
};

export default function MovingBoxTool() {
  const [lines, setLines] = useState<Line[]>(START);
  const [tape, setTape] = useState("10");
  const [roll, setRoll] = useState("165");
  const upd = (i: number, k: keyof Line, v: string) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, [k]: v } : l)));
  const result = attempt(() => movingBoxes(lines.map((l) => ({ label: l.label, cuFt: cuFt(l.dims), count: num(l.count), price: optNum(l.price) })), num(tape), num(roll)));

  return (
    <div>
      <div className="mb-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="py-1 pr-2 font-medium">Box</th>
              <th className="py-1 pr-2 font-medium">Size, inches (L x W x H)</th>
              <th className="py-1 pr-2 font-medium">How many</th>
              <th className="py-1 font-medium">$ each (optional)</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={l.label}>
                <td className="py-1 pr-2">{l.label}</td>
                <td className="py-1 pr-2">
                  <input className={fieldClass} value={l.dims} onChange={(e) => upd(i, "dims", e.target.value)} aria-label={`${l.label} box size`} />
                </td>
                <td className="py-1 pr-2">
                  <input className={fieldClass} type="number" min="0" step="1" value={l.count} onChange={(e) => upd(i, "count", e.target.value)} aria-label={`${l.label} box count`} />
                </td>
                <td className="py-1">
                  <input className={fieldClass} type="number" min="0" step="any" value={l.price} onChange={(e) => upd(i, "price", e.target.value)} aria-label={`${l.label} box price`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Grid cols={2}>
        <NumField label="Tape per box (ft)" value={tape} onChange={setTape} hint="Your own estimate: top, bottom and edges." />
        <NumField label="Tape roll length (ft)" value={roll} onChange={setRoll} hint="Printed on the roll (55 yd = 165 ft)." />
      </Grid>
      <Hint>The box sizes are starting values; change them to match the boxes you buy. Count your boxes room by room and enter the totals.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Your boxes"
            headline={`${d.totalBoxes.toLocaleString("en-US")} boxes · ${fmt(d.totalCuFt, 0)} cubic feet`}
            sub={`${d.tapeRolls} roll${d.tapeRolls === 1 ? "" : "s"} of tape (${fmt(d.tapeFt, 0)} ft)${d.cost !== null ? ` · boxes ${money(d.cost)}` : ""}`}
            limits="Box volume only. Furniture, appliances and loose items take truck space too, and boxes never pack a truck with no gaps. Compare the total with the cargo volume a rental company publishes for each truck size, and leave room to spare."
            method={<p>Method: each box&apos;s L × W × H in inches ÷ 1,728 = cubic feet, × count, summed. Tape = feet per box × boxes ÷ roll length, rounded up. Plain arithmetic in your browser.</p>}
          >
            <DataTable
              head={["Box", "Count", "Each", "Total"]}
              rows={lines.filter((l) => num(l.count) > 0).map((l) => [l.label, l.count, `${fmt(cuFt(l.dims), 2)} cu ft`, `${fmt(cuFt(l.dims) * num(l.count), 1)} cu ft`])}
            />
          </ResultCard>
        )}
      />
    </div>
  );
}
