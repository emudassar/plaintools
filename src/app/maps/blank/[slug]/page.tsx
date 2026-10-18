import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlankMapViewer from "@/components/BlankMapViewer";
import { blankMapBySlug, blankMaps, type BlankMap } from "@/config/blank-maps";
import { absoluteUrl } from "@/config/site";
import facts from "@/data/blank-maps.json";

/**
 * One printable blank map. Everything specific on the page — the unit list, the
 * areas and populations, the cities — comes from the generated facts file, which
 * is read from the same boundary and Census files the map was drawn from.
 */

interface Row {
  id: string;
  name: string;
  full?: string | null;
  landKm2?: number | null;
  areaKm2?: number | null;
  pop?: number | null;
  popYear?: number | null;
  income?: number | null;
  type?: string | null;
}
interface Facts {
  slug: string;
  width: number;
  height: number;
  count: number;
  rows: Row[];
  cities: { name: string; pop: number; capital: boolean }[];
  projection: string;
}

const ALL = facts as unknown as Record<string, Facts>;
const KM2_PER_MI2 = 2.589988110336;

const n0 = (x: number) => Math.round(x).toLocaleString("en-US");
const usd = (x: number) => x.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const dynamicParams = false;

export function generateStaticParams() {
  return blankMaps.map((m) => ({ slug: m.slug }));
}

function titleName(m: BlankMap): string {
  return m.name.replace(/^the /, "");
}

