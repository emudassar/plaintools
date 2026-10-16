"use client";

import { useState } from "react";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import TileMap from "./TileMap";
import { CoordRows, ErrorBox, Ext, fmtDateLong, Headline, Loading, n0, Row, Table, Warn, where } from "./GeoBits";
import { censusAreaAt, edgeAreas, FCC_DOCS_URL, type CensusArea, type EdgeCheck } from "@/lib/fcc-area";
import { reverseGeocodeDetail, type PlaceDetail } from "@/lib/geocode";
import { circlePoints, type LatLon } from "@/lib/geodesy";
import { asToolError, type ErrorKind } from "@/lib/errors";

/**
 * Shared by "What County Am I In?" and "What State Am I In?" — two keywords,
 * two pages, one data source. `mode` decides the headline and the edge check.
 */

type Mode = "county" | "state";

interface Result {
  loc: PickedLocation;
  area: CensusArea | null;
  /** Only fetched when the point is outside every Census block. */
  osm: PlaceDetail | null;
  edge: EdgeCheck | null;
  retrievedAt: string;
}

type State =
  | { phase: "idle" }
  | { phase: "loading"; note: string; loc: PickedLocation }
  | { phase: "error"; kind: ErrorKind; message: string; loc: PickedLocation }
  | { phase: "result"; data: Result };

/** Device accuracy below this is treated as exact enough to skip the edge check. */
const EDGE_MIN_M = 25;
const EDGE_MAX_M = 5000;

const CENSUS_FIPS_URL = "https://www.census.gov/library/reference/code-lists/ansi.html";
const CENSUS_GLOSSARY_URL = "https://www.census.gov/programs-surveys/geography/about/glossary.html";

