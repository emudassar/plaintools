"use client";

import { useState, useId } from "react";
import {
  ATM_PSIA,
  fToC,
  lookupR22,
  NIST_R22_URL,
  PSIA,
  T_MIN_F,
  type PressUnit,
  type R22Result,
  type TempUnit,
} from "@/lib/r22-pt";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. A table lookup in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: R22Result };

const n = (x: number, d = 1) =>
  x.toLocaleString("en-US", {
    maximumFractionDigits: d,
    minimumFractionDigits: d,
  });

function ResultCard({ data }: { data: R22Result }) {
  const p = data.pressures;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          R-22 saturation point
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.tempF)}°F ({n(data.tempC)}°C) ↔ {n(p.psig)} psig
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {n(p.psia)} psia · {n(p.kPaG, 0)} kPa gauge · {n(p.barG, 2)} bar gauge
        </p>
      </div>
      <div className="p-5">
        <p className="mb-5 text-sm text-[var(--color-muted)]">
          {data.query.kind === "temp"
            ? "This is the pressure at which R-22 boils or condenses at that temperature. R-22 is a single-component refrigerant, so it has one saturation pressure per temperature — no glide."
            : "This is the temperature at which R-22 boils or condenses at that pressure. Comparing it with a measured line temperature is how superheat and subcooling are worked out."}{" "}
          Values between whole degrees are interpolated linearly from
          NIST&rsquo;s 1°F table.
        </p>
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          Gauge pressures assume sea-level atmospheric pressure ({ATM_PSIA}{" "}
          psia); at altitude a gauge reads differently for the same absolute
          pressure. A saturation pressure is a property of the refrigerant, not
          a target for a system — it says nothing about correct charge, which
          depends on the equipment manufacturer&rsquo;s procedure.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: NIST Chemistry WebBook, Standard Reference Database 69,
            Thermophysical Properties of Fluid Systems — R22
            (chlorodifluoromethane), saturation properties. Retrieved{" "}
            {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a
              href={NIST_R22_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              NIST WebBook: R22 thermophysical properties
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

function FullChart() {
  const rows: { f: number; psig: number }[] = [];
  for (let i = 0; i < PSIA.length; i += 5)
    rows.push({ f: T_MIN_F + i, psig: PSIA[i] - ATM_PSIA });
  const half = Math.ceil(rows.length / 2);
  const cols = [rows.slice(0, half), rows.slice(half)];
  return (
    <details className="mt-6 rounded-lg border border-[var(--color-line)]">
      <summary className="cursor-pointer p-4 font-medium">
        Full R-22 PT chart, −40°F to 150°F (every 5°F)
      </summary>
      <div className="grid gap-4 p-4 pt-0 sm:grid-cols-2">
        {cols.map((col, ci) => (
          <table key={ci} className="w-full text-sm">
            <thead className="text-left text-[var(--color-muted)]">
              <tr>
                <th className="py-1 font-medium">°F</th>
                <th className="py-1 font-medium">°C</th>
                <th className="py-1 font-medium">psig</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {col.map((r) => (
                <tr key={r.f}>
                  <td className="py-1">{r.f}</td>
                  <td className="py-1">{n(fToC(r.f))}</td>
                  <td className="py-1">{n(r.psig)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </details>
  );
}

export default function R22PtChartTool() {
  const [mode, setMode] = useState<"temp" | "pressure">("temp");
  const [value, setValue] = useState("40");
  const [tUnit, setTUnit] = useState<TempUnit>("F");
  const [pUnit, setPUnit] = useState<PressUnit>("psig");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = { mode: useId(), val: useId() };

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      const v = value.trim() === "" ? NaN : Number(value);
      setState({
        phase: "result",
        data: lookupR22(
          mode === "temp"
            ? { kind: "temp", value: v, unit: tUnit }
            : { kind: "pressure", value: v, unit: pUnit },
        ),
      });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field =
    "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <form onSubmit={run} className="mb-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.mode} className="mb-1.5 block font-medium">
              I know the
            </label>
            <select
              id={ids.mode}
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as "temp" | "pressure");
                setValue(e.target.value === "temp" ? "40" : "68.6");
              }}
              className={field}
            >
              <option value="temp">Temperature — find the pressure</option>
              <option value="pressure">Pressure — find the temperature</option>
            </select>
          </div>
          <div>
            <label htmlFor={ids.val} className="mb-1.5 block font-medium">
              {mode === "temp" ? "Temperature" : "Pressure"}
            </label>
            <div className="flex gap-2">
              <input
                id={ids.val}
                type="number"
                inputMode="decimal"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={field}
              />
              {mode === "temp" ? (
                <select
                  aria-label="Temperature unit"
                  value={tUnit}
                  onChange={(e) => setTUnit(e.target.value as TempUnit)}
                  className="rounded-md border border-[var(--color-line)] bg-white px-2"
                >
                  <option value="F">°F</option>
                  <option value="C">°C</option>
                </select>
              ) : (
                <select
                  aria-label="Pressure unit"
                  value={pUnit}
                  onChange={(e) => setPUnit(e.target.value as PressUnit)}
                  className="rounded-md border border-[var(--color-line)] bg-white px-2"
                >
                  <option value="psig">psig</option>
                  <option value="psia">psia</option>
                  <option value="kPa">kPa (gauge)</option>
                  <option value="bar">bar (gauge)</option>
                </select>
              )}
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Look up
        </button>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          Runs entirely in your browser. Nothing you enter is sent anywhere or
          stored.
        </p>
      </form>

      <div aria-live="polite">
        {state.phase === "error" && (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">
              {state.kind === "no-data"
                ? "Outside the chart"
                : "That input could not be used"}
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {state.message}
            </p>
          </div>
        )}
        {state.phase === "result" && <ResultCard data={state.data} />}
      </div>

      <FullChart />
    </div>
  );
}
