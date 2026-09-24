import { ToolError } from "./errors";
import { hedged, type HedgeOptions } from "./hedge";

/**
 * Address <-> coordinates via Photon (Komoot), an open geocoder built on
 * OpenStreetMap data. https://photon.komoot.io
 *
 * VERIFIED 2026-09-20: keyless, and returns `Access-Control-Allow-Origin: *`
 * on every sampled request, so it works directly from the browser.
 *
 * WHY NOT NOMINATIM: Nominatim also serves OSM geocoding, but its CORS header
 * is served through a Varnish cache whose `Vary` header does not include
 * `Origin`. A cached copy can therefore be returned WITHOUT the
 * `Access-Control-Allow-Origin` header, which fails in the browser at random.
 * Observed directly on 2026-09-20. Photon was consistent across every sample,
 * does forward and reverse, and keeps the site down to one geocoding provider.
 */

const PHOTON_SEARCH = "https://photon.komoot.io/api/";
const PHOTON_REVERSE = "https://photon.komoot.io/reverse";

export interface GeocodeResult {
  lat: number;
  lon: number;
  /** Human-readable label for the matched place. */
  label: string;
  countryCode: string | null;
}

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: Record<string, string | undefined>;
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

/** Builds "123 Main St, Des Moines, Iowa" from Photon's loose property bag. */
function labelFor(p: Record<string, string | undefined>): string {
  const street = [p.housenumber, p.street].filter(Boolean).join(" ");
  const parts = [
    p.name && p.name !== street ? p.name : null,
    street || null,
    p.city || p.district || p.county || null,
    p.state || null,
    p.postcode || null,
  ].filter((v): v is string => Boolean(v));
  // De-duplicate repeated fragments (Photon often repeats name and street).
  return [...new Set(parts)].join(", ");
}

function toResult(f: PhotonFeature): GeocodeResult | null {
  const coords = f.geometry?.coordinates;
  if (!coords || coords.length < 2) return null;
  const [lon, lat] = coords;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const props = f.properties ?? {};
  return {
    lat,
    lon,
    label: labelFor(props) || `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    countryCode: props.countrycode ?? null,
  };
}

async function photon<T>(url: string, options: HedgeOptions): Promise<T> {
  return hedged<T>(async (signal) => {
    const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Photon HTTP ${res.status}`);
    return (await res.json()) as T;
  }, options);
}

/** Address text -> coordinates. Throws a typed error when nothing matches. */
export async function geocodeAddress(
  query: string,
  options: HedgeOptions = {},
): Promise<GeocodeResult> {
  const q = query.trim();
  if (q.length < 3) {
    throw new ToolError("bad-input", "Enter a street address, city or postcode.");
  }

  let data: PhotonResponse;
  try {
    data = await photon<PhotonResponse>(
      `${PHOTON_SEARCH}?q=${encodeURIComponent(q)}&limit=5`,
      options,
    );
  } catch (e) {
    throw new ToolError(
      "unavailable",
      "The address lookup service did not respond. Please try again in a moment.",
      e instanceof Error ? e.message : String(e),
    );
  }

  const results = (data.features ?? [])
    .map(toResult)
    .filter((r): r is GeocodeResult => r !== null);

  // This tool only covers the United States, so prefer a US match when the
  // query is ambiguous rather than silently geocoding to another country.
  const best = results.find((r) => r.countryCode === "US") ?? results[0];

  if (!best) {
    throw new ToolError(
      "no-data",
      `No place matched "${q}". Try adding the city and state, or a postcode.`,
    );
  }
  return best;
}

/** Coordinates -> place name. Returns null rather than throwing: this is a nicety, not the answer. */
export async function reverseGeocode(
  lat: number,
  lon: number,
  options: HedgeOptions = {},
): Promise<string | null> {
  try {
    const data = await photon<PhotonResponse>(
      `${PHOTON_REVERSE}?lat=${lat}&lon=${lon}`,
      options,
    );
    const first = (data.features ?? [])[0];
    if (!first) return null;
    return labelFor(first.properties ?? {}) || null;
  } catch {
    return null;
  }
}

/** Accepts "41.75, -93.75" so a user can paste coordinates instead of an address. */
export function parseCoordinates(input: string): { lat: number; lon: number } | null {
  const m = input.trim().match(/^(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lon = parseFloat(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}
