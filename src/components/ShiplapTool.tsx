"use client";

import { useState } from "react";
import { shiplap } from "@/lib/shiplap";
import { NumField, Grid, Hint, ResultCard, Output, attempt, num, optNum, fmt, money } from "./CalcBits";

export default function ShiplapTool() {
  const [walls, setWalls] = useState([{ w: "12", h: "8" }]);
  const [open, setOpen] = useState("0");
  const [exp, setExp] = useState("5.125");
  const [len, setLen] = useState("8");
  const [waste, setWaste] = useState("10");
  const [price, setPrice] = useState("");
  const set = (i: number, k: "w" | "h", v: string) => setWalls((x) => x.map((y, j) => (j === i ? { ...y, [k]: v } : y)));
  const btn = "rounded-md border border-[var(--color-line)] px-3 py-1.5 text-sm";

  const result = attempt(() =>
    shiplap({ walls: walls.map((x) => ({ widthFt: num(x.w), heightFt: num(x.h) })), openingsSqFt: num(open), exposureIn: num(exp), boardLengthFt: num(len), wastePct: num(waste), pricePerBoard: optNum(price) }),
  );

  return (
    <div>
      {walls.map((x, i) => (
        <Grid cols={2} key={i}>
          <NumField label={`Wall ${i + 1} width (ft)`} value={x.w} onChange={(v) => set(i, "w", v)} />
          <NumField label="Height (ft)" value={x.h} onChange={(v) => set(i, "h", v)} />
        </Grid>
      ))}
      <div className="mb-4 flex gap-2">
        <button type="button" className={btn} onClick={() => setWalls((x) => [...x, { w: "10", h: "8" }])}>
          Add a wall
        </button>
        {walls.length > 1 && (
          <button type="button" className={btn} onClick={() => setWalls((x) => x.slice(0, -1))}>
            Remove last
          </button>
        )}
      </div>
      <Grid cols={4}>
        <NumField label="Exposed face per board (in)" value={exp} onChange={setExp} hint="What shows after the overlap — measure or check the product." />
        <NumField label="Board length (ft)" value={len} onChange={setLen} />
        <NumField label="Openings (ft²)" value={open} onChange={setOpen} />
        <NumField label="Waste allowance (%)" value={waste} onChange={setWaste} />
      </Grid>
      <Grid cols={2}>
        <NumField label="Price per board (optional)" value={price} onChange={setPrice} />
      </Grid>
      <Hint>Boards run horizontally. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Shiplap boards"
            headline={`${d.boardsByCourse} boards of ${len} ft`}
            sub={`${fmt(d.netSqFt, 1)} ft² net · ${d.courses.join(" + ")} courses · ${fmt(d.linearFtByArea, 0)} linear ft by area${d.cost !== null ? ` · about ${money(d.cost)}` : ""}`}
            rows={[
              ["Rows (courses) per wall", d.courses.map((c, k) => `wall ${k + 1}: ${c}`).join(", ")],
              ["Boards counted course by course", `${d.boardsByCourse} (with allowance)`],
              ["Boards by area (offcuts reused)", `${d.boardsByArea} (with allowance)`],
              ["Wall area", `${fmt(d.grossSqFt, 1)} ft² gross, ${fmt(d.netSqFt, 1)} ft² net`],
            ]}
            limits="How joints will be staggered or how offcuts fall. The course count assumes each row starts with fresh boards, which usually overestimates; the area count assumes every offcut is used, which underestimates. Real needs sit between the two. Openings are only subtracted in the area figure."
            method={<p>Method: courses = ceil(height ÷ exposure); boards per course = ceil(width ÷ board length); area count = net area × 12 ÷ exposure ÷ board length. Plain arithmetic in your browser.</p>}
          />
        )}
      />
    </div>
  );
}
