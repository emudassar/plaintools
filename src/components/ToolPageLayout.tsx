import Link from "next/link";
import type { ReactNode } from "react";
import { categories, relatedTools, type Tool } from "@/config/tools";
import { ToolSchema, type FaqItem, type HowToStep } from "./Schema";

/**
 * THE template every tool page uses.
 *
 * The section order below is FIXED. Do not reorder it per page — the
 * consistency is the point. The tool itself renders first, before any prose,
 * because nobody reads the intro.
 */

export interface UseCase {
  title: string;
  body: string;
}

export interface SourceLink {
  label: string;
  href: string;
  note?: string;
}

export interface ToolPageLayoutProps {
  tool: Tool;
  /** The working tool. Rendered immediately after the H1. */
  children: ReactNode;
  howTo: { title: string; steps: HowToStep[] };
  /** `heading` is written out, not derived: "10 practical uses for checking soil". */
  uses: { heading: string; items: UseCase[] };
  dataSection: {
    heading: string;
    paragraphs: string[];
    sources: SourceLink[];
  };
  faqs: FaqItem[];
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--color-line)] bg-white px-2.5 py-0.5 text-xs font-medium text-[var(--color-muted)]">
      {children}
    </span>
  );
}

export default function ToolPageLayout({
  tool,
  children,
  howTo,
  uses,
  dataSection,
  faqs,
}: ToolPageLayoutProps) {
  const related = relatedTools(tool.slug);

  return (
    <>
      <ToolSchema tool={tool} howTo={howTo} faqs={faqs} />

      <article className="mx-auto max-w-3xl px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-[var(--color-muted)]">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          <span aria-hidden="true">/</span>{" "}
          <Link href="/tools/" className="hover:underline">
            Tools
          </Link>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{tool.name}</h1>
          <p className="mt-3 text-lg text-[var(--color-muted)]">{tool.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{categories[tool.category].label}</Badge>
            <Badge>{tool.scope === "US" ? "United States only" : "Worldwide"}</Badge>
            <Badge>Source: {tool.dataset}</Badge>
            <Badge>Free, no sign-up</Badge>
          </div>
        </header>

        {/* THE TOOL ITSELF — first thing after the H1, before any prose. */}
        <section aria-label={`${tool.name} tool`} className="mb-12">
          {children}
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">{howTo.title}</h2>
          <ol className="space-y-3">
            {howTo.steps.map((step, i) => (
              <li key={step.name} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-sm font-semibold text-[var(--color-accent)]"
                >
                  {i + 1}
                </span>
                <span>
                  <strong className="font-medium">{step.name}.</strong>{" "}
                  <span className="text-[var(--color-muted)]">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">{uses.heading}</h2>
          <div className="space-y-5">
            {uses.items.map((use) => (
              <div key={use.title}>
                <h3 className="font-medium">{use.title}</h3>
                <p className="mt-1 text-[var(--color-muted)]">{use.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">{dataSection.heading}</h2>
          <div className="prose-block text-[var(--color-muted)]">
            {dataSection.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-[var(--color-line)] bg-[var(--color-accent-soft)] p-4">
            <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">Sources</h3>
            <ul className="space-y-2 text-sm">
              {dataSection.sources.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--color-accent)] underline"
                  >
                    {s.label}
                  </a>
                  {s.note && (
                    <span className="text-[var(--color-muted)]"> — {s.note}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-[var(--color-line)]">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-4">
                <h3 className="font-medium">{faq.question}</h3>
                <p className="mt-1.5 text-[var(--color-muted)]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section>
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">Related tools</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((t) => (
                <ToolCard key={t.slug} tool={t} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}

/**
 * A tool in a grid. Non-live tools render as a dashed, NON-CLICKABLE card with
 * a "Soon" badge — never a link to a page that does not exist.
 */
export function ToolCard({ tool }: { tool: Tool }) {
  if (tool.status !== "live") {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-line)] p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-[var(--color-muted)]">{tool.name}</h3>
          <span className="shrink-0 rounded-full bg-[var(--color-warn-soft)] px-2 py-0.5 text-xs font-medium text-[var(--color-muted)]">
            Soon
          </span>
        </div>
        <p className="mt-1.5 text-sm text-[var(--color-muted)]">{tool.tagline}</p>
      </div>
    );
  }

  return (
    <Link
      href={`/tools/${tool.slug}/`}
      className="block rounded-lg border border-[var(--color-line)] p-4 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
    >
      <h3 className="font-medium">{tool.name}</h3>
      <p className="mt-1.5 text-sm text-[var(--color-muted)]">{tool.tagline}</p>
      <p className="mt-2 text-xs text-[var(--color-muted)]">{tool.dataset}</p>
    </Link>
  );
}
