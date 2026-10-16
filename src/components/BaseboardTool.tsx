"use client";

import { useState, useId } from "react";
import { baseboard, type BaseboardResult } from "@/lib/baseboard";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
const money = (x: number) => x.toLocaleString("en-US", { style: "currency", currency: "USD" });

function ResultCard({ data, stock, waste }: { data: BaseboardResult; stock: number; waste: number }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Baseboard to buy</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {data.pieces} pieces of {n(stock, stock % 1 ? 1 : 0)} ft ({n(data.purchasedFeet, 0)} linear ft)
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {n(data.net)} ft of wall to cover, {n(data.withWaste)} ft with your {n(waste, 0)}% allowance
          {data.cost !== null ? ` · about ${money(data.cost)}` : ""}
        </p>
      </div>
      <div className="p-5 text-sm">
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full">
            <tbody className="divide-y divide-[var(--color-line)]">
              <tr>
                <td className="px-3 py-2 font-medium">Total wall length</td>
                <td className="px-3 py-2">{n(data.gross)} ft</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Minus doorways and openings</td>
                <td className="px-3 py-2">− {n(data.deducted)} ft</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Baseboard needed (net)</td>
                <td className="px-3 py-2">{n(data.net)} ft</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">With {n(waste, 0)}% allowance</td>
                <td className="px-3 py-2">{n(data.withWaste)} ft</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Pieces (rounded up)</td>
                <td className="px-3 py-2">
                  {data.pieces} × {n(stock, stock % 1 ? 1 : 0)} ft
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {data.wallsNeedingJoints > 0 && (
          <p className="mb-5">
            {data.wallsNeedingJoints} wall{data.wallsNeedingJoints > 1 ? "s are" : " is"} longer than one {n(stock, 0)} ft piece and will need a
            joint along {data.wallsNeedingJoints > 1 ? "them" : "it"}.
          </p>
        )}
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          How the pieces will cut. The count is based on total length, so short offcuts are assumed to be usable somewhere. Long walls,
          many short returns, or a rule of no joints on a wall can need more pieces than this. The waste allowance is your own figure.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Method: wall lengths − doorway widths = net feet; × (1 + allowance) ÷ stock length, rounded up = pieces. Plain arithmetic in
            your browser; no external data.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function BaseboardTool() {
  const [mode, setMode] = useState<"room" | "walls">("room");
  const [len, setLen] = useState("14");
  const [wid, setWid] = useState("12");
  const [walls, setWalls] = useState("12, 14, 12, 14");
  const [doors, setDoors] = useState("1");
  const [doorW, setDoorW] = useState("3");
  const [stock, setStock] = useState("16");
  const [waste, setWaste] = useState("10");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState<"piece" | "foot">("piece");
  const ids = { m: useId(), l: useId(), w: useId(), ws: useId(), d: useId(), dw: useId(), s: useId(), x: useId(), p: useId(), pu: useId() };

  const num = (v: string) => (v.trim() === "" ? NaN : Number(v));
  const wallList = mode === "room" ? [num(len), num(wid), num(len), num(wid)] : walls.split(/[,\s]+/).filter(Boolean).map(Number);

  let data: BaseboardResult | null = null;
  let error: string | null = null;
  try {
    data = baseboard({
      walls: wallList,
      openings: num(doors),
      openingWidth: num(doorW),
      stock: num(stock),
      wastePct: num(waste),
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
          <label htmlFor={ids.m} className="mb-1.5 block font-medium">
            Measure by
          </label>
          <select id={ids.m} value={mode} onChange={(e) => setMode(e.target.value as "room" | "walls")} className={field}>
            <option value="room">Rectangular room</option>
            <option value="walls">List of wall lengths</option>
          </select>
        </div>
        {mode === "room" ? (
          <>
            <div>
              <label htmlFor={ids.l} className="mb-1.5 block font-medium">
                Room length (ft)
              </label>
              <input id={ids.l} type="number" inputMode="decimal" min="0" step="any" value={len} onChange={(e) => setLen(e.target.value)} className={field} />
            </div>
            <div>
              <label htmlFor={ids.w} className="mb-1.5 block font-medium">
                Room width (ft)
              </label>
              <input id={ids.w} type="number" inputMode="decimal" min="0" step="any" value={wid} onChange={(e) => setWid(e.target.value)} className={field} />
            </div>
          </>
        ) : (
          <div className="sm:col-span-2">
            <label htmlFor={ids.ws} className="mb-1.5 block font-medium">
              Wall lengths in feet, separated by commas
            </label>
            <input id={ids.ws} type="text" value={walls} onChange={(e) => setWalls(e.target.value)} className={field} />
          </div>
        )}
      </div>
      <div className="mb-3 grid gap-3 sm:grid-cols-4">
        <div>
          <label htmlFor={ids.d} className="mb-1.5 block font-medium">
            Doorways
          </label>
          <input id={ids.d} type="number" inputMode="numeric" min="0" step="1" value={doors} onChange={(e) => setDoors(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.dw} className="mb-1.5 block font-medium">
            Doorway width (ft)
          </label>
          <input id={ids.dw} type="number" inputMode="decimal" min="0" step="any" value={doorW} onChange={(e) => setDoorW(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.s} className="mb-1.5 block font-medium">
            Stock length (ft)
          </label>
          <input id={ids.s} type="number" inputMode="decimal" min="0" step="any" value={stock} onChange={(e) => setStock(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.x} className="mb-1.5 block font-medium">
            Waste allowance (%)
          </label>
          <input id={ids.x} type="number" inputMode="decimal" min="0" step="any" value={waste} onChange={(e) => setWaste(e.target.value)} className={field} />
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
            Price is
          </label>
          <select id={ids.pu} value={priceUnit} onChange={(e) => setPriceUnit(e.target.value as "piece" | "foot")} className={field}>
            <option value="piece">per piece</option>
            <option value="foot">per linear foot</option>
          </select>
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">Leave out wall runs behind cabinets or built-ins. The result updates as you type.</p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} stock={num(stock)} waste={num(waste)} />
        )}
      </div>
    </div>
  );
}
