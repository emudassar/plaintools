"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, SelectField, attempt, num, fmt } from "./CalcBits";
import { Ext } from "./GeoBits";
import { GAS_MARKS, GAS_MARK_URL, KITCHEN_RETRIEVED, fToC, ovenTemp } from "@/lib/kitchen-calc";

export default function OvenTempTool() {
  const [from, setFrom] = useState<"F" | "C" | "gas">("F");
  const [value, setValue] = useState("350");
  const [gas, setGas] = useState("4");

  const v = from === "gas" ? (gas.includes("/") ? Number(gas.split("/")[0]) / Number(gas.split("/")[1]) : Number(gas)) : num(value);
  const result = attempt(() => ovenTemp(v, from));

  return (
    <div>
      <Grid cols={2}>
        <SelectField label="Convert from" value={from} onChange={setFrom} options={[["F", "Fahrenheit (°F)"], ["C", "Celsius (°C)"], ["gas", "Gas mark"]]} />
        {from === "gas" ? (
          <SelectField label="Gas mark" value={gas} onChange={setGas} options={GAS_MARKS.map(([m]) => [m, `Gas mark ${m}`] as const)} />
        ) : (
          <NumField label={`Temperature (°${from})`} value={value} onChange={setValue} min="-100" />
        )}
      </Grid>
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Oven temperature"
            headline={`${fmt(d.f, 0)} °F = ${fmt(d.c, 0)} °C`}
            sub={Math.abs(d.offF) < 1 ? `Gas mark ${d.gasMark}` : `Nearest gas mark ${d.gasMark} (${d.gasMarkF} °F), ${fmt(Math.abs(d.offF), 0)} °F ${d.offF > 0 ? "lower" : "higher"} than this temperature`}
            limits="Recipes written for a fan (convection) oven or a conventional one are not interchangeable without adjustment; follow the recipe or the oven maker's guidance for that. Oven thermostats can run hot or cold, and an oven thermometer shows the real temperature."
            method={
              <p>
                Method: °C = (°F − 32) × 5 ÷ 9. Gas mark 1 = 275 °F, rising 25 °F per mark; below mark 1 the marks halve (½ = 250 °F, ¼ = 225 °F) (<Ext href={GAS_MARK_URL}>Gas mark</Ext>). Retrieved {KITCHEN_RETRIEVED}.
              </p>
            }
          >
            <DataTable
              head={["Gas mark", "°F", "°C"]}
              rows={GAS_MARKS.map(([m, f]) => [m, f, fmt(fToC(f), 0)])}
              highlight={GAS_MARKS.findIndex(([m]) => m === d.gasMark)}
            />
          </ResultCard>
        )}
      />
    </div>
  );
}
