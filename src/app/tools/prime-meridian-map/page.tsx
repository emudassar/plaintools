import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import EarthLineTool from "@/components/EarthLineTool";
import { requireTool } from "@/config/tools";

const SLUG = "prime-meridian-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Prime Meridian Map: Countries on 0° Longitude",
  description:
    "Map of the Prime Meridian (0° longitude) with every country it crosses from the United Kingdom to Antarctica, the stretch over land in each, and how far east or west of it any place is.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to use the Prime Meridian map",
        steps: [
          { name: "See the line", text: "0° longitude, from the Arctic to Antarctica." },
          { name: "Explore the countries", text: "Click a name to highlight its stretch." },
          { name: "Check a place", text: "See how far east or west of the meridian it is." },
        ],
      }}
      uses={{
        heading: "Why the Prime Meridian matters",
        items: [
          { title: "Longitude starts here", body: "All east and west longitudes are measured from it." },
          { title: "Visiting Greenwich", body: "The Royal Observatory marks the historic line." },
          { title: "Time zones", body: "GMT, and so UTC, were based on time at Greenwich." },
          { title: "Geography lessons", body: "Which countries does it cross?" },
          { title: "Navigation", body: "Its history is the history of finding longitude at sea." },
        ],
      }}
      dataSection={{
        heading: "Where the line is",
        paragraphs: [
          "The Prime Meridian here is 0° longitude on WGS84, the system GPS uses, which follows the IERS Reference Meridian. That line runs about 102 metres east of the historic Airy transit circle at the Royal Observatory, Greenwich, adopted as the prime meridian in 1884; the difference comes from how the modern reference frame is tied to the Earth's centre of mass.",
          "Crossings were computed by intersecting 0° longitude with Natural Earth's 1:10 million country outlines and measuring each land stretch along the meridian on the WGS84 ellipsoid.",
        ],
        sources: [
          { label: "Malys et al. (2015), Why the Greenwich meridian moved", href: "https://doi.org/10.1007/s00190-015-0844-y" },
          { label: "Natural Earth 1:10m countries", href: "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/" },
        ],
      }}
      faqs={[
        { question: "Which countries are on the Prime Meridian?", answer: "The United Kingdom, France, Spain, Algeria, Mali, Burkina Faso, Togo and Ghana — plus Antarctica." },
        { question: "Why does my phone show 0° about 100 m from the line at Greenwich?", answer: "GPS uses the IERS Reference Meridian, about 102 m east of the historic brass line." },
        { question: "Why Greenwich?", answer: "The 1884 International Meridian Conference chose it, largely because most of the world's charts already used it." },
        { question: "Where does it meet the Equator?", answer: "In the Gulf of Guinea, at 0° N 0° E — open sea." },
      ]}
    >
      <EarthLineTool line="prime-meridian" />
    </ToolPageLayout>
  );
}
