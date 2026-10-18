/**
 * Read a coordinate written in any of the common formats and say which format it was:
 * decimal degrees, DMS / DMM (via parseLatLon), UTM, MGRS, Open Location Code (Plus Code)
 * or geohash. The conversions themselves live in coords.ts.
 */
import { fromMgrs, fromUtm, geohashDecode, olcDecode, parseLatLon, toMgrs, toUtm, geohashEncode, olcEncode, fmtDms, fmtDmm } from "./coords";
import type { LatLon } from "./geodesy";

export type CoordFormat = "Decimal degrees" | "Degrees, minutes, seconds" | "Degrees, decimal minutes" | "UTM" | "MGRS" | "Plus Code" | "Geohash";

export interface Detected extends LatLon {
  format: CoordFormat;
  /** Half-size of the cell the code stands for, in metres (grid formats only). */
  precisionM?: number;
}

const BANDS = "CDEFGHJKLMNPQRSTUVWX";

/**
 * UTM written as "33T 500000 4649776", "33 T 500000mE 4649776mN", "18N 585628 4511322"
 * or "33 N 500000 4649776". The letter is read as an MGRS latitude band (C–X), which is
 * the common convention; N or S on their own are also bands (N = 0°–8° N, S = 32°–40° N),
 * both in the northern hemisphere, so either reading gives the same answer for N.
 * For S the band reading is used — the UTM tool offers an explicit hemisphere choice.
 */
export function parseUtmText(text: string): (LatLon & { zone: number; band: string }) | null {
  const m = text
    .trim()
    .toUpperCase()
    .match(/^(\d{1,2})\s*([C-HJ-NP-X])\s*[,;]?\s*(\d{1,7}(?:\.\d+)?)\s*(?:M?E)?\s*[,;]?\s*(\d{1,8}(?:\.\d+)?)\s*(?:M?N)?$/);
  if (!m) return null;
  const zone = Number(m[1]);
  if (zone < 1 || zone > 60) return null;
  const band = m[2];
  const hemi = BANDS.indexOf(band) >= BANDS.indexOf("N") ? "N" : "S";
  const p = fromUtm(zone, hemi, Number(m[3]), Number(m[4]));
  return { ...p, zone, band };
}

export function detectCoordinate(text: string): Detected | null {
  const t = text.trim();
  if (!t) return null;
  const u = t.toUpperCase().replace(/\s+/g, "");
  // MGRS: zone, band, two square letters, an even number of digits.
  if (/^\d{1,2}[C-HJ-NP-X][A-HJ-NP-Z]{2}(\d{2}){0,5}$/.test(u)) {
    try {
      const r = fromMgrs(t);
      return { lat: r.lat, lon: r.lon, format: "MGRS", precisionM: r.precisionM / 2 };
    } catch {
      /* fall through */
    }
  }
  const utm = parseUtmText(t);
  if (utm) return { lat: utm.lat, lon: utm.lon, format: "UTM" };
  if (t.includes("+")) {
    try {
      const r = olcDecode(t);
      return { lat: r.lat, lon: r.lon, format: "Plus Code", precisionM: (r.size[0] * 111_320) / 2 };
    } catch {
      /* fall through */
    }
  }
  if (/^[0-9b-hjkmnp-z]{4,12}$/.test(t) && /[a-z]/.test(t)) {
    try {
      const r = geohashDecode(t);
      return { lat: r.lat, lon: r.lon, format: "Geohash", precisionM: r.latErr * 111_320 };
    } catch {
      /* fall through */
    }
  }
  const p = parseLatLon(t);
  if (!p) return null;
  const nums = t.replace(/[NSEWnsew°'"′″,;]/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const format: CoordFormat = nums >= 6 ? "Degrees, minutes, seconds" : nums >= 4 ? "Degrees, decimal minutes" : "Decimal degrees";
  return { ...p, format };
}

export interface AllFormats {
  dd: string;
  dms: string;
  dmm: string;
  utm: string | null;
  mgrs: string | null;
  plus: string;
  geohash: string;
}

export function allFormats(p: LatLon): AllFormats {
  let utm: string | null = null, mgrs: string | null = null;
  if (p.lat > -80 && p.lat < 84) {
    const x = toUtm(p);
    utm = `${x.zone}${x.band} ${x.easting.toFixed(0)}mE ${x.northing.toFixed(0)}mN`;
    mgrs = toMgrs(p);
  }
  return {
    dd: `${p.lat.toFixed(6)}, ${p.lon.toFixed(6)}`,
    dms: `${fmtDms(p.lat, true, 2)}, ${fmtDms(p.lon, false, 2)}`,
    dmm: `${fmtDmm(p.lat, true, 4)}, ${fmtDmm(p.lon, false, 4)}`,
    utm,
    mgrs,
    plus: olcEncode(p, 11),
    geohash: geohashEncode(p, 10),
  };
}
