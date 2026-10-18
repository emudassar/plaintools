"use client";

import { useRef, useState } from "react";
import PlacePairForm, { type Place } from "./PlacePairForm";
import TileMap from "./TileMap";
import { ErrorBox, Ext, Headline, n, Row, Table, fmtMiKm } from "./GeoBits";
import { ProfileSelect, RoutingCredit } from "./ToolBits";
import { compassPoint, formatLatLon, inverse, pathPoints, VINCENTY_URL } from "@/lib/geodesy";
import { fmtDuration, PROFILE_LABEL, route, type Profile, type RouteResult } from "@/lib/routing";
import { asToolError } from "@/lib/errors";

type RoadState = { phase: "loading" } | { phase: "error"; message: string } | { phase: "ok"; r: RouteResult };

export default function DistanceTwoPlacesTool() {
  const [pair, setPair] = useState<[Place, Place] | null>(null);
  const [profile, setProfile] = useState<Profile>("car");
  const [road, setRoad] = useState<RoadState | null>(null);
  const [fitKey, setFitKey] = useState("");
  const seq = useRef(0);

  async function go(a: Place, b: Place, p: Profile) {
    const id = ++seq.current;
    setPair([a, b]);
    setFitKey(`${a.lat},${a.lon},${b.lat},${b.lon}`);
    setRoad({ phase: "loading" });
    try {
      const r = await route([a, b], p);
      if (id === seq.current) setRoad({ phase: "ok", r });
    } catch (e) {
      if (id === seq.current) setRoad({ phase: "error", message: asToolError(e).message });
    }
  }

  const g = pair ? inverse(pair[0], pair[1]) : null;
  return (
    <div>
      <div className="mb-3 max-w-xs">
        <ProfileSelect
          value={profile}
          onChange={(p) => {
            setProfile(p);
            if (pair) void go(pair[0], pair[1], p);
          }}
        />
      </div>
      <PlacePairForm submitLabel="Get distance" onResolve={(a, b) => void go(a, b, profile)} />
      {pair && g && (
        <div className="mb-4 rounded-lg border border-[var(--color-line)]">
          <Headline
            kicker={`${pair[0].label} → ${pair[1].label}`}
            title={road?.phase === "ok" ? `${n(road.r.metres / 1609.344)} mi by road` : `${n(g.metres / 1609.344)} mi straight line`}
            sub={road?.phase === "ok" ? `${n(road.r.metres / 1000)} km · about ${fmtDuration(road.r.seconds)} ${PROFILE_LABEL[profile].toLowerCase()} · ${n(g.metres / 1609.344)} mi in a straight line` : `${n(g.metres / 1000)} km`}
          />
          <div className="p-5 text-sm">
            {road?.phase === "loading" && <p className="mb-4 text-[var(--color-muted)]">Finding the {PROFILE_LABEL[profile].toLowerCase()} route…</p>}
            {road?.phase === "error" && (
              <div className="mb-4">
                <ErrorBox title="No road distance" message={road.message} onRetry={() => void go(pair[0], pair[1], profile)} />
              </div>
            )}
            <Table>
              <Row k="Straight line (as the crow flies)">{fmtMiKm(g.metres, 2)}</Row>
              {road?.phase === "ok" && (
                <>
                  <Row k={`${PROFILE_LABEL[profile]} distance`}>{fmtMiKm(road.r.metres, 1)}</Row>
                  <Row k={`${PROFILE_LABEL[profile]} time`}>{fmtDuration(road.r.seconds)} without traffic or stops</Row>
                  <Row k="Route is longer by">
                    {n((road.r.metres / g.metres - 1) * 100, 0)}% ({fmtMiKm(road.r.metres - g.metres, 1)})
                  </Row>
                </>
              )}
              <Row k="Direction">
                {n(g.initialBearing, 0)}° ({compassPoint(g.initialBearing)}) from the first place
              </Row>
              <Row k="From">
                {pair[0].label}
                <span className="block text-xs text-[var(--color-muted)]">{formatLatLon(pair[0])}</span>
              </Row>
              <Row k="To">
                {pair[1].label}
                <span className="block text-xs text-[var(--color-muted)]">{formatLatLon(pair[1])}</span>
              </Row>
            </Table>
            <footer className="border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
              Straight line: <Ext href={VINCENTY_URL}>Vincenty</Ext> on the WGS84 ellipsoid. <RoutingCredit /> Places: OpenStreetMap via Photon. Calculated{" "}
              {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}.
            </footer>
          </div>
        </div>
      )}
      <TileMap
        ariaLabel="Map of the two places with the straight line and the road route"
        markers={pair ? [{ ...pair[0], label: "A" }, { ...pair[1], label: "B", color: "#c2410c" }] : []}
        shapes={pair ? [...(road?.phase === "ok" ? [{ points: road.r.line, color: "#c2410c", width: 3.5 }] : []), { points: pathPoints(pair[0], pair[1], 96), dashed: true }] : []}
        fitKey={fitKey}
        maxFitZoom={13}
        height={400}
      />
      {pair && <p className="mt-1.5 text-xs text-[var(--color-muted)]">Dashed blue: straight line. Orange: {PROFILE_LABEL[profile].toLowerCase()} route.</p>}
    </div>
  );
}
