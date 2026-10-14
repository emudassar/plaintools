"use client";

import { useState, useId } from "react";
import { foalColours, GENES, VGL_URLS, type FoalResult, type Genotype, type GeneId } from "@/lib/horse-color";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const pct = (p: number) => `${(p * 100).toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;

const HINTS: Record<GeneId, string> = {
  E: "Chestnut/sorrel horses are always e/e.",
  A: "Doesn't show on a chestnut, but it is still passed on.",
  Cr: "Palomino, buckskin, smoky black = N/Cr; cremello, perlino = Cr/Cr.",
  D: "Most horses are nd2/nd2. Duns carry at least one D.",
  G: "A horse that greys out carries at least one G.",
};

function ResultCard({ data }: { data: FoalResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {data.sireColour} sire × {data.damColour} dam
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {(() => {
            const top = data.colours.filter((c) => Math.abs(c.p - data.colours[0].p) < 1e-9);
            return top.length === 1
              ? `Most likely: ${top[0].name} (${pct(top[0].p)})`
              : `Equally most likely: ${top.map((c) => c.name).join(", ")} (${pct(top[0].p)} each)`;
          })()}
        </p>
        <ul className="mt-3 space-y-1.5">
          {data.colours.map((c) => (
            <li key={c.name}>
              <div className="flex justify-between gap-3 text-sm">
                <span>{c.name}</span>
                <span className="font-semibold">{pct(c.p)}</span>
              </div>
              <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-white" aria-hidden="true">
                <div className="h-full bg-[var(--color-accent)]" style={{ width: `${c.p * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">Gene by gene</h3>
        <table className="mb-5 w-full text-left">
          <tbody>
            {data.perGene.map((g) => (
              <tr key={g.id} className="border-t border-[var(--color-line)]">
                <td className="py-1 pr-3 font-medium">{g.name}</td>
                <td className="py-1">{g.outcomes.map((o) => `${o.genotype} ${pct(o.p)}`).join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          The exact shade, or any white markings and patterns. Only five genes are modelled; tobiano, frame, sabino, leopard (appaloosa),
          roan, silver, champagne and pearl are not. Odds are per foal — each foal is a new draw — and they are only as good as the test
          results entered.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Source: UC Davis Veterinary Genetics Laboratory gene pages (Red Factor, Agouti, Cream, Dun, Gray). Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            {(Object.keys(VGL_URLS) as (keyof typeof VGL_URLS)[]).map((k, i) => (
              <span key={k}>
                {i > 0 ? " · " : ""}
                <a href={VGL_URLS[k]} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
                  {k}
                </a>
              </span>
            ))}
          </p>
        </footer>
      </div>
    </div>
  );
}

function Parent({ title, g, set }: { title: string; g: Genotype; set: (g: Genotype) => void }) {
  const base = useId();
  return (
    <fieldset className="rounded-md border border-[var(--color-line)] p-3">
      <legend className="px-1 font-medium">{title}</legend>
      {GENES.map((gene) => (
        <div key={gene.id} className="mt-2">
          <label htmlFor={`${base}-${gene.id}`} className="block text-sm font-medium">
            {gene.name}
          </label>
          <select
            id={`${base}-${gene.id}`}
            value={g[gene.id]}
            onChange={(e) => set({ ...g, [gene.id]: e.target.value })}
            className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2"
          >
            {gene.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">{HINTS[gene.id]}</p>
        </div>
      ))}
    </fieldset>
  );
}

export default function HorseColorTool() {
  const [sire, setSire] = useState<Genotype>({ E: "E/e", A: "A/a", Cr: "N/Cr", D: "nd2/nd2", G: "N/N" });
  const [dam, setDam] = useState<Genotype>({ E: "e/e", A: "A/a", Cr: "N/N", D: "nd2/nd2", G: "N/N" });

  let data: FoalResult | null = null;
  let error: string | null = null;
  try {
    data = foalColours(sire, dam);
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <Parent title="Sire (stallion)" g={sire} set={setSire} />
        <Parent title="Dam (mare)" g={dam} set={setDam} />
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">
        Enter each parent&rsquo;s coat colour DNA test results. Defaults: a buckskin stallion carrying red and black, and a chestnut mare.
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
