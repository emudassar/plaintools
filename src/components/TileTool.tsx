"use client";

import { useState } from "react";
import { tileCount, type TileUnits } from "@/lib/tile";
import { NumField, SelectField, TextField, Grid, Hint, ResultCard, Output, attempt, num, optNum, fmt, money } from "./CalcBits";

export default function TileTool() {
  const [units, setUnits] = useState<TileUnits>("imperial");
  const [areas, setAreas] = useState("120");
  const [tl, setTl] = useState("12");
  const [tw, setTw] = useState("24");
  const [joint, setJoint] = useState("0.125");
  const [waste, setWaste] = useState("10");
  const [perBox, setPerBox] = useState("");
  const [price, setPrice] = useState("");
  const imp = units === "imperial";
  const areaU = imp ? "ft²" : "m²";

  const switchUnits = (u: TileUnits) => {
    setUnits(u);
    if (u === "metric") {
      setAreas("11");
      setTl("300");
      setTw("600");
      setJoint("3");
    } else {
      setAreas("120");
      setTl("12");
      setTw("24");
      setJoint("0.125");
    }
  };

  const result = attempt(() =>
    tileCount({
      units,
      areas: areas.split(/[,\s]+/).filter(Boolean).map(Number),
      tileL: num(tl),
      tileW: num(tw),
      joint: num(joint),
      wastePct: num(waste),
      tilesPerBox: optNum(perBox),
      price: optNum(price),
    }),
  );

  return (
    <div>
      <Grid cols={2}>
        <SelectField label="Units" value={units} onChange={switchUnits} options={[["imperial", "Feet and inches"], ["metric", "Metres and millimetres"]]} />
        <TextField label={`Area to tile (${areaU}) — separate several areas with commas`} value={areas} onChange={setAreas} hint="Room length × width. For a wall, subtract windows and doors first." />
      </Grid>
      <Grid cols={4}>
        <NumField label={`Tile length (${imp ? "in" : "mm"})`} value={tl} onChange={setTl} />
        <NumField label={`Tile width (${imp ? "in" : "mm"})`} value={tw} onChange={setTw} />
        <NumField label={`Grout joint (${imp ? "in" : "mm"})`} value={joint} onChange={setJoint} />
        <NumField label="Waste allowance (%)" value={waste} onChange={setWaste} />
      </Grid>
      <Grid cols={2}>
        <NumField label="Tiles per box (optional)" value={perBox} onChange={setPerBox} step="1" />
        <NumField label={perBox ? "Price per box, USD (optional)" : "Price per tile, USD (optional)"} value={price} onChange={setPrice} />
      </Grid>
      <Hint>The result updates as you type. Use the actual tile size printed on the box, not the nominal size.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Tiles to buy"
            headline={
              <>
                {d.tiles.toLocaleString("en-US")} tiles{d.boxes !== null ? ` · ${d.boxes} boxes` : ""}
              </>
            }
            sub={
              <>
                {fmt(d.area, 2)} {areaU} ÷ {fmt(d.areaPerTile, 4)} {areaU} per tile = {fmt(d.netTiles, 1)} tiles before your {waste}% allowance
                {d.cost !== null ? ` · about ${money(d.cost)}` : ""}
              </>
            }
            rows={[
              ["Total area", `${fmt(d.area, 2)} ${areaU}`],
              ["Area each tile covers, with one joint", `${fmt(d.areaPerTile, 4)} ${areaU}`],
              ["Share of the surface that is grout joint", `${fmt(d.groutShare * 100, 1)}%`],
              ["Tiles with no allowance", fmt(d.netTiles, 1)],
              ["Tiles with allowance (rounded up)", d.tiles.toLocaleString("en-US")],
              ...(d.boxes !== null ? ([["Boxes (rounded up)", String(d.boxes)]] as const) : []),
            ]}
            limits="How the tiles will cut. The count assumes cut pieces are used elsewhere; a layout with many small cuts, a diagonal or herringbone pattern, or large-format tiles that leave unusable offcuts can need more than your allowance covers. It does not check the substrate, the trowel size or how much thinset and grout to buy."
            method={
              <p>
                Method: area ÷ ((tile length + joint) × (tile width + joint)), × (1 + allowance), rounded up; boxes = tiles ÷ tiles per box, rounded up.
                Plain arithmetic in your browser; no external data.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
