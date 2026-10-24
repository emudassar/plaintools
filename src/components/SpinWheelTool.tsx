"use client";

import { useState } from "react";
import { ResultCard } from "./CalcBits";
import { Btn } from "./ToolBits";
import { parseList, randInt } from "@/lib/fun-tools";

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#65a30d"];

function Wheel({ items, rotation, spinning }: { items: string[]; rotation: number; spinning: boolean }) {
  const n = items.length;
  const r = 140;
  return (
    <div className="relative mx-auto mb-4 w-full max-w-sm">
      <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 text-2xl leading-none text-[var(--color-ink,#111)]" aria-hidden="true">
        ▼
      </div>
      <svg viewBox="-150 -150 300 300" className="w-full" role="img" aria-label="Spinning wheel">
        <g style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 4s cubic-bezier(0.15, 0.85, 0.2, 1)" : "none" }}>
          {items.map((it, i) => {
            const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
            const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
            const mid = (a0 + a1) / 2;
            const large = a1 - a0 > Math.PI ? 1 : 0;
            const path = n === 1 ? `M0 ${-r} A${r} ${r} 0 1 1 -0.01 ${-r} Z` : `M0 0 L${r * Math.cos(a0)} ${r * Math.sin(a0)} A${r} ${r} 0 ${large} 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)} Z`;
            const label = it.length > 14 ? it.slice(0, 13) + "…" : it;
            return (
              <g key={i}>
                <path d={path} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth="1" />
                <text
                  x={r * 0.6 * Math.cos(mid)}
                  y={r * 0.6 * Math.sin(mid)}
                  fill="#fff"
                  fontSize={n > 16 ? 8 : 11}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${(mid * 180) / Math.PI} ${r * 0.6 * Math.cos(mid)} ${r * 0.6 * Math.sin(mid)})`}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </g>
        <circle r="10" fill="#fff" stroke="#999" />
      </svg>
    </div>
  );
}

export default function SpinWheelTool() {
  const [text, setText] = useState("Pizza\nTacos\nSushi\nBurgers\nCurry\nPasta");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [removeWinner, setRemoveWinner] = useState(false);
  const items = parseList(text).slice(0, 100);

  function spin() {
    if (items.length < 2 || spinning) return;
    const idx = randInt(items.length);
    const seg = 360 / items.length;
    // Land the pointer (top) inside the chosen segment, not on its edge.
    const within = seg * (0.15 + 0.7 * (randInt(1000) / 1000));
    const target = 360 * 6 - (idx * seg + within);
    const next = rotation - (rotation % 360) + target + 360;
    setWinner(null);
    setSpinning(true);
    setRotation(next);
    setTimeout(() => {
      setSpinning(false);
      setWinner(items[idx]);
      setHistory((h) => [items[idx], ...h].slice(0, 20));
      if (removeWinner) setText(items.filter((_, i) => i !== idx).join("\n"));
    }, 4100);
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="wheel-items" className="mb-1.5 block font-medium">
            Options, one per line ({items.length})
          </label>
          <textarea id="wheel-items" rows={10} value={text} onChange={(e) => setText(e.target.value)} className="mb-2 w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5" />
          <label className="mb-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={removeWinner} onChange={(e) => setRemoveWinner(e.target.checked)} />
            <span>Remove each winner from the wheel</span>
          </label>
          <Btn onClick={spin} disabled={items.length < 2 || spinning} primary>
            {spinning ? "Spinning…" : "Spin the wheel"}
          </Btn>
          {items.length < 2 && <p className="mt-2 text-sm text-[var(--color-muted)]">Add at least two options.</p>}
        </div>
        <Wheel items={items.length ? items : ["Add options"]} rotation={rotation} spinning={spinning} />
      </div>
      <div aria-live="polite" className="mt-4">
        {winner && (
          <ResultCard
            label="The wheel picked"
            headline={winner}
            sub={history.length > 1 ? `Earlier: ${history.slice(1).join(", ")}` : undefined}
            method={<p>The winner is chosen first with your browser&apos;s cryptographic random number generator (Web Crypto), equally likely for every option; the animation then turns the wheel to it. Nothing is stored or sent.</p>}
          />
        )}
      </div>
    </div>
  );
}
