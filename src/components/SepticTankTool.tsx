"use client";

import { useState, useId } from "react";
import {
  sizeSepticTank,
  formatNumber,
  TABLE_4_13,
  type SepticSizeResult,
} from "@/lib/septic-tank";
import { asToolError, type ErrorKind } from "@/lib/errors";

/**
 * Three real states: idle / error / result.
 *
 * There is deliberately NO loading state. This is a table lookup against
 * figures compiled into the page, so a spinner would be theatre.
 *
 * Nothing here recommends a tank or says a size is required. Every figure
 * is either the cited table's own value, arithmetic from the manual's own
 * stated design-flow range, or a quoted sentence.
 */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: SepticSizeResult };

function ResultCard({ data }: { data: SepticSizeResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Table 4-13 tank capacity
        </p>
        {data.tableRow ? (
          <>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {formatNumber(data.tableRow.gallons)} gallons
            </p>
            <p className="mt-1 text-[var(--color-muted)]">
              For a {data.bedrooms}-bedroom one- or two-family home, per EPA&rsquo;s Table 4-13.
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              Outside Table 4-13&rsquo;s range
            </p>
            <p className="mt-1 text-[var(--color-muted)]">
              The table stops at 8 bedrooms. See the rule of thumb below instead.
            </p>
          </>
        )}
      </div>

      <div className="p-5">
        {data.tableRow?.hasStateMinimumFootnote && (
          <div className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4">
            <p className="text-sm">
              <strong className="font-medium">The table&rsquo;s own footnote:</strong>{" "}
              &ldquo;{data.stateMinimumFootnote}&rdquo; A {data.bedrooms}-bedroom home may need a
              1,000-gallon tank in practice even though this row reads 750.
            </p>
          </div>
        )}

        {data.outsideTableRange && data.ruleOfThumbRangeGallons && (
          <div className="mb-5 rounded-md border border-[var(--color-line)] p-4">
            <h3 className="mb-1 text-sm font-semibold tracking-wide uppercase">
              The manual&rsquo;s separate rule for larger buildings
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              For buildings other than one- or two-family homes, the manual states a rule of
              thumb of two to three times the estimated design flow — not a table lookup, and not
              written specifically for a {data.bedrooms}-bedroom single-family house. Applied to
              your daily design flow range, that works out to roughly{" "}
              <strong className="font-medium text-[var(--color-fg)]">
                {formatNumber(data.ruleOfThumbRangeGallons.low)}–
                {formatNumber(data.ruleOfThumbRangeGallons.high)} gallons
              </strong>
              . Treat this as an extrapolation beyond what the table itself covers, not an
              equally specific answer.
            </p>
          </div>
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          Estimated daily design flow
        </h3>
        <p className="mb-5 text-sm text-[var(--color-muted)]">
          {formatNumber(data.designFlowLowGpd)}–{formatNumber(data.designFlowHighGpd)} gallons
          per day, from the manual&rsquo;s stated range of 100 to 150 gallons per bedroom per day
          for {data.bedrooms} {data.bedrooms === 1 ? "bedroom" : "bedrooms"}. This is supporting
          information, not a separate answer.
        </p>

        {data.hasGarbageDisposal && (
          <div className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4">
            <h3 className="mb-1 text-sm font-semibold tracking-wide uppercase">
              Garbage disposal noted
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              The manual states: &ldquo;Most state codes require a septic tank size increase to
              account for the additional volume of sludge and scum accumulating in a septic tank
              but offer no advice as to any increasing field size.&rdquo; No specific gallon
              adjustment is given anywhere in the source, so none is added to the figure above —
              check your local code for the actual increase required.
            </p>
          </div>
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">Full table</h3>
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-accent-soft)] text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Bedrooms</th>
                <th className="px-3 py-2 font-medium">Tank volume (gallons)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {TABLE_4_13.map((row) => (
                <tr
                  key={row.bedrooms}
                  className={row.bedrooms === data.bedrooms ? "bg-[var(--color-accent-soft)]" : ""}
                >
                  <td className="px-3 py-2">{row.bedrooms}</td>
                  <td className="px-3 py-2">
                    {formatNumber(row.gallons)}
                    {row.hasStateMinimumFootnote && (
                      <sup className="ml-0.5 text-[var(--color-muted)]">a</sup>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-[var(--color-line)] p-2 text-xs text-[var(--color-muted)]">
            ᵃ {data.stateMinimumFootnote}
          </p>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          This table is scoped to one- and two-family dwellings and is a model reference, not a
          national mandate — the manual itself says local codes vary and often set a higher
          minimum. It does not know your state or county's actual requirement, does not recommend
          a tank, and does not size a drainfield. The local health department or code official
          that permits your system has the number that actually governs.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: USEPA Onsite Wastewater Treatment Systems Manual (EPA/625/R-00/008), Table
            4-13, page 4-40, attributed by EPA to the International Private Sewage Disposal Code
            (ICC, 1995). Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a
              href="https://www.epa.gov/sites/default/files/2015-06/documents/2004_07_07_septics_septic_2002_osdm_all.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              EPA: Onsite Wastewater Treatment Systems Manual (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function SepticTankTool() {
  const [bedrooms, setBedrooms] = useState("3");
  const [hasGarbageDisposal, setHasGarbageDisposal] = useState(false);
  const [state, setState] = useState<State>({ phase: "idle" });

  const bedroomsId = useId();
  const disposalId = useId();

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = sizeSepticTank({
        bedrooms: Number(bedrooms.trim() === "" ? "0" : bedrooms),
        hasGarbageDisposal,
      });
      setState({ phase: "result", data });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <form onSubmit={run} className="mb-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={bedroomsId} className="mb-1.5 block font-medium">
              Number of bedrooms
            </label>
            <input
              id={bedroomsId}
              type="number"
              inputMode="numeric"
              step="1"
              min="1"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className={field}
            />
            <p className="mt-1.5 text-xs text-[var(--color-muted)]">
              A den, office or bonus room counts if your local code counts it — this page uses
              whatever number you enter.
            </p>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hasGarbageDisposal}
                onChange={(e) => setHasGarbageDisposal(e.target.checked)}
                id={disposalId}
              />
              The home has a garbage disposal / grinder
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Look up the tank size
        </button>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          Runs entirely in your browser. Nothing you enter is sent anywhere or stored.
        </p>
      </form>

      <div aria-live="polite">
        {state.phase === "error" && (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{state.message}</p>
          </div>
        )}

        {state.phase === "result" && <ResultCard data={state.data} />}
      </div>
    </div>
  );
}
