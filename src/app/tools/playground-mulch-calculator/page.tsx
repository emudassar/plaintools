import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PlaygroundMulchTool from "@/components/PlaygroundMulchTool";
import { requireTool } from "@/config/tools";

const SLUG = "playground-mulch-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Playground Mulch Calculator: Cubic Yards at CPSC Depths",
  description:
    "Cubic yards of playground wood chips, mulch, rubber, pea gravel or sand at CPSC's minimum depths — 9 inches compressed means a 12-inch initial fill — with a fall-height check against CPSC Table 2.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PlaygroundMulchCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out playground mulch",
        steps: [
          {
            name: "Measure the surfaced area",
            text: "Enter the length and width in feet of the area to cover. If you only have the equipment's own size, tick the box to add CPSC's general 6-foot use zone on every side.",
          },
          {
            name: "Pick the material",
            text: "CPSC Table 2 lists wood chips, wood mulch (non-CCA), shredded/recycled rubber, pea gravel and sand, each with a minimum compressed depth.",
          },
          {
            name: "Check the fall height",
            text: "Enter the highest fall height to see whether Table 2 lists that material as protecting to it.",
          },
          {
            name: "Read the quantity",
            text: "Loose fill compresses at least 25%, so a 9-inch minimum means a 12-inch initial fill. The result is the volume at that initial depth, in cubic yards and bags.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where a playground mulch calculation helps",
        items: [
          {
            title: "Ordering mulch for a school playground",
            body: "A facilities manager can turn the playground's footprint into cubic yards at the depth CPSC lists.",
          },
          {
            title: "Planning a backyard play set",
            body: "Parents adding a swing set can see how much loose fill the area needs, including the use zone around it.",
          },
          {
            title: "Choosing between wood chips and mulch",
            body: "In Table 2, 9 inches of wood chips protects to 10 ft and 9 inches of wood mulch to 7 ft, so the material matters for taller equipment.",
          },
          {
            title: "Pricing rubber mulch",
            body: "Rubber's minimum is 6 inches and CPSC notes it does not compress like other loose fill, so it needs half the volume of a 12-inch wood fill.",
          },
          {
            title: "Allowing for settling",
            body: "The tool applies CPSC's 25% compression so the order is for the initial fill, not the compressed depth.",
          },
          {
            title: "Checking a tall structure",
            body: "Entering the fall height flags materials Table 2 does not list as reaching it.",
          },
          {
            title: "Church and daycare play areas",
            body: "Small organisations can estimate bulk deliveries or bag counts before buying.",
          },
          {
            title: "Converting to bags",
            body: "Entering the bag size in cubic feet gives the number of bags, rounded up.",
          },
          {
            title: "Budgeting a refurbishment",
            body: "Running the area with each material shows the volume difference between options.",
          },
          {
            title: "Explaining depth to a committee",
            body: "The result cites the handbook's own table and example, which is easy to share.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the depths come from",
        paragraphs: [
          "The depths are from the U.S. Consumer Product Safety Commission's Public Playground Safety Handbook (Publication 325). Its Table 2, 'Minimum compressed loose-fill surfacing depths', lists 6 inches of shredded/recycled rubber as protecting to a 10 ft fall height, and 9 inches of sand (4 ft), pea gravel (5 ft), wood mulch, non-CCA (7 ft) and wood chips (10 ft). The handbook says the depths assume the material has been compressed by use and weathering.",
          "Section 2.4.2.2 says loose-fill materials 'will compress at least 25% over time', with the example that if a playground will require 9 inches of wood chips, the initial fill level should be 12 inches. The calculator applies that: initial depth = minimum ÷ 0.75. For rubber, Table 2's footnote says it does not compress in the same manner, so its 6 inches is used as is. The same section says never to use less than 9 inches of loose fill except shredded/recycled rubber (6 inches recommended).",
          "For the optional use zone, §5.3.10 says that where not specified elsewhere the use zone should extend a minimum of 6 feet in all directions from the perimeter of the equipment. Swings, slides and some other equipment have longer use zones in their own sections. Volume = area × initial depth; cubic yards = cubic feet ÷ 27. Nothing is fetched while you use the page.",
          "The limits: this calculates a quantity at the handbook's minimum depths. It does not assess a playground's safety, account for equipment-specific use zones, or replace an engineered wood fiber or rubber product's own ASTM F1292 test data, which the handbook says manufacturers should provide.",
        ],
        sources: [
          {
            label: "U.S. CPSC — Public Playground Safety Handbook (Pub. 325, PDF)",
            href: "https://www.cpsc.gov/s3fs-public/325.pdf",
            note: "Table 2 minimum compressed loose-fill depths; §2.4.2.2 compression; §5.3.10 use zone",
          },
        ],
      }}
      faqs={[
        {
          question: "How deep should playground mulch be?",
          answer:
            "CPSC's Table 2 lists a minimum compressed depth of 9 inches for wood mulch, wood chips, sand and pea gravel, and 6 inches for shredded/recycled rubber. Because loose fill compresses at least 25%, the handbook's example installs 12 inches to keep 9.",
        },
        {
          question: "How many cubic yards of mulch do I need for a playground?",
          answer:
            "Multiply the area in square feet by the initial depth in feet and divide by 27. A 20 × 30 ft area at 12 inches is 600 cu ft, or 22.2 cubic yards.",
        },
        {
          question: "What fall height does wood mulch protect?",
          answer: "9 inches of wood mulch (non-CCA) is listed as protecting to a 7 ft fall height; 9 inches of wood chips to 10 ft.",
        },
        {
          question: "How much rubber mulch do I need?",
          answer:
            "CPSC lists 6 inches of shredded/recycled rubber as protecting to 10 ft, and notes it does not compress like other loose fill. A 20 × 30 ft area at 6 inches is 300 cu ft, about 11.1 cubic yards.",
        },
        {
          question: "How far around the equipment should the mulch go?",
          answer:
            "For equipment not covered elsewhere, the handbook says the use zone should extend at least 6 feet in all directions. Swings and slides have their own, longer use zones in the handbook.",
        },
        {
          question: "Can I use pea gravel or sand?",
          answer:
            "They are in Table 2, but 9 inches protects to lower fall heights: 5 ft for pea gravel and 4 ft for sand.",
        },
      ]}
    >
      <PlaygroundMulchTool />
    </ToolPageLayout>
  );
}
