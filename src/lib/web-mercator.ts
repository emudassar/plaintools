/**
 * Web Mercator pixel maths for OpenStreetMap raster tiles.
 * Formulas: OpenStreetMap wiki, "Slippy map tilenames".
 * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
 *
 * Tiles are 256 px. World pixel size at zoom z is 256 * 2^z.
 */

export const TILE = 256;
export const MAX_LAT = 85.0511287798;
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 18;
export const OSM_TILE_URL = "https://tile.openstreetmap.org";
export const OSM_COPYRIGHT_URL = "https://www.openstreetmap.org/copyright";
export const OSM_FIX_URL = "https://www.openstreetmap.org/fixthemap";
export const SLIPPY_URL = "https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames";

const clampLat = (lat: number) => Math.max(-MAX_LAT, Math.min(MAX_LAT, lat));

/** World pixel coordinates at zoom z. x may run past the world width (unwrapped). */
export function project(lat: number, lon: number, z: number): { x: number; y: number } {
  const n = TILE * 2 ** z;
  const φ = (clampLat(lat) * Math.PI) / 180;
  return {
    x: ((lon + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(φ) + 1 / Math.cos(φ)) / Math.PI) / 2) * n,
  };
}

export function unproject(x: number, y: number, z: number): { lat: number; lon: number } {
  const n = TILE * 2 ** z;
  const lon = (x / n) * 360 - 180;
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
  return { lat, lon: ((((lon + 180) % 360) + 360) % 360) - 180 };
}

/**
 * Unwraps a list of longitudes so consecutive points never jump by more than
 * 180 degrees. Lets a path or ring that crosses the antimeridian draw as one line.
 */
export function unwrapLons(lons: number[], ref: number): number[] {
  const out: number[] = [];
  let prev = ref;
  for (const lon of lons) {
    let l = lon;
    while (l - prev > 180) l -= 360;
    while (l - prev < -180) l += 360;
    out.push(l);
    prev = l;
  }
  return out;
}

/**
 * Highest zoom at which a lat/lon box (west/east may be unwrapped) fits the
 * viewport with padding. Returns the zoom and the box centre.
 */
export function fitBounds(
  box: { south: number; north: number; west: number; east: number },
  width: number,
  height: number,
  pad = 32,
  maxZoom = 15,
): { zoom: number; lat: number; lon: number } {
  let zoom = MIN_ZOOM;
  for (let z = maxZoom; z >= MIN_ZOOM; z--) {
    const a = project(box.north, box.west, z);
    const b = project(box.south, box.east, z);
    if (Math.abs(b.x - a.x) <= width - 2 * pad && Math.abs(b.y - a.y) <= height - 2 * pad) {
      zoom = z;
      break;
    }
  }
  const a = project(box.north, box.west, zoom);
  const b = project(box.south, box.east, zoom);
  const c = unproject((a.x + b.x) / 2, (a.y + b.y) / 2, zoom);
  return { zoom, lat: c.lat, lon: c.lon };
}
