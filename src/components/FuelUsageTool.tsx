"use client";

import { useState } from "react";
import { applianceUsage, oilByNozzle, byHeatLoad, BTU_PER_GAL, EIA_BTU_URL, FUEL_RETRIEVED } from "@/lib/fuel-use";
import { NumField, SelectField, TextField, Grid, Hint, ResultCard, Output, DataTable, attempt, num, optNum, fmt, money } from "./CalcBits";

type Fuel = "propane" | "oil";
type Mode = "appliances" | "nozzle" | "load";

const START: Record<Fuel, { name: string; btu: string; hours: string }[]> = {
  propane: [
    { name: "Furnace", btu: "80000", hours: "6" },
    { name: "Water heater", btu: "40000", hours: "1.5" },
    { name: "Range", btu: "65000", hours: "0.5" },
  ],
  oil: [{ name: "Boiler", btu: "119000", hours: "6" }],
};

export default function FuelUsageTool({ fuel }: { fuel: Fuel }) {
  const [mode, setMode] = useState<Mode>(fuel === "oil" ? "nozzle" : "appliances");
  const [rows, setRows] = useState(START[fuel]);
  const [gph, setGph] = useState("0.85");
  const [burnHours, setBurnHours] = useState("6");
  const [load, setLoad] = useState("500000");
  const [eff, setEff] = useState(fuel === "oil" ? "84" : "95");
  const [tank, setTank] = useState(fuel === "oil" ? "250" : "400");
  const [price, setPrice] = useState("");
  const btuPerGal = BTU_PER_GAL[fuel];
  const set = (i: number, k: "name" | "btu" | "hours", v: string) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const result = attempt(() => {
    if (mode === "nozzle") return oilByNozzle(num(gph), num(burnHours), optNum(tank), optNum(price));
    if (mode === "load") return byHeatLoad(num(load), num(eff), btuPerGal, optNum(tank), optNum(price));
    return applianceUsage(rows.map((r) => ({ name: r.name, btuPerHour: num(r.btu), hoursPerDay: num(r.hours) })), btuPerGal, optNum(tank), optNum(price));
  });
  const btn = "rounded-md border border-[var(--color-line)] px-3 py-1.5 text-sm";
  const fuelName = fuel === "oil" ? "heating oil" : "propane";

  const modes: [Mode, string][] =
    fuel === "oil"
      ? [
          ["nozzle", "Burner nozzle size (GPH) × run time"],
          ["appliances", "Appliance Btu/h ratings × run time"],
          ["load", "Heat needed per day ÷ efficiency"],
        ]
      : [
          ["appliances", "Appliance Btu/h ratings × run time"],
          ["load", "Heat needed per day ÷ efficiency"],
        ];

  return (
    <div>
      <Grid cols={2}>
        <SelectField label="Work it out from" value={mode} onChange={setMode} options={modes} />
      </Grid>
      {mode === "appliances" && (
        <>
          {rows.map((r, i) => (
            <Grid cols={3} key={i}>
              <TextField label={`Appliance ${i + 1}`} value={r.name} onChange={(v) => set(i, "name", v)} />
              <NumField label="Input rating (Btu/h)" value={r.btu} onChange={(v) => set(i, "btu", v)} hint={i === 0 ? "From the rating plate." : undefined} />
              <NumField label="Hours running per day" value={r.hours} onChange={(v) => set(i, "hours", v)} />
            </Grid>
          ))}
          <div className="mb-4 flex gap-2">
            <button type="button" className={btn} onClick={() => setRows((r) => [...r, { name: "", btu: "30000", hours: "1" }])}>
              Add an appliance
            </button>
            {rows.length > 1 && (
              <button type="button" className={btn} onClick={() => setRows((r) => r.slice(0, -1))}>
                Remove last
              </button>
            )}
          </div>
        </>
      )}
      {mode === "nozzle" && (
        <Grid cols={2}>
          <NumField label="Nozzle firing rate (gallons per hour)" value={gph} onChange={setGph} hint="Stamped on the burner nozzle, e.g. 0.75, 0.85, 1.00." />
          <NumField label="Burner run time (hours per day)" value={burnHours} onChange={setBurnHours} />
        </Grid>
      )}
      {mode === "load" && (
        <Grid cols={2}>
          <NumField label="Heat needed (Btu per day)" value={load} onChange={setLoad} />
          <NumField label="Appliance efficiency (%)" value={eff} onChange={setEff} hint="AFUE or rated efficiency." />
        </Grid>
      )}
      <Grid cols={2}>
        <NumField label={`${fuel === "oil" ? "Oil" : "Propane"} in the tank (gallons, optional)`} value={tank} onChange={setTank} hint="The usable gallons you have now, not the tank's size." />
        <NumField label="Price per gallon (optional)" value={price} onChange={setPrice} />
      </Grid>
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`${fuelName} use`}
            headline={`${fmt(d.galPerDay, 2)} gallons per day`}
            sub={`${fmt(d.galPerMonth, 1)} gallons per 30 days${d.daysOfFuel !== null ? ` · ${fmt(d.daysOfFuel, 1)} days from ${tank} gallons` : ""}${d.costPerDay !== null ? ` · ${money(d.costPerDay)} a day, ${money(d.costPerMonth!)} a month` : ""}`}
            rows={[
              ["Fuel burned per day", `${Math.round(d.btuPerDay).toLocaleString("en-US")} Btu`],
              [`Heat content of ${fuelName}`, `${btuPerGal.toLocaleString("en-US")} Btu per gallon (EIA)`],
            ]}
            limits="How long your appliances actually run. Run time swings with the weather, thermostat settings and household use; a heating appliance can run several times longer on a cold day than a mild one. Tank gauges read in percent of the tank's size, and not all of that is usable."
            method={
              <p>
                Method: gallons = Btu burned ÷ Btu per gallon; for a nozzle, gallons = firing rate × burner hours. Heat content: U.S. Energy Information
                Administration,{" "}
                <a className="underline" href={EIA_BTU_URL}>
                  British thermal units (Btu)
                </a>{" "}
                — propane 91,452 Btu per gallon, heating oil 138,500. Retrieved {FUEL_RETRIEVED}.
              </p>
            }
          >
            {d.rows.length > 1 && <DataTable head={["Appliance", "Btu per day", "Gallons per day"]} rows={d.rows.map((r) => [r.name || "—", Math.round(r.btuPerDay).toLocaleString("en-US"), fmt(r.galPerDay, 2)])} />}
          </ResultCard>
        )}
      />
    </div>
  );
}
