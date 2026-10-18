import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import RadiusListTool from "@/components/RadiusListTool";
import { requireTool } from "@/config/tools";

const SLUG = "cities-within-radius";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Cities Within a Radius: Find Towns Within X Miles",
  description:
    "List every city and town within a radius of an address — nearest first, with population and type. Filter by size or to incorporated cities only, and download as CSV.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find cities within a radius",
        steps: [
          { name: "Set the radius", text: "Type a distance in miles or kilometres (up to 250 miles)." },
          { name: "Filter if you like", text: "Set a minimum population, or tick 'incorporated only' to leave out Census Designated Places." },
          { name: "Choose the centre", text: "Address, place, ZIP code, your location, or a click on the map." },
          { name: "Read and download", text: "Cities and towns nearest first, with distance, population and type; download as CSV." },
        ],
      }}
      uses={{
        heading: "Why people list nearby cities",
        items: [
          { title: "Service-area pages", body: "List the towns a business serves." },
          { title: "Job searches", body: "Cities within commuting distance." },
          { title: "Moving", body: "Towns near a new job to look at." },
          { title: "Sales territories", body: "Cities within a rep's range." },
          { title: "Event marketing", body: "Towns to promote an event in." },
          { title: "Road trips", body: "Towns within a day's drive." },
          { title: "Local SEO", body: "Nearby city names for a location page." },
          { title: "Research", body: "Count settlements around a site." },
        ],
      }}
      dataSection={{
        heading: "Where the cities come from",
        paragraphs: [
          "The places are the Census Bureau's 2024 Gazetteer: every incorporated city, town, village and borough, and every Census Designated Place (named communities without a city government), in the 50 states, DC and Puerto Rico, each with an internal point.",
          "A place is listed when its internal point is within the radius, measured as a straight line on the WGS84 ellipsoid. Large cities can reach into the circle without their point being inside it.",
          "Population is the American Community Survey 2019–2023 five-year estimate.",
        ],
        sources: [
          { label: "Census Bureau Gazetteer files", href: "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html" },
          { label: "Census Bureau: places", href: "https://www.census.gov/programs-surveys/bas/information/cdp.html" },
          { label: "American Community Survey summary file", href: "https://www.census.gov/programs-surveys/acs/data/summary-file.html" },
        ],
      }}
      faqs={[
        { question: "What is a Census Designated Place?", answer: "A named community with no municipal government, defined by the Census Bureau for statistics. Tick 'incorporated only' to hide them." },
        { question: "Why is a nearby big city missing?", answer: "Its internal point may lie just outside the circle. Increase the radius slightly." },
        { question: "Does it include neighbourhoods?", answer: "No — only places the Census Bureau defines." },
        { question: "Is the distance by road?", answer: "No, straight-line. Road distances are longer." },
        { question: "Can I use it outside the US?", answer: "No; the list is US Census places." },
      ]}
    >
      <RadiusListTool mode="city" />
    </ToolPageLayout>
  );
}
