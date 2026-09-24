import type { ReactNode } from "react";
import { site } from "@/config/site";

export interface LegalSection {
  heading: string;
  paragraphs: (string | ReactNode)[];
}

/**
 * Shared shell for the legal pages.
 *
 * These pages are DRAFTS, not legal advice. The notice is rendered on every
 * one of them rather than left as a comment in the source, because the person
 * who needs to see it is the operator, on the live site.
 */
export default function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Last updated {site.legalUpdated}
      </p>
      <p className="mt-4 text-[var(--color-muted)]">{intro}</p>

      <div className="mt-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4 text-sm">
        <strong className="font-medium">Draft — needs review.</strong> This page is a
        starting template, not legal advice. It has not been reviewed by a lawyer.
        Have it reviewed before relying on it.
      </div>

      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-2 text-xl font-semibold tracking-tight">{section.heading}</h2>
            <div className="prose-block text-[var(--color-muted)]">
              {section.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 border-t border-[var(--color-line)] pt-4 text-sm text-[var(--color-muted)]">
        Questions about this page? Contact{" "}
        <a href={`mailto:${site.contactEmail}`} className="text-[var(--color-accent)] underline">
          {site.contactEmail}
        </a>
        .
      </p>
    </article>
  );
}
