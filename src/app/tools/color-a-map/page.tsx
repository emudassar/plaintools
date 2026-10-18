import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import MapPainterTool from "@/components/MapPainterTool";
import { requireTool } from "@/config/tools";

const SLUG = "color-a-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Color a Map: Make a Custom Colored Map of the US or World",
  description:
    "Colour a map online: click US states, countries or a continent to fill them, add a title and legend, or paste data to shade them. Download as PNG, SVG or PDF. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to colour a map",
        steps: [
          { name: "Choose the map", text: "US states, the world, or one continent." },
          { name: "Pick a colour and click", text: "Each click paints a state or country; click again to clear." },
          { name: "Label the colours", text: "Type a label for each colour to build the legend." },
          { name: "Or paste a list", text: "Names or codes with a group, colour or number shade the map automatically." },
          { name: "Download", text: "PNG, SVG or a PDF sized for Letter, A4, tabloid, A3 or A2." },
        ],
      }}
      uses={{
        heading: "What people colour maps for",
        items: [
          { title: "States or countries visited", body: "A travel map with a legend." },
          { title: "Sales or service territories", body: "Colour regions by rep or office." },
          { title: "Election and survey results", body: "Shade states by party or answer." },
          { title: "Teaching", body: "Quiz maps and colouring exercises." },
          { title: "Reports", body: "A choropleth from a column of numbers." },
          { title: "Presentations", body: "A clean map in your brand colours." },
          { title: "Family history", body: "Where ancestors lived." },
          { title: "Shipping coverage", body: "Where you deliver." },
        ],
      }}
      dataSection={{
        heading: "Where the outlines come from",
        paragraphs: [
          "US states come from the Census Bureau's 2024 cartographic boundary file (1:5,000,000), drawn in an Albers equal-area projection with Alaska and Hawaii moved below the lower 48, as US maps usually show them.",
          "World countries come from Natural Earth's 1:50 million Admin 0 countries, drawn in the Robinson projection. Borders follow Natural Earth's de facto lines; disputed areas are shown as Natural Earth draws them.",
          "When you paste numbers, the map is shaded in seven quantile classes (each colour holds about the same number of places) with a ColorBrewer colour scheme. Everything is drawn in your browser; nothing is uploaded.",
        ],
        sources: [
          { label: "Census Bureau cartographic boundary files", href: "https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html" },
          { label: "Natural Earth 1:50m countries", href: "https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/" },
          { label: "ColorBrewer", href: "https://colorbrewer2.org/" },
        ],
      }}
      faqs={[
        { question: "Can I use the map in my report or website?", answer: "Yes. The outlines are public domain (Census Bureau and Natural Earth), and the map you make is yours." },
        { question: "Can I colour by numbers?", answer: "Yes — paste one place per line with a number. The map is shaded light to dark in seven classes." },
        { question: "What codes can I paste?", answer: "US state names or two-letter codes; country names or three-letter ISO codes (FRA, BRA)." },
        { question: "Why is Alaska small?", answer: "Alaska and Hawaii are moved and rescaled to fit, as on most US maps." },
        { question: "Can I colour counties?", answer: "Use the County Map Maker." },
        { question: "Is there a print size?", answer: "Choose a PDF page size; the map is scaled to fit with half-inch margins." },
      ]}
    >
      <MapPainterTool bases={["us-states", "world", "africa", "asia", "europe", "north-america", "south-america", "oceania"]} initial="us-states" dataHint="One per line: a state or country (name or code), then a comma and a group name, a colour like #e31a1c, or a number. Example: Texas, Visited — or — FRA, 68.4" />
    </ToolPageLayout>
  );
}
