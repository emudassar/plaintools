import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import RadiusListTool from "@/components/RadiusListTool";
import { requireTool } from "@/config/tools";

const SLUG = "population-within-radius";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Population Within a Radius: How Many People Live Within X Miles",
  description:
    "Estimate how many people live within 1, 3, 5 or any number of miles of an address, with population density, from Census tract populations. Compare up to four radii at once.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the population within a radius",
        steps: [
          { name: "Enter the radii", text: "Up to four distances separated by commas — 1, 3, 5 miles is the common retail set." },
          { name: "Choose the centre", text: "Address, place, ZIP code, your location, or click the map." },
          { name: "Read the table", text: "People within each radius, the circle's area and the density." },
          { name: "Move the centre", text: "Click the map to compare another site." },
        ],
      }}
      uses={{
        heading: "Why population within a radius matters",
        items: [
          { title: "Retail site selection", body: "The 1-3-5 mile population is a standard figure in site reports." },
          { title: "Restaurants and gyms", body: "Compare catchments of two candidate sites." },
          { title: "Healthcare planning", body: "Residents within reach of a clinic." },
          { title: "Real estate listings", body: "Population around a commercial property." },
          { title: "Grant applications", body: "People served within a service radius." },
          { title: "Emergency planning", body: "People near a facility." },
          { title: "Advertising", body: "Size the audience around a billboard or store." },
          { title: "Comparing towns", body: "Density around downtowns." },
        ],
      }}
      dataSection={{
        heading: "How the population is estimated",
        paragraphs: [
          "The US is divided into about 85,000 Census tracts, small areas that usually hold between 1,200 and 8,000 people. Each tract has an internal point in the Census 2024 Gazetteer and a population from the American Community Survey 2019–2023 five-year estimates.",
          "The page adds up the population of every tract whose internal point is inside each circle (straight-line distance on WGS84). Tracts that straddle the edge count wholly in or wholly out, so the result is an estimate. It is roughest for small circles and in rural areas, where tracts are large; the table shows how many tracts were counted.",
          "Circle area is the true area of the circle on the Earth (a spherical cap); density is population divided by that area, including any water inside the circle.",
        ],
        sources: [
          { label: "Census Bureau: Census tracts", href: "https://www.census.gov/programs-surveys/geography/about/glossary.html#par_textimage_13" },
          { label: "Census Bureau Gazetteer files", href: "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html" },
          { label: "American Community Survey summary file", href: "https://www.census.gov/programs-surveys/acs/data/summary-file.html" },
        ],
      }}
      faqs={[
        { question: "How accurate is it?", answer: "It is an estimate: tracts on the edge of the circle count wholly in or out. The more tracts a circle holds (see the last column), the less any one edge tract matters; small rural circles are the roughest." },
        { question: "Why does a 1-mile radius show zero?", answer: "No tract's internal point fell inside it. In rural areas tracts can be many miles across; use a larger radius." },
        { question: "Is this daytime or residential population?", answer: "Residential — where people live, not where they work." },
        { question: "How current is it?", answer: "The American Community Survey 2019–2023 five-year estimates." },
        { question: "Does density include water?", answer: "Yes, the circle's whole area is used." },
      ]}
    >
      <RadiusListTool mode="pop" />
    </ToolPageLayout>
  );
}
