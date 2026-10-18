"use client";

import { useMemo, useState } from "react";
import { Ext, n } from "./GeoBits";
import { Btn, useMounted } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import { moonPosition, nextPhases, phaseName, SCHLYTER_URL, USNO_PHASES_URL, type PhaseEvent } from "@/lib/moon";
import { zonedParts, zonedToUtc } from "@/lib/sun-position";
import { fmtInZone } from "@/lib/tz";
import { toCsv } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";

const ZONES = (() => {
  try {
    return (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone") ?? [];
  } catch {
    return [];
  }
})();

/** The moon's disc lit as seen from the northern (or southern) hemisphere. */
export function MoonDisc({ elongation, size = 34, south = false }: { elongation: number; size?: number; south?: boolean }) {
  const r = size / 2 - 1;
  const e = ((elongation % 360) + 360) % 360;
  const k = (1 - Math.cos((e * Math.PI) / 180)) / 2; // lit fraction
  const waxing = e < 180;
  // Lit limb on the right while waxing (northern view); the terminator is an ellipse with semi-axis |1-2k|·r.
  const rightLit = waxing !== south;
  const tx = Math.abs(1 - 2 * k) * r;
  const sweepLimb = rightLit ? 1 : 0;
  const sweepTerm = k > 0.5 ? (rightLit ? 1 : 0) : rightLit ? 0 : 1;
  const c = size / 2;
  const d = `M${c} ${c - r} A${r} ${r} 0 0 ${sweepLimb} ${c} ${c + r} A${tx} ${r} 0 0 ${sweepTerm} ${c} ${c - r}Z`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={c} cy={c} r={r} fill="#1f2937" />
      {k > 0.005 && <path d={d} fill="#f8f3d4" />}
      <circle cx={c} cy={c} r={r} fill="none" stroke="#9ca3af" strokeWidth={0.6} />
    </svg>
  );
}

