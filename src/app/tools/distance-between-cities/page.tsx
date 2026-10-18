import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DistanceCitiesTool from "@/components/DistanceCitiesTool";
import { requireTool } from "@/config/tools";

const SLUG = "distance-between-cities";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Distance Between Cities: Miles Between US Cities and Towns",
  description:
    "How many miles between two US cities? Choose any of 32,000 Census cities and towns and get the straight-line and driving distance, drive time and distances to the largest US cities.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the distance between two cities",
        steps: [
          { name: "Type the first city", text: "Start typing and pick from the suggestions, or write it as City, ST." },
          { name: "Type the second city", text: "Ambiguous names like Springfield show a list of matches to choose from." },
          { name: "Read the distance", text: "Straight-line miles first, then the driving distance and time." },
          { name: "Compare with big cities", text: "The table lists the distance from your first city to the ten largest US cities." },
        ],
      }}
      uses={{
        heading: "Why people compare city distances",
        items: [
          { title: "Road trip planning", body: "See how far apart the stops are before choosing a route." },
          { title: "Relocation", body: "Compare how far a new city is from family or a current job." },
          { title: "Sports and school travel", body: "Distances between game or campus towns." },
          { title: "Business territories", body: "How far a rep's cities are from the home office." },
          { title: "Choosing a flight or a drive", body: "Under a few hundred miles, driving is often comparable door to door." },
          { title: "Shipping estimates", body: "City-to-city mileage for a freight or moving quote." },
          { title: "Trivia and geography", body: "Which big city is closest to a small town?" },
          { title: "Small towns", body: "Every Census place is included, down to villages and unincorporated communities (CDPs)." },
        ],
      }}
      dataSection={{
        heading: "Where the cities and distances come from",
        paragraphs: [
          "The list of cities is the Census Bureau's 2024 Gazetteer of places: every incorporated city, town, village and borough and every Census Designated Place in the 50 states, DC and Puerto Rico, each with an internal point near its middle, its land area and its 2019–2023 American Community Survey population.",
          "Straight-line distances are measured between those internal points with Vincenty's formula on the WGS84 ellipsoid, so they are city-centre to city-centre, not edge to edge.",
          "Driving distances and times come from OSRM over OpenStreetMap roads on the FOSSGIS servers, at typical speeds with no traffic.",
        ],
        sources: [
          { label: "Census Bureau Gazetteer files", href: "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html" },
          { label: "American Community Survey summary file", href: "https://www.census.gov/programs-surveys/acs/data/summary-file.html" },
          { label: "OSRM API documentation", href: "https://project-osrm.org/docs/v5.24.0/api/" },
          { label: "FOSSGIS routing service", href: "https://routing.openstreetmap.de/about.html" },
        ],
      }}
      faqs={[
        { question: "Where is the 'centre' of a city?", answer: "The Census Bureau's internal point for the place, which lies inside its boundary near the middle. Downtown may be elsewhere, especially in large or oddly shaped cities." },
        { question: "Why can't I find my town?", answer: "Only places the Census Bureau recognises are listed. Some neighbourhoods and postal names are not separate places — try the nearest city, or use Distance Between Two Places with an address." },
        { question: "What is a CDP?", answer: "A Census Designated Place: a named community with no city government, defined for statistics." },
        { question: "Does it cover cities outside the US?", answer: "No. For anywhere in the world, use Distance Between Two Places." },
        { question: "How accurate is the driving time?", answer: "It assumes typical road speeds and no traffic or stops, so real trips usually take longer." },
        { question: "Is the population current?", answer: "It is the American Community Survey 2019–2023 five-year estimate, the most recent release for all places." },
      ]}
    >
      <DistanceCitiesTool />
    </ToolPageLayout>
  );
}
