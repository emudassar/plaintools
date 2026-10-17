"use client";

import { useState } from "react";
import { wallpaperRolls, DUNLOP_URL, WALLPAPER_RETRIEVED } from "@/lib/wallpaper";
import { NumField, SelectField, TextField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

export default function WallpaperTool() {
  const [unit, setUnit] = useState<"m" | "ft">("ft");
  const [walls, setWalls] = useState("12, 10, 12, 10");
  const [height, setHeight] = useState("8");
  const [rw, setRw] = useState("20.5");
  const [rl, setRl] = useState("33");
  const [repeat, setRepeat] = useState("21");
  const [trim, setTrim] = useState("4");
  const [allow, setAllow] = useState("10");

  const switchUnit = (u: "m" | "ft") => {
    setUnit(u);
    if (u === "m") {
      setWalls("3.5, 3, 3.5, 3");
      setHeight("2.5");
      setRw("52");
      setRl("10");
      setRepeat("52");
      setTrim("30");
    } else {
      setWalls("12, 10, 12, 10");
      setHeight("8");
      setRw("20.5");
      setRl("33");
      setRepeat("21");
      setTrim("4");
    }
  };
  const small = unit === "m" ? "cm" : "in";

  const result = attempt(() =>
    wallpaperRolls({ walls: walls.split(/[,\s]+/).filter(Boolean).map(Number), height: num(height), unit, rollWidth: num(rw), rollLength: num(rl), repeat: num(repeat), trim: num(trim), allowancePct: num(allow) }),
  );

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Units" value={unit} onChange={switchUnit} options={[["ft", "Feet and inches"], ["m", "Metres and centimetres"]]} />
        <TextField label={`Wall widths (${unit}), separated by commas`} value={walls} onChange={setWalls} hint="Measure each wall corner to corner; include doors and windows." />
        <NumField label={`Height to paper (${unit})`} value={height} onChange={setHeight} />
      </Grid>
      <Grid cols={4}>
        <NumField label={`Roll width (${small})`} value={rw} onChange={setRw} />
        <NumField label={`Roll length (${unit})`} value={rl} onChange={setRl} />
        <NumField label={`Pattern repeat (${small}, 0 = random match)`} value={repeat} onChange={setRepeat} />
        <NumField label={`Trim allowance, top + bottom (${small})`} value={trim} onChange={setTrim} />
      </Grid>
      <Grid cols={2}>
        <NumField label="Extra allowance (%)" value={allow} onChange={setAllow} hint="James Dunlop: 10% for repeats up to 26 cm (about 10 in), 15–20% above that." />
      </Grid>
      <Hint>Roll size and repeat are on the label. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Wallpaper rolls"
            headline={`${d.rolls} rolls`}
            sub={`${d.drops} drops needed · ${d.dropsPerRoll} full drops per roll · ${d.rollsNoAllowance} rolls before your ${allow}% allowance`}
            rows={[
              ["Drops per wall", d.dropsPerWall.join(" + ")],
              ["Length of each drop (height + trim + repeat)", `${fmt(d.dropLength, 1)} ${small}`],
              ["Full drops from one roll", String(d.dropsPerRoll)],
              ["Rolls (exact)", fmt(d.rollsExact, 2)],
            ]}
            limits="How the pattern will fall on your walls, or whether rolls come from the same batch. Buy all rolls with the same batch number. Pattern match type (straight or drop) and very uneven walls can use more paper; ask the maker for a figure on unusual rooms."
            method={
              <p>
                Method: drops = wall width ÷ roll width (part-widths count as full); drop length = height + trim + repeat; drops per roll = whole drops in
                one roll; rolls = drops ÷ drops per roll, plus allowance. Source: James Dunlop Textiles,{" "}
                <a className="underline" href={DUNLOP_URL}>
                  How to calculate wallpaper requirements
                </a>
                ; reproduces its example (3.5 m wall → 7 drops, 3 per 10 m roll). Retrieved {WALLPAPER_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
