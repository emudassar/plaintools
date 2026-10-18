/**
 * Sun position, sunrise, sunset and solar noon.
 *
 * Equations: NOAA Global Monitoring Laboratory solar calculator spreadsheets
 * (NOAA_Solar_Calculations_day.xls), which implement Jean Meeus, Astronomical
 * Algorithms. https://gml.noaa.gov/grad/solcalc/calcdetails.html
 *
 * NOAA states: sunrise/sunset theoretically accurate to within a minute between
 * +/-72 degrees latitude and within 10 minutes outside; sunrise/sunset assume
 * 0.833 degrees of refraction; position uses an approximate refraction model in
 * bands (above 85, 5 to 85, -0.575 to 5, below -0.575 degrees). The spreadsheets
 * are valid for 1901-2099 (Julian Day approximation) — this code computes the
 * Julian Day exactly from the timestamp, but keeps NOAA's year range as a guard.
 * NOAA also says the calculator is no longer actively maintained.
 */

export const NOAA_DETAILS_URL = "https://gml.noaa.gov/grad/solcalc/calcdetails.html";
export const NOAA_CALC_URL = "https://gml.noaa.gov/grad/solcalc/";

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const mod = (a: number, n: number) => ((a % n) + n) % n;

interface SolarTerms {
  /** Solar declination, degrees. */
  decl: number;
  /** Equation of time, minutes. */
  eqTime: number;
}

/** Julian century from a UTC timestamp (ms). */
function julianCentury(ms: number): number {
  const jd = ms / 86400000 + 2440587.5;
  return (jd - 2451545) / 36525;
}

export function solarTerms(ms: number): SolarTerms {
  const T = julianCentury(ms);
  const L0 = mod(280.46646 + T * (36000.76983 + T * 0.0003032), 360);
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C =
    Math.sin(rad(M)) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(rad(2 * M)) * (0.019993 - 0.000101 * T) +
    Math.sin(rad(3 * M)) * 0.000289;
  const trueLong = L0 + C;
  const appLong = trueLong - 0.00569 - 0.00478 * Math.sin(rad(125.04 - 1934.136 * T));
  const meanObliq = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const obliq = meanObliq + 0.00256 * Math.cos(rad(125.04 - 1934.136 * T));
  const decl = deg(Math.asin(Math.sin(rad(obliq)) * Math.sin(rad(appLong))));
  const y = Math.tan(rad(obliq / 2)) ** 2;
  const eqTime =
    4 *
    deg(
      y * Math.sin(2 * rad(L0)) -
        2 * e * Math.sin(rad(M)) +
        4 * e * y * Math.sin(rad(M)) * Math.cos(2 * rad(L0)) -
        0.5 * y * y * Math.sin(4 * rad(L0)) -
        1.25 * e * e * Math.sin(2 * rad(M)),
    );
  return { decl, eqTime };
}

/** NOAA's approximate atmospheric refraction correction, degrees. */
export function refractionCorrection(elevation: number): number {
  const e = elevation;
  let arcsec: number;
  if (e > 85) arcsec = 0;
  else if (e > 5) {
    const t = Math.tan(rad(e));
    arcsec = 58.1 / t - 0.07 / t ** 3 + 0.000086 / t ** 5;
  } else if (e > -0.575) arcsec = 1735 + e * (-518.2 + e * (103.4 + e * (-12.79 + e * 0.711)));
  else arcsec = -20.772 / Math.tan(rad(e));
  return arcsec / 3600;
}

export interface SunPosition {
  /** Degrees above the horizon, corrected for refraction. */
  elevation: number;
  /** Without refraction (geometric). */
  elevationGeometric: number;
  /** Degrees clockwise from true north. */
  azimuth: number;
  declination: number;
  equationOfTime: number;
}

export function sunPosition(ms: number, lat: number, lon: number): SunPosition {
  const { decl, eqTime } = solarTerms(ms);
  const d = new Date(ms);
  const minutesUtc = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60 + d.getUTCMilliseconds() / 60000;
  const tst = mod(minutesUtc + eqTime + 4 * lon, 1440);
  const ha = tst / 4 < 0 ? tst / 4 + 180 : tst / 4 - 180;
  const cosZ = Math.sin(rad(lat)) * Math.sin(rad(decl)) + Math.cos(rad(lat)) * Math.cos(rad(decl)) * Math.cos(rad(ha));
  const zen = deg(Math.acos(Math.max(-1, Math.min(1, cosZ))));
  const geo = 90 - zen;
  const denom = Math.cos(rad(lat)) * Math.sin(rad(zen));
  let az: number;
  if (Math.abs(denom) < 1e-12) {
    az = lat > 0 ? 180 : 0; // at the pole or the sun overhead: direction undefined, use due south/north
  } else {
    const a = deg(Math.acos(Math.max(-1, Math.min(1, (Math.sin(rad(lat)) * Math.cos(rad(zen)) - Math.sin(rad(decl))) / denom))));
    az = ha > 0 ? mod(a + 180, 360) : mod(540 - a, 360);
  }
  return {
    elevation: geo + refractionCorrection(geo),
    elevationGeometric: geo,
    azimuth: az,
    declination: decl,
    equationOfTime: eqTime,
  };
}

export interface SunDay {
  /** UTC ms, or null when the sun does not rise / set that day. */
  sunrise: number | null;
  sunset: number | null;
  solarNoon: number;
  /** Day length in minutes (0 in polar night, 1440 in midnight sun). */
  dayLengthMin: number;
  polar: "none" | "midnight-sun" | "polar-night";
  noonElevation: number;
}

