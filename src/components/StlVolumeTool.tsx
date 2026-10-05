"use client";

import { useState, useId } from "react";
import {
  LOC_STL_URL,
  MATERIALS,
  meshStats,
  parseStl,
  PRUSAMENT_ASA_URL,
  PRUSAMENT_PETG_URL,
  PRUSAMENT_PLA_URL,
  stlResult,
  ZHANG_CHEN_URL,
  type Mesh,
  type MeshStats,
  type StlResult,
  type StlUnit,
} from "@/lib/stl-volume";
import { isToolError } from "@/lib/errors";

const n = (x: number, d = 2) => x.toLocaleString("en-US", { maximumFractionDigits: d });

type Parsed = { name: string; mesh: Mesh; stats: MeshStats };

function ResultCard({ data, name, material }: { data: StlResult; name: string; material: string }) {
  const u = data.sizeUnit;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)]">
          {name} · {data.format} STL · {n(data.triangles, 0)} triangles
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{n(data.volumeCm3, 2)} cm³ solid volume</p>
        <p className="mt-1 text-[var(--color-muted)]">
          {n(data.volumeMm3, 0)} mm³ · {n(data.volumeIn3, 3)} in³ · {n(data.volumeCm3, 2)} ml. Solid weight in {material}: {n(data.grams, 1)} g (
          {n(data.ounces, 2)} oz).
        </p>
      </div>
      <div className="p-5 text-sm">
        {data.openEdges > 0 && (
          <div className="mb-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3">
            <p className="font-medium">The mesh is not closed ({n(data.openEdges, 0)} open or non-manifold edges)</p>
            <p className="mt-1 text-[var(--color-muted)]">
              Volume is only defined for a watertight surface. With holes, the figure above can be wrong by any amount. Repair the
              mesh in your modelling or slicing software and load it again.
            </p>
          </div>
        )}
        {data.invertedNormals && (
          <p className="mb-4 text-[var(--color-muted)]">
            The triangles are wound inside-out (the signed total was negative). The size of the volume is unaffected and is shown as a
            positive number.
          </p>
        )}
        <h3 className="mb-2 font-semibold tracking-wide uppercase">Size</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          Bounding box {n(data.size[0], 2)} × {n(data.size[1], 2)} × {n(data.size[2], 2)} {u} (X × Y × Z). The part fills{" "}
          {n((data.volumeCm3 / data.boxVolumeCm3) * 100, 1)}% of that box.
          {data.degenerate > 0 && ` ${n(data.degenerate, 0)} zero-area triangles were skipped in the closed-mesh check.`}
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          This is the solid volume, as if printed or cast at 100% fill. A 3D print with infill and walls uses less material, and a
          resin print adds supports; your slicer reports those. STL files carry no units — if the size looks 10 or 25.4 times off,
          change the unit.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Signed-tetrahedron volume (Zhang &amp; Chen, ICIP 2001). STL layout per the Library of Congress format description.
            Filament densities from Prusament technical data sheets (ISO 1183). Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={ZHANG_CHEN_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Zhang &amp; Chen 2001
            </a>{" "}
            ·{" "}
            <a href={LOC_STL_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Library of Congress: STL binary
            </a>{" "}
            ·{" "}
            <a href={PRUSAMENT_PLA_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              PLA
            </a>{" "}
            ·{" "}
            <a href={PRUSAMENT_PETG_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              PETG
            </a>{" "}
            ·{" "}
            <a href={PRUSAMENT_ASA_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              ASA
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function StlVolumeTool() {
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [reading, setReading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [unit, setUnit] = useState<StlUnit>("mm");
  const [mat, setMat] = useState(MATERIALS[0].id);
  const [custom, setCustom] = useState("1.1");
  const ids = { f: useId(), u: useId(), m: useId(), c: useId() };

  async function onFile(file: File | undefined) {
    if (!file) return;
    setReading(true);
    setFileError(null);
    setParsed(null);
    try {
      const mesh = parseStl(await file.arrayBuffer());
      setParsed({ name: file.name, mesh, stats: meshStats(mesh) });
    } catch (e) {
      setFileError(isToolError(e) ? e.message : "That file could not be read.");
    } finally {
      setReading(false);
    }
  }

  const chosen = MATERIALS.find((m) => m.id === mat);
  const density = chosen ? chosen.density : custom.trim() === "" ? NaN : Number(custom);
  const material = chosen ? chosen.label.split(" (")[0] : `your material (${custom} g/cm³)`;

  let data: StlResult | null = null;
  let error: string | null = fileError;
  if (parsed && !error) {
    try {
      data = stlResult(parsed.mesh, parsed.stats, unit, density);
    } catch (e) {
      error = isToolError(e) ? e.message : "That file could not be used.";
    }
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={ids.f} className="mb-1.5 block font-medium">
            STL file (binary or ASCII)
          </label>
          <input id={ids.f} type="file" accept=".stl,model/stl,application/sla" onChange={(e) => onFile(e.target.files?.[0])} className={field} />
        </div>
        <div>
          <label htmlFor={ids.u} className="mb-1.5 block font-medium">
            File units
          </label>
          <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as StlUnit)} className={field}>
            <option value="mm">millimetres (most 3D printing files)</option>
            <option value="cm">centimetres</option>
            <option value="in">inches</option>
          </select>
        </div>
        <div>
          <label htmlFor={ids.m} className="mb-1.5 block font-medium">
            Material (for weight)
          </label>
          <select id={ids.m} value={mat} onChange={(e) => setMat(e.target.value)} className={field}>
            {MATERIALS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
            <option value="custom">Other: enter density</option>
          </select>
          {mat === "custom" && (
            <div className="mt-2">
              <label htmlFor={ids.c} className="mb-1.5 block font-medium">
                Density (g/cm³) from your material&rsquo;s data sheet
              </label>
              <input id={ids.c} type="number" inputMode="decimal" min="0" step="any" value={custom} onChange={(e) => setCustom(e.target.value)} className={field} />
            </div>
          )}
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">The file is read in your browser and never uploaded.</p>
      <div aria-live="polite">
        {reading ? (
          <p className="text-sm text-[var(--color-muted)]">Reading the file…</p>
        ) : error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That file could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : data && parsed ? (
          <ResultCard data={data} name={parsed.name} material={material} />
        ) : (
          <p className="rounded-lg border border-dashed border-[var(--color-line)] p-5 text-sm text-[var(--color-muted)]">
            Choose an STL file to see its volume, size and weight.
          </p>
        )}
      </div>
    </div>
  );
}
