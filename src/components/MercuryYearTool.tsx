"use client";

import { useEffect, useState, useId } from "react";
import { decodeMercuryYear, CODE, MERC_MANUAL_URL, type MercResult } from "@/lib/mercury-year";
import { isToolError } from "@/lib/errors";

/** Decoded as you type. The current year is set after mount so the static HTML and the browser agree. */

function ResultCard({ data }: { data: MercResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Year code {data.input}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">Manufactured in {data.year}</p>
        <p className="mt-1 text-lg">About {data.ageYears} {data.ageYears === 1 ? "year" : "years"} old</p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {data.kind === "alpha"
            ? `${[...data.input].map((c) => `${c} = ${CODE[c]}`).join(", ")} → ${data.digits}. Mercury's code gives the last two digits of the year; the most recent year that isn't in the future is shown.`
            : `Two digits in the year box are the last two digits of the year it was made.`}
          {data.alternative !== null ? ` (In principle ${data.digits} could also be ${data.alternative}.)` : ""}
        </p>
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">Mercury&rsquo;s year code table</h3>
        <table className="mb-5 w-full text-center">
          <tbody>
            <tr className="border-b border-[var(--color-line)]">
              <th className="py-1 text-left font-medium">Letter</th>
              {Object.keys(CODE).map((k) => (
                <td key={k} className={`py-1 ${data.input.includes(k) ? "font-bold" : ""}`}>
                  {k}
                </td>
              ))}
            </tr>
            <tr>
              <th className="py-1 text-left font-medium">Digit</th>
              {Object.entries(CODE).map(([k, v]) => (
                <td key={k} className={`py-1 ${data.input.includes(k) ? "font-bold" : ""}`}>
                  {v}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          The model year a dealer sold it as, the horsepower, or parts compatibility. Mercury does not publish a table that turns the
          serial number itself into a year; for parts and records, give a Mercury dealer the full serial and model numbers.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Source: Mercury Marine Operation, Maintenance and Installation Manual 8M0165094 (15/20 EFI FourStroke, © 2019), &ldquo;Model Year Production Code&rdquo;. Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={MERC_MANUAL_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Mercury manual (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function MercuryYearTool() {
  const [code, setCode] = useState("BX");
  const [year, setYear] = useState(2026);
  const id = useId();
  useEffect(() => setYear(new Date().getFullYear()), []);

  let data: MercResult | null = null;
  let error: string | null = null;
  try {
    data = decodeMercuryYear(code, year);
  } catch (e) {
    error = isToolError(e) ? e.message : "That code could not be read.";
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-medium">
        Year code from the serial number decal
      </label>
      <input
        id={id}
        type="text"
        maxLength={10}
        autoComplete="off"
        spellCheck={false}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5 font-mono tracking-wider uppercase sm:w-48"
      />
      <p className="mb-6 mt-2 text-xs text-[var(--color-muted)]">
        On the serial number decal, the year code is the two characters at the bottom right, under the model designation — letters such
        as BX in Mercury&rsquo;s manual example. Your owner&rsquo;s manual shows where the decal sits on your engine.
      </p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That code can&rsquo;t be decoded</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} />
        )}
      </div>
    </div>
  );
}
