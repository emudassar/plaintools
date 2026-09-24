import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `What the results on ${site.name} are, what they are not, and where you need an official record or a professional instead.`,
  alternates: { canonical: "/disclaimer/" },
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      intro={`${site.name} reports what published data sources record. This page explains what that means in practice, and where a result is not enough.`}
      sections={[
        {
          heading: "Information, not advice",
          paragraphs: [
            "Every result here is a report of what a dataset records or what a documented formula produces for the values you entered. It is not a recommendation, an opinion, or professional advice of any kind.",
            'There is a real difference between "this source rates this location as severely limited for that use" and "you cannot build here". The first is a fact about a dataset and is the most any tool here will tell you. The second is a judgement about your situation, which requires someone who has actually assessed it.',
          ],
        },
        {
          heading: "No expertise is claimed",
          paragraphs: [
            "This site is an interface to information that already exists. It is not the work of licensed professionals in the fields its tools touch, and it involves no field testing, laboratory analysis, site visit, survey or inspection.",
            "Nothing here should be read as implying credentials, accreditation, endorsement or professional standing.",
          ],
        },
        {
          heading: "Accuracy has limits",
          paragraphs: [
            "Public datasets are generalised. They are compiled over years, mapped at a particular resolution, rounded, and updated on their own schedule. A value that is correct for an area can still be wrong for one specific point inside it, and coverage is often missing entirely for some locations.",
            "Each tool page states the limits of its own source, including the inputs where it declines to answer. Those sections are the important ones — read them before acting on a result.",
            "Sources can also change or go offline without notice. A result shows the date it was retrieved for exactly this reason.",
          ],
        },
        {
          heading: "When you need something else",
          paragraphs: [
            "Published data does not substitute for a physical test, measurement or inspection of a specific site or item. Where a permit, a regulatory submission, a legal process, a transaction or anyone's safety is involved, obtain the official record and a qualified professional assessment.",
            "Where an official tool or authoritative record exists, the relevant tool page links to it. Use that link when you need the complete, citable record rather than a quick answer.",
          ],
        },
        {
          heading: "Data ownership",
          paragraphs: [
            "The underlying data belongs to the organisations that publish it and stays subject to their terms. Each tool names its sources and links to them, so the original record can always be checked.",
          ],
        },
        {
          heading: "Errors",
          paragraphs: [
            `If a tool returns something that looks wrong, please report it to ${site.contactEmail}. Errors originating in the source dataset cannot be corrected here, but they will be noted on the tool page so other people know.`,
          ],
        },
      ]}
    />
  );
}
