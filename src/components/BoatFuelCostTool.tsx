"use client";

import { useState, useId } from "react";
import {
  calculateBoatFuelCost,
  SEAGRANT_URL,
  type BoatFuelResult,
  type BurnSource,
  type DistUnit,
  type FuelUnit,
  type TripMode,
} from "@/lib/boat-fuel-cost";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 2) => x.toLocaleString("en-US", { maximumFractionDigits: d });
const money = (x: number) => x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const SPEED: Record<DistUnit, string> = { nm: "knots", mi: "mph", km: "km/h" };

function ResultCard({ data, fu, du, tank }: { data: BoatFuelResult; fu: FuelUnit; du: DistUnit; tank: number | null }) {
  const unit = fu === "gal" ? "gal" : "L";
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {n(data.hours, 2)} engine hours × {n(data.burnPerHour, 2)} {unit}/hr{data.estimated ? " (full-throttle estimate)" : ""}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          Fuel cost {money(data.cost)} · {n(data.fuel, 1)} {unit}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {fu === "gal" ? `${n(data.fuelL, 1)} litres` : `${n(data.fuelGal, 1)} US gallons`} · {money(data.costPerHour)} per hour
          {data.distPerFuel !== null && data.costPerDist !== null &&
            ` · ${n(data.distPerFuel, 2)} ${du} per ${unit} · ${money(data.costPerDist)} per ${du}`}
        </p>
      </div>
      <div className="p-5 text-sm">
        {data.estimated && (
          <div className="mb-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3">
            <p className="font-medium">This burn rate is a full-throttle average, not your engine&rsquo;s figure</p>
            <p className="mt-1 text-[var(--color-muted)]">
              NC Sea Grant gives about 1 gallon per hour per 10 hp at full throttle for gasoline engines on planing hulls, averaged
              across makes. Its own example burns half that (12.5 vs 25 gph) at 77.5% of rated output. Your engine maker&rsquo;s
              performance data or a fuel-flow gauge gives the real figure; enter it with &ldquo;I know my burn rate&rdquo;.
            </p>
          </div>
        )}
        <h3 className="mb-2 font-semibold tracking-wide uppercase">Rule of thirds</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          NC Sea Grant&rsquo;s reserve guideline is a third to get there, a third to get back and a third as a safety margin. If this
          trip is the out-and-back two thirds, that means {n(data.thirdsFuel, 1)} {unit} aboard at the start.
          {tank !== null && data.tankShort !== null &&
            (data.tankShort
              ? ` Your ${n(tank, 1)} ${unit} tank holds less than that.`
              : ` Your ${n(tank, 1)} ${unit} tank holds that amount.`)}
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          Burn changes with throttle, load, hull, sea state, current and wind, and idling or trolling time burns fuel without
          covering distance. Distance ÷ speed assumes you hold that speed the whole way.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Fuel = burn per hour × engines × hours; cost = fuel × your price. Full-throttle estimate, miles-per-gallon method and rule
            of thirds: North Carolina Sea Grant, Coastwatch (2014). Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={SEAGRANT_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              NC Sea Grant: Running your boat by the numbers
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function BoatFuelCostTool() {
  const [src, setSrc] = useState<BurnSource>("known");
  const [fu, setFu] = useState<FuelUnit>("gal");
  const [burn, setBurn] = useState("8");
  const [hp, setHp] = useState("150");
  const [engines, setEngines] = useState("1");
  const [mode, setMode] = useState<TripMode>("hours");
  const [hours, setHours] = useState("4");
  const [dist, setDist] = useState("40");
  const [speed, setSpeed] = useState("20");
  const [du, setDu] = useState<DistUnit>("nm");
  const [price, setPrice] = useState("5.00");
  const [tank, setTank] = useState("");
  const ids = { s: useId(), f: useId(), b: useId(), h: useId(), e: useId(), m: useId(), hr: useId(), d: useId(), sp: useId(), du: useId(), p: useId(), t: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));
  const tankVal = tank.trim() === "" ? null : Number(tank);

  let data: BoatFuelResult | null = null;
  let error: string | null = null;
  try {
    data = calculateBoatFuelCost({
      burnSource: src,
      burnRate: num(burn),
      horsepower: num(hp),
      engines: num(engines),
      tripMode: mode,
      hours: num(hours),
      distance: num(dist),
      speed: num(speed),
      distUnit: du,
      fuelUnit: fu,
      price: num(price),
      tank: tankVal,
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const inp = (id: string, v: string, set: (s: string) => void, step = "any", ph?: string) => (
    <input id={id} type="number" inputMode="decimal" min="0" step={step} value={v} placeholder={ph} onChange={(e) => set(e.target.value)} className={field} />
  );
  const lbl = (id: string, text: string) => (
    <label htmlFor={id} className="mb-1.5 block font-medium">
      {text}
    </label>
  );
  const u = fu === "gal" ? "gallons" : "litres";

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <div>
          {lbl(ids.s, "Fuel burn")}
          <select id={ids.s} value={src} onChange={(e) => setSrc(e.target.value as BurnSource)} className={field}>
            <option value="known">I know my burn rate (gauge or engine data)</option>
            <option value="hp">Estimate from horsepower (gasoline, full throttle)</option>
          </select>
        </div>
        <div>
          {lbl(ids.f, "Fuel measured in")}
          <select id={ids.f} value={fu} onChange={(e) => setFu(e.target.value as FuelUnit)} className={field}>
            <option value="gal">US gallons</option>
            <option value="L">litres</option>
          </select>
        </div>
        {src === "known" ? (
          <div>
            {lbl(ids.b, `Burn per engine (${u} per hour)`)}
            {inp(ids.b, burn, setBurn)}
          </div>
        ) : (
          <div>
            {lbl(ids.h, "Horsepower per engine")}
            {inp(ids.h, hp, setHp)}
          </div>
        )}
        <div>
          {lbl(ids.e, "Number of engines")}
          {inp(ids.e, engines, setEngines, "1")}
        </div>
        <div>
          {lbl(ids.m, "Trip length by")}
          <select id={ids.m} value={mode} onChange={(e) => setMode(e.target.value as TripMode)} className={field}>
            <option value="hours">engine hours</option>
            <option value="distance">distance and speed</option>
          </select>
        </div>
        {mode === "hours" ? (
          <div>
            {lbl(ids.hr, "Engine hours")}
            {inp(ids.hr, hours, setHours)}
          </div>
        ) : (
          <>
            <div>
              {lbl(ids.du, "Distance unit")}
              <select id={ids.du} value={du} onChange={(e) => setDu(e.target.value as DistUnit)} className={field}>
                <option value="nm">nautical miles (speed in knots)</option>
                <option value="mi">statute miles (speed in mph)</option>
                <option value="km">kilometres (speed in km/h)</option>
              </select>
            </div>
            <div>
              {lbl(ids.d, `Total distance (${du})`)}
              {inp(ids.d, dist, setDist)}
            </div>
            <div>
              {lbl(ids.sp, `Average speed (${SPEED[du]})`)}
              {inp(ids.sp, speed, setSpeed)}
            </div>
          </>
        )}
        <div>
          {lbl(ids.p, `Fuel price per ${fu === "gal" ? "gallon" : "litre"}`)}
          {inp(ids.p, price, setPrice)}
        </div>
        <div>
          {lbl(ids.t, `Tank capacity (${u}, optional)`)}
          {inp(ids.t, tank, setTank, "any", "leave blank to skip")}
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">The answer updates as you type; nothing is sent anywhere.</p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} fu={fu} du={du} tank={tankVal} />
        )}
      </div>
    </div>
  );
}
