"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  fitBounds,
  MAX_ZOOM,
  MIN_ZOOM,
  OSM_COPYRIGHT_URL,
  OSM_FIX_URL,
  OSM_TILE_URL,
  project,
  TILE,
  unproject,
  unwrapLons,
} from "@/lib/web-mercator";
import type { LatLon } from "@/lib/geodesy";

/**
 * A dependency-free slippy map: OpenStreetMap raster tiles plus an SVG overlay.
 *
 * Tile usage policy (operations.osmfoundation.org/policies/tiles/): visible
 * attribution, the standard HTTPS tile URL, the browser's own User-Agent and
 * Referer, normal browser caching, no prefetching. Only the tiles in view are
 * requested.
 */

export interface MapMarker extends LatLon {
  label?: string;
  color?: string;
}
export interface MapShape {
  points: LatLon[];
  color?: string;
  /** Closed and filled (a radius ring) rather than an open line. */
  fill?: boolean;
  dashed?: boolean;
}

interface Props {
  markers?: MapMarker[];
  shapes?: MapShape[];
  /** Clicking (not dragging) the map reports the point. */
  onPick?: (p: LatLon) => void;
  /** Change this to re-fit the view to the content. */
  fitKey?: string;
  height?: number;
  maxFitZoom?: number;
  ariaLabel: string;
}

const ACCENT = "#1d4ed8";

export default function TileMap({ markers = [], shapes = [], onPick, fitKey, height = 360, maxFitZoom = 14, ariaLabel }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [view, setView] = useState({ lat: 20, lon: 0, zoom: 2 });
  const drag = useRef<{ x: number; y: number; cx: number; cy: number; moved: boolean } | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(200, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fit the view to everything drawn whenever the content changes.
  useEffect(() => {
    const pts: LatLon[] = [...markers, ...shapes.flatMap((s) => s.points)];
    if (pts.length === 0) return;
    const ref = pts[0].lon;
    // Markers unwrap independently (scattered points); shapes unwrap point to point (paths, rings).
    const lons = [
      ...markers.map((m) => unwrapLons([m.lon], ref)[0]),
      ...shapes.flatMap((s) => unwrapLons(s.points.map((p) => p.lon), ref)),
    ];
    const lats = pts.map((p) => p.lat);
    const fit = fitBounds(
      { south: Math.min(...lats), north: Math.max(...lats), west: Math.min(...lons), east: Math.max(...lons) },
      width,
      height,
      36,
      maxFitZoom,
    );
    setView(fit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, width, height]);

  const z = view.zoom;
  const c = project(view.lat, view.lon, z);
  const ox = c.x - width / 2;
  const oy = c.y - height / 2;
  const n = 2 ** z;

  const tiles = useMemo(() => {
    const out: { key: string; src: string; left: number; top: number }[] = [];
    const x0 = Math.floor(ox / TILE), x1 = Math.floor((ox + width) / TILE);
    const y0 = Math.max(0, Math.floor(oy / TILE)), y1 = Math.min(n - 1, Math.floor((oy + height) / TILE));
    for (let tx = x0; tx <= x1; tx++) {
      for (let ty = y0; ty <= y1; ty++) {
        const wx = ((tx % n) + n) % n;
        out.push({ key: `${z}/${tx}/${ty}`, src: `${OSM_TILE_URL}/${z}/${wx}/${ty}.png`, left: tx * TILE - ox, top: ty * TILE - oy });
      }
    }
    return out;
  }, [ox, oy, width, height, n, z]);

  // Overlay pixel positions, unwrapped so they draw next to the view centre.
  const px = (pts: LatLon[]) => {
    const lons = unwrapLons(pts.map((p) => p.lon), view.lon);
    return pts.map((p, i) => {
      const q = project(p.lat, lons[i], z);
      return [q.x - ox, q.y - oy] as const;
    });
  };

  function zoomBy(d: number) {
    setView((v) => ({ ...v, zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.zoom + d)) }));
  }

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button,a")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, cx: c.x, cy: c.y, moved: false };
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (!d.moved) return;
    const p = unproject(d.cx - dx, Math.max(0, Math.min(TILE * n, d.cy - dy)), z);
    setView((v) => ({ ...v, lat: p.lat, lon: p.lon }));
  }
  function onPointerUp(e: React.PointerEvent) {
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved || !onPick || !box.current) return;
    const r = box.current.getBoundingClientRect();
    const p = unproject(ox + (e.clientX - r.left), oy + (e.clientY - r.top), z);
    onPick({ lat: p.lat, lon: p.lon });
  }

  return (
    <div
      ref={box}
      role="region"
      aria-label={ariaLabel}
      className="relative w-full touch-none overflow-hidden rounded-lg border border-[var(--color-line)] bg-[#aad3df] select-none"
      style={{ height, cursor: onPick ? "crosshair" : "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (drag.current = null)}
      onDoubleClick={() => zoomBy(1)}
    >
      {tiles.map((t) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={t.key}
          src={t.src}
          alt=""
          width={TILE}
          height={TILE}
          draggable={false}
          className="pointer-events-none absolute max-w-none"
          style={{ left: t.left, top: t.top }}
        />
      ))}
      <svg className="pointer-events-none absolute inset-0" width={width} height={height} aria-hidden="true">
        {shapes.map((s, i) => {
          const d = px(s.points).map(([x, y], j) => `${j ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("") + (s.fill ? "Z" : "");
          const col = s.color ?? ACCENT;
          return (
            <path
              key={i}
              d={d}
              fill={s.fill ? col : "none"}
              fillOpacity={s.fill ? 0.12 : 0}
              stroke={col}
              strokeWidth={2.5}
              strokeDasharray={s.dashed ? "6 5" : undefined}
            />
          );
        })}
        {markers.map((m, i) => {
          const [[x, y]] = px([m]);
          return (
            <g key={i} transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}>
              <circle r={7} fill={m.color ?? ACCENT} stroke="white" strokeWidth={2.5} />
              {m.label && (
                <text x={11} y={4} fontSize={13} fontWeight={600} fill="#111" stroke="white" strokeWidth={3} paintOrder="stroke">
                  {m.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="absolute top-2 left-2 flex flex-col overflow-hidden rounded-md border border-[var(--color-line)] bg-white shadow-sm">
        <button type="button" onClick={() => zoomBy(1)} className="h-8 w-8 text-lg leading-none font-medium" aria-label="Zoom in">
          +
        </button>
        <button type="button" onClick={() => zoomBy(-1)} className="h-8 w-8 border-t border-[var(--color-line)] text-lg leading-none font-medium" aria-label="Zoom out">
          −
        </button>
      </div>
      <div className="absolute right-0 bottom-0 bg-white/85 px-1.5 py-0.5 text-[11px] text-[#333]">
        ©{" "}
        <a href={OSM_COPYRIGHT_URL} target="_blank" rel="noopener" className="underline">
          OpenStreetMap
        </a>{" "}
        contributors ·{" "}
        <a href={OSM_FIX_URL} target="_blank" rel="noopener" className="underline">
          Report a map issue
        </a>
      </div>
    </div>
  );
}
