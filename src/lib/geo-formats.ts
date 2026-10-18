/**
 * Reading and writing GeoJSON, KML, GPX and CSV in the browser.
 *
 * Specs followed: GeoJSON RFC 7946 (coordinates are [longitude, latitude, elevation?], WGS84);
 * OGC KML 2.2 (Placemark with Point / LineString / Polygon / MultiGeometry, coordinates as
 * "lon,lat[,alt]" tuples); GPX 1.1 (wpt, rte/rtept, trk/trkseg/trkpt with ele and time);
 * CSV per RFC 4180 (quoted fields, doubled quotes). XML is parsed with the browser's DOMParser,
 * so nothing is uploaded.
 */
import { inverse, type LatLon } from "./geodesy";

export const RFC7946_URL = "https://www.rfc-editor.org/rfc/rfc7946";
export const KML_SPEC_URL = "https://www.ogc.org/standards/kml/";
export const GPX_SPEC_URL = "https://www.topografix.com/GPX/1/1/";
export const RFC4180_URL = "https://www.rfc-editor.org/rfc/rfc4180";

export type Pos = [number, number] | [number, number, number];
export type Geometry =
  | { type: "Point"; coordinates: Pos }
  | { type: "MultiPoint"; coordinates: Pos[] }
  | { type: "LineString"; coordinates: Pos[] }
  | { type: "MultiLineString"; coordinates: Pos[][] }
  | { type: "Polygon"; coordinates: Pos[][] }
  | { type: "MultiPolygon"; coordinates: Pos[][][] };

export interface GeoFeature {
  type: "Feature";
  geometry: Geometry | null;
  properties: Record<string, string | number | boolean | null>;
  /** GPX/KML track point times (ISO strings), parallel to the line's coordinates when present. */
  times?: (string | null)[];
}
export interface GeoCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
  /** Geometries that were present but invalid (bad coordinates) and were dropped. */
  skipped?: number;
}

export class FormatError extends Error {}

/* ---------------- detection ---------------- */

export type Format = "geojson" | "kml" | "gpx" | "csv";

export function detectFormat(name: string, text: string): Format | null {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (["geojson", "json"].includes(ext)) return "geojson";
  if (ext === "kml") return "kml";
  if (ext === "gpx") return "gpx";
  if (["csv", "tsv", "txt"].includes(ext)) return "csv";
  const t = text.trimStart().slice(0, 400);
  if (t.startsWith("{")) return "geojson";
  if (/<gpx[\s>]/i.test(t)) return "gpx";
  if (/<kml[\s>]/i.test(t)) return "kml";
  return null;
}

export function parseAny(name: string, text: string): GeoCollection {
  const f = detectFormat(name, text);
  if (f === "geojson") return parseGeoJson(text);
  if (f === "kml") return parseKml(text);
  if (f === "gpx") return parseGpx(text);
  if (name.toLowerCase().endsWith(".kmz")) throw new FormatError("KMZ is a zipped KML. Unzip it (rename to .zip) and open the doc.kml inside.");
  throw new FormatError("Unrecognised file. Use a .geojson, .kml or .gpx file.");
}

/* ---------------- GeoJSON ---------------- */

const isNum = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);
function validPos(p: unknown): p is Pos {
  return Array.isArray(p) && p.length >= 2 && isNum(p[0]) && isNum(p[1]) && Math.abs(p[1]) <= 90 && Math.abs(p[0]) <= 540;
}

function cleanGeometry(g: unknown): Geometry | null {
  if (!g || typeof g !== "object") return null;
  const geom = g as { type?: string; coordinates?: unknown; geometries?: unknown[] };
  const c = geom.coordinates;
  switch (geom.type) {
    case "Point":
      return validPos(c) ? { type: "Point", coordinates: c } : null;
    case "MultiPoint":
    case "LineString":
      return Array.isArray(c) && c.every(validPos) ? ({ type: geom.type, coordinates: c } as Geometry) : null;
    case "MultiLineString":
    case "Polygon":
      return Array.isArray(c) && c.every((r) => Array.isArray(r) && r.every(validPos)) ? ({ type: geom.type, coordinates: c } as Geometry) : null;
    case "MultiPolygon":
      return Array.isArray(c) && c.every((p) => Array.isArray(p) && p.every((r) => Array.isArray(r) && r.every(validPos))) ? { type: "MultiPolygon", coordinates: c as Pos[][][] } : null;
    default:
      return null;
  }
}

