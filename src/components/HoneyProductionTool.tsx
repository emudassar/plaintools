"use client";

import { useState, useId } from "react";
import { calculateHoneyProduction, type PriceBasis, type ProductionResult } from "@/lib/honey-production";
import { NASS_2025, NASS_HONEY_RELEASED, NASS_HONEY_URL, NASS_HONEY_YEAR } from "@/lib/honey-nass";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });
const usd = (x: number) => x.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function ResultCard({ data, colonies }: { data: ProductionResult; colonies: number }) {
  const s = data.state;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {colonies} colonies × {n(data.yieldLb)} lb {data.yieldFromNass ? `(${s.name} ${NASS_HONEY_YEAR} average)` : "(your yield)"}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.productionLb, 0)} lb of honey · worth about {usd(data.value)}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {n(data.productionKg, 0)} kg, about {n(data.gallons)} gallons. Value at ${data.pricePerLb.toFixed(2)} per pound ({data.priceLabel}).
        </p>
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">
          {s.name} in USDA&rsquo;s {NASS_HONEY_YEAR} figures
        </h3>
        <p className="mb-5 text-[var(--color-muted)]">
          {n(s.coloniesThousand * 1000, 0)} honey-producing colonies, {n(s.yieldLb)} lb per colony, {n(s.productionThousandLb * 1000, 0)} lb produced, average
          price ${s.pricePerLb.toFixed(2)} per pound.
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          What your own colonies will make. State averages hide large differences between years, locations, forage and management, and
          NASS counts only colonies from which honey was harvested. Prices vary by colour class and how the honey is sold.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: USDA NASS, Honey (released {NASS_HONEY_RELEASED}), {NASS_HONEY_YEAR} state table and U.S. price by marketing channel. Gallons at 12 lb
            per gallon (National Honey Board). Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={NASS_HONEY_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              USDA NASS Honey report (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function HoneyProductionTool() {
  const [stateId, setStateId] = useState("US");
  const [colonies, setColonies] = useState("10");
  const [own, setOwn] = useState("");
  const [basis, setBasis] = useState<PriceBasis>("state");
  const [price, setPrice] = useState("");
  const ids = { s: useId(), c: useId(), o: useId(), b: useId(), p: useId() };
  const col = colonies.trim() === "" ? NaN : Number(colonies);

  let data: ProductionResult | null = null;
  let error: string | null = null;
  try {
    data = calculateHoneyProduction({
      stateId,
      colonies: col,
      ownYieldLb: own.trim() === "" ? null : Number(own),
      priceBasis: basis,
      customPrice: price.trim() === "" ? null : Number(price),
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const lbl = (id: string, text: string) => (
    <label htmlFor={id} className="mb-1.5 block font-medium">
      {text}
    </label>
  );

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <div>
          {lbl(ids.s, "State")}
          <select id={ids.s} value={stateId} onChange={(e) => setStateId(e.target.value)} className={field}>
            {NASS_2025.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.yieldLb} lb/colony
              </option>
            ))}
          </select>
        </div>
        <div>
          {lbl(ids.c, "Number of colonies")}
          <input id={ids.c} type="number" inputMode="numeric" min="1" step="1" value={colonies} onChange={(e) => setColonies(e.target.value)} className={field} />
        </div>
        <div>
          {lbl(ids.o, "Your own yield per colony, lb (optional)")}
          <input id={ids.o} type="number" inputMode="decimal" min="0" step="any" value={own} onChange={(e) => setOwn(e.target.value)} className={field} placeholder="Leave blank for the state average" />
        </div>
        <div>
          {lbl(ids.b, "Value at")}
          <select id={ids.b} value={basis} onChange={(e) => setBasis(e.target.value as PriceBasis)} className={field}>
            <option value="state">State average price (all channels)</option>
            <option value="wholesale">U.S. wholesale price (co-op and private)</option>
            <option value="retail">U.S. retail price</option>
            <option value="custom">My own price</option>
          </select>
        </div>
        {basis === "custom" && (
          <div>
            {lbl(ids.p, "Your price per pound ($)")}
            <input id={ids.p} type="number" inputMode="decimal" min="0" step="any" value={price} onChange={(e) => setPrice(e.target.value)} className={field} />
          </div>
        )}
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">The answer updates as you type; nothing is sent anywhere.</p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} colonies={col} />
        )}
      </div>
    </div>
  );
}
