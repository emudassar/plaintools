import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { OrganizationSchema, WebsiteSchema } from "@/components/Schema";
import { site, isAnalyticsEnabled } from "@/config/site";
import { categories, liveTools, usedCategoriesLive, toolsInCategory } from "@/config/tools";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
  },
};

const legalLinks = [
  { href: "/about/", label: "About" },
  { href: "/tools/", label: "All tools" },
  { href: "/privacy-policy/", label: "Privacy policy" },
  { href: "/terms-of-use/", label: "Terms of use" },
  { href: "/disclaimer/", label: "Disclaimer" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        {isAnalyticsEnabled && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${site.gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${site.gaMeasurementId}');
              `}
            </Script>
          </>
        )}
        <OrganizationSchema />
        <WebsiteSchema />
        <SiteHeader />

        <main className="flex-1">{children}</main>

        <footer className="mt-16 border-t border-[var(--color-line)] bg-[#fafbfc]">
          <div className="mx-auto max-w-5xl px-4 py-10">
            {liveTools.length > 0 && (
              <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {usedCategoriesLive.map((id) => (
                  <div key={id}>
                    {/* A <p>, not a heading: as an h2 this would compete with
                        each page's real section headings. */}
                    <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">
                      {categories[id].label}
                    </p>
                    <ul className="space-y-1.5">
                      {toolsInCategory(id, true).map((tool) => (
                        <li key={tool.slug}>
                          <Link
                            href={`/tools/${tool.slug}/`}
                            className="text-sm hover:underline"
                          >
                            {tool.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <nav
              aria-label="Footer"
              className="flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--color-line)] pt-6 text-sm"
            >
              {legalLinks.map((l) => (
                <Link key={l.href} href={l.href} className="hover:underline">
                  {l.label}
                </Link>
              ))}
              <a href={`mailto:${site.contactEmail}`} className="hover:underline">
                Contact
              </a>
            </nav>

            <p className="mt-6 text-xs leading-relaxed text-[var(--color-muted)]">
              {site.name} reports what published data sources record. It does not give
              professional, legal, financial, engineering, agricultural or medical
              advice. Results are only as accurate and as current as the source behind
              them, and every tool names its source. Where a decision matters, check the
              official record and consult a qualified professional.
            </p>
            <p className="mt-3 text-xs text-[var(--color-muted)]">
              © {site.founded} {site.name}. Data remains the property of its original
              publishers.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