/** Minutes after 00:00 UTC of the calendar date for solar noon at this longitude. */
function noonMinutes(dayStartMs: number, lon: number): number {
  let m = 720 - 4 * lon;
  for (let i = 0; i < 2; i++) m = 720 - 4 * lon - solarTerms(dayStartMs + m * 60000).eqTime;
  return m;
}

/** Hour angle of sunrise (degrees) at time ms, or NaN-coded polar state. */
function sunriseHA(ms: number, lat: number): number {
  const { decl } = solarTerms(ms);
  return deg(
    Math.acos(Math.cos(rad(90.833)) / (Math.cos(rad(lat)) * Math.cos(rad(decl))) - Math.tan(rad(lat)) * Math.tan(rad(decl))),
  );
}

/**
 * Sun events for one calendar date. `y`, `m` (1-12), `d` is the local date;
 * events are computed around local mean solar noon of that date at `lon`.
 */
export function sunDay(y: number, m: number, d: number, lat: number, lon: number): SunDay {
  const day0 = Date.UTC(y, m - 1, d);
  const noonM = noonMinutes(day0, lon);
  const solarNoon = day0 + noonM * 60000;
  const noonPos = sunPosition(solarNoon, lat, lon);

  const event = (sign: -1 | 1): number | null => {
    let t = solarNoon;
    for (let i = 0; i < 3; i++) {
      const ha = sunriseHA(t, lat);
      if (!Number.isFinite(ha)) return null;
      const { eqTime } = solarTerms(t);
      t = day0 + (720 - 4 * (lon - sign * ha) - eqTime) * 60000;
    }
    return t;
  };
  const ha0 = sunriseHA(solarNoon, lat);
  if (!Number.isFinite(ha0)) {
    const { decl } = solarTerms(solarNoon);
    const arg = Math.cos(rad(90.833)) / (Math.cos(rad(lat)) * Math.cos(rad(decl))) - Math.tan(rad(lat)) * Math.tan(rad(decl));
    const polar = arg < -1 ? "midnight-sun" : "polar-night";
    return { sunrise: null, sunset: null, solarNoon, dayLengthMin: polar === "midnight-sun" ? 1440 : 0, polar, noonElevation: noonPos.elevation };
  }
  const sunrise = event(-1);
  const sunset = event(1);
  return {
    sunrise,
    sunset,
    solarNoon,
    dayLengthMin: sunrise !== null && sunset !== null ? (sunset - sunrise) / 60000 : 8 * ha0,
    polar: "none",
    noonElevation: noonPos.elevation,
  };
}

/** Elevation every `stepMin` minutes across 24 h starting at `startMs`, for a chart. */
export function elevationCurve(startMs: number, lat: number, lon: number, stepMin = 10): { ms: number; elevation: number; azimuth: number }[] {
  const out = [];
  for (let t = 0; t <= 1440; t += stepMin) {
    const ms = startMs + t * 60000;
    const p = sunPosition(ms, lat, lon);
    out.push({ ms, elevation: p.elevation, azimuth: p.azimuth });
  }
  return out;
}

/** Wall-clock parts of a UTC instant in an IANA time zone. */
export function zonedParts(ms: number, timeZone: string) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p = Object.fromEntries(f.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { y: +p.year, m: +p.month, d: +p.day, hh: +p.hour, mm: +p.minute, ss: +p.second };
}

/** UTC ms for a wall-clock time in an IANA zone (DST handled by two passes). */
export function zonedToUtc(y: number, m: number, d: number, hh: number, mm: number, timeZone: string): number {
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let t = guess;
  for (let i = 0; i < 2; i++) {
    const p = zonedParts(t, timeZone);
    const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mm, p.ss);
    t = t + (guess - asUtc);
  }
  return t;
}

/**
 * Times the sun's centre crosses a given geometric altitude on a local date — the same
 * NOAA hour-angle method as sunrise, with the zenith angle 90° − altitude. Used for twilight
 * (−6° civil, −12° nautical, −18° astronomical) and photographers' golden/blue hour limits.
 * Each time is null when the sun never reaches that altitude that day.
 */
export function sunAltitudeTimes(y: number, m: number, d: number, lat: number, lon: number, altitude: number): { morning: number | null; evening: number | null } {
  const day0 = Date.UTC(y, m - 1, d);
  const noon = day0 + noonMinutes(day0, lon) * 60000;
  const zen = 90 - altitude;
  const ha = (t: number) => {
    const { decl } = solarTerms(t);
    return deg(Math.acos(Math.cos(rad(zen)) / (Math.cos(rad(lat)) * Math.cos(rad(decl))) - Math.tan(rad(lat)) * Math.tan(rad(decl))));
  };
  const event = (sign: -1 | 1): number | null => {
    let t = noon;
    for (let i = 0; i < 3; i++) {
      const h = ha(t);
      if (!Number.isFinite(h)) return null;
      const { eqTime } = solarTerms(t);
      t = day0 + (720 - 4 * (lon - sign * h) - eqTime) * 60000;
    }
    return t;
  };
  return { morning: event(-1), evening: event(1) };
}

/** The subsolar point (where the sun is overhead) at a UTC instant. */
export function subsolarPoint(ms: number): { lat: number; lon: number } {
  const { decl, eqTime } = solarTerms(ms);
  const d = new Date(ms);
  const minutes = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
  let lon = -(minutes + eqTime - 720) / 4;
  lon = ((((lon + 180) % 360) + 360) % 360) - 180;
  return { lat: decl, lon };
}
