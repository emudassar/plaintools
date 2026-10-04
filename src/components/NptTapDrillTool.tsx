"use client";

import { useState, useId } from "react";
import {
  findPipeSize,
  inchesToMm,
  NPT_RETRIEVED,
  PIPE_TAPS,
  SOWA_URL,
  type PipeSizeRow,
} from "@/lib/npt-tap-drill";

/** Pick a size, see the drill. A table lookup — no loading or error state beyond the list itself. */

const d4 = (x: number) => x.toFixed(4);
const mm = (x: number) => inchesToMm(x).toFixed(2);

function ResultCard({ row }: { row: PipeSizeRow }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {row.size}&Prime;-{row.tpi} NPT tap drill
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {row.npt.label} drill — {d4(row.npt.inches)}&Prime; (
          {mm(row.npt.inches)} mm)
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {row.tpi} threads per inch.
          {row.nps
            ? ` For a straight (NPS) pipe thread of the same size the chart gives ${row.nps.label} — ${d4(row.nps.inches)}″ (${mm(row.nps.inches)} mm).`
            : " The chart lists no straight (NPS) tap drill for this size."}
        </p>
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          These are the drill sizes one tap maker publishes. Charts from other
          makers sometimes list a slightly different drill for the same thread.
          Material, tap condition and the required thread engagement (checked
          with a gauge or the mating fitting) decide the final result; follow
          your tap manufacturer&rsquo;s figure where it differs.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: Sowa Tool, Tap &amp; Drill Charts — Taper Pipe Taps (NPT)
            and Straight Pipe Taps (NPS). Retrieved {NPT_RETRIEVED}.
          </p>
          <p className="mt-1">
            <a
              href={SOWA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Sowa Tool tap &amp; drill chart (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function NptTapDrillTool() {
  const [size, setSize] = useState("1/8");
  const id = useId();
  const row = findPipeSize(size);

  return (
    <div>
      <div className="mb-6">
        <label htmlFor={id} className="mb-1.5 block font-medium">
          Pipe thread size
        </label>
        <select
          id={id}
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5 sm:w-72"
        >
          {PIPE_TAPS.map((r) => (
            <option key={r.size} value={r.size}>
              {r.size}″ – {r.tpi} NPT
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          The answer updates as you choose. Nothing is sent anywhere.
        </p>
      </div>

      <div aria-live="polite">
        <ResultCard row={row} />
      </div>

      <h3 className="mt-6 mb-2 text-sm font-semibold tracking-wide uppercase">
        Full NPT / NPS tap drill chart
      </h3>
      <div className="overflow-x-auto rounded-md border border-[var(--color-line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-accent-soft)] text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Size</th>
              <th className="px-3 py-2 font-medium">TPI</th>
              <th className="px-3 py-2 font-medium">NPT drill</th>
              <th className="px-3 py-2 font-medium">Decimal (in)</th>
              <th className="px-3 py-2 font-medium">mm</th>
              <th className="px-3 py-2 font-medium">NPS drill</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {PIPE_TAPS.map((r) => (
              <tr
                key={r.size}
                className={
                  r.size === size
                    ? "bg-[var(--color-accent-soft)] font-medium"
                    : ""
                }
              >
                <td className="px-3 py-1.5">{r.size}″</td>
                <td className="px-3 py-1.5">{r.tpi}</td>
                <td className="px-3 py-1.5">{r.npt.label}</td>
                <td className="px-3 py-1.5">{d4(r.npt.inches)}</td>
                <td className="px-3 py-1.5">{mm(r.npt.inches)}</td>
                <td className="px-3 py-1.5">
                  {r.nps ? `${r.nps.label} (${d4(r.nps.inches)})` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
