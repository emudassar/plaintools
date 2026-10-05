"use client";

import { useState, useId } from "react";
import { calculateMulch, CPSC_URL, MATERIALS, USE_ZONE_FT, type MulchResult } from "@/lib/playground-mulch";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function FallNote({ data }: { data: MulchResult }) {
  if (!data.fall) return null;
  const { heightFt, covered, anyMaterialCovers } = data.fall;
  const m = data.material;
  if (covered) {
    return (
      <p className="mb-4 text-[var(--color-muted)]">
        CPSC Table 2 lists {m.compressedIn} in of {m.label.replace("Wood", "wood").replace("Shredded", "shredded")} as protecting to a {m.protectsToFt} ft fall height,
        which covers the {n(heightFt)} ft you entered.
      </p>
    );
  }
  return (
    <div className="mb-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3">
      <p className="font-medium">Table 2 does not list this material for a {n(heightFt)} ft fall height</p>
      <p className="mt-1 text-[var(--color-muted)]">
        It lists {m.compressedIn} in of {m.label.replace("Wood", "wood").replace("Shredded", "shredded")} as protecting to {m.protectsToFt} ft and gives no deeper
        figure for it.{" "}
        {anyMaterialCovers
          ? `In the table, only ${MATERIALS.filter((x) => heightFt <= x.protectsToFt)
              .map((x) => x.label.replace("Wood", "wood").replace("Shredded", "shredded"))
              .join(" and ")} reach ${n(heightFt)} ft.`
          : "No material in the table reaches that height; the handbook points to surfacing tested to ASTM F1292 for its critical height."}
      </p>
    </div>
  );
}

function ResultCard({ data, zone }: { data: MulchResult; zone: boolean }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {data.material.label} over {n(data.areaLengthFt)} × {n(data.areaWidthFt)} ft ({n(data.areaSqft, 0)} sq ft)
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.cubicYards, 2)} cubic yards{data.bags !== null ? ` · ${data.bags} bags` : ""}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {n(data.cubicFeet, 0)} cu ft ({n(data.cubicMetres, 2)} m³) at an initial fill of {n(data.initialIn, 2)} in
          {data.material.compresses
            ? `, so it settles to the ${data.compressedIn} in minimum after compressing 25%.`
            : ` (CPSC notes rubber does not compress like other loose fill).`}
          {zone && ` Includes a ${USE_ZONE_FT} ft use zone on every side.`}
        </p>
      </div>
      <div className="p-5 text-sm">
        <FallNote data={data} />
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The arithmetic</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          Minimum compressed depth {data.compressedIn} in (Table 2)
          {data.material.compresses ? ` ÷ 0.75 = ${n(data.initialIn, 2)} in initial fill` : ""}. {n(data.areaSqft, 0)} sq ft ×{" "}
          {n(data.initialIn, 2)} ÷ 12 = {n(data.cubicFeet, 0)} cu ft ÷ 27 = {n(data.cubicYards, 2)} cu yd.
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          This is a quantity based on CPSC&rsquo;s minimum depths, not a safety assessment. Use zones differ by equipment —
          swings and slides need more than {USE_ZONE_FT} ft — and engineered wood fiber or rubber products should come with
          the maker&rsquo;s ASTM F1292 test data and depths. Loose fill needs regular topping up to stay at depth.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: U.S. CPSC Public Playground Safety Handbook (Pub. 325), Table 2 and §2.4.2.2; use zone §5.3.10.
            Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={CPSC_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              CPSC Public Playground Safety Handbook (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function PlaygroundMulchTool() {
  const [length, setLength] = useState("20");
  const [width, setWidth] = useState("30");
  const [zone, setZone] = useState(false);
  const [material, setMaterial] = useState("wood-chips");
  const [fall, setFall] = useState("");
  const [bag, setBag] = useState("");
  const ids = { l: useId(), w: useId(), m: useId(), f: useId(), b: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));
  const opt = (x: string) => (x.trim() === "" ? null : Number(x));

  let data: MulchResult | null = null;
  let error: string | null = null;
  try {
    data = calculateMulch({ lengthFt: num(length), widthFt: num(width), addUseZone: zone, material, fallHeightFt: opt(fall), bagCuFt: opt(bag) });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const inp = (id: string, v: string, set: (s: string) => void) => (
    <input id={id} type="number" inputMode="decimal" min="0" step="any" value={v} onChange={(e) => set(e.target.value)} className={field} />
  );

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={ids.l} className="mb-1.5 block font-medium">
              Length (ft)
            </label>
            {inp(ids.l, length, setLength)}
          </div>
          <div>
            <label htmlFor={ids.w} className="mb-1.5 block font-medium">
              Width (ft)
            </label>
            {inp(ids.w, width, setWidth)}
          </div>
        </div>
        <div>
          <label htmlFor={ids.m} className="mb-1.5 block font-medium">
            Surfacing material
          </label>
          <select id={ids.m} value={material} onChange={(e) => setMaterial(e.target.value)} className={field}>
            {MATERIALS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — {m.compressedIn} in, to {m.protectsToFt} ft
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.f} className="mb-1.5 block font-medium">
            Highest fall height, ft <span className="font-normal text-[var(--color-muted)]">(optional check)</span>
          </label>
          {inp(ids.f, fall, setFall)}
        </div>
        <div>
          <label htmlFor={ids.b} className="mb-1.5 block font-medium">
            Bag size, cu ft <span className="font-normal text-[var(--color-muted)]">(optional)</span>
          </label>
          {inp(ids.b, bag, setBag)}
        </div>
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={zone} onChange={(e) => setZone(e.target.checked)} />
            These are the equipment&rsquo;s own dimensions — add CPSC&rsquo;s general {USE_ZONE_FT} ft use zone on every side
          </label>
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
          data && <ResultCard data={data} zone={zone} />
        )}
      </div>
    </div>
  );
}
