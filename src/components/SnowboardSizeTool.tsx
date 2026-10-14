"use client";

import { useState, useId } from "react";
import { snowboardSize, ADULT, KIDS, WIDE, JONES_URL, type SnowboardResult, type BootSystem, type Level, type Style } from "@/lib/snowboard-size";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: SnowboardResult }) {
  const table = data.rider === "adult" ? ADULT : KIDS;
  const matched = new Set(data.rows.map((r) => r.sizeLabel));
  const headline =
    data.middle !== null
      ? data.rows.length > 1
        ? `About ${n(data.middle)} cm (range ${data.spanMin}–${data.spanMax} cm)`
        : `${data.spanMin}–${data.spanMax} cm`
      : `${data.spanMin} cm or longer`;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {data.rider === "adult" ? "Adult" : "Kid / youth"} · {n(data.weightLb, 0)} lb ({n(data.weightKg)} kg)
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">Board length: {headline}</p>
        <p className="mt-1 text-[var(--color-muted)]">
          {data.rows.length > 1
            ? `Your weight falls in ${data.rows.length} of Jones's ranges (${data.rows.map((r) => r.sizeLabel).join(", ")} cm). Jones says: "When your weight falls into multiple size ranges, select the middle size" — the centre of those ranges is shown.`
            : data.middle === null && data.rider === "kid"
              ? "Jones's chart prints this row's upper end as \"130-45\", an evident misprint, so only the lower end is shown."
              : `One range on Jones's chart matches your weight.`}
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          <li>{data.levelNote}</li>
          <li>{data.styleNote}</li>
        </ul>
        {data.width && (
          <p className="mt-3 font-medium">
            {data.width.wide
              ? `Width: a wide board — Jones recommends a waist width of at least ${data.width.minWaistCm} cm for this boot size to avoid toe and heel drag.`
              : "Width: at or below Men's US 10 / Women's US 11.5 / UK 9 / EU 44, Jones says any regular-width board works."}
          </p>
        )}
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">Jones&rsquo;s {data.rider === "adult" ? "men's & women's" : "kids & youth"} chart</h3>
        <div className="mb-5 max-h-72 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white text-[var(--color-muted)]">
              <tr>
                <th className="py-1 font-medium">Rider weight (lbs)</th>
                <th className="py-1 font-medium">(kg)</th>
                <th className="py-1 font-medium">Board size (cm)</th>
              </tr>
            </thead>
            <tbody>
              {table.map((r) => (
                <tr key={r.sizeLabel} className={`border-t border-[var(--color-line)] ${matched.has(r.sizeLabel) ? "bg-[var(--color-accent-soft)] font-semibold" : ""}`}>
                  <td className="py-1">{r.lbLabel}</td>
                  <td className="py-1">{r.kgLabel}</td>
                  <td className="py-1">{r.sizeLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <details className="mb-5">
          <summary className="cursor-pointer font-semibold tracking-wide uppercase">Wide board chart (boot size → minimum waist width)</summary>
          <table className="mt-2 w-full text-left">
            <thead className="text-[var(--color-muted)]">
              <tr>
                <th className="py-1 font-medium">Men&rsquo;s US</th>
                <th className="py-1 font-medium">Women&rsquo;s US</th>
                <th className="py-1 font-medium">UK</th>
                <th className="py-1 font-medium">EU</th>
                <th className="py-1 font-medium">Min waist</th>
              </tr>
            </thead>
            <tbody>
              {WIDE.map((r) => (
                <tr key={r.menUs} className={`border-t border-[var(--color-line)] ${data.width?.row === r ? "bg-[var(--color-accent-soft)] font-semibold" : ""}`}>
                  <td className="py-1">
                    {r.menUs}
                    {r.plus ? "+" : ""}
                  </td>
                  <td className="py-1">
                    {r.womenUs}
                    {r.plus ? "+" : ""}
                  </td>
                  <td className="py-1">
                    {r.uk}
                    {r.plus ? "+" : ""}
                  </td>
                  <td className="py-1">{r.eu}</td>
                  <td className="py-1">{r.minWaistCm} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          The size for one particular board. This is Jones&rsquo;s general chart; each model, and every other brand, publishes its own
          weight range per length, and shapes with extra volume can be ridden shorter. Check the chart for the exact board.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Source: Jones Snowboards size guide (weight charts, wide-board chart and sizing rules). Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={JONES_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Jones Snowboards size guide
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function SnowboardSizeTool() {
  const [rider, setRider] = useState<"adult" | "kid">("adult");
  const [weight, setWeight] = useState("165");
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [level, setLevel] = useState<Level>("intermediate");
  const [style, setStyle] = useState<Style>("all-mountain");
  const [boot, setBoot] = useState("10");
  const [bootSystem, setBootSystem] = useState<BootSystem>("men-us");
  const ids = { r: useId(), w: useId(), u: useId(), l: useId(), s: useId(), b: useId(), bs: useId() };

  let data: SnowboardResult | null = null;
  let error: string | null = null;
  try {
    data = snowboardSize({
      rider,
      weight: weight.trim() === "" ? NaN : Number(weight),
      unit,
      level,
      style,
      boot: boot.trim() === "" ? null : Number(boot),
      bootSystem,
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={ids.r} className="mb-1.5 block font-medium">
            Rider
          </label>
          <select
            id={ids.r}
            value={rider}
            onChange={(e) => {
              const v = e.target.value as "adult" | "kid";
              setRider(v);
              setWeight(v === "kid" ? (unit === "lb" ? "60" : "27") : unit === "lb" ? "165" : "75");
              if (v === "kid") setBoot("");
            }}
            className={field}
          >
            <option value="adult">Adult (men &amp; women)</option>
            <option value="kid">Kid / youth</option>
          </select>
        </div>
        <div>
          <label htmlFor={ids.w} className="mb-1.5 block font-medium">
            Rider weight
          </label>
          <input id={ids.w} type="number" inputMode="decimal" min="0" step="any" value={weight} onChange={(e) => setWeight(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.u} className="mb-1.5 block font-medium">
            Weight unit
          </label>
          <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as "lb" | "kg")} className={field}>
            <option value="lb">pounds</option>
            <option value="kg">kilograms</option>
          </select>
        </div>
      </div>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.l} className="mb-1.5 block font-medium">
            Ability
          </label>
          <select id={ids.l} value={level} onChange={(e) => setLevel(e.target.value as Level)} className={field}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate to advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        <div>
          <label htmlFor={ids.s} className="mb-1.5 block font-medium">
            Riding style
          </label>
          <select id={ids.s} value={style} onChange={(e) => setStyle(e.target.value as Style)} className={field}>
            <option value="all-mountain">All-mountain</option>
            <option value="freeride">Freeride / big mountain</option>
            <option value="powder">Powder</option>
            <option value="freestyle">Freestyle / park</option>
          </select>
        </div>
      </div>
      <div className="mb-2 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor={ids.b} className="mb-1.5 block font-medium">
            Boot size (optional — for board width)
          </label>
          <input id={ids.b} type="number" inputMode="decimal" min="0" step="0.5" value={boot} onChange={(e) => setBoot(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.bs} className="mb-1.5 block font-medium">
            Boot size system
          </label>
          <select id={ids.bs} value={bootSystem} onChange={(e) => setBootSystem(e.target.value as BootSystem)} className={field}>
            <option value="men-us">Men&rsquo;s US</option>
            <option value="women-us">Women&rsquo;s US</option>
            <option value="uk">UK</option>
            <option value="eu">EU</option>
          </select>
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">Jones sizes boards by weight, not height. The result updates as you type.</p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">No size for that input</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} />
        )}
      </div>
    </div>
  );
}
