import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BoatFuelCostTool from "@/components/BoatFuelCostTool";
import { requireTool } from "@/config/tools";

const SLUG = "boat-fuel-cost-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Boat Fuel Cost Calculator: Trip Cost, Gallons and MPG",
  description:
    "Work out the fuel cost of a boat trip from your burn rate and engine hours, or distance and speed. Gives gallons or litres, cost per hour and per mile, and the rule-of-thirds fuel to carry.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function BoatFuelCostCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out a boat trip's fuel cost",
        steps: [
          { name: "Enter the burn rate", text: "Use gallons or litres per hour from a fuel-flow gauge or your engine maker's performance data. With no figure, estimate from horsepower (a full-throttle gasoline average)." },
          { name: "Set the engines", text: "Enter how many engines run; the burn is per engine." },
          { name: "Enter the trip", text: "Give engine hours, or the distance and the average speed you will hold." },
          { name: "Add the fuel price", text: "Enter what you pay per gallon or litre at the dock to see the trip cost, cost per hour and cost per mile." },
        ],
      }}
      uses={{
        heading: "10 situations where a boat fuel cost calculation helps",
        items: [
          { title: "Splitting costs with friends", body: "A day on the water at 8 gph for 4 hours and $5 a gallon is $160 in fuel, which is easy to share before leaving the dock." },
          { title: "Planning an offshore run", body: "Distance and cruising speed give the fuel for the run, and the rule of thirds gives what to carry." },
          { title: "Checking the tank is big enough", body: "Entering the tank capacity shows whether the trip fits inside two thirds of it." },
          { title: "Pricing a charter or guide trip", body: "Cost per hour turns fuel into a line on a quote." },
          { title: "Comparing cruise speeds", body: "Running the same distance at two speeds with their burn rates shows which costs less." },
          { title: "Twin-engine boats", body: "The engines field doubles the burn without adding gauge readings by hand." },
          { title: "Litres and euros", body: "Switch to litres and enter the price per litre for fuel bought outside the US." },
          { title: "Budgeting a season", body: "Total engine hours for the season and an average burn give the year's fuel bill." },
          { title: "Rough figure before buying a boat", body: "With no gauge data yet, the horsepower estimate gives a full-throttle upper figure for a gasoline boat." },
          { title: "Miles per gallon", body: "Distance mode shows nautical, statute or kilometre range per unit of fuel." },
        ],
      }}
      dataSection={{
        heading: "How the cost is worked out",
        paragraphs: [
          "Fuel used = burn rate per engine × number of engines × engine hours. In distance mode, hours = distance ÷ average speed. Cost = fuel × your price per gallon or litre. Miles per gallon = distance ÷ fuel, which is the same as speed ÷ burn rate — the method North Carolina Sea Grant gives (17 knots at 12.5 gph is about 1.4 nautical miles per gallon).",
          "The horsepower estimate uses NC Sea Grant's figure that two- and four-stroke gasoline engines on planing hulls burn about one gallon per hour for every 10 horsepower at full throttle, averaged across makes and models. Its own example is a 250-hp four-stroke outboard at 25 gph at full throttle and 12.5 gph at 77.5% of rated output — so at cruise the real burn can be about half the estimate. No diesel figure is given in that source, so none is offered here.",
          "The reserve uses NC Sea Grant's rule of thirds: a third to get there, a third to get back and a third as a safety margin. If your trip is out and back, the fuel aboard at the start is 1.5 × the fuel the trip uses. Everything is calculated in your browser; nothing is stored.",
          "Limits: a single burn rate cannot capture throttle changes, load, hull condition, sea state, current or wind, or idling time. The page reports arithmetic on your figures; it is not a substitute for checking the fuel gauge and planning for conditions.",
        ],
        sources: [
          { label: "North Carolina Sea Grant, Coastwatch: Running your boat by the numbers (2014)", href: "https://ncseagrant.ncsu.edu/coastwatch/on-the-water-save-fuel-money-running-your-boat-by-the-numbers/", note: "1 gph per 10 hp at full throttle (gasoline, planing hulls); 250-hp example; nmpg = knots ÷ gph; rule of thirds" },
          { label: "NIST Handbook 44, Appendix C", href: "https://www.nist.gov/pml/owm/publications/nist-handbooks/handbook-44", note: "1 US gallon = 3.785411784 litres" },
        ],
      }}
      faqs={[
        { question: "How do I calculate the fuel cost of a boat trip?", answer: "Multiply the burn rate (gallons per hour) by engine hours to get gallons, then by the price per gallon. For distance, hours = distance ÷ speed." },
        { question: "How many gallons per hour does a boat engine burn?", answer: "It depends on the engine and throttle. NC Sea Grant gives about 1 gallon per hour per 10 horsepower at full throttle for gasoline engines on planing hulls, and an example where throttling back to 77.5% of rated output halved the burn." },
        { question: "How do I work out my boat's miles per gallon?", answer: "Divide your speed by your burn rate in gallons per hour. 17 knots at 12.5 gph is about 1.4 nautical miles per gallon." },
        { question: "What is the rule of thirds for boat fuel?", answer: "Use a third of the fuel to get there, a third to get back and keep a third in reserve. A round trip using 30 gallons means carrying 45." },
        { question: "Does the horsepower estimate work for diesel?", answer: "No. The source used here only gives a figure for gasoline engines, so the estimate is gasoline-only. Enter a diesel's burn rate directly." },
        { question: "Where do I find my real burn rate?", answer: "From a fuel-flow gauge or engine display, from your engine maker's performance data for your boat, or by dividing the fuel needed to refill the tank by the engine hours since the last fill." },
        { question: "Can I use litres?", answer: "Yes. Switch the fuel unit to litres and enter the burn rate and price per litre." },
      ]}
    >
      <BoatFuelCostTool />
    </ToolPageLayout>
  );
}
