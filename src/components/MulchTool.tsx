"use client";

import { useState } from "react";
import { Grid, Hint, NumField, ResultCard, Output, SelectField, attempt, money, num, optNum, fmt } from "./CalcBits";
import { mulch } from "@/lib/home-calc";

export default function MulchTool() {
  const [mode, setMode] = useState<"rect" | "circle" | "area">("rect");
  const [a, setA] = useState("20");
  const [b, setB] = useState("4");
  const [area, setArea] = useState("80");
  const [depth, setDepth] = useState("3");
  const [bag, setBag] = useState("2");
  const [pBag, setPBag] = useState("");
  const [pYd, setPYd] = useState("");

  const sqft = mode === "rect" ? num(a) * num(b) : mode === "circle" ? Math.PI * (num(a) / 2) ** 2 : num(area);
  const result = attempt(() => mulch(sqft, num(depth), num(bag), optNum(pBag), optNum(pYd)));

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Bed shape" value={mode} onChange={setMode} options={[["rect", "Rectangle"], ["circle", "Circle (tree ring)"], ["area", "I know the area"]]} />
        {mode === "area" ? (
          <NumField label="Area (sq ft)" value={area} onChange={setArea} />
        ) : (
          <>
            <NumField label={mode === "rect" ? "Length (ft)" : "Diameter (ft)"} value={a} onChange={setA} />
            {mode === "rect" && <NumField label="Width (ft)" value={b} onChange={setB} />}
          </>
        )}
      </Grid>
      <Grid cols={4}>
        <NumField label="Depth (in)" value={depth} onChange={setDepth} />
        <SelectField label="Bag size" value={bag} onChange={setBag} options={[["2", "2 cu ft"], ["3", "3 cu ft"], ["1.5", "1.5 cu ft"], ["0.5", "0.5 cu ft"]]} />
        <NumField label="$ per bag (optional)" value={pBag} onChange={setPBag} />
        <NumField label="$ per cubic yard (optional)" value={pYd} onChange={setPYd} />
      </Grid>
      <Hint>For several beds, add their areas and use “I know the area”. Subtract the area of shrubs and trees you are mulching around if it is large.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`${fmt(d.areaSqFt, 0)} sq ft at ${depth} in deep`}
            headline={`${fmt(d.cuYd, 2)} cubic yards · ${d.bags.toLocaleString("en-US")} bags of ${bag} cu ft`}
            sub={`${fmt(d.cuFt, 1)} cu ft · ${fmt(d.cuM, 2)} m³ · one cubic yard covers ${fmt(d.sqFtPerYd, 0)} sq ft at this depth`}
            rows={[
              ...(d.bagCost !== null ? ([["Bagged cost", money(d.bagCost)]] as const) : []),
              ...(d.bulkCost !== null ? ([["Bulk cost", money(d.bulkCost)]] as const) : []),
            ]}
            limits="Fresh mulch settles after spreading, and bulk loads are measured loose. The depth is your choice; the page does not recommend one. Bags are sold by the volume printed on them."
            method={<p>Method: area × depth ÷ 12 = cubic feet; ÷ 27 = cubic yards; ÷ bag size, rounded up = bags. Plain arithmetic in your browser.</p>}
          />
        )}
      />
    </div>
  );
}
