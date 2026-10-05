"use client";

import { useState, useId } from "react";
import { calculateBettaTank, RSPCA_URL, STUDY_URL, type BettaResult } from "@/lib/betta-tank";
import type { TankShape } from "@/lib/aquarium-volume";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: BettaResult }) {
  const met = data.comparisons.filter((c) => c.meets).length;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">{data.fromDimensions ? "Water volume from your measurements" : "Tank volume"}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.litres)} litres · {n(data.gallons, 2)} US gallons
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {met === data.comparisons.length
            ? "That reaches all three published figures below, including the RSPCA's 20-litre ideal."
            : met === 0
              ? "That is below all three published figures below."
              : `That reaches ${met} of the 3 published figures below.`}
        </p>
      </div>
      <div className="p-5 text-sm">
        <table className="mb-5 w-full text-left">
          <thead className="text-[var(--color-muted)]">
            <tr>
              <th className="py-1 font-medium">Published figure</th>
              <th className="py-1 font-medium">This tank</th>
            </tr>
          </thead>
          <tbody>
            {data.comparisons.map((c) => (
              <tr key={c.benchmark.id} className="border-t border-[var(--color-line)]">
                <td className="py-1 pr-2">{c.benchmark.label}</td>
                <td className="py-1">{c.meets ? `Reaches it (+${n(c.differenceLitres)} L)` : `${n(-c.differenceLitres)} L short`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mb-5 text-[var(--color-muted)]">
          The RSPCA also says two male bettas &ldquo;should never be placed in the same tank&rdquo;, that small bowls are usually too small
          to fit a heater, and gives a water temperature of 24 to 26 °C.
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          Volume is only one part of a betta&rsquo;s needs: the RSPCA also lists filtration, heating and furnishings, and the study found
          furnishings mattered as well as size. Decorations take up some of the water volume.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Sources: RSPCA Australia Knowledgebase (updated 1 May 2024); Clark-Shen et al. (2024), Animal Welfare. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={RSPCA_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              RSPCA — Siamese fighting fish care
            </a>{" "}
            ·{" "}
            <a href={STUDY_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              &ldquo;Life beyond a jar&rdquo; (2024)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function BettaTankTool() {
  const [mode, setMode] = useState<"volume" | "dimensions">("dimensions");
  const [vol, setVol] = useState("5");
  const [vUnit, setVUnit] = useState<"gal" | "L">("gal");
  const [shape, setShape] = useState<TankShape>("rectangle");
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [a, setA] = useState("16");
  const [b, setB] = useState("8");
  const [h, setH] = useState("10");
  const [gap, setGap] = useState("1");
  const [sub, setSub] = useState("1");
  const ids = { m: useId(), v: useId(), s: useId(), u: useId(), a: useId(), b: useId(), h: useId(), g: useId(), x: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));
  const z = (x: string) => (x.trim() === "" ? 0 : Number(x));

  let data: BettaResult | null = null;
  let error: string | null = null;
  try {
    data =
      mode === "volume"
        ? calculateBettaTank({ mode, volume: num(vol), volumeUnit: vUnit })
        : calculateBettaTank({ mode, shape, unit, a: num(a), b: shape === "rectangle" ? num(b) : 0, height: num(h), gap: z(gap), substrate: z(sub) });
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
        <div className="sm:col-span-2">
          {lbl(ids.m, "I know the tank's")}
          <select id={ids.m} value={mode} onChange={(e) => setMode(e.target.value as "volume" | "dimensions")} className={field}>
            <option value="dimensions">inside dimensions</option>
            <option value="volume">volume in gallons or litres</option>
          </select>
        </div>
        {mode === "volume" ? (
          <>
            <div>
              {lbl(ids.v, "Tank volume")}
              {inp(ids.v, vol, setVol)}
            </div>
            <div>
              <label className="mb-1.5 block font-medium" htmlFor={ids.u}>
                Unit
              </label>
              <select id={ids.u} value={vUnit} onChange={(e) => setVUnit(e.target.value as "gal" | "L")} className={field}>
                <option value="gal">US gallons</option>
                <option value="L">litres</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              {lbl(ids.s, "Shape")}
              <select id={ids.s} value={shape} onChange={(e) => setShape(e.target.value as TankShape)} className={field}>
                <option value="rectangle">Rectangle / cube</option>
                <option value="cylinder">Round bowl or cylinder</option>
                <option value="hexagon">Hexagon</option>
              </select>
            </div>
            <div>
              {lbl(ids.u, "Units")}
              <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as "in" | "cm")} className={field}>
                <option value="in">inches</option>
                <option value="cm">centimetres</option>
              </select>
            </div>
            <div>
              {lbl(ids.a, shape === "rectangle" ? "Length" : shape === "cylinder" ? "Diameter" : "Width across flats")}
              {inp(ids.a, a, setA)}
            </div>
            {shape === "rectangle" && (
              <div>
                {lbl(ids.b, "Width (front to back)")}
                {inp(ids.b, b, setB)}
              </div>
            )}
            <div>
              {lbl(ids.h, "Height")}
              {inp(ids.h, h, setH)}
            </div>
            <div>
              {lbl(ids.g, "Gap from water to rim")}
              {inp(ids.g, gap, setGap)}
            </div>
            <div>
              {lbl(ids.x, "Gravel or sand depth")}
              {inp(ids.x, sub, setSub)}
            </div>
          </>
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
          data && <ResultCard data={data} />
        )}
      </div>
    </div>
  );
}
