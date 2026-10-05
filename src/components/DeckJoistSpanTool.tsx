"use client";

import { useState, useId } from "react";
import {
  DCA6_URL,
  DECK_RETRIEVED,
  IRC2021_URL,
  IRC2024_URL,
  LOADS,
  SIZES,
  SPACINGS,
  SPECIES,
  formatFtIn,
  lookupDeckJoist,
  parseFtIn,
  type CantileverResult,
  type DeckJoistResult,
  type LoadId,
  type SizeId,
  type Spacing,
  type SpeciesId,
} from "@/lib/deck-joist-span";
import { isToolError } from "@/lib/errors";

/** Table lookup, recomputed as inputs change. No loading state. */

const cell = (c: string) => (c === "NP" ? "NP" : formatFtIn(parseFtIn(c) as number));
const n = (x: number, d = 2) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function CantileverLine({ c, back }: { c: CantileverResult; back: number }) {
  switch (c.status) {
    case "value":
      return (
        <>
          Maximum cantilever with a {n(back)} ft back span:{" "}
          <strong className="font-medium text-[var(--color-fg)]">{formatFtIn(c.inches)}</strong>
          {c.interpolated && c.between
            ? ` — interpolated between the ${c.between[0]} ft and ${c.between[1]} ft columns (footnote g allows interpolation), rounded down to the inch.`
            : "."}
        </>
      );
    case "np":
      return (
        <>
          With a {n(back)} ft back span the table gives NP — a cantilever is not permitted for this
          joist (or the neighbouring column is NP, so there is no value to interpolate).
        </>
      );
    case "below-table":
      return (
        <>
          The table starts at a 4 ft back span and footnote g does not allow extrapolation, so it
          gives no cantilever for {n(back)} ft.
        </>
      );
    case "above-table":
      return <>The table ends at an 18 ft back span and does not allow extrapolation.</>;
    case "exceeds-span":
      return (
        <>
          A {n(back)} ft back span is longer than this joist&rsquo;s allowable span (
          {formatFtIn(c.allowedIn)}), so the table gives no cantilever for it.
        </>
      );
  }
}

