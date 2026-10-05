"use client";

import { useState, useId } from "react";
import { calculateHorseCalories, LEVELS, MERCK_HORSE_URL, type HorseCalResult } from "@/lib/horse-calorie";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: HorseCalResult }) {
  const d = data.diet;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {n(data.weightKg, 0)} kg horse · {data.level.label}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.mcal, 1)} Mcal DE per day ({n(data.kcal, 0)} kcal)
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {data.level.note}.
          {d &&
            ` The feed you entered supplies ${n(d.mcal, 1)} Mcal — ${n(d.percent, 0)}% of the estimate (${d.difference >= 0 ? "+" : "−"}${n(Math.abs(d.difference), 1)} Mcal).`}
        </p>
      </div>
      <div className="p-5 text-sm">
        {data.outsideTableRange && (
          <p className="mb-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3 text-[var(--color-muted)]">
            Merck&rsquo;s table gives these equations for horses of 200–600 kg (about 440–1,320 lb). This horse is outside that range, so
            treat the figure with extra caution.
          </p>
        )}
        <h3 className="mb-2 font-semibold tracking-wide uppercase">Every activity level for this horse</h3>
        <table className="mb-5 w-full text-left">
          <tbody>
            {data.allLevels.map((l) => (
              <tr key={l.level.id} className={`border-t border-[var(--color-line)] ${l.level.id === data.level.id ? "font-semibold" : ""}`}>
                <td className="py-1 pr-2">{l.level.label}</td>
                <td className="py-1">{n(l.mcal, 1)} Mcal</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          These are population estimates. Body condition over time is the real test of whether a horse is getting enough energy. Growing,
          pregnant and lactating horses have different requirements that are not calculated here. A veterinarian or equine nutritionist
          should set a ration for a horse with a health condition.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Source: Merck Veterinary Manual (Feb 2026), from NRC Nutrient Requirements of Horses (2007). Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={MERCK_HORSE_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Merck Veterinary Manual — Nutritional Requirements of Horses
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function HorseCalorieTool() {
  const [weight, setWeight] = useState("1100");
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [level, setLevel] = useState("maintenance");
  const [hay, setHay] = useState("");
  const [hayE, setHayE] = useState("");
  const [grain, setGrain] = useState("");
  const [grainE, setGrainE] = useState("");
  const ids = { w: useId(), u: useId(), l: useId(), h: useId(), he: useId(), g: useId(), ge: useId() };
  const z = (x: string) => (x.trim() === "" ? 0 : Number(x));

  let data: HorseCalResult | null = null;
  let error: string | null = null;
  try {
    data = calculateHorseCalories({
      weight: weight.trim() === "" ? NaN : Number(weight),
      unit,
      levelId: level,
      feeds: [
        { lbPerDay: z(hay), mcalPerLb: z(hayE) },
        { lbPerDay: z(grain), mcalPerLb: z(grainE) },
      ],
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const inp = (id: string, v: string, set: (s: string) => void) => (
    <input id={id} type="number" inputMode="decimal" min="0" step="any" value={v} onChange={(e) => set(e.target.value)} className={field} />
  );
  const lbl = (id: string, text: string) => (
    <label htmlFor={id} className="mb-1.5 block font-medium">
      {text}
    </label>
  );

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <div>
          {lbl(ids.w, "Body weight")}
          <div className="flex gap-2">
            {inp(ids.w, weight, setWeight)}
            <select aria-label="Weight unit" value={unit} onChange={(e) => setUnit(e.target.value as "lb" | "kg")} className="rounded-md border border-[var(--color-line)] bg-white px-2">
              <option value="lb">lb</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>
        <div>
          {lbl(ids.l, "Activity")}
          <select id={ids.l} value={level} onChange={(e) => setLevel(e.target.value)} className={field}>
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <fieldset className="mb-2 rounded-md border border-[var(--color-line)] p-3">
        <legend className="px-1 text-sm font-medium">Optional: check a ration (energy from your hay test or feed tag)</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            {lbl(ids.h, "Hay, lb per day")}
            {inp(ids.h, hay, setHay)}
          </div>
          <div>
            {lbl(ids.he, "Hay energy, Mcal DE per lb")}
            {inp(ids.he, hayE, setHayE)}
          </div>
          <div>
            {lbl(ids.g, "Concentrate, lb per day")}
            {inp(ids.g, grain, setGrain)}
          </div>
          <div>
            {lbl(ids.ge, "Concentrate energy, Mcal DE per lb")}
            {inp(ids.ge, grainE, setGrainE)}
          </div>
        </div>
      </fieldset>
      <p className="mb-6 text-xs text-[var(--color-muted)]">The answer updates as you type; nothing is sent anywhere.</p>
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
