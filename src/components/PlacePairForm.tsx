"use client";

import { useId, useState } from "react";
import { geocodeAddress, parseCoordinates } from "@/lib/geocode";
import { asToolError } from "@/lib/errors";
import type { LatLon } from "@/lib/geodesy";

/** Two place inputs ("from" and "to") resolved through Photon, or pasted coordinates. */

export interface Place extends LatLon {
  label: string;
}

async function resolve(q: string): Promise<Place> {
  const c = parseCoordinates(q);
  if (c) return { ...c, label: `${c.lat}, ${c.lon}` };
  const hit = await geocodeAddress(q, { preferUS: false });
  return { lat: hit.lat, lon: hit.lon, label: hit.label };
}

interface Props {
  onResolve: (a: Place, b: Place) => void;
  labels?: [string, string];
  submitLabel: string;
  initial?: [string, string];
}

export default function PlacePairForm({ onResolve, labels = ["From", "To"], submitLabel, initial = ["", ""] }: Props) {
  const [a, setA] = useState(initial[0]);
  const [b, setB] = useState(initial[1]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ida = useId();
  const idb = useId();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!a.trim() || !b.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const [pa, pb] = await Promise.all([
        resolve(a).catch((err) => Promise.reject(new Error(`${labels[0]}: ${asToolError(err).message}`))),
        resolve(b).catch((err) => Promise.reject(new Error(`${labels[1]}: ${asToolError(err).message}`))),
      ]);
      onResolve(pa, pb);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  return (
    <form onSubmit={submit} className="mb-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ida} className="mb-1.5 block font-medium">
            {labels[0]}
          </label>
          <input id={ida} type="text" value={a} onChange={(e) => setA(e.target.value)} placeholder="City, address or lat, lon" className={field} />
        </div>
        <div>
          <label htmlFor={idb} className="mb-1.5 block font-medium">
            {labels[1]}
          </label>
          <input id={idb} type="text" value={b} onChange={(e) => setB(e.target.value)} placeholder="City, address or lat, lon" className={field} />
        </div>
      </div>
      <button
        type="submit"
        disabled={busy || !a.trim() || !b.trim()}
        className="mt-3 w-full rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white disabled:opacity-50 sm:w-auto"
      >
        {busy ? "Finding both places…" : submitLabel}
      </button>
      {error && (
        <div className="mt-3 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3 text-sm" role="alert">
          {error}
        </div>
      )}
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        Place names are looked up with the Photon geocoder (OpenStreetMap). Check the matched names on the result — a short name like
        &ldquo;Springfield&rdquo; can match a different place than you meant; add the state or country if so.
      </p>
    </form>
  );
}
