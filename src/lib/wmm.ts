/**
 * World Magnetic Model 2025 (WMM2025), NOAA NCEI and British Geological Survey.
 * Valid 2025.0 – 2030.0. Coefficients: WMM.COF released 13 Nov 2024 (public domain),
 * https://www.ncei.noaa.gov/products/world-magnetic-model
 *
 * Synthesis follows the WMM2025 Technical Report (NOAA NCEI): geodetic -> geocentric
 * spherical coordinates, Schmidt semi-normalised associated Legendre functions to degree 12,
 * secular variation applied linearly from 2025.0, field rotated back to the geodetic frame.
 * Checked against every row of NOAA's WMM2025_TestValues.txt.
 */

export const WMM_URL = "https://www.ncei.noaa.gov/products/world-magnetic-model";
export const WMM_EPOCH = 2025.0;
export const WMM_VALID_UNTIL = 2030.0;

// n, m, g, h, g-dot, h-dot  (nT, nT/year)
const COF = "1,0,-29351.8,0.0,12.0,0.0 1,1,-1410.8,4545.4,9.7,-21.5 2,0,-2556.6,0.0,-11.6,0.0 2,1,2951.1,-3133.6,-5.2,-27.7 2,2,1649.3,-815.1,-8.0,-12.1 3,0,1361.0,0.0,-1.3,0.0 3,1,-2404.1,-56.6,-4.2,4.0 3,2,1243.8,237.5,0.4,-0.3 3,3,453.6,-549.5,-15.6,-4.1 4,0,895.0,0.0,-1.6,0.0 4,1,799.5,278.6,-2.4,-1.1 4,2,55.7,-133.9,-6.0,4.1 4,3,-281.1,212.0,5.6,1.6 4,4,12.1,-375.6,-7.0,-4.4 5,0,-233.2,0.0,0.6,0.0 5,1,368.9,45.4,1.4,-0.5 5,2,187.2,220.2,0.0,2.2 5,3,-138.7,-122.9,0.6,0.4 5,4,-142.0,43.0,2.2,1.7 5,5,20.9,106.1,0.9,1.9 6,0,64.4,0.0,-0.2,0.0 6,1,63.8,-18.4,-0.4,0.3 6,2,76.9,16.8,0.9,-1.6 6,3,-115.7,48.8,1.2,-0.4 6,4,-40.9,-59.8,-0.9,0.9 6,5,14.9,10.9,0.3,0.7 6,6,-60.7,72.7,0.9,0.9 7,0,79.5,0.0,-0.0,0.0 7,1,-77.0,-48.9,-0.1,0.6 7,2,-8.8,-14.4,-0.1,0.5 7,3,59.3,-1.0,0.5,-0.8 7,4,15.8,23.4,-0.1,0.0 7,5,2.5,-7.4,-0.8,-1.0 7,6,-11.1,-25.1,-0.8,0.6 7,7,14.2,-2.3,0.8,-0.2 8,0,23.2,0.0,-0.1,0.0 8,1,10.8,7.1,0.2,-0.2 8,2,-17.5,-12.6,0.0,0.5 8,3,2.0,11.4,0.5,-0.4 8,4,-21.7,-9.7,-0.1,0.4 8,5,16.9,12.7,0.3,-0.5 8,6,15.0,0.7,0.2,-0.6 8,7,-16.8,-5.2,-0.0,0.3 8,8,0.9,3.9,0.2,0.2 9,0,4.6,0.0,-0.0,0.0 9,1,7.8,-24.8,-0.1,-0.3 9,2,3.0,12.2,0.1,0.3 9,3,-0.2,8.3,0.3,-0.3 9,4,-2.5,-3.3,-0.3,0.3 9,5,-13.1,-5.2,0.0,0.2 9,6,2.4,7.2,0.3,-0.1 9,7,8.6,-0.6,-0.1,-0.2 9,8,-8.7,0.8,0.1,0.4 9,9,-12.9,10.0,-0.1,0.1 10,0,-1.3,0.0,0.1,0.0 10,1,-6.4,3.3,0.0,0.0 10,2,0.2,0.0,0.1,-0.0 10,3,2.0,2.4,0.1,-0.2 10,4,-1.0,5.3,-0.0,0.1 10,5,-0.6,-9.1,-0.3,-0.1 10,6,-0.9,0.4,0.0,0.1 10,7,1.5,-4.2,-0.1,0.0 10,8,0.9,-3.8,-0.1,-0.1 10,9,-2.7,0.9,-0.0,0.2 10,10,-3.9,-9.1,-0.0,-0.0 11,0,2.9,0.0,0.0,0.0 11,1,-1.5,0.0,-0.0,-0.0 11,2,-2.5,2.9,0.0,0.1 11,3,2.4,-0.6,0.0,-0.0 11,4,-0.6,0.2,0.0,0.1 11,5,-0.1,0.5,-0.1,-0.0 11,6,-0.6,-0.3,0.0,-0.0 11,7,-0.1,-1.2,-0.0,0.1 11,8,1.1,-1.7,-0.1,-0.0 11,9,-1.0,-2.9,-0.1,0.0 11,10,-0.2,-1.8,-0.1,0.0 11,11,2.6,-2.3,-0.1,0.0 12,0,-2.0,0.0,0.0,0.0 12,1,-0.2,-1.3,0.0,-0.0 12,2,0.3,0.7,-0.0,0.0 12,3,1.2,1.0,-0.0,-0.1 12,4,-1.3,-1.4,-0.0,0.1 12,5,0.6,-0.0,-0.0,-0.0 12,6,0.6,0.6,0.1,-0.0 12,7,0.5,-0.1,-0.0,-0.0 12,8,-0.1,0.8,0.0,0.0 12,9,-0.4,0.1,0.0,-0.0 12,10,-0.2,-1.0,-0.1,-0.0 12,11,-1.3,0.1,-0.0,0.0 12,12,-0.7,0.2,-0.1,-0.1";

