import type { Metadata } from "next";
import Link from "next/link";
import { blankMapGroups, blankMaps } from "@/config/blank-maps";
import facts from "@/data/blank-maps.json";

const ALL = facts as unknown as Record<string, { count: number }>;

export const metadata: Metadata = {
  title: `Free Printable Blank Maps: ${blankMaps.length} Maps in SVG, PNG & PDF`,
  description: `${blankMaps.length} free printable blank maps — the world, 6 continents, the United States, all 50 states and DC with counties, and ${blankMaps.filter((m) => m.kind === "country").length} countries with their regions. Blank, labeled, colored and with-cities versions.`,
  alternates: { canonical: "/maps/blank/" },
};

const short = (name: string) => name.replace(/^the /, "");

export default function BlankMapsIndex() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">Free printable blank maps</h1>
      <p className="mt-3 max-w-3xl text-lg text-[var(--color-muted)]">
        {blankMaps.length} outline maps drawn from public-domain boundary data. Each comes in four versions — blank, labeled, colored and with
        cities — and downloads as SVG, PNG or PDF. No watermark, no sign-up, no attribution required.
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <Link href="/maps/blank/world/" className="mt-8 block rounded-lg border border-[var(--color-line)] p-2 hover:border-[var(--color-accent)]">
        <img src="/maps/blank/world.svg" alt="Blank world map" width={2400} height={1237} className="h-auto w-full" />
      </Link>

      {blankMapGroups.map((g) => {
        const list = blankMaps.filter((m) => g.kinds.includes(m.kind));
        return (
          <section key={g.label} className="mt-10">
            <h2 className="text-2xl font-semibold tracking-tight">
              {g.label} <span className="text-base font-normal text-[var(--color-muted)]">({list.length})</span>
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((m) => (
                <li key={m.slug}>
                  <Link
                    href={`/maps/blank/${m.slug}/`}
                    className="flex items-baseline justify-between gap-2 rounded-md border border-[var(--color-line)] px-3 py-2 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                  >
                    <span className="font-medium">{m.kind === "world" ? "World" : short(m.name)}</span>
                    <span className="text-right text-xs text-[var(--color-muted)]">
                      {ALL[m.slug]?.count} {m.units}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">Where the maps come from</h2>
        <div className="prose-block mt-3 text-[var(--color-muted)]">
          <p>
            US state and county outlines are the US Census Bureau&rsquo;s 2024 cartographic boundary files; each state page lists every county
            with its Census land area and American Community Survey population. World, continent and country maps use Natural Earth, a
            public-domain dataset made for small-scale mapping. Each map page names its exact source files and notes where the boundaries
            differ from today&rsquo;s divisions.
          </p>
          <p>
            Every version of a map is the same drawing with labels, colours or cities added, so the borders line up exactly between them — print the
            blank one as a quiz and the labeled one as the key.
          </p>
        </div>
      </section>
    </div>
  );
}