function h1(m: BlankMap): string {
  const n = titleName(m);
  if (m.kind === "us-state") return `Blank Map of ${n} (${m.slug === "district-of-columbia" ? "Outline" : "Counties"})`;
  if (m.kind === "world") return "Blank World Map";
  return `Blank Map of ${n}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = blankMapBySlug(slug);
  const f = ALL[slug];
  if (!m || !f) return {};
  const n = titleName(m);
  const what = m.kind === "us-state" && f.count > 1 ? `All ${f.count} ${capital(m.units)}` : `${f.count} ${capital(m.units)}`;
  return {
    title: `${h1(m)}: ${what}, Printable PDF, PNG & SVG`,
    description: `Free printable blank map of ${m.name} with ${f.count} ${m.units}. Blank, labeled, colored and with-cities versions; download as SVG, PNG or PDF (Letter, A4, A3). No watermark, no sign-up.`.replace(
      `map of ${m.name}`,
      m.kind === "world" ? "world map" : `map of ${n}`,
    ),
    alternates: { canonical: `/maps/blank/${slug}/` },
  };
}

function capital(s: string): string {
  return s.replace(/\b[a-z]/g, (c) => c.toUpperCase()).replace(/\bAnd\b/g, "and").replace(/\bOf\b/g, "of");
}

function sourceFor(m: BlankMap): { label: string; href: string; detail: string }[] {
  if (m.kind === "us" || m.kind === "us-state") {
    return [
      {
        label: "US Census Bureau, 2024 Cartographic Boundary Files",
        href: "https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html",
        detail: m.kind === "us" ? "states, 1:5,000,000 (cb_2024_us_state_5m)" : "counties, 1:500,000 (cb_2024_us_county_500k)",
      },
      {
        label: "American Community Survey 2019–2023 5-year estimates",
        href: "https://www.census.gov/programs-surveys/acs/data/summary-file.html",
        detail: "population (table B01003) and median household income (B19013), table-based summary file",
      },
      {
        label: "Census Gazetteer Files 2024",
        href: "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html",
        detail: "city locations for the with-cities version",
      },
    ];
  }
  const ne = [
    {
      label: m.kind === "country" ? "Natural Earth 1:10m Admin 1 – States, Provinces" : "Natural Earth 1:50m Admin 0 – Countries",
      href: m.kind === "country" ? "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/" : "https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/",
      detail: "public-domain boundaries, version 5.1",
    },
    {
      label: "Natural Earth 1:10m Populated Places",
      href: "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/",
      detail: "city locations and the population figures used to pick them",
    },
  ];
  return ne;
}

export default async function BlankMapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = blankMapBySlug(slug);
  const f = ALL[slug];
  if (!m || !f) notFound();

  const n = titleName(m);
  const isUS = m.kind === "us" || m.kind === "us-state";
  const isWorldish = m.kind === "world" || m.kind === "continent";
  const rows = f.rows;
  const unitWord = capital(m.unit);

  const areaOf = (r: Row) => (isUS ? (r.landKm2 ?? null) : (r.areaKm2 ?? null));
  const withArea = rows.filter((r) => areaOf(r) != null);
  const totalArea = withArea.reduce((s, r) => s + (areaOf(r) ?? 0), 0);
  const largest = [...withArea].sort((a, b) => (areaOf(b) ?? 0) - (areaOf(a) ?? 0))[0];
  const smallest = [...withArea].sort((a, b) => (areaOf(a) ?? 0) - (areaOf(b) ?? 0))[0];
  const withPop = rows.filter((r) => r.pop != null);
  const totalPop = withPop.reduce((s, r) => s + (r.pop ?? 0), 0);
  const mostPop = [...withPop].sort((a, b) => (b.pop ?? 0) - (a.pop ?? 0))[0];
  const popYear = isWorldish ? withPop.find((r) => r.popYear)?.popYear : null;

  const faqs = [
    {
      question: `How many ${m.units} are on this map of ${n}?`,
      answer: `${f.count}. ${m.kind === "country" ? `That is the number of shapes after the grouping described under "About the boundaries"; ` : ""}every one of them is listed in the table on this page${m.note ? `. ${m.note}` : "."}`,
    },
    {
      question: "Can I use these maps for free, including commercially?",
      answer:
        "Yes. The maps are drawn from public-domain boundary data (" +
        (isUS ? "US Census Bureau" : "Natural Earth") +
        ") and this site adds no restrictions: use them in worksheets, slides, videos, products and print without attribution.",
    },
    {
      question: "Which file should I download for printing?",
      answer:
        "The PDF, sized for your paper. It holds a 200 dpi image scaled to fit inside a half-inch margin and turns landscape automatically for wide maps. The SVG is vector and prints sharp at any size from a design program.",
    },
    {
      question: "Do the four versions line up with each other?",
      answer:
        "Yes. The labeled, colored and with-cities versions are the blank SVG with labels, fills or city markers added on top, so the borders are identical. Print the blank one as a quiz and the labeled one as the answer key.",
    },
    {
      question: "Why are some labels shortened?",
      answer: `Labels are sized to fit inside each ${m.unit}. Where a name cannot fit even at the smallest readable size it is shortened with an ellipsis${isUS || m.kind === "country" ? " or replaced by its abbreviation" : ""}. The full names are in the table below the map.`,
    },
    {
      question: "How accurate are the borders?",
      answer: isUS
        ? `They come from the Census Bureau's 2024 cartographic boundary file, generalised for mapping, then simplified to suit a ${f.width} × ${f.height} pixel drawing. They are right for printing and teaching but are not survey-grade lines and must not be used to settle a boundary question.`
        : `They come from Natural Earth, a public-domain dataset made for small-scale maps, simplified further to suit a ${f.width} × ${f.height} pixel drawing. Where borders are disputed, Natural Earth shows the line it considers in de facto use, which may differ from a particular government's position.`,
    },
  ];

  const crumbs = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.answer } })) };
  const image = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: h1(m),
    contentUrl: absoluteUrl(`/maps/blank/${slug}.svg`),
    encodingFormat: "image/svg+xml",
    width: f.width,
    height: f.height,
    license: "https://creativecommons.org/publicdomain/zero/1.0/",
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(image) }} />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-[var(--color-muted)]">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / {" "}
        <Link href="/maps/blank/" className="hover:underline">
          Blank maps
        </Link>
      </nav>
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{h1(m)}</h1>
        <p className="mt-3 text-lg text-[var(--color-muted)]">
          Printable map of {m.kind === "world" ? "the world" : n} with {f.count === 1 ? `its ${m.unit}` : `all ${f.count} ${m.units}`}, in four versions —
          blank, labeled, colored and with cities. Download as SVG, PNG or PDF. Public-domain data, no watermark.
        </p>
      </header>

      <BlankMapViewer slug={slug} name={m.kind === "world" ? "the world" : n} width={f.width} height={f.height} />

      {m.note && (
        <div className="mt-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4 text-sm">
          <strong className="font-medium">About this map:</strong> {m.note}
        </div>
      )}

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">{n} at a glance</h2>
        <div className="overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-[var(--color-line)]">
              <tr>
                <td className="px-3 py-2 font-medium">{capital(m.units)} on the map</td>
                <td className="px-3 py-2">{f.count}</td>
              </tr>
              {totalArea > 0 && (
                <tr>
                  <td className="px-3 py-2 font-medium">{isUS ? "Land area (sum of the shapes)" : "Area of the shapes drawn"}</td>
                  <td className="px-3 py-2">
                    {n0(totalArea)} km² · {n0(totalArea / KM2_PER_MI2)} mi²
                  </td>
                </tr>
              )}
              {largest && f.count > 1 && (
                <tr>
                  <td className="px-3 py-2 font-medium">Largest {m.unit} by {isUS ? "land " : ""}area</td>
                  <td className="px-3 py-2">
                    {largest.full ?? largest.name} — {n0(areaOf(largest)!)} km²
                  </td>
                </tr>
              )}
              {smallest && f.count > 1 && (
                <tr>
                  <td className="px-3 py-2 font-medium">Smallest {m.unit} by {isUS ? "land " : ""}area</td>
                  <td className="px-3 py-2">
                    {smallest.full ?? smallest.name} — {n0(areaOf(smallest)!)} km²
                  </td>
                </tr>
              )}
              {totalPop > 0 && (
                <tr>
                  <td className="px-3 py-2 font-medium">Population {isUS ? "(ACS 2019–2023)" : popYear ? `(Natural Earth, ${popYear} estimates)` : ""}</td>
                  <td className="px-3 py-2">{n0(totalPop)}</td>
                </tr>
              )}
              {mostPop && f.count > 1 && (
                <tr>
                  <td className="px-3 py-2 font-medium">Most populous {m.unit}</td>
                  <td className="px-3 py-2">
                    {mostPop.full ?? mostPop.name} — {n0(mostPop.pop!)}
                  </td>
                </tr>
              )}
              {f.cities.length > 0 && (
                <tr>
                  <td className="px-3 py-2 font-medium">Places on the with-cities version</td>
                  <td className="px-3 py-2">{f.cities.map((c) => c.name).join(", ")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          {isUS
            ? "Land areas are the Census Bureau's ALAND figures. Population and income are American Community Survey 5-year estimates, which carry margins of error."
            : "Areas are computed here from the full-resolution Natural Earth shapes on a sphere and are approximate; official figures differ, especially where coastlines and islands are generalised."}
          {f.cities.length > 0 && !isUS && " Cities are the largest by Natural Earth's metro population figure (pop_max); squares mark national capitals."}
          {f.cities.length > 0 && isUS && " Cities are the largest Census places by ACS population; a crowded label is left off rather than overlapped."}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">
          {f.count === 1 ? `The ${m.unit}` : `All ${f.count} ${m.units}`} {m.kind === "world" ? "on the world map" : `of ${n}`}
        </h2>
        <div className="max-h-[32rem] overflow-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--color-accent-soft)] text-left">
              <tr>
                <th className="px-3 py-2 font-medium">{unitWord}</th>
                <th className="px-3 py-2 text-right font-medium">{isUS ? "Land area, km²" : "Area, km² (approx.)"}</th>
                <th className="px-3 py-2 text-right font-medium">{isUS ? "Land area, mi²" : "Area, mi² (approx.)"}</th>
                {totalPop > 0 && <th className="px-3 py-2 text-right font-medium">Population</th>}
                {isUS && <th className="px-3 py-2 text-right font-medium">Median household income</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {rows.map((r) => {
                const a = areaOf(r);
                return (
                  <tr key={r.id}>
                    <td className="px-3 py-1.5">{r.full ?? r.name}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{a != null ? n0(a) : "—"}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{a != null ? n0(a / KM2_PER_MI2) : "—"}</td>
                    {totalPop > 0 && <td className="px-3 py-1.5 text-right tabular-nums">{r.pop != null ? n0(r.pop) : "—"}</td>}
                    {isUS && <td className="px-3 py-1.5 text-right tabular-nums">{r.income != null ? usd(r.income) : "—"}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">Printing and using the map</h2>
        <ol className="list-decimal space-y-2 pl-5 text-[var(--color-muted)]">
          <li>Pick a version with the tabs above the map. Blank is outlines only; Labeled names each {m.unit}.</li>
          <li>For paper, choose PDF and your page size. Wide maps are placed on a landscape page automatically.</li>
          <li>Print at 100% or &ldquo;Fit to page&rdquo;. The PDF already leaves a half-inch margin.</li>
          <li>For slides or documents, a 1,200 or 2,400 px PNG is enough. For a poster, use the 4,800 px PNG or the SVG.</li>
          <li>To colour {m.units} by your own data, open the SVG in a design program: each {m.unit} is a separate path carrying its name.</li>
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">About the boundaries</h2>
        <div className="prose-block text-[var(--color-muted)]">
          <p>
            {isUS
              ? `The ${m.kind === "us" ? "state" : m.unit} shapes are the US Census Bureau's 2024 cartographic boundary file — boundaries as of January 1, 2024, clipped to the shoreline for mapping.${m.kind === "us" ? " Alaska and Hawaii are moved and resized as insets, as on most US maps, so their size and position are not to scale with the lower 48." : ""}`
              : `The shapes are Natural Earth's ${m.kind === "country" ? "1:10 million first-level administrative units" : "1:50 million countries"} (version 5.1), a public-domain dataset maintained by volunteers and the North American Cartographic Information Society.`}{" "}
            {m.kind === "country" && "Where Natural Earth records a lower level of government than the one named here, its units are merged into the parent region, and names are given in common English forms."}
            {m.kind === "continent" && " Countries are grouped by Natural Earth's continent field, and the drawing is cut to a frame around the continent, so a country that extends beyond it (Russia, for example) is shown only in part."}
          </p>
          <p>
            {m.kind === "world"
              ? "The world map uses the Robinson projection, a compromise that keeps both shapes and sizes roughly right rather than either exactly. It is"
              : `The map uses an equal-area projection (${m.kind === "us" ? "Albers equal-area conic" : "Lambert azimuthal equal-area, centred on the map"}), so ${m.units} keep their true relative sizes. It is`}{" "}
simplified to about the detail visible at {f.width} × {f.height} pixels, and coloured so that no two touching {m.units} share a colour. The colours carry no meaning.
          </p>
          <p>
            Limits: shorelines and small islands are generalised, very small {m.units} may be hard to see at letter size, and the map shows administrative divisions only — no
            rivers, roads or terrain. It is for teaching, illustration and planning, not for legal, survey or navigation use.
          </p>
        </div>
        <div className="mt-4 rounded-lg border border-[var(--color-line)] bg-[var(--color-accent-soft)] p-4">
          <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">Sources</h3>
          <ul className="space-y-2 text-sm">
            {sourceFor(m).map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--color-accent)] underline">
                  {s.label}
                </a>{" "}
                <span className="text-[var(--color-muted)]">— {s.detail}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[var(--color-muted)]">Source files downloaded October 18, 2026.</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="divide-y divide-[var(--color-line)]">
          {faqs.map((q) => (
            <div key={q.question} className="py-4">
              <h3 className="font-medium">{q.question}</h3>
              <p className="mt-1.5 text-[var(--color-muted)]">{q.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <RelatedMaps current={m} />
    </article>
  );
}

function RelatedMaps({ current }: { current: BlankMap }) {
  const same = blankMaps.filter((x) => x.slug !== current.slug && (x.kind === current.kind || (current.kind === "us-state" && x.kind === "us")));
  const extra = current.kind === "us-state" ? blankMaps.filter((x) => x.kind === "world") : blankMaps.filter((x) => x.kind === "us");
  const list = [...extra, ...same].slice(0, 60);
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-2xl font-semibold tracking-tight">More blank maps</h2>
      <ul className="flex flex-wrap gap-2 text-sm">
        {list.map((x) => (
          <li key={x.slug}>
            <Link href={`/maps/blank/${x.slug}/`} className="inline-block rounded-full border border-[var(--color-line)] px-3 py-1 hover:border-[var(--color-accent)]">
              {x.kind === "world" ? "World" : titleName(x)}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/maps/blank/" className="inline-block rounded-full px-3 py-1 font-medium text-[var(--color-accent)]">
            All {blankMaps.length} maps →
          </Link>
        </li>
      </ul>
    </section>
  );
}
