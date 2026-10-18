import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import LegendMakerTool from "@/components/LegendMakerTool";
import { requireTool } from "@/config/tools";

const SLUG = "map-legend-maker";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Map Legend Maker: Create a Map Key as PNG or SVG",
  description:
    "Make a map legend (map key) online: coloured areas, points, pins and lines with labels, a title, columns and transparent background. Download as PNG or SVG for any map.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to make a map legend",
        steps: [
          { name: "Write a title", text: "Or leave it empty for no title." },
          { name: "Add entries", text: "Pick each colour, symbol (area, point, pin, line, dashed line) and label." },
          { name: "Lay it out", text: "Choose columns, text size, background and border." },
          { name: "Download", text: "PNG at three times screen size, or SVG to edit further." },
        ],
      }}
      uses={{
        heading: "Where a separate legend is useful",
        items: [
          { title: "Adding a key to a screenshot", body: "Place the legend over a map image in any editor." },
          { title: "Reports and slides", body: "A crisp legend for a map in Word or PowerPoint." },
          { title: "Printed maps", body: "SVG stays sharp at poster size." },
          { title: "Google My Maps exports", body: "Add the key the export leaves out." },
          { title: "Student projects", body: "A tidy key for a hand-coloured map." },
          { title: "Consistent styling", body: "Reuse the same legend across several maps." },
        ],
      }}
      dataSection={{
        heading: "How the legend is made",
        paragraphs: [
          "The legend is drawn as SVG in your browser and rendered to PNG at three times its on-screen size for sharp printing. With 'Transparent' ticked, the PNG keeps a transparent background so it can sit on top of a map.",
          "Nothing is uploaded. Colours, labels and symbols are entirely yours.",
        ],
        sources: [
          { label: "SVG 2 specification (W3C)", href: "https://www.w3.org/TR/SVG2/" },
          { label: "ColorBrewer: colour advice for maps", href: "https://colorbrewer2.org/" },
        ],
      }}
      faqs={[
        { question: "Can I change the font?", answer: "The legend uses Arial/Helvetica so it looks the same everywhere. Open the SVG in an editor to change it." },
        { question: "How many entries can I add?", answer: "Up to 40." },
        { question: "Why is my PNG background white?", answer: "Untick Background and tick Transparent before downloading." },
        { question: "What is the difference between a legend and a key?", answer: "Nothing — they are two names for the same thing." },
      ]}
    >
      <LegendMakerTool />
    </ToolPageLayout>
  );
}
