"use client";

import { useEffect, useState, useId } from "react";
import { decodeWaterHeater, AOS_GUIDE_URL, AOS_VERIFY_URL, RHEEM_URL, RUUD_AGE_URL, type Brand, type WhResult } from "@/lib/water-heater-age";
import { formatAge, monthsBetween, MONTHS, BW_PRO_URL, BW_LOOKUP_URL, type YM } from "@/lib/bradford-white-age";
import { isToolError } from "@/lib/errors";

/** Decoded as you type. "Today" is set after mount so the static HTML and the browser agree. */

const BRANDS: { id: Brand; label: string; example: string; hint: string }[] = [
  { id: "aosmith", label: "A. O. Smith", example: "1719106145074", hint: "All digits; the first two are the year, the next two the week." },
  { id: "rheem", label: "Rheem", example: "1209D01234", hint: "Ten characters: month, year, a letter, five digits. Ruud owners: Ruud does not publish its format — use Ruud's lookup, linked on the result." },
  { id: "bradford", label: "Bradford White", example: "KA12345678", hint: "Starts with two letters: year, then month." },
];

const SOURCES: Record<Brand, { label: string; href: string }[]> = {
  aosmith: [
    { label: "A. O. Smith Service and Warranty Guide (serial matrix, p.10)", href: AOS_GUIDE_URL },
    { label: "A. O. Smith warranty verification", href: AOS_VERIFY_URL },
  ],
  rheem: [
    { label: "Rheem — how to read your serial number", href: RHEEM_URL },
    { label: "Ruud — how old is my water heater (lookup)", href: RUUD_AGE_URL },
  ],
  bradford: [
    { label: "Bradford White date code bulletin", href: BW_PRO_URL },
    { label: "Bradford White serial lookup", href: BW_LOOKUP_URL },
  ],
};

const fmt = (d: YM) => `${MONTHS[d.month - 1]} ${d.year}`;

function ResultCard({ data, today }: { data: WhResult; today: YM }) {
  const one = data.dates.length === 1;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {BRANDS.find((b) => b.id === data.brand)?.label} · serial {data.serial}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          Made {data.week !== null ? `in week ${data.week} of ${data.dates[0].year} (around ${MONTHS[data.dates[0].month - 1]})` : `in ${data.dates.map(fmt).join(" or ")}`}
        </p>
        <p className="mt-1 text-lg">
          {one
            ? `About ${formatAge(data.ageMonths ?? monthsBetween(data.dates[0], today))} old`
            : `Ages: ${data.dates.map((d) => `${fmt(d)} → ${formatAge(monthsBetween(d, today))}`).join("; ")}`}
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          {data.parts.map((p, i) => (
            <li key={i}>
              <span className="font-mono font-semibold">{p.chars}</span> — {p.meaning}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{data.note}</p>
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          When the heater was installed, its warranty status or its condition. The serial gives when it was made. Each maker&rsquo;s own
          lookup, linked below, reads the full record for a serial.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Source: the maker&rsquo;s published serial-number format. Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            {SOURCES[data.brand].map((s, i) => (
              <span key={s.href}>
                {i > 0 ? " · " : ""}
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
                  {s.label}
                </a>
              </span>
            ))}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function WaterHeaterAgeTool() {
  const [brand, setBrand] = useState<Brand>("aosmith");
  const [serial, setSerial] = useState(BRANDS[0].example);
  const [today, setToday] = useState<YM>({ year: 2026, month: 10 });
  const ids = { b: useId(), s: useId() };
  useEffect(() => {
    const d = new Date();
    setToday({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }, []);

  let data: WhResult | null = null;
  let error: string | null = null;
  try {
    data = decodeWaterHeater(brand, serial, today);
  } catch (e) {
    error = isToolError(e) ? e.message : "That serial could not be read.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const b = BRANDS.find((x) => x.id === brand)!;

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-[1fr_2fr]">
        <div>
          <label htmlFor={ids.b} className="mb-1.5 block font-medium">
            Brand on the label
          </label>
          <select
            id={ids.b}
            value={brand}
            onChange={(e) => {
              const nb = e.target.value as Brand;
              setBrand(nb);
              setSerial(BRANDS.find((x) => x.id === nb)!.example);
            }}
            className={field}
          >
            {BRANDS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.s} className="mb-1.5 block font-medium">
            Serial number (rating plate)
          </label>
          <input id={ids.s} type="text" autoComplete="off" spellCheck={false} value={serial} onChange={(e) => setSerial(e.target.value)} className={`${field} font-mono tracking-wider uppercase`} />
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">
        {b.hint} The example is the maker&rsquo;s own sample — type yours. Nothing is sent anywhere.
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
