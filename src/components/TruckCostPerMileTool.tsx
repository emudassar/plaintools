"use client";

import { useState, useId } from "react";
import {
  ATRI_EX_FUEL,
  ATRI_TOTAL,
  ATRI_URL,
  ATRI_YEAR,
  truckCostPerMile,
  type TruckCostResult,
} from "@/lib/truck-cost-per-mile";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const LINES: { id: string; label: string; kind: "fixed" | "variable"; start: string }[] = [
  { id: "truck", label: "Truck and trailer payments", kind: "fixed", start: "2500" },
  { id: "ins", label: "Insurance", kind: "fixed", start: "1000" },
  { id: "permits", label: "Permits, licences and fees", kind: "fixed", start: "200" },
  { id: "driver", label: "Driver pay and benefits", kind: "variable", start: "5000" },
  { id: "repair", label: "Repair and maintenance", kind: "variable", start: "1500" },
  { id: "tires", label: "Tires", kind: "variable", start: "300" },
  { id: "tolls", label: "Tolls", kind: "variable", start: "150" },
  { id: "other", label: "Other costs", kind: "variable", start: "0" },
];

const usd = (x: number, d = 3) => `$${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: d })}`;
const n = (x: number, d = 0) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data, deadhead }: { data: TruckCostResult; deadhead: number }) {
  const cmp = (diff: number) =>
    Math.abs(diff) < 0.0005 ? "the same as" : `${usd(Math.abs(diff))} ${diff > 0 ? "above" : "below"}`;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {usd(data.total, 2)} of costs over {n(data.miles)} miles
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{usd(data.perMile)} per mile</p>
        <p className="mt-1 text-[var(--color-muted)]">
          {deadhead > 0
            ? `${usd(data.perLoadedMile)} per loaded mile with ${n(deadhead, 1)}% deadhead (${n(data.loadedMiles)} loaded miles). `
            : ""}
          {usd(data.perMileExFuel)} per mile excluding fuel.
        </p>
      </div>
      <div className="p-5 text-sm">
        <div className="mb-5 overflow-x-auto">
          <table className="w-full">
            <thead className="text-left text-[var(--color-muted)]">
              <tr>
                <th className="py-1 pr-3 font-medium">Cost</th>
                <th className="py-1 pr-3 font-medium">Amount</th>
                <th className="py-1 font-medium">Per mile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              <tr>
                <td className="py-1.5 pr-3">Fuel{data.fuelGallons !== null ? ` (${n(data.fuelGallons, 1)} gal)` : ""}</td>
                <td className="py-1.5 pr-3">{usd(data.fuelCost, 2)}</td>
                <td className="py-1.5">{usd(data.fuelPerMile)}</td>
              </tr>
              {data.lines
                .filter((l) => l.amount > 0)
                .map((l) => (
                  <tr key={l.label}>
                    <td className="py-1.5 pr-3">{l.label}</td>
                    <td className="py-1.5 pr-3">{usd(l.amount, 2)}</td>
                    <td className="py-1.5">{usd(l.perMile)}</td>
                  </tr>
                ))}
              <tr className="font-medium">
                <td className="py-1.5 pr-3">Fixed / variable (excl. fuel)</td>
                <td className="py-1.5 pr-3">
                  {usd(data.fixed, 2)} / {usd(data.variable, 2)}
                </td>
                <td className="py-1.5">
                  {usd(data.fixedPerMile)} / {usd(data.variablePerMile)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">Against the industry average</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          ATRI reports an industry-average cost of {usd(ATRI_TOTAL)} per mile in {ATRI_YEAR} ({usd(ATRI_EX_FUEL)} excluding
          fuel). Your figure is {cmp(data.vsAtri)} the average, and {cmp(data.vsAtriExFuel)} it excluding fuel. ATRI&rsquo;s
          figure is an average across the fleets it surveyed; costs vary by sector and fleet size.
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          The result is only as complete as the costs entered — leave one out and the per-mile figure is too low. It
          does not set a rate, include profit or account for taxes; it is your cost, not your price.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Arithmetic: total cost ÷ miles. Benchmark: American Transportation Research Institute, 2026 Analysis of the
            Operational Costs of Trucking (press release, 15 July 2026). Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={ATRI_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              ATRI press release
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function TruckCostPerMileTool() {
  const [miles, setMiles] = useState("10000");
  const [amounts, setAmounts] = useState<Record<string, string>>(Object.fromEntries(LINES.map((l) => [l.id, l.start])));
  const [fuelMode, setFuelMode] = useState<"mpg" | "amount">("mpg");
  const [mpg, setMpg] = useState("6.5");
  const [price, setPrice] = useState("3.90");
  const [fuelAmount, setFuelAmount] = useState("6000");
  const [deadhead, setDeadhead] = useState("15");
  const ids = { miles: useId(), fm: useId(), mpg: useId(), price: useId(), fa: useId(), dh: useId(), line: useId() };
  const num = (x: string) => (x.trim() === "" ? 0 : Number(x));

  let data: TruckCostResult | null = null;
  let error: string | null = null;
  try {
    data = truckCostPerMile({
      miles: miles.trim() === "" ? NaN : Number(miles),
      lines: LINES.map((l) => ({ label: l.label, kind: l.kind, amount: num(amounts[l.id]) })),
      fuel: fuelMode === "mpg" ? { mode: "mpg", mpg: num(mpg), pricePerGallon: num(price) } : { mode: "amount", amount: num(fuelAmount) },
      deadheadPct: num(deadhead),
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2";
  const numInput = (id: string, value: string, set: (v: string) => void) => (
    <input id={id} type="number" inputMode="decimal" min="0" step="any" value={value} onChange={(e) => set(e.target.value)} className={field} />
  );

  return (
    <div>
      <p className="mb-3 text-sm text-[var(--color-muted)]">
        Enter every cost for one period (a month, a quarter or a year) and the miles driven in that same period.
      </p>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.miles} className="mb-1.5 block font-medium">
            Miles driven in the period
          </label>
          {numInput(ids.miles, miles, setMiles)}
        </div>
        <div>
          <label htmlFor={ids.dh} className="mb-1.5 block font-medium">
            Deadhead (empty) miles, %
          </label>
          {numInput(ids.dh, deadhead, setDeadhead)}
        </div>
        <div>
          <label htmlFor={ids.fm} className="mb-1.5 block font-medium">
            Fuel
          </label>
          <select id={ids.fm} value={fuelMode} onChange={(e) => setFuelMode(e.target.value as "mpg" | "amount")} className={field}>
            <option value="mpg">Work it out from MPG and price</option>
            <option value="amount">I know the fuel spend</option>
          </select>
        </div>
        {fuelMode === "mpg" ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor={ids.mpg} className="mb-1.5 block font-medium">
                MPG
              </label>
              {numInput(ids.mpg, mpg, setMpg)}
            </div>
            <div>
              <label htmlFor={ids.price} className="mb-1.5 block font-medium">
                $ per gallon
              </label>
              {numInput(ids.price, price, setPrice)}
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor={ids.fa} className="mb-1.5 block font-medium">
              Fuel spend ($)
            </label>
            {numInput(ids.fa, fuelAmount, setFuelAmount)}
          </div>
        )}
      </div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        {LINES.map((l) => (
          <div key={l.id}>
            <label htmlFor={`${ids.line}-${l.id}`} className="mb-1.5 block font-medium">
              {l.label} ($) <span className="font-normal text-[var(--color-muted)]">{l.kind}</span>
            </label>
            {numInput(`${ids.line}-${l.id}`, amounts[l.id], (v) => setAmounts((a) => ({ ...a, [l.id]: v })))}
          </div>
        ))}
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">
        Blank costs count as $0. The answer updates as you type; nothing is sent anywhere.
      </p>

      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} deadhead={num(deadhead)} />
        )}
      </div>
    </div>
  );
}
