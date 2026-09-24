import { site, absoluteUrl } from "@/config/site";
import type { Tool } from "@/config/tools";

/**
 * JSON-LD builders.
 *
 * Schema must describe WHAT IS ACTUALLY ON THE PAGE. Mismatched structured
 * data is a policy violation, not a clever trick — so the FAQ and HowTo blocks
 * here are fed from the very same arrays the page renders as visible HTML.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: site.name,
        url: site.url,
        description: site.description,
        foundingDate: site.founded,
        email: site.contactEmail,
      }}
    />
  );
}

export function WebsiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: site.name,
        url: site.url,
        description: site.description,
      }}
    />
  );
}

export function ToolSchema({
  tool,
  howTo,
  faqs,
}: {
  tool: Tool;
  howTo: { title: string; steps: HowToStep[] };
  faqs: FaqItem[];
}) {
  const url = absoluteUrl(`/tools/${tool.slug}/`);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: tool.name,
          url,
          description: tool.tagline,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any browser",
          // The tool genuinely is free and needs no account, so this is accurate.
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          isAccessibleForFree: true,
          publisher: { "@type": "Organization", name: site.name, url: site.url },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: howTo.title,
          step: howTo.steps.map((s, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            name: s.name,
            text: s.text,
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site.url },
            { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools/") },
            { "@type": "ListItem", position: 3, name: tool.name, item: url },
          ],
        }}
      />
    </>
  );
}
