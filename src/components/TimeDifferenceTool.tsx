"use client";

import { useEffect, useState } from "react";
import { Ext } from "./GeoBits";
import { Btn, useMounted } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import { geocodeAddress } from "@/lib/geocode";
import { timeZoneAt } from "@/lib/timezone-lookup";
import { abbreviation, fmtInZone, fmtOffset, IANA_TZ_URL, isValidZone, offsetMinutes } from "@/lib/tz";
import { zonedParts, zonedToUtc } from "@/lib/sun-position";
import { asToolError } from "@/lib/errors";

const ZONES: string[] = (() => {
  try {
    return (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone") ?? [];
  } catch {
    return [];
  }
})();

interface Entry {
  label: string;
  tz: string;
}

const START: Entry[] = [
  { label: "New York", tz: "America/New_York" },
  { label: "London", tz: "Europe/London" },
  { label: "Karachi", tz: "Asia/Karachi" },
  { label: "Tokyo", tz: "Asia/Tokyo" },
];

const diffText = (min: number) => {
  if (min === 0) return "same time";
  const h = Math.floor(Math.abs(min) / 60), m = Math.abs(min) % 60;
  return `${h ? `${h} h` : ""}${h && m ? " " : ""}${m ? `${m} min` : ""} ${min > 0 ? "ahead" : "behind"}`;
};

function TimeDifferenceToolInner() {
  const [list, setList] = useState<Entry[]>(START);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [date, setDate] = useState(() => {
    const p = zonedParts(Date.now(), START[0].tz);
    return `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
  });
  const [convTime, setConvTime] = useState("09:00");

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  async function add() {
    const text = q.trim();
    if (!text) return;
    setMsg(null);
    const direct = ZONES.find((z) => z.toLowerCase() === text.toLowerCase().replace(/ /g, "_")) ?? (isValidZone(text) && text.includes("/") ? text : null);
    if (direct) {
      setList((l) => [...l, { label: direct.split("/").pop()!.replace(/_/g, " "), tz: direct }]);
      setQ("");
      return;
    }
    setBusy(true);
    try {
      const g = await geocodeAddress(text, { preferUS: false });
      const tz = await timeZoneAt(g.lat, g.lon);
      setList((l) => [...l, { label: g.label.split(",")[0], tz }]);
      setQ("");
    } catch (e) {
      setMsg(asToolError(e).message);
    } finally {
      setBusy(false);
    }
  }

  const [y, m, d] = date.split("-").map(Number);
  const base = list[0];
  const dayStart = base ? zonedToUtc(y, m, d, 0, 0, base.tz) : now;
  const [ch, cm] = convTime.split(":").map(Number);
  const convAt = base ? zonedToUtc(y, m, d, ch || 0, cm || 0, base.tz) : now;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input className={`${fieldClass} min-w-0 flex-1`} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void add()} placeholder="Add a city, address or time zone (e.g. Sydney, or Europe/Berlin)" list="tz-list" />
        <datalist id="tz-list">
          {ZONES.map((z) => (
            <option key={z} value={z} />
          ))}
        </datalist>
        <Btn primary onClick={() => void add()} disabled={busy || list.length >= 8}>
          {busy ? "Finding…" : "Add"}
        </Btn>
      </div>
      {msg && <p className="mt-2 text-sm">{msg}</p>}

      <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--color-line)]">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-[var(--color-line)]">
            {list.map((e, i) => {
              const off = offsetMinutes(e.tz, now);
              const diff = base ? off - offsetMinutes(base.tz, now) : 0;
              return (
                <tr key={`${e.tz}${i}`} className={i === 0 ? "bg-[var(--color-accent-soft)]" : ""}>
                  <td className="px-3 py-2">
                    <span className="font-semibold">{e.label}</span>
                    <span className="block text-xs text-[var(--color-muted)]">{e.tz}</span>
                  </td>
                  <td className="px-3 py-2 text-lg font-semibold tabular-nums">{fmtInZone(now, e.tz, { hour: "numeric", minute: "2-digit" })}</td>
                  <td className="px-3 py-2 text-xs">
                    {fmtInZone(now, e.tz, { weekday: "short", month: "short", day: "numeric" })}
                    <span className="block text-[var(--color-muted)]">
                      {abbreviation(e.tz, now)} · {fmtOffset(off)}
                    </span>
                  </td>
                  <td className="px-3 py-2">{i === 0 ? "reference" : `${diffText(diff)} of ${base.label}`}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {i > 0 && (
                      <button type="button" className="mr-1 rounded border border-[var(--color-line)] px-2 py-1 text-xs" onClick={() => setList((l) => [l[i], ...l.filter((_, j) => j !== i)])}>
                        Make reference
                      </button>
                    )}
                    <button type="button" className="rounded border border-[var(--color-line)] px-2 py-1 text-xs" onClick={() => setList((l) => l.filter((_, j) => j !== i))} aria-label={`Remove ${e.label}`}>
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {base && list.length > 1 && (
        <>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Date (in {base.label})</span>
              <input type="date" className={fieldClass} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Convert a time in {base.label}</span>
              <input type="time" className={fieldClass} value={convTime} onChange={(e) => setConvTime(e.target.value)} />
            </label>
            <p className="pb-2 text-sm">
              {list.slice(1).map((e) => `${e.label}: ${fmtInZone(convAt, e.tz, { weekday: "short", hour: "numeric", minute: "2-digit" })}`).join(" · ")}
            </p>
          </div>
          <h3 className="mt-5 mb-2 font-semibold">Meeting planner — the same 24 hours in every place</h3>
          <div className="overflow-x-auto rounded-md border border-[var(--color-line)]">
            <table className="text-center text-xs">
              <tbody>
                {list.map((e) => (
                  <tr key={e.tz + e.label}>
                    <th className="sticky left-0 bg-white px-2 py-1 text-left font-medium whitespace-nowrap">{e.label}</th>
                    {Array.from({ length: 24 }, (_, h) => {
                      const t = dayStart + h * 3600_000;
                      const p = zonedParts(t, e.tz);
                      const work = p.hh >= 9 && p.hh < 17;
                      const night = p.hh < 7 || p.hh >= 22;
                      return (
                        <td key={h} className="min-w-9 border-l border-[var(--color-line)] px-1 py-1" style={{ background: work ? "#dcfce7" : night ? "#e5e7eb" : undefined }} title={fmtInZone(t, e.tz, { dateStyle: "medium", timeStyle: "short" })}>
                          {p.hh}
                          {p.mm ? <sup>:{String(p.mm).padStart(2, "0")}</sup> : null}
                          {p.hh === 0 && <span className="block text-[9px] text-[var(--color-muted)]">{fmtInZone(t, e.tz, { month: "short", day: "numeric" })}</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <th className="sticky left-0 bg-white px-2 py-1 text-left font-medium">Everyone 9–5?</th>
                  {Array.from({ length: 24 }, (_, h) => {
                    const t = dayStart + h * 3600_000;
                    const all = list.every((e) => {
                      const p = zonedParts(t, e.tz);
                      return p.hh >= 9 && p.hh < 17;
                    });
                    return (
                      <td key={h} className="border-l border-[var(--color-line)] px-1 py-1 font-bold">
                        {all ? "✓" : ""}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-1 text-xs text-[var(--color-muted)]">Green: 9 am–5 pm. Grey: 10 pm–7 am. Columns are the hours of {date} in {base.label}.</p>
        </>
      )}
      <p className="mt-4 text-xs text-[var(--color-muted)]">
        Offsets and daylight saving rules: the <Ext href={IANA_TZ_URL}>IANA time zone database</Ext> built into your browser, for the date shown. Places are matched to a zone with Photon
        (OpenStreetMap) and Open-Meteo; time zone names are used directly. Clocks update every 15 seconds.
      </p>
    </div>
  );
}

export default function TimeDifferenceTool() {
  const mounted = useMounted();
  return mounted ? <TimeDifferenceToolInner /> : <p className="rounded-lg border border-[var(--color-line)] p-5 text-sm text-[var(--color-muted)]">Loading the clocks…</p>;
}
