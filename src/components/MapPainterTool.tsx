"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProjectedMapView, { serializeSvg } from "./ProjectedMapView";
import { ErrorBox, Ext, Loading, n } from "./GeoBits";
import { Btn } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import { CENSUS_CB_URL, classOf, cropMap, loadUsCounties, loadUsStates, loadWorldMap, NE_ADMIN0_URL, PALETTE, pathBBox, projectLonLat, quantileBreaks, SEQ7, type ProjectedMap, type Region } from "@/lib/projected";
import { US_STATES } from "@/lib/us-data";
import { downloadPdf, downloadPng, downloadText } from "@/lib/svg-export";
import { PAGE_SIZES } from "@/lib/pdf-image";
import { asToolError } from "@/lib/errors";

/** Map bases a painter page can offer. "st:XX" = the counties of one state. */
export type Base = "us-states" | "world" | "africa" | "asia" | "europe" | "north-america" | "south-america" | "oceania" | "us-counties" | `st:${string}`;

const BASE_LABEL: Record<string, string> = {
  "us-states": "United States — states",
  world: "World — countries",
  africa: "Africa",
  asia: "Asia",
  europe: "Europe",
  "north-america": "North America",
  "south-america": "South America",
  oceania: "Oceania",
  "us-counties": "United States — all counties",
};
const CONTINENT: Record<string, string> = { africa: "Africa", asia: "Asia", europe: "Europe", "north-america": "North America", "south-america": "South America", oceania: "Oceania" };

const STATE_FIPS: Record<string, string> = {
  AL: "01", AK: "02", AZ: "04", AR: "05", CA: "06", CO: "08", CT: "09", DE: "10", DC: "11", FL: "12", GA: "13", HI: "15", ID: "16", IL: "17", IN: "18", IA: "19", KS: "20", KY: "21",
  LA: "22", ME: "23", MD: "24", MA: "25", MI: "26", MN: "27", MS: "28", MO: "29", MT: "30", NE: "31", NV: "32", NH: "33", NJ: "34", NM: "35", NY: "36", NC: "37", ND: "38", OH: "39",
  OK: "40", OR: "41", PA: "42", RI: "44", SC: "45", SD: "46", TN: "47", TX: "48", UT: "49", VT: "50", VA: "51", WA: "53", WV: "54", WI: "55", WY: "56", PR: "72",
};

