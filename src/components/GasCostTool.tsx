"use client";

import { useState } from "react";
import { Grid, Hint, NumField, ResultCard, Output, SelectField, attempt, money, num, fmt, fieldClass } from "./CalcBits";
import { Btn, RoutingCredit } from "./ToolBits";
import { gasCost } from "@/lib/money-calc";
import { geocodeAddress } from "@/lib/geocode";
import { route } from "@/lib/routing";
import { asToolError } from "@/lib/errors";

export default function GasCostTool() {
  const [unit, setUnit] = useState<"mi" | "km">("mi");
  const [distance, setDistance] = useState("250");
  const [economy, setEconomy] = useState("28");
  const [price, setPrice] = useState("3.20");
  const [round, setRound] = useState(false);
  const [people, setPeople] = useState("1");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [routeMsg, setRouteMsg] = useState<string | null>(null);
  const [routed, setRouted] = useState(false);

  async function getRoute() {
    if (!from.trim() || !to.trim()) return;
    setBusy(true);
    setRouteMsg(null);
    try {
      const [a, b] = await Promise.all([geocodeAddress(from, { preferUS: false }), geocodeAddress(to, { preferUS: false })]);
      const r = await route([a, b], "car");
      const d = unit === "mi" ? r.metres / 1609.344 : r.metres / 1000;
      setDistance(String(Math.round(d * 10) / 10));
      setRouted(true);
      setRouteMsg(`Road route ${a.label.split(",")[0]} → ${b.label.split(",")[0]}: ${fmt(d, 1)} ${unit}, about ${Math.floor(r.seconds / 3600)} h ${Math.round((r.seconds % 3600) / 60)} min without traffic.`);
    } catch (e) {
      setRouteMsg(asToolError(e).message);
    } finally {
      setBusy(false);
    }
  }

  const result = attempt(() => gasCost(num(distance), unit, num(economy), num(price), round, num(people)));
  const vol = unit === "mi" ? "gallons" : "litres";

  return (
    <div>
      <div className="mb-3 rounded-md border border-[var(--color-line)] p-3">
        <p className="mb-2 font-medium">Optional: get the driving distance</p>
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input className={fieldClass} placeholder="From (city or address)" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From" />
          <input className={fieldClass} placeholder="To (city or address)" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To" />
          <Btn onClick={getRoute} disabled={busy}>
            {busy ? "Routing…" : "Get distance"}
          </Btn>
        </div>
        {routeMsg && <p className="mt-2 text-sm text-[var(--color-muted)]">{routeMsg}</p>}
      </div>
      <Grid cols={3}>
        <SelectField label="Units" value={unit} onChange={setUnit} options={[["mi", "Miles, mpg, $ per gallon"], ["km", "Kilometres, L/100 km, price per litre"]]} />
        <NumField label={`Distance one way (${unit})`} value={distance} onChange={setDistance} />
        <NumField label={unit === "mi" ? "Fuel economy (mpg)" : "Fuel use (L/100 km)"} value={economy} onChange={setEconomy} />
      </Grid>
      <Grid cols={3}>
        <NumField label={unit === "mi" ? "Gas price ($ per gallon)" : "Fuel price (per litre)"} value={price} onChange={setPrice} />
        <NumField label="People sharing the cost" value={people} onChange={setPeople} step="1" />
        <label className="flex items-center gap-2 pt-6">
          <input type="checkbox" checked={round} onChange={(e) => setRound(e.target.checked)} />
          <span>Round trip</span>
        </label>
      </Grid>
      <Hint>Highway mpg suits a long road trip; city mpg suits stop-and-go driving. Your car&apos;s own trip computer beats both.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`${fmt(d.distance, 1)} ${unit}${round ? " round trip" : ""}`}
            headline={`${unit === "mi" ? money(d.cost) : fmt(d.cost, 2)} in fuel`}
            sub={`${fmt(d.fuel, 2)} ${vol}${num(people) > 1 ? ` · ${unit === "mi" ? money(d.perPerson) : fmt(d.perPerson, 2)} each for ${people} people` : ""} · ${unit === "mi" ? money(d.costPerDistance) : fmt(d.costPerDistance, 3)} per ${unit}`}
            limits="Real fuel use changes with speed, load, air conditioning, terrain, traffic and tyre pressure. Tolls, parking and wear on the car are not included. Fuel prices change daily and by station."
            method={
              <p>
                Method: fuel = distance ÷ mpg (or distance × L/100 km ÷ 100); cost = fuel × price; split = cost ÷ people. {routed && <RoutingCredit />}
              </p>
            }
          />
        )}
      />
    </div>
  );
}
