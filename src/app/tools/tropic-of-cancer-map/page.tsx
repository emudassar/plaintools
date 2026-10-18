import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import EarthLineTool from "@/components/EarthLineTool";
import { requireTool } from "@/config/tools";

const SLUG = "tropic-of-cancer-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Tropic of Cancer Map: Countries and Exact Latitude",
  description:
    "Map of the Tropic of Cancer at its exact latitude this year, with the countries it crosses from Mexico to Taiwan, where it enters and leaves each, and your distance from it.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to use the Tropic of Cancer map",
        steps: [
          { name: "See the line", text: "Drawn at the Earth's current axial tilt north of the Equator." },
          { name: "Explore the countries", text: "Click a name to highlight where the Tropic crosses it." },
          { name: "Check a place", text: "Search or click to see how far north or south of the Tropic it is." },
        ],
      }}
      uses={{
        heading: "Why the Tropic of Cancer matters",
        items: [
          { title: "The northern edge of the tropics", body: "The farthest north the sun is ever directly overhead, at the June solstice." },
          { title: "Geography lessons", body: "Which countries straddle it?" },
          { title: "Travel", body: "Markers stand where it crosses roads in Mexico, India, Taiwan and elsewhere." },
          { title: "Climate", body: "It runs through the Sahara, Arabia and northern India's monsoon belt." },
          { title: "Astronomy", body: "Why it moves a little every year." },
        ],
      }}
      dataSection={{
        heading: "Where the line is and why it moves",
        paragraphs: [
          "The Tropic of Cancer lies at a latitude equal to the tilt of the Earth's axis (the obliquity of the ecliptic). This page uses the IAU 2006 mean obliquity for the start of 2026, about 23.4359°. The tilt is slowly decreasing by about 0.47 seconds of arc a year, so the Tropic creeps south toward the Equator by roughly 15 metres a year.",
          "Crossings were computed by intersecting that latitude with Natural Earth's 1:10 million country outlines and measuring each land stretch on the WGS84 ellipsoid.",
        ],
        sources: [
          { label: "Capitaine, Wallace & Chapront (2003), precession quantities (IAU 2006)", href: "https://doi.org/10.1051/0004-6361:20031539" },
          { label: "Natural Earth 1:10m countries", href: "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/" },
        ],
      }}
      faqs={[
        { question: "Why is it called the Tropic of Cancer?", answer: "When the name was given about 2,000 years ago, the sun at the June solstice stood in the constellation Cancer. Precession has since moved it to Taurus, but the name stayed." },
        { question: "Does the Tropic of Cancer move?", answer: "Yes, by about 15 m a year southward as the Earth's tilt slowly decreases." },
        { question: "Which countries does it cross?", answer: "19 countries and territories on land in this data, from Mexico and the Bahamas through North Africa, Arabia, India and China to Taiwan." },
        { question: "When is the sun overhead there?", answer: "At noon on the June solstice, around 20–21 June." },
      ]}
    >
      <EarthLineTool line="tropic-of-cancer" />
    </ToolPageLayout>
  );
}
