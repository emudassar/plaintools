import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ConcreteTool from "@/components/ConcreteTool";
import { requireTool } from "@/config/tools";

const SLUG = "concrete-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Concrete Calculator: Cubic Yards and Bags for a Slab, Footing or Column",
  description:
    "Enter the size of a slab, footing or round column and get the concrete in cubic yards and cubic feet, plus the number of 40, 50, 60, 80 or 90 lb bags.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ConcreteCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate concrete",
        steps: [
          { name: "Choose the pour", text: "Slab, footing or round column." },
          { name: "Enter the size", text: "Length, width and thickness, or diameter and height." },
          { name: "Add an allowance", text: "Your own percentage for spillage and uneven ground." },
          { name: "Read yards and bags", text: "Cubic yards for ready-mix and bag counts for each size." },
        ],
      }}
      uses={{
        heading: "10 concrete jobs this sizes",
        items: [
          { title: "Patio slab", body: "A homeowner pouring a 10 × 12 patio at 4 in finds the cubic yards to order." },
          { title: "Shed base", body: "Someone pricing bags for a small shed pad." },
          { title: "Driveway", body: "A contractor estimates ready-mix for a driveway." },
          { title: "Fence and deck posts", body: "A DIYer counts bags for round post holes." },
          { title: "Footings", body: "A builder sizes continuous footings." },
          { title: "Hot tub pad", body: "A homeowner checks bags for a pad." },
          { title: "Steps and landings", body: "Someone pours a landing at the back door." },
          { title: "Bag versus truck", body: "A DIYer sees whether bags or a truck make more sense." },
          { title: "Mailbox post", body: "A homeowner sets a post in concrete." },
          { title: "Checking a quote", body: "A homeowner compares a contractor's yardage with their own." },
        ],
      }}
      dataSection={{
        heading: "How the concrete is worked out",
        paragraphs: [
          "Volume = length × width × thickness (thickness in inches ÷ 12), or π × radius² × height for a round column, × quantity × (1 + allowance). Cubic yards = cubic feet ÷ 27.",
          "Bags use the yields on the QUIKRETE Concrete Mix No. 1101 data sheet: 40 lb ≈ 0.30 cu ft, 50 lb ≈ 0.375, 60 lb ≈ 0.45, 80 lb ≈ 0.60, 90 lb ≈ 0.675. The placed weight uses the sheet's 'approximately 140 lb/ft³'.",
          "Limits: other mixes yield differently, so check the bag. Ready-mix suppliers sell in set increments and may charge short-load fees. Rebar, base gravel and forms are not included. The page does not design slab thickness or reinforcement.",
        ],
        sources: [
          { label: "QUIKRETE Concrete Mix No. 1101 data sheet", href: "https://www.quikrete.com/pdfs/data_sheet-concrete%20mix%201101.pdf" },
        ],
      }}
      faqs={[
        { question: "How much concrete do I need for a 10 × 10 slab 4 in thick?", answer: "33.3 cu ft, or 1.23 cubic yards, before any allowance." },
        { question: "How many 80 lb bags are in a yard of concrete?", answer: "At 0.60 cu ft per bag, 45 bags make 27 cu ft." },
        { question: "How do I convert cubic feet to cubic yards?", answer: "Divide by 27." },
        { question: "Should I add extra?", answer: "Many people add a small allowance for spillage and uneven subgrade; the percentage is your choice." },
        { question: "How heavy is concrete?", answer: "About 140 lb per cubic foot once placed, per the QUIKRETE data sheet." },
        { question: "Is it cheaper to use bags or ready-mix?", answer: "It depends on local prices and delivery fees; enter a price per yard to compare." },
      ]}
    >
      <ConcreteTool />
    </ToolPageLayout>
  );
}
