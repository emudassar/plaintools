"use client";

import { useRef, useState, type ReactNode, type RefObject } from "react";
import type { ProjectedMap, Region } from "@/lib/projected";

/**
 * An outline map from pre-projected SVG paths, with hover tooltip, click, zoom and pan.
 * The <svg> is self-contained (inline styles only) so it can be serialised for download.
 */
interface Props {
  map: ProjectedMap;
  fill: (r: Region) => string;
  stroke?: string;
  strokeWidth?: number;
  tooltip?: (r: Region) => ReactNode;
  onClick?: (r: Region) => void;
  /** Extra SVG drawn in map coordinates on top (labels, legend). */
  children?: ReactNode;
  svgRef?: RefObject<SVGSVGElement | null>;
  ariaLabel: string;
  /** Extra height below the map, inside the SVG (for a title or legend). */
  footer?: number;
  header?: number;
  background?: string;
  highlight?: string | null;
}

export default function ProjectedMapView({ map, fill, stroke = "#ffffff", strokeWidth = 0.5, tooltip, onClick, children, svgRef, ariaLabel, footer = 0, header = 0, background = "#ffffff", highlight }: Props) {
  const H = map.h + footer + header;
  const [vb, setVb] = useState({ x: 0, y: 0, w: map.w, h: H });
  const [tip, setTip] = useState<{ r: Region; x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);

  const zoom = (f: number) =>
    setVb((v) => {
      const w = Math.min(map.w, Math.max(map.w / 16, v.w / f));
      const h = (w * H) / map.w;
      const cx = v.x + v.w / 2, cy = v.y + v.h / 2;
      return { x: Math.max(0, Math.min(map.w - w, cx - w / 2)), y: Math.max(0, Math.min(H - h, cy - h / 2)), w, h };
    });

  return (
    <div ref={box} className="relative w-full overflow-hidden rounded-lg border border-[var(--color-line)]" style={{ background }}>
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        width={map.w}
        height={H}
        className="block h-auto w-full touch-none select-none"
        role="img"
        aria-label={ariaLabel}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY, vx: vb.x, vy: vb.y, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d && vb.w < map.w) {
            const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const k = vb.w / r.width;
            const dx = (e.clientX - d.x) * k, dy = (e.clientY - d.y) * k;
            if (Math.abs(dx) + Math.abs(dy) > 3 * k) d.moved = true;
            if (d.moved) setVb((v) => ({ ...v, x: Math.max(0, Math.min(map.w - v.w, d.vx - dx)), y: Math.max(0, Math.min(H - v.h, d.vy - dy)) }));
          }
        }}
        onPointerUp={() => setTimeout(() => (drag.current = null), 0)}
        onPointerLeave={() => {
          drag.current = null;
          setTip(null);
        }}
      >
        <rect x={0} y={0} width={map.w} height={H} fill={background} />
        <g transform={header || map.ox || map.oy ? `translate(${-(map.ox ?? 0)} ${header - (map.oy ?? 0)})` : undefined}>
          {map.regions.map((r) => (
            <path
              key={r.id}
              d={r.d}
              fill={fill(r)}
              stroke={highlight === r.id ? "#111111" : stroke}
              strokeWidth={highlight === r.id ? strokeWidth * 4 : strokeWidth}
              strokeLinejoin="round"
              style={{ cursor: onClick ? "pointer" : undefined }}
              onPointerMove={(e) => {
                if (!tooltip || !box.current) return;
                const b = box.current.getBoundingClientRect();
                setTip({ r, x: e.clientX - b.left, y: e.clientY - b.top });
              }}
              onClick={() => {
                if (drag.current?.moved) return;
                onClick?.(r);
              }}
            >
              <title>{r.name}</title>
            </path>
          ))}
          {map.lines && <path d={map.lines} fill="none" stroke="#444444" strokeWidth={0.8} strokeLinejoin="round" pointerEvents="none" />}
        </g>
        {children}
      </svg>
      <div className="absolute top-2 right-2 flex flex-col overflow-hidden rounded-md border border-[var(--color-line)] bg-white shadow-sm">
        <button type="button" onClick={() => zoom(1.6)} className="h-8 w-8 text-lg leading-none font-medium" aria-label="Zoom in">
          +
        </button>
        <button type="button" onClick={() => zoom(1 / 1.6)} className="h-8 w-8 border-t border-[var(--color-line)] text-lg leading-none font-medium" aria-label="Zoom out">
          −
        </button>
        <button type="button" onClick={() => setVb({ x: 0, y: 0, w: map.w, h: H })} className="h-8 w-8 border-t border-[var(--color-line)] text-xs" aria-label="Reset view">
          ⟲
        </button>
      </div>
      {tip && tooltip && (
        <div className="pointer-events-none absolute z-10 max-w-xs rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-sm shadow" style={{ left: Math.min(tip.x + 12, (box.current?.clientWidth ?? 600) - 220), top: tip.y + 12 }}>
          {tooltip(tip.r)}
        </div>
      )}
    </div>
  );
}

/** The SVG element as a standalone file string. */
export function serializeSvg(el: SVGSVGElement, fullView = true): string {
  const clone = el.cloneNode(true) as SVGSVGElement;
  if (fullView) clone.setAttribute("viewBox", `0 0 ${el.getAttribute("width")} ${el.getAttribute("height")}`);
  clone.removeAttribute("class");
  clone.querySelectorAll("title").forEach((t) => t.remove());
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
}
