"use client";

import { useState } from "react";
import { tubeConcrete, QUIKRETE_1101_URL, QUIKTUBE_URL, CONCRETE_RETRIEVED } from "@/lib/concrete-bags";
import { NumField, Grid, Hint, ResultCard, Output, DataTable, attempt, num, fmt } from "./CalcBits";

export default function SonotubeTool() {
  const [dia, setDia] = useState("10");
  const [h, setH] = useState("48");
  const [count, setCount] = useState("6");
  const [waste, setWaste] = useState("10");
  const [fd, setFd] = useState("0");
  const [ft, setFt] = useState("0");

  const result = attempt(() => tubeConcrete({ diameterIn: num(dia), heightIn: num(h), count: num(count), wastePct: num(waste), footingDiaIn: num(fd), footingThickIn: num(ft) }));

  return (
    <div>
      <Grid cols={4}>
        <NumField label="Tube diameter (in)" value={dia} onChange={setDia} />
        <NumField label="Concrete depth in tube (in)" value={h} onChange={setH} />
        <NumField label="Number of tubes" value={count} onChange={setCount} step="1" />
        <NumField label="Extra allowance (%)" value={waste} onChange={setWaste} />
      </Grid>
      <Grid cols={2}>
        <NumField label="Footing below the tube: diameter (in, 0 = none)" value={fd} onChange={setFd} />
        <NumField label="Footing thickness (in)" value={ft} onChange={setFt} />
      </Grid>
      <Hint>Use the inside diameter of the form. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Concrete for your tubes"
            headline={`${fmt(d.totalCuYd, 2)} cubic yards · ${d.bags.find((b) => b.lb === 80)!.bags} bags of 80 lb`}
            sub={`${fmt(d.totalCuFt, 2)} ft³ (${fmt(d.totalCuM, 3)} m³) for ${count} tube${num(count) === 1 ? "" : "s"}, including your ${waste}% allowance`}
            rows={[
              ["One tube", `${fmt(d.perTubeCuFt, 3)} ft³`],
              ...(d.footingCuFt > 0 ? ([["One footing", `${fmt(d.footingCuFt, 3)} ft³`]] as const) : []),
              ["Bags for one tube (with allowance)", d.perTubeBags.map((b) => `${b.bags} × ${b.lb} lb`).join(" · ")],
            ]}
            limits="Whether your piers or footings are the right size and depth — that depends on the load, the soil and the frost depth where you build, and is set by your building code or engineer. Bag counts are for QUIKRETE Concrete Mix yields; other products and high-strength mixes yield differently, so check your bag."
            method={
              <p>
                Method: π × (diameter ÷ 2)² × depth per tube, × tubes, × (1 + allowance); bags = volume ÷ yield, rounded up. Yields from the{" "}
                <a className="underline" href={QUIKRETE_1101_URL}>
                  QUIKRETE Concrete Mix (No. 1101) data sheet
                </a>
                ; this method reproduces every cell of the bag table on the{" "}
                <a className="underline" href={QUIKTUBE_URL}>
                  QUIKRETE QUIK-Tube data sheet
                </a>
                . Retrieved {CONCRETE_RETRIEVED}.
              </p>
            }
          >
            <DataTable head={["Bag size", "Yield per bag", "Bags for all tubes"]} rows={d.bags.map((b) => [`${b.lb} lb`, `${b.yieldCuFt} ft³`, String(b.bags)])} highlight={3} />
          </ResultCard>
        )}
      />
    </div>
  );
}
