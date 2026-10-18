"use client";

import { useEffect, useState } from "react";
import CopyRow from "./CopyRow";
import { Ext } from "./GeoBits";
import { Btn, Tabs } from "./ToolBits";
import { fieldClass } from "./CalcBits";

const DOCS_URL = "https://developers.google.com/maps/documentation/embed/embedding-map";
const KEY_URL = "https://developers.google.com/maps/documentation/embed/get-api-key";
const USAGE_URL = "https://developers.google.com/maps/documentation/embed/usage-and-billing";

type Mode = "place" | "view" | "directions" | "search" | "streetview";
type Kind = "api" | "nokey";

const enc = encodeURIComponent;
const escAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export default function MapsEmbedTool() {
  const [kind, setKind] = useState<Kind>("api");
  const [mode, setMode] = useState<Mode>("place");
  const [key, setKey] = useState("");
  const [q, setQ] = useState("Eiffel Tower, Paris");
  const [origin, setOrigin] = useState("Union Station, Chicago");
  const [dest, setDest] = useState("Navy Pier, Chicago");
  const [travel, setTravel] = useState("driving");
  const [center, setCenter] = useState("40.7484,-73.9857");
  const [zoom, setZoom] = useState(14);
  const [maptype, setMaptype] = useState<"roadmap" | "satellite">("roadmap");
  const [heading, setHeading] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [w, setW] = useState("600");
  const [h, setH] = useState("450");
  const [responsive, setResponsive] = useState(true);
  const [title, setTitle] = useState("Map");
  const [preview, setPreview] = useState(false);

  const coordsOk = /^-?\d{1,2}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/.test(center.trim());
  let src = "";
  let problem: string | null = null;
  if (kind === "nokey") {
    if (!q.trim()) problem = "Enter a place or address.";
    src = `https://maps.google.com/maps?q=${enc(q.trim())}&t=${maptype === "satellite" ? "k" : "m"}&z=${zoom}&output=embed`;
  } else {
    const k = enc(key.trim() || "YOUR_API_KEY");
    if (!key.trim()) problem = "Paste your API key to make the code work (the code below has a placeholder).";
    const mt = maptype === "satellite" ? "&maptype=satellite" : "";
    if (mode === "place") src = `https://www.google.com/maps/embed/v1/place?key=${k}&q=${enc(q.trim())}&zoom=${zoom}${mt}`;
    if (mode === "search") src = `https://www.google.com/maps/embed/v1/search?key=${k}&q=${enc(q.trim())}&zoom=${zoom}${mt}`;
    if (mode === "view") {
      if (!coordsOk) problem = "Centre must be 'latitude,longitude', e.g. 40.7484,-73.9857.";
      src = `https://www.google.com/maps/embed/v1/view?key=${k}&center=${enc(center.replace(/\s/g, ""))}&zoom=${zoom}${mt}`;
    }
    if (mode === "directions") src = `https://www.google.com/maps/embed/v1/directions?key=${k}&origin=${enc(origin.trim())}&destination=${enc(dest.trim())}&mode=${travel}${mt}`;
    if (mode === "streetview") {
      if (!coordsOk) problem = "Location must be 'latitude,longitude', e.g. 48.8584,2.2945.";
      src = `https://www.google.com/maps/embed/v1/streetview?key=${k}&location=${enc(center.replace(/\s/g, ""))}&heading=${heading}&pitch=${pitch}&fov=90`;
    }
  }
  useEffect(() => setPreview(false), [src, w, h, responsive, title]);
  const iframeAttrs = `src="${escAttr(src)}" title="${escAttr(title)}" style="border:0" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"`;
  const code = responsive
    ? `<div style="position:relative;width:100%;max-width:${Number(w) || 600}px;aspect-ratio:${Number(w) || 600}/${Number(h) || 450}">\n  <iframe ${iframeAttrs} style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>\n</div>`.replace('style="border:0" ', "")
    : `<iframe ${iframeAttrs} width="${Number(w) || 600}" height="${Number(h) || 450}"></iframe>`;

  return (
    <div>
      <Tabs value={kind} onChange={(k) => { setKind(k); setPreview(false); }} options={[["api", "Maps Embed API (official, free key)"], ["nokey", "Quick embed without a key"]]} />
      {kind === "api" && (
        <>
          <label className="mb-3 block">
            <span className="mb-1.5 block font-medium">Your Google Maps API key</span>
            <input className={`${fieldClass} font-mono text-sm`} value={key} onChange={(e) => setKey(e.target.value)} placeholder="AIza…" autoComplete="off" spellCheck={false} />
            <span className="mt-1 block text-xs text-[var(--color-muted)]">
              Stays in your browser and goes only into your embed code (and Google, if you press Preview). Get one free in Google Cloud: <Ext href={KEY_URL}>how to get a key</Ext>. Restrict it to your
              website and the Maps Embed API.
            </span>
          </label>
          <Tabs value={mode} onChange={(m) => { setMode(m); setPreview(false); }} options={[["place", "Place"], ["search", "Search"], ["directions", "Directions"], ["view", "View"], ["streetview", "Street View"]]} />
        </>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {(kind === "nokey" || mode === "place" || mode === "search") && (
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block font-medium">{mode === "search" && kind === "api" ? "Search for (e.g. 'coffee near Times Square')" : "Place, address or business name"}</span>
            <input className={fieldClass} value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        )}
        {kind === "api" && mode === "directions" && (
          <>
            <label className="block">
              <span className="mb-1.5 block font-medium">From</span>
              <input className={fieldClass} value={origin} onChange={(e) => setOrigin(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-medium">To</span>
              <input className={fieldClass} value={dest} onChange={(e) => setDest(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-medium">Travel mode</span>
              <select className={fieldClass} value={travel} onChange={(e) => setTravel(e.target.value)}>
                {["driving", "walking", "bicycling", "transit", "flying"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
          </>
        )}
        {kind === "api" && (mode === "view" || mode === "streetview") && (
          <label className="block">
            <span className="mb-1.5 block font-medium">{mode === "view" ? "Centre" : "Location"} (latitude,longitude)</span>
            <input className={fieldClass} value={center} onChange={(e) => setCenter(e.target.value)} />
          </label>
        )}
        {kind === "api" && mode === "streetview" ? (
          <>
            <label className="block">
              <span className="mb-1.5 block font-medium">Heading (0–360°)</span>
              <input type="number" min={0} max={360} className={fieldClass} value={heading} onChange={(e) => setHeading(Number(e.target.value))} />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-medium">Pitch (−90 to 90°)</span>
              <input type="number" min={-90} max={90} className={fieldClass} value={pitch} onChange={(e) => setPitch(Number(e.target.value))} />
            </label>
          </>
        ) : (
          <>
            {!(kind === "api" && mode === "directions") && (
              <label className="block">
                <span className="mb-1.5 block font-medium">Zoom: {zoom}</span>
                <input type="range" min={1} max={21} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block font-medium">Map type</span>
              <select className={fieldClass} value={maptype} onChange={(e) => setMaptype(e.target.value as "roadmap" | "satellite")}>
                <option value="roadmap">Map</option>
                <option value="satellite">Satellite</option>
              </select>
            </label>
          </>
        )}
        <label className="block">
          <span className="mb-1.5 block font-medium">Width × height (px)</span>
          <span className="flex gap-2">
            <input className={fieldClass} value={w} onChange={(e) => setW(e.target.value)} inputMode="numeric" aria-label="Width" />
            <input className={fieldClass} value={h} onChange={(e) => setH(e.target.value)} inputMode="numeric" aria-label="Height" />
          </span>
        </label>
        <label className="block">
          <span className="mb-1.5 block font-medium">Title (read by screen readers)</span>
          <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={responsive} onChange={(e) => setResponsive(e.target.checked)} /> Responsive (shrinks on phones, keeps the shape)
        </label>
      </div>
      {problem && <p className="mt-3 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3 text-sm">{problem}</p>}
      {kind === "nokey" && (
        <p className="mt-3 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3 text-sm">
          This uses the old <code>output=embed</code> map link. It works today without a key, but Google does not document it, so it can change or stop at any time. For a site you care about, use
          the Maps Embed API tab — it is free and documented.
        </p>
      )}
      <div className="mt-4 rounded-lg border border-[var(--color-line)]">
        <table className="w-full text-sm">
          <tbody>
            <CopyRow label="Embed code" value={code} />
            <CopyRow label="Map URL only" value={src} />
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <Btn onClick={() => setPreview(true)} disabled={!!problem}>
          Preview the map
        </Btn>
        <span className="ml-2 text-xs text-[var(--color-muted)]">The preview loads the map from Google.</span>
      </div>
      {preview && (
        <div className="mt-3 overflow-hidden rounded-lg border border-[var(--color-line)]" dangerouslySetInnerHTML={{ __html: code }} />
      )}
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        URL parameters follow Google&apos;s <Ext href={DOCS_URL}>Maps Embed API documentation</Ext>; Google states the Embed API is offered at no charge (<Ext href={USAGE_URL}>usage and billing</Ext>).
        This page only writes the code — it is not affiliated with Google.
      </p>
    </div>
  );
}
