"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProjectedMapView, { serializeSvg } from "./ProjectedMapView";
import { ErrorBox, Ext, Loading } from "./GeoBits";
import { Btn, useMounted } from "./ToolBits";
import { CENSUS_CB_URL, loadTzUs, loadTzWorld, loadUsStates, TBB_URL, type ProjectedMap, type Region } from "@/lib/projected";
import { abbreviation, dstInfo, fmtInZone, fmtOffset, IANA_TZ_URL, isValidZone, offsetMinutes } from "@/lib/tz";
import { downloadPng } from "@/lib/svg-export";
import { asToolError } from "@/lib/errors";

/** US zones named by their standard offset (hours behind UTC). */
const US_NAMES: Record<number, { name: string; color: string; city: string }> = {
  [-600]: { name: "Hawaii-Aleutian", color: "#f9a8d4", city: "Pacific/Honolulu" },
  [-540]: { name: "Alaska", color: "#c4b5fd", city: "America/Anchorage" },
  [-480]: { name: "Pacific", color: "#93c5fd", city: "America/Los_Angeles" },
  [-420]: { name: "Mountain", color: "#86efac", city: "America/Denver" },
  [-360]: { name: "Central", color: "#fde68a", city: "America/Chicago" },
  [-300]: { name: "Eastern", color: "#fdba74", city: "America/New_York" },
  [-240]: { name: "Atlantic", color: "#fca5a5", city: "America/Puerto_Rico" },
};

const hueFor = (offMin: number) => `hsl(${Math.round((((offMin / 60 + 12) % 26) / 26) * 360)} 70% 76%)`;

