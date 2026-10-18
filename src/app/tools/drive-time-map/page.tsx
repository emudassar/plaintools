import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DriveTimeMapTool from "@/components/DriveTimeMapTool";
import { requireTool } from "@/config/tools";

const SLUG = "drive-time-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Drive Time Map: How Far Can I Drive in 30 Minutes?",
  description:
    "Map the area you can reach in 10, 20 or 30 minutes (or any time up to 60) by car, bike or on foot from any address, with each zone's size and, in the US, how many people live inside it.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to make a drive time map",
        steps: [
          { name: "Choose how you travel", text: "Driving, cycling or walking." },
          { name: "Set the minutes", text: "Up to four times, each up to 60 minutes — for example 10, 20, 30." },
          { name: "Pick the starting point", text: "Search an address, use your location or click the map." },
          { name: "Read the zones", text: "Each coloured area is reachable within that many minutes; the table lists their area and population." },
        ],
      }}
      uses={{
        heading: "What drive-time maps are used for",
        items: [
          { title: "Choosing where to live", body: "See what is within a 20-minute commute of work." },
          { title: "Store and clinic location", body: "How many people live within 15 minutes' drive." },
          { title: "Delivery zones", body: "Set a delivery area by time, not just radius." },
          { title: "Emergency coverage", body: "Rough reach of a station within a response time." },
          { title: "Job searches", body: "Which towns are within an hour." },
          { title: "Walking catchments", body: "Who can walk to a school or transit stop in 10 minutes." },
          { title: "Marketing", body: "Target ads to the area within a drive time of a shop." },
          { title: "Real estate", body: "Compare the reach of two candidate sites." },
        ],
      }}
      dataSection={{
        heading: "How the zones are calculated",
        paragraphs: [
          "The zones (isochrones) come from Valhalla, an open-source routing engine, on the FOSSGIS servers behind openstreetmap.org's routing. Valhalla explores the OpenStreetMap road and path network outward from the start at typical speeds for each road type and draws the boundary of what is reachable within each time, then smooths it.",
          "Times assume no traffic, no stops and free-flowing roads, so real reach at rush hour is smaller.",
          "Zone areas are measured on the WGS84 ellipsoid. In the US the page estimates how many people live in each zone by adding up the Census tracts (2019–2023 American Community Survey population) whose internal point falls inside it; tracts straddling the edge count wholly in or out.",
        ],
        sources: [
          { label: "Valhalla isochrone API", href: "https://valhalla.github.io/valhalla/api/isochrone/api-reference/" },
          { label: "FOSSGIS routing service", href: "https://routing.openstreetmap.de/about.html" },
          { label: "Census Bureau Gazetteer files (tract points)", href: "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html" },
          { label: "American Community Survey summary file", href: "https://www.census.gov/programs-surveys/acs/data/summary-file.html" },
        ],
      }}
      faqs={[
        { question: "Does it include traffic?", answer: "No. It assumes free-flowing roads; peak-hour reach is smaller." },
        { question: "Why is the shape so irregular?", answer: "Highways stretch the area along their length; rivers, mountains and water squeeze it." },
        { question: "Why is there a hole in a zone?", answer: "Areas with no roads inside the reachable zone (lakes, parks, airports) can appear as holes." },
        { question: "How accurate is the population?", answer: "It is an estimate from Census tracts, which hold about 4,000 people each; edge tracts are counted wholly in or out." },
        { question: "Can I go beyond 60 minutes?", answer: "Not here — the free service is kept to light use." },
        { question: "Is it available outside the US?", answer: "The zones work anywhere OpenStreetMap has roads. Population counts are US-only." },
      ]}
    >
      <DriveTimeMapTool />
    </ToolPageLayout>
  );
}
