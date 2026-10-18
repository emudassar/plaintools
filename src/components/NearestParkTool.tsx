"use client";

import { useRef, useState } from "react";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import TileMap from "./TileMap";
import { Ext, n, n0, where, fmtMiKm } from "./GeoBits";
import { RoutingCredit } from "./ToolBits";
import { compassPoint, inverse } from "@/lib/geodesy";
import { fmtDuration, route } from "@/lib/routing";
import parks from "@/data/national-parks.json";

const LIST_URL = "https://en.wikipedia.org/wiki/List_of_national_parks_of_the_United_States";
const NPS_URL = "https://www.nps.gov/aboutus/national-park-system.htm";

interface Park {
  name: string;
  article: string;
  states: string[];
  lat: number;
  lon: number;
  established: string;
  acres: number;
}

export default function NearestParkTool() {
  const [loc, setLoc] = useState<PickedLocation | null>(null);
  const [drive, setDrive] = useState<Record<string, { m: number; s: number } | "none" | "loading">>({});
  const seq = useRef(0);

  const ranked = loc
    ? (parks.parks as Park[])
        .map((p) => ({ ...p, g: inverse(loc, p) }))
        .sort((a, b) => a.g.metres - b.g.metres)
    : [];

  async function pick(l: PickedLocation) {
    setLoc(l);
    setDrive({});
    const id = ++seq.current;
    const top = (parks.parks as Park[]).map((p) => ({ p, m: inverse(l, p).metres })).sort((a, b) => a.m - b.m).slice(0, 3);
    for (const { p } of top) {
      if (id !== seq.current) return;
      setDrive((d) => ({ ...d, [p.name]: "loading" }));
      try {
        const r = await route([l, p], "car");
        if (id === seq.current) setDrive((d) => ({ ...d, [p.name]: { m: r.metres, s: r.seconds } }));
      } catch {
        if (id === seq.current) setDrive((d) => ({ ...d, [p.name]: "none" }));
      }
    }
  }

  const first = ranked[0];
  return (
    <div>
      <LocationPicker onPick={(l) => void pick(l)} deviceLabel="Find parks near me" placeholder="Address, city or ZIP code" />
      {loc && first && (
        <div className="mb-4 rounded-lg border border-[var(--color-line)]">
          <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
            <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Nearest national park to {where(loc, loc.source)}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{first.article}</p>
            <p className="mt-1 text-[var(--color-muted)]">
              {fmtMiKm(first.g.metres, 0)} {compassPoint(first.g.initialBearing)} in a straight line · {first.states.join(", ")}
            </p>
          </div>
          <div className="max-h-[30rem] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-[var(--color-line)]">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">National park</th>
                  <th className="px-3 py-2 font-medium">Straight line</th>
                  <th className="px-3 py-2 font-medium">Driving</th>
                  <th className="px-3 py-2 font-medium">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {ranked.map((p, i) => {
                  const d = drive[p.name];
                  return (
                    <tr key={p.name}>
                      <td className="px-3 py-2 text-[var(--color-muted)]">{i + 1}</td>
                      <td className="px-3 py-2">
                        <Ext href={`https://en.wikipedia.org/wiki/${encodeURIComponent(p.article.replace(/ /g, "_"))}`}>{p.name}</Ext>
                        <span className="block text-xs text-[var(--color-muted)]">
                          {p.states.join(", ")} · established {p.established}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {n0(p.g.metres / 1609.344)} mi {compassPoint(p.g.initialBearing)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{d === "loading" ? "…" : d === "none" ? "no road route" : d ? `${n0(d.m / 1609.344)} mi · ${fmtDuration(d.s)}` : ""}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{n(p.acres, 0)} acres</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-[var(--color-line)] px-4 py-3 text-xs text-[var(--color-muted)]">
            All {parks.parks.length} US national parks (the National Park Service units designated &ldquo;National Park&rdquo;), with a representative coordinate, establishment date and acreage, from{" "}
            <Ext href={LIST_URL}>Wikipedia&apos;s list</Ext> ({parks.source.replace(/^Wikipedia, /, "")}). Distances run to that one point, not to the nearest park boundary or entrance — big
            parks can be closer than shown. Driving for the three nearest: <RoutingCredit /> Other park units (monuments, seashores, recreation areas): <Ext href={NPS_URL}>NPS</Ext>.
          </p>
        </div>
      )}
      <TileMap
        ariaLabel="Map of US national parks. Click to search from that point."
        markers={
          loc
            ? [...ranked.slice(0, 5).map((p, i) => ({ lat: p.lat, lon: p.lon, r: 6, color: "#15803d", label: `${i + 1}. ${p.name}` })), { lat: loc.lat, lon: loc.lon, color: "#111" }]
            : (parks.parks as Park[]).map((p) => ({ lat: p.lat, lon: p.lon, r: 5, color: "#15803d" }))
        }
        fitKey={loc ? `${loc.lat},${loc.lon}` : ""}
        initial={{ lat: 40, lon: -105, zoom: 3 }}
        maxFitZoom={8}
        height={420}
        onPick={(p) => void pick({ ...p, label: `Map point ${p.lat.toFixed(3)}, ${p.lon.toFixed(3)}`, source: "map" })}
      />
    </div>
  );
}
