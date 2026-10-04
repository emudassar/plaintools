"use client";

import { useState, useId } from "react";
import {
  calculateMillings,
  COMPACTED_LB_FT3,
  FHWA_RAP_URL,
  LOOSE_LB_FT3,
  type MillingsArea,
  type MillingsResult,
} from "@/lib/asphalt-millings";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. Arithmetic in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: MillingsResult };

const n = (x: number, d = 1) =>
  x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: MillingsResult }) {
  const range = data.tonsLow !== data.tonsHigh;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Asphalt millings needed
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.cubicYards, 2)} cubic yards ·{" "}
          {range
            ? `${n(data.tonsLow, 1)}–${n(data.tonsHigh, 1)}`
            : n(data.tonsLow, 1)}{" "}
          tons
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {n(data.cubicFeet, 1)} cu ft ({n(data.cubicMetres, 2)} m³) for{" "}
          {n(data.sqft, 0)} sq ft at {n(data.depthIn, 2)} in compacted.{" "}
          {range
            ? `${n(data.tonnesLow, 1)}–${n(data.tonnesHigh, 1)}`
            : n(data.tonnesLow, 1)}{" "}
          metric tonnes.
        </p>
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          The arithmetic
        </h3>
        <div className="mb-5 rounded-md border border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
          <p>
            Volume = {n(data.sqft, 0)} sq ft × ({n(data.depthIn, 2)} in ÷ 12) ={" "}
            {n(data.cubicFeet, 1)} cu ft ÷ 27 = {n(data.cubicYards, 2)} cu yd
          </p>
          <p className="mt-2">
            Weight = {n(data.cubicFeet, 1)} cu ft ×{" "}
            {data.usedCustom
              ? `${data.densityLow} lb/cu ft (your figure)`
              : `${data.densityLow}–${data.densityHigh} lb/cu ft (FHWA compacted unit weight)`}{" "}
            ÷ 2,000 ={" "}
            <strong className="font-medium text-[var(--color-fg)]">
              {range
                ? `${n(data.tonsLow, 1)}–${n(data.tonsHigh, 1)}`
                : n(data.tonsLow, 1)}{" "}
              tons
            </strong>
          </p>
        </div>
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          FHWA says the weight of milled asphalt &ldquo;depends on the type of
          aggregate in the reclaimed pavement and the moisture content of the
          stockpiled material&rdquo;, which is why the result is a range. It
          lists {LOOSE_LB_FT3.low}–{LOOSE_LB_FT3.high} lb/cu ft for milled or
          processed RAP and {COMPACTED_LB_FT3.low}–{COMPACTED_LB_FT3.high} lb/cu
          ft compacted. Your supplier&rsquo;s weight per yard or ton is the
          number to order by — enter it to replace the range. The volume is the
          compacted depth you want; how much extra loose material that takes
          depends on compaction.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: FHWA-RD-97-148, User Guidelines for Waste and Byproduct
            Materials in Pavement Construction — Reclaimed Asphalt Pavement,
            Table 13-2. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a
              href={FHWA_RAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              FHWA: Reclaimed asphalt pavement — material description
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function AsphaltMillingsTool() {
  const [areaMode, setAreaMode] = useState<MillingsArea>("ft");
  const [a, setA] = useState("60");
  const [b, setB] = useState("12");
  const [depth, setDepth] = useState("4");
  const [depthUnit, setDepthUnit] = useState<"in" | "mm">("in");
  const [useCustom, setUseCustom] = useState(false);
  const [density, setDensity] = useState("110");
  const [densityUnit, setDensityUnit] = useState<"ft3" | "yd3">("ft3");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = {
    mode: useId(),
    a: useId(),
    b: useId(),
    d: useId(),
    den: useId(),
  };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));
  const dims = areaMode === "ft" || areaMode === "m";

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      const dv = num(density);
      setState({
        phase: "result",
        data: calculateMillings({
          areaMode,
          a: num(a),
          b: num(b),
          depth: num(depth),
          depthUnit,
          customDensity: useCustom
            ? densityUnit === "ft3"
              ? dv
              : dv / 27
            : null,
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
              onChange={(e) => setAreaMode(e.target.value as MillingsArea)}
              className={field}
            >
              <option value="ft">Length × width in feet</option>
              <option value="m">Length × width in metres</option>
              <option value="sqft">Square feet</option>
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
            <label htmlFor={ids.d} className="mb-1.5 block font-medium">
              Compacted depth
            </label>
            <div className="flex gap-2">
              <input
                id={ids.d}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className={field}
              />
              <select
                aria-label="Depth unit"
                value={depthUnit}
                onChange={(e) => setDepthUnit(e.target.value as "in" | "mm")}
                className="rounded-md border border-[var(--color-line)] bg-white px-2"
              >
                <option value="in">inches</option>
                <option value="mm">mm</option>
              </select>
            </div>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
              />
              My supplier gave me a weight
            </label>
          </div>
          {useCustom && (
            <div>
              <label htmlFor={ids.den} className="mb-1.5 block font-medium">
                Supplier&rsquo;s weight (lb)
              </label>
              <div className="flex gap-2">
                <input
                  id={ids.den}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={density}
                  onChange={(e) => setDensity(e.target.value)}
                  className={field}
                />
                <select
                  aria-label="Weight basis"
                  value={densityUnit}
                  onChange={(e) =>
                    setDensityUnit(e.target.value as "ft3" | "yd3")
                  }
                  className="rounded-md border border-[var(--color-line)] bg-white px-2"
                >
                  <option value="ft3">per cu ft</option>
                  <option value="yd3">per cu yd</option>
                </select>
              </div>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Calculate millings
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
