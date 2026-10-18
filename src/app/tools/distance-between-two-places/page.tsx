import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DistanceTwoPlacesTool from "@/components/DistanceTwoPlacesTool";
import { requireTool } from "@/config/tools";

const SLUG = "distance-between-two-places";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Distance Between Two Places: Driving and Straight-Line",
  description:
    "Find the distance between any two places or addresses: driving, cycling or walking distance and time, and the straight-line distance, shown on a map.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the distance between two places",
        steps: [
          { name: "Choose how you travel", text: "Driving, cycling or walking. You can switch after the result appears." },
          { name: "Enter both places", text: "Addresses, cities, landmarks or coordinates, anywhere in the world." },
          { name: "Read both distances", text: "The headline gives the route distance and time; the table adds the straight-line distance and how much longer the route is." },
          { name: "Check the map", text: "The orange line is the route; the dashed line is the straight line." },
        ],
      }}
      uses={{
        heading: "When you need the distance between two places",
        items: [
          { title: "Planning a drive", body: "Distance and time without traffic, before checking live traffic in a navigation app." },
          { title: "Mileage claims", body: "Get a route distance between two addresses for a reimbursement form." },
          { title: "Comparing walk, bike and car", body: "Switch the travel mode to see how the route and time change." },
          { title: "Checking a delivery radius", body: "Compare the straight-line and road distance from a shop to a customer." },
          { title: "Moving house", body: "See how far a new home is from work or school by road." },
          { title: "Running and cycling routes", body: "Get the distance of a route between two points on paths and quiet roads." },
          { title: "Shipping and freight quotes", body: "Many quotes start from the road distance between pickup and drop-off." },
          { title: "Settling an argument", body: "How much farther is the drive than the crow-flies distance?" },
        ],
      }}
      dataSection={{
        heading: "Where the distances come from",
        paragraphs: [
          "The straight-line distance is the shortest path over the Earth's surface, computed with Vincenty's formula on the WGS84 ellipsoid.",
          "Route distances and times come from OSRM (Open Source Routing Machine) running on the FOSSGIS servers that power routing on openstreetmap.org, over OpenStreetMap's road and path network. Times assume typical speeds for each kind of road and no traffic, stops or delays, so real trips usually take longer.",
          "Places are found with the Photon geocoder from OpenStreetMap data. Check the matched names on the result; a short name can match a different place than you meant.",
          "The routing service asks that it is used lightly, so this page sends one request when you press the button and none in the background.",
        ],
        sources: [
          { label: "OSRM API documentation", href: "https://project-osrm.org/docs/v5.24.0/api/" },
          { label: "FOSSGIS routing service", href: "https://routing.openstreetmap.de/about.html", note: "usage policy" },
          { label: "Vincenty (1975)", href: "https://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf" },
          { label: "OpenStreetMap copyright", href: "https://www.openstreetmap.org/copyright" },
        ],
      }}
      faqs={[
        { question: "Why is the driving distance so much longer than the straight line?", answer: "Roads follow terrain, rivers, property lines and street grids. Mountains, coastlines and water crossings add the most. The result table shows exactly how much longer this route is." },
        { question: "Does the time include traffic?", answer: "No. It uses typical speeds for each road type with no traffic, stops or roadworks." },
        { question: "Can I measure between countries?", answer: "Yes, wherever OpenStreetMap has connected roads. Across oceans there is no road route and only the straight line is given." },
        { question: "Why does the route differ from my navigation app?", answer: "Different maps, speeds and rules. Commercial apps also use live and historical traffic." },
        { question: "Is the walking route safe?", answer: "It follows mapped paths and roads open to pedestrians, but it does not judge safety, lighting or sidewalks." },
        { question: "Is anything stored?", answer: "No. The two places are sent to the geocoder and router only to calculate the result." },
      ]}
    >
      <DistanceTwoPlacesTool />
    </ToolPageLayout>
  );
}
