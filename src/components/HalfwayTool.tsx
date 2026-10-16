"use client";

import { useEffect, useId, useState } from "react";
import PlacePairForm, { type Place } from "./PlacePairForm";
import TileMap from "./TileMap";
import { CoordRows, Ext, fmtMiKm, Headline, n, Row, Table, Warn } from "./GeoBits";
import { reverseGeocodeDetail, type PlaceDetail } from "@/lib/geocode";
import { inverse, pathPoints, pointAlong, VINCENTY_URL, type LatLon } from "@/lib/geodesy";

/** Recomputed instantly as the split changes; only the nearest-place name is fetched. */

type Near = { phase: "idle" } | { phase: "loading" } | { phase: "done"; place: PlaceDetail | null; metres: number | null } | { phase: "error" };

export default function HalfwayTool() {
  const [pair, setPair] = useState<{ a: Place; b: Place } | null>(null);
  const [pct, setPct] = useState(50);
  const [near, setNear] = useState<Near>({ phase: "idle" });
  const [fitKey, setFitKey] = useState("");
  const sliderId = useId();

  const total = pair ? inverse(pair.a, pair.b) : null;
  const mid = pair ? pointAlong(pair.a, pair.b, pct / 100) : null;

  // Name the nearest place to the chosen point, debounced so dragging the slider does not flood the geocoder.
  const midKey = mid ? `${mid.lat.toFixed(4)},${mid.lon.toFixed(4)}` : "";
  useEffect(() => {
    if (!mid) return;
    setNear({ phase: "loading" });
    let live = true;
    const t = setTimeout(async () => {
      try {
        const place = await reverseGeocodeDetail(mid.lat, mid.lon);
        const metres = place && place.featureLat !== null && place.featureLon !== null ? inverse(mid, { lat: place.featureLat, lon: place.featureLon }).metres : null;
        if (live) setNear({ phase: "done", place, metres });
      } catch {
        if (live) setNear({ phase: "error" });
      }
    }, 600);
    return () => {
      live = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [midKey]);

  function onResolve(a: Place, b: Place) {
    setPair({ a, b });
    setPct(50);
    setFitKey(`${a.lat},${a.lon},${b.lat},${b.lon}`);
  }

  const halfway = pct === 50;

  return (
    <div>
      <PlacePairForm onResolve={onResolve} labels={["First place", "Second place"]} submitLabel="Find the halfway point" />
      {pair && total && mid && (
        <div aria-live="polite" className="rounded-lg border border-[var(--color-line)]">
          <Headline
            kicker={halfway ? `Halfway between ${pair.a.label} and ${pair.b.label}` : `${pct}% of the way from ${pair.a.label}`}
            title={
              near.phase === "done" && near.place?.label
                ? `Near ${near.place.city ?? near.place.label}`
                : `${mid.lat.toFixed(5)}, ${mid.lon.toFixed(5)}`
            }
            sub={`${fmtMiKm(total.metres * (pct / 100))} from the first place · ${fmtMiKm(total.metres * (1 - pct / 100))} from the second`}
          />
          <div className="p-5 text-sm">
            <label htmlFor={sliderId} className="mb-1 block font-medium">
              Meet at {pct}% of the way from the first place {halfway && "(halfway)"}
            </label>
            <input
              id={sliderId}
              type="range"
              min={0}
              max={100}
              step={1}
              value={pct}
              onChange={(e) => setPct(Number(e.target.value))}
              className="mb-5 w-full"
            />
            {near.phase === "done" && near.place && near.metres !== null && near.metres > 15000 && (
              <Warn title="No named place close to this point">
                The nearest feature OpenStreetMap names is {fmtMiKm(near.metres, 0)} away. The point may be in open country or at sea.
              </Warn>
            )}
            <Table>
              <Row k="Nearest named place">
                {near.phase === "loading" && <span className="text-[var(--color-muted)]">Looking up…</span>}
                {near.phase === "error" && <span className="text-[var(--color-muted)]">The place-name service did not respond.</span>}
                {near.phase === "done" &&
                  (near.place?.label ? (
                    <>
                      {near.place.label}
                      {near.metres !== null && <span className="block text-xs text-[var(--color-muted)]">{fmtMiKm(near.metres)} from the point</span>}
                    </>
                  ) : (
                    <span className="text-[var(--color-muted)]">None recorded</span>
                  ))}
              </Row>
              <CoordRows p={mid} />
              <Row k="Total straight-line distance">{fmtMiKm(total.metres)}</Row>
              <Row k="From the first place">{fmtMiKm(total.metres * (pct / 100))}</Row>
              <Row k="From the second place">{fmtMiKm(total.metres * (1 - pct / 100))}</Row>
              <Row k="Matched places">
                {pair.a.label} · {pair.b.label}
              </Row>
            </Table>
            <p className="text-[var(--color-muted)]">
              This is the geographic halfway point: the spot on the shortest path over the Earth&rsquo;s surface that is the same
              straight-line distance from both places (or the share you set). Driving time is different — roads, speed limits and
              traffic are not part of this calculation, so the halfway point by road can be somewhere else.
            </p>
            <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
              <p>
                Method: Vincenty (1975) inverse and direct formulas on the WGS84 ellipsoid{mid.method === "sphere" && " (sphere fallback for nearly opposite points)"};
                calculated in your browser. Place names: OpenStreetMap contributors, via Photon. Slider position {n(pct, 0)}%.
              </p>
              <p className="mt-1">
                <Ext href={VINCENTY_URL}>Vincenty 1975 (NOAA NGS copy)</Ext>
              </p>
            </footer>
          </div>
        </div>
      )}
      {pair && mid && (
        <div className="mt-4">
          <TileMap
            ariaLabel="Map of both places, the route between them and the meeting point."
            markers={[
              { lat: pair.a.lat, lon: pair.a.lon, label: "1" },
              { lat: pair.b.lat, lon: pair.b.lon, label: "2" },
              { lat: mid.lat, lon: mid.lon, label: halfway ? "Halfway" : `${pct}%`, color: "#b45309" },
            ]}
            shapes={[{ points: pathPoints(pair.a, pair.b, 96) as LatLon[] }]}
            fitKey={fitKey}
          />
        </div>
      )}
    </div>
  );
}
