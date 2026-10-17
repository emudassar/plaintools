import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SelfLevelingTool from "@/components/SelfLevelingTool";
import { requireTool } from "@/config/tools";
import { QK_SL_URL } from "@/lib/self-leveling";

const SLUG = "self-leveling-concrete-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Self-Leveling Concrete Calculator: Bags of Underlayment",
  description:
    "Enter the floor area and average thickness and get how many bags of self-leveling underlayment to buy, using Quikrete's published yield (0.45 ft³ per 50 lb bag) or any product's yield.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function SelfLevelingPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate self-leveling underlayment",
        steps: [
          { name: "Measure the floor", text: "Length × width, or the total square footage." },
          { name: "Estimate average thickness", text: "Map the floor with a long level; low spots raise the average." },
          { name: "Pick the product", text: "Quikrete's resurfacer, or enter another product's yield per bag." },
          { name: "Add an allowance", text: "For spills, edges and material left in the bucket." },
          { name: "Read the bags", text: "Bags, total weight and coverage per bag at your thickness." },
        ],
      }}
      uses={{
        heading: "10 situations where a self-leveling calculator helps",
        items: [
          { title: "Leveling before tile", body: "Fill dips so large-format tile sits flat." },
          { title: "Under vinyl plank or laminate", body: "Even out a slab before floating floors." },
          { title: "Basement slabs", body: "Bags for a whole room at a thin average." },
          { title: "Mixing in batches", body: "Know the bag count to plan continuous pours." },
          { title: "Comparing products", body: "Enter each product's yield to compare bag counts." },
          { title: "Deep spots", body: "See when layers are needed beyond 5/8 in." },
          { title: "Budgeting a flooring job", body: "Bags × price before you start." },
          { title: "Bathroom remodels", body: "Small floors where a few bags matter." },
          { title: "Garage resurfacing", body: "Larger areas at a thin coat." },
          { title: "Checking coverage claims", body: "Coverage per bag at your exact thickness." },
        ],
      }}
      dataSection={{
        heading: "Where the yield comes from",
        paragraphs: [
          "Volume is area × average thickness. Bags are volume ÷ yield per bag, rounded up after your allowance. The default product is QUIKRETE Self-Leveling Floor Resurfacer (No. 1249-50): its data sheet says a 50 lb bag 'will provide 0.45 ft³ of material' and 'at a thickness of 1/4 in, one 50 lb bag will cover an area of 21 ft²' (0.45 ft³ ÷ 1/4 in works out to 21.6 ft²). It can be installed 'from 5/8 inch thick to a feather edge', with deeper areas in layers no more than 5/8 in each.",
          "For any other product, choose 'another product' and enter the yield per bag from its bag or data sheet.",
          "Limits: the average thickness is the hard part — floors are rarely flat, and low spots take much more than the average suggests. Priming, damming the edges, mixing and substrate requirements are in the product's instructions. Everything runs in your browser.",
        ],
        sources: [{ label: "QUIKRETE Self-Leveling Floor Resurfacer (No. 1249-50) data sheet", href: QK_SL_URL, note: "0.45 ft³ per 50 lb bag; 21 ft² at 1/4 in; layers ≤ 5/8 in" }],
      }}
      faqs={[
        { question: "How much does a bag of self-leveler cover?", answer: "Quikrete's 50 lb resurfacer covers about 21 ft² at 1/4 in, roughly 43 ft² at 1/8 in." },
        { question: "How many bags for a 10 × 12 room at 1/4 in?", answer: "120 ft² × 1/4 in = 2.5 ft³ ÷ 0.45 = 6 bags before any allowance." },
        { question: "How do I find the average thickness?", answer: "Check the floor on a grid with a long level and average the gaps." },
        { question: "How thick can I pour?", answer: "Quikrete's data sheet gives 5/8 in to a feather edge, with deeper areas in layers of 5/8 in or less." },
        { question: "Does it work for other brands?", answer: "Yes — choose 'another product' and enter its yield per bag." },
        { question: "Should I add extra?", answer: "Most people add some for spills and edges; the allowance you enter is applied before rounding." },
      ]}
    >
      <SelfLevelingTool />
    </ToolPageLayout>
  );
}
