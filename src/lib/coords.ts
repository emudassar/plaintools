/**
 * Coordinate formats and conversions.
 *
 *  - Decimal degrees, degrees-minutes-seconds and degrees-decimal-minutes: parse and format.
 *  - UTM <-> latitude/longitude on WGS84: Krüger's series to n^4 as given by Karney (2011),
 *    "Transverse Mercator with an accuracy of a few nanometers", J. Geodesy 85:475–485,
 *    eqs. 35–36 (forward) and 11–12 (reverse); scale k0 = 0.9996, false easting 500 km,
 *    false northing 10,000 km south. Zone exceptions for Norway and Svalbard per
 *    NGA.SIG.0012_2.0.0_UTMUPS (2014), section 2.
 *  - MGRS from UTM: NGA.SIG.0012 section 3 (100 km square letters, six-zone column sets,
 *    two-set row lettering, AA scheme for WGS84).
 *  - Geohash: Niemeyer's base-32 bit interleaving (geohash.org; public domain).
 *  - Open Location Code (Plus Codes): the open specification at github.com/google/open-location-code.
 */
import { normalizeLon, type LatLon } from "./geodesy";

export const KARNEY_URL = "https://arxiv.org/abs/1002.1417";
export const MGRS_DOC_URL = "https://geographiclib.sourceforge.io/C++/doc/classGeographicLib_1_1MGRS.html";
export const OLC_SPEC_URL = "https://github.com/google/open-location-code/blob/main/Documentation/Specification/specification.md";
export const GEOHASH_URL = "https://en.wikipedia.org/wiki/Geohash";

const RAD = Math.PI / 180;

/* ------------------------------------------------------------------ */
/* Parsing                                                             */
/* ------------------------------------------------------------------ */

/**
 * One angle from text: "40.7484", "-73.98", "40°44'54.4\"N", "40 44 54.4 N", "N40 44.906", "73d59m8s W".
 * Returns null when it cannot be read.
 */
