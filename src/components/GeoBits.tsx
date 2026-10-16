import type { ReactNode } from "react";
import { formatLatLon, toDms, type LatLon } from "@/lib/geodesy";

/** Small pieces shared by the location tools. Server-safe (no hooks). */

export const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
export const n0 = (x: number) => Math.round(x).toLocaleString("en-US");

/** "1,234.5 mi · 1,987.0 km" */
export function fmtMiKm(m: number, d = 1): string {
  return `${n(m / 1609.344, d)} mi · ${n(m / 1000, d)} km`;
}

export function fmtDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
      {children}
    </a>
  );
}

export function CoordRows({ p }: { p: LatLon }) {
  return (
    <>
      <tr>
        <td className="px-3 py-2 font-medium">Decimal degrees</td>
        <td className="px-3 py-2 font-mono text-xs sm:text-sm">
          {p.lat.toFixed(6)}, {p.lon.toFixed(6)}
        </td>
      </tr>
      <tr>
        <td className="px-3 py-2 font-medium">Degrees, minutes, seconds</td>
        <td className="px-3 py-2">
          {toDms(p.lat, true)}, {toDms(p.lon, false)}
        </td>
      </tr>
    </>
  );
}

export function Headline({ kicker, title, sub }: { kicker: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
      <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">{kicker}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{title}</p>
      {sub && <p className="mt-1 text-[var(--color-muted)]">{sub}</p>}
    </div>
  );
}

export function Warn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4">
      <h3 className="font-medium">{title}</h3>
      <div className="mt-1 text-sm text-[var(--color-muted)]">{children}</div>
    </div>
  );
}

export function ErrorBox({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5" role="alert">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 rounded-md border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-medium">
          Try again
        </button>
      )}
    </div>
  );
}

export function Loading({ note }: { note: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)] p-5">
      <p className="font-medium">Looking this up…</p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{note}</p>
    </div>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-[var(--color-line)]">{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ k, children }: { k: string; children: ReactNode }) {
  return (
    <tr>
      <td className="px-3 py-2 font-medium">{k}</td>
      <td className="px-3 py-2">{children}</td>
    </tr>
  );
}

export function where(p: LatLon & { label?: string }, source: string): string {
  return source === "device" ? `Your device location (${formatLatLon(p, 4)})` : (p.label ?? formatLatLon(p, 4));
}
