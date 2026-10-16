"use client";

import { useState, useId } from "react";
import { firewood, CT_URL, NIST_HB130_URL, CORD_FT3, type FirewoodResult, type Unit } from "@/lib/firewood";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 2) => x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
const money = (x: number) => x.toLocaleString("en-US", { style: "currency", currency: "USD" });

function ResultCard({ data }: { data: FirewoodResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Volume of the stacked wood</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{n(data.cords)} cords</p>
        <p className="mt-1 text-[var(--color-muted)]">
          {n(data.ft3, 1)} cubic feet ({n(data.m3)} m³) · a full cord is {CORD_FT3} ft³
        </p>
      </div>
      <div className="p-5 text-sm">
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full">
            <tbody className="divide-y divide-[var(--color-line)]">
              <tr>
                <td className="px-3 py-2 font-medium">Full cords (128 ft³)</td>
                <td className="px-3 py-2">{n(data.cords)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Face cords (4 ft × 8 ft faces at this depth)</td>
                <td className="px-3 py-2">{n(data.faceCords)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">One face cord at {n(data.depthFt * 12, 1)} in deep</td>
                <td className="px-3 py-2">
                  {n(data.faceCordShareOfCord, 3)} of a full cord ({n(data.faceCordShareOfCord * CORD_FT3, 1)} ft³)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Cubic metres</td>
                <td className="px-3 py-2">{n(data.m3, 3)} m³</td>
              </tr>
              {data.pricePerCord !== null && (
                <tr>
                  <td className="px-3 py-2 font-medium">Price per full cord</td>
                  <td className="px-3 py-2">{money(data.pricePerCord)}</td>
                </tr>
              )}
              {data.totalPrice !== null && (
                <tr>
                  <td className="px-3 py-2 font-medium">Price for this wood</td>
                  <td className="px-3 py-2">{money(data.totalPrice)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          The cord is defined for wood that is &ldquo;ranked and well stowed&rdquo; — pieces touching, parallel and stacked compactly. A loosely
          thrown pile holds less wood than its outside measurements suggest, and this page cannot measure that. It also says nothing about
          moisture, species or heat value. A &ldquo;face cord&rdquo; or &ldquo;rick&rdquo; is not a legal unit for selling firewood under NIST
          Handbook 130 as adopted by many states.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: NIST Handbook 130, section 2.4 (Fireplace and Stove Wood) — cord = 128 ft³ ranked and well stowed — as reproduced in
            Connecticut&rsquo;s firewood regulations. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4">
            <a href={CT_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Connecticut DCP: firewood regulations
            </a>
            <a href={NIST_HB130_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              NIST Handbook 130
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function FirewoodTool() {
  const [length, setLength] = useState("8");
  const [height, setHeight] = useState("4");
  const [depth, setDepth] = useState("16");
  const [unit, setUnit] = useState<Unit>("ft");
  const [depthUnit, setDepthUnit] = useState<Unit>("in");
  const [stacks, setStacks] = useState("1");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState<"cord" | "face" | "total">("face");
  const ids = { l: useId(), h: useId(), d: useId(), u: useId(), du: useId(), s: useId(), p: useId(), pu: useId() };

  const num = (v: string) => (v.trim() === "" ? NaN : Number(v));
  const METRES: Record<Unit, number> = { ft: 0.3048, in: 0.0254, m: 1 };
  const toUnit = (v: number, from: Unit) => (v * METRES[from]) / METRES[unit];

  let data: FirewoodResult | null = null;
  let error: string | null = null;
  try {
    data = firewood({
      length: num(length),
      height: num(height),
      depth: toUnit(num(depth), depthUnit),
      unit,
      stacks: num(stacks),
      price: price.trim() === "" ? null : Number(price),
      priceUnit,
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={ids.l} className="mb-1.5 block font-medium">
            Stack length
          </label>
          <input id={ids.l} type="number" inputMode="decimal" min="0" step="any" value={length} onChange={(e) => setLength(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.h} className="mb-1.5 block font-medium">
            Stack height
          </label>
          <input id={ids.h} type="number" inputMode="decimal" min="0" step="any" value={height} onChange={(e) => setHeight(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.u} className="mb-1.5 block font-medium">
            Length and height in
          </label>
          <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className={field}>
            <option value="ft">feet</option>
            <option value="in">inches</option>
            <option value="m">metres</option>
          </select>
        </div>
      </div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={ids.d} className="mb-1.5 block font-medium">
            Depth (piece length)
          </label>
          <input id={ids.d} type="number" inputMode="decimal" min="0" step="any" value={depth} onChange={(e) => setDepth(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.du} className="mb-1.5 block font-medium">
            Depth in
          </label>
          <select id={ids.du} value={depthUnit} onChange={(e) => setDepthUnit(e.target.value as Unit)} className={field}>
            <option value="in">inches</option>
            <option value="ft">feet</option>
            <option value="m">metres</option>
          </select>
        </div>
        <div>
          <label htmlFor={ids.s} className="mb-1.5 block font-medium">
            Identical stacks
          </label>
          <input id={ids.s} type="number" inputMode="numeric" min="1" step="1" value={stacks} onChange={(e) => setStacks(e.target.value)} className={field} />
        </div>
      </div>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.p} className="mb-1.5 block font-medium">
            Price, USD (optional)
          </label>
          <input id={ids.p} type="number" inputMode="decimal" min="0" step="any" value={price} onChange={(e) => setPrice(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.pu} className="mb-1.5 block font-medium">
            That price is
          </label>
          <select id={ids.pu} value={priceUnit} onChange={(e) => setPriceUnit(e.target.value as "cord" | "face" | "total")} className={field}>
            <option value="face">per face cord (4 × 8 ft at this depth)</option>
            <option value="cord">per full cord</option>
            <option value="total">for the whole amount</option>
          </select>
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">Measure the wood as stacked, pieces tight and parallel. The result updates as you type.</p>
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
