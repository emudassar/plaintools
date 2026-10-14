"use client";

import { useEffect, useState, useId } from "react";
import { decodeBradfordWhite, formatAge, monthsBetween, MONTHS, YEAR_LETTERS, MONTH_LETTERS, BW_PRO_URL, BW_LOOKUP_URL, type BwResult, type YM } from "@/lib/bradford-white-age";
import { isToolError } from "@/lib/errors";

/** Decoded as you type. No loading state. "Today" is set after mount so the static HTML and the browser agree. */

const fmt = (d: YM) => `${MONTHS[d.month - 1]} ${d.year}`;

function ResultCard({ data, today }: { data: BwResult; today: YM }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Serial {data.serial} · year letter {data.yearLetter} · month letter {data.monthLetter} · {data.digits} digits
        </p>
        {data.date ? (
          <>
            <p className="mt-1 text-2xl font-semibold tracking-tight">Made in {fmt(data.date)}</p>
            <p className="mt-1 text-lg">About {formatAge(data.ageMonths ?? 0)} old</p>
          </>
        ) : (
          <>
            <p className="mt-1 text-2xl font-semibold tracking-tight">Made in {data.matches.map(fmt).join(" or ")}</p>
            <p className="mt-1 text-[var(--color-muted)]">
              The letters repeat every 20 years and the serial&rsquo;s length doesn&rsquo;t separate these. Ages:{" "}
              {data.matches.map((m) => `${fmt(m)} → ${formatAge(monthsBetween(m, today))}`).join("; ")}. The look of the heater, its
              installation date or Bradford White&rsquo;s own lookup will tell you which.
            </p>
          </>
        )}
        <p className="mt-2 text-sm text-[var(--color-muted)]">{data.note}</p>
        {data.candidates.length > data.matches.length && (
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Ruled out by the serial&rsquo;s length: {data.candidates.filter((c) => !data.matches.includes(c)).map(fmt).join(", ")}.
          </p>
        )}
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">Bradford White&rsquo;s date code</h3>
        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <table className="w-full text-left">
            <thead className="text-[var(--color-muted)]">
              <tr>
                <th className="py-1 font-medium">1st letter</th>
                <th className="py-1 font-medium">Year</th>
              </tr>
            </thead>
            <tbody>
              {[...YEAR_LETTERS].map((l, i) => (
                <tr key={l} className={`border-t border-[var(--color-line)] ${l === data.yearLetter ? "bg-[var(--color-accent-soft)] font-semibold" : ""}`}>
                  <td className="py-0.5">{l}</td>
                  <td className="py-0.5">
                    {1984 + i}, {2004 + i}
                    {2024 + i <= today.year ? `, ${2024 + i}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="h-fit w-full text-left">
            <thead className="text-[var(--color-muted)]">
              <tr>
                <th className="py-1 font-medium">2nd letter</th>
                <th className="py-1 font-medium">Month</th>
              </tr>
            </thead>
            <tbody>
              {[...MONTH_LETTERS].map((l, i) => (
                <tr key={l} className={`border-t border-[var(--color-line)] ${l === data.monthLetter ? "bg-[var(--color-accent-soft)] font-semibold" : ""}`}>
                  <td className="py-0.5">{l}</td>
                  <td className="py-0.5">{MONTHS[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          When the heater was installed, its warranty status, or its condition. The serial gives the month it was made; a heater can sit in
          a warehouse before installation. For the warranty, use Bradford White&rsquo;s own lookup.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Source: Bradford White, &ldquo;Determining The Age Of A Water Heater&rdquo; (For The Pro bulletin). Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={BW_PRO_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Bradford White date code bulletin
            </a>
            {" · "}
            <a href={BW_LOOKUP_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Bradford White &ldquo;My Water Heater&rdquo; lookup
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function BradfordWhiteAgeTool() {
  const [serial, setSerial] = useState("KA12345678");
  const [today, setToday] = useState<YM>({ year: 2026, month: 10 });
  const id = useId();
  useEffect(() => {
    const d = new Date();
    setToday({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }, []);

  let data: BwResult | null = null;
  let error: string | null = null;
  try {
    data = decodeBradfordWhite(serial, today);
  } catch (e) {
    error = isToolError(e) ? e.message : "That serial could not be read.";
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-medium">
        Serial number (from the rating plate on the tank)
      </label>
      <input
        id={id}
        type="text"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        value={serial}
        onChange={(e) => setSerial(e.target.value)}
        className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5 font-mono tracking-wider uppercase"
      />
      <p className="mb-6 mt-2 text-xs text-[var(--color-muted)]">
        It starts with two letters, e.g. KA12345678. The example is made up — type your own. Nothing is sent anywhere; decoding happens in
        your browser.
      </p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That serial can&rsquo;t be decoded</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} today={today} />
        )}
      </div>
    </div>
  );
}
