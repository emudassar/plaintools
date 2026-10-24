"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, ResultCard, SelectField } from "./CalcBits";
import { Ext } from "./GeoBits";
import { ASPECTS, ASPECT_URL, FUN_RETRIEVED, SIGNS, SIGNS_URL, signFromDate, zodiacPair, type SignId } from "@/lib/fun-tools";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function SignPicker({ title, sign, onChange }: { title: string; sign: SignId; onChange: (s: SignId) => void }) {
  const [m, setM] = useState("");
  const [d, setD] = useState("");
  const pick = (mm: string, dd: string) => {
    setM(mm);
    setD(dd);
    if (mm && dd) onChange(signFromDate(Number(mm), Number(dd)));
  };
  return (
    <div className="rounded-md border border-[var(--color-line)] p-3">
      <SelectField label={title} value={sign} onChange={onChange} options={SIGNS.map((s) => [s.id, `${s.name} (from ${MONTHS[s.start[0] - 1].slice(0, 3)} ${s.start[1]})`] as const)} />
      <p className="mt-2 mb-1 text-sm text-[var(--color-muted)]">or pick a birthday</p>
      <div className="grid grid-cols-2 gap-2">
        <select className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5" value={m} onChange={(e) => pick(e.target.value, d)} aria-label={`${title} birth month`}>
          <option value="">Month</option>
          {MONTHS.map((n, i) => (
            <option key={n} value={i + 1}>
              {n}
            </option>
          ))}
        </select>
        <select className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5" value={d} onChange={(e) => pick(m, e.target.value)} aria-label={`${title} birth day`}>
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function ZodiacTool() {
  const [a, setA] = useState<SignId>("aries");
  const [b, setB] = useState<SignId>("leo");
  const r = zodiacPair(a, b);

  return (
    <div>
      <Grid cols={2}>
        <SignPicker title="First sign" sign={a} onChange={setA} />
        <SignPicker title="Second sign" sign={b} onChange={setB} />
      </Grid>
      <Hint>Sign dates are approximate: the sun enters each sign on a slightly different day each year, so birthdays on the first or last day of a sign can fall either side.</Hint>
      <div aria-live="polite">
        <ResultCard
          label={`${r.a.name} and ${r.b.name}`}
          headline={`${r.aspect.name} — ${r.steps === 0 ? "same sign" : `${r.steps} sign${r.steps === 1 ? "" : "s"} apart (${r.aspect.angle}°)`}`}
          sub={r.aspect.tradition}
          rows={[
            [r.a.name, `${r.a.element} · ${r.a.modality}`],
            [r.b.name, `${r.b.element} · ${r.b.modality}`],
            ["Same element", r.sameElement ? `Yes — both ${r.a.element}` : "No"],
            ["Same modality", r.sameModality ? `Yes — both ${r.a.modality}` : "No"],
          ]}
          limits="This reports what astrological tradition says about the angle between two sun signs; it is not a prediction and astrology has no scientific support. Astrologers who compare full birth charts look at many more factors than sun signs, and they do not all agree on interpretations."
          method={
            <p>
              Sign dates, elements and modalities: <Ext href={SIGNS_URL}>Astrological sign</Ext>. The relationship is the aspect two signs make around the 12-sign circle (30° each), with traditional readings from{" "}
              <Ext href={ASPECT_URL}>Astrological aspect</Ext>. Retrieved {FUN_RETRIEVED}.
            </p>
          }
        >
          <h3 className="mb-2 font-semibold tracking-wide uppercase">{r.a.name} with every sign</h3>
          <DataTable
            head={["Sign", "Aspect", "Element"]}
            rows={SIGNS.map((s) => {
              const p = zodiacPair(a, s.id);
              return [s.name, ASPECTS[p.steps].name, s.element];
            })}
            highlight={SIGNS.findIndex((s) => s.id === b)}
          />
        </ResultCard>
      </div>
    </div>
  );
}
