import { ToolError } from "./errors";

/**
 * Hard capsule sizes.
 *
 * Source: Capsugel, "Coni-Snap® Hard Gelatin Capsules — Reliable and consistent
 * two-piece capsules" (brochure BAS 255), p. 16 "Properties and specifications".
 * Copy hosted by the distributor Euromar, retrieved 2026-10-04 from
 *   https://euromar.co.il/wp-content/uploads/2021/01/ConiSnap_brochure_full.pdf
 *
 * Every value below is as printed: weight and tolerance (mg), capsule volume
 * (ml), body and cap length, body and cap external diameter, and overall closed
 * length with tolerance. The brochure's "capsule capacity" columns at 0.6, 0.8,
 * 1.0 and 1.2 g/ml are exactly volume x density x 1000 for all 56 cells, so the
 * page computes capacity at any density with that formula.
 *
 * The brochure marks one 0el variant (20.98 mm body) "Europe only".
 *
 * Known slip in the source: the standard 0el row prints an overall closed
 * length of 0.909 in and 23.5 mm, which do not convert to each other
 * (0.909 in = 23.1 mm). Both are kept as printed and flagged on the page.
 */

export const CAPSULE_RETRIEVED = "2026-10-04";
export const CONI_SNAP_URL =
  "https://euromar.co.il/wp-content/uploads/2021/01/ConiSnap_brochure_full.pdf";

/** The densities the brochure prints capacity columns for. */
export const PRINTED_DENSITIES = [0.6, 0.8, 1.0, 1.2] as const;

export interface CapsuleSize {
  /** Unique key; the European 0el variant is "0el-eu". */
  id: string;
  label: string;
  europeOnly: boolean;
  weightMg: number;
  weightTolMg: number;
  volumeMl: number;
  bodyLengthIn: number;
  bodyLengthMm: number;
  capLengthIn: number;
  capLengthMm: number;
  bodyDiameterIn: number;
  bodyDiameterMm: number;
  capDiameterIn: number;
  capDiameterMm: number;
  closedLengthIn: number;
  closedLengthMm: number;
  closedTolMm: number;
  /** Set where the printed inch and mm values disagree. */
  note: string | null;
}

type Row = [
  id: string,
  label: string,
  weight: number,
  tol: number,
  vol: number,
  bodyIn: number,
  bodyMm: number,
  capIn: number,
  capMm: number,
  bodyDiaIn: number,
  bodyDiaMm: number,
  capDiaIn: number,
  capDiaMm: number,
  closedIn: number,
  closedMm: number,
  closedTolMm: number,
];

// prettier-ignore
const ROWS: Row[] = [
  ["000",    "000",  163, 10, 1.37, 0.874, 22.20, 0.510, 12.95, 0.376, 9.55, 0.390, 9.91, 1.029, 26.1, 0.3],
  ["00el",   "00el", 130, 10, 1.02, 0.874, 22.20, 0.510, 12.95, 0.322, 8.18, 0.336, 8.53, 0.995, 25.3, 0.3],
  ["00",     "00",   118,  7, 0.91, 0.796, 20.22, 0.462, 11.74, 0.322, 8.18, 0.336, 8.53, 0.917, 23.3, 0.3],
  ["0el",    "0el",  107,  7, 0.78, 0.795, 20.19, 0.460, 11.68, 0.289, 7.34, 0.301, 7.65, 0.909, 23.5, 0.3],
  ["0el-eu", "0el",  110,  7, 0.78, 0.826, 20.98, 0.472, 11.99, 0.290, 7.36, 0.301, 7.66, 0.953, 24.2, 0.3],
  ["0",      "0",     96,  6, 0.68, 0.726, 18.44, 0.422, 10.72, 0.289, 7.34, 0.300, 7.64, 0.854, 21.7, 0.3],
  ["1el",    "1el",   81,  5, 0.54, 0.697, 17.70, 0.413, 10.49, 0.261, 6.63, 0.272, 6.91, 0.804, 20.4, 0.3],
  ["1",      "1",     76,  5, 0.50, 0.654, 16.61, 0.385,  9.78, 0.261, 6.63, 0.272, 6.91, 0.765, 19.4, 0.3],
  ["2el",    "2el",   66,  5, 0.41, 0.656, 16.66, 0.382,  9.70, 0.240, 6.09, 0.250, 6.36, 0.760, 19.3, 0.4],
  ["2",      "2",     61,  4, 0.37, 0.601, 15.27, 0.352,  8.94, 0.239, 6.07, 0.250, 6.35, 0.709, 18.0, 0.3],
  ["3",      "3",     48,  3, 0.30, 0.535, 13.59, 0.318,  8.08, 0.219, 5.57, 0.229, 5.82, 0.626, 15.9, 0.3],
  ["4el",    "4el",   40,  3, 0.25, 0.538, 13.69, 0.308,  7.84, 0.199, 5.05, 0.209, 5.31, 0.621, 15.8, 0.3],
  ["4",      "4",     38,  3, 0.21, 0.480, 12.19, 0.284,  7.21, 0.199, 5.05, 0.209, 5.32, 0.563, 14.3, 0.3],
  ["5",      "5",     28,  2, 0.13, 0.366,  9.30, 0.244,  6.20, 0.184, 4.68, 0.193, 4.91, 0.437, 11.1, 0.4],
];

