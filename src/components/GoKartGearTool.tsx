"use client";

import { useState, useId } from "react";
import { gearRatio, CSG_URL, type GearResult } from "@/lib/go-kart-gear";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });

function ResultCard({ data, rpm }: { data: GearResult; rpm: number }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Gear ratio {n(data.ratio, 2)}:1 · {rpm.toLocaleString("en-US")} RPM
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          Top speed ≈ {n(data.mph)} mph ({n(data.kmh)} km/h)
        </p>
        <ul className="mt-2 space-y-0.5 text-sm text-[var(--color-muted)]">
          {data.stages.map((s) => (
            <li key={s.label}>
              {s.label}: {n(s.ratio, 3)}:1
            </li>
          ))}
          <li>
            Wheel speed {n(data.wheelRpm, 0)} RPM · tyre circumference {n(data.circumferenceIn, 2)} in
          </li>
        </ul>
        <p className="mt-2 text-sm">
          A numerically lower ratio (fewer axle teeth or more clutch teeth) gives a higher top speed and slower acceleration; a higher ratio
          the opposite.
        </p>
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">Gear ratio chart — top speed (mph) at {rpm.toLocaleString("en-US")} RPM</h3>
        <div className="mb-5 overflow-x-auto">
          <table className="w-full text-center">
            <thead className="text-[var(--color-muted)]">
              <tr>
                <th className="py-1 text-left font-medium">Clutch \ Axle</th>
                {data.chartAxles.map((a) => (
                  <th key={a} className="py-1 font-medium">
                    {a}T
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.chart.map((row) => (
                <tr key={row.clutch} className="border-t border-[var(--color-line)]">
                  <th className="py-1 text-left font-medium">{row.clutch}T</th>
                  {row.cells.map((c) => (
                    <td key={c.axle} className="py-1" title={`${n(c.ratio, 2)}:1`}>
                      {n(c.mph)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          Whether the engine can actually pull that speed. The figure is theoretical: it assumes the engine reaches the RPM you entered
          and ignores wind, rolling resistance, tyre growth, slip and rider weight. A torque converter changes the ratio on the move, so
          this direct-drive figure does not apply to it.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Formula: ratio = axle teeth ÷ clutch teeth (jackshaft stages multiply); mph = RPM ÷ ratio × π × tyre diameter (in) × 60 ÷ 63,360
            — the chain published by CSG Network&rsquo;s kart speed calculator. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={CSG_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              CSG Network kart speed formula
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function GoKartGearTool() {
  const [clutch, setClutch] = useState("12");
  const [axle, setAxle] = useState("60");
  const [js, setJs] = useState(false);
  const [jsIn, setJsIn] = useState("48");
  const [jsOut, setJsOut] = useState("12");
  const [tire, setTire] = useState("11");
  const [tireUnit, setTireUnit] = useState<"in" | "cm">("in");
  const [rpm, setRpm] = useState("3600");
  const ids = { c: useId(), a: useId(), j: useId(), ji: useId(), jo: useId(), t: useId(), tu: useId(), r: useId() };

  const num = (v: string) => (v.trim() === "" ? NaN : Number(v));
  let data: GearResult | null = null;
  let error: string | null = null;
  try {
    data = gearRatio({
      clutch: num(clutch),
      axle: num(axle),
      jackshaft: js ? { jsIn: num(jsIn), jsOut: num(jsOut) } : null,
      tireDiameter: num(tire),
      tireUnit,
      rpm: num(rpm),
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={ids.c} className="mb-1.5 block font-medium">
            Clutch / engine sprocket (teeth)
          </label>
          <input id={ids.c} type="number" inputMode="numeric" min="5" step="1" value={clutch} onChange={(e) => setClutch(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.a} className="mb-1.5 block font-medium">
            Axle sprocket (teeth)
          </label>
          <input id={ids.a} type="number" inputMode="numeric" min="10" step="1" value={axle} onChange={(e) => setAxle(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.r} className="mb-1.5 block font-medium">
            Engine RPM (max)
          </label>
          <input id={ids.r} type="number" inputMode="numeric" min="500" step="100" value={rpm} onChange={(e) => setRpm(e.target.value)} className={field} />
        </div>
      </div>
      <div className="mb-3 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor={ids.t} className="mb-1.5 block font-medium">
            Drive tyre diameter
          </label>
          <input id={ids.t} type="number" inputMode="decimal" min="0" step="any" value={tire} onChange={(e) => setTire(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.tu} className="mb-1.5 block font-medium">
            Unit
          </label>
          <select id={ids.tu} value={tireUnit} onChange={(e) => setTireUnit(e.target.value as "in" | "cm")} className={field}>
            <option value="in">inches</option>
            <option value="cm">centimetres</option>
          </select>
        </div>
      </div>
      <label className="mb-3 flex items-center gap-2 font-medium">
        <input id={ids.j} type="checkbox" checked={js} onChange={(e) => setJs(e.target.checked)} />
        It has a jackshaft (two-stage drive)
      </label>
      {js && (
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.ji} className="mb-1.5 block font-medium">
              Jackshaft sprocket driven by the clutch (teeth)
            </label>
            <input id={ids.ji} type="number" inputMode="numeric" min="5" step="1" value={jsIn} onChange={(e) => setJsIn(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor={ids.jo} className="mb-1.5 block font-medium">
              Jackshaft sprocket driving the axle (teeth)
            </label>
            <input id={ids.jo} type="number" inputMode="numeric" min="5" step="1" value={jsOut} onChange={(e) => setJsOut(e.target.value)} className={field} />
          </div>
        </div>
      )}
      <p className="mb-6 text-xs text-[var(--color-muted)]">Measure the tyre&rsquo;s height when inflated. Works the same for mini bikes. The result updates as you type.</p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} rpm={num(rpm)} />
        )}
      </div>
    </div>
  );
}
