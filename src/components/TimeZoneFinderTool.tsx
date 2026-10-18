"use client";

import { useEffect, useState } from "react";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import TileMap from "./TileMap";
import { ErrorBox, Ext, Headline, Loading, Row, Table, where } from "./GeoBits";
import { timeZoneAt, OPEN_METEO_FORECAST_DOCS_URL } from "@/lib/timezone-lookup";
import { abbreviation, dstInfo, fmtInZone, fmtOffset, IANA_TZ_URL, longName, nextTransition, offsetMinutes } from "@/lib/tz";
import { asToolError, type ErrorKind } from "@/lib/errors";
import type { LatLon } from "@/lib/geodesy";

type State =
  | { phase: "idle" }
  | { phase: "loading"; loc: PickedLocation }
  | { phase: "error"; kind: ErrorKind; message: string; loc: PickedLocation }
  | { phase: "result"; loc: PickedLocation; tz: string; at: number };

function Clock({ tz }: { tz: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return <>{fmtInZone(now, tz, { hour: "numeric", minute: "2-digit", second: "2-digit" })}</>;
}

function Result({ loc, tz, at }: { loc: PickedLocation; tz: string; at: number }) {
  const off = offsetMinutes(tz, at);
  const dst = dstInfo(tz, at);
  const next = nextTransition(tz, at);
  const mine = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const myOff = offsetMinutes(mine, at);
  const diff = off - myOff;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <Headline kicker={`Time zone at · ${where({ ...loc }, loc.source)}`} title={tz} sub={<><Clock tz={tz} /> · {fmtInZone(at, tz, { dateStyle: "full" })}</>} />
      <div className="p-5 text-sm">
        <Table>
          <Row k="Name">{longName(tz, at)}</Row>
          <Row k="Abbreviation now">{abbreviation(tz, at)}</Row>
          <Row k="UTC offset now">{fmtOffset(off)}</Row>
          <Row k="Daylight saving time">
            {!dst.observes ? "Not observed — the same offset all year" : dst.active ? `In effect now (standard time is ${fmtOffset(dst.standardMin)})` : `Not in effect now (summer time is ${fmtOffset(dst.daylightMin)})`}
          </Row>
          <Row k="Next clock change">
            {next
              ? `${fmtInZone(next.ms + next.fromMin * 60000, "UTC", { dateStyle: "full", timeStyle: "short" })} local time — clocks go ${next.toMin > next.fromMin ? "forward" : "back"} ${Math.abs(next.toMin - next.fromMin)} minutes, to ${fmtOffset(next.toMin)}`
              : "None scheduled in the next 13 months"}
          </Row>
          <Row k="Compared with your device">{diff === 0 ? `Same time as your device (${mine})` : `${Math.abs(diff / 60)} hour${Math.abs(diff) === 60 ? "" : "s"} ${diff > 0 ? "ahead of" : "behind"} your device (${mine})`}</Row>
          <Row k="Coordinates">
            {loc.lat.toFixed(5)}, {loc.lon.toFixed(5)}
          </Row>
        </Table>
        <footer className="mt-4 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Zone for the point: Open-Meteo (which uses timezone-boundary-builder, from OpenStreetMap data). Offsets, abbreviations and clock changes: the IANA tz database
            as built into your browser. Checked {new Date(at).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4">
            <Ext href={IANA_TZ_URL}>IANA time zone database</Ext>
            <Ext href={OPEN_METEO_FORECAST_DOCS_URL}>Open-Meteo</Ext>
            <Ext href="https://github.com/evansiroky/timezone-boundary-builder">timezone-boundary-builder</Ext>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function TimeZoneFinderTool() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [fitKey, setFitKey] = useState("");

  async function run(loc: PickedLocation) {
    if (loc.source !== "map") setFitKey(`${loc.lat},${loc.lon}`);
    setState({ phase: "loading", loc });
    try {
      const tz = await timeZoneAt(loc.lat, loc.lon);
      setState({ phase: "result", loc, tz, at: Date.now() });
    } catch (e) {
      const err = asToolError(e);
      setState({ phase: "error", kind: err.kind, message: err.message, loc });
    }
  }
  const loc = state.phase === "idle" ? null : state.loc;
  const pick = (p: LatLon) => void run({ ...p, label: `Map point ${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}`, source: "map" });

  return (
    <div>
      <LocationPicker onPick={run} preferUS={false} deviceLabel="Find my time zone" placeholder="Any city, address or coordinates" busy={state.phase === "loading"} />
      <div aria-live="polite">
        {state.phase === "loading" && <Loading note="Looking up the time zone for this point…" />}
        {state.phase === "error" && <ErrorBox title="The lookup failed" message={state.message} onRetry={state.kind === "unavailable" ? () => void run(state.loc) : undefined} />}
        {state.phase === "result" && <Result loc={state.loc} tz={state.tz} at={state.at} />}
      </div>
      {loc && (
        <div className="mt-4">
          <TileMap ariaLabel="Map. Click anywhere to find the time zone there." markers={[{ lat: loc.lat, lon: loc.lon }]} fitKey={fitKey} maxFitZoom={6} onPick={pick} />
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">Click the map to check the time zone of any other spot.</p>
        </div>
      )}
    </div>
  );
}
