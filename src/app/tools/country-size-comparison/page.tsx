import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CountrySizeTool from "@/components/CountrySizeTool";
import { requireTool } from "@/config/tools";

const SLUG = "country-size-comparison";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Country Size Comparison: True Size of Countries on a Map",
  description:
    "Compare the true size of countries: move one country over another or anywhere on the map and see real sizes without Mercator distortion, with both areas and how many times bigger.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to compare country sizes",
        steps: [
          { name: "Choose a country to move", text: "For example Greenland." },
          { name: "Choose where to put it", text: "Another country, such as Australia; it is placed at that country's centre." },
          { name: "Compare", text: "Orange is the moved country at its true size; green is the other country." },
          { name: "Move it around", text: "Click anywhere on the map to drop it there and watch the map's distortion change." },
        ],
      }}
      uses={{
        heading: "Why compare true sizes",
        items: [
          { title: "Seeing past Mercator", body: "Web maps swell shapes near the poles; this shows the real comparison." },
          { title: "Teaching map projections", body: "Move a country north and south to see the distortion." },
          { title: "Travel perspective", body: "How big is a country you are visiting compared with home?" },
          { title: "Settling arguments", body: "Is Alaska bigger than Texas? Move one onto the other and see." },
          { title: "Writing and journalism", body: "Get a ratio to quote, with its source." },
          { title: "Curiosity", body: "Africa is far larger than it looks on most maps." },
        ],
      }}
      dataSection={{
        heading: "How the comparison works",
        paragraphs: [
          "Country outlines are Natural Earth's 1:110 million Admin 0 countries, a coarse world map in which small islands are left out. Areas are computed from those outlines on the WGS84 ellipsoid, so they are approximate.",
          "The country is moved by rotating the globe so that its centre lands on the target point — a rigid motion that keeps its true shape and area. The web map then draws it in the Mercator projection, which scales areas by 1/cos² of the latitude. That is why a country looks bigger the farther it sits from the equator.",
          "Country centres are area-weighted centroids computed for this site from Natural Earth's 1:10 million outlines (using the largest landmass for countries with far-flung islands).",
        ],
        sources: [
          { label: "Natural Earth 1:110m countries", href: "https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/" },
          { label: "Snyder (1987), Map Projections — A Working Manual", href: "https://pubs.usgs.gov/publication/pp1395" },
        ],
      }}
      faqs={[
        { question: "Why does Greenland look as big as Africa?", answer: "The Mercator projection used by web maps enlarges areas by 1/cos² of the latitude — about 17 times at 76° N, the latitude of central Greenland. In reality Africa is about 14 times larger." },
        { question: "Are the areas official?", answer: "No — they are measured from coarse outlines. For official figures use a national statistics office or the CIA World Factbook." },
        { question: "Why does the moved country look rotated?", answer: "Moving a shape across a globe also turns it relative to north. Its shape and size are unchanged." },
        { question: "Can I compare US states?", answer: "This tool uses countries only." },
        { question: "Does it work on phones?", answer: "Yes — tap the map to drop the country." },
      ]}
    >
      <CountrySizeTool />
    </ToolPageLayout>
  );
}
