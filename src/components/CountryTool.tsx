"use client";

import { useEffect, useState } from "react";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import TileMap from "./TileMap";
import { CoordRows, ErrorBox, Ext, fmtDateLong, fmtMiKm, Headline, Loading, Row, Table, Warn, where } from "./GeoBits";
import { reverseGeocodeDetail, type PlaceDetail } from "@/lib/geocode";
import { circlePoints, inverse, type LatLon } from "@/lib/geodesy";
import { asToolError, type ErrorKind } from "@/lib/errors";

interface Result {
  loc: PickedLocation;
  place: PlaceDetail | null;
  /** Distance from the point to the OSM feature Photon matched. */
  featureM: number | null;
  retrievedAt: string;
}

type State =
  | { phase: "idle" }
  | { phase: "loading"; loc: PickedLocation }
  | { phase: "error"; kind: ErrorKind; message: string; loc: PickedLocation }
  | { phase: "result"; data: Result };

/** Beyond this, the matched feature is too far away to name the point's own country. */
const FAR_M = 25_000;
const PHOTON_URL = "https://photon.komoot.io";
const OSM_ADMIN_URL = "https://wiki.openstreetmap.org/wiki/Key:admin_level";
const OSM_DISPUTED_URL = "https://wiki.openstreetmap.org/wiki/Disputed_territories";
const ISO_URL = "https://www.iso.org/iso-3166-country-codes.html";

function DeviceSettings() {
  const [s, setS] = useState<{ tz: string; lang: string } | null>(null);
  useEffect(() => {
    setS({ tz: Intl.DateTimeFormat().resolvedOptions().timeZone, lang: navigator.language });
  }, []);
  if (!s) return null;
  return (
    <>
      <Row k="Your device's time zone setting">{s.tz}</Row>
      <Row k="Your browser's language setting">{s.lang}</Row>
    </>
  );
}

function ResultCard({ data }: { data: Result }) {
  const { place, loc, featureM } = data;
  const far = featureM !== null && featureM > FAR_M;
  const country = place?.country ?? null;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <Headline
        kicker={`Country at · ${where({ ...loc }, loc.source)}`}
        title={country && !far ? country : "No country recorded at this point"}
        sub={country && !far ? [place?.countryCode, place?.state].filter(Boolean).join(" · ") : "Probably at sea or in a remote area"}
      />
      <div className="p-5 text-sm">
        {far && place && (
          <Warn title="The nearest mapped place is far away">
            OpenStreetMap&rsquo;s nearest named feature is {fmtMiKm(featureM!, 0)} away{place.country ? `, in ${place.country}` : ""}.
            That is not evidence that this point is in that country — it may be in international waters or unmapped land.
          </Warn>
        )}
        <Table>
          {country && !far && (
            <>
              <Row k="Country">{country}</Row>
              <Row k="ISO 3166-1 alpha-2 code">{place?.countryCode ?? "Not recorded"}</Row>
              <Row k="State / province / region">{place?.state ?? "Not recorded"}</Row>
              <Row k="County / district">{place?.county ?? "Not recorded"}</Row>
              <Row k="City / town">{place?.city ?? "Not recorded"}</Row>
            </>
          )}
          <CoordRows p={loc} />
          <DeviceSettings />
        </Table>
        <p className="text-[var(--color-muted)]">
          This answer comes from your coordinates, not your internet connection. &ldquo;What is my IP location&rdquo; sites show where
          your network provider or VPN appears to be, which can be another city or country. Your device&rsquo;s time zone and language
          are shown for comparison only — they are settings, not a location. Borders follow OpenStreetMap; where a border is disputed,
          OpenStreetMap records the situation on the ground, which may differ from a given government&rsquo;s position.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: OpenStreetMap contributors (ODbL), via the Photon reverse geocoder, for {loc.lat.toFixed(5)}, {loc.lon.toFixed(5)}.
            Retrieved {fmtDateLong(data.retrievedAt)}.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4">
            <Ext href={PHOTON_URL}>Photon geocoder</Ext>
            <Ext href={OSM_ADMIN_URL}>OSM administrative levels</Ext>
            <Ext href={ISO_URL}>ISO 3166 country codes</Ext>
            <Ext href={OSM_DISPUTED_URL}>OSM: disputed territories</Ext>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function CountryTool() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [fitKey, setFitKey] = useState("");

  async function run(loc: PickedLocation) {
    if (loc.source !== "map") setFitKey(`${loc.lat},${loc.lon}`);
    setState({ phase: "loading", loc });
    try {
      const place = await reverseGeocodeDetail(loc.lat, loc.lon);
      const featureM =
        place && place.featureLat !== null && place.featureLon !== null
          ? inverse(loc, { lat: place.featureLat, lon: place.featureLon }).metres
          : null;
      setState({ phase: "result", data: { loc, place, featureM, retrievedAt: new Date().toISOString() } });
    } catch (err) {
      const e = asToolError(err);
      setState({ phase: "error", kind: e.kind, message: e.message, loc });
    }
  }

  const loc = state.phase === "idle" ? null : state.phase === "result" ? state.data.loc : state.loc;
  const pick = (p: LatLon) => void run({ ...p, label: `Map point ${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}`, source: "map" });

  return (
    <div>
      <LocationPicker onPick={run} preferUS={false} deviceLabel="Find my country" placeholder="Any address or place — or 48.8584, 2.2945" busy={state.phase === "loading"} />
      <div aria-live="polite">
        {state.phase === "loading" && <Loading note="Reading OpenStreetMap's place names for this point…" />}
        {state.phase === "error" && (
          <ErrorBox title="The lookup failed" message={state.message} onRetry={state.kind === "unavailable" ? () => void run(state.loc) : undefined} />
        )}
        {state.phase === "result" && <ResultCard data={state.data} />}
      </div>
      {loc && (
        <div className="mt-4">
          <TileMap
            ariaLabel="Map of the point looked up. Click anywhere to find the country there."
            markers={[{ lat: loc.lat, lon: loc.lon }]}
            shapes={loc.accuracyM && loc.accuracyM > 15 ? [{ points: circlePoints(loc, Math.min(loc.accuracyM, 5000), 72), fill: true }] : []}
            fitKey={fitKey}
            maxFitZoom={6}
            onPick={pick}
          />
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">Click the map to check any other spot.</p>
        </div>
      )}
    </div>
  );
}