const MAXN = 12;
const G: number[][] = [], H: number[][] = [], GD: number[][] = [], HD: number[][] = [];
for (let n = 0; n <= MAXN; n++) {
  G.push(new Array(MAXN + 1).fill(0));
  H.push(new Array(MAXN + 1).fill(0));
  GD.push(new Array(MAXN + 1).fill(0));
  HD.push(new Array(MAXN + 1).fill(0));
}
for (const row of COF.split(" ")) {
  const [n, m, g, h, gd, hd] = row.split(",").map(Number);
  G[n][m] = g;
  H[n][m] = h;
  GD[n][m] = gd;
  HD[n][m] = hd;
}

// Schmidt quasi-normalisation factors S[n][m] applied to the Gauss-normalised functions.
const S: number[][] = [];
for (let n = 0; n <= MAXN; n++) {
  S.push(new Array(MAXN + 1).fill(0));
  S[n][0] = n === 0 ? 1 : (S[n - 1][0] * (2 * n - 1)) / n;
  for (let m = 1; m <= n; m++) S[n][m] = S[n][m - 1] * Math.sqrt(((n - m + 1) * (m === 1 ? 2 : 1)) / (n + m));
}

export interface MagneticField {
  /** Declination (deg, east positive), inclination (deg, down positive). */
  declination: number;
  inclination: number;
  /** Horizontal, north, east, down and total intensity, nT. */
  h: number;
  x: number;
  y: number;
  z: number;
  f: number;
  /** Annual change of declination, degrees per year. */
  declinationPerYear: number;
  /** True when the date is outside 2025.0–2030.0 (results are extrapolated). */
  outsideValidity: boolean;
  /** True near the magnetic poles (H < 6000 nT): compass bearings are unreliable there. */
  blackout: boolean;
}

