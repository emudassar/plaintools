"use client";

import { useState, useId } from "react";
import { lookupSoil, type SoilResult, type SoilComponent } from "@/lib/soil";
import { geocodeAddress, parseCoordinates, reverseGeocode } from "@/lib/geocode";
import { asToolError, type ErrorKind } from "@/lib/errors";

/**
 * Four real states: idle / loading / error / result.
 *
 * The source and retrieval date go ON THE RESULT CARD, not only in the page
 * footer. That is the difference between a data site and a content farm.
 *
 * Nothing here gives advice. Every line either reports what USDA recorded or
 * says plainly that USDA recorded nothing.
 */

type State =
  | { phase: "idle" }
  | { phase: "loading"; note: string }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: SoilResult };

const cmToInches = (cm: number) => Math.round(cm / 2.54);

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Prints "Not rated" rather than letting an absent value render as a blank. */
function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="border-t border-[var(--color-line)] py-2.5">
      <dt className="text-xs tracking-wide text-[var(--color-muted)] uppercase">{label}</dt>
      <dd className="mt-0.5 font-medium">{value ?? "Not rated"}</dd>
    </div>
  );
}

function HorizonTable({ component }: { component: SoilComponent }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-sm">
        <caption className="sr-only">
          Soil layers recorded for {component.name}, by depth
        </caption>
        <thead>
          <tr className="border-b border-[var(--color-line)] text-left">
            <th scope="col" className="py-2 pr-3 font-medium">Depth</th>
            <th scope="col" className="py-2 pr-3 font-medium">USDA texture</th>
            <th scope="col" className="py-2 pr-3 font-medium">Sand / Silt / Clay</th>
            <th scope="col" className="py-2 pr-3 font-medium">pH</th>
            <th scope="col" className="py-2 font-medium">Organic matter</th>
          </tr>
        </thead>
        <tbody>
          {component.horizons.map((h, i) => {
            const pct =
              h.sandPct !== null && h.siltPct !== null && h.clayPct !== null
                ? `${h.sandPct}% / ${h.siltPct}% / ${h.clayPct}%`
                : null;
            return (
              <tr key={i} className="border-b border-[var(--color-line)] align-top">
                <td className="py-2 pr-3 whitespace-nowrap">
                  {h.topCm !== null && h.bottomCm !== null ? (
                    <>
                      {h.topCm}–{h.bottomCm} cm
                      <span className="block text-xs text-[var(--color-muted)]">
                        {cmToInches(h.topCm)}–{cmToInches(h.bottomCm)} in
                      </span>
                    </>
                  ) : (
                    "Not recorded"
                  )}
                </td>
                <td className="py-2 pr-3">
                  {h.usdaTexture ?? h.computedTexture ?? "Not recorded"}
                  {h.usdaTexture === null && h.computedTexture !== null && (
                    <span className="block text-xs text-[var(--color-muted)]">
                      calculated from percentages
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3">{pct ?? "Not recorded"}</td>
                <td className="py-2 pr-3">{h.ph !== null ? h.ph.toFixed(1) : "Not recorded"}</td>
                <td className="py-2">
                  {h.organicMatterPct !== null ? `${h.organicMatterPct}%` : "Not recorded"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ResultCard({ data }: { data: SoilResult }) {
  const surface = data.dominant?.horizons[0] ?? null;
  const headline = data.hasProfile
    ? (surface?.usdaTexture ?? surface?.computedTexture ?? data.dominant?.name ?? "Recorded")
    : "No soil profile recorded here";

  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      {/* Headline answer first, detail below. */}
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {data.queryLabel}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{headline}</p>
        <p className="mt-1 text-[var(--color-muted)]">
          {data.hasProfile && data.dominant ? (
            <>
              {data.dominant.name} series
              {data.dominant.percentOfMapUnit !== null && (
                <> · {data.dominant.percentOfMapUnit}% of this map unit</>
              )}
            </>
          ) : (
            data.mapUnitName
          )}
        </p>
      </div>

      <div className="p-5">
        {!data.hasProfile && data.profileAbsentReason && (
          <div className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4">
            <h3 className="font-medium">Why this is blank</h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{data.profileAbsentReason}</p>
          </div>
        )}

        <h3 className="mb-1 text-sm font-semibold tracking-wide uppercase">
          What USDA records for this map unit
        </h3>
        <dl className="mb-5 grid gap-x-6 sm:grid-cols-2">
          <Field label="Map unit" value={data.mapUnitName} />
          <Field label="Soil survey area" value={data.surveyArea} />
          <Field label="Drainage class" value={data.drainageClass} />
          <Field label="Hydrologic group" value={data.hydrologicGroup} />
          <Field label="Flooding frequency" value={data.floodFrequency} />
          <Field
            label="Shallowest water table"
            value={
              data.waterTableMinCm !== null
                ? `${data.waterTableMinCm} cm (${cmToInches(data.waterTableMinCm)} in)`
                : null
            }
          />
          <Field
            label="Depth to bedrock"
            value={
              data.bedrockDepthCm !== null
                ? `${data.bedrockDepthCm} cm (${cmToInches(data.bedrockDepthCm)} in)`
                : null
            }
          />
          <Field label="Farmland classification" value={data.farmlandClass} />
          <Field
            label="Septic absorption fields"
            value={data.dominant?.septicRating ?? null}
          />
          <Field label="Slope" value={data.dominant?.slopePct !== null && data.dominant ? `${data.dominant.slopePct}%` : null} />
        </dl>

        {data.hasProfile && data.dominant && (
          <>
            <h3 className="mb-1 text-sm font-semibold tracking-wide uppercase">
              Soil layers for {data.dominant.name}
            </h3>
            <p className="mb-3 text-sm text-[var(--color-muted)]">
              Representative values recorded by the soil survey for each layer.
              {data.dominant.taxonomicClass && (
                <> Taxonomic class: {data.dominant.taxonomicClass}.</>
              )}
            </p>
            <HorizonTable component={data.dominant} />
          </>
        )}

        {!data.hasProfile && (
          <div className="mt-2">
            <h3 className="mb-1 text-sm font-semibold tracking-wide uppercase">
              Named soil mapped nearby
            </h3>
            {data.nearby.length > 0 ? (
              <>
                <p className="mb-3 text-sm text-[var(--color-muted)]">
                  These are the nearest map units that do carry a soil profile. They
                  describe the <strong>surrounding ground</strong>, not this address.
                  USDA did not record these values for your point, and ground that has
                  been built on is often nothing like the soil beside it.
                </p>
                <ul className="space-y-2 text-sm">
                  {data.nearby.map((n) => (
                    <li
                      key={n.mukey}
                      className="flex flex-wrap items-baseline justify-between gap-x-3 border-t border-[var(--color-line)] py-2"
                    >
                      <span>
                        <span className="font-medium">{n.name}</span>
                        <span className="text-[var(--color-muted)]">
                          {" "}
                          — {n.mapUnitName}
                          {n.percentOfMapUnit !== null && <> ({n.percentOfMapUnit}% of it)</>}
                        </span>
                      </span>
                      <span className="whitespace-nowrap text-[var(--color-muted)]">
                        ~{Math.round(n.approxMetres)} m away
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-[var(--color-muted)]">
                  Distances are approximate. They are measured on the map projection and
                  converted to metres, so treat them as a guide to which soil is closest,
                  not as a survey measurement.
                </p>
              </>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">
                No mapped soil series with a recorded profile lies within{" "}
                {550} m of this point — the surrounding area is mapped the same way. In
                dense city centres this is common, and it means the survey simply has no
                profile to show you here.
              </p>
            )}
          </div>
        )}

        {data.components.length > 1 && (
          <details className="mt-5">
            <summary className="cursor-pointer text-sm font-medium">
              All {data.components.length} components in this map unit
            </summary>
            <ul className="mt-2 space-y-1 text-sm text-[var(--color-muted)]">
              {data.components.map((c, i) => (
                <li key={`${c.name}-${i}`}>
                  {c.name}
                  {c.percentOfMapUnit !== null && <> — {c.percentOfMapUnit}%</>}
                  {c.drainageClass && <> · {c.drainageClass}</>}
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Source + retrieval date ON THE RESULT, not just in the footer. */}
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: USDA NRCS Soil Data Access (SSURGO), map unit key {data.mukey}
            {data.surveyArea && <>, {data.surveyArea}</>}. Retrieved{" "}
            {fmtDate(data.retrievedAt)} for {data.lat.toFixed(5)}, {data.lon.toFixed(5)}.
          </p>
          <p className="mt-1">
            <a
              href={`https://websoilsurvey.nrcs.usda.gov/app/WebSoilSurvey.aspx`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Open the full record in USDA Web Soil Survey
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function SoilTool() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<State>({ phase: "idle" });
  const inputId = useId();

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setState({ phase: "loading", note: "Finding that address…" });

    try {
      // Accept pasted coordinates as well as an address.
      const coords = parseCoordinates(q);
      let lat: number;
      let lon: number;
      let label: string;

      if (coords) {
        lat = coords.lat;
        lon = coords.lon;
        label = (await reverseGeocode(lat, lon)) ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      } else {
        const hit = await geocodeAddress(q, {
          onRetry: () =>
            setState({
              phase: "loading",
              note: "The address service is slow — trying again alongside it…",
            }),
        });
        lat = hit.lat;
        lon = hit.lon;
        label = hit.label;
      }

      setState({ phase: "loading", note: "Reading the USDA soil survey…" });

      const data = await lookupSoil(lat, lon, {
        queryLabel: label,
        // Surface the hedge. A silent 8-second wait reads as a frozen page.
        onRetry: () =>
          setState({
            phase: "loading",
            note: "USDA is responding slowly — a second request is running alongside it…",
          }),
      });

      setState({ phase: "result", data });
    } catch (err) {
      const e = asToolError(err);
      if (e.detail) console.warn("[soil lookup]", e.kind, e.detail);
      setState({ phase: "error", kind: e.kind, message: e.message });
    }
  }

  return (
    <div>
      <form onSubmit={run} className="mb-4">
        <label htmlFor={inputId} className="mb-1.5 block font-medium">
          Enter a US address, or paste coordinates
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={inputId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="1600 Pennsylvania Ave NW, Washington DC — or 41.75, -93.75"
            autoComplete="street-address"
            className="w-full rounded-md border border-[var(--color-line)] px-3 py-2.5"
          />
          <button
            type="submit"
            disabled={state.phase === "loading" || query.trim().length === 0}
            className="shrink-0 rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white disabled:opacity-50"
          >
            {state.phase === "loading" ? "Checking…" : "Check soil"}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          United States only. Your address is sent to the geocoder and USDA to answer the
          lookup; nothing is stored by this site.
        </p>
      </form>

      <div aria-live="polite" aria-atomic="false">
        {state.phase === "loading" && (
          <div className="rounded-lg border border-[var(--color-line)] p-5">
            <p className="font-medium">Looking this up…</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{state.note}</p>
          </div>
        )}

        {state.phase === "error" && (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">
              {state.kind === "no-data"
                ? "No soil data for that location"
                : state.kind === "bad-input"
                  ? "That input could not be read"
                  : "The data service is not responding"}
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{state.message}</p>
            {state.kind === "unavailable" && (
              <button
                type="button"
                onClick={() => void run(new Event("submit") as unknown as React.FormEvent)}
                className="mt-3 rounded-md border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-medium"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {state.phase === "result" && <ResultCard data={state.data} />}
      </div>
    </div>
  );
}
