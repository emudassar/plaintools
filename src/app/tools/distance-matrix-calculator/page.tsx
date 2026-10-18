import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DistanceMatrixTool from "@/components/DistanceMatrixTool";
import { requireTool } from "@/config/tools";

const SLUG = "distance-matrix-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Distance Matrix Calculator: Road Distances Between Many Places",
  description:
    "Build a distance matrix: the road distance and travel time between every pair of up to 20 places, or straight-line distances, as a table you can download as CSV.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to build a distance matrix",
        steps: [
          { name: "List the places", text: "One per line, up to 20 — addresses, cities or coordinates." },
          { name: "Choose the travel mode", text: "Driving, cycling or walking." },
          { name: "Build the matrix", text: "Each place is looked up, then one request gets every pair." },
          { name: "Switch the view", text: "Miles, kilometres, minutes or straight-line miles, and download the table as CSV." },
        ],
      }}
      uses={{
        heading: "What a distance matrix is for",
        items: [
          { title: "Logistics planning", body: "Feed pairwise road distances into a spreadsheet or optimiser." },
          { title: "Choosing a location", body: "Compare how far a candidate site is from every customer." },
          { title: "Mileage tables", body: "Make a printed distance chart between branches." },
          { title: "Research", body: "Travel times between towns for an analysis." },
          { title: "Event planning", body: "Travel times between venues and hotels." },
          { title: "Field service", body: "Distances between technicians and job sites." },
        ],
      }}
      dataSection={{
        heading: "Where the numbers come from",
        paragraphs: [
          "Road distances and times come from the OSRM table service on the FOSSGIS servers, over OpenStreetMap roads, at typical speeds with no traffic. A–B can differ from B–A because of one-way streets and turn rules.",
          "Straight-line distances are Vincenty geodesics on the WGS84 ellipsoid.",
          "Places are found with the Photon geocoder from OpenStreetMap data; check the matched names in the first column.",
        ],
        sources: [
          { label: "OSRM API documentation (table service)", href: "https://project-osrm.org/docs/v5.24.0/api/" },
          { label: "FOSSGIS routing service", href: "https://routing.openstreetmap.de/about.html" },
          { label: "Vincenty (1975)", href: "https://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf" },
        ],
      }}
      faqs={[
        { question: "Why is A to B different from B to A?", answer: "One-way streets, turn restrictions and ramps mean the best route is not always the same in both directions." },
        { question: "What does 'no route' mean?", answer: "There is no connected road between those points in OpenStreetMap — for example an island without a ferry route mapped." },
        { question: "How many places can I include?", answer: "Up to 20 (400 pairs). The free routing service asks for light use." },
        { question: "Can I get the matrix into Excel?", answer: "Yes, download the CSV and open it in any spreadsheet." },
        { question: "Does it include traffic?", answer: "No. Times assume typical speeds and no delays." },
      ]}
    >
      <DistanceMatrixTool />
    </ToolPageLayout>
  );
}
