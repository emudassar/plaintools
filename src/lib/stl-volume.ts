import { ToolError } from "./errors";

/**
 * Volume of a triangle mesh in an STL file, worked out in the browser.
 *
 * Method: Cha Zhang & Tsuhan Chen, "Efficient feature extraction for 2D/3D
 * objects in mesh representation", Proc. ICIP 2001, vol. III, pp. 935-938.
 * Each triangle and the origin form a tetrahedron with signed volume
 * v1 . (v2 x v3) / 6; summed over a closed mesh the signs cancel everything
 * outside the solid and the total is its volume.
 *
 * STL formats (binary: 80-byte header, uint32 triangle count, 50 bytes per
 * triangle, little-endian float32; ASCII: "facet ... vertex x y z") as in the
 * Library of Congress format description.
 *
 * Filament densities: Prusament technical data sheets (ISO 1183), retrieved
 * 2026-10-05: PLA 1.24, PETG 1.27, ASA 1.07 g/cm3.
 */

export const STL_RETRIEVED = "2026-10-05";
export const ZHANG_CHEN_URL = "http://chenlab.ece.cornell.edu/Publication/Cha/icip01_Cha.pdf";
export const LOC_STL_URL = "https://www.loc.gov/preservation/digital/formats/fdd/fdd000505.shtml";
export const PRUSAMENT_PLA_URL = "https://prusament.com/wp-content/uploads/2022/10/PLA_Prusament_TDS_2021_10_EN.pdf";
export const PRUSAMENT_PETG_URL = "https://prusament.com/wp-content/uploads/2022/10/PETG_Prusament_TDS_2021_10_EN.pdf";
export const PRUSAMENT_ASA_URL = "https://prusament.com/wp-content/uploads/2022/10/ASA_Prusament_TDS_2022_16_EN.pdf";

export interface Material {
  id: string;
  label: string;
  density: number;
}

export const MATERIALS: Material[] = [
  { id: "pla", label: "PLA (Prusament TDS) 1.24 g/cm³", density: 1.24 },
  { id: "petg", label: "PETG (Prusament TDS) 1.27 g/cm³", density: 1.27 },
  { id: "asa", label: "ASA (Prusament TDS) 1.07 g/cm³", density: 1.07 },
];

export type StlUnit = "mm" | "cm" | "in";
/** Cubic centimetres per cubic file unit. */
const CM3_PER: Record<StlUnit, number> = { mm: 0.001, cm: 1, in: 16.387064 };
const CM_PER: Record<StlUnit, number> = { mm: 0.1, cm: 1, in: 2.54 };

export interface Mesh {
  format: "binary" | "ascii";
  /** Flat array of x,y,z for each of the 3 vertices of each triangle. */
  coords: Float64Array;
  triangles: number;
}

const MAX_TRIANGLES = 10_000_000;

export function parseStl(buf: ArrayBuffer): Mesh {
  const size = buf.byteLength;
  if (size === 0) throw new ToolError("bad-input", "That file is empty.");
  if (size >= 84) {
    const dv = new DataView(buf);
    const n = dv.getUint32(80, true);
    if (n > 0 && 84 + n * 50 === size) {
      if (n > MAX_TRIANGLES) throw new ToolError("bad-input", "That mesh has over 10 million triangles, too many to process in a browser.");
      const coords = new Float64Array(n * 9);
      for (let t = 0; t < n; t++) {
        const o = 84 + t * 50 + 12; // skip the normal
        for (let k = 0; k < 9; k++) coords[t * 9 + k] = dv.getFloat32(o + k * 4, true);
      }
      return { format: "binary", coords, triangles: n };
    }
  }
  const head = new TextDecoder().decode(new Uint8Array(buf, 0, Math.min(size, 512)));
  if (!/^\s*solid/i.test(head)) {
    throw new ToolError("bad-input", "This does not look like an STL file: it is neither a valid binary STL (size does not match its triangle count) nor ASCII STL (does not start with 'solid').");
  }
  const text = new TextDecoder().decode(buf);
  const re = /vertex\s+(\S+)\s+(\S+)\s+(\S+)/gi;
  const vals: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const x = Number(m[1]), y = Number(m[2]), z = Number(m[3]);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z))
      throw new ToolError("bad-input", "The file has a vertex that is not a number.");
    vals.push(x, y, z);
  }
  if (vals.length === 0) throw new ToolError("no-data", "The file starts like an ASCII STL but contains no triangles.");
  if (vals.length % 9 !== 0) throw new ToolError("bad-input", "The ASCII STL has a facet without exactly three vertices.");
  return { format: "ascii", coords: Float64Array.from(vals), triangles: vals.length / 9 };
}

