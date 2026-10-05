"use client";

import { useState, useId } from "react";
import { calculateAquariumVolume, NIST_HB44_URL, USGS_URL, type AquariumResult, type TankShape } from "@/lib/aquarium-volume";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });

const SHAPES: { id: TankShape; label: string; a: string; b?: string; bow?: boolean }[] = [
  { id: "rectangle", label: "Rectangle / cube", a: "Length", b: "Width (front to back)" },
  { id: "bowfront", label: "Bow front", a: "Length", b: "Depth at the ends", bow: true },
  { id: "cylinder", label: "Cylinder", a: "Diameter" },
  { id: "hexagon", label: "Hexagon", a: "Width across flats" },
  { id: "corner", label: "Quarter-circle corner", a: "Back side length" },
  { id: "pentagon", label: "Pentagon corner", a: "Back side length", b: "Length cut off each back side" },
];

function ResultCard({ data, unit }: { data: AquariumResult; unit: "in" | "cm" }) {
  const lost = data.fullGallons - data.waterGallons;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Water volume</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.waterGallons)} US gallons · {n(data.waterLitres)} litres
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          Water weighs about {n(data.waterWeightLb, 0)} lb ({n(data.waterWeightKg, 0)} kg), before glass, stand, rock or substrate.
          {lost > 0.05 && ` Filled to the rim the tank holds ${n(data.fullGallons)} gal (${n(data.fullLitres)} L).`}
        </p>
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The arithmetic</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          Footprint {n(data.footprintSqIn)} sq in × water height {n(data.waterHeightIn, 2)} in ÷ 231 cubic inches per gallon ={" "}
          {n(data.waterGallons, 2)} gal. Litres = gallons × 3.785. Weight = gallons × 8.34 lb.
          {unit === "cm" && " Centimetres are converted at 2.54 cm per inch."}
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          Use inside measurements: outside measurements include the glass and overstate the volume. Rock, wood and equipment
          displace water, so the real water volume is lower. Saltwater is slightly heavier than the fresh-water weight shown.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Gallon = 231 in³ = 3.785411784 L (NIST Handbook 44). Weight 8.34 lb per gallon (USGS). Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={NIST_HB44_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              NIST Handbook 44
            </a>{" "}
            ·{" "}
            <a href={USGS_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              USGS Water Science School
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function AquariumVolumeTool() {
  const [shape, setShape] = useState<TankShape>("rectangle");
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [a, setA] = useState("48");
  const [b, setB] = useState("13");
  const [bow, setBow] = useState("3");
  const [h, setH] = useState("21");
  const [gap, setGap] = useState("1");
  const [sub, setSub] = useState("2");
  const ids = { s: useId(), u: useId(), a: useId(), b: useId(), w: useId(), h: useId(), g: useId(), x: useId() };
  const def = SHAPES.find((s) => s.id === shape)!;
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));
  const z = (x: string) => (x.trim() === "" ? 0 : Number(x));

  let data: AquariumResult | null = null;
  let error: string | null = null;
  try {
    data = calculateAquariumVolume({ shape, unit, a: num(a), b: def.b ? num(b) : 0, bow: def.bow ? num(bow) : 0, height: num(h), gap: z(gap), substrate: z(sub) });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const inp = (id: string, v: string, set: (s: string) => void) => (
    <input id={id} type="number" inputMode="decimal" min="0" step="any" value={v} onChange={(e) => set(e.target.value)} className={field} />
  );
  const lbl = (id: string, text: string) => (
    <label htmlFor={id} className="mb-1.5 block font-medium">
      {text} ({unit})
    </label>
  );

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.s} className="mb-1.5 block font-medium">
            Tank shape
          </label>
          <select id={ids.s} value={shape} onChange={(e) => setShape(e.target.value as TankShape)} className={field}>
            {SHAPES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.u} className="mb-1.5 block font-medium">
            Units (inside measurements)
          </label>
          <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as "in" | "cm")} className={field}>
            <option value="in">inches</option>
            <option value="cm">centimetres</option>
          </select>
        </div>
        <div>
          {lbl(ids.a, def.a)}
          {inp(ids.a, a, setA)}
        </div>
        {def.b && (
          <div>
            {lbl(ids.b, def.b)}
            {inp(ids.b, b, setB)}
          </div>
        )}
        {def.bow && (
          <div>
            {lbl(ids.w, "How far the front bows out")}
            {inp(ids.w, bow, setBow)}
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
          {lbl(ids.x, "Substrate depth")}
          {inp(ids.x, sub, setSub)}
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
          data && <ResultCard data={data} unit={unit} />
        )}
      </div>
    </div>
  );
}
