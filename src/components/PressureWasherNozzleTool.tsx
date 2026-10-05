"use client";

import { useState, useId } from "react";
import { GP_CHART_URL, nozzleFor, type NozzleOption, type NozzleResult } from "@/lib/pressure-washer-nozzle";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 2) => x.toLocaleString("en-US", { maximumFractionDigits: d });
const psi = (x: number) => `${Math.round(x).toLocaleString("en-US")} PSI`;

function optText(o: NozzleOption, rated: number) {
  const diff = o.psi - rated;
  return `${psi(o.psi)} at your flow (${diff >= 0 ? "+" : ""}${Math.round(diff).toLocaleString("en-US")} vs rated)`;
}

function ResultCard({ data }: { data: NozzleResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {n(data.gpm)} GPM at {psi(data.psi)}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {data.exactMatch ? `Size ${data.exactMatch.size} nozzle` : `Calculated size ${n(data.exactSize)}`}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {data.exactMatch
            ? `That is a standard size in General Pump's chart (reference orifice ${data.exactMatch.diameterIn}″).`
            : data.smaller && data.larger
              ? `Between the chart's sizes ${data.smaller.size} and ${data.larger.size}.`
              : data.larger
                ? `Below the chart's smallest size, ${data.larger.size}.`
                : `Above the chart's largest size, ${data.smaller?.size}.`}
        </p>
      </div>
      <div className="p-5 text-sm">
        {!data.exactMatch && (
          <ul className="mb-4 space-y-1 text-[var(--color-muted)]">
            {data.smaller && (
              <li>
                <strong className="font-medium text-[var(--color-fg)]">Size {data.smaller.size}</strong> (smaller
                orifice): {optText(data.smaller, data.psi)}.
              </li>
            )}
            {data.larger && (
              <li>
                <strong className="font-medium text-[var(--color-fg)]">Size {data.larger.size}</strong> (larger
                orifice): {optText(data.larger, data.psi)}.
              </li>
            )}
            {!data.smaller && <li>The calculated size is below the smallest size in the chart (2).</li>}
            {!data.larger && <li>The calculated size is above the largest size in the chart (60).</li>}
          </ul>
        )}
        <div className="mb-5 overflow-x-auto">
          <table className="w-full">
            <thead className="text-left text-[var(--color-muted)]">
              <tr>
                <th className="py-1 pr-3 font-medium">Size</th>
                <th className="py-1 pr-3 font-medium">Orifice (ref.)</th>
                <th className="py-1 pr-3 font-medium">Pressure at {n(data.gpm)} GPM</th>
                <th className="py-1 font-medium">Flow at {psi(data.psi)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {data.nearby.map((o) => (
                <tr key={o.size} className={o.size === data.exactMatch?.size ? "font-semibold" : ""}>
                  <td className="py-1.5 pr-3">{o.size}</td>
                  <td className="py-1.5 pr-3">{o.diameterIn}″</td>
                  <td className="py-1.5 pr-3">{psi(o.psi)}</td>
                  <td className="py-1.5">{n(o.gpmAtRated)} GPM</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The arithmetic</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          Size = GPM × √(4000 ÷ PSI) = {n(data.gpm)} × √(4000 ÷ {Math.round(data.psi)}) = {n(data.exactSize, 3)}. A
          nozzle&rsquo;s size number is its flow in GPM at 4,000 PSI; pressure at a given flow is 4000 × (GPM ÷ size)².
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          Size numbers follow General Pump&rsquo;s convention (GPM at 4,000 PSI); some makers number their tips on a different basis. The chart assumes a nozzle in good condition; worn orifices pass more water at lower pressure. Real pressure
          at the nozzle also depends on the pump, unloader setting and hose losses. The machine&rsquo;s manual and the
          pump and nozzle makers set the limits for your equipment.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: General Pump Nozzle Chart (2021) — GPM by nozzle size and PSI; orifice diameters &ldquo;for reference
            only&rdquo;. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={GP_CHART_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              General Pump nozzle chart (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function PressureWasherNozzleTool() {
  const [gpm, setGpm] = useState("4");
  const [pressure, setPressure] = useState("3000");
  const ids = { g: useId(), p: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));

  let data: NozzleResult | null = null;
  let error: { kind: string; message: string } | null = null;
  try {
    data = nozzleFor(num(gpm), num(pressure));
  } catch (e) {
    error = isToolError(e) ? { kind: e.kind, message: e.message } : { kind: "unavailable", message: "That input could not be used." };
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.g} className="mb-1.5 block font-medium">
            Machine flow (GPM)
          </label>
          <input id={ids.g} type="number" inputMode="decimal" min="0" step="any" value={gpm} onChange={(e) => setGpm(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.p} className="mb-1.5 block font-medium">
            Machine pressure (PSI)
          </label>
          <input id={ids.p} type="number" inputMode="decimal" min="0" step="any" value={pressure} onChange={(e) => setPressure(e.target.value)} className={field} />
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">
        Use the rated GPM and PSI from the machine&rsquo;s label or manual. The answer updates as you type; nothing is sent
        anywhere.
      </p>

      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">{error.kind === "no-data" ? "Outside the chart" : "That input could not be used"}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error.message}</p>
          </div>
        ) : (
          data && <ResultCard data={data} />
        )}
      </div>
    </div>
  );
}
