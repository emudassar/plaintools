"use client";

import { useState, useId } from "react";
import { scubaWeight, DEFAULT_GEAR_LB, KG_PER_LB, PADI_URL, DAN_URL, SD_URL, type ScubaResult, type Suit, type Water, type Tank } from "@/lib/scuba-weight";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });

function ResultCard({ data, unit }: { data: ScubaResult; unit: "lb" | "kg" }) {
  const show = (kg: number) => (unit === "kg" ? `${n(kg)} kg` : `${n(kg / KG_PER_LB)} lb`);
  const other = (kg: number) => (unit === "kg" ? `${n(kg / KG_PER_LB)} lb` : `${n(kg)} kg`);
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Starting weight to try</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          About {show(data.totalKg)} <span className="text-lg font-normal text-[var(--color-muted)]">({other(data.totalKg)})</span>
        </p>
        <table className="mt-3 w-full text-left text-sm">
          <tbody>
            {data.steps.map((s, i) => (
              <tr key={i} className="border-t border-[var(--color-line)]">
                <td className="py-1 pr-3">{s.label}</td>
                <td className="py-1 text-right whitespace-nowrap">
                  {s.kg >= 0 ? "+" : "−"}
                  {show(Math.abs(s.kg))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-sm">
          This is a starting point, not a final number. PADI&rsquo;s next step is a buoyancy check: at the surface you should float at eye
          level holding a full breath and sink slowly when you exhale.
        </p>
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          The weight that is right for you. DAN calls these percentages &ldquo;simply starting points&rdquo;: body composition, the
          inherent buoyancy of your BC and suit, and your breathing all change the answer. Only an in-water buoyancy check, ideally with
          an instructor, settles it.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Sources: PADI weighting guideline; DAN Alert Diver &ldquo;Weight Up!&rdquo;; Scuba Diving magazine buoyancy calculator article. Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={PADI_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">PADI</a>
            {" · "}
            <a href={DAN_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">DAN</a>
            {" · "}
            <a href={SD_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">Scuba Diving</a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function ScubaWeightTool() {
  const [body, setBody] = useState("170");
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [suit, setSuit] = useState<Suit>("5-7mm");
  const [water, setWater] = useState<Water>("salt");
  const [tank, setTank] = useState<Tank>("al80");
  const [gear, setGear] = useState(String(DEFAULT_GEAR_LB));
  const ids = { b: useId(), u: useId(), s: useId(), w: useId(), t: useId(), g: useId() };

  let data: ScubaResult | null = null;
  let error: string | null = null;
  try {
    data = scubaWeight({ bodyWeight: body.trim() === "" ? NaN : Number(body), unit, suit, water, tank, gearWeight: gear.trim() === "" ? NaN : Number(gear) });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor={ids.b} className="mb-1.5 block font-medium">
            Your body weight
          </label>
          <input id={ids.b} type="number" inputMode="decimal" min="0" step="any" value={body} onChange={(e) => setBody(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.u} className="mb-1.5 block font-medium">
            Unit
          </label>
          <select
            id={ids.u}
            value={unit}
            onChange={(e) => {
              const nu = e.target.value as "lb" | "kg";
              if (nu !== unit) {
                const conv = (v: string) => (v.trim() === "" ? v : String(Math.round((nu === "kg" ? Number(v) * KG_PER_LB : Number(v) / KG_PER_LB) * 10) / 10));
                setBody(conv(body));
                setGear(conv(gear));
              }
              setUnit(nu);
            }}
            className={field}
          >
            <option value="lb">pounds</option>
            <option value="kg">kilograms</option>
          </select>
        </div>
      </div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={ids.s} className="mb-1.5 block font-medium">
            Exposure suit
          </label>
          <select id={ids.s} value={suit} onChange={(e) => setSuit(e.target.value as Suit)} className={field}>
            <option value="3mm">3 mm wetsuit</option>
            <option value="5-7mm">5–7 mm full wetsuit</option>
            <option value="drysuit">Dry suit</option>
          </select>
        </div>
        <div>
          <label htmlFor={ids.w} className="mb-1.5 block font-medium">
            Water
          </label>
          <select id={ids.w} value={water} onChange={(e) => setWater(e.target.value as Water)} className={field}>
            <option value="salt">Salt water (sea)</option>
            <option value="fresh">Fresh water (lake, quarry, pool)</option>
          </select>
        </div>
        <div>
          <label htmlFor={ids.t} className="mb-1.5 block font-medium">
            Tank
          </label>
          <select id={ids.t} value={tank} onChange={(e) => setTank(e.target.value as Tank)} className={field}>
            <option value="al80">Aluminum 80</option>
            <option value="steel-hp80">High-pressure steel 80</option>
          </select>
        </div>
      </div>
      {water === "fresh" && (
        <div className="mb-3">
          <label htmlFor={ids.g} className="mb-1.5 block font-medium">
            Your gear&rsquo;s weight without lead ({unit})
          </label>
          <input id={ids.g} type="number" inputMode="decimal" min="0" step="any" value={gear} onChange={(e) => setGear(e.target.value)} className={field} />
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Default {DEFAULT_GEAR_LB} lb is Scuba Diving magazine&rsquo;s example: aluminum 80 (32 lb), 7 mm wetsuit (8 lb), regulator, mask and fins (15 lb).
          </p>
        </div>
      )}
      <p className="mb-6 text-xs text-[var(--color-muted)]">The estimate updates as you change anything.</p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} unit={unit} />
        )}
      </div>
    </div>
  );
}
