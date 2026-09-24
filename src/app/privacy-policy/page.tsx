import type { Metadata } from "next";
import { site, thirdPartyServices, isAnalyticsEnabled, isAdsEnabled } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${site.name} handles your data, and every third-party service your browser contacts when you use a tool.`,
  alternates: { canonical: "/privacy-policy/" },
};

/**
 * GENERATED FROM `thirdPartyServices` in config/site.ts — not hand-written.
 *
 * Because the tools query sources directly from the visitor's browser, those
 * services receive the visitor's IP address and whatever they typed. Adding a
 * tool that calls a new service without adding it to that array makes this
 * page factually wrong, which is why the list below is not prose.
 */
export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">Privacy policy</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Last updated {site.legalUpdated}
      </p>

      <div className="mt-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4 text-sm">
        <strong className="font-medium">Draft — needs review.</strong> This page is a
        starting template, not legal advice. It has not been reviewed by a lawyer.
        Have it reviewed before relying on it.
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">The short version</h2>
        <div className="prose-block mt-3 text-[var(--color-muted)]">
          <p>
            {site.name} has no accounts, no sign-up and no server that stores what you
            look up. The tools run in your browser.
          </p>
          <p>
            That has one consequence worth understanding: when you use a tool, your
            browser contacts the data source <em>directly</em>. Those outside services
            therefore see your IP address and whatever you typed into the tool, in the
            same way they would if you visited their own website. Every such service is
            listed below.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">
          What this site collects itself
        </h2>
        <div className="prose-block mt-3 text-[var(--color-muted)]">
          <p>
            Nothing that identifies you. This site is a set of static files. There is no
            database, no login, no contact form and no server-side logging of your
            queries. Addresses, coordinates and other values you type into a tool are
            used to build the request and are not retained after you leave the page.
          </p>
          <p>
            The site sets no cookies of its own and does not use browser storage to
            track you between visits.
          </p>
          {!isAnalyticsEnabled && !isAdsEnabled && (
            <p>
              There is currently no analytics and no advertising on this site. If either
              is added later, this page and the list below will be updated before it goes
              live.
            </p>
          )}
          {isAnalyticsEnabled && (
            <p>
              This site uses Google Analytics to count visits and see which pages are
              used. It records usage data such as pages viewed, approximate location and
              device type.
            </p>
          )}
          {isAdsEnabled && (
            <p>
              This site shows ads through Google AdSense, which may use cookies to
              personalise what you see.
            </p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">
          Services your browser contacts
        </h2>
        <p className="mt-3 text-[var(--color-muted)]">
          When you run a tool, your browser sends a request to the services below. Each
          one has its own privacy policy, which governs what it does with that request.
        </p>

        <div className="mt-5 space-y-4">
          {thirdPartyServices.map((svc) => (
            <div
              key={svc.name}
              className="rounded-lg border border-[var(--color-line)] p-4"
            >
              <h3 className="font-medium">{svc.name}</h3>
              <dl className="mt-2 space-y-1.5 text-sm text-[var(--color-muted)]">
                <div>
                  <dt className="inline font-medium">Why it is contacted: </dt>
                  <dd className="inline">{svc.purpose}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">What it receives: </dt>
                  <dd className="inline">{svc.receives}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">Its privacy policy: </dt>
                  <dd className="inline">
                    <a
                      href={svc.privacyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-accent)] underline"
                    >
                      {svc.privacyUrl}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-[var(--color-muted)]">
          This list is generated from the site&rsquo;s own configuration, so it stays in
          step with the tools that are actually published. If you would rather a service
          did not receive your query, do not run the tool that uses it — the tool page
          names its source before you enter anything.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">Your choices</h2>
        <div className="prose-block mt-3 text-[var(--color-muted)]">
          <p>
            Because no personal data is stored here, there is nothing on this site to
            request, correct or delete. Requests about data held by the services listed
            above have to go to those services directly, using the contacts in their own
            privacy policies.
          </p>
          <p>
            Depending on where you live, you may have rights under laws such as the GDPR
            or the CCPA. Those rights apply to whoever holds your data; for anything you
            typed into a tool, that is the service that received the request, not this
            site.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">Children</h2>
        <p className="mt-3 text-[var(--color-muted)]">
          This site is not directed at children and knowingly collects no information
          from anyone, of any age.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">Changes and contact</h2>
        <p className="mt-3 text-[var(--color-muted)]">
          If a new tool introduces a new outside service, it is added to the list above
          at the same time the tool is published, and the date at the top of this page
          changes. Questions go to{" "}
          <a
            href={`mailto:${site.contactEmail}`}
            className="text-[var(--color-accent)] underline"
          >
            {site.contactEmail}
          </a>
          .
        </p>
      </section>
    </article>
  );
}
