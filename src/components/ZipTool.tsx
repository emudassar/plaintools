"use client";

import { useState } from "react";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import TileMap from "./TileMap";
import { CoordRows, ErrorBox, Ext, fmtDateLong, Headline, Loading, Row, Table, Warn, where } from "./GeoBits";
import { zctaAt, TIGERWEB_INFO_URL, type ZctaHit } from "@/lib/tigerweb";
import { loadZctas, nearest, ZCTA_URL, ACS_SF_URL, type Zcta } from "@/lib/us-data";
import { asToolError, type ErrorKind } from "@/lib/errors";
import type { LatLon } from "@/lib/geodesy";

interface Result {
  loc: PickedLocation;
  hit: ZctaHit | null;
  data: Zcta | null;
  /** When no ZCTA contains the point: the nearest ZCTA centres. */
  nearby: (Zcta & { metres: number })[];
  retrievedAt: string;
}
type State =
  | { phase: "idle" }
  | { phase: "loading"; loc: PickedLocation }
  | { phase: "error"; kind: ErrorKind; message: string; loc: PickedLocation }
  | { phase: "result"; data: Result };

const money = (x: number | null) => (x == null ? "Not published" : x.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }));
const num = (x: number | null) => (x == null ? "Not published" : x.toLocaleString("en-US"));

function ResultCard({ d }: { d: Result }) {
  const z = d.data;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <Headline
        kicker={`ZIP code area at · ${where({ ...d.loc }, d.loc.source)}`}
        title={d.hit ? d.hit.zcta : "No ZIP code area here"}
        sub={d.hit ? "Census ZIP Code Tabulation Area (ZCTA) containing this point" : "The point is outside every Census ZIP code area — often water, parkland or outside the US"}
      />
      <div className="p-5 text-sm">
        {!d.hit && d.nearby.length > 0 && (
          <Warn title="Nearest ZIP code areas">
            These are the closest ZCTA centre points, not the area you are in: {d.nearby.map((n) => `${n.zip} (${(n.metres / 1609.344).toFixed(1)} mi)`).join(", ")}.
          </Warn>
        )}
        {d.hit && (
          <Table>
            <Row k="ZIP Code Tabulation Area">{d.hit.zcta}</Row>
            <Row k="Population (ACS 2019–2023)">{num(z?.pop ?? null)}</Row>
            <Row k="Median household income">{money(z?.income ?? null)}</Row>
            <Row k="Median value of owner-occupied homes">{money(z?.homeValue ?? null)}</Row>
            <Row k="Land area">{z ? `${z.landSqMi.toLocaleString("en-US")} sq mi · ${(z.landSqMi * 2.58999).toFixed(1)} km²` : "Not recorded"}</Row>
            <Row k="People per square mile">{z && z.pop != null && z.landSqMi > 0 ? Math.round(z.pop / z.landSqMi).toLocaleString("en-US") : "—"}</Row>
            <CoordRows p={d.loc} />
          </Table>
        )}
        <p className="text-[var(--color-muted)]">
          A ZCTA is the Census Bureau&rsquo;s area version of a ZIP code, built from the ZIP codes used by addresses in each census block. It
          matches the USPS ZIP code for most addresses, but the Postal Service defines ZIP codes as delivery routes, not areas — PO-box-only
          and single-building ZIP codes have no ZCTA, and an address near the edge can carry a neighbouring ZIP code.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Area: US Census Bureau TIGERweb, 2020 Census ZCTAs. Figures: American Community Survey 2019–2023 5-year estimates (B01003, B19013, B25077),
            which have margins of error. Retrieved {fmtDateLong(d.retrievedAt)}.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4">
            <Ext href={TIGERWEB_INFO_URL}>TIGERweb</Ext>
            <Ext href={ZCTA_URL}>About ZCTAs</Ext>
            <Ext href={ACS_SF_URL}>ACS summary file</Ext>
            <Ext href="https://tools.usps.com/zip-code-lookup.htm">USPS ZIP code lookup</Ext>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function ZipTool() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [fitKey, setFitKey] = useState("");

  async function run(loc: PickedLocation) {
    setState({ phase: "loading", loc });
    try {
      const [hit, rows] = await Promise.all([zctaAt(loc.lat, loc.lon), loadZctas()]);
      const data = hit ? (rows.find((r) => r.zip === hit.zcta) ?? null) : null;
      const nearby = hit ? [] : nearest(rows, loc, 3).filter((n) => n.metres < 80_000);
      setFitKey(`${loc.lat},${loc.lon},${hit?.zcta ?? ""}`);
      setState({ phase: "result", data: { loc, hit, data, nearby, retrievedAt: new Date().toISOString() } });
    } catch (err) {
      const e = asToolError(err);
      setState({ phase: "error", kind: e.kind, message: e.message, loc });
    }
  }

  const loc = state.phase === "idle" ? null : state.phase === "result" ? state.data.loc : state.loc;
  const rings = state.phase === "result" && state.data.hit ? state.data.hit.rings : [];
  const pick = (p: LatLon) => void run({ ...p, label: `Map point ${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}`, source: "map" });

  return (
    <div>
      <LocationPicker onPick={run} deviceLabel="Find my ZIP code" placeholder="Street address, city — or 40.7484, -73.9857" busy={state.phase === "loading"} />
      <div aria-live="polite">
        {state.phase === "loading" && <Loading note="Asking the Census Bureau which ZIP code area contains this point…" />}
        {state.phase === "error" && <ErrorBox title="The lookup failed" message={state.message} onRetry={state.kind === "unavailable" ? () => void run(state.loc) : undefined} />}
        {state.phase === "result" && <ResultCard d={state.data} />}
      </div>
      {loc && (
        <div className="mt-4">
          <TileMap
            ariaLabel="Map of the ZIP code area. Click anywhere to check that spot."
            markers={[{ lat: loc.lat, lon: loc.lon }]}
            shapes={rings.length ? [{ points: rings[0], more: rings.slice(1), fill: true, fillOpacity: 0.15 }] : []}
            fitKey={fitKey}
            maxFitZoom={15}
            onPick={pick}
          />
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">The shaded outline is the ZIP code area. Click the map to check another spot.</p>
        </div>
      )}
    </div>
  );
}
