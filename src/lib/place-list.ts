/**
 * Resolve a list of places typed one per line: coordinates are read directly, anything else
 * goes to the Photon geocoder one line at a time with a short pause, so a long list never
 * bursts requests at the service.
 */
import { geocodeAddress } from "./geocode";
import { parseLatLon } from "./coords";
import { asToolError } from "./errors";
import type { LatLon } from "./geodesy";

export interface ListedPlace extends LatLon {
  input: string;
  label: string;
}

export interface ListError {
  input: string;
  error: string;
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function splitLines(text: string, max: number): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, max);
}

export async function resolvePlaces(lines: string[], preferUS: boolean, onProgress?: (done: number) => void): Promise<{ places: ListedPlace[]; errors: ListError[] }> {
  const places: ListedPlace[] = [];
  const errors: ListError[] = [];
  for (let i = 0; i < lines.length; i++) {
    const input = lines[i];
    const c = parseLatLon(input);
    if (c) places.push({ ...c, input, label: `${c.lat.toFixed(4)}, ${c.lon.toFixed(4)}` });
    else {
      try {
        const g = await geocodeAddress(input, { preferUS, delays: [0, 6000] });
        places.push({ lat: g.lat, lon: g.lon, input, label: g.label });
      } catch (e) {
        errors.push({ input, error: asToolError(e).message });
      }
      if (i < lines.length - 1) await pause(300);
    }
    onProgress?.(i + 1);
  }
  return { places, errors };
}
