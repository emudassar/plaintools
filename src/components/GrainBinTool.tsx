"use client";

import { useState } from "react";
import { grainBin, IOWA_GRAIN_URL, GRAIN_RETRIEVED } from "@/lib/grain-bin";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, optNum, fmt } from "./CalcBits";

export default function GrainBinTool() {
  const [dia, setDia] = useState("30");
  const [depth, setDepth] = useState("17");
  const [top, setTop] = useState<"level" | "peak" | "cone">("peak");
  const [topFt, setTopFt] = useState("");
  const [crop, setCrop] = useState<"corn" | "soybeans">("corn");
  const [tw, setTw] = useState("");

  const result = attempt(() => grainBin({ diameterFt: num(dia), depthFt: num(depth), top, topFt: optNum(topFt), crop, testWeight: optNum(tw) }));

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Bin diameter (ft)" value={dia} onChange={setDia} />
        <NumField label="Grain depth at the side wall (ft)" value={depth} onChange={setDepth} />
        <SelectField label="Grain surface" value={top} onChange={setTop} options={[["level", "Level"], ["peak", "Peaked (cone on top)"], ["cone", "Drawn down (cone-shaped hollow)"]]} />
      </Grid>
      <Grid cols={3}>
        {top !== "level" && (
          <NumField label={top === "peak" ? "Peak height above the wall level (ft)" : "Hollow depth below the wall level (ft)"} value={topFt} onChange={setTopFt} hint="Leave blank to use Iowa's rule of thumb." />
        )}
        <SelectField label="Crop (for the rule of thumb)" value={crop} onChange={setCrop} options={[["corn", "Corn — 0.4 × radius"], ["soybeans", "Soybeans — 0.5 × radius"]]} />
        <NumField label="Test weight, lb/bu (optional)" value={tw} onChange={setTw} hint="For an estimated weight." />
      </Grid>
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Grain in the bin"
            headline={`${Math.round(d.bushels).toLocaleString("en-US")} standard bushels`}
            sub={`${fmt(d.bushelsPerFoot, 1)} bushels per foot of depth · ${Math.round(d.cubicFeet).toLocaleString("en-US")} ft³${d.weightTons !== null ? ` · about ${fmt(d.weightTons, 1)} tons at ${tw} lb/bu` : ""}`}
            rows={[
              ["Level portion", `${Math.round(d.levelBushels).toLocaleString("en-US")} bu`],
              ...(top !== "level"
                ? ([
                    [
                      top === "peak" ? "Peak (height ÷ 3 × bushels per foot)" : "Hollow removed (depth ÷ 3 × bushels per foot)",
                      `${top === "peak" ? "+" : "−"}${Math.round(Math.abs(d.topBushels)).toLocaleString("en-US")} bu (${fmt(d.topHeight, 2)} ft${d.usedRuleOfThumb ? ", rule of thumb" : ""})`,
                    ],
                  ] as const)
                : []),
            ]}
            limits="How tightly the grain has packed, its moisture, or its test weight's effect on bushel count. Iowa's guidance notes corn over 54 lb/bu and soybeans over 56 lb/bu give more bushels than standard, and that pack charts (from County Extension) are needed for higher accuracy. Measure depth at several points around a peaked or drawn-down bin."
            method={
              <p>
                Method: D × D × 0.7854 × 0.80385 = bushels per foot; × depth; peak adds (height ÷ 3) × bushels per foot, a drawn-down cone subtracts the same.
                Source: Iowa Department of Agriculture and Land Stewardship, Grain Warehouse Bureau,{" "}
                <a className="underline" href={IOWA_GRAIN_URL}>
                  Guidelines on measuring grain
                </a>
                . Retrieved {GRAIN_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
