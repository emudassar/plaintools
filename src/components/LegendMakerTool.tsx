"use client";

import { useRef, useState } from "react";
import { Btn } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import { PALETTE } from "@/lib/projected";
import { downloadPng, downloadText } from "@/lib/svg-export";

type Symbol = "square" | "circle" | "line" | "dashed" | "pin";
interface Item {
  color: string;
  label: string;
  symbol: Symbol;
}

const START: Item[] = [
  { color: "#1f78b4", label: "Water", symbol: "square" },
  { color: "#33a02c", label: "Parkland", symbol: "square" },
  { color: "#e31a1c", label: "Main road", symbol: "line" },
  { color: "#6a3d9a", label: "Trail", symbol: "dashed" },
  { color: "#ff7f00", label: "Point of interest", symbol: "circle" },
];


export default function LegendMakerTool() {
  const [items, setItems] = useState<Item[]>(START);
  const [title, setTitle] = useState("Legend");
  const [cols, setCols] = useState(1);
  const [font, setFont] = useState(16);
  const [bg, setBg] = useState("#ffffff");
  const [border, setBorder] = useState(true);
  const [transparent, setTransparent] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const sw = font * 1.4, row = font * 1.9, pad = font;
  const charW = font * 0.58;
  const colW = sw + 10 + Math.max(4, ...items.map((i) => i.label.length)) * charW + pad;
  const rows = Math.ceil(items.length / cols);
  const titleH = title ? font * 1.9 : 0;
  const W = Math.round(pad * 2 + cols * colW - pad + 4);
  const H = Math.round(pad * 2 + titleH + rows * row - (row - sw));

  const sym = (it: Item) => {
    const c = it.color, y = sw / 2;
    switch (it.symbol) {
      case "circle":
        return <circle cx={sw / 2} cy={y} r={sw / 2.6} fill={c} stroke="#333" strokeWidth={0.8} />;
      case "line":
        return <line x1={0} x2={sw} y1={y} y2={y} stroke={c} strokeWidth={font / 4} strokeLinecap="round" />;
      case "dashed":
        return <line x1={0} x2={sw} y1={y} y2={y} stroke={c} strokeWidth={font / 5} strokeDasharray={`${font / 3} ${font / 4}`} />;
      case "pin":
        return <path d={`M${sw / 2} ${sw} C ${sw * 0.15} ${sw * 0.55} ${sw * 0.15} ${sw * 0.08} ${sw / 2} ${sw * 0.08} C ${sw * 0.85} ${sw * 0.08} ${sw * 0.85} ${sw * 0.55} ${sw / 2} ${sw} Z`} fill={c} stroke="#333" strokeWidth={0.8} />;
      default:
        return <rect width={sw} height={sw} fill={c} stroke="#333" strokeWidth={0.8} />;
    }
  };

  const update = (i: number, p: Partial<Item>) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const serial = () => {
    const el = svgRef.current;
    if (!el) return "";
    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(el)}`;
  };

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-3 block">
            <span className="mb-1.5 block font-medium">Title</span>
            <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <p className="mb-1.5 font-medium">Entries</p>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <input type="color" value={it.color} onChange={(e) => update(i, { color: e.target.value })} aria-label={`Colour of entry ${i + 1}`} className="h-9 w-10" />
                <select className="rounded-md border border-[var(--color-line)] bg-white px-2 py-2 text-sm" value={it.symbol} onChange={(e) => update(i, { symbol: e.target.value as Symbol })} aria-label={`Symbol of entry ${i + 1}`}>
                  <option value="square">Area (square)</option>
                  <option value="circle">Point (circle)</option>
                  <option value="pin">Pin</option>
                  <option value="line">Line</option>
                  <option value="dashed">Dashed line</option>
                </select>
                <input className={`${fieldClass} min-w-0 flex-1 py-2`} value={it.label} onChange={(e) => update(i, { label: e.target.value })} aria-label={`Label of entry ${i + 1}`} />
                <button type="button" className="rounded border border-[var(--color-line)] px-2 py-1 text-xs" onClick={() => setItems((xs) => xs.filter((_, j) => j !== i))} aria-label={`Remove entry ${i + 1}`}>
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <Btn onClick={() => setItems((xs) => [...xs, { color: PALETTE[xs.length % 12], label: "New entry", symbol: "square" }])} disabled={items.length >= 40}>
              Add entry
            </Btn>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <label className="block">
              Columns
              <select className={`${fieldClass} mt-1`} value={cols} onChange={(e) => setCols(Number(e.target.value))}>
                {[1, 2, 3, 4].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              Text size
              <select className={`${fieldClass} mt-1`} value={font} onChange={(e) => setFont(Number(e.target.value))}>
                {[12, 14, 16, 20, 24, 32].map((c) => (
                  <option key={c} value={c}>
                    {c} px
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              Background <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-8 w-10" disabled={transparent} />
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} /> Transparent
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={border} onChange={(e) => setBorder(e.target.checked)} /> Border
            </label>
          </div>
        </div>
        <div>
          <p className="mb-1.5 font-medium">Preview</p>
          <div className="overflow-auto rounded-lg border border-dashed border-[var(--color-line)] p-4" style={{ background: "repeating-conic-gradient(#f3f4f6 0% 25%, #fff 0% 50%) 50% / 16px 16px" }}>
            <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} fontFamily="Arial, Helvetica, sans-serif" role="img" aria-label="Map legend preview">
              {!transparent && <rect x={0.5} y={0.5} width={W - 1} height={H - 1} fill={bg} rx={4} />}
              {border && <rect x={0.5} y={0.5} width={W - 1} height={H - 1} fill="none" stroke="#555" rx={4} />}
              {title && (
                <text x={pad} y={pad + font} fontSize={font * 1.1} fontWeight={700} fill="#111">
                  {title}
                </text>
              )}
              {items.map((it, i) => {
                const c = Math.floor(i / rows), r = i % rows;
                return (
                  <g key={i} transform={`translate(${pad + c * colW} ${pad + titleH + r * row})`}>
                    {sym(it)}
                    <text x={sw + 10} y={sw / 2 + font * 0.35} fontSize={font} fill="#222">
                      {it.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn primary onClick={() => void downloadPng(serial(), W * 3, "map-legend.png", transparent)}>
              Download PNG (3×)
            </Btn>
            <Btn onClick={() => downloadText(serial(), "map-legend.svg", "image/svg+xml")}>Download SVG</Btn>
          </div>
          <p className="mt-2 text-xs text-[var(--color-muted)]">PNG keeps a transparent background if you ticked Transparent. SVG stays sharp at any size and can be edited in Inkscape or Illustrator. Made in your browser; nothing is uploaded.</p>
        </div>
      </div>
    </div>
  );
}
