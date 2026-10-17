import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import LawnMowingCostTool from "@/components/LawnMowingCostTool";
import { requireTool } from "@/config/tools";
import { HANNA_URL } from "@/lib/lawn-mowing-cost";

const SLUG = "lawn-mowing-cost-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Lawn Mowing Cost Calculator: Price per Mow from Your Costs",
  description:
    "Enter the lawn area, mower deck width, speed and your labour, fuel and other costs and get how long each mow takes and a price per visit, per month and per 1,000 square feet.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function LawnMowingCostPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to price a lawn mowing job",
        steps: [
          { name: "Measure the grass", text: "The mowed area in square feet (or measure it on a map tool)." },
          { name: "Describe the mower", text: "Deck width in inches, a realistic speed and field efficiency." },
          { name: "Add the other time", text: "Trimming, edging, blowing and travel minutes." },
          { name: "Enter your costs", text: "Labour rate, fuel and other per-visit costs, then your markup." },
          { name: "Read the price", text: "Per visit, per month, and per 1,000 ft² for comparing yards." },
        ],
      }}
      uses={{
        heading: "10 situations where a lawn mowing cost calculator helps",
        items: [
          { title: "Quoting a new customer", body: "Price from the yard's size and your costs instead of guessing." },
          { title: "Starting a mowing business", body: "See whether your planned rate covers fuel, wear and your time." },
          { title: "Upgrading the mower", body: "Compare a 21 in walk-behind with a 48 in rider on the same yard." },
          { title: "Pricing large lots", body: "Acre-plus properties where time dominates the price." },
          { title: "Monthly contracts", body: "Visits per month turn a per-mow price into a contract figure." },
          { title: "Raising prices", body: "See what a fuel or wage increase does to each visit." },
          { title: "Route planning", body: "Travel minutes show how much a far-away customer really costs." },
          { title: "Homeowners comparing quotes", body: "Check whether a quote is in line with the time involved." },
          { title: "Teen lawn businesses", body: "A simple way to set a fair price." },
          { title: "Per-1,000 ft² rates", body: "Compare yards of different sizes on one rate." },
        ],
      }}
      dataSection={{
        heading: "How the time and price are worked out",
        paragraphs: [
          "Mowing time uses the field-capacity formula used for farm machinery: acres per hour = width (ft) × speed (mph) × field efficiency ÷ 8.25. The 8.25 is unit conversion — 43,560 square feet in an acre divided by 5,280 feet in a mile. Mark Hanna of Iowa State University describes theoretical capacity as 'equipment swath width times field travel speed' and field efficiency as the actual useful work versus the work theoretically possible; turning, overlap and stops are what take it below 100%.",
          "Price = (mowing time + trimming/edging/blowing + travel) × labour rate + fuel + other per-visit costs, then your markup. Monthly price is the per-visit price × visits.",
          "Limits: every rate is yours. The page has no data on what mowing costs in your area. Slopes, gates, obstacles, tall or wet grass and bagging all slow a crew down; time a few real yards and adjust the efficiency until the estimate matches what you see. Everything runs in your browser.",
        ],
        sources: [{ label: "Mark Hanna (Iowa State University) — Farm field equipment: efficiency versus capacity", href: HANNA_URL, note: "Theoretical capacity and field efficiency definitions" }],
      }}
      faqs={[
        { question: "How do I calculate how long it takes to mow a lawn?", answer: "Acres ÷ (deck width in ft × speed in mph × efficiency ÷ 8.25) gives hours. A 21 in mower at 3 mph and 70% efficiency covers about 0.45 acres an hour." },
        { question: "How much should I charge to mow a lawn?", answer: "The page doesn't set a rate. It builds a price from your labour rate, costs and markup so the job covers what it costs you." },
        { question: "What efficiency should I use?", answer: "Your own measured figure. Hanna reports about 80% for farm mower-conditioners; small yards with many turns and obstacles are usually lower. Time a few jobs to calibrate." },
        { question: "How do I measure lawn square footage?", answer: "Break the lawn into rectangles and add them, or use a map tool's area measure, then subtract beds and the house." },
        { question: "Why include travel time?", answer: "Driving between jobs is paid time and fuel; leaving it out underprices distant yards." },
        { question: "How do I price per 1,000 square feet?", answer: "The page divides the per-visit price by the area and multiplies by 1,000." },
      ]}
    >
      <LawnMowingCostTool />
    </ToolPageLayout>
  );
}
