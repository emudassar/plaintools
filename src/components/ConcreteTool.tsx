"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, SelectField, attempt, money, num, optNum, fmt } from "./CalcBits";
import { Ext } from "./GeoBits";
import { concrete, type ConcreteShape } from "@/lib/home-calc";
import { CONCRETE_RETRIEVED, QUIKRETE_1101_URL } from "@/lib/concrete-bags";

export default function ConcreteTool() {
  const [shape, setShape] = useState<ConcreteShape>("slab");
  const [len, setLen] = useState("10");
  const [wid, setWid] = useState("10");
  const [thick, setThick] = useState("4");
  const [dia, setDia] = useState("12");
  const [height, setHeight] = useState("4");
  const [qty, setQty] = useState("1");
  const [waste, setWaste] = useState("5");
  const [price, setPrice] = useState("");

  const result = attempt(() =>
    concrete({ shape, length: num(len), width: num(wid), thicknessIn: num(thick), diameterIn: num(dia), heightFt: num(height), quantity: num(qty), wastePct: num(waste), pricePerYd: optNum(price) }),
  );

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Pour" value={shape} onChange={setShape} options={[["slab", "Slab, patio or driveway"], ["footing", "Footing or wall (rectangular)"], ["column", "Round column or post hole"]]} />
        <NumField label="How many" value={qty} onChange={setQty} step="1" />
        <NumField label="Extra allowance (%)" value={waste} onChange={setWaste} />
      </Grid>
      {shape === "column" ? (
        <Grid cols={2}>
          <NumField label="Diameter (in)" value={dia} onChange={setDia} />
          <NumField label="Height or depth (ft)" value={height} onChange={setHeight} />
        </Grid>
      ) : (
        <Grid cols={3}>
          <NumField label="Length (ft)" value={len} onChange={setLen} />
          <NumField label="Width (ft)" value={wid} onChange={setWid} />
          <NumField label={shape === "slab" ? "Thickness (in)" : "Depth (in)"} value={thick} onChange={setThick} />
        </Grid>
      )}
      <Grid cols={2}>
        <NumField label="Ready-mix price per cubic yard, $ (optional)" value={price} onChange={setPrice} />
      </Grid>
      <Hint>The allowance covers spillage, uneven ground and form bulge; the percentage is your own choice.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Concrete needed"
            headline={`${fmt(d.cuYd, 2)} cubic yards (${fmt(d.cuFt, 1)} cu ft)`}
            sub={`${fmt(d.cuM, 2)} m³ · about ${fmt(d.weightLb, 0)} lb placed${d.cost !== null ? ` · ready-mix ${money(d.cost)}` : ""}`}
            limits="Ready-mix plants sell in fixed increments and often have a short-load fee; ask how they round. Bag yields are for QUIKRETE Concrete Mix; other mixes yield differently, so check the bag. Reinforcement, base gravel and forms are not included."
            method={
              <p>
                Method: length × width × thickness (or π × r² × height) × quantity × (1 + allowance); ÷ 27 = cubic yards; ÷ bag yield, rounded up = bags. Bag yields and the 140 lb/ft³ weight are from the{" "}
                <Ext href={QUIKRETE_1101_URL}>QUIKRETE Concrete Mix No. 1101 data sheet</Ext>. Retrieved {CONCRETE_RETRIEVED}.
              </p>
            }
          >
            <DataTable head={["Bag size", "Yield per bag", "Bags needed"]} rows={d.bags.map((b) => [`${b.lb} lb`, `${b.yieldCuFt} cu ft`, b.bags.toLocaleString("en-US")])} highlight={3} />
          </ResultCard>
        )}
      />
    </div>
  );
}
