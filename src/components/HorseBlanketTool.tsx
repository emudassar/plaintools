"use client";

import { useState, useId } from "react";
import { findBlanketSize, SIZES, WEATHERBEETA_URL, type BlanketResult } from "@/lib/horse-blanket";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: BlanketResult }) {
  const s = data.size;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Body length {n(data.measuredIn)} in ({n(data.measuredCm, 0)} cm)
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          Size {s.inches}&Prime; · {s.feet} · {s.cm} cm
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {data.exact
            ? "Your measurement matches this size exactly."
            : `Between sizes: WeatherBeeta says to choose the bigger size, so ${s.inches}" rather than ${data.smaller ? `${data.smaller.inches}"` : "a smaller one"}.`}{" "}
          Euro back seam {s.backSeamCm} cm{data.letter ? ` (${data.letter} in WeatherBeeta's letter sizes)` : ""}.
        </p>
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The full chart</h3>
        <div className="mb-5 max-h-72 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white text-[var(--color-muted)]">
              <tr>
                <th className="py-1 font-medium">Inches</th>
                <th className="py-1 font-medium">Feet</th>
                <th className="py-1 font-medium">cm</th>
                <th className="py-1 font-medium">Euro back seam</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((r) => (
                <tr key={r.inches} className={`border-t border-[var(--color-line)] ${r.inches === s.inches ? "bg-[var(--color-accent-soft)] font-semibold" : ""}`}>
                  <td className="py-1">{r.inches}&Prime;</td>
                  <td className="py-1">{r.feet}</td>
                  <td className="py-1">{r.cm}</td>
                  <td className="py-1">{r.backSeamCm} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          How a particular blanket will fit. Brands and styles cut differently — this is WeatherBeeta&rsquo;s chart — and shoulder
          shape, neck style and gussets matter as much as length. Check the size chart for the brand you are buying.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Source: WeatherBeeta horse blanket size guide (chart and measuring instructions). Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={WEATHERBEETA_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              WeatherBeeta size guide
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function HorseBlanketTool() {
  const [m, setM] = useState("73");
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const ids = { m: useId(), u: useId() };

  let data: BlanketResult | null = null;
  let error: string | null = null;
  try {
    data = findBlanketSize({ measurement: m.trim() === "" ? NaN : Number(m), unit });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor={ids.m} className="mb-1.5 block font-medium">
            Body length: centre of chest to end of rump
          </label>
          <input id={ids.m} type="number" inputMode="decimal" min="0" step="any" value={m} onChange={(e) => setM(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.u} className="mb-1.5 block font-medium">
            Unit
          </label>
          <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as "in" | "cm")} className={field}>
            <option value="in">inches</option>
            <option value="cm">centimetres</option>
          </select>
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">Measure in a straight line along the side of the horse. The size updates as you type.</p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} />
        )}
      </div>
    </div>
  );
}
