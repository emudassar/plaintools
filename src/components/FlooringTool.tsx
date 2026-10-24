"use client";

import { useState } from "react";
import { Grid, Hint, NumField, ResultCard, Output, SelectField, attempt, money, num, optNum, fmt } from "./CalcBits";
import { flooring } from "@/lib/home-calc";

export default function FlooringTool() {
  const [mode, setMode] = useState<"room" | "area">("room");
  const [len, setLen] = useState("15");
  const [wid, setWid] = useState("12");
  const [area, setArea] = useState("180");
  const [waste, setWaste] = useState("10");
  const [box, setBox] = useState("20");
  const [pl, setPl] = useState("");
  const [pw, setPw] = useState("");
  const [price, setPrice] = useState("");

  const sqft = mode === "room" ? num(len) * num(wid) : num(area);
  const result = attempt(() => flooring(sqft, num(waste), num(box), optNum(pl), optNum(pw), optNum(price)));

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Measure by" value={mode} onChange={setMode} options={[["room", "Room length × width"], ["area", "Total area (several rooms)"]]} />
        {mode === "room" ? (
          <>
            <NumField label="Length (ft)" value={len} onChange={setLen} />
            <NumField label="Width (ft)" value={wid} onChange={setWid} />
          </>
        ) : (
          <NumField label="Total floor area (sq ft)" value={area} onChange={setArea} />
        )}
      </Grid>
      <Grid cols={3}>
        <NumField label="Waste allowance (%)" value={waste} onChange={setWaste} />
        <NumField label="Sq ft per box" value={box} onChange={setBox} hint="Printed on the carton." />
        <NumField label="Price per sq ft, $ (optional)" value={price} onChange={setPrice} />
      </Grid>
      <Grid cols={2}>
        <NumField label="Plank length, in (optional)" value={pl} onChange={setPl} />
        <NumField label="Plank width, in (optional)" value={pw} onChange={setPw} />
      </Grid>
      <Hint>Works for laminate, vinyl plank, engineered and solid wood sold by the box. For tile, use the tile calculator, which allows for the grout joint.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`${fmt(d.area, 1)} sq ft with ${waste}% allowance`}
            headline={`${d.boxes} box${d.boxes === 1 ? "" : "es"} (${fmt(d.purchased, 1)} sq ft)`}
            sub={`${fmt(d.withWaste, 1)} sq ft needed${d.planks !== null ? ` · about ${d.planks.toLocaleString("en-US")} planks` : ""}${d.cost !== null ? ` · ${money(d.cost)}` : ""} · ${fmt(d.leftover, 1)} sq ft spare`}
            limits="Diagonal and herringbone layouts, many doorways, closets and stairs all use more than a straight lay. Underlayment, transitions, trim and stair nosing are separate purchases. The waste allowance is your own figure; manufacturers' installation guides sometimes state one for their product."
            method={<p>Method: area × (1 + allowance) ÷ sq ft per box, rounded up = boxes; planks = area with allowance ÷ (length × width ÷ 144). Plain arithmetic in your browser.</p>}
          />
        )}
      />
    </div>
  );
}
