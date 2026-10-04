"use client";

import { useState, useId } from "react";
import {
  ASPHALT_URL,
  calculateAsphalt,
  SPREAD_PRESETS,
  type AreaMode,
  type AsphaltResult,
  type ThickUnit,
} from "@/lib/asphalt-tonnage";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. Arithmetic in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: AsphaltResult };

const n = (x: number, d = 1) =>
  x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: AsphaltResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Hot-mix asphalt required
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.shortTons, 2)} tons
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          ({n(data.metricTonnes, 2)} metric tonnes, {n(data.pounds, 0)} lb) for{" "}
          {n(data.sqyd, 1)} sq yd ({n(data.sqft, 0)} sq ft) at{" "}
          {n(data.inches, 2)} in compacted, at {data.spreadRate} lb per square
          yard per inch.
        </p>
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          The arithmetic
        </h3>
        <div className="mb-5 rounded-md border border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
          <p>
            Tons = area (sq yd) × thickness (in) × spread rate ÷ 2,000 ={" "}
            {n(data.sqyd, 1)} × {n(data.inches, 2)} × {data.spreadRate} ÷ 2,000
            ={" "}
            <strong className="font-medium text-[var(--color-fg)]">
              {n(data.shortTons, 2)} tons
            </strong>
          </p>
          <p className="mt-2">
            At this thickness one ton covers about {n(data.sqftPerTon, 0)} sq
            ft.
          </p>
        </div>
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          The source calls 110 lb per square yard per inch a rule of thumb and
          notes local variations — Illinois DOT uses 112, Tennessee DOT 106 for
          most dense-graded mixes — and that specialty mixes with heavier
          aggregate (such as steel slag SMA) weigh more. The actual weight
          depends on the mix design. The thickness is compacted thickness.
          Waste, grade corrections and uneven base are not included.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: Gierhart &amp; Wielinski, &ldquo;Five handy rules of thumb
            for successful asphalt pavement construction&rdquo;, Asphalt
            magazine (Asphalt Institute), 11 Sept 2023 — Equation 1 and rule 3.
            Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a
              href={ASPHALT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Asphalt magazine: five handy rules of thumb
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function AsphaltTonnageTool() {
  const [areaMode, setAreaMode] = useState<AreaMode>("ft");
  const [a, setA] = useState("50");
  const [b, setB] = useState("20");
  const [thickness, setThickness] = useState("2");
  const [thickUnit, setThickUnit] = useState<ThickUnit>("in");
  const [preset, setPreset] = useState("ai");
  const [custom, setCustom] = useState("110");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = {
    mode: useId(),
    a: useId(),
    b: useId(),
    t: useId(),
    sr: useId(),
    c: useId(),
  };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));
  const dims = areaMode === "ft" || areaMode === "m";

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      const spreadRate =
        preset === "custom"
          ? num(custom)
          : (SPREAD_PRESETS.find((p) => p.id === preset)?.value ?? NaN);
      setState({
        phase: "result",
        data: calculateAsphalt({
          areaMode,
          a: num(a),
          b: num(b),
          thickness: num(thickness),
          thickUnit,
          spreadRate,
        }),
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
              Area entered as
            </label>
            <select
              id={ids.mode}
              value={areaMode}
              onChange={(e) => setAreaMode(e.target.value as AreaMode)}
              className={field}
            >
              <option value="ft">Length × width in feet</option>
              <option value="m">Length × width in metres</option>
              <option value="sqft">Square feet</option>
              <option value="sqyd">Square yards</option>
              <option value="sqm">Square metres</option>
            </select>
          </div>
          {dims ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor={ids.a} className="mb-1.5 block font-medium">
                  Length
                </label>
                <input
                  id={ids.a}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor={ids.b} className="mb-1.5 block font-medium">
                  Width
                </label>
                <input
                  id={ids.b}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  className={field}
                />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor={ids.a} className="mb-1.5 block font-medium">
                Area
              </label>
              <input
                id={ids.a}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={a}
                onChange={(e) => setA(e.target.value)}
                className={field}
              />
            </div>
          )}
          <div>
            <label htmlFor={ids.t} className="mb-1.5 block font-medium">
              Compacted thickness
            </label>
            <div className="flex gap-2">
              <input
                id={ids.t}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={thickness}
                onChange={(e) => setThickness(e.target.value)}
                className={field}
              />
              <select
                aria-label="Thickness unit"
                value={thickUnit}
                onChange={(e) => setThickUnit(e.target.value as ThickUnit)}
                className="rounded-md border border-[var(--color-line)] bg-white px-2"
              >
                <option value="in">inches</option>
                <option value="mm">mm</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor={ids.sr} className="mb-1.5 block font-medium">
              Spread rate
            </label>
            <select
              id={ids.sr}
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className={field}
            >
              {SPREAD_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
              <option value="custom">Other — from my mix design or spec</option>
            </select>
          </div>
          {preset === "custom" && (
            <div>
              <label htmlFor={ids.c} className="mb-1.5 block font-medium">
                Spread rate (lb per sq yd per inch)
              </label>
              <input
                id={ids.c}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className={field}
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Calculate tonnage
        </button>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          Runs entirely in your browser. Nothing you enter is sent anywhere or
          stored.
        </p>
      </form>

      <div aria-live="polite">
        {state.phase === "error" && (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {state.message}
            </p>
          </div>
        )}
        {state.phase === "result" && <ResultCard data={state.data} />}
      </div>
    </div>
  );
}
