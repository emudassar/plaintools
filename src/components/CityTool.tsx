"use client";

import { useState } from "react";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import TileMap from "./TileMap";
import { CoordRows, ErrorBox, Ext, fmtDateLong, fmtMiKm, Headline, Loading, Row, Table, Warn, where } from "./GeoBits";
import { reverseGeocodeDetail, type PlaceDetail } from "@/lib/geocode";
import { censusPlacesAt, TIGERWEB_INFO_URL, type CensusPlaces } from "@/lib/tigerweb";
import { circlePoints, inverse, type LatLon } from "@/lib/geodesy";
import { asToolError, type ErrorKind } from "@/lib/errors";

interface Result {
  loc: PickedLocation;
  osm: PlaceDetail | null;
  featureM: number | null;
  /** US only: Census place boundaries containing the point; null when not US or TIGERweb failed. */
  census: CensusPlaces | null;
  retrievedAt: string;
}

type State =
  | { phase: "idle" }
  | { phase: "loading"; loc: PickedLocation }
  | { phase: "error"; kind: ErrorKind; message: string; loc: PickedLocation }
  | { phase: "result"; data: Result };

const FAR_M = 25_000;
const CENSUS_PLACES_URL = "https://www.census.gov/programs-surveys/geography/about/glossary.html#par_textimage_14";

function headline(d: Result): { title: string; sub: string } {
  const c = d.census;
  if (c?.incorporated) return { title: c.incorporated.name, sub: `Inside the city limits (Census: ${c.incorporated.full})` };
  if (c?.cdp) return { title: c.cdp.name, sub: `Unincorporated — inside the ${c.cdp.full}, a community the Census Bureau defines` };
  if (c && c.subdivision) return { title: c.subdivision.name, sub: `Not inside any city or CDP — in ${c.subdivision.full}` };
  const far = d.featureM !== null && d.featureM > FAR_M;
  if (d.osm?.city && !far) return { title: d.osm.city, sub: [d.osm.state, d.osm.country].filter(Boolean).join(", ") };
  return { title: "No city recorded here", sub: "Probably open country, water or an unmapped area" };
}

function ResultCard({ data }: { data: Result }) {
  const { osm, census, loc } = data;
  const h = headline(data);
  const isUS = osm?.countryCode === "US" || census !== null;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <Headline kicker={`City at · ${where({ ...loc }, loc.source)}`} title={h.title} sub={h.sub} />
      <div className="p-5 text-sm">
        {data.featureM !== null && data.featureM > FAR_M && (
          <Warn title="The nearest mapped place is far away">
            OpenStreetMap&rsquo;s nearest named feature is {fmtMiKm(data.featureM, 0)} away. That does not make this point part of that place.
          </Warn>
        )}
        {census && !census.incorporated && (census.cdp || census.subdivision) && (
          <Warn title="Your mailing address may name a different city">
            Postal addresses use the post office&rsquo;s city name, which often covers land outside any city&rsquo;s legal limits. The
            Census boundary above is the legal or statistical area the point is actually in.
          </Warn>
        )}
        <Table>
          {census && (
            <>
              <Row k="Incorporated city / town (Census)">{census.incorporated?.full ?? "None — the point is outside every incorporated place"}</Row>
              <Row k="Census Designated Place">{census.cdp?.full ?? "None"}</Row>
              <Row k="County subdivision (township, town, CCD)">{census.subdivision?.full ?? "Not recorded"}</Row>
            </>
          )}
          <Row k="City / town (OpenStreetMap)">{osm?.city ?? "Not recorded"}</Row>
          <Row k="County / district">{osm?.county ?? "Not recorded"}</Row>
          <Row k="State / region">{osm?.state ?? "Not recorded"}</Row>
          <Row k="Country">{osm?.country ?? "Not recorded"}</Row>
          <Row k="Postcode (OpenStreetMap)">{osm?.postcode ?? "Not recorded"}</Row>
          <CoordRows p={loc} />
        </Table>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            {isUS && census ? "Census boundaries: US Census Bureau TIGERweb (current Boundary and Annexation Survey places). " : ""}
            Place names: OpenStreetMap contributors (ODbL) via the Photon geocoder. Point {loc.lat.toFixed(5)}, {loc.lon.toFixed(5)}. Retrieved{" "}
            {fmtDateLong(data.retrievedAt)}.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4">
            {census && <Ext href={TIGERWEB_INFO_URL}>TIGERweb</Ext>}
            {census && <Ext href={CENSUS_PLACES_URL}>Census glossary: places</Ext>}
            <Ext href="https://photon.komoot.io">Photon geocoder</Ext>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function CityTool() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [fitKey, setFitKey] = useState("");

  async function run(loc: PickedLocation) {
    if (loc.source !== "map") setFitKey(`${loc.lat},${loc.lon}`);
    setState({ phase: "loading", loc });
    try {
      const osm = await reverseGeocodeDetail(loc.lat, loc.lon);
      const featureM = osm && osm.featureLat !== null && osm.featureLon !== null ? inverse(loc, { lat: osm.featureLat, lon: osm.featureLon }).metres : null;
      const inUSBox = loc.lat > 17 && loc.lat < 72 && (loc.lon < -64 || loc.lon > 172);
      const census = osm?.countryCode === "US" || (!osm && inUSBox) ? await censusPlacesAt(loc.lat, loc.lon) : null;
      setState({ phase: "result", data: { loc, osm, featureM, census, retrievedAt: new Date().toISOString() } });
    } catch (err) {
      const e = asToolError(err);
      setState({ phase: "error", kind: e.kind, message: e.message, loc });
    }
  }

  const loc = state.phase === "idle" ? null : state.phase === "result" ? state.data.loc : state.loc;
  const pick = (p: LatLon) => void run({ ...p, label: `Map point ${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}`, source: "map" });

  return (
    <div>
      <LocationPicker onPick={run} preferUS={false} deviceLabel="Find my city" placeholder="Any address or place — or 30.2672, -97.7431" busy={state.phase === "loading"} />
      <div aria-live="polite">
        {state.phase === "loading" && <Loading note="Checking city boundaries and place names for this point…" />}
        {state.phase === "error" && <ErrorBox title="The lookup failed" message={state.message} onRetry={state.kind === "unavailable" ? () => void run(state.loc) : undefined} />}
        {state.phase === "result" && <ResultCard data={state.data} />}
      </div>
      {loc && (
        <div className="mt-4">
          <TileMap
            ariaLabel="Map of the point looked up. Click anywhere to look up that spot."
            markers={[{ lat: loc.lat, lon: loc.lon }]}
            shapes={loc.accuracyM && loc.accuracyM > 15 ? [{ points: circlePoints(loc, Math.min(loc.accuracyM, 5000), 72), fill: true }] : []}
            fitKey={fitKey}
            maxFitZoom={13}
            onPick={pick}
          />
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">Click the map to check any other spot.</p>
        </div>
      )}
    </div>
  );
}
