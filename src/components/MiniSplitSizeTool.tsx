"use client";

import { useState } from "react";
import { zonesBtu, ESTAR_CHART, ESTAR_URL, ESTAR_RETRIEVED } from "@/lib/room-ac-size";
import { NumField, SelectField, TextField, Grid, Hint, ResultCard, Output, DataTable, attempt, num, fmt } from "./CalcBits";

type Sun = "normal" | "shaded" | "sunny";
interface Z {
  name: string;
  len: string;
  wid: string;
  sun: Sun;
  people: string;
  kitchen: boolean;
}

export default function MiniSplitSizeTool() {
  const [zones, setZones] = useState<Z[]>([
    { name: "Living room", len: "20", wid: "16", sun: "sunny", people: "3", kitchen: false },
    { name: "Bedroom", len: "12", wid: "12", sun: "normal", people: "2", kitchen: false },
  ]);
  const set = <K extends keyof Z>(i: number, k: K, v: Z[K]) => setZones((z) => z.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const result = attempt(() =>
    zonesBtu(zones.map((z) => ({ name: z.name, areaSqFt: num(z.len) * num(z.wid), sun: z.sun, people: num(z.people), kitchen: z.kitchen }))),
  );
  const btn = "rounded-md border border-[var(--color-line)] px-3 py-1.5 text-sm";

  return (
    <div>
      {zones.map((z, i) => (
        <div key={i} className="mb-4 rounded-md border border-[var(--color-line)] p-3">
          <Grid cols={3}>
            <TextField label={`Zone ${i + 1} name`} value={z.name} onChange={(v) => set(i, "name", v)} />
            <NumField label="Length (ft)" value={z.len} onChange={(v) => set(i, "len", v)} />
            <NumField label="Width (ft)" value={z.wid} onChange={(v) => set(i, "wid", v)} />
          </Grid>
          <Grid cols={3}>
            <SelectField label="Sun" value={z.sun} onChange={(v) => set(i, "sun", v)} options={[["normal", "Normal"], ["shaded", "Heavily shaded (−10%)"], ["sunny", "Very sunny (+10%)"]]} />
            <NumField label="People who regularly use it" value={z.people} onChange={(v) => set(i, "people", v)} step="1" />
            <label className="mt-7 flex items-center gap-2">
              <input type="checkbox" checked={z.kitchen} onChange={(e) => set(i, "kitchen", e.target.checked)} />
              Kitchen (+4,000 BTU/h)
            </label>
          </Grid>
        </div>
      ))}
      <div className="mb-4 flex gap-2">
        <button type="button" className={btn} onClick={() => setZones((z) => [...z, { name: `Room ${z.length + 1}`, len: "12", wid: "10", sun: "normal", people: "2", kitchen: false }])}>
          Add a zone
        </button>
        {zones.length > 1 && (
          <button type="button" className={btn} onClick={() => setZones((z) => z.slice(0, -1))}>
            Remove last
          </button>
        )}
      </div>
      <Hint>One zone per indoor head. Rooms with an 8 ft ceiling, as the chart assumes. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Cooling capacity by zone"
            headline={`${Math.round(d.total).toLocaleString("en-US")} BTU/h in total`}
            sub={`${fmt(d.totalTons, 2)} tons (12,000 BTU/h per ton) across ${d.rows.length} zone${d.rows.length > 1 ? "s" : ""}`}
            limits="Your home's actual heat load. ENERGY STAR's chart is area-based guidance written for room air conditioners and assumes 8 ft ceilings; insulation, windows, climate, ceiling height and duct-free layout all change what a mini split needs. Installers size systems with a load calculation (ACCA Manual J). Heating capacity is a separate question this chart does not answer."
            method={
              <p>
                Method: chart figure for the room&rsquo;s area, then ±10% for shade or sun, +600 BTU/h per person beyond two, +4,000 BTU/h for a kitchen
                (applied in that order). Source: ENERGY STAR,{" "}
                <a className="underline" href={ESTAR_URL}>
                  Room Air Conditioners — Properly Sized Room Air Conditioners
                </a>
                . Retrieved {ESTAR_RETRIEVED}.
              </p>
            }
          >
            <DataTable
              head={["Zone", "Area", "Chart", "Adjustments", "BTU/h"]}
              rows={d.rows.map((r) => [
                r.name,
                `${fmt(r.areaSqFt, 0)} ft²`,
                r.chartBtu.toLocaleString("en-US"),
                [r.sunAdj ? `${r.sunAdj > 0 ? "+" : "−"}${Math.abs(r.sunAdj).toLocaleString("en-US")} sun` : "", r.peopleAdj ? `+${r.peopleAdj} people` : "", r.kitchenAdj ? "+4,000 kitchen" : ""]
                  .filter(Boolean)
                  .join(", ") || "—",
                Math.round(r.btu).toLocaleString("en-US"),
              ])}
            />
            <details className="mb-5">
              <summary className="cursor-pointer font-medium">ENERGY STAR chart</summary>
              <div className="mt-3">
                <DataTable head={["Area to be cooled (ft²)", "Capacity needed (BTU/h)"]} rows={ESTAR_CHART.map(([lo, hi, b]) => [`${lo.toLocaleString("en-US")} up to ${hi.toLocaleString("en-US")}`, b.toLocaleString("en-US")])} />
              </div>
            </details>
          </ResultCard>
        )}
      />
    </div>
  );
}
