"use client";

import { useState } from "react";
import { occupantLoad, FACTORS, IBC_CH10_URL, OCC_RETRIEVED } from "@/lib/occupancy-load";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, DataTable, attempt, num, fmt } from "./CalcBits";

const opts = FACTORS.map((f) => [f.key, `${f.label} — ${f.sqft} ${f.basis}`] as const) as [string, string][];

export default function OccupancyLoadTool() {
  const [spaces, setSpaces] = useState([
    { key: "unconcentrated", area: "1200", lanes: "0" },
    { key: "kitchen", area: "400", lanes: "0" },
  ]);
  const set = (i: number, k: "key" | "area" | "lanes", v: string) => setSpaces((x) => x.map((y, j) => (j === i ? { ...y, [k]: v } : y)));
  const btn = "rounded-md border border-[var(--color-line)] px-3 py-1.5 text-sm";

  const result = attempt(() => occupantLoad(spaces.map((s) => ({ factorKey: s.key, areaSqFt: num(s.area), lanes: num(s.lanes) }))));

  return (
    <div>
      {spaces.map((s, i) => (
        <Grid cols={3} key={i}>
          <SelectField label={`Space ${i + 1}: function`} value={s.key} onChange={(v) => set(i, "key", v)} options={opts} />
          <NumField label="Floor area (ft²)" value={s.area} onChange={(v) => set(i, "area", v)} hint={FACTORS.find((f) => f.key === s.key)?.basis === "net" ? "Net area: exclude walls, corridors, toilets, closets." : "Gross area: inside the exterior walls."} />
          {s.key === "bowling" && <NumField label="Lanes" value={s.lanes} onChange={(v) => set(i, "lanes", v)} step="1" />}
        </Grid>
      ))}
      <div className="mb-4 flex gap-2">
        <button type="button" className={btn} onClick={() => setSpaces((x) => [...x, { key: "business", area: "1000", lanes: "0" }])}>
          Add a space
        </button>
        {spaces.length > 1 && (
          <button type="button" className={btn} onClick={() => setSpaces((x) => x.slice(0, -1))}>
            Remove last
          </button>
        )}
      </div>
      <Hint>Spaces without fixed seating. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Occupant load (IBC Table 1004.5)"
            headline={`${d.total.toLocaleString("en-US")} occupants`}
            sub={`${d.rows.length} space${d.rows.length > 1 ? "s" : ""}; each rounded up to whole people`}
            limits="What your building official will accept. The official decides the function of a space, gross vs net areas, any approved increase, and how egress, exits and plumbing follow from the load. Fixed seating, malls and local amendments use other rules. This is for planning only."
            method={
              <p>
                Method: floor area ÷ occupant load factor (ft² per occupant), rounded up — 2021 IBC §1004.5 and{" "}
                <a className="underline" href={IBC_CH10_URL}>
                  Table 1004.5
                </a>
                ; §1004.5.1 caps an approved increase at one occupant per 7 ft². Read on codes.iccsafe.org {OCC_RETRIEVED}.
              </p>
            }
          >
            <DataTable
              head={["Function", "Area", "Factor", "Occupants", "Max if increase approved (1 per 7 ft²)"]}
              rows={d.rows.map((r) => [r.factor.label, `${fmt(r.areaSqFt, 0)} ft²`, `${r.factor.sqft} ${r.factor.basis}`, `${r.occupants} (${fmt(r.exact, 2)})`, String(r.maxIncreased)])}
            />
          </ResultCard>
        )}
      />
    </div>
  );
}
