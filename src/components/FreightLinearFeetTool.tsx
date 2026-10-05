"use client";

import { useState, useId } from "react";
import { DEFAULT_WIDTH_IN, linearFeet, UTILITY_URL, type Layout, type LinearFeetResult } from "@/lib/freight-linear-feet";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 2) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function LayoutRow({ l, best }: { l: Layout; best: boolean }) {
  return (
    <tr className={best ? "font-semibold" : ""}>
      <td className="py-1.5 pr-3">{l.name === "straight" ? "Straight" : "Turned"}</td>
      <td className="py-1.5 pr-3">
        {n(l.alongIn)} in along, {n(l.acrossIn)} in across
      </td>
      <td className="py-1.5 pr-3">{l.perRow > 0 ? l.perRow : "doesn't fit"}</td>
      <td className="py-1.5 pr-3">{l.perRow > 0 ? l.rows : "—"}</td>
      <td className="py-1.5">{l.perRow > 0 ? `${n(l.linearFt)} ft` : "—"}</td>
    </tr>
  );
}

function ResultCard({ data, pallets, stack, width }: { data: LinearFeetResult; pallets: number; stack: boolean; width: number }) {
  const b = data.best;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {pallets} pallet{pallets === 1 ? "" : "s"}
          {stack ? `, stacked two high (${data.positions} floor positions)` : ""} in a {n(width)} in wide trailer
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{n(b.linearFt)} linear feet</p>
        <p className="mt-1 text-[var(--color-muted)]">
          {b.rows} row{b.rows === 1 ? "" : "s"} of {b.perRow} across, loaded {b.name === "straight" ? "straight" : "turned"} ({n(b.alongIn)} in
          per row along the trailer).
          {data.overLength && ` That is longer than the ${n(data.trailerLengthFt)} ft trailer entered.`}
        </p>
      </div>
      <div className="p-5 text-sm">
        <div className="mb-5 overflow-x-auto">
          <table className="w-full">
            <thead className="text-left text-[var(--color-muted)]">
              <tr>
                <th className="py-1 pr-3 font-medium">Loading</th>
                <th className="py-1 pr-3 font-medium">Pallet on the floor</th>
                <th className="py-1 pr-3 font-medium">Across</th>
                <th className="py-1 pr-3 font-medium">Rows</th>
                <th className="py-1 font-medium">Linear feet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              <LayoutRow l={data.straight} best={b === data.straight} />
              <LayoutRow l={data.turned} best={b === data.turned} />
            </tbody>
          </table>
        </div>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The arithmetic</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          Pallets per row = floor({n(width)} ÷ the side across). Rows = {data.positions} floor positions ÷ {b.perRow} per row, rounded up ={" "}
          {b.rows}. Linear feet = {b.rows} × {n(b.alongIn)} in ÷ 12 = {n(b.linearFt)} ft.
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          This is floor geometry with pallets in straight rows. Whether pallets can be turned or stacked depends on the
          pallets, the freight and how it is loaded, and overhang adds to the footprint. Each LTL carrier sets its own
          linear-foot or capacity rules in its tariff, including the threshold and how linear feet are measured — the
          carrier&rsquo;s figure is the one that is billed.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Geometry: rows of pallets across the trailer width. Default width: Utility Trailer 53&prime; dry van, 101&Prime;
            wearband to wearband. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={UTILITY_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Utility Trailer dry van features
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function FreightLinearFeetTool() {
  const [pallets, setPallets] = useState("6");
  const [len, setLen] = useState("48");
  const [wid, setWid] = useState("40");
  const [stack, setStack] = useState(false);
  const [tw, setTw] = useState(String(DEFAULT_WIDTH_IN));
  const [tl, setTl] = useState("53");
  const ids = { p: useId(), l: useId(), w: useId(), tw: useId(), tl: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));

  let data: LinearFeetResult | null = null;
  let error: { kind: string; message: string } | null = null;
  try {
    data = linearFeet({ pallets: num(pallets), lengthIn: num(len), widthIn: num(wid), stackable: stack, trailerWidthIn: num(tw), trailerLengthFt: num(tl) });
  } catch (e) {
    error = isToolError(e) ? { kind: e.kind, message: e.message } : { kind: "unavailable", message: "That input could not be used." };
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const inp = (id: string, v: string, set: (s: string) => void) => (
    <input id={id} type="number" inputMode="decimal" min="0" step="any" value={v} onChange={(e) => set(e.target.value)} className={field} />
  );

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.p} className="mb-1.5 block font-medium">
            Number of pallets
          </label>
          {inp(ids.p, pallets, setPallets)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={ids.l} className="mb-1.5 block font-medium">
              Pallet length (in)
            </label>
            {inp(ids.l, len, setLen)}
          </div>
          <div>
            <label htmlFor={ids.w} className="mb-1.5 block font-medium">
              Pallet width (in)
            </label>
            {inp(ids.w, wid, setWid)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={ids.tw} className="mb-1.5 block font-medium">
              Trailer inside width (in)
            </label>
            {inp(ids.tw, tw, setTw)}
          </div>
          <div>
            <label htmlFor={ids.tl} className="mb-1.5 block font-medium">
              Trailer length (ft)
            </label>
            {inp(ids.tl, tl, setTl)}
          </div>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={stack} onChange={(e) => setStack(e.target.checked)} />
            Pallets can be stacked two high
          </label>
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">
        Use the pallet footprint including any overhang. The answer updates as you type; nothing is sent anywhere.
      </p>

      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">{error.kind === "no-data" ? "Doesn't fit the trailer" : "That input could not be used"}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error.message}</p>
          </div>
        ) : (
          data && <ResultCard data={data} pallets={num(pallets)} stack={stack} width={num(tw)} />
        )}
      </div>
    </div>
  );
}
