"use client";

import { useId, useState } from "react";
import { geocodeAddress, parseCoordinates } from "@/lib/geocode";
import { asToolError } from "@/lib/errors";

/**
 * One location input for every location tool: the device's own position
 * (browser Geolocation API, asked only when the button is pressed) or a typed
 * address / pasted coordinates (Photon geocoder).
 */

export interface PickedLocation {
  lat: number;
  lon: number;
  /** What the user typed, the geocoder's label, or "Your device location". */
  label: string;
  source: "device" | "search" | "coordinates" | "map";
  /** Device only: 95% accuracy radius in metres reported by the browser. */
  accuracyM?: number | null;
  /** Device only: metres above the WGS84 ellipsoid (W3C Geolocation), often absent. */
  altitudeM?: number | null;
  altitudeAccuracyM?: number | null;
}

interface Props {
  onPick: (loc: PickedLocation) => void;
  /** false for worldwide tools (do not bias ambiguous searches to the US). */
  preferUS?: boolean;
  deviceLabel?: string;
  searchLabel?: string;
  placeholder?: string;
  busy?: boolean;
  /** Field label for the text input. */
  label?: string;
}

const GEO_ERRORS: Record<number, string> = {
  1: "Location permission was denied. Allow location for this site in your browser settings, or type an address instead.",
  2: "Your device could not determine its position. Try again outdoors or near a window, or type an address instead.",
  3: "Finding your position took too long. Try again, or type an address instead.",
};

export default function LocationPicker({
  onPick,
  preferUS = true,
  deviceLabel = "Use my current location",
  searchLabel = "Look up",
  placeholder = "Address, city or postcode — or 40.7484, -73.9857",
  busy = false,
  label = "Or enter an address, place or coordinates",
}: Props) {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<"idle" | "locating" | "searching">("idle");
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const working = busy || phase !== "idle";

  function locate() {
    setError(null);
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setError("This browser does not offer location access. Type an address instead.");
      return;
    }
    setPhase("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPhase("idle");
        onPick({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          label: "Your device location",
          source: "device",
          accuracyM: Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : null,
          altitudeM: pos.coords.altitude ?? null,
          altitudeAccuracyM: pos.coords.altitudeAccuracy ?? null,
        });
      },
      (err) => {
        setPhase("idle");
        setError(GEO_ERRORS[err.code] ?? "Your location could not be read. Type an address instead.");
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  }

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setError(null);
    const coords = parseCoordinates(q);
    if (coords) {
      onPick({ ...coords, label: `${coords.lat}, ${coords.lon}`, source: "coordinates" });
      return;
    }
    setPhase("searching");
    try {
      const hit = await geocodeAddress(q, { preferUS });
      onPick({ lat: hit.lat, lon: hit.lon, label: hit.label, source: "search" });
    } catch (err) {
      setError(asToolError(err).message);
    } finally {
      setPhase("idle");
    }
  }

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={locate}
        disabled={working}
        className="w-full rounded-md bg-[var(--color-accent)] px-5 py-3 font-medium text-white disabled:opacity-50 sm:w-auto"
      >
        {phase === "locating" ? "Finding your position…" : deviceLabel}
      </button>
      <form onSubmit={search} className="mt-4">
        <label htmlFor={id} className="mb-1.5 block font-medium">
          {label}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={id}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5"
          />
          <button
            type="submit"
            disabled={working || query.trim().length === 0}
            className="shrink-0 rounded-md border border-[var(--color-line)] bg-white px-5 py-2.5 font-medium disabled:opacity-50"
          >
            {phase === "searching" ? "Searching…" : searchLabel}
          </button>
        </div>
      </form>
      {error && (
        <div className="mt-3 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3 text-sm" role="alert">
          {error}
        </div>
      )}
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        Your browser asks before sharing your position. Coordinates and typed text are sent only to the lookup services named on the
        result; this site stores nothing.
      </p>
    </div>
  );
}
