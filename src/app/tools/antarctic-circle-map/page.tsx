import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import EarthLineTool from "@/components/EarthLineTool";
import { requireTool } from "@/config/tools";

const SLUG = "antarctic-circle-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Antarctic Circle Map: Exact Latitude and Where It Crosses Land",
  description:
    "Map of the Antarctic Circle at its exact latitude this year, where it crosses the Antarctic continent and how far any place is from it.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to use the Antarctic Circle map",
        steps: [
          { name: "See the line", text: "Drawn at 90° minus the Earth's tilt south of the Equator, about 66.56° S." },
          { name: "Find the land crossing", text: "The table shows where it crosses Antarctica." },
          { name: "Check a place", text: "See how far any place is from the circle." },
        ],
      }}
      uses={{
        heading: "Why the Antarctic Circle matters",
        items: [
          { title: "Expedition cruises", body: "Crossing the circle is a highlight of Antarctic voyages." },
          { title: "Midnight sun", body: "South of it the sun stays up at the December solstice." },
          { title: "Polar night", body: "At the June solstice the sun does not rise south of it." },
          { title: "Science", body: "Many research stations lie near it." },
          { title: "Geography lessons", body: "The only line crossing a single continent." },
        ],
      }}
      dataSection={{
        heading: "Where the line is and why it moves",
        paragraphs: [
          "The Antarctic Circle lies at 90° minus the Earth's axial tilt, south of the Equator. With the IAU 2006 mean obliquity for the start of 2026 (about 23.4359°), it sits near 66.5641° S, moving south by roughly 15 metres a year as the tilt decreases.",
          "Its intersections with Antarctica were computed from Natural Earth's 1:10 million outlines (which include ice shelves) and measured on the WGS84 ellipsoid. The web map stops at about 85° latitude, so the far south is not shown.",
        ],
        sources: [
          { label: "Capitaine, Wallace & Chapront (2003), precession quantities (IAU 2006)", href: "https://doi.org/10.1051/0004-6361:20031539" },
          { label: "Natural Earth 1:10m countries", href: "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/" },
        ],
      }}
      faqs={[
        { question: "Does the Antarctic Circle cross any country?", answer: "It crosses only Antarctica, whose territorial claims are suspended under the Antarctic Treaty." },
        { question: "How much of it is over land?", answer: "Most of it is over the Southern Ocean; the table gives the stretches over the continent and its ice shelves." },
        { question: "Does it move?", answer: "Yes, southward by about 15 m a year." },
        { question: "When is there midnight sun?", answer: "Around the December solstice." },
      ]}
    >
      <EarthLineTool line="antarctic-circle" />
    </ToolPageLayout>
  );
}
