"use client";

import { useState, type ReactNode } from "react";
import { bulkMaterial, NM_FACTORS, NM_URL, NM_RETRIEVED, NM_SOURCE, type Shape, type LenUnit } from "@/lib/bulk-material";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, optNum, fmt, money } from "./CalcBits";

/**
 * Shared by the material-specific landscape pages (pea gravel, river rock).
 * Each page passes its own defaults and a size note; the factor defaults to the
 * NM/BLM "Gravel ¼–2 in" row and stays editable.
 */
export default function BulkMaterialTool({
  materialName,
  defaultDepth,
  sizeNote,
}: {
  materialName: string;
  defaultDepth: string;
  sizeNote: ReactNode;
}) {
  const [shape, setShape] = useState<Shape>("rect");
  const [unit, setUnit] = useState<LenUnit>("ft");
  const [a, setA] = useState("10");
  const [b, setB] = useState("12");
  const [area, setArea] = useState("");
  const [depth, setDepth] = useState(defaultDepth);
  const [bag, setBag] = useState("0.5");
  const [factor, setFactor] = useState(String(NM_FACTORS["gravel-quarter-2"].tonsPerYd));
  const [waste, setWaste] = useState("0");
  const [ppt, setPpt] = useState("");
  const [ppb, setPpb] = useState("");
  const ft = unit === "ft";

  const result = attempt(() =>
    bulkMaterial({
      shape,
      a: num(a),
      b: num(b),
      lenUnit: unit,
      depth: num(depth),
      areaOverride: optNum(area),
      bagCuFt: num(bag),
      tonsPerYd: num(factor),
      wastePct: num(waste),
      pricePerTon: optNum(ppt),
      pricePerBag: optNum(ppb),
    }),
  );

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Area shape" value={shape} onChange={setShape} options={[["rect", "Rectangle"], ["circle", "Circle"]]} />
        <SelectField label="Units" value={unit} onChange={setUnit} options={[["ft", "Feet, depth in inches"], ["m", "Metres, depth in cm"]]} />
        <NumField label={`Depth (${ft ? "in" : "cm"})`} value={depth} onChange={setDepth} />
      </Grid>
      <Grid cols={3}>
        <NumField label={shape === "rect" ? `Length (${unit})` : `Diameter (${unit})`} value={a} onChange={setA} />
        {shape === "rect" && <NumField label={`Width (${unit})`} value={b} onChange={setB} />}
        <NumField label={`Or total area (${ft ? "ft²" : "m²"}, optional)`} value={area} onChange={setArea} hint="Overrides the shape when filled in." />
      </Grid>
      <Grid cols={4}>
        <NumField label="Bag size (cu ft)" value={bag} onChange={setBag} hint="Printed on the bag; 0.5 is common." />
        <NumField label="Tons per cubic yard" value={factor} onChange={setFactor} hint="1.42 = NM/BLM gravel ¼–2 in. Use your supplier's figure if you have it." />
        <NumField label="Extra allowance (%)" value={waste} onChange={setWaste} />
        <div className="grid grid-cols-2 gap-2">
          <NumField label="$ / ton" value={ppt} onChange={setPpt} />
          <NumField label="$ / bag" value={ppb} onChange={setPpb} />
        </div>
      </Grid>
      <Hint>{sizeNote}</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`${materialName} needed`}
            headline={`${fmt(d.cuYd, 2)} cubic yards · about ${fmt(d.tons, 2)} tons`}
            sub={`${fmt(d.cuFt, 1)} cu ft = ${d.bags.toLocaleString("en-US")} bags of ${bag} cu ft · ${fmt(d.cuM, 2)} m³ · ${fmt(d.tonnes, 2)} tonnes`}
            rows={[
              ["Area covered", `${fmt(d.areaSqFt, 1)} ft² (${fmt(d.areaSqFt * 0.09290304, 2)} m²)`],
              ["Volume", `${fmt(d.cuFt, 1)} ft³ = ${fmt(d.cuYd, 2)} yd³`],
              ["Weight at " + factor + " tons/yd³", `${fmt(d.tons, 2)} short tons (${fmt(d.lbs, 0)} lb)`],
              ["Bags", `${d.bags.toLocaleString("en-US")} × ${bag} cu ft`],
              ...(d.bulkCost !== null ? ([["Bulk cost", money(d.bulkCost)]] as const) : []),
              ...(d.bagCost !== null ? ([["Bagged cost", money(d.bagCost)]] as const) : []),
            ]}
            limits={`The weight of your ${materialName.toLowerCase()}. Tons depend on the stone's density, size and moisture, so a supplier's own tons-per-yard figure beats any table. The volume assumes an even depth over a flat area and does not allow for settling, a base layer or edging.`}
            method={
              <p>
                Method: area × depth = volume; ÷ 27 = cubic yards; × tons per cubic yard = weight; ÷ bag size, rounded up = bags. Default weight
                factor:{" "}
                <a className="underline" href={NM_URL}>
                  {NM_SOURCE}
                </a>
                , &ldquo;Gravel ¼&Prime; – 2&Prime;&rdquo; = 1.42 short tons per cubic yard. Retrieved {NM_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
