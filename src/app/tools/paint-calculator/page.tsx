import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PaintTool from "@/components/PaintTool";
import { requireTool } from "@/config/tools";

const SLUG = "paint-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Paint Calculator: How Many Gallons of Paint Do I Need?",
  description:
    "Enter the room size, doors, windows and number of coats and get how many gallons and quarts of paint to buy, using the coverage printed on your can.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PaintCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out how much paint you need",
        steps: [
          { name: "Measure the room", text: "Length, width and wall height in feet." },
          { name: "Count doors and windows", text: "Enter how many and the area of each; measure your own." },
          { name: "Set coats and coverage", text: "Coats you plan, and the sq ft per gallon printed on the can." },
          { name: "Read gallons and quarts", text: "The exact amount and the cans to buy." },
        ],
      }}
      uses={{
        heading: "10 painting jobs this sizes",
        items: [
          { title: "Bedroom repaint", body: "A homeowner repainting a 12 × 14 bedroom buys the right number of gallons." },
          { title: "Accent wall", body: "Someone painting one wall checks whether a quart is enough." },
          { title: "Rental turnover", body: "A landlord prices paint for several identical rooms." },
          { title: "Ceilings", body: "A painter includes the ceiling in the total." },
          { title: "Dark to light colour change", body: "Someone planning an extra coat sees the added paint." },
          { title: "Comparing paint lines", body: "A shopper compares cans with different coverage." },
          { title: "Budgeting a whole house", body: "A buyer adds up rooms before a move-in repaint." },
          { title: "Contractor quotes", body: "A homeowner checks the paint quantity on a quote." },
          { title: "Avoiding leftover cans", body: "Someone buys quarts instead of a whole extra gallon." },
          { title: "Children's rooms", body: "A parent prices a quick refresh." },
        ],
      }}
      dataSection={{
        heading: "How the paint is worked out",
        paragraphs: [
          "Wall area = 2 × (length + width) × height, minus doors and windows; the ceiling (length × width) is added if ticked. Paint = area × coats ÷ coverage per gallon, rounded up to whole quarts (4 per gallon).",
          "Coverage varies by product and surface. Behr lists 250–400 sq ft per gallon for its Premium Plus interior paint, 'depending on the application method and substrate porosity'. The page starts at 350; use the figure on your own can.",
          "Limits: rough, porous, unprimed or patched surfaces and strong colour changes take more paint. Trim, doors and primer are separate. Door and window sizes are starting values to replace with your measurements.",
        ],
        sources: [
          { label: "Behr Pro — Behr Premium Plus Interior (coverage)", href: "https://www.behr.com/pro/products/interior-products/interior-paints-and-coatings/paints-and-coatings/behr-premium-plus-interior/behr-premium-plus-flat" },
        ],
      }}
      faqs={[
        { question: "How much paint do I need for a 12 × 12 room?", answer: "With 8 ft walls, one door and two windows, about 333 sq ft of wall; two coats at 350 sq ft per gallon need about 1.9 gallons." },
        { question: "How many square feet does a gallon of paint cover?", answer: "It depends on the paint and surface; the can lists it. Behr lists 250–400 sq ft for Premium Plus interior." },
        { question: "Do I need two coats?", answer: "That depends on the colour change and paint; the calculator multiplies by whatever you enter." },
        { question: "Should I subtract doors and windows?", answer: "Yes, enter their count and size; small openings make little difference." },
        { question: "How many quarts in a gallon?", answer: "Four." },
        { question: "Does it include the ceiling?", answer: "Tick the box to add the ceiling area with the same coats." },
      ]}
    >
      <PaintTool />
    </ToolPageLayout>
  );
}
