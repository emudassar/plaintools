"use client";

import { useState, useId } from "react";
import {
  sizeHeater,
  HEATER_ARCHIVE_URL,
  QUOTES,
  RISE_LABEL,
  type HeaterResult,
  type RiseRate,
  type Shape,
} from "@/lib/pool-heater-size";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. Arithmetic in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: HeaterResult };

const n = (x: number, d = 0) =>
  x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: HeaterResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Approximate heater output
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.btuPerHour)} Btu/hour
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          For {n(data.areaSqFt, 1)} sq ft of surface and a {n(data.riseF, 1)}°F
          temperature rise, by the Department of Energy&rsquo;s approximate
          sizing formula.
        </p>
      </div>
      <div className="p-5">
        {(data.belowRange || data.aboveRange) && (
          <div className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4 text-sm">
            The same page states: &ldquo;{QUOTES.range}&rdquo; This figure is{" "}
            {data.belowRange ? "below the smallest" : "above the largest"} of
            those outputs.
          </div>
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          The arithmetic
        </h3>
        <div className="mb-5 rounded-md border border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
          <p>
            Surface area: {data.areaMethod} = {n(data.areaSqFt, 1)} sq ft
          </p>
          <p className="mt-1">
            Btu/h = area × rise × 12
            {data.multiplier !== 1 ? ` × ${data.multiplier}` : ""} ={" "}
            {n(data.areaSqFt, 1)} × {n(data.riseF, 1)} × 12
            {data.multiplier !== 1 ? ` × ${data.multiplier}` : ""} ={" "}
            <strong className="font-medium text-[var(--color-fg)]">
              {n(data.btuPerHour)} Btu/h
            </strong>
          </p>
          <p className="mt-2 text-xs">&ldquo;{QUOTES.basis}&rdquo;</p>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          The Department of Energy calls this an approximate size and says:
          &ldquo;{QUOTES.professional}&rdquo; It also notes that{" "}
          {QUOTES.factors} The formula is for gas heaters on outdoor pools,
          assumes the wind and heating rate above, and does not account for a
          cover, shade, or heat pumps and solar heaters, which are sized
          differently.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: U.S. Department of Energy, Energy Saver, &ldquo;Gas Pool
            Heaters&rdquo; — Sizing a Gas Pool Heater. The live page returned
            404 on {data.retrievedAt}; text read from the Internet Archive copy
            of 10 January 2025.
          </p>
          <p className="mt-1">
            <a
              href={HEATER_ARCHIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Energy Saver: Gas Pool Heaters (archived copy)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function PoolHeaterSizeTool() {
  const [shape, setShape] = useState<Shape>("rect");
  const [a, setA] = useState("32");
  const [b, setB] = useState("16");
  const [area, setArea] = useState("500");
  const [desired, setDesired] = useState("80");
  const [coldest, setColdest] = useState("65");
  const [rate, setRate] = useState<RiseRate>("base");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = {
    shape: useId(),
    a: useId(),
    b: useId(),
    area: useId(),
    des: useId(),
    cold: useId(),
    rate: useId(),
  };
  const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState({
        phase: "result",
        data: sizeHeater({
          shape,
          a: num(a),
          b: num(b),
          area: num(area),
          desiredF: num(desired),
          coldestMonthF: num(coldest),
          rate,
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
            <label htmlFor={ids.shape} className="mb-1.5 block font-medium">
              Pool shape
            </label>
            <select
              id={ids.shape}
              value={shape}
              onChange={(e) => setShape(e.target.value as Shape)}
              className={field}
            >
              <option value="rect">Rectangle</option>
              <option value="round">Round</option>
              <option value="oval">Oval</option>
              <option value="area">Other — I know the surface area</option>
            </select>
          </div>
          {shape === "area" ? (
            <div>
              <label htmlFor={ids.area} className="mb-1.5 block font-medium">
                Surface area (sq ft)
              </label>
              <input
                id={ids.area}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className={field}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor={ids.a} className="mb-1.5 block font-medium">
                  {shape === "round" ? "Diameter (ft)" : "Length (ft)"}
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
              {shape !== "round" && (
                <div>
                  <label htmlFor={ids.b} className="mb-1.5 block font-medium">
                    Width (ft)
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
              )}
            </div>
          )}
          <div>
            <label htmlFor={ids.des} className="mb-1.5 block font-medium">
              Desired pool temperature (°F)
            </label>
            <input
              id={ids.des}
              type="number"
              inputMode="decimal"
              step="any"
              value={desired}
              onChange={(e) => setDesired(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor={ids.cold} className="mb-1.5 block font-medium">
              Average temperature, coldest month of use (°F)
            </label>
            <input
              id={ids.cold}
              type="number"
              inputMode="decimal"
              step="any"
              value={coldest}
              onChange={(e) => setColdest(e.target.value)}
              className={field}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={ids.rate} className="mb-1.5 block font-medium">
              Heating rate
            </label>
            <select
              id={ids.rate}
              value={rate}
              onChange={(e) => setRate(e.target.value as RiseRate)}
              className={field}
            >
              {(Object.keys(RISE_LABEL) as RiseRate[]).map((k) => (
                <option key={k} value={k}>
                  {RISE_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Calculate heater size
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
                ? "No heating requirement"
                : "That input could not be used"}
            </p>
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
