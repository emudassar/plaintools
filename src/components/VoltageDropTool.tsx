"use client";

import { useState } from "react";
import { dcVoltageDrop, AWG_SIZES, NBS100_URL, VDROP_RETRIEVED, type Awg } from "@/lib/voltage-drop";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

const gaugeOpts = AWG_SIZES.map((g) => [g, `${g} AWG`] as const) as [Awg, string][];

export default function VoltageDropTool() {
  const [volts, setVolts] = useState("12");
  const [amps, setAmps] = useState("15");
  const [len, setLen] = useState("25");
  const [unit, setUnit] = useState<"ft" | "m">("ft");
  const [gauge, setGauge] = useState<Awg>("10");
  const [temp, setTemp] = useState("20");
  const [maxPct, setMaxPct] = useState("3");

  const result = attempt(() => dcVoltageDrop({ volts: num(volts), amps: num(amps), length: num(len), lengthUnit: unit, gauge, tempC: num(temp), maxPct: num(maxPct) }));

  return (
    <div>
      <Grid cols={4}>
        <NumField label="Supply voltage (V DC)" value={volts} onChange={setVolts} />
        <NumField label="Current (A)" value={amps} onChange={setAmps} />
        <NumField label="One-way length" value={len} onChange={setLen} hint="Source to load; the return wire is added." />
        <SelectField label="Length unit" value={unit} onChange={setUnit} options={[["ft", "Feet"], ["m", "Metres"]]} />
      </Grid>
      <Grid cols={3}>
        <SelectField label="Copper wire size" value={gauge} onChange={setGauge} options={gaugeOpts} />
        <NumField label="Conductor temperature (°C)" value={temp} onChange={setTemp} min="-40" hint="20 °C = the Handbook's reference; warm wire resists more." />
        <NumField label="Maximum drop you'll accept (%)" value={maxPct} onChange={setMaxPct} />
      </Grid>
      <Hint>For DC circuits such as 12 V and 24 V vehicle, marine, solar and LED wiring. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Voltage drop"
            headline={`${fmt(d.dropV, 3)} V (${fmt(d.dropPct, 2)}%)`}
            sub={`${fmt(d.loadV, 2)} V at the load · ${fmt(d.powerLossW, 1)} W lost in the wire · thinnest size within ${maxPct}%: ${d.smallestOk ? `${d.smallestOk} AWG (${fmt(d.smallestOkDropPct!, 2)}%)` : "none up to 4/0"}`}
            rows={[
              [`${gauge} AWG copper resistance`, `${fmt(d.ohmsPer1000, 4)} Ω per 1,000 ft at ${temp} °C`],
              ["Wire diameter", `${fmt(d.diameterIn, 4)} in (${fmt(d.areaMm2, 2)} mm² cross-section)`],
              ["Round-trip resistance", `${fmt(d.loopOhms, 5)} Ω`],
              ["Drop", `${fmt(d.dropV, 3)} V = ${fmt(d.dropPct, 2)}% of ${volts} V`],
            ]}
            limits="Whether the wire is allowed to carry that current. Ampacity — how much current a wire may carry without overheating — depends on insulation, bundling and where it runs, and comes from the electrical code or the cable maker, not from voltage drop. Stranded and tinned wire and real temperatures differ slightly from the solid annealed copper figures used here."
            method={
              <p>
                Method: drop = current × (resistance per foot × 2 × one-way length). Copper resistance from the annealed copper standard, 10.371 Ω·cmil/ft
                at 20 °C, temperature coefficient 0.00393/°C, and the AWG definition (No. 0000 = 0.4600 in, No. 36 = 0.0050 in) in{" "}
                <a className="underline" href={NBS100_URL}>
                  NBS Handbook 100, Copper Wire Tables
                </a>
                ; matches its table (No. 10 = 0.9988 Ω per 1,000 ft at 20 °C). Retrieved {VDROP_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
