import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PoolHeaterSizeTool from "@/components/PoolHeaterSizeTool";
import { requireTool } from "@/config/tools";

const SLUG = "pool-heater-size-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Pool Heater Size Calculator: BTU Needed for Your Pool",
  description:
    "Enter your pool's size, the temperature you want and the coldest month's average and get the approximate gas heater output in Btu/hour, using the U.S. Department of Energy's sizing formula. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PoolHeaterSizeCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to size a gas pool heater",
        steps: [
          {
            name: "Enter the pool's surface",
            text: "Pick rectangle, round or oval and enter the dimensions in feet, or enter the surface area directly for a free-form pool. The formula works from surface area, not gallons.",
          },
          {
            name: "Enter the temperature you want",
            text: "The desired pool water temperature in °F.",
          },
          {
            name: "Enter the coldest month's average temperature",
            text: "The average air temperature for the coldest month you plan to use the pool. The difference between the two is the temperature rise the formula uses.",
          },
          {
            name: "Choose the heating rate",
            text: "The formula's basis is a rise of 1 to 1¼°F per hour. The Department of Energy gives multipliers of 1.5 for a 1½°F rise and 2.0 for a 2°F rise.",
          },
          {
            name: "Read the Btu/hour figure",
            text: "That is the approximate heater output the formula gives. The source says a trained professional should do the proper sizing analysis for a specific pool.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where a heater size estimate helps",
        items: [
          {
            title: "Shortlisting heaters before getting quotes",
            body: "A 32 × 16 ft pool heated 15°F above the coldest month needs about 92,000 Btu/h by the formula. That narrows the range of heaters to look at before asking an installer.",
          },
          {
            title: "Checking an installer's recommendation",
            body: "If a quote specifies a heater far larger or smaller than the formula's figure, that is a reasonable question to ask the installer about.",
          },
          {
            title: "Extending the swimming season",
            body: "Heating into a colder month means a bigger temperature rise. Entering that month's average shows how much more output the formula calls for.",
          },
          {
            title: "Deciding how fast the pool needs to warm up",
            body: "Owners who heat only for weekends want faster warm-up. The 1½°F and 2°F per hour multipliers show what that does to the size.",
          },
          {
            title: "Comparing round and rectangular pools",
            body: "Area drives the result. A 24-ft round pool has about 452 sq ft of surface; the tool works it out from the diameter.",
          },
          {
            title: "Seeing when a pool is beyond a single heater",
            body: "The Department of Energy says gas heaters range from 75,000 to 450,000 Btu output. The tool flags figures outside that range.",
          },
          {
            title: "Planning a heater for a rental or vacation property",
            body: "A property manager can estimate the output needed for guests' expected temperature before contacting suppliers.",
          },
          {
            title: "Explaining heater sizing to a customer",
            body: "A pool contractor can show the area, the temperature rise and the formula, rather than a number that appears out of nowhere.",
          },
          {
            title: "Estimating for an oval or free-form pool",
            body: "Ovals are treated as an ellipse; for any other shape, enter the measured surface area directly.",
          },
          {
            title: "Understanding why windy sites need bigger heaters",
            body: "The source notes that higher wind, lower humidity and cool nights all increase the heating load. The result repeats those caveats beside the number.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the formula comes from",
        paragraphs: [
          "The formula is from the U.S. Department of Energy's Energy Saver page 'Gas Pool Heaters', under 'Sizing a Gas Pool Heater': subtract the average temperature of the coldest month of pool use from the desired pool temperature to get the temperature rise, calculate the pool surface area in square feet, and multiply — pool area × temperature rise × 12 — to get the Btu/hour output requirement. The page states that the formula is based on a 1 to 1¼°F temperature rise per hour and a 3½ mph average wind at the pool surface, and gives multipliers of 1.5 for a 1½°F rise and 2.0 for a 2°F rise.",
          "When this page was built on 4 October 2026, the live Energy Saver URL returned a 404 error, so the text was read from the Internet Archive's copy of 10 January 2025, which is linked as the source. The surface-area step uses standard geometry: length × width for a rectangle, π × radius² for a circle, and π ÷ 4 × length × width for an oval treated as an ellipse.",
          "Everything is calculated in your browser; nothing is sent or stored.",
          "The Department of Energy describes this as an approximate size and says a trained pool professional should perform a proper sizing analysis for a specific pool. It notes that wind exposure, humidity and cool nights all affect the heating load, so windier, drier sites with cool nights need a larger heater. The formula is for gas heaters on outdoor pools; it does not cover heat pumps or solar heaters, and it does not account for pool covers.",
          "This page reports what the formula gives. It does not recommend a model or brand, and it is not a substitute for an installer's sizing or for checking gas supply and venting requirements.",
        ],
        sources: [
          {
            label: "U.S. Department of Energy — Energy Saver: Gas Pool Heaters (archived 10 Jan 2025)",
            href: "https://web.archive.org/web/20250110215051/https://www.energy.gov/energysaver/gas-pool-heaters",
            note: "Sizing a Gas Pool Heater: the formula, its assumptions and the 75,000–450,000 Btu output range",
          },
          {
            label: "U.S. Department of Energy — Energy Saver",
            href: "https://www.energy.gov/energysaver/energy-saver",
            note: "The Energy Saver home page",
          },
        ],
      }}
      faqs={[
        {
          question: "What size heater do I need for my pool?",
          answer:
            "By the Department of Energy's approximate formula, pool surface area × temperature rise × 12 Btu/hour. For a 32 × 16 ft pool (512 sq ft) heated from a coldest-month average of 65°F to 80°F, that is 512 × 15 × 12 = 92,160 Btu/hour.",
        },
        {
          question: "Why does the formula use surface area, not gallons?",
          answer:
            "Because that is how the Department of Energy states it: 'a heater is sized according to the surface area of the pool and the difference between the pool and the average air temperatures.' Volume does not appear in the formula.",
        },
        {
          question: "What does the 12 in the formula mean?",
          answer:
            "It is the Department of Energy's factor for a heating rate of 1 to 1¼°F per hour with a 3½ mph average wind at the pool surface. For faster heating, the page multiplies by 1.5 (1½°F per hour) or 2.0 (2°F per hour).",
        },
        {
          question: "Can I use this for a heat pump or solar heater?",
          answer: "No. The formula is from the Department of Energy's page on gas pool heaters. Heat pumps and solar systems are sized differently.",
        },
        {
          question: "Is it better to buy a bigger heater?",
          answer:
            "This page doesn't advise on that. It reports what the formula gives. The source says a trained pool professional should perform a proper sizing analysis for a specific pool.",
        },
        {
          question: "Why does the result say it is outside the range?",
          answer:
            "The Department of Energy states that gas pool heater outputs range from 75,000 to 450,000 Btu. If the formula gives a figure outside that range, the tool says so.",
        },
      ]}
    >
      <PoolHeaterSizeTool />
    </ToolPageLayout>
  );
}
