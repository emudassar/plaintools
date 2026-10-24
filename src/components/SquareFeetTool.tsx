"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, SelectField, attempt, money, optNum, fmt, fieldClass } from "./CalcBits";
import { Ext } from "./GeoBits";
import { Btn } from "./ToolBits";
import { NIST_HB44_URL, squareFeet, type AreaPart, type AreaShape } from "@/lib/home-calc";

type Unit = "ft" | "in" | "yd" | "m" | "cm";
const SHAPES: readonly (readonly [AreaShape, string])[] = [
  ["rectangle", "Rectangle / square"],
  ["l-shape", "L-shape"],
  ["circle", "Circle"],
  ["triangle", "Triangle"],
  ["trapezoid", "Trapezoid"],
];
const FIELDS: Record<AreaShape, string[]> = {
  rectangle: ["Length", "Width"],
  "l-shape": ["Overall length", "Overall width", "Cut-out length", "Cut-out width"],
  circle: ["Diameter"],
  triangle: ["Base", "Height"],
  trapezoid: ["Side a", "Side b", "Height"],
};

interface Row {
  shape: AreaShape;
  v: string[];
}

export default function SquareFeetTool() {
  const [unit, setUnit] = useState<Unit>("ft");
  const [rows, setRows] = useState<Row[]>([{ shape: "rectangle", v: ["12", "15", "", ""] }]);
  const [price, setPrice] = useState("");

  const upd = (i: number, r: Partial<Row>) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, ...r } : x)));
  const n = (s: string) => (s.trim() === "" ? NaN : Number(s));
  const parts: AreaPart[] = rows.map((r) => ({ shape: r.shape, a: n(r.v[0]), b: n(r.v[1]), c: n(r.v[2]), d: n(r.v[3]) }));
  const result = attempt(() => squareFeet(parts, unit, optNum(price)));

  return (
    <div>
      <Grid cols={2}>
        <SelectField label="Measurements in" value={unit} onChange={setUnit} options={[["ft", "Feet"], ["in", "Inches"], ["yd", "Yards"], ["m", "Metres"], ["cm", "Centimetres"]]} />
        <NumField label="Price per sq ft, $ (optional)" value={price} onChange={setPrice} />
      </Grid>
      {rows.map((r, i) => (
        <div key={i} className="mb-3 rounded-md border border-[var(--color-line)] p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-medium">Area {i + 1}</span>
            <select className={fieldClass + " max-w-xs"} value={r.shape} onChange={(e) => upd(i, { shape: e.target.value as AreaShape })} aria-label={`Area ${i + 1} shape`}>
              {SHAPES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            {rows.length > 1 && <Btn onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>Remove</Btn>}
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {FIELDS[r.shape].map((label, k) => (
              <NumField key={label} label={`${label} (${unit})`} value={r.v[k]} onChange={(v) => upd(i, { v: r.v.map((x, j) => (j === k ? v : x)) })} />
            ))}
          </div>
        </div>
      ))}
      <div className="mb-3">
        <Btn onClick={() => setRows((rs) => [...rs, { shape: "rectangle", v: ["", "", "", ""] }])}>+ Add another area</Btn>
      </div>
      <Hint>Split an irregular room into simple shapes and add each one. The total updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Total area"
            headline={`${fmt(d.sqFt, 2)} square feet`}
            sub={`${fmt(d.sqM, 2)} m² · ${fmt(d.sqYd, 2)} sq yd · ${fmt(d.acres, 4)} acres${d.cost !== null ? ` · ${money(d.cost)}` : ""}`}
            limits="The area of the shapes you entered, flat and measured horizontally. Real estate square footage follows its own measuring standards (which spaces count, wall thickness, ceiling height), which this page does not apply."
            method={
              <p>
                Formulas: rectangle l × w; circle π × (d ÷ 2)²; triangle b × h ÷ 2; trapezoid (a + b) ÷ 2 × h; L-shape outer rectangle − cut-out. 1 ft = 0.3048 m exactly; 1 acre = 43,560 sq ft (
                <Ext href={NIST_HB44_URL}>NIST Handbook 44</Ext>).
              </p>
            }
          >
            {d.parts.length > 1 && <DataTable head={["Area", "Square feet"]} rows={d.parts.map((p, i) => [`Area ${i + 1} (${rows[i].shape})`, fmt(p, 2)])} />}
          </ResultCard>
        )}
      />
    </div>
  );
}
