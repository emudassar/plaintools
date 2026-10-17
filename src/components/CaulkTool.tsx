"use client";

import { useState } from "react";
import { caulk, TREMCO_URL, CAULK_RETRIEVED } from "@/lib/caulk";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, DataTable, attempt, num, fmt } from "./CalcBits";

export default function CaulkTool() {
  const [len, setLen] = useState("120");
  const [shape, setShape] = useState<"rect" | "fillet">("rect");
  const [w, setW] = useState("0.25");
  const [d, setD] = useState("0.25");
  const [waste, setWaste] = useState("15");

  const result = attempt(() => caulk({ lengthFt: num(len), shape, widthIn: num(w), depthIn: num(d), wastePct: num(waste) }));

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Total joint length (ft)" value={len} onChange={setLen} />
        <SelectField label="Bead" value={shape} onChange={setShape} options={[["rect", "Joint with width and depth"], ["fillet", "Corner bead (triangle)"]]} />
        <NumField label="Waste / inefficiency (%)" value={waste} onChange={setWaste} hint="Tremco: 20–25% new, 10–15% average, 0–5% very experienced." />
      </Grid>
      <Grid cols={2}>
        <NumField label={shape === "rect" ? "Joint width (in)" : "Bead leg size (in)"} value={w} onChange={setW} hint="1/4 in = 0.25, 3/8 = 0.375, 1/2 = 0.5." />
        {shape === "rect" && <NumField label="Joint depth to backer rod (in)" value={d} onChange={setD} />}
      </Grid>
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(r) => {
          const c = r.rows.find((x) => x.key === "10.1oz")!;
          return (
            <ResultCard
              label="Sealant needed"
              headline={`${c.units} cartridges of 10.1 fl oz`}
              sub={`${fmt(r.withWaste, 1)} in³ with your ${waste}% allowance · ${fmt(c.ftPerUnit, 1)} ft per cartridge at this joint size`}
              rows={[
                ["Sealant per foot of joint", `${fmt(r.in3PerFt, 3)} in³`],
                ["Total before allowance", `${fmt(r.totalIn3, 1)} in³ (${fmt(r.totalIn3 * 16.387064, 0)} ml)`],
              ]}
              limits="Whether the joint is designed right. Joint width, the width-to-depth ratio, backer rod and the sealant's movement rating are design decisions in the product's data sheet. Containers hold slightly less usable sealant than their label volume once the nozzle and plunger are accounted for."
              method={
                <p>
                  Method: width × depth × 12 in³ per foot (a rectangular joint, later tooled, as Tremco&rsquo;s calculators assume; depth measured to the
                  backer rod), or width² ÷ 2 for a corner bead; containers converted with 1 US gal = 231 in³ = 128 fl oz. Source:{" "}
                  <a className="underline" href={TREMCO_URL}>
                    Tremco, How to Use Sealant Calculators to Estimate Product Needs
                  </a>
                  . Retrieved {CAULK_RETRIEVED}.
                </p>
              }
            >
              <DataTable head={["Container", "Feet per container", "Containers needed"]} rows={r.rows.map((x) => [x.label, fmt(x.ftPerUnit, 1), String(x.units)])} />
            </ResultCard>
          );
        }}
      />
    </div>
  );
}
