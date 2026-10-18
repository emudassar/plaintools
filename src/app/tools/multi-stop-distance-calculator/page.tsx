import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import MultiStopTool from "@/components/MultiStopTool";
import { requireTool } from "@/config/tools";

const SLUG = "multi-stop-distance-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Multi-Stop Distance Calculator: Route Mileage With Several Stops",
  description:
    "Calculate the total distance and time of a trip with multiple stops by car, bike or on foot, leg by leg, in your order or reordered for the shortest route, one way or round trip.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate a route with several stops",
        steps: [
          { name: "List the stops", text: "One per line — addresses, places or coordinates, up to 25." },
          { name: "Choose the options", text: "Travel mode, whether to keep your order or find the shortest order, and whether to return to the start." },
          { name: "Calculate", text: "The stops are looked up one by one, then routed." },
          { name: "Read the total and each leg", text: "Total distance and time first, then a table of legs you can download as CSV." },
        ],
      }}
      uses={{
        heading: "Who uses a multi-stop calculator",
        items: [
          { title: "Delivery drivers", body: "Total mileage for a day's drops, and a shorter order to visit them in." },
          { title: "Sales and service calls", body: "Plan a day of visits and log the mileage." },
          { title: "Mileage reimbursement", body: "Leg-by-leg distances to attach to an expense claim." },
          { title: "Road trips", body: "How long a trip with several stops will take." },
          { title: "School and club runs", body: "Pickups in a sensible order." },
          { title: "Real-estate showings", body: "Plan a route through several houses." },
          { title: "Errands", body: "The shortest loop through the bank, store and post office." },
          { title: "Cycling tours", body: "Distance between overnight stops by bike." },
        ],
      }}
      dataSection={{
        heading: "How the route is calculated",
        paragraphs: [
          "Each stop is found with the Photon geocoder (OpenStreetMap), one at a time. Coordinates are used as typed.",
          "The route is calculated by OSRM on the FOSSGIS servers over OpenStreetMap roads. 'As I listed them' routes through the stops in order. 'Shortest order' uses OSRM's trip service, which solves the travelling-salesman problem with a fast heuristic: usually the best order, but not guaranteed to be optimal. The first stop is kept as the start (and, one way, the last stop as the end).",
          "Times assume typical road speeds with no traffic, parking or time at each stop.",
        ],
        sources: [
          { label: "OSRM API documentation (route and trip services)", href: "https://project-osrm.org/docs/v5.24.0/api/" },
          { label: "FOSSGIS routing service", href: "https://routing.openstreetmap.de/about.html" },
          { label: "Photon geocoder", href: "https://photon.komoot.io" },
        ],
      }}
      faqs={[
        { question: "How many stops can I add?", answer: "Up to 25. The free routing service asks for light use; for larger fleets a commercial route optimiser is the right tool." },
        { question: "Is the 'shortest order' truly optimal?", answer: "It is a heuristic answer from OSRM's trip service — usually optimal or very close for a few dozen stops, but not guaranteed." },
        { question: "Does it add time at each stop?", answer: "No, only travel time. Add your stop durations yourself." },
        { question: "Why was a line skipped?", answer: "The geocoder found no match. Add a city or postcode, or paste coordinates." },
        { question: "Can I export the route?", answer: "Yes, the legs download as CSV." },
        { question: "Does it avoid tolls or highways?", answer: "No. It uses the router's default fastest route." },
      ]}
    >
      <MultiStopTool />
    </ToolPageLayout>
  );
}
