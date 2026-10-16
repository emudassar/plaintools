"use client";

import { useState, useId } from "react";
import {
  deckBeamSpans,
  cantileversFor,
  beamLabel,
  fmtFtIn,
  LOADS,
  SPECIES,
  JOIST_SPANS,
  IRC2024_URL,
  IRC2021_URL,
  type LoadId,
  type SpeciesId,
  type BeamResult,
} from "@/lib/deck-beam-span";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const inchesToFtIn = (i: number) => `${Math.floor(i / 12)}′ ${Math.round(i % 12)}″`;

function ResultCard({ data }: { data: BeamResult }) {
  const species = SPECIES.find((s) => s.id === data.input.species)!;
  const load = LOADS.find((l) => l.id === data.input.load)!;
  const req = data.input.requiredFt;
  const passing = data.rows.filter((r) => r.meets);
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          IRC Table {data.table} · {species.label} · joists {data.input.joistSpan} ft + {data.input.cantilever} ft cantilever
        </p>
        {req !== null ? (
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {passing.length
              ? `${passing.length} of ${data.rows.length} beam sizes are tabulated at ${req} ft or more`
              : `No tabulated beam size reaches ${req} ft`}
          </p>
        ) : (
          <p className="mt-1 text-2xl font-semibold tracking-tight">Maximum beam span for each beam size</p>
        )}
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {load.label}. Spans are between posts; the beam may cantilever past a post up to ¼ of the adjacent span (footnote f).
        </p>
      </div>
      <div className="p-5 text-sm">
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full">
            <thead className="text-left text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-1.5 font-medium">Beam</th>
                <th className="px-3 py-1.5 font-medium">Max beam span</th>
                <th className="px-3 py-1.5 font-medium">Max beam cantilever (¼ span)</th>
                {req !== null && <th className="px-3 py-1.5 font-medium">≥ {req} ft?</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {data.rows.map((r) => (
                <tr key={r.size} className={r.meets ? "bg-[var(--color-accent-soft)]" : undefined}>
                  <td className="px-3 py-1.5 font-medium">{beamLabel(r.size)}</td>
                  <td className="px-3 py-1.5">{r.span ? fmtFtIn(r.span) : <span className="text-[var(--color-muted)]">check printed table*</span>}</td>
                  <td className="px-3 py-1.5">{r.inches !== null ? inchesToFtIn(r.inches / 4) : "—"}</td>
                  {req !== null && <td className="px-3 py-1.5">{r.meets === null ? "—" : r.meets ? "Yes" : "No"}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.rows.some((r) => r.span === null) && (
          <p className="mb-5 text-xs text-[var(--color-muted)]">
            * The code website prints a value here that breaks the table&rsquo;s own ordering (longer than a bigger beam or than the column to
            its left), so it is not repeated. Read that cell in the printed code.
          </p>
        )}
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          Whether your deck is allowed under these tables or what your local code requires. The tables assume No. 2 grade lumber with wet
          service, 10 psf dead load and a beam carrying a single span of joists; they do not cover point loads, hot tubs, roofs, glulam or
          LVL beams. Your building department has the final word.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: International Residential Code 2024, Table {data.table} &ldquo;Maximum Deck Beam Span&rdquo;
            {species.footnote ? ` (${species.footnote})` : ""}, read on codes.iccsafe.org and cross-checked against the 2021 edition. Retrieved{" "}
            {data.retrievedAt}.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4">
            <a href={IRC2024_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              IRC 2024 Chapter 5
            </a>
            <a href={IRC2021_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              IRC 2021 Chapter 5
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function DeckBeamSpanTool() {
  const [load, setLoad] = useState<LoadId>("40");
  const [species, setSpecies] = useState<SpeciesId>("sp");
  const [joist, setJoist] = useState(12);
  const [cant, setCant] = useState(0);
  const [req, setReq] = useState("");
  const ids = { l: useId(), s: useId(), j: useId(), c: useId(), r: useId() };

  const options = cantileversFor(load, joist);
  const cantilever = options.includes(cant) ? cant : options[0];

  let data: BeamResult | null = null;
  let error: string | null = null;
  try {
    data = deckBeamSpans({ load, species, joistSpan: joist, cantilever, requiredFt: req.trim() === "" ? null : Number(req) });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.s} className="mb-1.5 block font-medium">
            Beam lumber species
          </label>
          <select id={ids.s} value={species} onChange={(e) => setSpecies(e.target.value as SpeciesId)} className={field}>
            {SPECIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.l} className="mb-1.5 block font-medium">
            Design load
          </label>
          <select id={ids.l} value={load} onChange={(e) => setLoad(e.target.value as LoadId)} className={field}>
            {LOADS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={ids.j} className="mb-1.5 block font-medium">
            Joist span (ft)
          </label>
          <select id={ids.j} value={joist} onChange={(e) => setJoist(Number(e.target.value))} className={field}>
            {JOIST_SPANS.map((j) => (
              <option key={j} value={j}>
                {j} ft
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.c} className="mb-1.5 block font-medium">
            Joist cantilever past beam
          </label>
          <select id={ids.c} value={cantilever} onChange={(e) => setCant(Number(e.target.value))} className={field}>
            {options.map((c) => (
              <option key={c} value={c}>
                {c === 0 ? "None" : `${c} ft`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.r} className="mb-1.5 block font-medium">
            Beam span I need (ft, optional)
          </label>
          <input id={ids.r} type="number" inputMode="decimal" min="0" step="any" value={req} onChange={(e) => setReq(e.target.value)} className={field} />
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">
        The joist span and cantilever choices are the pairs printed in the table&rsquo;s header. Updates as you change anything.
      </p>
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
