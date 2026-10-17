"use client";

import { useState } from "react";
import { pondVolume, PSU_POND_URL, POND_RETRIEVED, type PondShape } from "@/lib/pond-volume";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

export default function PondVolumeTool() {
  const [shape, setShape] = useState<PondShape>("rect");
  const [unit, setUnit] = useState<"ft" | "m">("ft");
  const [a, setA] = useState("20");
  const [b, setB] = useState("12");
  const [c, setC] = useState("14");
  const [depthMode, setDepthMode] = useState<"average" | "max">("average");
  const [depth, setDepth] = useState("2.5");

  const result = attempt(() => pondVolume({ shape, unit, a: num(a), b: num(b), c: num(c), depthMode, depth: num(depth) }));
  const aLabel = { rect: "Length", circle: "Diameter", shoreline: "Shoreline distance (all the way round)", oval: "Length", trapezoid: "First long side" }[shape];

  return (
    <div>
      <Grid cols={3}>
        <SelectField
          label="Pond shape"
          value={shape}
          onChange={setShape}
          options={[
            ["rect", "Rectangle / irregular (average length × width)"],
            ["oval", "Oval"],
            ["circle", "Circle (diameter)"],
            ["shoreline", "Round, measured by shoreline"],
            ["trapezoid", "Trapezoid (two unequal sides)"],
          ]}
        />
        <SelectField label="Units" value={unit} onChange={setUnit} options={[["ft", "Feet"], ["m", "Metres"]]} />
        <SelectField label="Depth you know" value={depthMode} onChange={setDepthMode} options={[["average", "Average depth"], ["max", "Maximum depth (bowl-shaped)"]]} />
      </Grid>
      <Grid cols={4}>
        <NumField label={`${aLabel} (${unit})`} value={a} onChange={setA} />
        {(shape === "rect" || shape === "oval" || shape === "trapezoid") && <NumField label={`Width (${unit})`} value={b} onChange={setB} />}
        {shape === "trapezoid" && <NumField label={`Second side (${unit})`} value={c} onChange={setC} />}
        <NumField label={`${depthMode === "max" ? "Maximum" : "Average"} depth (${unit})`} value={depth} onChange={setDepth} />
      </Grid>
      <Hint>For an irregular pond, measure several lengths and widths and enter the averages. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Pond volume"
            headline={`${Math.round(d.gallons).toLocaleString("en-US")} US gallons`}
            sub={`${fmt(d.cuFt, 0)} ft³ · ${Math.round(d.liters).toLocaleString("en-US")} litres · ${fmt(d.acreFeet, 4)} acre-feet`}
            rows={[
              ["Surface area", `${fmt(d.areaSqFt, 1)} ft² (${fmt(d.acres, 4)} acres)`],
              ["Average depth used", `${fmt(d.avgDepthFt, 2)} ft${depthMode === "max" ? " (0.4 × maximum)" : ""}`],
              ["Volume", `${fmt(d.cuFt, 1)} ft³ = ${fmt(d.cuM, 2)} m³`],
              ["Gallons (7.4805 gal per ft³)", Math.round(d.gallons).toLocaleString("en-US")],
              ["Gallons via 325,851 gal per acre-foot", Math.round(d.gallonsViaAcreFt).toLocaleString("en-US")],
            ]}
            limits="The true shape of your pond's bottom. Volume rests on the average depth, and the 0.4 × maximum rule is Penn State's estimate for a typical bowl-shaped pond — steep-sided or flat-bottomed ponds differ. For dosing a treatment, take depth readings across the pond and follow the product label."
            method={
              <p>
                Method: surface area × average depth; acre-feet = acres × average depth. Source: Penn State Extension,{" "}
                <a className="underline" href={PSU_POND_URL}>
                  Pond Measurements: Area, Volume, and Residence Time
                </a>{" "}
                (updated May 19, 2025). Retrieved {POND_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
