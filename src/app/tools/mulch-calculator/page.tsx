import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import MulchTool from "@/components/MulchTool";
import { requireTool } from "@/config/tools";

const SLUG = "mulch-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Mulch Calculator: Cubic Yards and Bags of Mulch",
  description:
    "Enter the bed size and depth and get how much mulch you need in cubic yards and 2 or 3 cu ft bags, with how much area a yard covers and the cost.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function MulchCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate mulch",
        steps: [
          { name: "Choose the bed shape", text: "Rectangle, circle around a tree, or a known area." },
          { name: "Enter the depth", text: "In inches." },
          { name: "Pick a bag size", text: "2 or 3 cu ft are common." },
          { name: "Read yards and bags", text: "And the cost if you enter prices." },
        ],
      }}
      uses={{
        heading: "10 mulching jobs this sizes",
        items: [
          { title: "Spring bed refresh", body: "A homeowner tops up beds by an inch." },
          { title: "Tree rings", body: "Someone mulches circles around young trees." },
          { title: "New landscaping", body: "A new bed is mulched 3 in deep." },
          { title: "Bulk versus bags", body: "A gardener compares a delivered load with bags." },
          { title: "Playground mulch", body: "A school sizes mulch for play areas (see the playground mulch calculator for safety depths)." },
          { title: "Vegetable garden paths", body: "Paths between beds get wood chips." },
          { title: "Rental property curb appeal", body: "A landlord prices mulch for the front beds." },
          { title: "HOA common areas", body: "A volunteer orders mulch for shared beds." },
          { title: "Rubber mulch", body: "Someone checks bags of rubber mulch by volume." },
          { title: "Budgeting", body: "A homeowner plans the season's landscaping spend." },
        ],
      }}
      dataSection={{
        heading: "How the mulch is worked out",
        paragraphs: [
          "Cubic feet = area × depth in inches ÷ 12; cubic yards = cubic feet ÷ 27; bags = cubic feet ÷ bag size, rounded up. One cubic yard covers 27 ÷ (depth ÷ 12) sq ft — 108 sq ft at 3 in.",
          "Plain arithmetic in your browser.",
          "Limits: mulch settles after spreading and bulk loads are measured loose. The depth is your choice; the page does not recommend one.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How much mulch do I need?", answer: "Area × depth in inches ÷ 12 ÷ 27 = cubic yards." },
        { question: "How many bags of mulch in a yard?", answer: "13.5 bags of 2 cu ft, or 9 bags of 3 cu ft." },
        { question: "How much does a yard of mulch cover?", answer: "108 sq ft at 3 in, 162 sq ft at 2 in." },
        { question: "How do I measure a tree ring?", answer: "Choose Circle and enter the diameter." },
        { question: "Can I add several beds?", answer: "Add up their areas and use 'I know the area'." },
        { question: "Is bulk mulch cheaper?", answer: "Often for large jobs; enter both prices to compare." },
      ]}
    >
      <MulchTool />
    </ToolPageLayout>
  );
}
