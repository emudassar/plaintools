import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import EarthLineTool from "@/components/EarthLineTool";
import { requireTool } from "@/config/tools";

const SLUG = "equator-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Equator Map: Countries on the Equator",
  description:
    "Map of the Equator with every country it passes through, where it crosses each and how far it runs over land, plus how far any place is from the Equator.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to use the Equator map",
        steps: [
          { name: "See the line", text: "The red line is 0° latitude, drawn around the world." },
          { name: "Pick a country", text: "Click a name in the table to highlight its stretch of the Equator." },
          { name: "Check a place", text: "Search a place or click the map to see how far north or south of the Equator it is." },
        ],
      }}
      uses={{
        heading: "Why people look up the Equator",
        items: [
          { title: "Geography homework", body: "Which countries does the Equator pass through?" },
          { title: "Travel", body: "Visit an Equator monument in Ecuador, Kenya or Uganda." },
          { title: "Climate", body: "Places near the Equator have little seasonal change in day length." },
          { title: "Space launches", body: "Launch sites near the Equator get the most help from the Earth's spin." },
          { title: "Sailing", body: "Crossing the line is a maritime tradition." },
          { title: "Curiosity", body: "How far am I from the Equator?" },
        ],
      }}
      dataSection={{
        heading: "How the crossings were worked out",
        paragraphs: [
          "The Equator (0° latitude) was intersected with every country outline in Natural Earth's 1:10 million Admin 0 dataset. Each stretch of land is measured along the Equator on the WGS84 ellipsoid, where one degree of longitude is about 111.3 km.",
          "Lists of 'countries on the Equator' often also include São Tomé and Príncipe, where the line crosses the islet of Ilhéu das Rolas, and the Maldives and Kiribati, where it crosses only their waters; features that small are not in this outline data.",
          "Distances from a place are measured north or south along its meridian on the WGS84 ellipsoid.",
        ],
        sources: [
          { label: "Natural Earth 1:10m countries", href: "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/" },
          { label: "NOAA NGS: geodetic tools and WGS84", href: "https://geodesy.noaa.gov/TOOLS/" },
        ],
      }}
      faqs={[
        { question: "How many countries are on the Equator?", answer: "Ten on land in this data: Ecuador, Colombia, Brazil, Gabon, the Republic of the Congo, the Democratic Republic of the Congo, Uganda, Kenya, Somalia and Indonesia. São Tomé and Príncipe, the Maldives and Kiribati are often added for islets and waters." },
        { question: "How long is the Equator?", answer: "About 40,075 km (24,901 mi) around." },
        { question: "Is it hot everywhere on the Equator?", answer: "No — the Andes and the mountains of East Africa are cool, and Ecuador's Cayambe volcano has snow on the line." },
        { question: "Does water drain the other way across the Equator?", answer: "No. The Coriolis effect is far too weak to steer a sink or toilet; the demonstrations at Equator monuments are tricks." },
        { question: "Which is the closest big city?", answer: "Quito, Kampala, Singapore and Nairobi are all within about 150 km." },
      ]}
    >
      <EarthLineTool line="equator" />
    </ToolPageLayout>
  );
}
