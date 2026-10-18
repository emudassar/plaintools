import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import EarthLineTool from "@/components/EarthLineTool";
import { requireTool } from "@/config/tools";

const SLUG = "tropic-of-capricorn-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Tropic of Capricorn Map: Countries and Exact Latitude",
  description:
    "Map of the Tropic of Capricorn at its exact latitude this year, with the countries it crosses — Chile to Australia — the stretch over land in each, and your distance from it.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to use the Tropic of Capricorn map",
        steps: [
          { name: "See the line", text: "Drawn at the Earth's current axial tilt south of the Equator." },
          { name: "Explore the countries", text: "Click a name to highlight where the Tropic crosses it." },
          { name: "Check a place", text: "Search or click to see how far it is from the Tropic." },
        ],
      }}
      uses={{
        heading: "Why the Tropic of Capricorn matters",
        items: [
          { title: "The southern edge of the tropics", body: "The farthest south the sun is ever directly overhead, at the December solstice." },
          { title: "Geography lessons", body: "Which countries does it cross?" },
          { title: "Travel", body: "Markers stand on it in Brazil, Namibia, Australia and elsewhere." },
          { title: "Climate", body: "It crosses the Atacama, Kalahari and Australian deserts." },
          { title: "Astronomy", body: "Why its latitude changes slowly." },
        ],
      }}
      dataSection={{
        heading: "Where the line is and why it moves",
        paragraphs: [
          "The Tropic of Capricorn lies at the Earth's axial tilt south of the Equator. This page uses the IAU 2006 mean obliquity for the start of 2026, about 23.4359°. As the tilt slowly decreases (about 0.47 seconds of arc a year), the Tropic moves north toward the Equator by roughly 15 metres a year.",
          "Crossings were computed from Natural Earth's 1:10 million country outlines and measured on the WGS84 ellipsoid.",
        ],
        sources: [
          { label: "Capitaine, Wallace & Chapront (2003), precession quantities (IAU 2006)", href: "https://doi.org/10.1051/0004-6361:20031539" },
          { label: "Natural Earth 1:10m countries", href: "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/" },
        ],
      }}
      faqs={[
        { question: "Which countries does it cross?", answer: "Ten in this data: Chile, Argentina, Paraguay, Brazil, Namibia, Botswana, South Africa, Mozambique, Madagascar and Australia." },
        { question: "Does it move?", answer: "Yes, northward by about 15 m a year." },
        { question: "When is the sun overhead there?", answer: "At noon on the December solstice, around 21–22 December." },
        { question: "Why Capricorn?", answer: "Two thousand years ago the December-solstice sun stood in Capricornus; precession has since moved it into Sagittarius." },
      ]}
    >
      <EarthLineTool line="tropic-of-capricorn" />
    </ToolPageLayout>
  );
}
