import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/config/site";
import { categories, liveTools, tools, usedCategoriesLive, toolsInCategory } from "@/config/tools";
import { ToolCard } from "@/components/ToolPageLayout";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
};

/**
 * SITEWIDE COPY IS SUBJECT-NEUTRAL BY RULE.
 *
 * Nothing on this page may describe what the tools are ABOUT. It must still
 * read correctly after a completely unrelated tool is added. Subject-specific
 * writing lives on that tool's own page and nowhere else.
 *
 * Every count and label below is derived from the registry, never hardcoded.
 */
export default function HomePage() {
  const count = liveTools.length;
  const upcoming = tools.filter((t) => t.status !== "live");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {site.tagline}
        </h1>
        <p className="mt-4 text-lg text-[var(--color-muted)]">{site.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/tools/"
            className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
          >
            Browse {count === 1 ? "the tool" : `all ${count} tools`}
          </Link>
          <Link
            href="/about/"
            className="rounded-md border border-[var(--color-line)] px-5 py-2.5 font-medium"
          >
            How this works
          </Link>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight">
          {count === 1 ? "Available now" : `All ${count} tools`}
        </h2>
        {usedCategoriesLive.map((id) => (
          <div key={id} className="mt-6">
            <p className="mb-1 text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">
              {categories[id].label}
            </p>
            <p className="mb-3 text-sm text-[var(--color-muted)]">{categories[id].blurb}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {toolsInCategory(id, true).map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </div>
        ))}

        {upcoming.length > 0 && (
          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">
              In progress
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {upcoming.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">How this works</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          <div>
            <h3 className="font-medium">One tool, one question</h3>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              Each tool answers a single question and stops there. If something needs
              two answers, it becomes two tools rather than one cluttered page.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Built on published data</h3>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              Answers come from public datasets and documented formulas. Nothing is
              estimated or invented, and each tool names exactly what it drew on.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Nothing to sign up for</h3>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              No account, no download, no paywall. Tools run in your browser and this
              site keeps no record of what you looked up.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16 max-w-3xl rounded-lg border border-[var(--color-line)] bg-[var(--color-accent-soft)] p-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          How accurate these answers are
        </h2>
        <div className="prose-block mt-3 text-[var(--color-muted)]">
          <p>
            Every result shows the source it came from and the date it was retrieved, on
            the result itself rather than buried in a footer. If you want to check a
            figure, each tool links to the original record so you can look at it directly.
          </p>
          <p>
            These tools are an interface to information that already exists. They do not
            add expertise, testing or opinion, and nobody here has inspected your
            property, your equipment or your situation. Published data has real limits —
            resolution, age, rounding and gaps in coverage — and each tool states its own
            limits plainly, including the inputs where it declines to answer.
          </p>
          <p>
            Where a decision carries real cost or risk, treat these answers as a starting
            point and get the official record or a qualified professional opinion.
          </p>
        </div>
      </section>
    </div>
  );
}
