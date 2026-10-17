"use client";

import { useState } from "react";
import { threePhase, KUPHALDT_YD_URL, KUPHALDT_PF_URL, PHASE_RETRIEVED } from "@/lib/three-phase";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, optNum, fmt } from "./CalcBits";

export default function ThreePhaseTool() {
  const [phases, setPhases] = useState<"3" | "1">("3");
  const [volts, setVolts] = useState("480");
  const [pf, setPf] = useState("0.85");
  const [solve, setSolve] = useState<"power" | "current">("power");
  const [amps, setAmps] = useState("30");
  const [kw, setKw] = useState("20");
  const [eff, setEff] = useState("");

  const result = attempt(() => threePhase({ phases: phases === "3" ? 3 : 1, volts: num(volts), pf: num(pf), solveFor: solve, amps: num(amps), kw: num(kw), efficiencyPct: optNum(eff) }));

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="System" value={phases} onChange={setPhases} options={[["3", "Three-phase (balanced)"], ["1", "Single-phase"]]} />
        <NumField label={phases === "3" ? "Line-to-line voltage (V)" : "Voltage (V)"} value={volts} onChange={setVolts} />
        <NumField label="Power factor (0–1)" value={pf} onChange={setPf} hint="1 for heaters; from the nameplate for motors." />
      </Grid>
      <Grid cols={3}>
        <SelectField label="I know the" value={solve} onChange={setSolve} options={[["power", "Current → find power"], ["current", "Power → find current"]]} />
        {solve === "power" ? <NumField label="Line current (A)" value={amps} onChange={setAmps} /> : <NumField label="Real power (kW)" value={kw} onChange={setKw} />}
        <NumField label="Motor efficiency % (optional, for hp out)" value={eff} onChange={setEff} />
      </Grid>
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={solve === "power" ? "Power" : "Line current"}
            headline={solve === "power" ? `${fmt(d.kw, 2)} kW · ${fmt(d.kva, 2)} kVA` : `${fmt(d.amps, 2)} A per line`}
            sub={`${fmt(d.kvar, 2)} kVAR reactive · ${fmt(d.amps, 2)} A at ${volts} V, PF ${pf}${d.hpOut !== null ? ` · about ${fmt(d.hpOut, 2)} hp output` : ""}`}
            rows={[
              ["Apparent power", `${fmt(d.kva, 3)} kVA = ${phases === "3" ? "√3 × " : ""}V × I ÷ 1000`],
              ["Real power", `${fmt(d.kw, 3)} kW = kVA × PF`],
              ["Reactive power", `${fmt(d.kvar, 3)} kVAR`],
              ...(d.phaseVoltsY !== null ? ([["Phase voltage in a Y (line ÷ √3)", `${fmt(d.phaseVoltsY, 1)} V`]] as const) : []),
            ]}
            limits="Unbalanced loads, harmonics, or what size wire, breaker or transformer the load needs — those come from the electrical code and equipment data. Motor nameplate current already includes efficiency and power factor at full load; partial loads differ."
            method={
              <p>
                Method: S = √3 × V(line) × I(line) for balanced three-phase (V × I single-phase); P = S × PF. Y and delta relations from Kuphaldt,{" "}
                <a className="underline" href={KUPHALDT_YD_URL}>
                  Lessons In Electric Circuits, Vol. II ch. 10
                </a>
                ; power factor from{" "}
                <a className="underline" href={KUPHALDT_PF_URL}>
                  ch. 11
                </a>
                . 1 hp = 745.7 W. Retrieved {PHASE_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
