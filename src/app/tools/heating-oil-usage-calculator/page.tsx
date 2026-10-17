import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import FuelUsageTool from "@/components/FuelUsageTool";
import { requireTool } from "@/config/tools";
import { EIA_BTU_URL } from "@/lib/fuel-use";

const SLUG = "heating-oil-usage-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Heating Oil Usage Calculator: Gallons per Day and Tank Life",
  description:
    "Enter your oil burner's nozzle size (GPH) and run time, appliance ratings, or heat load and get the heating oil used per day and per month, how many days your tank will last and the cost.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HeatingOilPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate heating oil usage",
        steps: [
          { name: "Find the nozzle size", text: "The firing rate in gallons per hour (GPH) is stamped on the burner nozzle or listed on the service tag." },
          { name: "Estimate burner run time", text: "Hours per day the burner actually fires." },
          { name: "Or use Btu ratings or heat load", text: "Switch modes if you know appliance Btu/h or a daily heat need." },
          { name: "Enter the oil on hand", text: "Gallons in the tank now, for days remaining." },
          { name: "Add the price", text: "Optional, for cost per day and month." },
        ],
      }}
      uses={{
        heading: "10 situations where a heating oil usage calculator helps",
        items: [
          { title: "Timing a delivery", body: "Days remaining from the gallons in the tank and your daily use." },
          { title: "Budgeting a winter", body: "Monthly gallons × price." },
          { title: "After a burner service", body: "A smaller nozzle changes gallons per burner hour." },
          { title: "Comparing boilers", body: "Btu input ratings turned into gallons." },
          { title: "Checking delivery bills", body: "Compare gallons delivered with expected use." },
          { title: "Cold snaps", body: "See how longer run times shorten tank life." },
          { title: "Choosing a tank size", body: "How often a 275 or 330 gallon tank would need filling at your use." },
          { title: "Switching fuels", body: "Btu figures for comparison with propane or electric." },
          { title: "Rental properties", body: "Estimate oil costs for a tenant's heating." },
          { title: "Water heating from the boiler", body: "Add the hours the burner fires for hot water." },
        ],
      }}
      dataSection={{
        heading: "Where the numbers come from",
        paragraphs: [
          "An oil burner's nozzle is rated in gallons per hour, so oil burned = nozzle GPH × burner hours. When you start from appliance ratings, gallons = Btu per hour × hours ÷ 138,500, the U.S. Energy Information Administration's heat content for heating oil (1 gallon = 138,500 Btu). From a delivered heat load, the page divides by the appliance's efficiency first.",
          "Days remaining = gallons in the tank ÷ gallons per day; monthly figures use 30 days.",
          "Limits: burner run time is the big unknown and swings with outdoor temperature; one daily figure is an average. Tank gauges show fractions of the tank, and the bottom of a tank isn't all usable. Everything runs in your browser.",
        ],
        sources: [{ label: "U.S. Energy Information Administration — British thermal units (Btu)", href: EIA_BTU_URL, note: "1 gallon of heating oil = 138,500 Btu" }],
      }}
      faqs={[
        { question: "How much oil does my furnace use per hour?", answer: "About the nozzle's rating: a 0.85 GPH nozzle burns 0.85 gallons for every hour the burner runs." },
        { question: "How long will 200 gallons of heating oil last?", answer: "200 ÷ your gallons per day. At 5 gallons a day, 40 days." },
        { question: "How many Btu are in a gallon of heating oil?", answer: "138,500 according to the EIA." },
        { question: "How do I find burner run time?", answer: "Some controls log it; otherwise time the burner over a day, or estimate from past deliveries and dates." },
        { question: "Why does usage vary so much?", answer: "Heating demand depends on outdoor temperature, so run time changes day to day." },
        { question: "Does this include hot water?", answer: "If the boiler heats your water, include those burner hours too." },
      ]}
    >
      <FuelUsageTool fuel="oil" />
    </ToolPageLayout>
  );
}
