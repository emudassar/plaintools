import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CountyCitiesMapTool from "@/components/CountyCitiesMapTool";
import { requireTool } from "@/config/tools";

const SLUG = "county-map-with-cities";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "County Map With Cities: Every State's Counties and Towns",
  description:
    "See any state's county map with its cities and towns plotted and labelled. Click a county to list the cities inside it with populations, or see each county's largest city.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to use the county map with cities",
        steps: [
          { name: "Pick a state", text: "The map draws its counties (parishes in Louisiana, boroughs in Alaska) with names." },
          { name: "Choose which cities to show", text: "From every Census place down to cities above 100,000 people." },
          { name: "Click a county", text: "See its population and every city and town whose centre is inside it." },
          { name: "Browse the list", text: "Open the table to see each county's largest city." },
        ],
      }}
      uses={{
        heading: "What a county map with cities helps with",
        items: [
          { title: "Which county is a town in?", body: "Find the town on the map and click the county around it." },
          { title: "Planning sales routes", body: "See the towns in each county you cover." },
          { title: "Genealogy", body: "Locate the county seat region of an ancestor's town." },
          { title: "School projects", body: "A labelled county map of any state." },
          { title: "Relocation", body: "Compare towns within one county." },
          { title: "Local government", body: "Which cities sit in a county's jurisdiction." },
        ],
      }}
      dataSection={{
        heading: "Where the map comes from",
        paragraphs: [
          "County outlines are the Census Bureau's 2024 cartographic boundary files at 1:500,000, simplified for the web and drawn over OpenStreetMap tiles.",
          "Cities and towns are every incorporated place and Census Designated Place in the Census 2024 Gazetteer, drawn at the internal point the Bureau publishes. Each place is assigned to the county that contains that point, so a city that spans several counties is listed under one of them.",
          "Populations are American Community Survey 2019–2023 five-year estimates.",
        ],
        sources: [
          { label: "Census Bureau cartographic boundary files", href: "https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html" },
          { label: "Census Bureau Gazetteer files", href: "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html" },
          { label: "American Community Survey summary file", href: "https://www.census.gov/programs-surveys/acs/data/summary-file.html" },
        ],
      }}
      faqs={[
        { question: "Why is a city listed in only one county?", answer: "Each place is assigned by its internal point. Cities like Kansas City or Atlanta cross county lines; they appear under the county holding that point." },
        { question: "Can I print it?", answer: "Use your browser's print. For printable blank county maps, see the blank maps section." },
        { question: "Why are some places unincorporated?", answer: "Census Designated Places are named communities without a city government; they are included unless you raise the population filter." },
        { question: "Is Connecticut by county?", answer: "Since 2022, Connecticut's Census county-equivalents are nine planning regions, which are what the map shows." },
        { question: "Does it include Puerto Rico?", answer: "Yes, its 78 municipios." },
      ]}
    >
      <CountyCitiesMapTool />
    </ToolPageLayout>
  );
}