function TzMapInner({ which }: { which: "us" | "world" }) {
  const [map, setMap] = useState<ProjectedMap | null>(null);
  const [states, setStates] = useState<ProjectedMap | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [sel, setSel] = useState<string | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    (which === "us" ? Promise.all([loadTzUs(), loadUsStates()]) : Promise.all([loadTzWorld(), Promise.resolve(null)])).then(
      ([m, s]) => {
        setMap({ ...m, regions: m.regions.filter((r) => isValidZone(r.id)) });
        setStates(s);
      },
      (e) => setErr(asToolError(e).message),
    );
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [which]);

  const info = useMemo(() => {
    const m = new Map<string, { off: number; std: number; dst: boolean }>();
    for (const r of map?.regions ?? []) {
      const d = dstInfo(r.id, now);
      m.set(r.id, { off: offsetMinutes(r.id, now), std: d.standardMin, dst: d.observes });
    }
    return m;
  }, [map, Math.floor(now / 3600_000)]); // eslint-disable-line react-hooks/exhaustive-deps

  if (err) return <ErrorBox title="The time zone map did not load" message={err} onRetry={() => location.reload()} />;
  if (!map) return <Loading note="Loading time zone boundaries…" />;

  const fill = (r: Region) => {
    const i = info.get(r.id);
    if (!i) return "#e5e7eb";
    if (which === "us") return US_NAMES[i.std]?.color ?? "#e5e7eb";
    return hueFor(i.off);
  };
  const usGroups = Object.entries(US_NAMES)
    .map(([std, v]) => ({ std: Number(std), ...v }))
    .filter((g) => [...info.values()].some((i) => i.std === g.std));
  const worldGroups = [...new Set([...info.values()].map((i) => i.off))].sort((a, b) => a - b);
  const selInfo = sel ? info.get(sel) : null;

  return (
    <div>
      <ProjectedMapView
        map={map}
        svgRef={svg}
        ariaLabel={which === "us" ? "Map of US time zones" : "Map of world time zones"}
        strokeWidth={which === "us" ? 0.5 : 0.3}
        stroke="#ffffff"
        highlight={sel}
        fill={fill}
        onClick={(r) => setSel(r.id)}
        tooltip={(r) => {
          const i = info.get(r.id);
          return (
            <>
              <strong>{r.id.replace(/_/g, " ")}</strong>
              <br />
              {fmtInZone(now, r.id, { hour: "numeric", minute: "2-digit", weekday: "short" })} · {abbreviation(r.id, now)} ({fmtOffset(i?.off ?? 0)})
              {i && !i.dst ? <><br />No daylight saving time</> : null}
            </>
          );
        }}
      >
        {states && (
          <g pointerEvents="none" fill="none" stroke="#475569" strokeWidth={0.6} strokeOpacity={0.55}>
            {states.regions.map((s) => (
              <path key={s.id} d={s.d} />
            ))}
          </g>
        )}
      </ProjectedMapView>
      <div className="mt-2 flex flex-wrap gap-2">
        <Btn onClick={() => svg.current && void downloadPng(serializeSvg(svg.current), 2400, `${which}-time-zone-map.png`)}>Download PNG</Btn>
        <span className="self-center text-xs text-[var(--color-muted)]">Hover or tap a zone for its local time; click to pin it below. + and − zoom.</span>
      </div>

      {selInfo && sel && (
        <p className="mt-3 rounded-md border border-[var(--color-line)] bg-[var(--color-accent-soft)] p-3 text-sm">
          <strong>{sel}</strong>: {fmtInZone(now, sel, { dateStyle: "full", timeStyle: "short" })} · {abbreviation(sel, now)} · {fmtOffset(selInfo.off)}
          {selInfo.dst ? ` · observes daylight saving (standard ${fmtOffset(selInfo.std)})` : " · no daylight saving"}
        </p>
      )}

      {which === "us" ? (
        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--color-line)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-accent-soft)]">
              <tr>
                <th className="px-3 py-2 font-medium">Zone</th>
                <th className="px-3 py-2 font-medium">Time now</th>
                <th className="px-3 py-2 font-medium">Abbreviation</th>
                <th className="px-3 py-2 font-medium">UTC offset now</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {usGroups.map((g) => (
                <tr key={g.std}>
                  <td className="px-3 py-2">
                    <span className="mr-2 inline-block h-3 w-4 rounded-sm align-middle" style={{ background: g.color }} />
                    {g.name}
                  </td>
                  <td className="px-3 py-2 font-semibold tabular-nums">{fmtInZone(now, g.city, { hour: "numeric", minute: "2-digit", weekday: "short" })}</td>
                  <td className="px-3 py-2">{abbreviation(g.city, now)}</td>
                  <td className="px-3 py-2">{fmtOffset(offsetMinutes(g.city, now))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-[var(--color-line)] px-3 py-2 text-xs text-[var(--color-muted)]">
            Colours show each area&apos;s standard zone. Most of Arizona (America/Phoenix) and all of Hawaii stay on standard time all year, so in summer Arizona&apos;s clocks match Pacific time —
            hover a zone to see its own clock.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
          {worldGroups.map((o) => (
            <span key={o} className="rounded border border-[var(--color-line)] px-1.5 py-1" style={{ background: hueFor(o) }} title={fmtOffset(o)}>
              {fmtOffset(o).replace("UTC", "")} · {new Intl.DateTimeFormat("en-US", { timeZone: "UTC", hour: "numeric", minute: "2-digit" }).format(new Date(now + o * 60000))}
            </span>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Zone boundaries: <Ext href={TBB_URL}>timezone-boundary-builder</Ext> (from OpenStreetMap, ODbL), simplified{which === "us" ? "; state lines from the " : "."}
        {which === "us" && <Ext href={CENSUS_CB_URL}>Census Bureau</Ext>}
        {which === "us" ? "." : ""} Current offsets, abbreviations and daylight saving: the <Ext href={IANA_TZ_URL}>IANA time zone database</Ext> in your browser, updated every 30 seconds.
        {which === "world" ? " Colours follow the current UTC offset, so zones showing the same clock time share a colour; at sea, nautical zones are whole hours by longitude." : ""}
      </p>
    </div>
  );
}

export default function TzMapTool({ which }: { which: "us" | "world" }) {
  const mounted = useMounted();
  return mounted ? <TzMapInner which={which} /> : <Loading note="Loading time zone boundaries…" />;
}
