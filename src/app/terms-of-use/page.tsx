import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: `The terms that apply when you use ${site.name}.`,
  alternates: { canonical: "/terms-of-use/" },
};

export default function TermsOfUsePage() {
  return (
    <LegalPage
      title="Terms of use"
      intro={`These terms apply when you use ${site.name}. By using the site you accept them; if you do not, please do not use it.`}
      sections={[
        {
          heading: "What the site provides",
          paragraphs: [
            `${site.name} provides free tools that report information from published data sources and documented formulas. The tools are provided as they are, for general information only.`,
            "No part of this site is professional advice of any kind — legal, financial, engineering, agricultural, environmental, medical or otherwise. Reporting what a dataset records is not the same as advising you on what to do about it.",
          ],
        },
        {
          heading: "No warranty",
          paragraphs: [
            "The tools and their results are provided without warranty of any kind, express or implied, including any implied warranty of accuracy, completeness, fitness for a particular purpose or non-infringement.",
            "Results depend entirely on outside data sources. Those sources may be incomplete, out of date, generalised over an area, or simply wrong for a specific case, and they may change or become unavailable without notice. No promise is made that any tool will be available, accurate or uninterrupted.",
          ],
        },
        {
          heading: "Your responsibility",
          paragraphs: [
            "You are responsible for deciding whether a result is suitable for what you intend to do with it. Where a decision carries financial, legal, safety or environmental consequences, verify the result against the official source and obtain a qualified professional opinion.",
            "Do not rely on any tool here as the sole basis for a purchase, a construction or land-use decision, a permit application, a regulatory filing, or anything else where being wrong would cost you.",
          ],
        },
        {
          heading: "Limitation of liability",
          paragraphs: [
            `To the fullest extent permitted by law, ${site.name} and its operator are not liable for any loss or damage arising from your use of, or inability to use, this site or anything obtained from it. That includes direct, indirect, incidental, consequential and special damages, and loss of profit, data or opportunity.`,
            "Some jurisdictions do not allow certain limitations of liability, so parts of this section may not apply to you.",
          ],
        },
        {
          heading: "Third-party data and links",
          paragraphs: [
            "The data behind these tools is produced and owned by third parties, and remains subject to their own terms and licences. Those terms are linked from the relevant tool page. This site claims no ownership of that data.",
            "Links to outside sites are provided for reference. Their content is not controlled or endorsed here.",
          ],
        },
        {
          heading: "Acceptable use",
          paragraphs: [
            "You may use these tools for personal and commercial purposes. You may not use them in any way that interferes with the site, places an unreasonable load on the data sources behind it, or breaches the terms of those sources.",
            "Automated bulk querying through this site is not permitted. The underlying sources are public and most publish their own bulk downloads or documented interfaces — use those instead, under their terms.",
          ],
        },
        {
          heading: "Changes",
          paragraphs: [
            "Tools may be changed, corrected or withdrawn at any time, and these terms may be updated. The date at the top of this page shows when it last changed; continuing to use the site after a change means you accept the current version.",
          ],
        },
        {
          heading: "Governing law",
          paragraphs: [
            `These terms are governed by the laws of ${site.jurisdiction}.`,
          ],
        },
      ]}
    />
  );
}
