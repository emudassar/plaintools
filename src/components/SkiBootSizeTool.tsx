"use client";

import { useState, useId } from "react";
import { convertBootSize, MEN, WOMEN, JUNIOR, RANGES, NORDICA_BOOT_URL, type BootResult, type FromSystem, type Match } from "@/lib/ski-boot-size";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const SYSTEMS: { id: FromSystem; label: string; def: string }[] = [
  { id: "mondo", label: "Mondopoint / foot length (cm or mm)", def: "26.5" },
  { id: "us-men", label: "US men's shoe size", def: "9" },
  { id: "us-women", label: "US women's shoe size", def: "8" },
  { id: "us-youth", label: "US youth shoe size (kids)", def: "4" },
  { id: "us-child", label: "US child shoe size (little kids)", def: "12" },
  { id: "eu-men", label: "EU size (men's chart)", def: "42" },
  { id: "eu-women", label: "EU size (women's chart)", def: "38" },
  { id: "uk-men", label: "UK size (men's chart)", def: "8.5" },
  { id: "uk-women", label: "UK size (women's chart)", def: "5.5" },
];

const dash = (x: number | null) => (x === null ? "–" : String(x));

function describe(m: Match): string {
  if (m.junior) {
    const j = m.junior;
    const us = [j.child !== null ? `US child ${j.child}` : null, j.youth !== null ? `US youth ${j.youth}` : null].filter(Boolean).join(" / ");
    return `Junior: ${us}, UK ${j.uk} → Mondopoint ${j.mondo}`;
  }
  const r = m.adult!;
  if (m.fit) return `${m.table} US ${r.us} · EU ${r.eu} · UK ${r.uk}`;
  return `${m.table}: US ${r.us}, EU ${r.eu}, UK ${r.uk} → Standard fit ${dash(r.standard)}, Performance fit ${dash(r.performance)}`;
}

function ResultCard({ data }: { data: BootResult }) {
  const isMondo = data.from === "mondo";
  let headline: string;
  if (isMondo) {
    const shown = data.mondoLooked.map((m) => m.toString()).join(" or ");
    headline = `Mondopoint ${shown}`;
  } else {
    const r = data.matches[0];
    if (r.junior) headline = `Mondopoint ${data.matches.map((m) => m.junior!.mondo).join(" / ")}`;
    else if (data.matches.length === 1)
      headline = `Mondopoint ${dash(r.adult!.standard)} standard fit · ${dash(r.adult!.performance)} performance fit`;
    else headline = `Mondopoint ${data.matches.map((m) => dash(m.adult!.standard)).join(" / ")} (standard fit)`;
  }
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">{SYSTEMS.find((s) => s.id === data.from)?.label} · {data.value}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{headline}</p>
        {data.between && (
          <p className="mt-1 text-[var(--color-muted)]">
            {data.value >= 100 ? `${data.value} mm is ${data.value / 10} cm, which` : `${data.value} cm`} falls between Mondopoint {data.between[0]} and{" "}
            {data.between[1]}. Nordica&rsquo;s chart does not say how to round, so both are shown.
          </p>
        )}
        {!isMondo && data.matches.length > 1 && !data.matches[0].junior && (
          <p className="mt-1 text-[var(--color-muted)]">That EU size appears on {data.matches.length} rows of Nordica&rsquo;s chart, so each is listed below.</p>
        )}
        <ul className="mt-3 space-y-1">
          {data.matches.map((m, i) => (
            <li key={i}>
              {m.fit ? <span className="font-medium">{data.mondoLooked.length > 1 ? `Mondopoint ${m.fit === "Standard fit" ? m.adult!.standard : m.adult!.performance}, ` : ""}{m.fit} = </span> : null}
              {describe(m)}
            </li>
          ))}
        </ul>
        {data.matches.some((m) => m.adult) && (
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Nordica: Standard fit is for beginner to intermediate skiers who ski less often and at lower speeds; Performance fit is for
            intermediate to advanced skiers who ski regularly and at higher speeds.
          </p>
        )}
      </div>
      <div className="p-5 text-sm">
        <details className="mb-5">
          <summary className="cursor-pointer font-semibold tracking-wide uppercase">Nordica&rsquo;s full chart</summary>
          {(["Men's", "Women's"] as const).map((t) => (
            <div key={t} className="mt-3">
              <p className="font-medium">{t}</p>
              <table className="w-full text-left">
                <thead className="text-[var(--color-muted)]">
                  <tr>
                    <th className="py-1 font-medium">US</th>
                    <th className="py-1 font-medium">EU</th>
                    <th className="py-1 font-medium">UK</th>
                    <th className="py-1 font-medium">Mondo standard</th>
                    <th className="py-1 font-medium">Mondo performance</th>
                  </tr>
                </thead>
                <tbody>
                  {(t === "Men's" ? MEN : WOMEN).map((r) => (
                    <tr key={r.us} className="border-t border-[var(--color-line)]">
                      <td className="py-1">{r.us}</td>
                      <td className="py-1">{r.eu}</td>
                      <td className="py-1">{r.uk}</td>
                      <td className="py-1">{dash(r.standard)}</td>
                      <td className="py-1">{dash(r.performance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <div className="mt-3">
            <p className="font-medium">Junior</p>
            <table className="w-full text-left">
              <thead className="text-[var(--color-muted)]">
                <tr>
                  <th className="py-1 font-medium">US child</th>
                  <th className="py-1 font-medium">US youth</th>
                  <th className="py-1 font-medium">UK</th>
                  <th className="py-1 font-medium">Mondopoint</th>
                </tr>
              </thead>
              <tbody>
                {JUNIOR.map((r) => (
                  <tr key={r.mondo} className="border-t border-[var(--color-line)]">
                    <td className="py-1">{dash(r.child)}</td>
                    <td className="py-1">{dash(r.youth)}</td>
                    <td className="py-1">{r.uk}</td>
                    <td className="py-1">{r.mondo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          Whether a boot will fit. Mondopoint is foot length only; width (Nordica builds 98, 100 and 102 mm lasts), instep volume and
          flex matter as much. Shoe sizes also vary between shoe brands, so measuring your foot in centimetres is more reliable than
          converting a shoe size. This is not boot sole length (BSL), the number used to set bindings.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Source: Nordica Ski Boot Sizing Chart (men&rsquo;s, women&rsquo;s and junior tables). Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={NORDICA_BOOT_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Nordica Ski Boot Sizing Chart (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function SkiBootSizeTool() {
  const [from, setFrom] = useState<FromSystem>("mondo");
  const [value, setValue] = useState("26.5");
  const ids = { f: useId(), v: useId() };

  let data: BootResult | null = null;
  let error: string | null = null;
  try {
    data = convertBootSize(from, value.trim() === "" ? NaN : Number(value.replace(",", ".")));
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor={ids.f} className="mb-1.5 block font-medium">
            I know my…
          </label>
          <select
            id={ids.f}
            value={from}
            onChange={(e) => {
              const s = SYSTEMS.find((x) => x.id === e.target.value)!;
              setFrom(s.id);
              setValue(s.def);
            }}
            className={field}
          >
            {SYSTEMS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.v} className="mb-1.5 block font-medium">
            Size
          </label>
          <input id={ids.v} type="text" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className={field} />
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">
        {from === "mondo"
          ? "Mondopoint is your foot length heel to big toe, standing, in cm. A boot marked 26.5 or 265 is Mondopoint 26.5."
          : `Nordica's chart covers ${RANGES[from as Exclude<FromSystem, "mondo">]}.`}
      </p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">No match on the chart</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} />
        )}
      </div>
    </div>
  );
}