export const CAPSULE_SIZES: readonly CapsuleSize[] = ROWS.map((r) => ({
  id: r[0],
  label: r[1],
  europeOnly: r[0] === "0el-eu",
  weightMg: r[2],
  weightTolMg: r[3],
  volumeMl: r[4],
  bodyLengthIn: r[5],
  bodyLengthMm: r[6],
  capLengthIn: r[7],
  capLengthMm: r[8],
  bodyDiameterIn: r[9],
  bodyDiameterMm: r[10],
  capDiameterIn: r[11],
  capDiameterMm: r[12],
  closedLengthIn: r[13],
  closedLengthMm: r[14],
  closedTolMm: r[15],
  note:
    r[0] === "0el"
      ? "The brochure prints 0.909 in and 23.5 mm for this closed length; 0.909 in converts to 23.1 mm."
      : null,
}));

export function findCapsule(id: string): CapsuleSize {
  const c = CAPSULE_SIZES.find((s) => s.id === id);
  if (!c) throw new ToolError("bad-input", "Pick a capsule size from the list.");
  return c;
}

export const DENSITY_MIN = 0.1;
export const DENSITY_MAX = 2;

function checkDensity(density: number) {
  if (!Number.isFinite(density))
    throw new ToolError("bad-input", "Powder density must be a number.");
  if (density < DENSITY_MIN || density > DENSITY_MAX)
    throw new ToolError(
      "bad-input",
      `Enter a powder density between ${DENSITY_MIN} and ${DENSITY_MAX} g/ml. The brochure's own columns run from 0.6 to 1.2 g/ml.`,
    );
}

/** Theoretical fill in mg: volume (ml) x density (g/ml) x 1000. */
export function capacityMg(size: CapsuleSize, density: number): number {
  checkDensity(density);
  return size.volumeMl * density * 1000;
}

export interface SizeFinderResult {
  doseMg: number;
  density: number;
  /** Smallest size whose theoretical fill holds the dose, or null if even 000 is too small. */
  smallest: CapsuleSize | null;
  smallestCapacityMg: number | null;
  /** When nothing holds it: how many 000 capsules the dose would split into. */
  capsules000Needed: number | null;
  /** Every size that holds the dose, smallest first (Europe-only variant excluded). */
  fitting: readonly CapsuleSize[];
}

/** Sizes the finder considers, smallest volume first. */
const FINDER_ORDER = [...CAPSULE_SIZES]
  .filter((s) => !s.europeOnly)
  .sort((a, b) => a.volumeMl - b.volumeMl);

export function findSmallestSize(doseMg: number, density: number): SizeFinderResult {
  if (!Number.isFinite(doseMg))
    throw new ToolError("bad-input", "Fill per capsule must be a number.");
  if (doseMg <= 0)
    throw new ToolError("bad-input", "Fill per capsule must be more than zero.");
  if (doseMg > 100000)
    throw new ToolError(
      "bad-input",
      "That fill is over 100 g per capsule. Check the units — the field is in milligrams.",
    );
  checkDensity(density);

  // Compare in whole micro-units so 0.50 ml x 1.0 g/ml = 500 mg holds exactly 500 mg.
  const holds = (s: CapsuleSize) =>
    Math.round(s.volumeMl * density * 1e6) >= Math.round(doseMg * 1e3);
  const fitting = FINDER_ORDER.filter(holds);
  const smallest = fitting[0] ?? null;
  const big = FINDER_ORDER[FINDER_ORDER.length - 1];
  return {
    doseMg,
    density,
    smallest,
    smallestCapacityMg: smallest ? capacityMg(smallest, density) : null,
    capsules000Needed: smallest
      ? null
      : Math.ceil(doseMg / capacityMg(big, density) - 1e-9),
    fitting,
  };
}
