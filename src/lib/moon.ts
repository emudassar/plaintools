/**
 * Moon position, phase and rise/set.
 *
 * Position: Paul Schlyter, "How to compute planetary positions" (stjarnhimlen.se/comp/ppcomp.html):
 * mean orbital elements of the Moon and Sun plus the 12 largest longitude, 5 latitude and
 * 2 distance perturbation terms. Schlyter gives the accuracy as about 1–2 arc minutes;
 * checked here against NASA JPL Horizons (see the tool's data section).
 * Sidereal time: Meeus, Astronomical Algorithms (2nd ed.), eq. 12.4.
 * Rise/set: the Moon's centre at altitude h0 = 0.7275 × parallax − 34′ (Meeus ch. 15).
 * Phases: times when the Moon's ecliptic longitude minus the Sun's is 0°, 90°, 180°, 270°,
 * found by root finding on the same model.
 */

export const SCHLYTER_URL = "https://stjarnhimlen.se/comp/ppcomp.html";
export const HORIZONS_URL = "https://ssd.jpl.nasa.gov/horizons/";
export const USNO_PHASES_URL = "https://aa.usno.navy.mil/data/MoonPhases";

const RAD = Math.PI / 180;
const rev = (x: number) => ((x % 360) + 360) % 360;
const sind = (x: number) => Math.sin(x * RAD);
const cosd = (x: number) => Math.cos(x * RAD);

export const EARTH_RADIUS_KM = 6378.137;
export const SYNODIC_MONTH_DAYS = 29.530588853; // mean synodic month, Meeus ch. 49

/** Days since 2000 Jan 0.0 UT (Schlyter's d). */
const dayNumber = (ms: number) => ms / 86400000 + 2440587.5 - 2451543.5;

function sunEcliptic(d: number) {
  const w = 282.9404 + 4.70935e-5 * d;
  const e = 0.016709 - 1.151e-9 * d;
  const M = rev(356.047 + 0.9856002585 * d);
  const E = M + (e / RAD) * sind(M) * (1 + e * cosd(M));
  const xv = cosd(E) - e;
  const yv = Math.sqrt(1 - e * e) * sind(E);
  const v = Math.atan2(yv, xv) / RAD;
  return { lon: rev(v + w), M, w };
}

export interface MoonPosition {
  /** Geocentric ecliptic longitude / latitude, degrees. */
  eclLon: number;
  eclLat: number;
  /** Geocentric right ascension (deg) and declination (deg). */
  ra: number;
  dec: number;
  distanceKm: number;
  /** Equatorial horizontal parallax, degrees. */
  parallax: number;
  /** Fraction of the disc lit, 0–1. */
  illumination: number;
  /** Moon longitude minus Sun longitude, 0–360 (0 new, 90 first quarter, 180 full, 270 last quarter). */
  elongation: number;
  /** The point on Earth with the Moon at the zenith (geocentric). */
  sublunarLat: number;
  sublunarLon: number;
}

/** Greenwich mean sidereal time in degrees (Meeus 12.4). */
export function gmst(ms: number): number {
  const jd = ms / 86400000 + 2440587.5;
  const T = (jd - 2451545) / 36525;
  return rev(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - (T * T * T) / 38710000);
}

