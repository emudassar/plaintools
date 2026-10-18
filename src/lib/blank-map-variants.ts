/**
 * Builds the four variants of a printable blank map from the one stored SVG
 * (public/maps/blank/<slug>.svg) plus its overlay (public/maps/blank/<slug>.json),
 * both written by scripts/build-blank-maps.mjs.
 *
 * Every variant is the blank SVG with something added before </svg>, so the
 * borders sit in exactly the same place in all four — a printed worksheet and
 * its answer key line up.
 */

export type MapVariant = "blank" | "labeled" | "colored" | "cities";

export const MAP_VARIANTS: { id: MapVariant; label: string; note: string }[] = [
  { id: "blank", label: "Blank", note: "Outlines only — no labels, no fill." },
  { id: "labeled", label: "Labeled", note: "Each shape named at an interior point." },
  { id: "colored", label: "Colored", note: "Neighbouring shapes never share a colour. The colours carry no meaning." },
  { id: "cities", label: "With cities", note: "Largest places by population; squares mark national capitals." },
];

export interface MapOverlay {
  w: number;
  h: number;
  /** One colour per unit path, in path order (u0, u1, ...). */
  fills: string[];
  /** [x, y, fontSize, text] */
  labels: [number, number, number, string][];
  cityFont: number;
  /** [x, y, name, isCapital, text-anchor, labelX, labelY] — positions chosen at build time so labels do not overlap. */
  cities: [number, number, string, 0 | 1, "start" | "end" | "middle", number, number][];
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function labelsGroup(o: MapOverlay): string {
  return (
    `<g font-family="Arial, Helvetica, sans-serif" text-anchor="middle" fill="#111" stroke="#fff" stroke-width="2.4" paint-order="stroke" stroke-linejoin="round">` +
    o.labels.map(([x, y, size, text]) => `<text x="${x}" y="${y}" font-size="${size}">${esc(text)}</text>`).join("") +
    `</g>`
  );
}

function citiesGroup(o: MapOverlay): string {
  const f = o.cityFont;
  const r = Math.round(f * 0.3);
  return (
    `<style>.units path{fill:#f6f5f0}</style>` +
    `<g font-family="Arial, Helvetica, sans-serif" font-size="${f}" fill="#111" stroke="#fff" stroke-width="${Math.round(f / 8)}" paint-order="stroke" stroke-linejoin="round">` +
    o.cities
      .map(([x, y, name, cap, anchor, tx, ty]) => {
        const mark = cap
          ? `<rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r}" fill="#b91c1c" stroke="#fff" stroke-width="3"/>`
          : `<circle cx="${x}" cy="${y}" r="${r}" fill="#1d4ed8" stroke="#fff" stroke-width="3"/>`;
        return mark + `<text x="${tx}" y="${ty}" text-anchor="${anchor}">${esc(name)}</text>`;
      })
      .join("") +
    `</g>`
  );
}

function fillsStyle(o: MapOverlay): string {
  return `<style>${o.fills.map((c, i) => `#u${i}{fill:${c}}`).join("")}</style>`;
}

/** Returns the SVG text of one variant. */
export function composeVariant(blankSvg: string, o: MapOverlay, v: MapVariant): string {
  if (v === "blank") return blankSvg;
  const extra = v === "labeled" ? labelsGroup(o) : v === "colored" ? fillsStyle(o) : citiesGroup(o);
  const at = blankSvg.lastIndexOf("</svg>");
  return blankSvg.slice(0, at) + extra + blankSvg.slice(at);
}