export function parseGeoJson(text: string): GeoCollection {
  let j: unknown;
  try {
    j = JSON.parse(text);
  } catch {
    throw new FormatError("This is not valid JSON.");
  }
  const out: GeoFeature[] = [];
  let skipped = 0;
  const add = (geometry: unknown, properties: unknown) => {
    const gg = geometry as { type?: string; geometries?: unknown[] } | null;
    if (gg?.type === "GeometryCollection") {
      for (const sub of gg.geometries ?? []) add(sub, properties);
      return;
    }
    const g = cleanGeometry(geometry);
    if (geometry && !g) skipped++;
    out.push({ type: "Feature", geometry: g, properties: flatProps(properties) });
  };
  const root = j as { type?: string; features?: unknown[]; geometry?: unknown; properties?: unknown };
  if (root?.type === "FeatureCollection" && Array.isArray(root.features)) {
    for (const f of root.features as { geometry?: unknown; properties?: unknown }[]) add(f?.geometry ?? null, f?.properties);
  } else if (root?.type === "Feature") add(root.geometry ?? null, root.properties);
  else if (root?.type) add(root, {});
  else throw new FormatError("No GeoJSON FeatureCollection, Feature or geometry found.");
  if (!out.length) throw new FormatError("The file holds no features.");
  return { type: "FeatureCollection", features: out, skipped } as GeoCollection;
}

function flatProps(p: unknown): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {};
  if (!p || typeof p !== "object") return out;
  for (const [k, v] of Object.entries(p as Record<string, unknown>)) {
    out[k] = v === null || ["string", "number", "boolean"].includes(typeof v) ? (v as string | number | boolean | null) : JSON.stringify(v);
  }
  return out;
}

/* ---------------- XML helpers ---------------- */

function xml(text: string): Document {
  if (typeof DOMParser === "undefined") throw new FormatError("XML parsing needs a browser.");
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) throw new FormatError("The file is not well-formed XML.");
  return doc;
}
const kids = (el: Element | Document, name: string) => Array.from(el.getElementsByTagName(name));
const child = (el: Element, name: string) => Array.from(el.children).find((c) => c.localName === name) ?? null;
const text = (el: Element | null) => el?.textContent?.trim() ?? "";

/* ---------------- KML ---------------- */

function kmlCoords(s: string): Pos[] {
  return s
    .trim()
    .split(/\s+/)
    .map((t) => t.split(",").map(Number))
    .filter((c) => c.length >= 2 && c.every(Number.isFinite))
    .map((c) => (c.length >= 3 && c[2] !== 0 ? [c[0], c[1], c[2]] : [c[0], c[1]]) as Pos);
}

function kmlGeoms(el: Element): Geometry[] {
  const out: Geometry[] = [];
  for (const c of Array.from(el.children)) {
    const n = c.localName;
    if (n === "Point") {
      const p = kmlCoords(text(child(c, "coordinates")))[0];
      if (p) out.push({ type: "Point", coordinates: p });
    } else if (n === "LineString" || n === "LinearRing") {
      const p = kmlCoords(text(child(c, "coordinates")));
      if (p.length >= 2) out.push({ type: "LineString", coordinates: p });
    } else if (n === "Polygon") {
      const outer = child(c, "outerBoundaryIs");
      const ring = outer ? kmlCoords(text(kids(outer, "coordinates")[0] ?? null)) : [];
      if (ring.length >= 4) {
        const holes = Array.from(c.children)
          .filter((x) => x.localName === "innerBoundaryIs")
          .map((ib) => kmlCoords(text(kids(ib, "coordinates")[0] ?? null)))
          .filter((r) => r.length >= 4);
        out.push({ type: "Polygon", coordinates: [ring, ...holes] });
      }
    } else if (n === "MultiGeometry") out.push(...kmlGeoms(c));
    else if (n === "Track") {
      const coords = Array.from(c.children)
        .filter((x) => x.localName === "coord")
        .map((x) => x.textContent!.trim().split(/\s+/).map(Number))
        .filter((v) => v.length >= 2 && v.every(Number.isFinite))
        .map((v) => (v.length >= 3 ? [v[0], v[1], v[2]] : [v[0], v[1]]) as Pos);
      if (coords.length >= 2) out.push({ type: "LineString", coordinates: coords });
    }
  }
  return out;
}

