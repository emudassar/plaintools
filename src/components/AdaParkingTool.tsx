"use client";

import { useState, useId } from "react";
import {
  calculateAdaParking,
  TABLE_208_2,
  type FacilityType,
  type ParkingResult,
} from "@/lib/ada-parking";
import { asToolError, type ErrorKind } from "@/lib/errors";

/**
 * Three real states: idle / error / result.
 *
 * No loading state — Table 208.2 is compiled into the page. Nothing here says
 * whether a particular lot complies; it reports what the standard's
 * arithmetic gives for the count entered.
 */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: ParkingResult };

const ADA_URL = "https://www.ada.gov/law-and-regs/design-standards/2010-stds/";

function Figure({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-md border border-[var(--color-line)] p-3">
      <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      {note && <p className="mt-1 text-xs text-[var(--color-muted)]">{note}</p>}
    </div>
  );
}

function ResultCard({ data }: { data: ParkingResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Minimum accessible spaces</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {data.accessible} accessible {data.accessible === 1 ? "space" : "spaces"}, at least {data.van} van-accessible
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          For a facility with {data.totalSpaces.toLocaleString("en-US")}{" "}
          {data.facility === "general" ? "total spaces" : "patient and visitor spaces"}. {data.rule} ({data.section}).
        </p>
      </div>

      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">The breakdown</h3>
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <Figure label="Accessible spaces, total" value={String(data.accessible)} note={data.working} />
          <Figure
            label="Of which van-accessible"
            value={String(data.van)}
            note={`One for every six or fraction of six (§208.2.4): ${data.accessible} ÷ 6, rounded up.`}
          />
          <Figure
            label="Remaining car spaces"
            value={String(data.car)}
            note="Van spaces count toward the accessible total; they are not added on top."
          />
        </div>

        {data.tableRowIndex !== null && (
          <>
            <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">Table 208.2</h3>
            <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-accent-soft)] text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium">Total spaces in the facility</th>
                    <th className="px-3 py-2 font-medium">Minimum accessible spaces</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-line)]">
                  {TABLE_208_2.map((row, i) => (
                    <tr
                      key={row.from}
                      className={i === data.tableRowIndex ? "bg-[var(--color-warn-soft)] font-medium" : undefined}
                    >
                      <td className="px-3 py-2">
                        {row.to === null
                          ? `${row.from.toLocaleString("en-US")} and over`
                          : `${row.from.toLocaleString("en-US")} to ${row.to.toLocaleString("en-US")}`}
                      </td>
                      <td className="px-3 py-2">{row.required}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">Space and aisle widths (§502)</h3>
        <ul className="mb-5 list-disc space-y-1 pl-5 text-sm">
          <li>Car space: 96 in wide minimum, with an adjacent access aisle (§502.2).</li>
          <li>
            Van space: 132 in wide minimum — or 96 in wide where its access aisle is 96 in wide minimum (§502.2,
            Exception).
          </li>
          <li>Access aisle: 60 in wide minimum, the full length of the space; two spaces may share one (§502.3).</li>
        </ul>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-sm text-[var(--color-muted)]">
          The count is per parking facility: a site with two separate lots calculates each one on its own. Parking
          for residents of housing follows §208.2.3, which depends on the number of units with mobility features and
          is not calculated here. State and local rules can require more, and this is not a legal opinion on whether
          a lot complies.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            2010 ADA Standards for Accessible Design, §104.2, §208.2, §208.2.1, §208.2.2, §208.2.4 and §502. Text read{" "}
            {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={ADA_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              ADA.gov: 2010 ADA Standards for Accessible Design
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function AdaParkingTool() {
  const [total, setTotal] = useState("120");
  const [facility, setFacility] = useState<FacilityType>("general");
  const [state, setState] = useState<State>({ phase: "idle" });
  const totalId = useId();
  const facilityId = useId();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = calculateAdaParking({
        totalSpaces: Number(total.trim() === "" ? "NaN" : total),
        facility,
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
      <form onSubmit={submit} className="mb-6" noValidate>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={totalId} className="mb-1.5 block text-sm font-medium">
              Total parking spaces in this lot or garage
            </label>
            <input
              id={totalId}
              type="number"
              inputMode="numeric"
              step="any"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor={facilityId} className="mb-1.5 block text-sm font-medium">
              What the parking serves
            </label>
            <select
              id={facilityId}
              value={facility}
              onChange={(e) => setFacility(e.target.value as FacilityType)}
              className={field}
            >
              <option value="general">Most facilities (stores, offices, churches, schools…)</option>
              <option value="hospital-outpatient">Hospital outpatient facility</option>
              <option value="rehabilitation">Rehabilitation or outpatient physical therapy</option>
            </select>
          </div>
        </div>
        <p className="mb-4 text-xs text-[var(--color-muted)]">
          Count every space in this one parking facility, accessible ones included. For the two medical options, count
          the patient and visitor spaces only. A doctor&rsquo;s office or clinic that is not part of a hospital uses the
          first option.
        </p>

        <button type="submit" className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white">
          Calculate the spaces
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
