"use client";

import { useState } from "react";
import { Grid, Hint, NumField, ResultCard, Output, attempt, money, num, optNum, fmt } from "./CalcBits";
import { Ext } from "./GeoBits";
import { BEHR_URL, HOME_RETRIEVED, paint } from "@/lib/home-calc";

export default function PaintTool() {
  const [len, setLen] = useState("14");
  const [wid, setWid] = useState("12");
  const [ht, setHt] = useState("8");
  const [doors, setDoors] = useState("1");
  const [doorArea, setDoorArea] = useState("21");
  const [windows, setWindows] = useState("2");
  const [winArea, setWinArea] = useState("15");
  const [coats, setCoats] = useState("2");
  const [coverage, setCoverage] = useState("350");
  const [ceiling, setCeiling] = useState(false);
  const [price, setPrice] = useState("");

  const result = attempt(() =>
    paint({
      length: num(len),
      width: num(wid),
      height: num(ht),
      doors: num(doors),
      doorArea: num(doorArea),
      windows: num(windows),
      windowArea: num(winArea),
      coats: num(coats),
      coverage: num(coverage),
      includeCeiling: ceiling,
      pricePerGallon: optNum(price),
    }),
  );

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Room length (ft)" value={len} onChange={setLen} />
        <NumField label="Room width (ft)" value={wid} onChange={setWid} />
        <NumField label="Wall height (ft)" value={ht} onChange={setHt} />
      </Grid>
      <Grid cols={4}>
        <NumField label="Doors" value={doors} onChange={setDoors} step="1" />
        <NumField label="Area per door (sq ft)" value={doorArea} onChange={setDoorArea} hint="3 × 7 ft = 21" />
        <NumField label="Windows" value={windows} onChange={setWindows} step="1" />
        <NumField label="Area per window (sq ft)" value={winArea} onChange={setWinArea} hint="Measure yours: width × height" />
      </Grid>
      <Grid cols={3}>
        <NumField label="Coats" value={coats} onChange={setCoats} step="1" />
        <NumField label="Coverage (sq ft per gallon)" value={coverage} onChange={setCoverage} hint="Printed on the can." />
        <NumField label="Price per gallon, $ (optional)" value={price} onChange={setPrice} />
      </Grid>
      <label className="mb-2 flex items-center gap-2">
        <input type="checkbox" checked={ceiling} onChange={(e) => setCeiling(e.target.checked)} />
        <span>Paint the ceiling too (same paint and coats)</span>
      </label>
      <Hint>The door and window sizes are starting values to replace with your own measurements.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`${coats} coat${num(coats) === 1 ? "" : "s"} at ${coverage} sq ft per gallon`}
            headline={`${fmt(d.gallons, 2)} gallons — buy ${d.buyGallons ? `${d.buyGallons} gallon${d.buyGallons === 1 ? "" : "s"}` : ""}${d.buyGallons && d.buyQuarts ? " + " : ""}${d.buyQuarts ? `${d.buyQuarts} quart${d.buyQuarts === 1 ? "" : "s"}` : ""}`}
            sub={`or ${d.gallonsToBuy} whole gallon${d.gallonsToBuy === 1 ? "" : "s"}${d.cost !== null ? ` (${money(d.cost)})` : ""} · ${fmt(d.gallons * 3.785411784, 1)} litres`}
            rows={[
              ["Wall area", `${fmt(d.wallArea, 0)} sq ft`],
              ["Minus doors and windows", `− ${fmt(d.openings, 0)} sq ft`],
              ...(d.ceilingArea ? ([["Ceiling", `+ ${fmt(d.ceilingArea, 0)} sq ft`]] as const) : []),
              ["Area × coats", `${fmt(d.paintArea, 0)} sq ft`],
            ]}
            limits="Coverage drops on rough, porous or unprimed surfaces and with big colour changes, which may need primer or an extra coat. Trim, doors and ceilings are often painted in a different sheen. Buying the whole amount in one batch avoids small colour differences between cans."
            method={
              <p>
                Method: 2 × (length + width) × height − openings (+ ceiling) = area; × coats ÷ coverage = gallons; rounded up to whole quarts (4 per gallon). Behr lists 250–400 sq ft per gallon for its Premium Plus interior paint,
                &ldquo;depending on the application method and substrate porosity&rdquo; (<Ext href={BEHR_URL}>Behr Pro product page</Ext>). Retrieved {HOME_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
