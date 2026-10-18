"use client";

import { useState } from "react";
import TileMap from "./TileMap";
import { ErrorBox, Ext, fmtDateLong, fmtMiKm, Headline, Loading, Row, Table, Warn } from "./GeoBits";
import { parseLatLon, fmtDms } from "@/lib/coords";
import { reverseGeocodeDetail, type PlaceDetail } from "@/lib/geocode";
import { lookupElevation, M_TO_FT, OPEN_METEO_DOCS_URL, type ElevationResult } from "@/lib/elevation";
import { timeZoneAt } from "@/lib/timezone-lookup";
import { inverse, type LatLon } from "@/lib/geodesy";
import { asToolError, type ErrorKind } from "@/lib/errors";

interface Result {
  p: LatLon;
  place: PlaceDetail | null;
  featureM: number | null;
  elevation: ElevationResult | null;
  tz: string | null;
  retrievedAt: string;
}
type State = { phase: "idle" } | { phase: "loading"; p: LatLon } | { phase: "error"; kind: ErrorKind; message: string; p: LatLon } | { phase: "result"; d: Result };

const FAR_M = 2_000;

function localTime(tz: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date());
}

export default function CoordsToAddressTool() {
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [state, setState] = useState<State>({ phase: "idle" });
  const [fitKey, setFitKey] = useState("");

  async function run(p: LatLon, refit = true) {
    if (refit) setFitKey(`${p.lat},${p.lon}`);
    setState({ phase: "loading", p });
    try {
      const [place, elevation, tz] = await Promise.all([
        reverseGeocodeDetail(p.lat, p.lon),
        lookupElevation(p.lat, p.lon).catch(() => null),
        timeZoneAt(p.lat, p.lon).catch(() => null),
      ]);
      const featureM = place && place.featureLat !== null && place.featureLon !== null ? inverse(p, { lat: place.featureLat, lon: place.featureLon }).metres : null;
      setState({ phase: "result", d: { p, place, featureM, elevation, tz, retrievedAt: new Date().toISOString() } });
    } catch (e) {
      const err = asToolError(e);
      setState({ phase: "error", kind: err.kind, message: err.message, p });
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = parseLatLon(input);
    if (!p) {
      setMsg("Enter latitude and longitude, e.g. 40.748817, -73.985428 or 40°44′55.7″N 73°59′07.5″W.");
      return;
    }
    setMsg(null);
    void run(p);
  }

  function useDevice() {
    setMsg(null);
    if (!navigator.geolocation) return setMsg("This browser does not offer location access.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setInput(`${p.lat.toFixed(6)}, ${p.lon.toFixed(6)}`);
        void run(p);
      },
      () => setMsg("Your location could not be read. Type coordinates instead."),
      { enableHighAccuracy: true, timeout: 20000 },
    );
  }

  const p = state.phase === "idle" ? null : state.phase === "result" ? state.d.p : state.p;

  return (
    <div>
      <form onSubmit={submit} className="mb-3">
        <label htmlFor="c2a" className="mb-1.5 block font-medium">
          Latitude and longitude
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="c2a" value={input} onChange={(e) => setInput(e.target.value)} placeholder="40.748817, -73.985428" className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5 font-mono" />
          <button type="submit" className="shrink-0 rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white" disabled={state.phase === "loading"}>
            Find address
          </button>
        </div>
      </form>
      <button type="button" onClick={useDevice} className="mb-4 rounded-md border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-medium">
        Use my current location
      </button>
      {msg && <p className="mb-3 text-sm text-red-700">{msg}</p>}

      <div aria-live="polite">
        {state.phase === "loading" && <Loading note="Reading the address, elevation and time zone for this point…" />}
        {state.phase === "error" && <ErrorBox title="The lookup failed" message={state.message} onRetry={state.kind === "unavailable" ? () => void run(state.p) : undefined} />}
        {state.phase === "result" && (
          <div className="rounded-lg border border-[var(--color-line)]">
            <Headline
              kicker={`Nearest address to ${state.d.p.lat.toFixed(6)}, ${state.d.p.lon.toFixed(6)}`}
              title={state.d.place?.label ?? "No address recorded near this point"}
              sub={state.d.featureM !== null ? `Matched feature is ${fmtMiKm(state.d.featureM, 2)} from the point` : undefined}
            />
            <div className="p-5 text-sm">
              {state.d.featureM !== null && state.d.featureM > FAR_M && (
                <Warn title="No address close to this point">The nearest mapped feature is {fmtMiKm(state.d.featureM, 1)} away, so the address above belongs to somewhere else.</Warn>
              )}
              <Table>
                <Row k="City / town">{state.d.place?.city ?? "Not recorded"}</Row>
                <Row k="Postcode">{state.d.place?.postcode ?? "Not recorded"}</Row>
                <Row k="County / district">{state.d.place?.county ?? "Not recorded"}</Row>
                <Row k="State / region">{state.d.place?.state ?? "Not recorded"}</Row>
                <Row k="Country">{state.d.place ? `${state.d.place.country ?? "—"}${state.d.place.countryCode ? ` (${state.d.place.countryCode})` : ""}` : "Not recorded"}</Row>
                <Row k="Ground elevation">
                  {state.d.elevation?.best
                    ? `${Math.round(state.d.elevation.best.metres * M_TO_FT).toLocaleString("en-US")} ft · ${Math.round(state.d.elevation.best.metres).toLocaleString("en-US")} m (${state.d.elevation.best.source === "usgs" ? "USGS 3DEP" : "Copernicus 90 m"})`
                    : "Not available"}
                </Row>
                <Row k="Time zone">{state.d.tz ? `${state.d.tz} — now ${localTime(state.d.tz)}` : "Not available"}</Row>
                <Row k="Degrees, minutes, seconds">
                  {fmtDms(state.d.p.lat, true, 1)}, {fmtDms(state.d.p.lon, false, 1)}
                </Row>
              </Table>
              <footer className="mt-4 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
                <p>
                  Address: OpenStreetMap contributors (ODbL) via Photon. Elevation: USGS 3DEP where available, else Copernicus DEM GLO-90 via Open-Meteo. Time zone: Open-Meteo.
                  Retrieved {fmtDateLong(state.d.retrievedAt)}.
                </p>
                <p className="mt-1 flex flex-wrap gap-x-4">
                  <Ext href="https://photon.komoot.io">Photon</Ext>
                  <Ext href={OPEN_METEO_DOCS_URL}>Open-Meteo elevation</Ext>
                  <Ext href="https://www.openstreetmap.org/copyright">OpenStreetMap licence</Ext>
                </p>
              </footer>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4">
        <TileMap
          ariaLabel="Map. Click anywhere to get the address there."
          markers={p ? [{ ...p }] : []}
          fitKey={fitKey}
          maxFitZoom={16}
          onPick={(q) => {
            setInput(`${q.lat.toFixed(6)}, ${q.lon.toFixed(6)}`);
            void run(q, false);
          }}
        />
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">Or click the map to drop a point.</p>
      </div>
    </div>
  );
}
