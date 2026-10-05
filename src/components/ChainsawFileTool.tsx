"use client";

import { useState, useId } from "react";
import {
  CHAIN_ROWS,
  CHAINSAW_RETRIEVED,
  DRIVE_LINKS,
  OREGON_CHART_URL,
  OREGON_MANUAL_URL,
  PITCHES,
  STIHL_FILES,
  STIHL_FILES_URL,
  fileSizes,
  pitchLabel,
  pitchOfNumber,
  rowsFor,
  type ChainKey,
  type ChainRow,
  type FileSize,
  type PitchId,
} from "@/lib/chainsaw-file";
import { isToolError } from "@/lib/errors";

/** Pick a pitch or the drive-link number, then the chain type. A table lookup — no loading state. */

const mm = (f: FileSize) => `${f.mm.toFixed(2)} mm`;
const deg = (n: number | null) => (n === null ? "—" : `${n}°`);
const depth = (n: number) => `${n.toFixed(3).replace(/^0/, "")}″`;
const fileText = (f: FileSize) => (f.label.endsWith("mm") ? f.label : `${f.label} (${mm(f)})`);

function parseKey(value: string): ChainKey {
  return value.startsWith("n:")
    ? { by: "number", number: Number(value.slice(2)) }
    : { by: "pitch", pitch: value.slice(2) as PitchId };
}

