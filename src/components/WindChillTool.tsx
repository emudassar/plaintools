"use client";

import { useState, useId } from "react";
import {
  calculateWindChill,
  CHART_SPEEDS_MPH,
  CHART_TEMPS_F,
  MAX_DEFINED_F,
  MIN_WIND_MPH,
  NWS_CHART_MAX_MPH,
  NWS_CHART_PAGE,
  NWS_CHART_PDF,
  windChillF,
  type WindChillResult,
} from "@/lib/wind-chill";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. Arithmetic in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: WindChillResult };

const r0 = (x: number) => Math.round(x).toLocaleString("en-US");
const r1 = (x: number) => x.toLocaleString("en-US", { maximumFractionDigits: 1 });

function SourceFooter({ retrievedAt }: { retrievedAt: string }) {
  return (
    <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
      <p>
        Source: National Weather Service wind chill formula (effective
        November 1, 2001), as printed on the NWS Wind Chill Chart. Retrieved{" "}
        {retrievedAt}.
      </p>
      <p className="mt-1">
        <a
          href={NWS_CHART_PAGE}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] underline"
        >
          NWS: Wind Chill Chart
        </a>
      </p>
    </footer>
  );
}

function ResultCard({ data }: { data: WindChillResult }) {
  if (data.kind === "undefined") {
    return (
      <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
        <p className="font-medium">
          The NWS formula gives no wind chill for{" "}
          {data.reason === "too-warm"
            ? `${r1(data.tempF)} °F`
            : `${r1(data.mph)} mph`}
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {data.reason === "too-warm"
            ? `The National Weather Service says wind chill "is only defined for temperatures at or below ${MAX_DEFINED_F}°F". Above that, it does not publish a wind chill figure, so this page does not invent one. The air temperature itself is the only NWS number for this case.`
            : `The National Weather Service defines wind chill only for wind speeds above ${MIN_WIND_MPH} mph. At or below that, the air temperature is the figure to go by.`}
        </p>
        <SourceFooter retrievedAt={data.retrievedAt} />
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Wind chill at {r0(data.mph)} mph and {r1(data.tempF)} °F
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          Feels like {r0(data.chillF)} °F ({r0(data.chillC)} °C)
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {r0(Math.abs(data.dropF))} °F colder than the air temperature, by
          the NWS formula with your riding speed used as the wind speed.
        </p>
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          The arithmetic
        </h3>
        <div className="mb-5 rounded-md border border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
          <p>
            35.74 + 0.6215 × {r1(data.tempF)} − 35.75 × {r1(data.mph)}
            <sup>0.16</sup> + 0.4275 × {r1(data.tempF)} × {r1(data.mph)}
            <sup>0.16</sup> ={" "}
            <strong className="font-medium text-[var(--color-fg)]">
              {r1(data.chillF)} °F
            </strong>
          </p>
        </div>
        {data.beyondChart && (
          <p className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3 text-sm">
            The NWS chart stops at {NWS_CHART_MAX_MPH} mph. This figure applies
            the same formula beyond the chart&rsquo;s range.
          </p>
        )}
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          NWS built the formula for weather-station wind measured at 33 feet,
          which it converts to the lower wind speed at face height (5 feet).
          Your riding speed is already the airflow at your face, so feeding it
          in as station wind means the formula reduces it, and the real chill
          on exposed skin is likely colder than shown. The formula also
          assumes bare skin in the shade: a windscreen, fairing, visor and
          heated gear change what you feel, and so do sun and rain. It is a
          published index, not a measurement of your ride.
        </p>
        <SourceFooter retrievedAt={data.retrievedAt} />
      </div>
    </div>
  );
}

export default function WindChillTool() {
  const [temp, setTemp] = useState("40");
  const [tempUnit, setTempUnit] = useState<"F" | "C">("F");
  const [speed, setSpeed] = useState("60");
  const [speedUnit, setSpeedUnit] = useState<"mph" | "kmh">("mph");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = { t: useId(), s: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState({
        phase: "result",
        data: calculateWindChill({
          temp: num(temp),
          tempUnit,
          speed: num(speed),
          speedUnit,
        }),
      });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field =
    "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <form onSubmit={run} className="mb-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.t} className="mb-1.5 block font-medium">
              Air temperature
            </label>
            <div className="flex gap-2">
              <input
                id={ids.t}
                type="number"
                inputMode="decimal"
                step="any"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className={field}
              />
              <select
                aria-label="Temperature unit"
                value={tempUnit}
                onChange={(e) => setTempUnit(e.target.value as "F" | "C")}
                className="rounded-md border border-[var(--color-line)] bg-white px-2"
              >
                <option value="F">°F</option>
                <option value="C">°C</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor={ids.s} className="mb-1.5 block font-medium">
              Riding speed
            </label>
            <div className="flex gap-2">
              <input
                id={ids.s}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                className={field}
              />
              <select
                aria-label="Speed unit"
                value={speedUnit}
                onChange={(e) => setSpeedUnit(e.target.value as "mph" | "kmh")}
                className="rounded-md border border-[var(--color-line)] bg-white px-2"
              >
                <option value="mph">mph</option>
                <option value="kmh">km/h</option>
              </select>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Calculate wind chill
        </button>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          Runs entirely in your browser. Nothing you enter is sent anywhere or
          stored.
        </p>
      </form>

      <div aria-live="polite">
        {state.phase === "error" && (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {state.message}
            </p>
          </div>
        )}
        {state.phase === "result" && <ResultCard data={state.data} />}
      </div>

      <h3 className="mt-8 mb-2 text-sm font-semibold tracking-wide uppercase">
        Motorcycle wind chill chart (°F)
      </h3>
      <div className="overflow-x-auto rounded-md border border-[var(--color-line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-accent-soft)] text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Speed ↓ / Air →</th>
              {CHART_TEMPS_F.map((t) => (
                <th key={t} className="px-3 py-2 font-medium">
                  {t}°
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {CHART_SPEEDS_MPH.map((v) => (
              <tr key={v}>
                <td className="px-3 py-1.5 font-medium">
                  {v} mph{v > NWS_CHART_MAX_MPH ? "*" : ""}
                </td>
                {CHART_TEMPS_F.map((t) => (
                  <td
                    key={t}
                    className={`px-3 py-1.5 ${v > NWS_CHART_MAX_MPH ? "italic text-[var(--color-muted)]" : ""}`}
                  >
                    {Math.round(windChillF(t, v))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        Every cell is the NWS formula rounded to the nearest degree, the same
        rounding as the{" "}
        <a
          href={NWS_CHART_PDF}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          official chart
        </a>
        . Riding speed is used as the wind speed. * The NWS chart stops at{" "}
        {NWS_CHART_MAX_MPH} mph; these rows extend the same formula. NWS does
        not define wind chill above {MAX_DEFINED_F} °F.
      </p>
    </div>
  );
}
