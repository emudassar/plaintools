import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import FuelUsageTool from "@/components/FuelUsageTool";
import { requireTool } from "@/config/tools";
import { EIA_BTU_URL } from "@/lib/fuel-use";

const SLUG = "propane-usage-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Propane Usage Calculator: Gallons per Day and Tank Life",
  description:
    "Enter each propane appliance's Btu rating and how long it runs and get the gallons of propane used per day and per month, how many days your tank will last, and the cost — using EIA's 91,452 Btu per gallon.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PropaneUsagePage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate propane usage",
        steps: [
          { name: "List the appliances", text: "Furnace, water heater, range, fireplace, generator, pool heater — with the input rating in Btu per hour from each rating plate." },
          { name: "Estimate run time", text: "Hours each one actually runs per day (burner on), not hours it's switched on." },
          { name: "Enter the gallons on hand", text: "The usable propane in the tank now, if you want days remaining." },
          { name: "Add the price", text: "Optional, for cost per day and month." },
        ],
      }}
      uses={{
        heading: "10 situations where a propane usage calculator helps",
        items: [
          { title: "Timing the next delivery", body: "Days remaining tells you when to call before you run out in a cold snap." },
          { title: "Choosing a tank size", body: "Daily use shows how often a 120, 250 or 500 gallon tank would need filling." },
          { title: "Standby generator run time", body: "A generator's rated Btu input gives gallons per hour of outage." },
          { title: "Pool or spa heater cost", body: "Large heaters burn fast; see the cost per day of heating." },
          { title: "Budgeting a winter", body: "Monthly gallons × price is a heating budget." },
          { title: "Comparing a new appliance", body: "Add a fireplace or range and see what it adds." },
          { title: "Cabins and RVs", body: "Small tanks and cylinders: how many days a fill lasts." },
          { title: "Checking a delivery bill", body: "Compare gallons delivered with what your appliances should have burned." },
          { title: "Construction heaters", body: "Price the propane for heating a job site." },
          { title: "Propane vs electric decisions", body: "The Btu figures put fuel use on a common scale." },
        ],
      }}
      dataSection={{
        heading: "Where the numbers come from",
        paragraphs: [
          "Heat content is the U.S. Energy Information Administration's conversion: 1 gallon of propane = 91,452 Btu. An appliance's rating plate gives its input — the fuel it burns per hour while the burner is on — so gallons per day = Btu per hour × hours running ÷ 91,452. No efficiency is applied to nameplate input, because input is already fuel burned. If you start from a heat load instead (Btu delivered), the page divides by the appliance's efficiency first.",
          "Days remaining = usable gallons in the tank ÷ gallons per day. Monthly figures use 30 days.",
          "Limits: run time is the big unknown. A furnace may run 2 hours on a mild day and 12 on a very cold one, so a single daily figure is an average. Tank gauges show percent of the tank's size, and a tank is not filled to 100%, so enter the gallons actually in it. Everything runs in your browser.",
        ],
        sources: [{ label: "U.S. Energy Information Administration — British thermal units (Btu)", href: EIA_BTU_URL, note: "1 gallon of propane = 91,452 Btu" }],
      }}
      faqs={[
        { question: "How much propane does a 100,000 Btu furnace use per hour?", answer: "100,000 ÷ 91,452 = 1.09 gallons per hour of burner run time." },
        { question: "How do I calculate propane usage?", answer: "Multiply each appliance's Btu per hour by the hours it runs, add them up, and divide by 91,452 Btu per gallon." },
        { question: "How long will my propane tank last?", answer: "Divide the gallons in the tank by your gallons per day. Enter both and the page does it." },
        { question: "Where do I find the Btu rating?", answer: "On the appliance's rating plate or in its manual, listed as input in Btu per hour (Btuh)." },
        { question: "Why is my real usage different?", answer: "Run time changes with weather and habits. Track a week of use between gauge readings and compare." },
        { question: "How many Btu are in a gallon of propane?", answer: "91,452 according to the EIA." },
      ]}
    >
      <FuelUsageTool fuel="propane" />
    </ToolPageLayout>
  );
}