function merge(geoms: Geometry[]): Geometry | null {
  if (!geoms.length) return null;
  if (geoms.length === 1) return geoms[0];
  const types = new Set(geoms.map((g) => g.type));
  if (types.size === 1) {
    const t = geoms[0].type;
    if (t === "Point") return { type: "MultiPoint", coordinates: geoms.map((g) => g.coordinates as Pos) };
    if (t === "LineString") return { type: "MultiLineString", coordinates: geoms.map((g) => g.coordinates as Pos[]) };
    if (t === "Polygon") return { type: "MultiPolygon", coordinates: geoms.map((g) => g.coordinates as Pos[][]) };
  }
  return geoms[0];
}

export function parseKml(textIn: string): GeoCollection {
  const doc = xml(textIn);
  const features: GeoFeature[] = [];
  for (const pm of kids(doc, "Placemark")) {
    const props: Record<string, string> = {};
    const name = text(child(pm, "name"));
    if (name) props.name = name;
    const desc = text(child(pm, "description"));
    if (desc) props.description = desc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    for (const d of kids(pm, "Data")) props[d.getAttribute("name") ?? "field"] = text(child(d, "value"));
    for (const d of kids(pm, "SimpleData")) props[d.getAttribute("name") ?? "field"] = text(d);
    const geoms = kmlGeoms(pm);
    features.push({ type: "Feature", geometry: merge(geoms), properties: props });
  }
  if (!features.length) throw new FormatError("No Placemarks found in this KML.");
  return { type: "FeatureCollection", features };
}

/* ---------------- GPX ---------------- */