function synth(latDeg: number, lonDeg: number, altKm: number, year: number) {
  const a = 6378.137;
  const f = 1 / 298.257223563;
  const e2 = f * (2 - f);
  const aRef = 6371.2;
  const φ = (latDeg * Math.PI) / 180;
  const λ = (lonDeg * Math.PI) / 180;
  const Rc = a / Math.sqrt(1 - e2 * Math.sin(φ) ** 2);
  const p = (Rc + altKm) * Math.cos(φ);
  const zc = (Rc * (1 - e2) + altKm) * Math.sin(φ);
  const r = Math.hypot(p, zc);
  const φc = Math.asin(zc / r);
  const dt = year - WMM_EPOCH;

  const cosθ = Math.sin(φc);
  const sinθ = Math.cos(φc);
  const P: number[][] = [], dP: number[][] = [];
  for (let n = 0; n <= MAXN; n++) {
    P.push(new Array(MAXN + 1).fill(0));
    dP.push(new Array(MAXN + 1).fill(0));
  }
  P[0][0] = 1;
  for (let n = 1; n <= MAXN; n++) {
    for (let m = 0; m <= n; m++) {
      if (n === m) {
        P[n][m] = sinθ * P[n - 1][m - 1];
        dP[n][m] = sinθ * dP[n - 1][m - 1] + cosθ * P[n - 1][m - 1];
      } else {
        const K = n === 1 ? 0 : ((n - 1) ** 2 - m * m) / ((2 * n - 1) * (2 * n - 3));
        P[n][m] = cosθ * P[n - 1][m] - (n >= 2 ? K * P[n - 2][m] : 0);
        dP[n][m] = cosθ * dP[n - 1][m] - sinθ * P[n - 1][m] - (n >= 2 ? K * dP[n - 2][m] : 0);
      }
    }
  }

  let Br = 0, Bθ = 0, Bφ = 0;
  for (let n = 1; n <= MAXN; n++) {
    const ar = (aRef / r) ** (n + 2);
    for (let m = 0; m <= n; m++) {
      const g = (G[n][m] + dt * GD[n][m]) * S[n][m];
      const h = (H[n][m] + dt * HD[n][m]) * S[n][m];
      const cm = Math.cos(m * λ), sm = Math.sin(m * λ);
      Br += (n + 1) * ar * (g * cm + h * sm) * P[n][m];
      Bθ -= ar * (g * cm + h * sm) * dP[n][m];
      Bφ += (sinθ === 0 ? 0 : (ar * m * (g * sm - h * cm) * P[n][m]) / sinθ);
    }
  }
  const Xc = -Bθ, Yc = Bφ, Zc = -Br;
  const ψ = φc - φ;
  const x = Xc * Math.cos(ψ) - Zc * Math.sin(ψ);
  const z = Xc * Math.sin(ψ) + Zc * Math.cos(ψ);
  return { x, y: Yc, z };
}

/** Magnetic field at a point. Altitude in km above the WGS84 ellipsoid; year as decimal (2026.79). */
export function magneticField(lat: number, lon: number, altKm: number, year: number): MagneticField {
  const { x, y, z } = synth(lat, lon, altKm, year);
  const h = Math.hypot(x, y);
  const d0 = (Math.atan2(y, x) * 180) / Math.PI;
  const n1 = synth(lat, lon, altKm, year + 0.5);
  const n0 = synth(lat, lon, altKm, year - 0.5);
  let dD = ((Math.atan2(n1.y, n1.x) - Math.atan2(n0.y, n0.x)) * 180) / Math.PI;
  if (dD > 180) dD -= 360;
  if (dD < -180) dD += 360;
  return {
    declination: d0,
    inclination: (Math.atan2(z, h) * 180) / Math.PI,
    h,
    x,
    y,
    z,
    f: Math.hypot(h, z),
    declinationPerYear: dD,
    outsideValidity: year < WMM_EPOCH || year >= WMM_VALID_UNTIL,
    blackout: h < 6000,
  };
}

/** Decimal year for a JS date (UTC). */
export function decimalYear(d: Date): number {
  const y = d.getUTCFullYear();
  const start = Date.UTC(y, 0, 1);
  const end = Date.UTC(y + 1, 0, 1);
  return y + (d.getTime() - start) / (end - start);
}
