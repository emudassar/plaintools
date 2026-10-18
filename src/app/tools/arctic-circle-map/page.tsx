import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import EarthLineTool from "@/components/EarthLineTool";
import { requireTool } from "@/config/tools";

const SLUG = "arctic-circle-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Arctic Circle Map: Countries and Exact Latitude",
  description:
    "Map of the Arctic Circle at its exact latitude this year, with the eight countries it crosses, the length over land in each, and how far any place is from it.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to use the Arctic Circle map",
        steps: [
          { name: "See the line", text: "Drawn at 90° minus the Earth's tilt, about 66.56° N." },
          { name: "Explore the countries", text: "Click a name to highlight its stretch." },
          { name: "Check a place", text: "See how far north or south of the Arctic Circle it is." },
        ],
      }}
      uses={{
        heading: "Why the Arctic Circle matters",
        items: [
          { title: "Midnight sun", body: "North of the line the sun stays up for at least a day at the June solstice (refraction stretches this a little south of it)." },
          { title: "Polar night", body: "At the December solstice the sun does not rise north of it." },
          { title: "Travel", body: "Crossing points in Norway, Sweden, Finland, Iceland's Grímsey island and Alaska's Dalton Highway are popular stops." },
          { title: "Northern lights trips", body: "Many aurora destinations are near the line." },
          { title: "Geography", body: "Which countries reach the Arctic?" },
        ],
      }}
      dataSection={{
        heading: "Where the line is and why it moves",
        paragraphs: [
          "The Arctic Circle lies at 90° minus the Earth's axial tilt. With the IAU 2006 mean obliquity for the start of 2026 (about 23.4359°), it sits near 66.5641° N. The tilt is decreasing by about 0.47 seconds of arc a year, so the circle moves north by roughly 15 metres a year.",
          "Crossings were computed from Natural Earth's 1:10 million country outlines and measured on the WGS84 ellipsoid.",
        ],
        sources: [
          { label: "Capitaine, Wallace & Chapront (2003), precession quantities (IAU 2006)", href: "https://doi.org/10.1051/0004-6361:20031539" },
          { label: "Natural Earth 1:10m countries", href: "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/" },
        ],
      }}
      faqs={[
        { question: "Which countries does the Arctic Circle cross?", answer: "Eight: Russia, the United States (Alaska), Canada, Greenland, Iceland (only the island of Grímsey), Norway, Sweden and Finland." },
        { question: "Does the Arctic Circle move?", answer: "Yes, northward by about 15 m a year." },
        { question: "Is there midnight sun on the circle?", answer: "Yes, around the June solstice; refraction makes the sun visible at midnight slightly south of it too." },
        { question: "How long is it?", answer: "About 16,000 km around." },
      ]}
    >
      <EarthLineTool line="arctic-circle" />
    </ToolPageLayout>
  );
}