function ResultCard({ mode, data }: { mode: Mode; data: Result }) {
  const { area, loc, edge, osm } = data;
  const label = where({ ...loc }, loc.source);

  if (!area) {
    return (
      <div className="rounded-lg border border-[var(--color-line)]">
        <Headline kicker={label} title="Not inside a US Census block" sub="Outside the United States, or over open water" />
        <div className="p-5 text-sm">
          <p className="mb-4 text-[var(--color-muted)]">
            The 2020 Census divides every part of the 50 states, DC, Puerto Rico and the US Island Areas into blocks. This point is not in any of them, so
            there is no US {mode} to report.
          </p>
          {osm && (osm.country || osm.state || osm.county) && (
            <>
              <h3 className="mb-2 font-semibold tracking-wide uppercase">What OpenStreetMap records nearby</h3>
              <Table>
                {osm.country && <Row k="Country">{osm.country}</Row>}
                {osm.state && <Row k="State / region">{osm.state}</Row>}
                {osm.county && <Row k="County / district">{osm.county}</Row>}
              </Table>
              <p className="mb-4 text-xs text-[var(--color-muted)]">
                These are the names on the nearest feature in OpenStreetMap, via the Photon geocoder. They are not Census data.
              </p>
            </>
          )}
          <footer className="border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
            Source: FCC Area API (2020 Census blocks), no result for {loc.lat.toFixed(5)}, {loc.lon.toFixed(5)}. Retrieved{" "}
            {fmtDateLong(data.retrievedAt)}.
          </footer>
        </div>
      </div>
    );
  }

  const county = area.countyName ?? `County equivalent ${area.countyFips} (name not in this data)`;
  const title = mode === "county" ? county : area.stateName;
  const sub = mode === "county" ? `${area.stateName} (${area.stateCode})` : area.countyName ? `${area.stateCode} · in ${area.countyName}` : area.stateCode;

  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <Headline kicker={`You are in · ${label}`} title={title} sub={sub} />
      <div className="p-5 text-sm">
        {edge && edge.others.length > 0 && (
          <Warn title={`You may be close to the ${mode} line`}>
            Your device placed you within about {n0(edge.radiusM)} m, and part of that circle lies in{" "}
            {edge.others.map((o) => (mode === "county" ? `${o.countyName ?? o.countyFips}, ${o.stateCode}` : o.stateName)).join(" and ")}. Move
            outdoors and try again for a tighter fix, or click your exact spot on the map.
          </Warn>
        )}
        {edge && edge.others.length === 0 && (
          <p className="mb-4 rounded-md border border-[var(--color-line)] p-3 text-[var(--color-muted)]">
            Checked the edge of your device&rsquo;s accuracy circle (about {n0(edge.radiusM)} m): all of it is in the same {mode}.
          </p>
        )}
        <Table>
          <Row k="County">{county}</Row>
          <Row k="State">
            {area.stateName} ({area.stateCode})
          </Row>
          <Row k="County FIPS code">{area.countyFips}</Row>
          <Row k="State FIPS code">{area.stateFips}</Row>
          <Row k="Census block (2020)">
            <span className="font-mono text-xs sm:text-sm">{area.blockFips}</span>
          </Row>
          <CoordRows p={loc} />
        </Table>
        <p className="text-[var(--color-muted)]">
          Louisiana calls its counties parishes; Alaska has no counties and uses boroughs, municipalities and census areas; Puerto Rico has municipios. The Census Bureau treats all of these as county equivalents, and so does this page. In four states (Maryland, Missouri, Nevada and Virginia) some incorporated places are independent cities outside any county; they appear as their own county equivalent.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: FCC Area API, US Census Bureau {area.censusYear} block boundaries, for {loc.lat.toFixed(5)}, {loc.lon.toFixed(5)}.
            Retrieved {fmtDateLong(data.retrievedAt)}.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4">
            <Ext href={FCC_DOCS_URL}>FCC Area API</Ext>
            <Ext href={CENSUS_FIPS_URL}>Census FIPS / ANSI codes</Ext>
            <Ext href={CENSUS_GLOSSARY_URL}>Census glossary: county equivalents</Ext>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function CensusAreaTool({ mode }: { mode: Mode }) {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [fitKey, setFitKey] = useState("");

  async function run(loc: PickedLocation) {
    if (loc.source !== "map") setFitKey(`${loc.lat},${loc.lon}`);
    setState({ phase: "loading", note: "Asking the FCC Census lookup…", loc });
    try {
      const area = await censusAreaAt(loc.lat, loc.lon, {
        onRetry: () => setState({ phase: "loading", note: "The FCC service is slow — a second request is running alongside it…", loc }),
      });
      let edge: EdgeCheck | null = null;
      let osm: PlaceDetail | null = null;
      if (area && loc.source === "device" && loc.accuracyM && loc.accuracyM >= EDGE_MIN_M) {
        setState({ phase: "loading", note: `Checking the edge of your ${n0(loc.accuracyM)} m accuracy circle…`, loc });
        edge = await edgeAreas(loc, Math.min(loc.accuracyM, EDGE_MAX_M), mode, mode === "county" ? area.countyFips : area.stateFips);
      }
      if (!area) osm = await reverseGeocodeDetail(loc.lat, loc.lon).catch(() => null);
      setState({ phase: "result", data: { loc, area, edge, osm, retrievedAt: new Date().toISOString() } });
    } catch (err) {
      const e = asToolError(err);
      setState({ phase: "error", kind: e.kind, message: e.message, loc });
    }
  }

  const loc = state.phase === "idle" ? null : state.phase === "result" ? state.data.loc : state.loc;
  const pick = (p: LatLon) => void run({ ...p, label: `Map point ${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}`, source: "map" });

  return (
    <div>
      <LocationPicker
        onPick={run}
        deviceLabel={mode === "county" ? "Find my county" : "Find my state"}
        placeholder="Street address, city or ZIP — or 40.7484, -73.9857"
        busy={state.phase === "loading"}
      />
      <div aria-live="polite">
        {state.phase === "loading" && <Loading note={state.note} />}
        {state.phase === "error" && (
          <ErrorBox title="The lookup failed" message={state.message} onRetry={state.kind === "unavailable" ? () => void run(state.loc) : undefined} />
        )}
        {state.phase === "result" && <ResultCard mode={mode} data={state.data} />}
      </div>
      {loc && (
        <div className="mt-4">
          <TileMap
            ariaLabel={`Map of the point looked up. Click anywhere to find the ${mode} there.`}
            markers={[{ lat: loc.lat, lon: loc.lon }]}
            shapes={loc.accuracyM && loc.accuracyM > 15 ? [{ points: circlePoints(loc, Math.min(loc.accuracyM, EDGE_MAX_M), 72), fill: true }] : []}
            fitKey={fitKey}
            maxFitZoom={mode === "county" ? 11 : 8}
            onPick={pick}
          />
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">Click the map to check any other spot. Map boundaries are not drawn; the answer comes from Census blocks.</p>
        </div>
      )}
    </div>
  );
}
