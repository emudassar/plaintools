import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GasCostTool from "@/components/GasCostTool";
import { requireTool } from "@/config/tools";

const SLUG = "gas-cost-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Gas Cost Calculator for a Road Trip (Split by Riders)",
  description:
    "Enter the trip distance, your car's mpg and the gas price — or look up the driving distance — and get the fuel cost one way or round trip, split between riders.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function GasCostCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out the gas cost of a trip",
        steps: [
          { name: "Get the distance", text: "Type it, or enter start and destination and press Get distance." },
          { name: "Enter your car's fuel economy", text: "Miles per gallon, or L/100 km in metric mode." },
          { name: "Enter the gas price", text: "Per gallon or per litre." },
          { name: "Choose round trip and riders", text: "The result shows the total and each person's share." },
        ],
      }}
      uses={{
        heading: "10 trips where knowing the fuel cost helps",
        items: [
          { title: "Splitting gas with friends", body: "Four friends driving to a festival split the fuel cost fairly." },
          { title: "Road trip budgets", body: "A family budgets fuel for a week-long drive." },
          { title: "Driving versus flying", body: "A traveller compares the fuel cost of driving with airfare." },
          { title: "Commuting", body: "A worker prices a daily commute by car." },
          { title: "Carpool payments", body: "A driver works out what to ask carpool riders to chip in." },
          { title: "Moving with a rental truck", body: "Someone moving checks the fuel for a truck with low mpg." },
          { title: "Comparing two cars", body: "A family sees how much a more efficient car saves on a trip." },
          { title: "Business mileage", body: "A contractor estimates fuel for a job site visit." },
          { title: "College move-in", body: "Parents price the drive to campus and back." },
          { title: "Holiday visits", body: "Someone plans the fuel for a holiday trip to relatives." },
        ],
      }}
      dataSection={{
        heading: "How the fuel cost is worked out",
        paragraphs: [
          "Fuel = distance ÷ mpg (or distance × L/100 km ÷ 100); cost = fuel × price; each share = cost ÷ people. Round trip doubles the distance.",
          "The optional distance lookup finds both places with Photon (OpenStreetMap) and the road route with OSRM on the FOSSGIS servers, over OpenStreetMap roads.",
          "Limits: real fuel use changes with speed, load, air conditioning, hills, traffic and tyre pressure. Tolls, parking and wear are not included. Fuel prices change daily.",
        ],
        sources: [
          { label: "OSRM API", href: "https://project-osrm.org/docs/v5.24.0/api/" },
          { label: "FOSSGIS routing servers", href: "https://routing.openstreetmap.de/about.html" },
        ],
      }}
      faqs={[
        { question: "How do I calculate gas cost for a trip?", answer: "Divide the distance by your car's mpg to get gallons, then multiply by the price per gallon." },
        { question: "How much gas for 300 miles at 30 mpg?", answer: "10 gallons. At $3.50 a gallon, $35." },
        { question: "Should I use city or highway mpg?", answer: "Highway mpg suits long trips at steady speed; city mpg suits stop-and-go driving." },
        { question: "Does it work in kilometres?", answer: "Yes. Switch the units to kilometres, L/100 km and price per litre." },
        { question: "How do I split gas money fairly?", answer: "Enter the number of people sharing; the page divides the total evenly." },
        { question: "Is the driving distance exact?", answer: "It is the OSRM route over OpenStreetMap roads; your own route may differ." },
      ]}
    >
      <GasCostTool />
    </ToolPageLayout>
  );
}