function gpxPt(el: Element): { pos: Pos; time: string | null } | null {
  const lat = Number(el.getAttribute("lat"));
  const lon = Number(el.getAttribute("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const ele = child(el, "ele");
  const e = ele ? Number(text(ele)) : NaN;
  return { pos: Number.isFinite(e) ? [lon, lat, e] : [lon, lat], time: text(child(el, "time")) || null };
}

export function parseGpx(textIn: string): GeoCollection {
  const doc = xml(textIn);
  const features: GeoFeature[] = [];
  for (const w of kids(doc, "wpt")) {
    const p = gpxPt(w);
    if (!p) continue;
    const props: Record<string, string> = { kind: "waypoint" };
    for (const k of ["name", "desc", "cmt", "sym", "type"]) {
      const v = text(child(w, k));
      if (v) props[k] = v;
    }
    features.push({ type: "Feature", geometry: { type: "Point", coordinates: p.pos }, properties: props, times: [p.time] });
  }
  for (const r of kids(doc, "rte")) {
    const pts = kids(r, "rtept").map(gpxPt).filter((x): x is NonNullable<typeof x> => !!x);
    if (pts.length < 2) continue;
    features.push({ type: "Feature", geometry: { type: "LineString", coordinates: pts.map((x) => x.pos) }, properties: { kind: "route", name: text(child(r, "name")) }, times: pts.map((x) => x.time) });
  }
  for (const t of kids(doc, "trk")) {
    const segs = kids(t, "trkseg").map((s) => kids(s, "trkpt").map(gpxPt).filter((x): x is NonNullable<typeof x> => !!x)).filter((s) => s.length >= 2);
    if (!segs.length) continue;
    const geometry: Geometry = segs.length === 1 ? { type: "LineString", coordinates: segs[0].map((x) => x.pos) } : { type: "MultiLineString", coordinates: segs.map((s) => s.map((x) => x.pos)) };
    features.push({ type: "Feature", geometry, properties: { kind: "track", name: text(child(t, "name")), type: text(child(t, "type")) }, times: segs.flat().map((x) => x.time) });
  }
  if (!features.length) throw new FormatError("No waypoints, routes or tracks found in this GPX.");
  return { type: "FeatureCollection", features };
}

/* ---------------- export ---------------- */

const escXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const coordStr = (p: Pos) => (p.length > 2 ? `${p[0]},${p[1]},${p[2]}` : `${p[0]},${p[1]}`);

export function toGeoJson(fc: GeoCollection): string {
  return JSON.stringify({ type: "FeatureCollection", features: fc.features.map((f) => ({ type: "Feature", geometry: f.geometry, properties: f.properties })) }, null, 1);
}

function kmlGeom(g: Geometry): string {
  switch (g.type) {
    case "Point":
      return `<Point><coordinates>${coordStr(g.coordinates)}</coordinates></Point>`;
    case "LineString":
      return `<LineString><tessellate>1</tessellate><coordinates>${g.coordinates.map(coordStr).join(" ")}</coordinates></LineString>`;
    case "Polygon":
      return `<Polygon><outerBoundaryIs><LinearRing><coordinates>${g.coordinates[0].map(coordStr).join(" ")}</coordinates></LinearRing></outerBoundaryIs>${g.coordinates
        .slice(1)
        .map((r) => `<innerBoundaryIs><LinearRing><coordinates>${r.map(coordStr).join(" ")}</coordinates></LinearRing></innerBoundaryIs>`)
        .join("")}</Polygon>`;
    case "MultiPoint":
      return `<MultiGeometry>${g.coordinates.map((c) => kmlGeom({ type: "Point", coordinates: c })).join("")}</MultiGeometry>`;
    case "MultiLineString":
      return `<MultiGeometry>${g.coordinates.map((c) => kmlGeom({ type: "LineString", coordinates: c })).join("")}</MultiGeometry>`;
    case "MultiPolygon":
      return `<MultiGeometry>${g.coordinates.map((c) => kmlGeom({ type: "Polygon", coordinates: c })).join("")}</MultiGeometry>`;
  }
}

export function toKml(fc: GeoCollection, docName = "Export"): string {
  const pms = fc.features
    .filter((f) => f.geometry)
    .map((f) => {
      const { name, description, ...rest } = f.properties;
      const data = Object.entries(rest)
        .map(([k, v]) => `<Data name="${escXml(k)}"><value>${escXml(String(v ?? ""))}</value></Data>`)
        .join("");
      return `<Placemark>${name ? `<name>${escXml(String(name))}</name>` : ""}${description ? `<description>${escXml(String(description))}</description>` : ""}${data ? `<ExtendedData>${data}</ExtendedData>` : ""}${kmlGeom(f.geometry!)}</Placemark>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${escXml(docName)}</name>\n${pms}\n</Document></kml>\n`;
}

/** GPX has no polygons: polygon outlines become tracks, which the result note says. */
export function toGpx(fc: GeoCollection, creator = "Export"): string {
  const pt = (p: Pos, tag: string, extra = "") => `<${tag} lat="${p[1]}" lon="${p[0]}">${p.length > 2 ? `<ele>${p[2]}</ele>` : ""}${extra}</${tag}>`;
  const wpts: string[] = [];
  const trks: string[] = [];
  for (const f of fc.features) {
    const g = f.geometry;
    if (!g) continue;
    const name = f.properties.name ? `<name>${escXml(String(f.properties.name))}</name>` : "";
    if (g.type === "Point") wpts.push(pt(g.coordinates, "wpt", name));
    else if (g.type === "MultiPoint") g.coordinates.forEach((c) => wpts.push(pt(c, "wpt", name)));
    else {
      const lines: Pos[][] =
        g.type === "LineString" ? [g.coordinates] : g.type === "MultiLineString" ? g.coordinates : g.type === "Polygon" ? g.coordinates : g.coordinates.flat();
      trks.push(`<trk>${name}${lines.map((l) => `<trkseg>${l.map((p) => pt(p, "trkpt")).join("")}</trkseg>`).join("")}</trk>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="${escXml(creator)}" xmlns="http://www.topografix.com/GPX/1/1">\n${wpts.join("\n")}\n${trks.join("\n")}\n</gpx>\n`;
}

/* ---------------- CSV ---------------- */

/** RFC 4180 parser; the delimiter (comma, semicolon or tab) is detected from the first line. */
export function parseCsv(textIn: string): string[][] {
  const first = textIn.split(/\r?\n/, 1)[0] ?? "";
  const delim = [",", ";", "\t"].sort((a, b) => first.split(b).length - first.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < textIn.length; i++) {
    const c = textIn[i];
    if (q) {
      if (c === '"') {
        if (textIn[i + 1] === '"') {
          cell += '"';
          i++;
        } else q = false;
      } else cell += c;
    } else if (c === '"') q = true;
    else if (c === delim) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && textIn[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim() !== "")) rows.push(row);
  return rows;
}

const LAT_NAMES = ["lat", "latitude", "y", "lat_dd", "latitude_dd", "ylat", "point_y"];
const LON_NAMES = ["lon", "lng", "long", "longitude", "x", "lon_dd", "longitude_dd", "xlong", "point_x"];

/** Guesses the latitude and longitude columns from the header row. */
export function guessLatLonColumns(header: string[]): { lat: number; lon: number } | null {
  const h = header.map((x) => x.trim().toLowerCase().replace(/[^a-z_]/g, ""));
  const lat = h.findIndex((x) => LAT_NAMES.includes(x));
  const lon = h.findIndex((x) => LON_NAMES.includes(x));
  return lat >= 0 && lon >= 0 ? { lat, lon } : null;
}

export function toCsv(rows: (string | number | null)[][]): string {
  return rows
    .map((r) =>
      r
        .map((v) => {
          const s = v === null || v === undefined ? "" : String(v);
          return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    )
    .join("\r\n");
}

/* ---------------- stats ---------------- */

export interface LineStats {
  metres: number;
  points: number;
  gainM: number | null;
  lossM: number | null;
  maxEle: number | null;
  minEle: number | null;
  start: string | null;
  end: string | null;
  seconds: number | null;
}

export function lineStats(lines: Pos[][], times?: (string | null)[]): LineStats {
  let metres = 0, gain = 0, loss = 0, points = 0;
  let maxEle = -Infinity, minEle = Infinity, hasEle = false;
  for (const l of lines) {
    for (let i = 0; i < l.length; i++) {
      points++;
      const p = l[i];
      if (p.length > 2) {
        hasEle = true;
        maxEle = Math.max(maxEle, p[2]!);
        minEle = Math.min(minEle, p[2]!);
      }
      if (i > 0) {
        metres += inverse({ lat: l[i - 1][1], lon: l[i - 1][0] }, { lat: p[1], lon: p[0] }).metres;
        if (p.length > 2 && l[i - 1].length > 2) {
          const d = p[2]! - l[i - 1][2]!;
          if (d > 0) gain += d;
          else loss -= d;
        }
      }
    }
  }
  const ts = (times ?? []).filter((t): t is string => !!t && !Number.isNaN(Date.parse(t)));
  const start = ts[0] ?? null, end = ts[ts.length - 1] ?? null;
  return {
    metres,
    points,
    gainM: hasEle ? gain : null,
    lossM: hasEle ? loss : null,
    maxEle: hasEle ? maxEle : null,
    minEle: hasEle ? minEle : null,
    start,
    end,
    seconds: start && end ? (Date.parse(end) - Date.parse(start)) / 1000 : null,
  };
}

/** All positions of a geometry as lat/lon, for fitting a map. */
export function allPoints(g: Geometry | null): LatLon[] {
  if (!g) return [];
  const flat: Pos[] =
    g.type === "Point" ? [g.coordinates] : g.type === "MultiPoint" || g.type === "LineString" ? g.coordinates : g.type === "MultiLineString" || g.type === "Polygon" ? g.coordinates.flat() : g.coordinates.flat(2);
  return flat.map((p) => ({ lat: p[1], lon: p[0] }));
}

export function bboxOf(fc: GeoCollection): [number, number, number, number] | null {
  const pts = fc.features.flatMap((f) => allPoints(f.geometry));
  if (!pts.length) return null;
  return [Math.min(...pts.map((p) => p.lon)), Math.min(...pts.map((p) => p.lat)), Math.max(...pts.map((p) => p.lon)), Math.max(...pts.map((p) => p.lat))];
}
