"use client";

import { useState, useId } from "react";
import {
  MK_BUYING_GUIDE,
  MK_GUIDE_PDF,
  ROUGH_WATER_ADD_IN,
  shaftFor,
  thrustFor,
  THRUST_CHART,
  type ShaftResult,
  type ThrustResult,
} from "@/lib/trolling-motor";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function ThrustCard({ t }: { t: ThrustResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">{n(t.weightLb, 0)} lb fully loaded</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">At least {n(t.minThrustLb, 1)} lb of thrust</p>
        <p className="mt-1 text-[var(--color-muted)]">
          {t.voltage
            ? `Minn Kota's voltage tiers: ${t.voltage.band} = ${t.voltage.volts} V, ${t.voltage.batteries} batter${t.voltage.batteries > 1 ? "ies" : "y"} (the smallest tier that reaches this thrust).`
            : "That is above the highest tier in Minn Kota's buying guide (101-115 lb, 36 V)."}
        </p>
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">Minn Kota&rsquo;s chart</h3>
        <p className="mb-3 text-[var(--color-muted)]">
          First chart row at or above your weight: <strong>{t.chartRow.weight} lb</strong> — max boat length {t.chartRow.length},
          recommended minimum thrust {t.chartRow.thrust} lb, {t.chartRow.batteries}.
        </p>
        <div className="mb-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-line)]">
                <th className="py-1 pr-3">Boat weight (lb)</th>
                <th className="py-1 pr-3">Max length</th>
                <th className="py-1 pr-3">Min thrust (lb)</th>
                <th className="py-1">Batteries</th>
              </tr>
            </thead>
            <tbody>
              {THRUST_CHART.map((r) => (
                <tr key={r.weight} className={`border-b border-[var(--color-line)] ${r === t.chartRow ? "bg-[var(--color-accent-soft)] font-medium" : ""}`}>
                  <td className="py-1 pr-3">{r.weight}</td>
                  <td className="py-1 pr-3">{r.length}</td>
                  <td className="py-1 pr-3">{r.thrust}</td>
                  <td className="py-1">{r.batteries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[var(--color-muted)]">
          The rule is a minimum. Minn Kota adds that if wind or current are major factors where you fish, you&rsquo;ll want a little
          extra thrust; its 4,500 lb row lists 101-112 lb, more than the rule&rsquo;s 90.
        </p>
      </div>
    </div>
  );
}

function ShaftCard({ s, mount }: { s: ShaftResult; mount: "bow" | "transom" }) {
  return (
    <div className="mt-4 rounded-lg border border-[var(--color-line)] p-5 text-sm">
      <h3 className="mb-2 font-semibold tracking-wide uppercase">Shaft length ({mount} mount)</h3>
      {s.gap ? (
        <p className="text-[var(--color-muted)]">
          {n(s.usedIn, 1)}&Prime; falls between rows of Minn Kota&rsquo;s {mount} chart, which has no row for it
          {s.below ? `. Row below: ${s.below.range} → ${s.below.shaft}` : ""}
          {s.above ? `. Row above: ${s.above.range} → ${s.above.shaft}` : ""}. The chart&rsquo;s aim is the motor centre at least 12
          inches under water.
        </p>
      ) : (
        <p className="text-lg font-semibold">
          {s.rows.map((r) => `${r.shaft} (${r.range})`).join(" or ")}
        </p>
      )}
      {!s.gap && (
        <p className="mt-1 text-[var(--color-muted)]">
          For {n(s.usedIn, 1)}&Prime; from the mounting surface to the waterline.
          {s.rows.length > 1 && " Your measurement is the end of one row and the start of the next, so both are shown."}
        </p>
      )}
      {mount === "bow" && (
        <p className="mt-2 text-[var(--color-muted)]">Minn Kota&rsquo;s chart also says: add 9&Prime; for bow-mount Hand Control motors.</p>
      )}
    </div>
  );
}

export default function TrollingMotorTool() {
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [boat, setBoat] = useState("1400");
  const [people, setPeople] = useState("400");
  const [gear, setGear] = useState("200");
  const [mount, setMount] = useState<"bow" | "transom">("bow");
  const [mUnit, setMUnit] = useState<"in" | "cm">("in");
  const [measure, setMeasure] = useState("");
  const [rough, setRough] = useState(false);
  const ids = { u: useId(), b: useId(), p: useId(), g: useId(), m: useId(), mu: useId(), w: useId() };
  const num = (x: string) => (x.trim() === "" ? 0 : Number(x));

  let t: ThrustResult | null = null;
  let error: string | null = null;
  try {
    t = thrustFor(num(boat) + num(people) + num(gear), unit);
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  let s: ShaftResult | null = null;
  let sErr: string | null = null;
  if (measure.trim() !== "") {
    try {
      s = shaftFor(mount, Number(measure), mUnit, rough);
    } catch (e) {
      sErr = isToolError(e) ? e.message : "That measurement could not be used.";
    }
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const inp = (id: string, v: string, set: (s: string) => void, ph?: string) => (
    <input id={id} type="number" inputMode="decimal" min="0" step="any" value={v} placeholder={ph} onChange={(e) => set(e.target.value)} className={field} />
  );
  const lbl = (id: string, text: string) => (
    <label htmlFor={id} className="mb-1.5 block font-medium">
      {text}
    </label>
  );

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <div>
          {lbl(ids.u, "Weight unit")}
          <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as "lb" | "kg")} className={field}>
            <option value="lb">pounds</option>
            <option value="kg">kilograms</option>
          </select>
        </div>
        <div>
          {lbl(ids.b, "Boat weight (hull and engine, no trailer)")}
          {inp(ids.b, boat, setBoat)}
        </div>
        <div>
          {lbl(ids.p, "People aboard (total)")}
          {inp(ids.p, people, setPeople)}
        </div>
        <div>
          {lbl(ids.g, "Gear, batteries, fuel and water")}
          {inp(ids.g, gear, setGear)}
        </div>
      </div>
      <p className="mb-4 text-xs text-[var(--color-muted)]">
        Minn Kota&rsquo;s rule uses the fully loaded weight, people and gear included. Leave a box at 0 if it is already counted.
      </p>
      <div className="mb-2 grid gap-3 sm:grid-cols-3">
        <div>
          {lbl(ids.m, "Mount (for shaft length)")}
          <select id={ids.m} value={mount} onChange={(e) => setMount(e.target.value as "bow" | "transom")} className={field}>
            <option value="bow">bow</option>
            <option value="transom">transom</option>
          </select>
        </div>
        <div>
          {lbl(ids.w, "Mounting surface to waterline")}
          {inp(ids.w, measure, setMeasure, "optional")}
        </div>
        <div>
          {lbl(ids.mu, "Measured in")}
          <select id={ids.mu} value={mUnit} onChange={(e) => setMUnit(e.target.value as "in" | "cm")} className={field}>
            <option value="in">inches</option>
            <option value="cm">centimetres</option>
          </select>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm sm:col-span-3">
          <input type="checkbox" checked={rough} onChange={(e) => setRough(e.target.checked)} />
          I fish in rough water (Minn Kota: add {ROUGH_WATER_ADD_IN}&Prime; to the measurement)
        </label>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">The answer updates as you type; nothing is sent anywhere.</p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          t && <ThrustCard t={t} />
        )}
        {sErr && (
          <div className="mt-4 rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That measurement could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{sErr}</p>
          </div>
        )}
        {s && <ShaftCard s={s} mount={mount} />}
        <footer className="mt-4 text-xs text-[var(--color-muted)]">
          <p>
            Thrust rule, weight chart and shaft charts: Minn Kota Motor Size selection guide (Rev. 8.21.2020). Voltage tiers: Minn Kota
            trolling motor buying guide. Retrieved {t?.retrievedAt ?? "2026-10-05"}.
          </p>
          <p className="mt-1">
            <a href={MK_GUIDE_PDF} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Minn Kota selection guide (PDF)
            </a>{" "}
            ·{" "}
            <a href={MK_BUYING_GUIDE} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Minn Kota buying guide
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