async function loadBase(b: Base): Promise<ProjectedMap> {
  if (b === "us-states") return loadUsStates();
  if (b === "us-counties") return loadUsCounties();
  if (b === "world") return loadWorldMap();
  if (b.startsWith("st:")) {
    const st = b.slice(3);
    const r = await fetch(`/data/geo/counties/${STATE_FIPS[st]}.json`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = (await r.json()) as { counties: { id: string; name: string; geometry: { type: string; coordinates: number[][][] | number[][][][] } }[] };
    return projectLonLat(
      j.counties.map((c) => ({
        id: c.id,
        name: c.name,
        polys: ((c.geometry.type === "Polygon" ? [c.geometry.coordinates] : c.geometry.coordinates) as number[][][][]).map((poly) => poly.map((ring) => ring.map(([lon, lat]) => ({ lat, lon })))),
      })),
    );
  }
  const w = await loadWorldMap();
  return cropMap(w, (r) => r.group === CONTINENT[b], b === "europe" ? { skip: ["RUS"], padRight: 0.25 } : b === "oceania" ? { eastOnly: true } : {});
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

/** Match a typed name or code to a region. */
function matcher(regions: Region[]) {
  const idx = new Map<string, Region>();
  for (const r of regions) {
    idx.set(norm(r.id), r);
    idx.set(norm(r.name), r);
    const short = r.name.replace(/ (County|Parish|Borough|Census Area|Municipality|City and Borough|Planning Region|city)$/i, "");
    if (!idx.has(norm(short))) idx.set(norm(short), r);
    if (r.group) {
      idx.set(norm(`${r.name}${r.group}`), r);
      idx.set(norm(`${short}${r.group}`), r);
    }
  }
  for (const [code, name] of Object.entries(US_STATES)) {
    const r = idx.get(norm(code));
    if (r && !idx.has(norm(name))) idx.set(norm(name), r);
  }
  return (s: string) => idx.get(norm(s)) ?? null;
}

interface LegendItem {
  color: string;
  label: string;
}

export default function MapPainterTool({ bases, initial, dataHint }: { bases: Base[]; initial: Base; dataHint: string }) {
  const [base, setBase] = useState<Base>(initial);
  const [map, setMap] = useState<ProjectedMap | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [fills, setFills] = useState<Record<string, string>>({});
  const [brush, setBrush] = useState(PALETTE[0]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [showNames, setShowNames] = useState(false);
  const [data, setData] = useState("");
  const [dataMsg, setDataMsg] = useState<string | null>(null);
  const [choro, setChoro] = useState<{ breaks: number[]; values: Record<string, number> } | null>(null);
  const [page, setPage] = useState(PAGE_SIZES[0].id);
  const [base0, setBase0] = useState("#e5e7eb");
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMap(null);
    setErr(null);
    setFills({});
    setChoro(null);
    loadBase(base).then(setMap, (e) => setErr(asToolError(e).message));
  }, [base]);

  const find = useMemo(() => (map ? matcher(map.regions) : null), [map]);
  const used: LegendItem[] = choro
    ? SEQ7.map((c, i) => ({ color: c, label: i === 0 ? `< ${n(choro.breaks[0], 1)}` : i === SEQ7.length - 1 ? `≥ ${n(choro.breaks[i - 1], 1)}` : `${n(choro.breaks[i - 1], 1)} – ${n(choro.breaks[i], 1)}` }))
    : [...new Set(Object.values(fills))].map((c) => ({ color: c, label: labels[c] ?? "" }));

  function applyData() {
    if (!map || !find) return;
    const lines = data.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const rows = lines.map((l) => {
      const i = Math.max(l.lastIndexOf(","), l.lastIndexOf("\t"));
      return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : [l, ""];
    });
    const miss: string[] = [];
    const hits = rows.map(([name, v]) => {
      const r = find(name);
      if (!r) miss.push(name);
      return { r, v };
    });
    const ok = hits.filter((h): h is { r: Region; v: string } => !!h.r);
    const numeric = ok.length > 0 && ok.every((h) => h.v !== "" && Number.isFinite(Number(h.v.replace(/[$,%]/g, ""))));
    if (numeric) {
      const values = Object.fromEntries(ok.map((h) => [h.r.id, Number(h.v.replace(/[$,%]/g, ""))]));
      setChoro({ breaks: quantileBreaks(Object.values(values), 7), values });
      setFills({});
    } else {
      const cats = [...new Set(ok.map((h) => h.v || "Selected"))];
      const colorOf = Object.fromEntries(cats.map((c, i) => [c, /^#[0-9a-f]{6}$/i.test(c) ? c : PALETTE[i % 12]]));
      setChoro(null);
      setFills(Object.fromEntries(ok.map((h) => [h.r.id, colorOf[h.v || "Selected"]])));
      setLabels(Object.fromEntries(cats.filter((c) => !/^#[0-9a-f]{6}$/i.test(c)).map((c) => [colorOf[c], c])));
    }
    setDataMsg(`${ok.length} matched${miss.length ? ` · not matched: ${miss.slice(0, 10).join(", ")}${miss.length > 10 ? "…" : ""}` : ""}${numeric ? " · numbers found, so the map is shaded in 7 quantile classes" : ""}`);
  }

  if (err) return <ErrorBox title="The map did not load" message={err} onRetry={() => setBase((b) => b)} />;
  const legendRows = Math.ceil(used.filter((u) => u.label || !choro).length / 3);
  const footer = used.length ? 24 + legendRows * 20 : 8;
  const header = title ? 40 : 0;
  const fileBase = (title || BASE_LABEL[base] || "map").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "map";

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block font-medium">Map</span>
          <select className={fieldClass} value={base} onChange={(e) => setBase(e.target.value as Base)}>
            {bases.map((b) => (
              <option key={b} value={b}>
                {b.startsWith("st:") ? `${US_STATES[b.slice(3)]} — counties` : BASE_LABEL[b]}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block font-medium">Title (optional)</span>
          <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. States I have visited" />
        </label>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Paint with:</span>
        {PALETTE.slice(0, 12).map((c) => (
          <button key={c} type="button" onClick={() => setBrush(c)} aria-label={`Colour ${c}`} aria-pressed={brush === c} className="h-7 w-7 rounded border" style={{ background: c, outline: brush === c ? "3px solid #111" : undefined, outlineOffset: 1 }} />
        ))}
        <input type="color" value={brush} onChange={(e) => setBrush(e.target.value)} aria-label="Custom colour" className="h-7 w-10" />
        <button type="button" onClick={() => setBrush("")} aria-pressed={brush === ""} className={`rounded border px-2 py-1 text-xs ${brush === "" ? "border-black" : "border-[var(--color-line)]"}`}>
          Eraser
        </button>
        <label className="ml-2 flex items-center gap-1 text-xs">
          Unpainted
          <input type="color" value={base0} onChange={(e) => setBase0(e.target.value)} className="h-6 w-8" />
        </label>
        <label className="ml-2 flex items-center gap-1 text-xs">
          <input type="checkbox" checked={showNames} onChange={(e) => setShowNames(e.target.checked)} />
          Names on map
        </label>
      </div>
      {!map ? (
        <Loading note="Loading the map outline…" />
      ) : (
        <ProjectedMapView
          key={base}
          map={map}
          svgRef={svg}
          header={header}
          footer={footer}
          ariaLabel={title || BASE_LABEL[base] || "Map"}
          strokeWidth={base === "us-counties" ? 0.25 : 0.6}
          stroke="#ffffff"
          fill={(r) => {
            if (choro) {
              const k = classOf(choro.values[r.id], choro.breaks);
              return k < 0 ? base0 : SEQ7[k];
            }
            return fills[r.id] || base0;
          }}
          tooltip={(r) => (
            <>
              <strong>{r.name}</strong>
              {r.group && base === "us-counties" ? `, ${r.group}` : ""}
              {choro && choro.values[r.id] !== undefined ? ` · ${n(choro.values[r.id], 2)}` : ""}
            </>
          )}
          onClick={(r) => {
            if (choro) return;
            setFills((f) => {
              const next = { ...f };
              if (!brush || next[r.id] === brush) delete next[r.id];
              else next[r.id] = brush;
              return next;
            });
          }}
        >
          <g fontFamily="Arial, Helvetica, sans-serif">
            {title && (
              <text x={map.w / 2} y={28} fontSize={22} fontWeight={700} textAnchor="middle" fill="#111">
                {title}
              </text>
            )}
            {showNames && (
              <g transform={`translate(${-(map.ox ?? 0)} ${header - (map.oy ?? 0)})`} fontSize={base === "us-counties" ? 3 : base.startsWith("st:") ? 9 : 8} textAnchor="middle" fill="#111" pointerEvents="none">
                {map.regions.map((r) => {
                  const b = pathBBox(r.d);
                  if (b[2] - b[0] < 6 && base !== "us-counties") return null;
                  return (
                    <text key={r.id} x={(b[0] + b[2]) / 2} y={(b[1] + b[3]) / 2 + 3}>
                      {base === "us-states" ? r.id : r.name.replace(/ (County|Parish|Borough|Census Area|Planning Region)$/, "")}
                    </text>
                  );
                })}
              </g>
            )}
            {used.length > 0 &&
              used.map((u, i) => (
                <g key={u.color + i} transform={`translate(${16 + (i % 3) * (map.w / 3)} ${header + map.h + 14 + Math.floor(i / 3) * 20})`}>
                  <rect width={16} height={12} fill={u.color} stroke="#888" strokeWidth={0.5} />
                  <text x={22} y={10.5} fontSize={12} fill="#222">
                    {u.label || (choro ? "" : "—")}
                  </text>
                </g>
              ))}
          </g>
        </ProjectedMapView>
      )}
      <p className="mt-1.5 text-xs text-[var(--color-muted)]">Click a {base.includes("count") || base.startsWith("st:") ? "county" : base === "us-states" ? "state" : "country"} to paint it; click again with the same colour to clear it. + and − zoom, drag to pan.</p>

      {!choro && used.length > 0 && (
        <div className="mt-3 rounded-md border border-[var(--color-line)] p-3">
          <p className="mb-2 text-sm font-medium">Legend labels</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {used.map((u) => (
              <label key={u.color} className="flex items-center gap-2 text-sm">
                <span className="inline-block h-5 w-5 shrink-0 rounded border" style={{ background: u.color }} />
                <input className={`${fieldClass} py-1.5`} value={labels[u.color] ?? ""} onChange={(e) => setLabels((l) => ({ ...l, [u.color]: e.target.value }))} placeholder="Label for this colour" />
              </label>
            ))}
          </div>
        </div>
      )}

      <details className="mt-3 rounded-md border border-[var(--color-line)] p-3" open={!!data}>
        <summary className="cursor-pointer text-sm font-medium">Colour from a list or data instead</summary>
        <p className="mt-2 text-xs text-[var(--color-muted)]">{dataHint}</p>
        <textarea className={`${fieldClass} mt-2 h-32 font-mono text-sm`} value={data} onChange={(e) => setData(e.target.value)} spellCheck={false} />
        <div className="mt-2 flex flex-wrap gap-2">
          <Btn primary onClick={applyData} disabled={!data.trim() || !map}>
            Apply to map
          </Btn>
          <Btn
            onClick={() => {
              setChoro(null);
              setFills({});
              setDataMsg(null);
            }}
          >
            Clear colours
          </Btn>
        </div>
        {dataMsg && <p className="mt-2 text-sm">{dataMsg}</p>}
      </details>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Btn primary onClick={() => svg.current && void downloadPng(serializeSvg(svg.current), 2400, `${fileBase}.png`)} disabled={!map}>
          Download PNG
        </Btn>
        <Btn onClick={() => svg.current && downloadText(serializeSvg(svg.current), `${fileBase}.svg`, "image/svg+xml")} disabled={!map}>
          SVG
        </Btn>
        <select className="rounded-md border border-[var(--color-line)] bg-white px-2 py-2 text-sm" value={page} onChange={(e) => setPage(e.target.value)} aria-label="PDF page size">
          {PAGE_SIZES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <Btn onClick={() => svg.current && void downloadPdf(serializeSvg(svg.current), PAGE_SIZES.find((p) => p.id === page)!, `${fileBase}.pdf`)} disabled={!map}>
          PDF
        </Btn>
      </div>
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        {base === "us-states" || base === "us-counties" || base.startsWith("st:") ? (
          <>
            Outlines: <Ext href={CENSUS_CB_URL}>Census Bureau 2024 cartographic boundaries</Ext>, simplified (public domain).{" "}
            {base.startsWith("st:") ? "Drawn with a simple equirectangular projection scaled for the state's latitude." : "Albers equal-area projection; Alaska and Hawaii moved and rescaled."}
          </>
        ) : (
          <>
            Outlines: <Ext href={NE_ADMIN0_URL}>Natural Earth 1:50m countries</Ext> (public domain), Robinson projection. Borders follow Natural Earth&apos;s de facto lines.
          </>
        )}{" "}
        Your map is made in your browser and is yours to use; nothing is uploaded.
      </p>
    </div>
  );
}
