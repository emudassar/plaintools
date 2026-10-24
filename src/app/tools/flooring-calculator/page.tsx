import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import FlooringTool from "@/components/FlooringTool";
import { requireTool } from "@/config/tools";

const SLUG = "flooring-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Flooring Calculator: How Many Boxes of Flooring Do I Need?",
  description:
    "Enter the floor area, waste allowance and square feet per box and get how many boxes of laminate, vinyl plank or hardwood to buy, the plank count and the cost.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function FlooringCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate flooring",
        steps: [
          { name: "Measure the floor", text: "Room length × width, or the total of several rooms." },
          { name: "Set a waste allowance", text: "Your own percentage for cuts." },
          { name: "Enter sq ft per box", text: "From the carton label." },
          { name: "Read boxes", text: "Plus planks and cost if you enter them." },
        ],
      }}
      uses={{
        heading: "10 flooring jobs this sizes",
        items: [
          { title: "Laminate in a bedroom", body: "A DIYer buys the right number of boxes for a 12 × 14 room." },
          { title: "Vinyl plank throughout", body: "A homeowner adds several rooms' areas." },
          { title: "Hardwood quotes", body: "Someone checks a contractor's box count." },
          { title: "Diagonal layouts", body: "A larger allowance is entered for diagonal planks." },
          { title: "Basement flooring", body: "A finished basement is priced by the box." },
          { title: "Rental units", body: "A landlord orders flooring for identical units." },
          { title: "Discontinued lines", body: "Someone orders enough of a clearance floor in one go." },
          { title: "Comparing products", body: "Boxes with different coverage are compared on cost." },
          { title: "Spare planks", body: "The leftover area shows what is kept for repairs." },
          { title: "Budgeting a remodel", body: "A family prices a floor before choosing." },
        ],
      }}
      dataSection={{
        heading: "How the flooring is worked out",
        paragraphs: [
          "Boxes = area × (1 + allowance) ÷ sq ft per box, rounded up. Planks = area with allowance ÷ (plank length × width ÷ 144). Cost = boxes × sq ft per box × price per sq ft.",
          "Plain arithmetic in your browser.",
          "Limits: herringbone, diagonal layouts, many doorways and stairs use more than a straight lay. Underlayment, transitions and trim are separate. The allowance is your own figure; some manufacturers' installation guides state one.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How much flooring do I need?", answer: "The floor area plus your waste allowance, divided by the coverage per box and rounded up." },
        { question: "How much extra flooring should I buy?", answer: "That is your choice; diagonal and patterned layouts generally need more than straight lays." },
        { question: "How do I measure a room for flooring?", answer: "Length × width in feet; add closets and subtract nothing for furniture." },
        { question: "How many planks are in a box?", answer: "The carton says; the page estimates plank count from the size you enter." },
        { question: "Does it work for tile?", answer: "For tile, use the tile calculator, which allows for grout joints." },
        { question: "Should I buy all boxes at once?", answer: "Batches can differ slightly in colour, so many people buy everything together." },
      ]}
    >
      <FlooringTool />
    </ToolPageLayout>
  );
}
