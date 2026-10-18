"use client";

import { useEffect, useState } from "react";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import TileMap from "./TileMap";
import { Ext, fmtMiKm, n0, where } from "./GeoBits";
import { antipode, digStraightDown, layerLengths, PREM_DOI_URL, uniformFallSeconds } from "@/lib/antipode";
import { pointInfo, type PointInfo } from "@/lib/point-info";
import { OPEN_METEO_DOCS_URL } from "@/lib/elevation";
import type { LatLon } from "@/lib/geodesy";

const KLOTZ_URL = "https://doi.org/10.1119/1.4898780";

function Surface({ info }: { info: PointInfo | null }) {
  if (!info) return <span className="text-[var(--color-muted)]">Checking the surface there…</span>;
  const near = info.place && info.placeM !== null ? (info.placeM < 25_000 ? info.place : `nearest named place: ${info.place}, ${fmtMiKm(info.placeM, 0)} away`) : "no named place found nearby";
  return (
    <>
      <strong>{info.water === null ? "Surface unknown" : info.water ? "You come out in water" : "You come out on land"}</strong>
      {info.water === false && info.elevationM !== null ? `, ${n0(info.elevationM)} m above sea level` : ""} · {near}
    </>
  );
}

export default function DigThroughEarthTool() {
  const [loc, setLoc] = useState<(LatLon & { label: string; source: string }) | null>(null);
  const [info, setInfo] = useState<PointInfo | null>(null);

  const dig = loc ? digStraightDown(loc) : null;
  useEffect(() => {
    if (!dig) return;
    let live = true;
    setInfo(null);
    void pointInfo(dig.exit).then((i) => live && setInfo(i));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc]);

  const pick = (l: PickedLocation) => setLoc({ lat: l.lat, lon: l.lon, label: l.label, source: l.source });
  const fall = uniformFallSeconds();

  return (
    <div>
      <LocationPicker onPick={pick} preferUS={false} deviceLabel="Dig from where I am" placeholder="Where do you start digging? Address, city or coordinates" />
      {!loc && (
        <TileMap
          ariaLabel="World map. Click where you want to start digging."
          initial={{ lat: 25, lon: 0, zoom: 1 }}
          height={360}
          onPick={(p) => setLoc({ ...p, label: `Map point ${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}`, source: "map" })}
        />
      )}
      {loc && dig && (
        <>
          <div className="rounded-lg border border-[var(--color-line)]">
            <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
              <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Dig straight down from {where(loc, loc.source)} and you come out at</p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">
                {dig.exit.lat.toFixed(4)}, {dig.exit.lon.toFixed(4)}
              </p>
              <p className="mt-1 text-sm">
                <Surface info={info} />
              </p>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-sm font-medium">Where you start</p>
                <TileMap ariaLabel="Map of the starting point" markers={[{ ...loc, color: "#1d4ed8" }]} fitKey={`a${loc.lat},${loc.lon}`} maxFitZoom={5} height={260} onPick={(p) => setLoc({ ...p, label: `Map point ${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}`, source: "map" })} />
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Where you come out</p>
                <TileMap ariaLabel="Map of the exit point on the other side of the Earth" markers={[{ ...dig.exit, color: "#c2410c" }]} fitKey={`b${loc.lat},${loc.lon}`} maxFitZoom={5} height={260} />
              </div>
            </div>
            <div className="px-4 pb-4 text-sm">
              <div className="mb-4 overflow-x-auto rounded-md border border-[var(--color-line)]">
                <table className="w-full">
                  <tbody className="divide-y divide-[var(--color-line)]">
                    <tr>
                      <td className="px-3 py-2 font-medium">Tunnel length</td>
                      <td className="px-3 py-2">{fmtMiKm(dig.chordM, 0)}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium">Passes the Earth&apos;s centre at</td>
                      <td className="px-3 py-2">{dig.missesCentreByM < 50 ? "the centre itself (you started on the equator or at a pole)" : `${fmtMiKm(dig.missesCentreByM, 1)} from it — 'down' follows the local vertical, which points at the centre only on the equator and at the poles`}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium">Exact opposite point (antipode)</td>
                      <td className="px-3 py-2">
                        {antipode(loc).lat.toFixed(4)}, {antipode(loc).lon.toFixed(4)} — {fmtMiKm(dig.exitToAntipodeM, 1)} from where the plumb-line tunnel comes out
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium">Fall time (no air, uniform Earth)</td>
                      <td className="px-3 py-2">
                        {(fall / 60).toFixed(1)} minutes, reaching about {n0((Math.sqrt(3.986004418e14 / 6_371_000) * 3.6))} km/h at the middle
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h3 className="mb-2 font-semibold">What you dig through</h3>
              <div className="mb-4 overflow-x-auto rounded-md border border-[var(--color-line)]">
                <table className="w-full text-left">
                  <thead className="bg-[var(--color-accent-soft)]">
                    <tr>
                      <th className="px-3 py-2 font-medium">Layer (PREM model)</th>
                      <th className="px-3 py-2 font-medium">Length of tunnel in it</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line)]">
                    {layerLengths(dig.missesCentreByM / 1000).map((l) => (
                      <tr key={l.name}>
                        <td className="px-3 py-2">{l.name}</td>
                        <td className="px-3 py-2">
                          {n0(l.km)} km ({n0(l.km / 1.609344)} mi)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[var(--color-muted)]">
                Exit point: the ellipsoid normal (local vertical) followed through the WGS84 ellipsoid in Earth-centred coordinates. Layers: boundary radii of the Preliminary Reference
                Earth Model (<Ext href={PREM_DOI_URL}>Dziewonski &amp; Anderson 1981</Ext>) on a 6,371 km sphere; the crust is an average and is much thicker under continents. Fall time:
                half a period of simple harmonic motion, π√(R³/GM); with the real density profile it is shorter, about 38 minutes (<Ext href={KLOTZ_URL}>Klotz 2015</Ext>). Surface:
                Copernicus GLO-90 via <Ext href={OPEN_METEO_DOCS_URL}>Open-Meteo</Ext> and OpenStreetMap names via <Ext href="https://photon.komoot.io">Photon</Ext>.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
