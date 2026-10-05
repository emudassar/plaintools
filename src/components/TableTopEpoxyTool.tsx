"use client";

import { useState, useId } from "react";
import {
  calculateTableTopEpoxy,
  MAX_COAT_IN,
  NIST_HB44_URL,
  TOTALBOAT_GUIDE_URL,
  TOTALBOAT_URL,
  type EpoxyResult,
  type Shape,
  type Unit,
} from "@/lib/table-top-epoxy";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 2) => x.toLocaleString("en-US", { maximumFractionDigits: d });

const THICKNESSES = [
  { v: "0.0625", label: "1/16 in" },
  { v: "0.125", label: "1/8 in (typical flood coat)" },
  { v: "0.1875", label: "3/16 in" },
  { v: "0.25", label: "1/4 in" },
];

function ResultCard({ data, coats, ratio }: { data: EpoxyResult; coats: number; ratio: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {n(data.areaSqFt)} sq ft × {coats} coat{coats > 1 ? "s" : ""}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.gallons, 2)} gallons of mixed epoxy
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {n(data.quarts, 1)} quarts · {n(data.fluidOunces, 0)} fl oz · {n(data.millilitres / 1000, 2)} litres. At {ratio} by
          volume: {n(data.partA, 2)} gal resin + {n(data.partB, 2)} gal hardener.
        </p>
      </div>
      <div className="p-5 text-sm">
        {data.coatTooThick && (
          <div className="mb-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3">
            <p className="font-medium">Thicker than a single flood coat</p>
            <p className="mt-1 text-[var(--color-muted)]">
              TotalBoat&rsquo;s guide says each flood coat should be no thicker than {MAX_COAT_IN} inch to prevent overheating or
              distortion. Deeper pours need a deep-pour product and its own limits.
            </p>
          </div>
        )}
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The arithmetic</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          Area {n(data.topAreaSqIn, 0)} sq in top{data.edgeAreaSqIn > 0 ? ` + ${n(data.edgeAreaSqIn, 0)} sq in edges` : ""} × coat
          thickness × coats{data.volumeIn3 > 0 ? "" : ""} = {n(data.volumeIn3, 0)} cubic inches ÷ 231 cubic inches per gallon ={" "}
          {n(data.gallons, 3)} gal.
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          Porous or open-grain wood soaks up resin in the first coat, and some runs off the edges; neither has a published
          figure, so use the extra allowance. Follow your product&rsquo;s own mix ratio, pour depth and temperature limits.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Gallon = 231 in³ (NIST Handbook 44, Appendix C). Cross-check and ¼-inch coat limit: TotalBoat TableTop Epoxy product
            page and table top guide. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={TOTALBOAT_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              TotalBoat product page
            </a>{" "}
            ·{" "}
            <a href={TOTALBOAT_GUIDE_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              TotalBoat guide
            </a>{" "}
            ·{" "}
            <a href={NIST_HB44_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              NIST Handbook 44
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function TableTopEpoxyTool() {
  const [shape, setShape] = useState<Shape>("rectangle");
  const [unit, setUnit] = useState<Unit>("in");
  const [length, setLength] = useState("72");
  const [width, setWidth] = useState("36");
  const [coats, setCoats] = useState("1");
  const [thick, setThick] = useState("0.125");
  const [edges, setEdges] = useState(false);
  const [edge, setEdge] = useState("1.5");
  const [extra, setExtra] = useState("10");
  const [ra, setRa] = useState("1");
  const [rb, setRb] = useState("1");
  const ids = { s: useId(), u: useId(), l: useId(), w: useId(), c: useId(), t: useId(), e: useId(), x: useId(), ra: useId(), rb: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));

  let data: EpoxyResult | null = null;
  let error: string | null = null;
  try {
    data = calculateTableTopEpoxy({
      shape,
      unit,
      length: num(length),
      width: num(width),
      coats: num(coats),
      coatThicknessIn: num(thick),
      edgeHeight: edges ? num(edge) : null,
      extraPct: extra.trim() === "" ? 0 : Number(extra),
      ratioA: num(ra),
      ratioB: num(rb),
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
          {lbl(ids.s, "Table shape")}
          <select id={ids.s} value={shape} onChange={(e) => setShape(e.target.value as Shape)} className={field}>
            <option value="rectangle">Rectangle or square</option>
            <option value="round">Round</option>
          </select>
        </div>
        <div>
          {lbl(ids.u, "Units for size")}
          <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className={field}>
            <option value="in">inches</option>
            <option value="ft">feet</option>
            <option value="cm">centimetres</option>
          </select>
        </div>
        <div>
          {lbl(ids.l, shape === "round" ? "Diameter" : "Length")}
          {inp(ids.l, length, setLength)}
        </div>
        {shape === "rectangle" && (
          <div>
            {lbl(ids.w, "Width")}
            {inp(ids.w, width, setWidth)}
          </div>
        )}
        <div>
          {lbl(ids.t, "Thickness of each coat")}
          <select id={ids.t} value={thick} onChange={(e) => setThick(e.target.value)} className={field}>
            {THICKNESSES.map((t) => (
              <option key={t.v} value={t.v}>
                {t.label}
              </option>
            ))}
            <option value="0.375">3/8 in (over the 1/4 in coat limit)</option>
          </select>
        </div>
        <div>
          {lbl(ids.c, "Number of coats")}
          {inp(ids.c, coats, setCoats, "1")}
        </div>
        <div>
          {lbl(ids.x, "Extra for absorption, cups and drips (%)")}
          {inp(ids.x, extra, setExtra)}
        </div>
        <div>
          <span className="mb-1.5 block font-medium">Mix ratio by volume (resin : hardener)</span>
          <div className="flex items-center gap-2">
            <input aria-label="Resin parts" type="number" inputMode="decimal" min="0" step="any" value={ra} onChange={(e) => setRa(e.target.value)} className={field} />
            <span>:</span>
            <input aria-label="Hardener parts" type="number" inputMode="decimal" min="0" step="any" value={rb} onChange={(e) => setRb(e.target.value)} className={field} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={edges} onChange={(e) => setEdges(e.target.checked)} />
            Coat the edges too
          </label>
          {edges && (
            <div className="mt-2 max-w-xs">
              {lbl(ids.e, `Edge height (top thickness, ${unit})`)}
              {inp(ids.e, edge, setEdge)}
            </div>
          )}
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
          data && <ResultCard data={data} coats={num(coats)} ratio={`${ra}:${rb}`} />
        )}
      </div>
    </div>
  );
}
