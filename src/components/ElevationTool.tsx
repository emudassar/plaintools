"use client";

import { useState } from "react";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import TileMap from "./TileMap";
import { CoordRows, ErrorBox, Ext, fmtDateLong, Headline, Loading, n, n0, Row, Table, Warn, where } from "./GeoBits";
import {
  COPERNICUS_DOI_URL,
  EPQS_INFO_URL,
  lookupElevation,
  M_TO_FT,
  OPEN_METEO_DOCS_URL,
  type ElevationReading,
  type ElevationResult,
} from "@/lib/elevation";
import { circlePoints, type LatLon } from "@/lib/geodesy";
import { asToolError, type ErrorKind } from "@/lib/errors";

type State =
  | { phase: "idle" }
  | { phase: "loading"; note: string; loc: PickedLocation }
  | { phase: "error"; kind: ErrorKind; message: string; loc: PickedLocation }
  | { phase: "result"; loc: PickedLocation; data: ElevationResult };

const ftm = (m: number) => `${n0(m * M_TO_FT)} ft (${n0(m)} m)`;

function Reading({ r, name, failed }: { r: ElevationReading | null; name: string; failed: boolean }) {
  return (
    <Row k={name}>
      {r ? (
        <>
          {n(r.metres * M_TO_FT, 1)} ft · {n(r.metres, 1)} m
          {r.resolutionM !== null && <span className="block text-xs text-[var(--color-muted)]">grid about {n0(r.resolutionM)} m</span>}
        </>
      ) : (
        <span className="text-[var(--color-muted)]">{failed ? "Did not respond — try again for this figure" : "No data for this point"}</span>
      )}
    </Row>
  );
}

function ResultCard({ loc, data }: { loc: PickedLocation; data: ElevationResult }) {
  const best = data.best;
  const diff = data.usgs && data.copernicus ? data.usgs.metres - data.copernicus.metres : null;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <Headline
        kicker={`Ground elevation at ${where({ ...loc }, loc.source)}`}
        title={best ? ftm(best.metres) : "No elevation recorded"}
        sub={
          best
            ? best.metres < 0
              ? `${ftm(-best.metres)} below sea level · ${best.source === "usgs" ? "USGS 3DEP" : "Copernicus DEM GLO-90"}`
              : `above sea level · ${best.source === "usgs" ? "USGS 3DEP" : "Copernicus DEM GLO-90"}`
            : undefined
        }
      />
      <div className="p-5 text-sm">
        {data.likelyWater && (
          <Warn title="This point looks like open water">
            USGS has no land data here and the Copernicus model returns exactly 0 m, as it does for open sea. If you are on a
            boat, your height above sea level is your deck height.
          </Warn>
        )}
        {loc.source === "device" && loc.accuracyM && loc.accuracyM > 100 && (
          <Warn title={`Your device reported a position accurate to about ${n0(loc.accuracyM)} m`}>
            On a hillside the ground can change height a lot within that circle. Move outdoors, wait a few seconds and try again, or
            click your exact spot on the map.
          </Warn>
        )}
        <Table>
          <Reading r={data.usgs} failed={data.usgsFailed && !data.likelyWater} name="USGS 3D Elevation Program" />
          <Reading r={data.copernicus} failed={data.copernicusFailed} name="Copernicus DEM GLO-90 (worldwide)" />
          {diff !== null && <Row k="Difference between the two">{n(Math.abs(diff) * M_TO_FT, 1)} ft ({n(Math.abs(diff), 1)} m)</Row>}
          {loc.source === "device" && (
            <Row k="Your device's GPS altitude">
              {loc.altitudeM !== null && loc.altitudeM !== undefined ? (
                <>
                  {n(loc.altitudeM * M_TO_FT, 0)} ft ({n(loc.altitudeM, 0)} m) above the WGS84 ellipsoid
                  {loc.altitudeAccuracyM ? <> ± {n0(loc.altitudeAccuracyM)} m</> : null}
                  <span className="block text-xs text-[var(--color-muted)]">
                    Not sea level: the W3C Geolocation standard defines this as height above the WGS84 ellipsoid, which differs from mean sea level by an amount that varies from place to place.
                  </span>
                </>
              ) : (
                <span className="text-[var(--color-muted)]">Your browser did not report an altitude (most laptops do not).</span>
              )}
            </Row>
          )}
          <CoordRows p={data} />
        </Table>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this number is</h3>
        <p className="text-[var(--color-muted)]">
          The height of the bare ground surface in an elevation model, not the height of a building floor, a treetop or your phone.
          USGS 3DEP is built largely from lidar and is the finer of the two in the US; the Copernicus 90 m model averages each cell, so
          peaks and narrow valleys read lower or higher than the real spot.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Sources: USGS Elevation Point Query Service (3DEP); Copernicus DEM GLO-90 © DLR e.V. 2010-2014 and © Airbus Defence and
            Space GmbH 2014-2018, provided under COPERNICUS by the European Union and ESA, via the Open-Meteo Elevation API. Retrieved{" "}
            {fmtDateLong(data.retrievedAt)}.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4">
            <Ext href={EPQS_INFO_URL}>USGS EPQS</Ext>
            <Ext href={OPEN_METEO_DOCS_URL}>Open-Meteo Elevation API</Ext>
            <Ext href={COPERNICUS_DOI_URL}>Copernicus DEM (DOI)</Ext>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function ElevationTool() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [fitKey, setFitKey] = useState("");

  async function run(loc: PickedLocation) {
    if (loc.source !== "map") setFitKey(`${loc.lat},${loc.lon}`);
    setState({ phase: "loading", note: "Reading the USGS and Copernicus elevation models…", loc });
    try {
      const data = await lookupElevation(loc.lat, loc.lon, {
        onRetry: () => setState({ phase: "loading", note: "The USGS service is slow — a second request is running alongside it…", loc }),
      });
      setState({ phase: "result", loc, data });
    } catch (err) {
      const e = asToolError(err);
      setState({ phase: "error", kind: e.kind, message: e.message, loc });
    }
  }

  const loc = state.phase === "idle" ? null : state.loc;
  const pick = (p: LatLon) => void run({ ...p, label: `Map point ${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}`, source: "map" });

  return (
    <div>
      <LocationPicker onPick={run} preferUS={false} deviceLabel="Find my elevation" busy={state.phase === "loading"} />
      <div aria-live="polite">
        {state.phase === "loading" && <Loading note={state.note} />}
        {state.phase === "error" && (
          <ErrorBox title="The elevation lookup failed" message={state.message} onRetry={state.kind === "unavailable" ? () => void run(state.loc) : undefined} />
        )}
        {state.phase === "result" && <ResultCard loc={state.loc} data={state.data} />}
      </div>
      {loc && (
        <div className="mt-4">
          <TileMap
            ariaLabel="Map of the point looked up. Click anywhere to get the elevation there."
            markers={[{ lat: loc.lat, lon: loc.lon }]}
            shapes={loc.accuracyM && loc.accuracyM > 15 ? [{ points: circlePoints(loc, loc.accuracyM, 72), fill: true }] : []}
            fitKey={fitKey}
            onPick={pick}
          />
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">Click the map to check the elevation of any other spot.</p>
        </div>
      )}
    </div>
  );
}