export function parseAngle(text: string, isLat: boolean): number | null {
  let t = text.trim().toUpperCase().replace(/,/g, ".").replace(/[º˚]/g, "°").replace(/[′’']/g, "'").replace(/[″”"]|''/g, '"');
  let sign = 1;
  const hemi = t.match(/[NSEW]/);
  if (hemi) {
    const h = hemi[0];
    if ((isLat && (h === "E" || h === "W")) || (!isLat && (h === "N" || h === "S"))) return null;
    if (h === "S" || h === "W") sign = -1;
    t = t.replace(/[NSEW]/g, " ");
  }
  t = t.replace(/[°D'M"S:]/g, " ").trim();
  if (t.startsWith("-")) {
    sign *= -1;
    t = t.slice(1);
  } else if (t.startsWith("+")) t = t.slice(1);
  const parts = t.split(/\s+/).filter(Boolean).map(Number);
  if (!parts.length || parts.length > 3 || parts.some((x) => !Number.isFinite(x) || x < 0)) return null;
  const [d, m = 0, s = 0] = parts;
  if (m >= 60 || s >= 60 || (parts.length > 1 && !Number.isInteger(d)) || (parts.length > 2 && !Number.isInteger(m))) return null;
  const v = sign * (d + m / 60 + s / 3600);
  const max = isLat ? 90 : 180;
  return Math.abs(v) <= max ? v : null;
}

/**
 * A coordinate pair from one line of text. Accepts "lat, lon", "lat lon", DMS/DMM with
 * hemisphere letters in either order ("73°59'W 40°44'N"), and "lat;lon".
 */
export function parseLatLon(line: string): LatLon | null {
  const t = line.trim();
  if (!t) return null;
  // Split on comma/semicolon/tab, or on whitespace before a hemisphere-tagged second half.
  let halves = t.split(/\s*[;,\t]\s*/).filter(Boolean);
  if (halves.length !== 2) {
    const m = t.match(/^(.*?[NSns])\s+(.*[EWew])$/) ?? t.match(/^(.*?[EWew])\s+(.*[NSns])$/) ?? t.match(/^([NSns].*?)\s+([EWew].*)$/) ?? t.match(/^([EWew].*?)\s+([NSns].*)$/);
    if (m) halves = [m[1], m[2]];
    else {
      const nums = t.split(/\s+/);
      if (nums.length === 2) halves = nums;
      else return null;
    }
  }
  let [a, b] = halves;
  // If the first half carries E/W (or the second N/S), swap so latitude comes first.
  if (/[EWew]/.test(a.replace(/[^NSEWnsew]/g, "")) || /[NSns]/.test(b.replace(/[^NSEWnsew]/g, ""))) [a, b] = [b, a];
  const lat = parseAngle(a, true);
  const lon = parseAngle(b, false);
  if (lat === null || lon === null) return null;
  return { lat, lon };
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export function fmtDms(deg: number, isLat: boolean, secDigits = 2): string {
  const hemi = isLat ? (deg >= 0 ? "N" : "S") : deg >= 0 ? "E" : "W";
  const total = Math.round(Math.abs(deg) * 3600 * 10 ** secDigits) / 10 ** secDigits;
  const d = Math.floor(total / 3600);
  const m = Math.floor((total - d * 3600) / 60);
  const s = total - d * 3600 - m * 60;
  return `${d}° ${m}′ ${s.toFixed(secDigits)}″ ${hemi}`;
}

export function fmtDmm(deg: number, isLat: boolean, minDigits = 4): string {
  const hemi = isLat ? (deg >= 0 ? "N" : "S") : deg >= 0 ? "E" : "W";
  const total = Math.round(Math.abs(deg) * 60 * 10 ** minDigits) / 10 ** minDigits;
  const d = Math.floor(total / 60);
  const m = total - d * 60;
  return `${d}° ${m.toFixed(minDigits)}′ ${hemi}`;
}

export const fmtDd = (p: LatLon, digits = 6) => `${p.lat.toFixed(digits)}, ${p.lon.toFixed(digits)}`;

/* ------------------------------------------------------------------ */
/* UTM (Karney 2011, Krüger series)                                    */
/* ------------------------------------------------------------------ */

const A = 6378137;
const F = 1 / 298.257223563;
const K0 = 0.9996;
const N = F / (2 - F);
const N2 = N * N, N3 = N2 * N, N4 = N3 * N;
/** Rectifying radius A = a/(1+n) (1 + n²/4 + n⁴/64). */
const AR = (A / (1 + N)) * (1 + N2 / 4 + N4 / 64);
const ALPHA = [
  N / 2 - (2 / 3) * N2 + (5 / 16) * N3 + (41 / 180) * N4,
  (13 / 48) * N2 - (3 / 5) * N3 + (557 / 1440) * N4,
  (61 / 240) * N3 - (103 / 140) * N4,
  (49561 / 161280) * N4,
];
const BETA = [
  N / 2 - (2 / 3) * N2 + (37 / 96) * N3 - (1 / 360) * N4,
  (1 / 48) * N2 + (1 / 15) * N3 - (437 / 1440) * N4,
  (17 / 480) * N3 - (37 / 840) * N4,
  (4397 / 161280) * N4,
];
const E = Math.sqrt(F * (2 - F));

export interface Utm {
  zone: number;
  hemisphere: "N" | "S";
  easting: number;
  northing: number;
  /** MGRS latitude band letter (C–X), from the latitude. */
  band: string;
  /** Point scale factor and meridian convergence (degrees) at the point. */
  scale: number;
  convergence: number;
}

const BANDS = "CDEFGHJKLMNPQRSTUVWXX";

export function latBand(lat: number): string {
  if (lat < -80 || lat > 84) return "";
  return BANDS[Math.min(20, Math.floor((lat + 80) / 8))];
}

/** Standard zone, with the Norway (32V) and Svalbard (31X–37X) exceptions. */
export function utmZone(lat: number, lon: number): number {
  const l = normalizeLon(lon);
  let z = Math.floor((l + 180) / 6) + 1;
  if (z > 60) z = 60;
  if (lat >= 56 && lat < 64 && l >= 3 && l < 12) z = 32;
  if (lat >= 72 && lat < 84) {
    if (l >= 0 && l < 9) z = 31;
    else if (l >= 9 && l < 21) z = 33;
    else if (l >= 21 && l < 33) z = 35;
    else if (l >= 33 && l < 42) z = 37;
  }
  return z;
}

export function toUtm(p: LatLon, forceZone?: number): Utm {
  if (p.lat < -80 || p.lat > 84) throw new RangeError("UTM covers 80°S to 84°N. Polar areas use the UPS grid instead.");
  const zone = forceZone ?? utmZone(p.lat, p.lon);
  const lon0 = (zone - 1) * 6 - 180 + 3;
  const φ = p.lat * RAD;
  const λ = normalizeLon(p.lon - lon0) * RAD;
  const t = Math.sinh(Math.atanh(Math.sin(φ)) - E * Math.atanh(E * Math.sin(φ)));
  const ξp = Math.atan2(t, Math.cos(λ));
  const ηp = Math.atanh(Math.sin(λ) / Math.sqrt(1 + t * t));
  let ξ = ξp, η = ηp, σ = 1, τ = 0;
  for (let j = 1; j <= 4; j++) {
    const a = ALPHA[j - 1];
    ξ += a * Math.sin(2 * j * ξp) * Math.cosh(2 * j * ηp);
    η += a * Math.cos(2 * j * ξp) * Math.sinh(2 * j * ηp);
    σ += 2 * j * a * Math.cos(2 * j * ξp) * Math.cosh(2 * j * ηp);
    τ += 2 * j * a * Math.sin(2 * j * ξp) * Math.sinh(2 * j * ηp);
  }
  const x = K0 * AR * η;
  const y = K0 * AR * ξ;
  // Convergence and scale: Karney (2011) eqs. 23–25.
  const γ = Math.atan((t / Math.sqrt(1 + t * t)) * Math.tan(λ)) + Math.atan2(τ, σ);
  const tanφ = Math.tan(φ);
  const k =
    K0 *
    ((Math.sqrt(1 - E * E * Math.sin(φ) ** 2) * Math.sqrt(1 + tanφ * tanφ)) / Math.sqrt(t * t + Math.cos(λ) ** 2)) *
    ((AR / A) * Math.sqrt(σ * σ + τ * τ));
  const hemisphere = p.lat >= 0 ? "N" : "S";
  return {
    zone,
    hemisphere,
    easting: x + 500000,
    northing: hemisphere === "S" ? y + 10000000 : y,
    band: latBand(p.lat),
    scale: k,
    convergence: γ / RAD,
  };
}

export function fromUtm(zone: number, hemisphere: "N" | "S", easting: number, northing: number): LatLon {
  if (!(zone >= 1 && zone <= 60)) throw new RangeError("Zone must be 1–60.");
  const x = easting - 500000;
  const y = hemisphere === "S" ? northing - 10000000 : northing;
  const ξ = y / (K0 * AR);
  const η = x / (K0 * AR);
  let ξp = ξ, ηp = η;
  for (let j = 1; j <= 4; j++) {
    const b = BETA[j - 1];
    ξp -= b * Math.sin(2 * j * ξ) * Math.cosh(2 * j * η);
    ηp -= b * Math.cos(2 * j * ξ) * Math.sinh(2 * j * η);
  }
  const sinhηp = Math.sinh(ηp);
  const cosξp = Math.cos(ξp);
  const τp = Math.sin(ξp) / Math.sqrt(sinhηp * sinhηp + cosξp * cosξp);
  // Newton iteration for τ = tan φ (Karney 2011, eqs. 19–21).
  let τ = τp;
  for (let i = 0; i < 6; i++) {
    const s = Math.sinh(E * Math.atanh((E * τ) / Math.sqrt(1 + τ * τ)));
    const τpi = τ * Math.sqrt(1 + s * s) - s * Math.sqrt(1 + τ * τ);
    const dτ = ((τp - τpi) / Math.sqrt(1 + τpi * τpi)) * ((1 + (1 - E * E) * τ * τ) / ((1 - E * E) * Math.sqrt(1 + τ * τ)));
    τ += dτ;
    if (Math.abs(dτ) < 1e-14) break;
  }
  const lat = Math.atan(τ) / RAD;
  const lon0 = (zone - 1) * 6 - 180 + 3;
  const lon = normalizeLon(lon0 + Math.atan2(sinhηp, cosξp) / RAD);
  return { lat, lon };
}

/* ------------------------------------------------------------------ */
/* MGRS                                                                */
/* ------------------------------------------------------------------ */

const COL_SETS = ["ABCDEFGH", "JKLMNPQR", "STUVWXYZ"];
const ROW_LETTERS = "ABCDEFGHJKLMNPQRSTUV";

/** MGRS reference at the given precision (1 = 10 km … 5 = 1 m). */
export function toMgrs(p: LatLon, digits = 5): string {
  const u = toUtm(p);
  const col = COL_SETS[(u.zone - 1) % 3][Math.floor(u.easting / 100000) - 1];
  const rowOffset = u.zone % 2 === 0 ? 5 : 0;
  const row = ROW_LETTERS[(Math.floor(u.northing / 100000) + rowOffset) % 20];
  const e = Math.floor(u.easting % 100000).toString().padStart(5, "0").slice(0, digits);
  const n = Math.floor(u.northing % 100000).toString().padStart(5, "0").slice(0, digits);
  return `${u.zone}${u.band} ${col}${row} ${e} ${n}`;
}

/** Parses "18T WL 85595 10979" (spaces optional) back to the south-west corner of the cell. */
export function fromMgrs(ref: string): LatLon & { precisionM: number } {
  const t = ref.toUpperCase().replace(/\s+/g, "");
  const m = t.match(/^(\d{1,2})([C-HJ-NP-X])([A-HJ-NP-Z])([A-HJ-NP-V])(\d*)$/);
  if (!m || m[5].length % 2 !== 0 || m[5].length > 10) throw new RangeError("Not an MGRS reference, e.g. 18T WL 85595 10979.");
  const zone = Number(m[1]);
  if (zone < 1 || zone > 60) throw new RangeError("Zone must be 1–60.");
  const band = m[2];
  const colIdx = COL_SETS[(zone - 1) % 3].indexOf(m[3]);
  if (colIdx < 0) throw new RangeError(`Column letter ${m[3]} is not used in zone ${zone}.`);
  const digits = m[5].length / 2;
  const scale = 10 ** (5 - digits);
  const easting = (colIdx + 1) * 100000 + (digits ? Number(m[5].slice(0, digits)) * scale : 0);
  const rowOffset = zone % 2 === 0 ? 5 : 0;
  const n100k = ((ROW_LETTERS.indexOf(m[4]) - rowOffset + 20) % 20) * 100000;
  const n = digits ? Number(m[5].slice(digits)) * scale : 0;
  // Row letters repeat every 2,000 km: add 2,000 km blocks until the northing reaches the
  // bottom of the latitude band (NGA.SIG.0012 section 3; same method as Veness, movable-type.co.uk).
  const bandLat = BANDS.indexOf(band) * 8 - 80;
  const nBand = Math.floor(toUtm({ lat: bandLat, lon: (zone - 1) * 6 - 177 }, zone).northing / 100000) * 100000;
  let n2M = 0;
  while (n2M + n100k + n < nBand) n2M += 2000000;
  const hemisphere = band >= "N" ? "N" : "S";
  const p = fromUtm(zone, hemisphere, easting, n2M + n100k + n);
  return { ...p, precisionM: scale };
}

/* ------------------------------------------------------------------ */
/* Geohash                                                             */
/* ------------------------------------------------------------------ */

const B32 = "0123456789bcdefghjkmnpqrstuvwxyz";

export function geohashEncode(p: LatLon, length = 10): string {
  let lat: [number, number] = [-90, 90];
  let lon: [number, number] = [-180, 180];
  let hash = "", bit = 0, ch = 0, even = true;
  while (hash.length < length) {
    const r = even ? lon : lat;
    const v = even ? p.lon : p.lat;
    const mid = (r[0] + r[1]) / 2;
    if (v >= mid) {
      ch |= 1 << (4 - bit);
      r[0] = mid;
    } else r[1] = mid;
    even = !even;
    if (++bit === 5) {
      hash += B32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return hash;
}

export function geohashDecode(hash: string): LatLon & { latErr: number; lonErr: number } {
  const h = hash.trim().toLowerCase();
  if (!h || [...h].some((c) => !B32.includes(c))) throw new RangeError("A geohash uses the characters 0–9 and b–z without a, i, l, o.");
  const lat: [number, number] = [-90, 90];
  const lon: [number, number] = [-180, 180];
  let even = true;
  for (const c of h) {
    const v = B32.indexOf(c);
    for (let b = 4; b >= 0; b--) {
      const r = even ? lon : lat;
      const mid = (r[0] + r[1]) / 2;
      if ((v >> b) & 1) r[0] = mid;
      else r[1] = mid;
      even = !even;
    }
  }
  return { lat: (lat[0] + lat[1]) / 2, lon: (lon[0] + lon[1]) / 2, latErr: (lat[1] - lat[0]) / 2, lonErr: (lon[1] - lon[0]) / 2 };
}

/* ------------------------------------------------------------------ */
/* Open Location Code (Plus Codes)                                     */
/* ------------------------------------------------------------------ */

const OLC = "23456789CFGHJMPQRVWX";

/** Full 10-digit code (≈14 m) or 11-digit (≈3 m), e.g. "87G8Q2PQ+FG". Integer arithmetic as the spec recommends. */
export function olcEncode(p: LatLon, length = 10): string {
  const LAT_P = 8000 * 3125; // pair precision x 5^5 grid rows
  const LON_P = 8000 * 1024; // pair precision x 4^5 grid columns
  const lat = Math.min(90, Math.max(-90, p.lat));
  let latV = Math.floor(Math.round((lat + 90) * LAT_P * 1e6) / 1e6);
  const lonV = Math.floor(Math.round((normalizeLon(p.lon) + 180) * LON_P * 1e6) / 1e6) % (360 * LON_P);
  if (latV >= 180 * LAT_P) latV = 180 * LAT_P - 1;
  let latPair = Math.floor(latV / 3125);
  let lonPair = Math.floor(lonV / 1024);
  let code = "";
  for (let i = 0; i < 5; i++) {
    code = OLC[latPair % 20] + OLC[lonPair % 20] + code;
    latPair = Math.floor(latPair / 20);
    lonPair = Math.floor(lonPair / 20);
  }
  code = code.slice(0, 8) + "+" + code.slice(8);
  if (length > 10) {
    const row = Math.floor((latV % 3125) / 625);
    const col = Math.floor((lonV % 1024) / 256);
    code += OLC[row * 4 + col];
  }
  return code;
}

/** Decodes a full code to the centre of its area. Short codes (no area prefix) are rejected. */
export function olcDecode(code: string): LatLon & { size: [number, number] } {
  const c = code.trim().toUpperCase();
  const m = c.match(/^([23456789CFGHJMPQRVWX]{8})\+([23456789CFGHJMPQRVWX]{2,})?$/) ?? c.match(/^([23456789CFGHJMPQRVWX0]{2,8})\+$/);
  if (!m) throw new RangeError("Enter a full Plus Code such as 87G8Q2PQ+FG. Short codes like Q2PQ+FG need a nearby town to recover, which this tool does not do.");
  const digits = (m[1] + (m[2] ?? "")).replace(/0+$/, "");
  let lat = -90, lon = -180;
  let res = 20;
  let i = 0;
  for (; i < Math.min(10, digits.length); i += 2) {
    lat += OLC.indexOf(digits[i]) * res;
    lon += OLC.indexOf(digits[i + 1]) * res;
    if (i + 2 < Math.min(10, digits.length)) res /= 20;
  }
  let latSize = res, lonSize = res;
  for (let j = 10; j < digits.length; j++) {
    latSize /= 5;
    lonSize /= 4;
    const v = OLC.indexOf(digits[j]);
    lat += Math.floor(v / 4) * latSize;
    lon += (v % 4) * lonSize;
  }
  return { lat: lat + latSize / 2, lon: lon + lonSize / 2, size: [latSize, lonSize] };
}
