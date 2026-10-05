"use client";

import { useState, useId } from "react";
import {
  calculateResinVolume,
  EPOXACAST_URL,
  PRESETS,
  SMOOTHCAST_URL,
  WEST_URL,
  type LenUnit,
  type MoldShape,
  type ResinResult,
} from "@/lib/resin-volume";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 2) => x.toLocaleString("en-US", { maximumFractionDigits: d });

const SHAPES: { v: MoldShape; label: string }[] = [
  { v: "box", label: "Rectangle / box (coaster, tray, block)" },
  { v: "cylinder", label: "Cylinder (round coaster, puck)" },
  { v: "sphere", label: "Sphere (full ball mold)" },
  { v: "hemisphere", label: "Dome / half sphere" },
  { v: "cone", label: "Cone or pyramid-like point" },
  { v: "measured", label: "I measured it with water" },
];

function ResultCard({ data, pieces, sg, sgSource, basis }: { data: ResinResult; pieces: number; sg: number; sgSource: string; basis: "volume" | "weight" }) {
  const unitAB = basis === "volume" ? "ml" : "g";
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {pieces} piece{pieces > 1 ? "s" : ""} · {n(data.pieceMl, 1)} ml each
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.totalMl, 0)} ml of mixed resin ({n(data.totalFlOz, 1)} fl oz)
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          Weighs about {n(data.grams, 0)} g ({n(data.ounces, 1)} oz, {n(data.pounds, 2)} lb) at specific gravity {sg}. Split
          by {basis}: {n(data.partA, 1)} {unitAB} part A + {n(data.partB, 1)} {unitAB} part B.
        </p>
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The arithmetic</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          Mold volume × pieces × (1 + extra %) = {n(data.totalMl, 1)} ml = {n(data.totalIn3, 2)} cubic inches. Weight = ml ×
          specific gravity ({sg} g per ml) = {n(data.grams, 1)} g. Specific gravity source: {sgSource}.
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          The shapes are ideal solids; a real mold with rounded corners or a draft angle holds a little less, and a detailed one
          is best measured with water. Pour depth, heat build-up and cure time are set by your product&rsquo;s instructions.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Volume is solid geometry (1 cm³ = 1 ml). Specific gravities from the makers&rsquo; technical data sheets. Retrieved{" "}
            {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={EPOXACAST_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Smooth-On EpoxAcast 690/692
            </a>{" "}
            ·{" "}
            <a href={SMOOTHCAST_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Smooth-Cast 300
            </a>{" "}
            ·{" "}
            <a href={WEST_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              West System 105/207
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function ResinVolumeTool() {
  const [shape, setShape] = useState<MoldShape>("box");
  const [unit, setUnit] = useState<LenUnit>("cm");
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("10");
  const [diameter, setDiameter] = useState("10");
  const [height, setHeight] = useState("1");
  const [measured, setMeasured] = useState("250");
  const [pieces, setPieces] = useState("1");
  const [extra, setExtra] = useState("10");
  const [preset, setPreset] = useState(PRESETS[0].id);
  const [customSg, setCustomSg] = useState("1.1");
  const [ra, setRa] = useState("1");
  const [rb, setRb] = useState("1");
  const [basis, setBasis] = useState<"volume" | "weight">("volume");
  const ids = { s: useId(), u: useId(), l: useId(), w: useId(), d: useId(), h: useId(), m: useId(), p: useId(), x: useId(), r: useId(), c: useId(), b: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));

  const chosen = PRESETS.find((p) => p.id === preset);
  const sg = chosen ? chosen.sg : num(customSg);
  const sgSource = chosen ? chosen.source : "your product's data sheet (entered by you)";

  let data: ResinResult | null = null;
  let error: string | null = null;
  try {
    data = calculateResinVolume({
      shape,
      unit,
      length: num(length),
      width: num(width),
      diameter: num(diameter),
      height: num(height),
      measuredMl: num(measured),
      pieces: num(pieces),
      extraPct: extra.trim() === "" ? 0 : Number(extra),
      specificGravity: sg,
      ratioA: num(ra),
      ratioB: num(rb),
      ratioBasis: basis,
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
  const round = shape === "cylinder" || shape === "sphere" || shape === "hemisphere" || shape === "cone";
  const needsHeight = shape === "box" || shape === "cylinder" || shape === "cone";

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <div>
          {lbl(ids.s, "Mold shape")}
          <select id={ids.s} value={shape} onChange={(e) => setShape(e.target.value as MoldShape)} className={field}>
            {SHAPES.map((s) => (
              <option key={s.v} value={s.v}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        {shape === "measured" ? (
          <div>
            {lbl(ids.m, "Water the mold holds (ml)")}
            {inp(ids.m, measured, setMeasured)}
          </div>
        ) : (
          <div>
            {lbl(ids.u, "Units for size")}
            <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as LenUnit)} className={field}>
              <option value="cm">centimetres</option>
              <option value="mm">millimetres</option>
              <option value="in">inches</option>
            </select>
          </div>
        )}
        {shape === "box" && (
          <>
            <div>
              {lbl(ids.l, "Inside length")}
              {inp(ids.l, length, setLength)}
            </div>
            <div>
              {lbl(ids.w, "Inside width")}
              {inp(ids.w, width, setWidth)}
            </div>
          </>
        )}
        {round && (
          <div>
            {lbl(ids.d, "Inside diameter")}
            {inp(ids.d, diameter, setDiameter)}
          </div>
        )}
        {needsHeight && (
          <div>
            {lbl(ids.h, shape === "cone" ? "Height to the point" : "Depth of resin")}
            {inp(ids.h, height, setHeight)}
          </div>
        )}
        <div>
          {lbl(ids.p, "Number of pieces")}
          {inp(ids.p, pieces, setPieces, "1")}
        </div>
        <div>
          {lbl(ids.x, "Extra for cups and spills (%)")}
          {inp(ids.x, extra, setExtra)}
        </div>
        <div className="sm:col-span-2">
          {lbl(ids.r, "Resin (for weight)")}
          <select id={ids.r} value={preset} onChange={(e) => setPreset(e.target.value)} className={field}>
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
            <option value="custom">Other: enter specific gravity from my data sheet</option>
          </select>
          {preset === "custom" && (
            <div className="mt-2 max-w-xs">
              {lbl(ids.c, "Specific gravity (g/cm³), mixed")}
              {inp(ids.c, customSg, setCustomSg)}
            </div>
          )}
        </div>
        <div>
          <span className="mb-1.5 block font-medium">Mix ratio (part A : part B)</span>
          <div className="flex items-center gap-2">
            <input aria-label="Part A" type="number" inputMode="decimal" min="0" step="any" value={ra} onChange={(e) => setRa(e.target.value)} className={field} />
            <span>:</span>
            <input aria-label="Part B" type="number" inputMode="decimal" min="0" step="any" value={rb} onChange={(e) => setRb(e.target.value)} className={field} />
          </div>
        </div>
        <div>
          {lbl(ids.b, "Ratio is measured by")}
          <select id={ids.b} value={basis} onChange={(e) => setBasis(e.target.value as "volume" | "weight")} className={field}>
            <option value="volume">volume (ml)</option>
            <option value="weight">weight (grams)</option>
          </select>
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
          data && <ResultCard data={data} pieces={num(pieces)} sg={sg} sgSource={sgSource} basis={basis} />
        )}
      </div>
    </div>
  );
}
