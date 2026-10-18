"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProjectedMapView, { serializeSvg } from "./ProjectedMapView";
import { ErrorBox, Ext, Loading, n, n0 } from "./GeoBits";
import { Btn } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import { CENSUS_CB_URL, classOf, loadUsCounties, quantileBreaks, SEQ7, type ProjectedMap } from "@/lib/projected";
import { ACS_SF_URL, DATA_VINTAGE, GAZETTEER_URL, loadCounties, US_STATES, type County } from "@/lib/us-data";
import { downloadPng, downloadText } from "@/lib/svg-export";
import { toCsv } from "@/lib/geo-formats";
import { asToolError } from "@/lib/errors";

type Metric = "pop" | "density" | "income" | "homeValue" | "land";
const METRICS: Record<Metric, { label: string; get: (c: County) => number | null; fmt: (x: number) => string }> = {
  pop: { label: "Population", get: (c) => c.pop, fmt: n0 },
  density: { label: "People per square mile", get: (c) => (c.pop === null || !c.landSqMi ? null : c.pop / c.landSqMi), fmt: (x) => n(x, x < 10 ? 1 : 0) },
  income: { label: "Median household income", get: (c) => c.income, fmt: (x) => `$${n0(x)}` },
  homeValue: { label: "Median home value", get: (c) => c.homeValue, fmt: (x) => `$${n0(x)}` },
  land: { label: "Land area (sq mi)", get: (c) => c.landSqMi, fmt: (x) => n0(x) },
};

export default function UsCountyMapTool() {
  const [map, setMap] = useState<ProjectedMap | null>(null);
  const [data, setData] = useState<Map<string, County> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>("pop");
  const [sel, setSel] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    Promise.all([loadUsCounties(), loadCounties()]).then(
      ([m, c]) => {
        setMap(m);
        setData(new Map(c.map((x) => [x.fips, x])));
      },
      (e) => setErr(asToolError(e).message),
    );
  }, []);

  const M = METRICS[metric];
  const breaks = useMemo(() => (data && map ? quantileBreaks(map.regions.map((r) => M.get(data.get(r.id) as County) ?? NaN), 7) : []), [data, map, M]);
  const matches = useMemo(() => {
    if (!map || q.trim().length < 2) return [];
    const t = q.trim().toLowerCase();
    return map.regions.filter((r) => `${r.name}, ${r.group}`.toLowerCase().includes(t)).slice(0, 8);
  }, [q, map]);

  if (err) return <ErrorBox title="The county map did not load" message={err} onRetry={() => location.reload()} />;
  if (!map || !data) return <Loading note="Loading 3,144 county outlines and Census figures…" />;

  const selC = sel ? data.get(sel) : null;
  const legendY = map.h + 18;
  const legendLabels = [`< ${M.fmt(breaks[0])}`, ...breaks.slice(0, -1).map((b, i) => `${M.fmt(b)}–${M.fmt(breaks[i + 1])}`), `≥ ${M.fmt(breaks[breaks.length - 1])}`];

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-medium">Colour counties by</span>
          <select className={fieldClass} value={metric} onChange={(e) => setMetric(e.target.value as Metric)}>
            {(Object.keys(METRICS) as Metric[]).map((m) => (
              <option key={m} value={m}>
                {METRICS[m].label}
              </option>
            ))}
          </select>
        </label>
        <div className="relative">
          <label className="block">
            <span className="mb-1.5 block font-medium">Find a county</span>
            <input className={fieldClass} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Cook County" />
          </label>
          {matches.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-[var(--color-line)] bg-white text-sm shadow">
              {matches.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-[var(--color-accent-soft)]"
                    onClick={() => {
                      setSel(r.id);
                      setQ("");
                    }}
                  >
                    {r.name}, {r.group}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <ProjectedMapView
        map={map}
        svgRef={svg}
        ariaLabel={`Map of US counties coloured by ${M.label.toLowerCase()}`}
        footer={48}
        strokeWidth={0.25}
        highlight={sel}
        fill={(r) => {
          const k = classOf(M.get(data.get(r.id) as County), breaks);
          return k < 0 ? "#d9d9d9" : SEQ7[k];
        }}
        tooltip={(r) => {
          const c = data.get(r.id);
          const v = c ? M.get(c) : null;
          return (
            <>
              <strong>
                {r.name}, {r.group}
              </strong>
              <br />
              {M.label}: {v === null ? "not published" : M.fmt(v)}
            </>
          );
        }}
        onClick={(r) => setSel(r.id)}
      >
        <g fontFamily="Arial, sans-serif" fontSize={11}>
          {SEQ7.map((c, i) => (
            <g key={c} transform={`translate(${20 + i * 135} ${legendY})`}>
              <rect width={16} height={12} fill={c} stroke="#999" strokeWidth={0.5} />
              <text x={20} y={10} fill="#333">
                {legendLabels[i]}
              </text>
            </g>
          ))}
          <text x={20} y={legendY + 30} fill="#555">
            {M.label} by county · quantile classes · {DATA_VINTAGE.split("; ")[1] ?? DATA_VINTAGE}
          </text>
        </g>
      </ProjectedMapView>
      <div className="mt-2 flex flex-wrap gap-2">
        <Btn onClick={() => svg.current && void downloadPng(serializeSvg(svg.current), 2400, `us-county-map-${metric}.png`)}>Download PNG</Btn>
        <Btn onClick={() => svg.current && downloadText(serializeSvg(svg.current), `us-county-map-${metric}.svg`, "image/svg+xml")}>Download SVG</Btn>
        <Btn
          onClick={() =>
            downloadText(
              toCsv([["fips", "county", "state", "population", "land_sq_mi", "people_per_sq_mi", "median_household_income", "median_home_value"], ...[...data.values()].map((c) => [c.fips, c.name, c.state, c.pop ?? "", c.landSqMi, c.pop !== null && c.landSqMi ? (c.pop / c.landSqMi).toFixed(1) : "", c.income ?? "", c.homeValue ?? ""])]),
              "us-counties.csv",
              "text/csv",
            )
          }
        >
          Download data (CSV)
        </Btn>
        <span className="self-center text-xs text-[var(--color-muted)]">Hover or tap a county for its figure; click to see all of them. + and − zoom, drag to pan.</span>
      </div>
      {selC && (
        <div className="mt-4 rounded-lg border border-[var(--color-line)]">
          <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-4">
            <p className="text-xl font-semibold">
              {selC.name}, {US_STATES[selC.state] ?? selC.state}
            </p>
            <p className="text-sm text-[var(--color-muted)]">FIPS {selC.fips}</p>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-[var(--color-line)]">
              {(Object.keys(METRICS) as Metric[]).map((m) => {
                const v = METRICS[m].get(selC);
                return (
                  <tr key={m}>
                    <td className="px-3 py-2 font-medium">{METRICS[m].label}</td>
                    <td className="px-3 py-2">{v === null ? "not published" : METRICS[m].fmt(v)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Outlines: <Ext href={CENSUS_CB_URL}>Census Bureau 2024 cartographic boundaries</Ext> (1:500,000, simplified), Albers equal-area with Alaska and Hawaii moved and rescaled. Figures:{" "}
        <Ext href={ACS_SF_URL}>American Community Survey</Ext> 2019–2023 5-year estimates (tables B01003, B19013, B25077) and <Ext href={GAZETTEER_URL}>2024 Gazetteer</Ext> land area. ACS
        figures are survey estimates with margins of error, largest for small counties. Connecticut&apos;s 2024 boundaries are its nine planning regions.
      </p>
    </div>
  );
}