function MoonPhaseCalendarToolInner() {
  const now = new Date();
  const [zone, setZone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [south, setSouth] = useState(false);
  const [view, setView] = useState<"month" | "year">("month");

  const days = useMemo(() => {
    const out: { d: number; noon: number; el: number; illum: number }[] = [];
    const dim = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let d = 1; d <= dim; d++) {
      const noon = zonedToUtc(year, month, d, 12, 0, zone);
      const p = moonPosition(noon);
      out.push({ d, noon, el: p.elongation, illum: p.illumination });
    }
    return out;
  }, [year, month, zone]);

  const events = useMemo(() => {
    const start = zonedToUtc(year, view === "year" ? 1 : month, 1, 0, 0, zone);
    const end = view === "year" ? zonedToUtc(year + 1, 1, 1, 0, 0, zone) : zonedToUtc(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, 1, 0, 0, zone);
    return nextPhases(start, view === "year" ? 54 : 6).filter((e) => e.ms < end);
  }, [year, month, zone, view]);

  const byDay = new Map<number, PhaseEvent>();
  for (const e of events) {
    const p = zonedParts(e.ms, zone);
    if (p.y === year && p.m === month) byDay.set(p.d, e);
  }
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const fmt = (ms: number) => fmtInZone(ms, zone, { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  const monthName = new Date(Date.UTC(year, month - 1, 15)).toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const step = (dm: number) => {
    let m = month + dm, y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-4">
        <label className="block">
          <span className="mb-1.5 block font-medium">Month</span>
          <select className={fieldClass} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>
                {new Date(Date.UTC(2026, i, 15)).toLocaleString("en-US", { month: "long", timeZone: "UTC" })}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block font-medium">Year</span>
          <input type="number" min={1900} max={2100} className={fieldClass} value={year} onChange={(e) => setYear(Math.max(1900, Math.min(2100, Number(e.target.value) || now.getFullYear())))} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block font-medium">Time zone for phase times</span>
          {ZONES.length ? (
            <select className={fieldClass} value={zone} onChange={(e) => setZone(e.target.value)}>
              {ZONES.map((z) => (
                <option key={z}>{z}</option>
              ))}
              {!ZONES.includes(zone) && <option>{zone}</option>}
            </select>
          ) : (
            <input className={fieldClass} value={zone} readOnly />
          )}
        </label>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Btn onClick={() => step(-1)}>← Previous</Btn>
        <Btn onClick={() => step(1)}>Next →</Btn>
        <Btn onClick={() => setView(view === "month" ? "year" : "month")}>{view === "month" ? `All phases in ${year}` : "Back to the month"}</Btn>
        <label className="ml-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={south} onChange={(e) => setSouth(e.target.checked)} /> Southern hemisphere view
        </label>
      </div>

      {view === "month" ? (
        <>
          <h2 className="mb-2 text-xl font-semibold">
            {monthName} {year}
          </h2>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-1 font-medium text-[var(--color-muted)]">
                {d}
              </div>
            ))}
            {Array.from({ length: firstDow }, (_, i) => (
              <div key={`x${i}`} />
            ))}
            {days.map((d) => {
              const ev = byDay.get(d.d);
              return (
                <div key={d.d} className={`flex flex-col items-center rounded-md border p-1 ${ev ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : "border-[var(--color-line)]"}`} title={`${phaseName(d.el)}, ${n(d.illum * 100, 0)}% lit at noon`}>
                  <span className="self-start text-[11px] font-medium">{d.d}</span>
                  <MoonDisc elongation={d.el} size={30} south={south} />
                  <span className="mt-0.5 text-[10px] text-[var(--color-muted)]">{n(d.illum * 100, 0)}%</span>
                  {ev && <span className="text-[10px] leading-tight font-semibold">{ev.name}</span>}
                </div>
              );
            })}
          </div>
          <div className="mt-4 overflow-x-auto rounded-md border border-[var(--color-line)]">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-[var(--color-line)]">
                {events.map((e) => (
                  <tr key={e.ms}>
                    <td className="px-3 py-2 font-medium">{e.name}</td>
                    <td className="px-3 py-2">{fmt(e.ms)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Moon phases in {year}</h2>
            <Btn onClick={() => downloadText(toCsv([["phase", "date_time_utc", `local_${zone}`], ...events.map((e) => [e.name, new Date(e.ms).toISOString().slice(0, 16) + "Z", fmt(e.ms)])]), `moon-phases-${year}.csv`, "text/csv")}>Download CSV</Btn>
          </div>
          <div className="overflow-x-auto rounded-md border border-[var(--color-line)]">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-[var(--color-line)]">
                {events.map((e) => (
                  <tr key={e.ms} className={e.name === "Full Moon" ? "bg-[var(--color-accent-soft)]" : ""}>
                    <td className="px-3 py-1.5">
                      <MoonDisc elongation={moonPosition(e.ms).elongation} size={20} south={south} />
                    </td>
                    <td className="px-3 py-1.5 font-medium">{e.name}</td>
                    <td className="px-3 py-1.5">{fmt(e.ms)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Phases are the instants the moon&apos;s ecliptic longitude is 0°, 90°, 180° and 270° from the sun&apos;s, computed with Paul Schlyter&apos;s method (<Ext href={SCHLYTER_URL}>stjarnhimlen.se</Ext>);
        checked against the <Ext href={USNO_PHASES_URL}>US Naval Observatory phase tables</Ext> for October–December 2026 (all within 10 minutes). Daily pictures and percentages are for local noon. Times are shown in the zone you
        choose, with daylight saving applied. Calculated in your browser.
      </p>
    </div>
  );
}

export default function MoonPhaseCalendarTool() {
  const mounted = useMounted();
  return mounted ? <MoonPhaseCalendarToolInner /> : <p className="rounded-lg border border-[var(--color-line)] p-5 text-sm text-[var(--color-muted)]">Drawing the calendar…</p>;
}
