"use client";

import { useState, useId } from "react";
import { calculateGridfinity, GRIDFINITY_SPEC_URL, HEIGHT_UNIT_MM, LIP_MM, UNIT_MM, type GridResult } from "@/lib/gridfinity";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data, lip }: { data: GridResult; lip: boolean }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Drawer {n(data.widthMm)} × {n(data.depthMm)} mm
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {data.unitsX} × {data.unitsY} grid ({data.cells} units)
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          The grid covers {n(data.gridWidthMm)} × {n(data.gridDepthMm)} mm, leaving {n(data.marginXEachMm)} mm each side across and{" "}
          {n(data.marginYEachMm)} mm front and back.
          {data.maxHeightUnits !== null &&
            (data.maxHeightUnits > 0
              ? ` Tallest bin that fits: ${data.maxHeightUnits}u (${n(data.binHeightMm!)} mm${lip ? " including the stacking lip" : ""}).`
              : " The drawer is too shallow for even a 1u bin at this setting.")}
        </p>
      </div>
      <div className="p-5 text-sm">
        {data.plates && (
          <>
            <h3 className="mb-2 font-semibold tracking-wide uppercase">Baseplate pieces for your print bed</h3>
            <p className="mb-5 text-[var(--color-muted)]">
              Up to {data.plates.maxPerSide} × {data.plates.maxPerSide} units fit on the bed. Print {data.plates.count} piece
              {data.plates.count > 1 ? "s" : ""}: columns of {data.plates.piecesX.join(" + ")} units across × rows of{" "}
              {data.plates.piecesY.join(" + ")} units deep.
            </p>
          </>
        )}
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The arithmetic</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          Units = drawer size ÷ {UNIT_MM} mm, rounded down. Leftover = size − units × {UNIT_MM}, split between both sides. Height
          units = (drawer height − floor{lip ? ` − ${LIP_MM} mm lip` : ""}) ÷ {HEIGHT_UNIT_MM} mm, rounded down.
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          Printers and filaments shrink differently, and drawers are rarely perfectly square — measure the narrowest point.
          Many people fill the leftover margin with spacers; that is a design choice, not part of the spec.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: Gridfinity Design Reference v5 (gridfinity.xyz; Gridfinity by Zack Freedman, CC BY-NC-SA). Retrieved{" "}
            {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={GRIDFINITY_SPEC_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Gridfinity specification
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function GridfinityTool() {
  const [unit, setUnit] = useState<"mm" | "in">("mm");
  const [w, setW] = useState("500");
  const [d, setD] = useState("420");
  const [h, setH] = useState("80");
  const [bed, setBed] = useState("220");
  const [lip, setLip] = useState(true);
  const [floor, setFloor] = useState("0");
  const ids = { u: useId(), w: useId(), d: useId(), h: useId(), b: useId(), f: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));
  const opt = (x: string) => (x.trim() === "" ? null : Number(x));

  let data: GridResult | null = null;
  let error: string | null = null;
  try {
    data = calculateGridfinity({ width: num(w), depth: num(d), height: opt(h), unit, bedMm: opt(bed), stackingLip: lip, floorMm: floor.trim() === "" ? 0 : Number(floor) });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const inp = (id: string, v: string, set: (s: string) => void) => (
    <input id={id} type="number" inputMode="decimal" min="0" step="any" value={v} onChange={(e) => set(e.target.value)} className={field} />
  );
  const lbl = (id: string, text: string, optional = false) => (
    <label htmlFor={id} className="mb-1.5 block font-medium">
      {text} {optional && <span className="font-normal text-[var(--color-muted)]">(optional)</span>}
    </label>
  );

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <div>
          {lbl(ids.u, "Units for the drawer")}
          <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as "mm" | "in")} className={field}>
            <option value="mm">millimetres</option>
            <option value="in">inches</option>
          </select>
        </div>
        <div>
          {lbl(ids.w, "Drawer inside width")}
          {inp(ids.w, w, setW)}
        </div>
        <div>
          {lbl(ids.d, "Drawer inside depth (front to back)")}
          {inp(ids.d, d, setD)}
        </div>
        <div>
          {lbl(ids.h, "Drawer inside height", true)}
          {inp(ids.h, h, setH)}
        </div>
        <div>
          {lbl(ids.b, "Print bed size, mm (square)", true)}
          {inp(ids.b, bed, setBed)}
        </div>
        <div>
          {lbl(ids.f, "Baseplate floor / magnets under bins, mm")}
          {inp(ids.f, floor, setFloor)}
        </div>
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={lip} onChange={(e) => setLip(e.target.checked)} />
            Bins have the stacking lip (+{LIP_MM} mm)
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
          data && <ResultCard data={data} lip={lip} />
        )}
      </div>
    </div>
  );
}
