"use client";

import { useState, useId } from "react";
import {
  calculateGravel,
  CARIBSEA_FAQ_URL,
  SUBSTRATES,
  type GravelResult,
} from "@/lib/aquarium-gravel";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. Arithmetic in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: GravelResult };

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: GravelResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Gravel or sand needed · {data.substrateLabel}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.pounds, 1)} lb ({n(data.kilograms, 1)} kg)
          {data.bags !== null && ` · ${data.bags} × ${n(data.bagLb ?? 0, 1)} lb bags`}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {n(data.cubicFeet, 3)} cu ft ({n(data.litres, 1)} litres) of substrate for a{" "}
          {n(data.lengthIn, 1)} × {n(data.widthIn, 1)} in footprint at {n(data.depthIn, 2)} in
          deep.
        </p>
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">The arithmetic</h3>
        <div className="mb-5 rounded-md border border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
          <p>
            {n(data.lengthIn, 2)} × {n(data.widthIn, 2)} × {n(data.depthIn, 2)} in ={" "}
            {n(data.cubicInches, 0)} cu in ÷ 1,728 = {n(data.cubicFeet, 3)} cu ft
          </p>
          <p className="mt-2">
            {n(data.cubicFeet, 3)} cu ft × {data.density} lb/cu ft ={" "}
            <strong className="font-medium text-[var(--color-fg)]">{n(data.pounds, 1)} lb</strong>
            {data.bags !== null &&
              ` ÷ ${n(data.bagLb ?? 0, 1)} lb per bag = ${n(data.pounds / (data.bagLb ?? 1), 2)}, rounded up to ${data.bags} bags`}
          </p>
          {data.ruleLow !== null && data.ruleHigh !== null && (
            <p className="mt-2">
              CaribSea&rsquo;s general rule of 1 to 2 lb per gallon gives {n(data.ruleLow, 0)}–
              {n(data.ruleHigh, 0)} lb for your tank;{" "}
              {data.pounds < data.ruleLow
                ? "the formula result is below that range (a shallow bed, a light substrate or a tall tank)."
                : data.pounds > data.ruleHigh
                  ? "the formula result is above that range (a deep bed or a wide, shallow tank)."
                  : "the formula result falls inside it."}
            </p>
          )}
        </div>
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          The weights per cubic foot are CaribSea&rsquo;s approximate figures for its own
          products. Another brand, or a different grain size, can weigh more or less — enter the
          figure from its bag or maker if you have it. The result is a flat, even bed; slopes,
          rockwork and décor change how much you use. It does not say what depth suits your
          fish or plants.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: CaribSea, Inc. FAQ — &ldquo;How many pounds do I need?&rdquo; (formula and
            substrate densities). Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={CARIBSEA_FAQ_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              CaribSea FAQ
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function AquariumGravelTool() {
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [length, setLength] = useState("24");
  const [width, setWidth] = useState("12");
  const [depth, setDepth] = useState("2");
  const [substrate, setSubstrate] = useState("super-naturals");
  const [density, setDensity] = useState("100");
  const [bag, setBag] = useState("20");
  const [gallons, setGallons] = useState("");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = { unit: useId(), l: useId(), w: useId(), d: useId(), s: useId(), den: useId(), bag: useId(), gal: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));
  const opt = (x: string) => (x.trim() === "" ? null : Number(x));

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState({
        phase: "result",
        data: calculateGravel({
          length: num(length),
          width: num(width),
          depth: num(depth),
          unit,
          substrate,
          customDensity: substrate === "custom" ? num(density) : null,
          bagLb: opt(bag),
          gallons: opt(gallons),
        }),
      });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const u = unit === "in" ? "in" : "cm";

  return (
    <div>
      <form onSubmit={run} className="mb-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.unit} className="mb-1.5 block font-medium">
              Measurements in
            </label>
            <select id={ids.unit} value={unit} onChange={(e) => setUnit(e.target.value as "in" | "cm")} className={field}>
              <option value="in">Inches</option>
              <option value="cm">Centimetres</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor={ids.l} className="mb-1.5 block font-medium">
                Inside length ({u})
              </label>
              <input id={ids.l} type="number" inputMode="decimal" min="0" step="any" value={length} onChange={(e) => setLength(e.target.value)} className={field} />
            </div>
            <div>
              <label htmlFor={ids.w} className="mb-1.5 block font-medium">
                Inside width ({u})
              </label>
              <input id={ids.w} type="number" inputMode="decimal" min="0" step="any" value={width} onChange={(e) => setWidth(e.target.value)} className={field} />
            </div>
          </div>
          <div>
            <label htmlFor={ids.d} className="mb-1.5 block font-medium">
              Bed depth ({u})
            </label>
            <input id={ids.d} type="number" inputMode="decimal" min="0" step="any" value={depth} onChange={(e) => setDepth(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor={ids.s} className="mb-1.5 block font-medium">
              Substrate (CaribSea weight per cu ft)
            </label>
            <select id={ids.s} value={substrate} onChange={(e) => setSubstrate(e.target.value)} className={field}>
              {SUBSTRATES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} — {s.lbPerFt3} lb
                </option>
              ))}
              <option value="custom">Other — enter lb per cu ft</option>
            </select>
          </div>
          {substrate === "custom" && (
            <div>
              <label htmlFor={ids.den} className="mb-1.5 block font-medium">
                Weight per cubic foot (lb)
              </label>
              <input id={ids.den} type="number" inputMode="decimal" min="0" step="any" value={density} onChange={(e) => setDensity(e.target.value)} className={field} />
            </div>
          )}
          <div>
            <label htmlFor={ids.bag} className="mb-1.5 block font-medium">
              Bag size in lb <span className="font-normal text-[var(--color-muted)]">(optional)</span>
            </label>
            <input id={ids.bag} type="number" inputMode="decimal" min="0" step="any" value={bag} onChange={(e) => setBag(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor={ids.gal} className="mb-1.5 block font-medium">
              Tank size in US gallons <span className="font-normal text-[var(--color-muted)]">(optional check)</span>
            </label>
            <input id={ids.gal} type="number" inputMode="decimal" min="0" step="any" value={gallons} onChange={(e) => setGallons(e.target.value)} className={field} />
          </div>
        </div>
        <button type="submit" className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white">
          Calculate gravel
        </button>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          Runs entirely in your browser. Nothing you enter is sent anywhere or stored.
        </p>
      </form>

      <div aria-live="polite">
        {state.phase === "error" && (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{state.message}</p>
          </div>
        )}
        {state.phase === "result" && <ResultCard data={state.data} />}
      </div>
    </div>
  );
}
