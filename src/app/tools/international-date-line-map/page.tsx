import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import EarthLineTool from "@/components/EarthLineTool";
import { requireTool } from "@/config/tools";

const SLUG = "international-date-line-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "International Date Line Map: Where the Date Changes",
  description:
    "Map of the International Date Line as it zigzags around Kiribati, Samoa, Tonga and other Pacific nations, with the local date and time at any place on either side.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to use the date line map",
        steps: [
          { name: "See the line", text: "The red line follows the International Date Line through the Pacific." },
          { name: "Check a place", text: "Search a place or click the map to see its local date and time." },
          { name: "Compare both sides", text: "Click either side of the line to see the calendar date jump." },
        ],
      }}
      uses={{
        heading: "Why the date line matters",
        items: [
          { title: "Flights across the Pacific", body: "Why you arrive 'before' you left, or lose a day." },
          { title: "Cruises", body: "Ships cross it and change the date on board." },
          { title: "New Year", body: "Kiribati's Line Islands are first into each new day." },
          { title: "Geography lessons", body: "Why the line is not straight." },
          { title: "Time zone puzzles", body: "Samoa and American Samoa are close together but a day apart." },
        ],
      }}
      dataSection={{
        heading: "Where the line comes from",
        paragraphs: [
          "The line drawn is from Natural Earth's 1:10 million geographic lines. There is no treaty that fixes the International Date Line: it is the line where countries' chosen time zones put the calendar a day apart, roughly along 180° longitude, bending to keep island groups together.",
          "The local date and time at a place come from its time zone (looked up with Open-Meteo from timezone-boundary-builder data) and the IANA time zone database in your browser. That is what actually decides the date there.",
        ],
        sources: [
          { label: "Natural Earth 1:10m geographic lines", href: "https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-geographic-lines/" },
          { label: "IANA time zone database", href: "https://www.iana.org/time-zones" },
          { label: "timezone-boundary-builder", href: "https://github.com/evansiroky/timezone-boundary-builder" },
        ],
      }}
      faqs={[
        { question: "Why does the date line zigzag?", answer: "To keep each country or island group on one date. Kiribati moved its eastern islands to the Asian side of the line on 31 December 1994." },
        { question: "Which country is first to see a new day?", answer: "Kiribati's Line Islands, at UTC+14." },
        { question: "Why did Samoa skip 30 December 2011?", answer: "It moved across the date line to align with Australia and New Zealand, its main trading partners." },
        { question: "If I fly east across it, do I gain a day?", answer: "Yes — crossing eastward the date goes back one day; westward it goes forward." },
        { question: "Is the date line the same as 180° longitude?", answer: "Mostly, but it leaves 180° to go around Russia's far east, Fiji, Tonga, Samoa and Kiribati." },
      ]}
    >
      <EarthLineTool line="international-date-line" />
    </ToolPageLayout>
  );
}