function ResultCard({
  data,
  speciesLabel,
  loadLabel,
  size,
  spacing,
  backFt,
}: {
  data: DeckJoistResult;
  speciesLabel: string;
  loadLabel: string;
  size: SizeId;
  spacing: Spacing;
  backFt: number | null;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {size.replace("x", " × ")} {speciesLabel} at {spacing}&Prime; on center · {loadLabel}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          Maximum joist span {formatFtIn(data.spanIn)}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          Measured between supports, not including the cantilever.
          {data.planned &&
            (data.planned.within
              ? ` Your ${n(data.planned.inches / 12)} ft span is within the table maximum.`
              : ` Your ${n(data.planned.inches / 12)} ft span is longer than the table maximum by ${n((data.planned.inches - data.spanIn) / 12)} ft.`)}
        </p>
      </div>
      <div className="p-5 text-sm">
        {data.cantilever && backFt !== null && (
          <p className="mb-4 text-[var(--color-muted)]">
            <CantileverLine c={data.cantilever} back={backFt} />
          </p>
        )}
        <div className="mb-5 overflow-x-auto">
          <table className="w-full">
            <thead className="text-left text-[var(--color-muted)]">
              <tr>
                <th className="py-1 pr-3 font-medium">Spacing</th>
                {data.spansBySpacing.map((s) => (
                  <th key={s.spacing} className="py-1 pr-3 font-medium">
                    {s.spacing}&Prime; o.c.
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 pr-3 font-medium">Max span</td>
                {data.spansBySpacing.map((s) => (
                  <td key={s.spacing} className={`py-1 pr-3 ${s.spacing === spacing ? "font-semibold" : ""}`}>
                    {cell(s.cell)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <table className="mt-3 w-full">
            <thead className="text-left text-[var(--color-muted)]">
              <tr>
                <th className="py-1 pr-3 font-medium">Back span</th>
                {data.cantileverRow.map((c) => (
                  <th key={c.backSpanFt} className="py-1 pr-3 font-medium">
                    {c.backSpanFt} ft
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 pr-3 font-medium">Max cantilever</td>
                {data.cantileverRow.map((c) => (
                  <td key={c.backSpanFt} className="py-1 pr-3">
                    {cell(c.cell)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          The table assumes No. 2 grade lumber, wet service, 10 psf dead load, L/360 deflection at
          the main span and L/180 at the cantilever with a 220-lb point load at the end. It does not
          size beams, ledgers, posts or footings, and the decking can limit joist spacing further
          (Table R507.7). Your local building department decides which code edition and amendments
          apply and whether a design is approved.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: International Residential Code Table R507.6, Maximum Deck Joist Spans — identical
            in the 2021 and 2024 editions; 40 psf spans also match AWC DCA 6-2015 Table 2. Read{" "}
            {DECK_RETRIEVED}.
          </p>
          <p className="mt-1 space-x-3">
            <a href={IRC2024_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              2024 IRC Chapter 5
            </a>
            <a href={IRC2021_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              2021 IRC Chapter 5
            </a>
            <a href={DCA6_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              AWC DCA 6 (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function DeckJoistSpanTool() {
  const [load, setLoad] = useState<LoadId>("40");
  const [species, setSpecies] = useState<SpeciesId>("sp");
  const [size, setSize] = useState<SizeId>("2x8");
  const [spacing, setSpacing] = useState<Spacing>(16);
  const [planned, setPlanned] = useState("");
  const [back, setBack] = useState("");
  const ids = { load: useId(), sp: useId(), size: useId(), spc: useId(), pl: useId(), bk: useId() };
  const opt = (x: string) => (x.trim() === "" ? null : Number(x));

  let data: DeckJoistResult | null = null;
  let error: string | null = null;
  try {
    data = lookupDeckJoist({ load, species, size, spacing, plannedSpanFt: opt(planned), backSpanFt: opt(back) });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }

  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.load} className="mb-1.5 block font-medium">
            Design load
          </label>
          <select id={ids.load} value={load} onChange={(e) => setLoad(e.target.value as LoadId)} className={field}>
            {LOADS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.sp} className="mb-1.5 block font-medium">
            Lumber species
          </label>
          <select id={ids.sp} value={species} onChange={(e) => setSpecies(e.target.value as SpeciesId)} className={field}>
            {SPECIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={ids.size} className="mb-1.5 block font-medium">
              Joist size
            </label>
            <select id={ids.size} value={size} onChange={(e) => setSize(e.target.value as SizeId)} className={field}>
              {SIZES.map((z) => (
                <option key={z} value={z}>
                  {z.replace("x", " × ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={ids.spc} className="mb-1.5 block font-medium">
              Spacing
            </label>
            <select id={ids.spc} value={spacing} onChange={(e) => setSpacing(Number(e.target.value) as Spacing)} className={field}>
              {SPACINGS.map((s) => (
                <option key={s} value={s}>
                  {s}&Prime; on center
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={ids.pl} className="mb-1.5 block font-medium">
              Your span, ft <span className="font-normal text-[var(--color-muted)]">(optional)</span>
            </label>
            <input id={ids.pl} type="number" inputMode="decimal" step="any" value={planned} onChange={(e) => setPlanned(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor={ids.bk} className="mb-1.5 block font-medium">
              Back span, ft <span className="font-normal text-[var(--color-muted)]">(cantilever)</span>
            </label>
            <input id={ids.bk} type="number" inputMode="decimal" step="any" value={back} onChange={(e) => setBack(e.target.value)} className={field} />
          </div>
        </div>
      </div>
      <p className="-mt-3 mb-6 text-xs text-[var(--color-muted)]">
        The answer updates as you choose. Decimal feet: 11 ft 6 in = 11.5. Nothing is sent anywhere.
      </p>

      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && (
            <ResultCard
              data={data}
              speciesLabel={SPECIES.find((s) => s.id === species)?.label ?? ""}
              loadLabel={LOADS.find((l) => l.id === load)?.label ?? ""}
              size={size}
              spacing={spacing}
              backFt={opt(back)}
            />
          )
        )}
      </div>
    </div>
  );
}
