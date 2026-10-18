"use client";

import { useState } from "react";
import { n, n0 } from "./GeoBits";
import { M_TO_FT } from "@/lib/elevation";

/** Elevation (m) against distance (m) as an SVG area chart with a hover read-out. */
export default function ProfileChart({ s, unit }: { s: { d: number; m: number }[]; unit: "ft" | "m" }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 240, L = 52, B = 28, T = 10, R = 10;
  const f = unit === "ft" ? M_TO_FT : 1;
  const ys = s.map((x) => x.m * f);
  let lo = Math.min(...ys), hi = Math.max(...ys);
  if (hi - lo < 10) { lo -= 5; hi += 5; }
  const pad = (hi - lo) * 0.08;
  lo -= pad; hi += pad;
  const dmax = s[s.length - 1].d;
  const X = (d: number) => L + ((W - L - R) * d) / dmax;
  const Y = (v: number) => T + ((H - T - B) * (hi - v)) / (hi - lo);
  const path = s.map((x, i) => `${i ? "L" : "M"}${X(x.d).toFixed(1)},${Y(ys[i]).toFixed(1)}`).join("");
  const dUnit = unit === "ft" ? 1609.344 : 1000;
  const ticks = 5;
  const h = hover === null ? null : s[hover];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full touch-none"
      role="img"
      aria-label="Elevation profile chart"
      onPointerMove={(e) => {
        const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
        const d = (((e.clientX - r.left) / r.width) * W - L) / (W - L - R) * dmax;
        let best = 0;
        for (let i = 1; i < s.length; i++) if (Math.abs(s[i].d - d) < Math.abs(s[best].d - d)) best = i;
        setHover(best);
      }}
      onPointerLeave={() => setHover(null)}
    >
      <path d={`${path}L${X(dmax)},${H - B}L${L},${H - B}Z`} fill="#1f5f4b" fillOpacity={0.12} />
      <path d={path} fill="none" stroke="#1f5f4b" strokeWidth={2} />
      {Array.from({ length: ticks + 1 }, (_, i) => lo + ((hi - lo) * i) / ticks).map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="#e3e7ec" />
          <text x={L - 6} y={Y(v) + 4} fontSize={11} textAnchor="end" fill="#5a6572">
            {n0(v)}
          </text>
        </g>
      ))}
      {Array.from({ length: ticks + 1 }, (_, i) => (dmax * i) / ticks).map((d) => (
        <text key={d} x={X(d)} y={H - 8} fontSize={11} textAnchor="middle" fill="#5a6572">
          {n(d / dUnit, 1)}
        </text>
      ))}
      <text x={4} y={14} fontSize={11} fill="#5a6572">
        {unit}
      </text>
      {h && (
        <g>
          <line x1={X(h.d)} x2={X(h.d)} y1={T} y2={H - B} stroke="#c2410c" />
          <circle cx={X(h.d)} cy={Y(h.m * f)} r={4} fill="#c2410c" />
          <text x={Math.min(X(h.d) + 6, W - 150)} y={T + 14} fontSize={12} fill="#111">
            {n(h.d / dUnit, 2)} {unit === "ft" ? "mi" : "km"} · {n0(h.m * f)} {unit}
          </text>
        </g>
      )}
    </svg>
  );
}
