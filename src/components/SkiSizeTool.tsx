"use client";

import { useState, useId } from "react";
import {
  skiSize,
  ftInToCm,
  lbToKg,
  ADULT_ROWS,
  CHILD_ROWS,
  ADULT_SHORTER,
  ADULT_LONGER,
  CHILD_SHORTER,
  CHILD_LONGER,
  NORDICA_SIZER_URL,
  type SkiResult,
} from "@/lib/ski-size";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const cmToFtIn = (cm: number) => {
  const total = Math.round(cm / 2.54);
  return `${Math.floor(total / 12)}′${total % 12}″`;
};

function ResultCard({ data }: { data: SkiResult }) {
  const adult = data.who === "adult";
  const leanText =
    data.lean === "shorter"
      ? `More of your answers point shorter, so Nordica's guidance leans toward the ${data.min} cm end (${adult ? "closer to your chin" : "closer to the chest"}).`
      : data.lean === "longer"
        ? `More of your answers point longer, so Nordica's guidance leans toward the ${data.max} cm end (${adult ? "closer to the top of your head" : "closer to the nose"}).`
        : `Your answers don't lean either way (or none are ticked), so the whole ${data.min}–${data.max} cm range applies.`;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {adult ? "Adult" : "Child"} · height {Math.round(data.heightCm)} cm ({cmToFtIn(data.heightCm)})
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          Suggested ski length: {data.min}–{data.max} cm
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          Chart row: {data.rowLabel}. {data.rowNote}
        </p>
        {data.altRow && (
          <p className="mt-1 text-[var(--color-muted)]">
            The other row: {data.altRow.label} → {data.altRow.min}–{data.altRow.max} cm.
          </p>
        )}
        <p className="mt-2">{leanText}</p>
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">Nordica&rsquo;s {adult ? "adult" : "child"} chart</h3>
        <div className="mb-5 max-h-72 overflow-y-auto">
          {adult ? (
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white text-[var(--color-muted)]">
                <tr>
                  <th className="py-1 font-medium">Height</th>
                  <th className="py-1 font-medium">cm</th>
                  <th className="py-1 font-medium">Ski length (cm)</th>
                </tr>
              </thead>
              <tbody>
                {ADULT_ROWS.map((r) => (
                  <tr key={r.cm} className={`border-t border-[var(--color-line)] ${data.rowLabel.startsWith(r.ftIn) ? "bg-[var(--color-accent-soft)] font-semibold" : ""}`}>
                    <td className="py-1">{r.ftIn}</td>
                    <td className="py-1">{r.cm}</td>
                    <td className="py-1">
                      {r.min}–{r.max}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white text-[var(--color-muted)]">
                <tr>
                  <th className="py-1 font-medium">Age</th>
                  <th className="py-1 font-medium">Height</th>
                  <th className="py-1 font-medium">Weight</th>
                  <th className="py-1 font-medium">Ski length (cm)</th>
                </tr>
              </thead>
              <tbody>
                {CHILD_ROWS.map((r) => (
                  <tr key={r.age} className={`border-t border-[var(--color-line)] ${data.rowLabel.startsWith(`age ${r.age} `) ? "bg-[var(--color-accent-soft)] font-semibold" : ""}`}>
                    <td className="py-1">{r.age}</td>
                    <td className="py-1">
                      {r.in} in / {r.cm} cm
                    </td>
                    <td className="py-1">
                      {r.lbs} lb / {r.kg} kg
                    </td>
                    <td className="py-1">
                      {r.min}–{r.max}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!adult && <p className="mb-5 text-xs text-[var(--color-muted)]">Nordica: height and weight for age are based on the 50th percentile for children.</p>}
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          The right length for one particular ski. This is Nordica&rsquo;s general chart; other brands, and individual models with more
          rocker or a different shape, are sized differently. Check the size range printed for the exact model you are buying.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: Nordica Ski Sizer ({adult ? "adult chart, page 1" : "child chart, page 2"}), with Nordica&rsquo;s go-shorter / go-longer
            reasons. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={NORDICA_SIZER_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Nordica Ski Sizer (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

function Checks({ title, items, state, set }: { title: string; items: readonly string[]; state: boolean[]; set: (v: boolean[]) => void }) {
  return (
    <fieldset className="rounded-md border border-[var(--color-line)] p-3">
      <legend className="px-1 text-sm font-medium">{title}</legend>
      {items.map((label, i) => (
        <label key={label} className="mt-1 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={state[i] ?? false}
            onChange={(e) => {
              const next = [...state];
              next[i] = e.target.checked;
              set(next);
            }}
          />
          <span>{label}</span>
        </label>
      ))}
    </fieldset>
  );
}

export default function SkiSizeTool() {
  const [who, setWho] = useState<"adult" | "child">("adult");
  const [unit, setUnit] = useState<"ftin" | "cm">("ftin");
  const [ft, setFt] = useState("5");
  const [inch, setInch] = useState("8");
  const [cm, setCm] = useState("173");
  const [weight, setWeight] = useState("");
  const [wUnit, setWUnit] = useState<"lb" | "kg">("lb");
  const [shorter, setShorter] = useState<boolean[]>([]);
  const [longer, setLonger] = useState<boolean[]>([]);
  const ids = { ft: useId(), in: useId(), cm: useId(), u: useId(), w: useId(), wu: useId() };

  const switchWho = (w: "adult" | "child") => {
    setWho(w);
    setShorter([]);
    setLonger([]);
    if (w === "child") {
      setFt("4");
      setInch("3");
      setCm("130");
    } else {
      setFt("5");
      setInch("8");
      setCm("173");
    }
  };

  const heightCm = unit === "cm" ? (cm.trim() === "" ? NaN : Number(cm)) : ft.trim() === "" && inch.trim() === "" ? NaN : ftInToCm(Number(ft || 0), Number(inch || 0));
  const w = weight.trim() === "" ? null : wUnit === "kg" ? Number(weight) : lbToKg(Number(weight));

  let data: SkiResult | null = null;
  let error: string | null = null;
  try {
    data = skiSize({ who, heightCm, weightKg: who === "child" ? w : null, shorterCount: shorter.filter(Boolean).length, longerCount: longer.filter(Boolean).length });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const tab = (active: boolean) =>
    `rounded-md border px-4 py-2 font-medium ${active ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : "border-[var(--color-line)] bg-white"}`;

  return (
    <div>
      <div className="mb-4 flex gap-2" role="group" aria-label="Skier">
        <button type="button" className={tab(who === "adult")} aria-pressed={who === "adult"} onClick={() => switchWho("adult")}>
          Adult
        </button>
        <button type="button" className={tab(who === "child")} aria-pressed={who === "child"} onClick={() => switchWho("child")}>
          Child (3–14)
        </button>
      </div>
      <div className="mb-3 grid gap-3 sm:grid-cols-[2fr_1fr]">
        {unit === "ftin" ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={ids.ft} className="mb-1.5 block font-medium">
                Height: feet
              </label>
              <input id={ids.ft} type="number" inputMode="numeric" min="0" step="1" value={ft} onChange={(e) => setFt(e.target.value)} className={field} />
            </div>
            <div>
              <label htmlFor={ids.in} className="mb-1.5 block font-medium">
                inches
              </label>
              <input id={ids.in} type="number" inputMode="decimal" min="0" step="any" value={inch} onChange={(e) => setInch(e.target.value)} className={field} />
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor={ids.cm} className="mb-1.5 block font-medium">
              Height (cm)
            </label>
            <input id={ids.cm} type="number" inputMode="decimal" min="0" step="any" value={cm} onChange={(e) => setCm(e.target.value)} className={field} />
          </div>
        )}
        <div>
          <label htmlFor={ids.u} className="mb-1.5 block font-medium">
            Height unit
          </label>
          <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as "ftin" | "cm")} className={field}>
            <option value="ftin">feet and inches</option>
            <option value="cm">centimetres</option>
          </select>
        </div>
      </div>
      {who === "child" && (
        <div className="mb-3 grid gap-3 sm:grid-cols-[2fr_1fr]">
          <div>
            <label htmlFor={ids.w} className="mb-1.5 block font-medium">
              Weight (optional — decides between two rows)
            </label>
            <input id={ids.w} type="number" inputMode="decimal" min="0" step="any" value={weight} onChange={(e) => setWeight(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor={ids.wu} className="mb-1.5 block font-medium">
              Weight unit
            </label>
            <select id={ids.wu} value={wUnit} onChange={(e) => setWUnit(e.target.value as "lb" | "kg")} className={field}>
              <option value="lb">pounds</option>
              <option value="kg">kilograms</option>
            </select>
          </div>
        </div>
      )}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Checks title="Go shorter if… (tick any)" items={who === "adult" ? ADULT_SHORTER : CHILD_SHORTER} state={shorter} set={setShorter} />
        <Checks title="Go longer if… (tick any)" items={who === "adult" ? ADULT_LONGER : CHILD_LONGER} state={longer} set={setLonger} />
      </div>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">No length for that input</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} />
        )}
      </div>
    </div>
  );
}
