"use client";

import { useState, useId } from "react";
import { oilTank, PRESETS, type OilResult, type Shape, type TankSpec } from "@/lib/oil-tank";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 0) => x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });

const SHAPES: { id: Shape; label: string }[] = [
  { id: "obround-vertical", label: "Oval, standing on end (rounded top and bottom)" },
  { id: "obround-horizontal", label: "Oval, lying flat (rounded sides)" },
  { id: "cylinder-horizontal", label: "Round, lying on its side" },
  { id: "cylinder-vertical", label: "Round, standing upright" },
  { id: "box", label: "Rectangular box" },
];

function ResultCard({ data, spec }: { data: OilResult; spec: TankSpec }) {
  const pct = data.fraction * 100;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {n(data.depth, 1)}&Prime; of oil in a {n(data.capacity)} gal{data.basis === "geometric" ? " (calculated)" : ""} tank, {spec.height}&Prime; tall
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">≈ {n(data.gallons)} gallons</p>
        <p className="mt-1 text-[var(--color-muted)]">
          {n(pct, 1)}% full · room for about {n(data.roomGallons)} more gallons to the {data.basis === "rated" ? "rated" : "calculated"} capacity.
        </p>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white" aria-hidden="true">
          <div className="h-full bg-[var(--color-accent)]" style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
        {data.mismatch && (
          <p className="mt-3 text-sm font-medium">
            Check the numbers: the rated {n(data.capacity)} gal is more than 10% away from the {n(data.geometric)} gal these dimensions hold.
          </p>
        )}
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">Inch-by-inch chart for this tank</h3>
        <div className="mb-5 max-h-72 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white text-[var(--color-muted)]">
              <tr>
                <th className="py-1 font-medium">Inches of oil</th>
                <th className="py-1 font-medium">Gallons</th>
                <th className="py-1 font-medium">% full</th>
              </tr>
            </thead>
            <tbody>
              {data.chart.map((r) => (
                <tr key={r.inches} className={`border-t border-[var(--color-line)] ${Math.round(data.depth) === r.inches ? "bg-[var(--color-accent-soft)] font-semibold" : ""}`}>
                  <td className="py-1">{r.inches}&Prime;</td>
                  <td className="py-1">{n(r.gallons)}</td>
                  <td className="py-1">{n((r.gallons / data.capacity) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          Exactly what is in your tank. The figures assume the tank&rsquo;s nominal dimensions, a level tank and a stick reading taken at
          the centre. Real tanks differ slightly by maker, sit at a slight tilt, and keep some oil and sludge below the outlet that the
          burner cannot use. Treat the result as an estimate.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Method: filled cross-section ÷ whole cross-section (circular-segment geometry) × {data.basis === "rated" ? "the rated capacity" : "the volume of the dimensions (231 in³ per US gallon)"}.
            Preset dimensions: pickhvac.com standard oil tank sizes; checked against its published 275-gallon charts. Retrieved {data.retrievedAt}.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function OilTankTool() {
  const [preset, setPreset] = useState("275v");
  const [custom, setCustom] = useState<TankSpec>(PRESETS[0].spec);
  const [depth, setDepth] = useState("12");
  const ids = { p: useId(), d: useId(), s: useId(), w: useId(), h: useId(), l: useId(), r: useId() };

  const spec: TankSpec = preset === "custom" ? custom : PRESETS.find((p) => p.id === preset)!.spec;
  let data: OilResult | null = null;
  let error: string | null = null;
  try {
    data = oilTank(spec, depth.trim() === "" ? NaN : Number(depth));
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const num = (v: string) => (v.trim() === "" ? NaN : Number(v));
  const isCyl = custom.shape === "cylinder-horizontal" || custom.shape === "cylinder-vertical";

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor={ids.p} className="mb-1.5 block font-medium">
            Tank
          </label>
          <select
            id={ids.p}
            value={preset}
            onChange={(e) => {
              setPreset(e.target.value);
              if (e.target.value !== "custom") setCustom(PRESETS.find((p) => p.id === e.target.value)!.spec);
            }}
            className={field}
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
            <option value="custom">Other — enter my tank&rsquo;s dimensions</option>
          </select>
        </div>
        <div>
          <label htmlFor={ids.d} className="mb-1.5 block font-medium">
            Oil depth on the stick (inches)
          </label>
          <input id={ids.d} type="number" inputMode="decimal" min="0" step="any" value={depth} onChange={(e) => setDepth(e.target.value)} className={field} />
        </div>
      </div>
      {preset === "custom" && (
        <div className="mb-3 grid gap-3 rounded-md border border-[var(--color-line)] p-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor={ids.s} className="mb-1.5 block font-medium">
              Shape
            </label>
            <select
              id={ids.s}
              value={custom.shape}
              onChange={(e) => {
                const shape = e.target.value as Shape;
                setCustom((c) => (shape === "cylinder-horizontal" ? { ...c, shape, width: c.height } : { ...c, shape }));
              }}
              className={field}
            >
              {SHAPES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={ids.h} className="mb-1.5 block font-medium">
              {custom.shape === "cylinder-horizontal" ? "Diameter" : "Height, top to bottom"} (in)
            </label>
            <input
              id={ids.h}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={Number.isNaN(custom.height) ? "" : custom.height}
              onChange={(e) => {
                const v = num(e.target.value);
                setCustom((c) => (c.shape === "cylinder-horizontal" ? { ...c, height: v, width: v } : { ...c, height: v }));
              }}
              className={field}
            />
          </div>
          {custom.shape !== "cylinder-horizontal" && (
            <div>
              <label htmlFor={ids.w} className="mb-1.5 block font-medium">
                {isCyl ? "Diameter" : "Width, side to side"} (in)
              </label>
              <input id={ids.w} type="number" inputMode="decimal" min="0" step="any" value={Number.isNaN(custom.width) ? "" : custom.width} onChange={(e) => setCustom((c) => ({ ...c, width: num(e.target.value) }))} className={field} />
            </div>
          )}
          {custom.shape !== "cylinder-vertical" && (
            <div>
              <label htmlFor={ids.l} className="mb-1.5 block font-medium">
                Length, end to end (in)
              </label>
              <input id={ids.l} type="number" inputMode="decimal" min="0" step="any" value={Number.isNaN(custom.length) ? "" : custom.length} onChange={(e) => setCustom((c) => ({ ...c, length: num(e.target.value) }))} className={field} />
            </div>
          )}
          <div>
            <label htmlFor={ids.r} className="mb-1.5 block font-medium">
              Rated capacity, gal (optional)
            </label>
            <input
              id={ids.r}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={custom.rated === null || Number.isNaN(custom.rated) ? "" : custom.rated}
              onChange={(e) => setCustom((c) => ({ ...c, rated: e.target.value.trim() === "" ? null : num(e.target.value) }))}
              className={field}
            />
          </div>
        </div>
      )}
      <p className="mb-6 text-xs text-[var(--color-muted)]">
        Push a clean stick straight down to the bottom at the fill pipe and read the wet line in inches. The chart updates as you type.
      </p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} spec={spec} />
        )}
      </div>
    </div>
  );
}
