"use client";

import { useState } from "react";
import { pondLiner, APS_URL, LINER_RETRIEVED } from "@/lib/pond-liner";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, optNum, fmt, money } from "./CalcBits";

export default function PondLinerTool() {
  const [unit, setUnit] = useState<"ft" | "m">("ft");
  const [l, setL] = useState("10");
  const [w, setW] = useState("8");
  const [d, setD] = useState("3");
  const [o, setO] = useState("2");
  const [price, setPrice] = useState("");

  const switchUnit = (u: "ft" | "m") => {
    setUnit(u);
    if (u === "m") {
      setL("3");
      setW("2.5");
      setD("0.9");
      setO("0.6");
    } else {
      setL("10");
      setW("8");
      setD("3");
      setO("2");
    }
  };
  const result = attempt(() => pondLiner({ length: num(l), width: num(w), maxDepth: num(d), overlap: num(o), unit, pricePerArea: optNum(price) }));
  const a = unit === "ft" ? "ft²" : "m²";

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Units" value={unit} onChange={switchUnit} options={[["ft", "Feet"], ["m", "Metres"]]} />
        <NumField label={`Pond length (${unit})`} value={l} onChange={setL} hint="Longest point." />
        <NumField label={`Pond width (${unit})`} value={w} onChange={setW} hint="Widest point." />
      </Grid>
      <Grid cols={3}>
        <NumField label={`Maximum depth (${unit})`} value={d} onChange={setD} />
        <NumField label={`Edge overlap each side (${unit})`} value={o} onChange={setO} hint="All Pond Solutions uses 2 ft (0.6 m)." />
        <NumField label={`Price per ${a} (optional)`} value={price} onChange={setPrice} />
      </Grid>
      <Hint>Measure the hole as dug, at its longest, widest and deepest points. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(r) => (
          <ResultCard
            label="Liner size"
            headline={`${fmt(r.linerLength, 2)} × ${fmt(r.linerWidth, 2)} ${unit}`}
            sub={`${fmt(r.area, 1)} ${a} of liner (and the same of underlay)${r.cost !== null ? ` · about ${money(r.cost)}` : ""}`}
            rows={[
              ["Length", `${l} + 2 × ${d} + 2 × ${o} = ${fmt(r.linerLength, 2)} ${unit}`],
              ["Width", `${w} + 2 × ${d} + 2 × ${o} = ${fmt(r.linerWidth, 2)} ${unit}`],
            ]}
            limits="Which liner material or thickness to use, or how a liner folds into corners and shelves. Liners come in stock sizes — round up to the next size you can buy. Very irregular ponds may need more."
            method={
              <p>
                Method: overlap + depth + length + depth + overlap (and the same for width), as given by All Pond Solutions,{" "}
                <a className="underline" href={APS_URL}>
                  Calculating the size of your pond liner
                </a>
                ; using the maximum depth on both sides covers sloped sides and shelves. Retrieved {LINER_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