function Sources() {
  return (
    <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
      <p>
        Source: Oregon saw chain catalog page FOR 149, &ldquo;Filing Angles&rdquo; and
        &ldquo;Grinding Angles&rdquo;; drive-link numbers from the Oregon Maintenance and
        Safety Manual. STIHL figures from STIHL&rsquo;s saw chain files page. Retrieved{" "}
        {CHAINSAW_RETRIEVED}.
      </p>
      <p className="mt-1 space-x-3">
        <a href={OREGON_CHART_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
          Oregon filing chart (PDF)
        </a>
        <a href={OREGON_MANUAL_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
          Oregon manual (PDF)
        </a>
        <a href={STIHL_FILES_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
          STIHL saw chain files
        </a>
      </p>
    </footer>
  );
}

function ResultCard({ row, rows }: { row: ChainRow; rows: readonly ChainRow[] }) {
  const stihl = STIHL_FILES[row.pitch];
  const others = fileSizes(rows).filter((f) => f.label !== row.file?.label);

  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Oregon {row.chains} · {pitchLabel(row.pitch)} pitch
        </p>
        {row.file ? (
          <>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {fileText(row.file)} round file
            </p>
            <p className="mt-1 text-[var(--color-muted)]">
              Oregon&rsquo;s chart: {row.filing.top}° top-plate angle, {row.filing.down}° down
              angle, depth gauge {depth(row.filing.depth)} below the cutters.
              {others.length > 0 &&
                ` Other chains of this pitch in the chart use ${others.map(fileText).join(" or ")}.`}
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              Square-ground chisel chain — no round file size
            </p>
            <p className="mt-1 text-[var(--color-muted)]">
              Oregon&rsquo;s chart prints no round file for this chain. Its footnote says a
              15° cutting edge results when the file is held at a 45° top-plate angle and
              45° down angle. Depth-gauge setting {depth(row.filing.depth)}.
            </p>
          </>
        )}
      </div>
      <div className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[var(--color-muted)]">
              <tr>
                <th className="py-1 pr-3 font-medium"></th>
                <th className="py-1 pr-3 font-medium">File / wheel</th>
                <th className="py-1 pr-3 font-medium">Top plate</th>
                <th className="py-1 pr-3 font-medium">Down</th>
                <th className="py-1 pr-3 font-medium">Side plate</th>
                <th className="py-1 font-medium">Depth gauge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              <tr>
                <td className="py-1.5 pr-3 font-medium">Hand filing</td>
                <td className="py-1.5 pr-3">{row.file ? row.file.label : "Square file"}</td>
                <td className="py-1.5 pr-3">{deg(row.filing.top)}</td>
                <td className="py-1.5 pr-3">{deg(row.filing.down)}</td>
                <td className="py-1.5 pr-3">{deg(row.filing.side)}</td>
                <td className="py-1.5">{depth(row.filing.depth)}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3 font-medium">Grinder</td>
                <td className="py-1.5 pr-3">{row.wheel ? `${row.wheel.label} wheel` : "—"}</td>
                <td className="py-1.5 pr-3">{deg(row.grinding.top)}</td>
                <td className="py-1.5 pr-3">{deg(row.grinding.down)}</td>
                <td className="py-1.5 pr-3">{deg(row.grinding.side)}</td>
                <td className="py-1.5">{depth(row.grinding.depth)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-5 mb-2 text-sm font-semibold tracking-wide uppercase">
          If your chain is STIHL, not Oregon
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          {stihl
            ? `STIHL lists a ${fileText(stihl.file)} file for its own ${stihl.chains} chain of this pitch${
                row.file && stihl.file.label !== row.file.label ? " — a different size from Oregon's" : ""
              }. Use the chain maker's figure.`
            : "STIHL's saw chain files page lists no file for this pitch. Use the figure printed on your chain's packaging or in its maker's guide."}
        </p>

        <h3 className="mt-5 mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          These are the maker&rsquo;s published specifications, not a judgement of your
          chain&rsquo;s condition. Damaged cutters, worn depth gauges or a chain from a
          different maker can need different treatment — the chain maker&rsquo;s own
          instructions apply.
        </p>
        <Sources />
      </div>
    </div>
  );
}

export default function ChainsawFileTool() {
  const [choice, setChoice] = useState("n:72");
  const [rowIndex, setRowIndex] = useState(0);
  const chooseId = useId();
  const rowId = useId();

  let rows: readonly ChainRow[] = [];
  let error: { kind: string; message: string } | null = null;
  try {
    rows = rowsFor(parseKey(choice));
  } catch (e) {
    error = isToolError(e) ? { kind: e.kind, message: e.message } : { kind: "unavailable", message: String(e) };
  }
  const row = rows[Math.min(rowIndex, rows.length - 1)];
  const key = parseKey(choice);
  const highlightPitch = key.by === "pitch" ? key.pitch : pitchOfNumber(key.number);

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={chooseId} className="mb-1.5 block font-medium">
            Chain pitch, or the number on the drive link
          </label>
          <select
            id={chooseId}
            value={choice}
            onChange={(e) => {
              setChoice(e.target.value);
              setRowIndex(0);
            }}
            className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5"
          >
            <optgroup label="Number stamped on the drive link">
              {DRIVE_LINKS.map((d) => (
                <option key={d.number} value={`n:${d.number}`}>
                  {d.number} — {d.pitch}
                  {d.gauge ? `, ${d.gauge} gauge` : ""}
                </option>
              ))}
            </optgroup>
            <optgroup label="Chain pitch">
              {PITCHES.map((p) => (
                <option key={p.id} value={`p:${p.id}`}>
                  {p.label} pitch
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <div>
          <label htmlFor={rowId} className="mb-1.5 block font-medium">
            Oregon chain type
          </label>
          <select
            id={rowId}
            value={Math.min(rowIndex, Math.max(rows.length - 1, 0))}
            onChange={(e) => setRowIndex(Number(e.target.value))}
            disabled={rows.length === 0}
            className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5 disabled:opacity-50"
          >
            {rows.map((r, i) => (
              <option key={r.chains} value={i}>
                {r.chains}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="-mt-4 mb-6 text-xs text-[var(--color-muted)]">
        The answer updates as you choose. Nothing is sent anywhere. Not sure of the chain
        type? The file size is the same for every round-ground chain of a pitch, except the
        90PX/90SG low-profile chain.
      </p>

      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-line)] p-5">
            <p className="font-medium">{error.kind === "no-data" ? "Not in Oregon's current chart" : "Check your choice"}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error.message}</p>
            {error.kind === "no-data" && (
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                The full chart below lists the file sizes Oregon does publish for each pitch —
                for other chains, not yours. Check your chain&rsquo;s packaging or its maker&rsquo;s
                guide for its own figure.
              </p>
            )}
            <Sources />
          </div>
        ) : (
          row && <ResultCard row={row} rows={rows} />
        )}
      </div>

      <h3 className="mt-6 mb-2 text-sm font-semibold tracking-wide uppercase">
        Full Oregon chainsaw file size chart
      </h3>
      <div className="overflow-x-auto rounded-md border border-[var(--color-line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-accent-soft)] text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Pitch</th>
              <th className="px-3 py-2 font-medium">Oregon chain</th>
              <th className="px-3 py-2 font-medium">File</th>
              <th className="px-3 py-2 font-medium">Top plate</th>
              <th className="px-3 py-2 font-medium">Down</th>
              <th className="px-3 py-2 font-medium">Side plate</th>
              <th className="px-3 py-2 font-medium">Depth gauge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {CHAIN_ROWS.map((r) => (
              <tr
                key={r.chains}
                className={
                  r === row ? "bg-[var(--color-accent-soft)] font-medium" : r.pitch === highlightPitch && !error ? "bg-[var(--color-accent-soft)]/40" : ""
                }
              >
                <td className="px-3 py-1.5 whitespace-nowrap">{pitchLabel(r.pitch)}</td>
                <td className="px-3 py-1.5">{r.chains}</td>
                <td className="px-3 py-1.5 whitespace-nowrap">{r.file ? fileText(r.file) : "Square file"}</td>
                <td className="px-3 py-1.5">{deg(r.filing.top)}</td>
                <td className="px-3 py-1.5">{deg(r.filing.down)}</td>
                <td className="px-3 py-1.5">{deg(r.filing.side)}</td>
                <td className="px-3 py-1.5">{depth(r.filing.depth)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
