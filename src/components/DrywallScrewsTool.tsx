"use client";

import { useState, useId } from "react";
import {
  drywallScrews,
  SHEETS,
  THICKNESSES,
  IRC_CH7_URL,
  type Application,
  type Orientation,
  type Thickness,
  type DrywallResult,
} from "@/lib/drywall-screws";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

function ResultCard({ data, sheets, app }: { data: DrywallResult; sheets: number; app: Application }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Screws per sheet at the maximum spacing</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{data.perSheet} screws per sheet</p>
        <p className="mt-1 text-[var(--color-muted)]">
          {sheets > 1 ? `${data.total.toLocaleString("en-US")} screws for ${sheets.toLocaleString("en-US")} sheets · ` : ""}
          Screws no more than {data.screwSpacing} in apart on a {app} (IRC Table R702.3.5)
        </p>
      </div>
      <div className="p-5 text-sm">
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full">
            <tbody className="divide-y divide-[var(--color-line)]">
              <tr>
                <td className="px-3 py-2 font-medium">Maximum screw spacing</td>
                <td className="px-3 py-2">{data.screwSpacing} in on center</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Framing members under one sheet</td>
                <td className="px-3 py-2">{data.framingLines}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Screws along each member</td>
                <td className="px-3 py-2">{data.screwsPerLine} (one at each end)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Per sheet</td>
                <td className="px-3 py-2">
                  {data.framingLines} × {data.screwsPerLine} = {data.perSheet}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {!data.edgesOnFraming && (
          <p className="mb-5">
            The sheet&rsquo;s length is not a whole number of framing spaces, so its end will not land on a member as installed — the count
            assumes the sheet is cut back to the last member.
          </p>
        )}
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          The table gives a <em>maximum</em> spacing, so this is the fewest screws that meet it — closer spacing is allowed. Fire-rated
          assemblies, shear walls, adhesive application and manufacturer instructions can require different fastening, and many
          jurisdictions amend the IRC. R702.3.5.1 calls for Type W or Type S screws (ASTM C1002) penetrating wood at least 5/8 in.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: International Residential Code 2024, Table R702.3.5 (application without adhesive, screws) and Section R702.3.5.1.
            Count: framing members under the sheet × screws per member at that spacing. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={IRC_CH7_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              IRC 2024 Chapter 7 — Wall covering
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function DrywallScrewsTool() {
  const [sheet, setSheet] = useState("4x8");
  const [thickness, setThickness] = useState<Thickness>("1/2");
  const [app, setApp] = useState<Application>("wall");
  const [framing, setFraming] = useState<16 | 24>(16);
  const [orientation, setOrientation] = useState<Orientation>("perpendicular");
  const [sheets, setSheets] = useState("1");
  const ids = { s: useId(), t: useId(), a: useId(), f: useId(), o: useId(), n: useId() };

  const count = sheets.trim() === "" ? NaN : Number(sheets);
  let data: DrywallResult | null = null;
  let error: string | null = null;
  try {
    data = drywallScrews({ sheet, thickness, app, framing, orientation, sheets: count });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={ids.a} className="mb-1.5 block font-medium">
            Wall or ceiling
          </label>
          <select id={ids.a} value={app} onChange={(e) => setApp(e.target.value as Application)} className={field}>
            <option value="wall">Wall</option>
            <option value="ceiling">Ceiling</option>
          </select>
        </div>
        <div>
          <label htmlFor={ids.s} className="mb-1.5 block font-medium">
            Sheet size
          </label>
          <select id={ids.s} value={sheet} onChange={(e) => setSheet(e.target.value)} className={field}>
            {SHEETS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.t} className="mb-1.5 block font-medium">
            Board thickness
          </label>
          <select id={ids.t} value={thickness} onChange={(e) => setThickness(e.target.value as Thickness)} className={field}>
            {THICKNESSES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={ids.f} className="mb-1.5 block font-medium">
            Stud / joist spacing
          </label>
          <select id={ids.f} value={framing} onChange={(e) => setFraming(Number(e.target.value) as 16 | 24)} className={field}>
            <option value={16}>16 in on center</option>
            <option value={24}>24 in on center</option>
          </select>
        </div>
        <div>
          <label htmlFor={ids.o} className="mb-1.5 block font-medium">
            Sheet runs
          </label>
          <select id={ids.o} value={orientation} onChange={(e) => setOrientation(e.target.value as Orientation)} className={field}>
            <option value="perpendicular">Across the framing (horizontal on walls)</option>
            <option value="parallel">Along the framing (vertical on walls)</option>
          </select>
        </div>
        <div>
          <label htmlFor={ids.n} className="mb-1.5 block font-medium">
            Number of sheets
          </label>
          <input id={ids.n} type="number" inputMode="numeric" min="1" step="1" value={sheets} onChange={(e) => setSheets(e.target.value)} className={field} />
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">For screws into wood framing without adhesive. The result updates as you change anything.</p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">No answer for that combination</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} sheets={count} app={app} />
        )}
      </div>
    </div>
  );
}
