"use client";

import { useState, useId } from "react";
import { calculateHoneyYield, JAR_SIZES, NHB_FAQ_URL, type YieldResult } from "@/lib/honey-yield";
import { NASS_HONEY_URL } from "@/lib/honey-nass";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: YieldResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Extracted honey</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.honeyLb)} lb · {n(data.honeyKg)} kg
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          About {n(data.gallons, 2)} gallons ({n(data.cups, 0)} cups), enough for {data.jars} full {data.jarOz}-oz jars.
          {data.perHiveLb !== null &&
            ` That is ${n(data.perHiveLb)} lb per hive; USDA's 2025 U.S. average was ${n(data.usAverageLb)} lb per honey-producing colony.`}
        </p>
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The arithmetic</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          Honey = weight before extraction − weight after, less any loss you entered. Gallons = pounds ÷ 12 and cups = ounces ÷ 12,
          because the National Honey Board gives a gallon of honey as about 12 pounds and a cup as 12 ounces. Jars are rounded down to
          full jars.
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          How much honey to leave the bees for winter — that depends on your climate and colony, and is not calculated here. The gallon
          figure is approximate: honey&rsquo;s weight per gallon varies with its water content.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Sources: National Honey Board FAQ (weight per gallon and cup); USDA NASS Honey, March 2026 (2025 yield). Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={NHB_FAQ_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              National Honey Board FAQ
            </a>{" "}
            ·{" "}
            <a href={NASS_HONEY_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              USDA NASS Honey (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function HoneyYieldTool() {
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [full, setFull] = useState("165");
  const [empty, setEmpty] = useState("95");
  const [loss, setLoss] = useState("3");
  const [hives, setHives] = useState("2");
  const [jar, setJar] = useState("16");
  const ids = { u: useId(), f: useId(), e: useId(), l: useId(), h: useId(), j: useId() };

  let data: YieldResult | null = null;
  let error: string | null = null;
  try {
    data = calculateHoneyYield({
      unit,
      fullWeight: full.trim() === "" ? NaN : Number(full),
      emptyWeight: empty.trim() === "" ? NaN : Number(empty),
      lossPct: loss.trim() === "" ? 0 : Number(loss),
      hives: hives.trim() === "" ? null : Number(hives),
      jarOz: Number(jar),
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const inp = (id: string, v: string, set: (s: string) => void, step = "any") => (
    <input id={id} type="number" inputMode="decimal" min="0" step={step} value={v} onChange={(e) => set(e.target.value)} className={field} />
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
          {lbl(ids.u, "Weighed in")}
          <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as "lb" | "kg")} className={field}>
            <option value="lb">pounds</option>
            <option value="kg">kilograms</option>
          </select>
        </div>
        <div>
          {lbl(ids.j, "Jar size (net weight)")}
          <select id={ids.j} value={jar} onChange={(e) => setJar(e.target.value)} className={field}>
            {JAR_SIZES.map((j) => (
              <option key={j.id} value={j.ozNet}>
                {j.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          {lbl(ids.f, `Supers before extraction (${unit})`)}
          {inp(ids.f, full, setFull)}
        </div>
        <div>
          {lbl(ids.e, `Same supers after extraction (${unit})`)}
          {inp(ids.e, empty, setEmpty)}
        </div>
        <div>
          {lbl(ids.l, "Loss to straining and spills (%)")}
          {inp(ids.l, loss, setLoss)}
        </div>
        <div>
          {lbl(ids.h, "Hives harvested (optional)")}
          {inp(ids.h, hives, setHives, "1")}
        </div>
      </div>
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
