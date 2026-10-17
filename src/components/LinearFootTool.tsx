"use client";

import { useState } from "react";
import { sqftToLinear, piecesToLinear, linearToSqft } from "@/lib/linear-foot";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, optNum, fmt, money } from "./CalcBits";

type Mode = "sqft" | "pieces" | "reverse";

export default function LinearFootTool() {
  const [mode, setMode] = useState<Mode>("sqft");
  const [sqft, setSqft] = useState("200");
  const [width, setWidth] = useState("5.5");
  const [waste, setWaste] = useState("10");
  const [stock, setStock] = useState("8");
  const [price, setPrice] = useState("");
  const [rows, setRows] = useState([{ count: "10", feet: "8", inches: "0" }]);
  const [lf, setLf] = useState("400");

  const setRow = (i: number, k: "count" | "feet" | "inches", v: string) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const method = <p>Method: square feet × 12 ÷ coverage width in inches = linear feet; pieces × length = linear feet. Plain arithmetic in your browser.</p>;

  return (
    <div>
      <Grid cols={2}>
        <SelectField
          label="What do you want to work out?"
          value={mode}
          onChange={setMode}
          options={[
            ["sqft", "Square feet → linear feet of boards"],
            ["pieces", "Pieces of a length → total linear feet"],
            ["reverse", "Linear feet → square feet covered"],
          ]}
        />
        {mode !== "pieces" && <NumField label="Board coverage width (in)" value={width} onChange={setWidth} hint="The face each board covers once installed, e.g. 5.5 for a 1×6, less for tongue and groove." />}
      </Grid>

      {mode === "sqft" && (
        <>
          <Grid cols={4}>
            <NumField label="Area (ft²)" value={sqft} onChange={setSqft} />
            <NumField label="Waste allowance (%)" value={waste} onChange={setWaste} />
            <NumField label="Stock length (ft, optional)" value={stock} onChange={setStock} />
            <NumField label="Price per linear ft (optional)" value={price} onChange={setPrice} />
          </Grid>
          <Hint>The result updates as you type.</Hint>
          <Output
            result={attempt(() => sqftToLinear({ sqft: num(sqft), widthIn: num(width), wastePct: num(waste), stockFt: optNum(stock), pricePerLf: optNum(price) }))}
            render={(d) => (
              <ResultCard
                label="Linear feet of boards"
                headline={`${fmt(d.withWaste, 1)} linear ft with your allowance`}
                sub={`${fmt(d.linearFt, 1)} ft before allowance${d.pieces !== null ? ` · ${d.pieces} pieces of ${stock} ft` : ""}${d.cost !== null ? ` · about ${money(d.cost)}` : ""}`}
                limits="Board widths vary by mill and profile; measure the exposed face of the actual board. The piece count assumes offcuts are used; it does not plan cuts or end joints."
                method={method}
              />
            )}
          />
        </>
      )}

      {mode === "pieces" && (
        <>
          {rows.map((r, i) => (
            <Grid cols={3} key={i}>
              <NumField label={`Row ${i + 1}: number of pieces`} value={r.count} onChange={(v) => setRow(i, "count", v)} step="1" />
              <NumField label="Length each (ft)" value={r.feet} onChange={(v) => setRow(i, "feet", v)} />
              <NumField label="+ inches" value={r.inches} onChange={(v) => setRow(i, "inches", v)} />
            </Grid>
          ))}
          <div className="mb-3 flex gap-2">
            <button type="button" className="rounded-md border border-[var(--color-line)] px-3 py-1.5 text-sm" onClick={() => setRows((r) => [...r, { count: "1", feet: "8", inches: "0" }])}>
              Add a row
            </button>
            {rows.length > 1 && (
              <button type="button" className="rounded-md border border-[var(--color-line)] px-3 py-1.5 text-sm" onClick={() => setRows((r) => r.slice(0, -1))}>
                Remove last row
              </button>
            )}
          </div>
          <Grid cols={2}>
            <NumField label="Price per linear ft (optional)" value={price} onChange={setPrice} />
          </Grid>
          <Output
            result={attempt(() => piecesToLinear(rows.map((r) => ({ count: num(r.count), feet: num(r.feet), inches: num(r.inches) })), optNum(price)))}
            render={(d) => (
              <ResultCard
                label="Total length"
                headline={`${fmt(d.linearFt, 2)} linear ft`}
                sub={`${fmt(d.meters, 2)} m · ${fmt(d.yards, 2)} yd${d.cost !== null ? ` · about ${money(d.cost)}` : ""}`}
                method={method}
              />
            )}
          />
        </>
      )}

      {mode === "reverse" && (
        <>
          <Grid cols={2}>
            <NumField label="Linear feet" value={lf} onChange={setLf} />
          </Grid>
          <Output
            result={attempt(() => linearToSqft(num(lf), num(width)))}
            render={(d) => <ResultCard label="Area covered" headline={`${fmt(d.sqft, 1)} ft²`} sub={`${fmt(d.sqft * 0.09290304, 2)} m²`} method={method} />}
          />
        </>
      )}
    </div>
  );
}