export function moonPosition(ms: number): MoonPosition {
  const d = dayNumber(ms);
  const N = rev(125.1228 - 0.0529538083 * d);
  const i = 5.1454;
  const w = rev(318.0634 + 0.1643573223 * d);
  const a = 60.2666;
  const e = 0.0549;
  const M = rev(115.3654 + 13.0649929509 * d);
  let E = M + (e / RAD) * sind(M) * (1 + e * cosd(M));
  for (let k = 0; k < 5; k++) E = E - (E - (e / RAD) * sind(E) - M) / (1 - e * cosd(E));
  const xv = a * (cosd(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * sind(E);
  const v = Math.atan2(yv, xv) / RAD;
  let r = Math.hypot(xv, yv);
  const xh = r * (cosd(N) * cosd(v + w) - sind(N) * sind(v + w) * cosd(i));
  const yh = r * (sind(N) * cosd(v + w) + cosd(N) * sind(v + w) * cosd(i));
  const zh = r * sind(v + w) * sind(i);
  let lon = Math.atan2(yh, xh) / RAD;
  let lat = Math.atan2(zh, Math.hypot(xh, yh)) / RAD;

  const sun = sunEcliptic(d);
  const Ms = sun.M;
  const Ls = rev(Ms + sun.w);
  const Lm = rev(M + w + N);
  const D = rev(Lm - Ls);
  const F = rev(Lm - N);
  lon +=
    -1.274 * sind(M - 2 * D) +
    0.658 * sind(2 * D) -
    0.186 * sind(Ms) -
    0.059 * sind(2 * M - 2 * D) -
    0.057 * sind(M - 2 * D + Ms) +
    0.053 * sind(M + 2 * D) +
    0.046 * sind(2 * D - Ms) +
    0.041 * sind(M - Ms) -
    0.035 * sind(D) -
    0.031 * sind(M + Ms) -
    0.015 * sind(2 * F - 2 * D) +
    0.011 * sind(M - 4 * D);
  lat += -0.173 * sind(F - 2 * D) - 0.055 * sind(M - F - 2 * D) - 0.046 * sind(M + F - 2 * D) + 0.033 * sind(F + 2 * D) + 0.017 * sind(2 * M + F);
  r += -0.58 * cosd(M - 2 * D) - 0.46 * cosd(2 * D);
  lon = rev(lon);

  const ecl = 23.4393 - 3.563e-7 * d;
  const xe = cosd(lon) * cosd(lat);
  const ye = sind(lon) * cosd(lat) * cosd(ecl) - sind(lat) * sind(ecl);
  const ze = sind(lon) * cosd(lat) * sind(ecl) + sind(lat) * cosd(ecl);
  const ra = rev(Math.atan2(ye, xe) / RAD);
  const dec = Math.atan2(ze, Math.hypot(xe, ye)) / RAD;

  const elongation = rev(lon - sun.lon);
  const cosElong = cosd(sun.lon - lon) * cosd(lat);
  const elong = Math.acos(Math.max(-1, Math.min(1, cosElong))) / RAD;
  const illumination = (1 - cosd(elong)) / 2;
  let sublunarLon = rev(ra - gmst(ms));
  if (sublunarLon > 180) sublunarLon -= 360;
  return {
    eclLon: lon,
    eclLat: lat,
    ra,
    dec,
    distanceKm: r * EARTH_RADIUS_KM,
    parallax: Math.asin(1 / r) / RAD,
    illumination,
    elongation,
    sublunarLat: dec,
    sublunarLon,
  };
}

/** Altitude (deg) of the Moon's centre above the horizon, geocentric, for an observer. */
export function moonAltitude(ms: number, lat: number, lon: number): { altitude: number; azimuth: number; parallax: number } {
  const m = moonPosition(ms);
  const ha = rev(gmst(ms) + lon - m.ra);
  const alt = Math.asin(sind(lat) * sind(m.dec) + cosd(lat) * cosd(m.dec) * cosd(ha)) / RAD;
  const az = rev(Math.atan2(-cosd(m.dec) * sind(ha), cosd(lat) * sind(m.dec) - sind(lat) * cosd(m.dec) * cosd(ha)) / RAD);
  return { altitude: alt, azimuth: az, parallax: m.parallax };
}

/**
 * Moonrise and moonset within [startMs, startMs + 24 h). Each is null if it does not happen
 * in that window (the Moon rises about 50 minutes later each day, so one day a month has no rise).
 */
export function moonRiseSet(startMs: number, lat: number, lon: number): { rise: number | null; set: number | null; alwaysUp: boolean; alwaysDown: boolean } {
  const f = (t: number) => {
    const a = moonAltitude(t, lat, lon);
    return a.altitude - (0.7275 * a.parallax - 0.5667);
  };
  const step = 10 * 60000;
  let rise: number | null = null, set: number | null = null;
  let prevT = startMs, prev = f(startMs);
  let anyUp = prev > 0, anyDown = prev <= 0;
  for (let t = startMs + step; t <= startMs + 86400000; t += step) {
    const cur = f(t);
    if (cur > 0) anyUp = true;
    else anyDown = true;
    if ((prev <= 0 && cur > 0) || (prev > 0 && cur <= 0)) {
      let lo = prevT, hi = t, flo = prev;
      for (let k = 0; k < 30; k++) {
        const mid = (lo + hi) / 2;
        const fm = f(mid);
        if ((flo <= 0 && fm <= 0) || (flo > 0 && fm > 0)) {
          lo = mid;
          flo = fm;
        } else hi = mid;
      }
      const when = Math.round((lo + hi) / 2);
      if (when < startMs + 86400000) {
        if (prev <= 0 && rise === null) rise = when;
        if (prev > 0 && set === null) set = when;
      }
    }
    prevT = t;
    prev = cur;
  }
  return { rise, set, alwaysUp: anyUp && !anyDown, alwaysDown: anyDown && !anyUp };
}

export type PhaseName = "New Moon" | "First Quarter" | "Full Moon" | "Last Quarter";
const PHASE_TARGETS: [number, PhaseName][] = [
  [0, "New Moon"],
  [90, "First Quarter"],
  [180, "Full Moon"],
  [270, "Last Quarter"],
];

/** Signed angular difference a − b in (−180, 180]. */
const angDiff = (a: number, b: number) => {
  const x = rev(a - b);
  return x > 180 ? x - 360 : x;
};

/** The instant (ms) near `guessMs` when the elongation equals `target` degrees. */
function solvePhase(guessMs: number, target: number): number {
  let t = guessMs;
  for (let k = 0; k < 12; k++) {
    const diff = angDiff(moonPosition(t).elongation, target);
    // The elongation grows about 12.19° per day.
    t -= (diff / 12.190749) * 86400000;
    if (Math.abs(diff) < 1e-6) break;
  }
  return t;
}

export interface PhaseEvent {
  name: PhaseName;
  ms: number;
}

/** Principal phases from `fromMs` onwards. */
export function nextPhases(fromMs: number, count: number): PhaseEvent[] {
  const out: PhaseEvent[] = [];
  const el = moonPosition(fromMs).elongation;
  // Start from the quarter just before now.
  let idx = Math.floor(el / 90);
  let guess = fromMs - ((el - idx * 90) / 12.190749) * 86400000;
  while (out.length < count) {
    const [target, name] = PHASE_TARGETS[idx % 4];
    const ms = solvePhase(guess, target);
    if (ms >= fromMs - 60000) out.push({ name, ms });
    idx++;
    guess = ms + (SYNODIC_MONTH_DAYS / 4) * 86400000;
  }
  return out;
}

/** Name of the phase for a given elongation (the 8 conventional phases). */
export function phaseName(elongation: number): string {
  const e = rev(elongation);
  if (e < 6 || e >= 354) return "New Moon";
  if (e < 84) return "Waxing Crescent";
  if (e < 96) return "First Quarter";
  if (e < 174) return "Waxing Gibbous";
  if (e < 186) return "Full Moon";
  if (e < 264) return "Waning Gibbous";
  if (e < 276) return "Last Quarter";
  return "Waning Crescent";
}

/** Days since the most recent new moon. */
export function moonAge(ms: number): number {
  const el = moonPosition(ms).elongation;
  const lastNew = solvePhase(ms - (el / 12.190749) * 86400000, 0);
  return (ms - lastNew) / 86400000;
}
