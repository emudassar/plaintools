/**
 * "What is at this point?" for tools that land somewhere unplanned (antipodes, tunnels):
 * ground elevation from Copernicus GLO-90 (0 m reads as open water) and the nearest
 * OpenStreetMap place name with its distance. Also the shared world outline loader.
 */
import { copernicusBatch } from "./elevation";
import { reverseGeocodeDetail } from "./geocode";
import { inverse, type LatLon } from "./geodesy";
import { ToolError } from "./errors";

export interface PointInfo {
  elevationM: number | null;
  water: boolean | null;
  place: string | null;
  country: string | null;
  /** Distance from the point to the OSM feature that was named, metres. */
  placeM: number | null;
}

export async function pointInfo(p: LatLon): Promise<PointInfo> {
  const [elev, detail] = await Promise.allSettled([copernicusBatch([p]), reverseGeocodeDetail(p.lat, p.lon)]);
  const e = elev.status === "fulfilled" ? elev.value[0] : null;
  const d = detail.status === "fulfilled" ? detail.value : null;
  const placeM = d && d.featureLat !== null && d.featureLon !== null ? inverse(p, { lat: d.featureLat, lon: d.featureLon }).metres : null;
  return { elevationM: e, water: e === null ? null : e === 0, place: d?.label ?? null, country: d?.country ?? null, placeM };
}

export interface WorldCountry {
  id: string;
  name: string;
  /** Outer rings and holes, each ring as lat/lon points. */
  polygons: LatLon[][][];
}

let world: Promise<WorldCountry[]> | null = null;

/** Natural Earth 1:110m countries (public domain), lon/lat rounded to 0.01°. */
export function loadWorld(): Promise<WorldCountry[]> {
  if (!world) {
    world = fetch("/data/geo/world-lonlat.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: { countries: { id: string; name: string; geometry: { type: string; coordinates: number[][][] | number[][][][] } }[] }) =>
        j.countries.map((c) => {
          const polys = (c.geometry.type === "Polygon" ? [c.geometry.coordinates] : c.geometry.coordinates) as number[][][][];
          return { id: c.id, name: c.name, polygons: polys.map((poly) => poly.map((ring) => ring.map(([lon, lat]) => ({ lat, lon })))) };
        }),
      )
      .catch((e) => {
        world = null;
        throw new ToolError("unavailable", "The world outline did not load. Check your connection and try again.", e instanceof Error ? e.message : String(e));
      });
  }
  return world;
}

export const NATURAL_EARTH_URL = "https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/";
