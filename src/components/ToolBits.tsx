"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Ext } from "./GeoBits";
import { FOSSGIS_ABOUT_URL, OSRM_DOCS_URL, PROFILE_LABEL, type Profile } from "@/lib/routing";

/** Small pieces shared by the map tools (client side). */

export function Tabs<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: readonly (readonly [T, string])[] }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2" role="group">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={`rounded-md border px-4 py-2 text-sm font-medium ${value === v ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : "border-[var(--color-line)] bg-white"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function ProfileSelect({ value, onChange }: { value: Profile; onChange: (p: Profile) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-medium">Travel by</span>
      <select className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5" value={value} onChange={(e) => onChange(e.target.value as Profile)}>
        {(Object.keys(PROFILE_LABEL) as Profile[]).map((p) => (
          <option key={p} value={p}>
            {PROFILE_LABEL[p]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function RoutingCredit({ extra }: { extra?: ReactNode }) {
  return (
    <>
      Road routes: OSRM on the FOSSGIS servers (<Ext href={FOSSGIS_ABOUT_URL}>routing.openstreetmap.de</Ext>, <Ext href={OSRM_DOCS_URL}>OSRM API</Ext>) over OpenStreetMap roads;
      times assume typical speeds for each road type and no traffic. <Ext href="https://www.openstreetmap.org/fixthemap">Report a map issue</Ext>.{extra}
    </>
  );
}

export function Btn({ children, onClick, disabled, primary }: { children: ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={primary ? "rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50" : "rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-sm disabled:opacity-50"}
    >
      {children}
    </button>
  );
}

/**
 * False during the static build and the first client render, true after mount. Tools that show
 * "now" (clocks, today's sky) render only once mounted, so the page HTML built at deploy time
 * never disagrees with the visitor's clock.
 */
export function useMounted(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
