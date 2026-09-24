import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/config/site";
import { liveTools } from "@/config/tools";

export const metadata: Metadata = {
  title: "About",
  description: `What ${site.name} is, how a tool gets built, where the answers come from, and what this site deliberately does not do.`,
  alternates: { canonical: "/about/" },
};

/** SUBJECT-NEUTRAL. Must still read correctly after any unrelated tool is added. */
export default function AboutPage() {
  const count = liveTools.length;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">About {site.name}</h1>
      <p className="mt-4 text-lg text-[var(--color-muted)]">
        {site.name} is a collection of small, free tools. Each one answers a single
        question from a published data source, and shows you where the answer came from.
      </p>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">What this site is</h2>
        <div className="prose-block mt-3 text-[var(--color-muted)]">
          <p>
            A lot of genuinely useful information is already public and already free.
            The problem is rarely that the data does not exist — it is that getting an
            answer out of it means learning a government portal, downloading a
            spreadsheet, reading a PDF that cannot be searched, or doing arithmetic
            nobody enjoys doing twice.
          </p>
          <p>
            Each tool here closes one of those gaps. You enter what you have, and you
            get the specific answer back in one step, with the source named on the
            result. There {count === 1 ? "is one tool" : `are ${count} tools`} so far,
            and they do not have to relate to each other: a tool belongs here if people
            need the answer, the answer can be produced accurately from a citable free
            source, and what already exists is weak.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">How a tool gets built</h2>
        <div className="prose-block mt-3 text-[var(--color-muted)]">
          <p>
            Before anything is written, the source is checked directly: does it return
            usable data, is it free of licence restrictions and per-lookup costs, and
            can a browser query it without a server in between? If the answer is no, the
            tool does not get built. For a tool that is pure calculation, the formula has
            to be published somewhere citable, and it gets worked by hand and checked
            against an independent reference before it ships.
          </p>
          <p>
            Then the inputs where the tool <em>cannot</em> answer are found deliberately,
            before the interface is designed — the addresses with no coverage, the values
            that break the formula, the records that were never digitised. Those cases
            get an explanation of why the data is missing and the nearest useful answer
            instead, because an unexplained blank looks like a broken tool.
          </p>
          <p>
            Only after the tool has been run against real inputs, including the ones that
            fail, and cross-checked against the official source, does it go live.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">Where the answers come from</h2>
        <div className="prose-block mt-3 text-[var(--color-muted)]">
          <p>
            Every answer traces to a public dataset or a documented formula. Each tool
            page has a section naming its source, explaining how the page obtains the
            answer, and stating the limits of that source — its resolution, its
            assumptions, and what it must not be used for.
          </p>
          <p>
            Results are produced in your browser at the moment you ask for them. Your
            query goes directly from your browser to the data source, so that source
            sees your IP address and what you typed. This site has no server storing
            your lookups. The{" "}
            <Link href="/privacy-policy/" className="text-[var(--color-accent)] underline">
              privacy policy
            </Link>{" "}
            lists every outside service involved.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">
          What this site deliberately does not do
        </h2>
        <div className="prose-block mt-3 text-[var(--color-muted)]">
          <p>
            <strong className="text-[var(--color-ink)]">It does not give advice.</strong>{" "}
            A tool reports what a source records or what a formula works out. It will not
            tell you what to do about it. Those are different things, and the second one
            needs somebody who knows your situation.
          </p>
          <p>
            <strong className="text-[var(--color-ink)]">It does not claim expertise.</strong>{" "}
            Nothing here is based on professional credentials, field testing, laboratory
            work or first-hand inspection. This site is a careful interface to
            information that already exists, and that is all it presents itself as.
          </p>
          <p>
            <strong className="text-[var(--color-ink)]">
              It does not replace an official record or a professional.
            </strong>{" "}
            Published data is generalised, sometimes old, and sometimes wrong for a
            specific case. Where a tool has an official counterpart, the tool links to
            it. Where a decision needs a real test, measurement or professional opinion,
            the tool says so rather than pretending a published figure will do.
          </p>
          <p>
            <strong className="text-[var(--color-ink)]">It does not guess.</strong> When
            a source has no answer for what you entered, the tool says that plainly and
            explains why, instead of filling the gap with an estimate.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">Corrections</h2>
        <p className="mt-3 text-[var(--color-muted)]">
          If a tool returns something that looks wrong, that is worth knowing about —
          especially if you can say what you expected and why. Write to{" "}
          <a
            href={`mailto:${site.contactEmail}`}
            className="text-[var(--color-accent)] underline"
          >
            {site.contactEmail}
          </a>
          . Errors that come from the underlying dataset get noted on the tool page,
          since they cannot be fixed here.
        </p>
      </section>
    </article>
  );
}
