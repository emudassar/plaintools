import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ElectricityCostTool from "@/components/ElectricityCostTool";
import { requireTool } from "@/config/tools";

const SLUG = "electricity-cost-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Electricity Cost Calculator: Cost to Run an Appliance",
  description:
    "Enter an appliance's watts and daily hours of use and get its electricity cost per hour, day, month and year at your state's average residential rate or your own.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ElectricityCostCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out what an appliance costs to run",
        steps: [
          { name: "Find the wattage", text: "On the appliance label or manual. Kilowatts × 1,000 = watts." },
          { name: "Enter hours and days of use", text: "How long it runs each day and how many days a month." },
          { name: "Pick your state or enter your rate", text: "The EIA state average, or your bill's own cents per kWh." },
          { name: "Read the cost", text: "kWh and cost per hour, day, month and year." },
        ],
      }}
      uses={{
        heading: "10 questions about running costs this answers",
        items: [
          { title: "Space heaters", body: "A renter checks what a 1,500 W heater costs for 6 hours a night." },
          { title: "Gaming PCs", body: "A gamer sees the monthly cost of a 500 W rig." },
          { title: "Window air conditioners", body: "A household estimates summer cooling costs." },
          { title: "Old refrigerators", body: "Someone compares an old fridge's running cost with a new one." },
          { title: "Electric vehicle charging", body: "An EV owner estimates the cost of charging at home." },
          { title: "Crypto or server hardware", body: "Someone checks if a device costs more to run than it earns." },
          { title: "Pool pumps and hot tubs", body: "A homeowner sees the yearly cost of a pump." },
          { title: "Dehumidifiers", body: "A basement owner prices running one all summer." },
          { title: "Landlord utility splits", body: "A landlord estimates an appliance's share of a bill." },
          { title: "Comparing states", body: "Someone moving checks how much more the same use costs elsewhere." },
        ],
      }}
      dataSection={{
        heading: "Where the electricity prices come from",
        paragraphs: [
          "kWh = watts × hours ÷ 1,000; cost = kWh × price per kWh. Prices are the average residential price of electricity by state from the U.S. Energy Information Administration's Electric Power Monthly, Table 5.6.A, for August 2026 (preliminary), in cents per kWh.",
          "Your own rate is better: divide your bill's total by the kWh used to get an all-in price including fixed charges and taxes.",
          "Limits: the state figure is a one-month average across all residential customers; tiered and time-of-use rates change the real cost. Label wattage is often the maximum; appliances with thermostats or standby modes use less on average. Use the result for estimates, not billing disputes.",
        ],
        sources: [
          { label: "EIA — Electric Power Monthly, Table 5.6.A", href: "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a" },
        ],
      }}
      faqs={[
        { question: "How do I calculate electricity cost?", answer: "Watts × hours used ÷ 1,000 = kWh; kWh × price per kWh = cost." },
        { question: "How much does it cost to run a 1,500 W heater?", answer: "1.5 kWh per hour. At 18.16¢ per kWh (the August 2026 U.S. average), about 27¢ an hour." },
        { question: "What is a kilowatt-hour?", answer: "1,000 watts used for one hour." },
        { question: "Where do I find my rate?", answer: "On your electric bill: the total charge divided by the kWh used gives your all-in rate." },
        { question: "Why is my bill higher than this?", answer: "Fixed monthly charges, tiered rates and taxes add to the energy cost, and appliances may run longer than you expect." },
        { question: "Which state has the highest electricity price?", answer: "In the August 2026 EIA table, Hawaii, at 47.18¢ per kWh for residential customers." },
      ]}
    >
      <ElectricityCostTool />
    </ToolPageLayout>
  );
}
