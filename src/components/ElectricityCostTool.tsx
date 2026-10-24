"use client";

import { useState } from "react";
import { Grid, Hint, NumField, ResultCard, Output, SelectField, attempt, money, num, fmt } from "./CalcBits";
import { Ext } from "./GeoBits";
import { EIA_PRICES, EIA_SOURCE, EIA_URL, RETRIEVED, electricityCost } from "@/lib/money-calc";

const STATES = Object.keys(EIA_PRICES).filter((s) => s !== "U.S. Total").sort();

export default function ElectricityCostTool() {
  const [watts, setWatts] = useState("1500");
  const [hours, setHours] = useState("4");
  const [days, setDays] = useState("30");
  const [qty, setQty] = useState("1");
  const [state, setState] = useState("U.S. Total");
  const [rate, setRate] = useState(String(EIA_PRICES["U.S. Total"]));

  const pick = (s: string) => {
    setState(s);
    setRate(String(EIA_PRICES[s]));
  };
  const result = attempt(() => electricityCost(num(watts), num(hours), num(days), num(rate), num(qty)));

  return (
    <div>
      <Grid cols={4}>
        <NumField label="Power (watts)" value={watts} onChange={setWatts} hint="On the label or manual. kW × 1000 = W." />
        <NumField label="Hours used per day" value={hours} onChange={setHours} />
        <NumField label="Days used per month" value={days} onChange={setDays} />
        <NumField label="How many" value={qty} onChange={setQty} step="1" />
      </Grid>
      <Grid cols={2}>
        <SelectField label="State average price" value={state} onChange={pick} options={[["U.S. Total", "U.S. average"], ...STATES.map((s) => [s, s] as const)]} />
        <NumField label="Your price (cents per kWh)" value={rate} onChange={setRate} hint="Your bill's total ÷ kWh used gives your own all-in rate." />
      </Grid>
      <Hint>Label watts are usually the maximum draw; appliances that cycle (fridges, heaters with a thermostat) use less on average.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`${watts} W × ${hours} h a day at ${num(rate)}¢/kWh`}
            headline={`${money(d.costPerMonth)} a month · ${money(d.costPerYear)} a year`}
            sub={`${fmt(d.kwhPerMonth, 1)} kWh a month · ${money(d.costPerDay)} a day · ${money(d.costPerHour)} per hour of use`}
            rows={[
              ["Energy per day", `${fmt(d.kwhPerDay, 2)} kWh`],
              ["Energy per month", `${fmt(d.kwhPerMonth, 1)} kWh`],
              ["Energy per year", `${fmt(d.kwhPerYear, 0)} kWh`],
              ["Cost per hour running", money(d.costPerHour)],
              ["Cost per month", money(d.costPerMonth)],
              ["Cost per year", money(d.costPerYear)],
            ]}
            limits="The state figure is an average across all residential customers for one month; your utility's tiers, time-of-use rates, fixed charges and taxes change what each kWh really costs you. The page assumes the appliance draws its full wattage for every hour you enter."
            method={
              <p>
                Method: kWh = watts × hours ÷ 1,000; cost = kWh × price. Prices: <Ext href={EIA_URL}>{EIA_SOURCE}</Ext> — U.S. average {EIA_PRICES["U.S. Total"]}¢/kWh. Retrieved {RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