export interface MeshStats {
  /** Signed sum in cubic file units; negative means the normals face inward. */
  signedVolume: number;
  min: [number, number, number];
  max: [number, number, number];
  /** Edges not shared by exactly two triangles. 0 = closed (watertight) mesh. */
  openEdges: number;
  degenerate: number;
}

export function meshStats(mesh: Mesh): MeshStats {
  const c = mesh.coords;
  let vol = 0;
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  const vIndex = new Map<string, number>();
  const edges = new Map<number, number>();
  let degenerate = 0;
  const vid = (i: number) => {
    const key = `${c[i]},${c[i + 1]},${c[i + 2]}`;
    let id = vIndex.get(key);
    if (id === undefined) {
      id = vIndex.size;
      vIndex.set(key, id);
    }
    return id;
  };
  const addEdge = (a: number, b: number) => {
    const lo = Math.min(a, b), hi = Math.max(a, b);
    const k = lo * 2 ** 26 + hi;
    edges.set(k, (edges.get(k) ?? 0) + 1);
  };
  for (let t = 0; t < mesh.triangles; t++) {
    const i = t * 9;
    const [x1, y1, z1, x2, y2, z2, x3, y3, z3] = [c[i], c[i + 1], c[i + 2], c[i + 3], c[i + 4], c[i + 5], c[i + 6], c[i + 7], c[i + 8]];
    vol += (x1 * (y2 * z3 - z2 * y3) - y1 * (x2 * z3 - z2 * x3) + z1 * (x2 * y3 - y2 * x3)) / 6;
    for (let k = 0; k < 9; k++) {
      const a = k % 3;
      if (c[i + k] < min[a]) min[a] = c[i + k];
      if (c[i + k] > max[a]) max[a] = c[i + k];
    }
    const a = vid(i), b = vid(i + 3), d = vid(i + 6);
    if (a === b || b === d || a === d) {
      degenerate++;
      continue;
    }
    addEdge(a, b);
    addEdge(b, d);
    addEdge(d, a);
  }
  let open = 0;
  for (const count of edges.values()) if (count !== 2) open++;
  return { signedVolume: vol, min, max, openEdges: open, degenerate };
}

export interface StlResult {
  format: "binary" | "ascii";
  triangles: number;
  volumeCm3: number;
  volumeMm3: number;
  volumeIn3: number;
  size: [number, number, number];
  sizeUnit: StlUnit;
  sizeCm: [number, number, number];
  boxVolumeCm3: number;
  grams: number;
  ounces: number;
  invertedNormals: boolean;
  openEdges: number;
  degenerate: number;
  retrievedAt: string;
}

export function stlResult(mesh: Mesh, stats: MeshStats, unit: StlUnit, density: number): StlResult {
  if (!Number.isFinite(density) || density <= 0 || density > 25)
    throw new ToolError("bad-input", "Density must be a number between 0 and 25 g/cm³.");
  const volumeCm3 = Math.abs(stats.signedVolume) * CM3_PER[unit];
  if (volumeCm3 === 0) throw new ToolError("no-data", "The mesh encloses no volume: it may be a flat surface or a single sheet.");
  const size = [0, 1, 2].map((a) => stats.max[a] - stats.min[a]) as [number, number, number];
  const sizeCm = size.map((s) => s * CM_PER[unit]) as [number, number, number];
  const grams = volumeCm3 * density;
  return {
    format: mesh.format,
    triangles: mesh.triangles,
    volumeCm3,
    volumeMm3: volumeCm3 * 1000,
    volumeIn3: volumeCm3 / 16.387064,
    size,
    sizeUnit: unit,
    sizeCm,
    boxVolumeCm3: sizeCm[0] * sizeCm[1] * sizeCm[2],
    grams,
    ounces: grams / 28.349523125,
    invertedNormals: stats.signedVolume < 0,
    openEdges: stats.openEdges,
    degenerate: stats.degenerate,
    retrievedAt: STL_RETRIEVED,
  };
}
