"use client";

import { useState } from "react";
import { displacement, boreFor, DISPLACEMENT_URL, DISP_RETRIEVED } from "@/lib/engine-displacement";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

export default function EngineDisplacementTool() {
  const [unit, setUnit] = useState<"in" | "mm">("in");
  const [bore, setBore] = useState("4.00");
  const [stroke, setStroke] = useState("3.48");
  const [cyl, setCyl] = useState("8");
  const [target, setTarget] = useState("");

  const switchUnit = (u: "in" | "mm") => {
    setUnit(u);
    if (u === "mm") {
      setBore("86");
      setStroke("86");
      setCyl("4");
    } else {
      setBore("4.00");
      setStroke("3.48");
      setCyl("8");
    }
  };

  const result = attempt(() => displacement({ bore: num(bore), stroke: num(stroke), unit, cylinders: num(cyl) }));
  const bf = attempt(() => (target.trim() ? boreFor(num(target), num(stroke), unit, num(cyl)) : null));

  return (
    <div>
      <Grid cols={4}>
        <SelectField label="Units" value={unit} onChange={switchUnit} options={[["in", "Inches"], ["mm", "Millimetres"]]} />
        <NumField label={`Bore (${unit})`} value={bore} onChange={setBore} />
        <NumField label={`Stroke (${unit})`} value={stroke} onChange={setStroke} />
        <NumField label="Cylinders" value={cyl} onChange={setCyl} step="1" />
      </Grid>
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Engine displacement"
            headline={`${fmt(d.cubicInches, 1)} cubic inches · ${fmt(d.liters, 2)} L`}
            sub={`${Math.round(d.cc).toLocaleString("en-US")} cc · ${Math.round(d.perCylinderCc).toLocaleString("en-US")} cc per cylinder · bore/stroke ${fmt(d.boreStrokeRatio, 3)}`}
            rows={[
              ["Per cylinder", `${fmt(d.perCylinderCc, 1)} cc (${fmt(d.perCylinderCc / 16.387064, 2)} ci)`],
              ["Total", `${fmt(d.cc, 1)} cc = ${fmt(d.cubicInches, 2)} ci = ${fmt(d.liters, 3)} L`],
              ["Bore-to-stroke ratio", `${fmt(d.boreStrokeRatio, 3)} (${d.boreStrokeRatio > 1.0001 ? "oversquare" : d.boreStrokeRatio < 0.9999 ? "undersquare" : "square"})`],
            ]}
            limits="Whether an overbore is safe for your block, or what a build will make in power. Marketing displacement figures are often rounded, so a '5.7 L' engine computes to 5.73. Measure the actual bore after machining for a rebuilt engine."
            method={
              <p>
                Method: displacement = stroke × π × (bore ÷ 2)² × cylinders —{" "}
                <a className="underline" href={DISPLACEMENT_URL}>
                  Engine displacement (Wikipedia)
                </a>
                ; 1 in³ = 16.387064 cm³ exactly. Retrieved {DISP_RETRIEVED}.
              </p>
            }
          />
        )}
      />
      <h3 className="mt-8 mb-3 text-lg font-semibold">Bore needed for a target displacement</h3>
      <Grid cols={2}>
        <NumField label="Target displacement (cc)" value={target} onChange={setTarget} hint="Uses the stroke and cylinders above." />
      </Grid>
      {target.trim() && (
        <Output
          result={bf}
          render={(b) =>
            b !== null && (
              <ResultCard
                label="Bore"
                headline={`${fmt(b, unit === "in" ? 4 : 2)} ${unit}`}
                sub={`for ${target} cc with a ${stroke} ${unit} stroke and ${cyl} cylinders`}
                method={<p>Method: bore = 2 × √(cc ÷ cylinders ÷ (π × stroke)).</p>}
              />
            )
          }
        />
      )}
    </div>
  );
}
