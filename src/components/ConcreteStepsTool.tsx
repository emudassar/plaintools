"use client";

import { useState } from "react";
import { concreteSteps } from "@/lib/concrete-steps";
import { QUIKRETE_1101_URL, CONCRETE_RETRIEVED } from "@/lib/concrete-bags";
import { NumField, Grid, Hint, ResultCard, Output, DataTable, attempt, num, fmt } from "./CalcBits";

export default function ConcreteStepsTool() {
  const [steps, setSteps] = useState("3");
  const [rise, setRise] = useState("7");
  const [run, setRun] = useState("11");
  const [width, setWidth] = useState("48");
  const [plat, setPlat] = useState("36");
  const [waste, setWaste] = useState("10");

  const result = attempt(() => concreteSteps({ steps: num(steps), riseIn: num(rise), runIn: num(run), widthIn: num(width), platformIn: num(plat), wastePct: num(waste) }));

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Number of steps (risers)" value={steps} onChange={setSteps} step="1" />
        <NumField label="Rise per step (in)" value={rise} onChange={setRise} />
        <NumField label="Tread run per step (in)" value={run} onChange={setRun} />
      </Grid>
      <Grid cols={3}>
        <NumField label="Step width (in)" value={width} onChange={setWidth} />
        <NumField label="Top platform depth (in, 0 = none)" value={plat} onChange={setPlat} />
        <NumField label="Extra allowance (%)" value={waste} onChange={setWaste} />
      </Grid>
      <Hint>Solid steps on grade, filled with concrete all the way down. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Concrete for the steps"
            headline={`${fmt(d.cuYd, 2)} cubic yards · ${d.bags.find((b) => b.lb === 80)!.bags} bags of 80 lb`}
            sub={`${fmt(d.cuFt, 2)} ft³ (${fmt(d.cuM, 3)} m³) with your ${waste}% allowance · total rise ${fmt(d.totalRiseIn, 1)} in, total run ${fmt(d.totalRunIn, 1)} in`}
            rows={[["Side profile area", `${fmt(d.profileSqFt, 2)} ft²`]]}
            limits="Whether the step dimensions meet your building code (riser height and tread depth limits, handrails), or footing and reinforcement needs. Steps formed over gravel fill or with a sloped underside use less concrete than this solid-fill figure."
            method={
              <p>
                Method: profile = rise × run × n(n+1) ÷ 2 + platform × n × rise; × width = volume; bags = volume ÷ yield, rounded up. Yields from the{" "}
                <a className="underline" href={QUIKRETE_1101_URL}>
                  QUIKRETE Concrete Mix (1101) data sheet
                </a>
                . Retrieved {CONCRETE_RETRIEVED}.
              </p>
            }
          >
            <DataTable head={["Bag size", "Yield per bag", "Bags"]} rows={d.bags.map((b) => [`${b.lb} lb`, `${b.yieldCuFt} ft³`, String(b.bags)])} highlight={3} />
          </ResultCard>
        )}
      />
    </div>
  );
}
