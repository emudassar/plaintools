"use client";

import { useState } from "react";
import { cylinderForce, pressureFor, OPENSTAX_PRESSURE_URL, HYD_RETRIEVED } from "@/lib/hydraulic-cylinder";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

export default function HydraulicCylinderTool() {
  const [unit, setUnit] = useState<"in" | "mm">("in");
  const [bore, setBore] = useState("3");
  const [rod, setRod] = useState("1.5");
  const [p, setP] = useState("2500");
  const [pUnit, setPUnit] = useState<"psi" | "bar">("psi");
  const [n, setN] = useState("1");
  const [need, setNeed] = useState("");

  const result = attempt(() => cylinderForce({ bore: num(bore), rod: num(rod), unit, pressure: num(p), pressureUnit: pUnit, cylinders: num(n) }));
  const boreIn = unit === "in" ? num(bore) : num(bore) / 25.4;
  const reqd = attempt(() => (need.trim() ? pressureFor(num(need), boreIn, num(n)) : null));

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Diameters in" value={unit} onChange={setUnit} options={[["in", "Inches"], ["mm", "Millimetres"]]} />
        <NumField label={`Bore diameter (${unit})`} value={bore} onChange={setBore} />
        <NumField label={`Rod diameter (${unit})`} value={rod} onChange={setRod} />
      </Grid>
      <Grid cols={3}>
        <NumField label="Working pressure" value={p} onChange={setP} />
        <SelectField label="Pressure unit" value={pUnit} onChange={setPUnit} options={[["psi", "psi"], ["bar", "bar"]]} />
        <NumField label="Cylinders working together" value={n} onChange={setN} step="1" />
      </Grid>
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Theoretical force"
            headline={`Push ${Math.round(d.pushLbf).toLocaleString("en-US")} lbf · pull ${Math.round(d.pullLbf).toLocaleString("en-US")} lbf`}
            sub={`${fmt(d.pushTons, 2)} / ${fmt(d.pullTons, 2)} short tons · ${fmt(d.pushN / 1000, 1)} / ${fmt(d.pullN / 1000, 1)} kN · ${fmt(d.pushTonnes, 2)} / ${fmt(d.pullTonnes, 2)} tonnes-force`}
            rows={[
              ["Piston area (push)", `${fmt(d.boreAreaIn2, 3)} in² (${fmt(d.boreAreaIn2 * 645.16, 0)} mm²)`],
              ["Annulus area (pull, piston minus rod)", `${fmt(d.annulusAreaIn2, 3)} in² (${fmt(d.annulusAreaIn2 * 645.16, 0)} mm²)`],
            ]}
            limits="Real output after friction, seal drag and pressure losses, which is lower; whether the cylinder, rod, pins or mounting are rated for this force; or buckling of a long rod in compression. Never exceed the cylinder's rated pressure."
            method={
              <p>
                Method: force = pressure × area (pressure is force per unit area —{" "}
                <a className="underline" href={OPENSTAX_PRESSURE_URL}>
                  OpenStax College Physics 2e §11.3
                </a>
                ); push uses the bore area, pull the bore minus the rod. 1 bar = 14.5038 psi; 1 lbf = 4.44822 N. Retrieved {HYD_RETRIEVED}.
              </p>
            }
          />
        )}
      />
      <h3 className="mt-8 mb-3 text-lg font-semibold">Pressure needed for a push force</h3>
      <Grid cols={2}>
        <NumField label="Force needed (lbf)" value={need} onChange={setNeed} hint="Uses the bore and number of cylinders above." />
      </Grid>
      {need.trim() && (
        <Output
          result={reqd}
          render={(r) => r !== null && <ResultCard label="Pressure" headline={`${Math.round(r).toLocaleString("en-US")} psi (${fmt(r / 14.5037738, 1)} bar)`} method={<p>Method: pressure = force ÷ (piston area × cylinders).</p>} />}
        />
      )}
    </div>
  );
}
