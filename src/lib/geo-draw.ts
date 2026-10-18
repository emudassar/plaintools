/**
 * Turn parsed GIS features into what TileMap draws: point markers and line/polygon shapes,
 * with long lines thinned so very large tracks stay responsive.
 */
import type { GeoCollection, GeoFeature, Geometry, Pos } from "./geo-formats";
import { inverse, type LatLon } from "./geodesy";
import { sphericalArea } from "./polygon-area";

export interface DrawPoint extends LatLon {
  feature: number;
}
export interface DrawShape {
  feature: number;
  points: LatLon[];
  more?: LatLon[][];
  fill: boolean;
}

const ll = (p: Pos): LatLon => ({ lat: p[1], lon: p[0] });

function thin(ring: Pos[], max: number): Pos[] {
  if (ring.length <= max) return ring;
  const step = Math.ceil(ring.length / max);
  const out = ring.filter((_, i) => i % step === 0);
  if (out[out.length - 1] !== ring[ring.length - 1]) out.push(ring[ring.length - 1]);
  return out;
}

export function drawables(fc: GeoCollection, maxPerLine = 4000): { points: DrawPoint[]; shapes: DrawShape[] } {
  const points: DrawPoint[] = [];
  const shapes: DrawShape[] = [];
  fc.features.forEach((f, i) => {
    const g = f.geometry;
    if (!g) return;
    const add = (geom: Geometry) => {
      switch (geom.type) {
        case "Point":
          points.push({ ...ll(geom.coordinates), feature: i });
          break;
        case "MultiPoint":
          geom.coordinates.forEach((c) => points.push({ ...ll(c), feature: i }));
          break;
        case "LineString":
          shapes.push({ feature: i, points: thin(geom.coordinates, maxPerLine).map(ll), fill: false });
          break;
        case "MultiLineString":
          geom.coordinates.forEach((l) => shapes.push({ feature: i, points: thin(l, maxPerLine).map(ll), fill: false }));
          break;
        case "Polygon":
          shapes.push({ feature: i, points: thin(geom.coordinates[0], maxPerLine).map(ll), more: geom.coordinates.slice(1).map((r) => thin(r, maxPerLine).map(ll)), fill: true });
          break;
        case "MultiPolygon":
          geom.coordinates.forEach((p) => shapes.push({ feature: i, points: thin(p[0], maxPerLine).map(ll), more: p.slice(1).map((r) => thin(r, maxPerLine).map(ll)), fill: true }));
          break;
      }
    };
    add(g);
  });
  return { points, shapes };
}

/** Length (lines) or area (polygons) of a feature, for the feature list. */
export function measure(f: GeoFeature): { lengthM?: number; areaM2?: number } {
  const g = f.geometry;
  if (!g) return {};
  const len = (l: Pos[]) => l.slice(1).reduce((s, p, i) => s + inverse(ll(l[i]), ll(p)).metres, 0);
  const area = (poly: Pos[][]) => sphericalArea(poly[0].map(ll)) - poly.slice(1).reduce((s, r) => s + sphericalArea(r.map(ll)), 0);
  if (g.type === "LineString") return { lengthM: len(g.coordinates) };
  if (g.type === "MultiLineString") return { lengthM: g.coordinates.reduce((s, l) => s + len(l), 0) };
  if (g.type === "Polygon") return { areaM2: area(g.coordinates) };
  if (g.type === "MultiPolygon") return { areaM2: g.coordinates.reduce((s, p) => s + area(p), 0) };
  return {};
}

export function featureName(f: GeoFeature, i: number): string {
  const p = f.properties;
  const v = p.name ?? p.Name ?? p.NAME ?? p.title ?? p.label ?? p.id;
  return v !== undefined && v !== null && String(v).trim() ? String(v) : `Feature ${i + 1}`;
}
