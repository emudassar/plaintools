import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ConcreteStepsTool from "@/components/ConcreteStepsTool";
import { requireTool } from "@/config/tools";
import { QUIKRETE_1101_URL } from "@/lib/concrete-bags";

const SLUG = "concrete-step-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Concrete Step Calculator: Yards and Bags for Steps",
  description:
    "Enter the number of steps, rise, tread run, width and top platform and get the concrete needed for solid steps in cubic feet and yards, and the bags of 40–90 lb mix to buy.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ConcreteStepsPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate concrete for steps",
        steps: [
          { name: "Count the steps", text: "The number of risers." },
          { name: "Enter rise and run", text: "Height of each step and depth of each tread, in inches." },
          { name: "Enter the width", text: "Side to side, in inches." },
          { name: "Add a platform", text: "The depth of a top landing, or 0." },
          { name: "Read yards and bags", text: "With your allowance for spills and uneven ground." },
        ],
      }}
      uses={{
        heading: "10 situations where a concrete step calculator helps",
        items: [
          { title: "Front entry steps", body: "Two or three steps up to a door with a landing." },
          { title: "Bags or ready-mix", body: "See whether the volume is a bag job or a short-load delivery." },
          { title: "Garden and patio steps", body: "Low wide steps between levels." },
          { title: "Replacing crumbling steps", body: "Price the pour before demolition." },
          { title: "Adding a landing", body: "See what a deeper platform adds." },
          { title: "Choosing rise and run", body: "Compare dimensions and their volume." },
          { title: "Planning forms", body: "Total rise and run tell you the form board sizes." },
          { title: "Contractor bids", body: "Material quantity for a quote." },
          { title: "Basement areaway steps", body: "Short runs of steps in a well." },
          { title: "Metric check", body: "The volume is also shown in cubic metres." },
        ],
      }}
      dataSection={{
        heading: "How the volume is worked out",
        paragraphs: [
          "Solid steps are a staircase-shaped profile repeated across the width. With n steps of rise r and run t, the bottom step is one rise tall, the next two rises, and so on, so the profile area is r × t × n(n + 1) ÷ 2. A top platform of depth p sits at the full height and adds p × n × r. Volume = profile × width, plus your allowance.",
          "Bags use the yields on the QUIKRETE Concrete Mix (No. 1101) data sheet: 40 lb ≈ 0.30 ft³, 50 lb ≈ 0.375, 60 lb ≈ 0.45, 80 lb ≈ 0.60 and 90 lb ≈ 0.675 ft³.",
          "Limits: this is the solid-fill case. Steps formed over compacted gravel or with a sloped underside use less concrete. The page doesn't check riser and tread limits, handrails, footings or reinforcement, which come from your building code. Everything runs in your browser.",
        ],
        sources: [{ label: "QUIKRETE Concrete Mix (No. 1101) data sheet", href: QUIKRETE_1101_URL, note: "Yield per bag size" }],
      }}
      faqs={[
        { question: "How much concrete do I need for 3 steps?", answer: "For 3 steps 7 in high, 11 in deep and 36 in wide with no landing: 7 × 11 × 6 = 462 in² of profile × 36 in = 9.6 ft³, about 17 bags of 80 lb." },
        { question: "How do I calculate concrete for stairs?", answer: "Profile area = rise × run × n(n+1)/2 plus any platform; multiply by the width." },
        { question: "Does it include a landing?", answer: "Enter the platform depth and it's added at full height." },
        { question: "How many bags of concrete per cubic yard?", answer: "About 45 bags of 80 lb (27 ft³ ÷ 0.60)." },
        { question: "Can I use less concrete?", answer: "Filling the inside with compacted gravel reduces it; this page gives the solid-fill figure." },
        { question: "What rise and run should I use?", answer: "Your building code sets limits; the page uses what you enter." },
      ]}
    >
      <ConcreteStepsTool />
    </ToolPageLayout>
  );
}
