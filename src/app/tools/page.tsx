import type { Metadata } from "next";
import { site } from "@/config/site";
import { categories, liveTools, tools, usedCategories, toolsInCategory } from "@/config/tools";
import { ToolCard } from "@/components/ToolPageLayout";

export const metadata: Metadata = {
  title: "All tools",
  description: `Every tool on ${site.name}, grouped by what it answers. Each one is free, needs no sign-up, and names the data source behind its result.`,
  alternates: { canonical: "/tools/" },
};

export default function ToolsIndexPage() {
  const liveCount = liveTools.length;
  const total = tools.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">All tools</h1>
      <p className="mt-3 max-w-2xl text-lg text-[var(--color-muted)]">
        {liveCount === total
          ? liveCount === 1
            ? "One tool, answering a single question from a named data source."
            : `${liveCount} tools, each answering a single question from a named data source.`
          : `${liveCount} of ${total} tools are live. Each answers a single question from a named data source.`}
      </p>

      {usedCategories.map((id) => {
        const inCategory = toolsInCategory(id);
        return (
          <section key={id} className="mt-10">
            <h2 className="text-2xl font-semibold tracking-tight">{categories[id].label}</h2>
            <p className="mt-1 mb-4 text-[var(--color-muted)]">{categories[id].blurb}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {inCategory.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-14 max-w-3xl rounded-lg border border-[var(--color-line)] p-6">
        <h2 className="text-xl font-semibold tracking-tight">Suggesting a tool</h2>
        <p className="mt-2 text-[var(--color-muted)]">
          A tool gets built here when the answer depends on what you enter, the data
          behind it is public and free to cite, and the options that already exist are
          genuinely poor — an official database with an unusable interface, a figure
          buried in a PDF, or a calculation people do by hand. If something you keep
          looking up fits that description, send it to{" "}
          <a
            href={`mailto:${site.contactEmail}`}
            className="text-[var(--color-accent)] underline"
          >
            {site.contactEmail}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
