import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GambrelRoofTool from "@/components/GambrelRoofTool";
import { requireTool } from "@/config/tools";

const SLUG = "gambrel-roof-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Gambrel Roof Calculator: Rafter Lengths, Height and Area",
  description:
    "Enter the building span, where the slope breaks and the lower and upper pitches and get both gambrel rafter lengths, the rise at the break and ridge, the roof area in squares and the gable end area, with a cross-section drawing.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function GambrelRoofPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate a gambrel roof",
        steps: [
          { name: "Enter span and length", text: "The building's width across the walls and its length." },
          { name: "Choose the break point", text: "The level distance from the wall to where the steep lower slope meets the shallow upper slope." },
          { name: "Enter both pitches", text: "Lower (steep) and upper (shallow), as rise per 12 in of run." },
          { name: "Add the overhang", text: "The level eave overhang at the bottom of the lower rafter." },
          { name: "Read the results", text: "Rafter lengths, heights, roof area and gable end area, with a drawing." },
        ],
      }}
      uses={{
        heading: "10 situations where a gambrel roof calculator helps",
        items: [
          { title: "Barn-style sheds", body: "Get both rafter lengths before cutting a pattern." },
          { title: "Loft headroom", body: "Move the break point and see the ridge height and width between the breaks." },
          { title: "Ordering roofing", body: "Roof area in squares for shingles or metal." },
          { title: "Siding the gable ends", body: "The gable end area is the wall above the plates on each end." },
          { title: "Comparing with a gable roof", body: "Use alongside the rafter length calculator for a plain gable." },
          { title: "Choosing pitches", body: "Try steeper lower slopes for more loft room." },
          { title: "Checking plans", body: "Verify the rafter lengths on a shed or barn plan." },
          { title: "Mini barns and playhouses", body: "Small spans with the same geometry." },
          { title: "Estimating lumber", body: "Rafter lengths decide which board lengths to buy." },
          { title: "Learning roof geometry", body: "The drawing shows how the two slopes fit together." },
        ],
      }}
      dataSection={{
        heading: "How the geometry works",
        paragraphs: [
          "A symmetric gambrel has two slopes on each side. Each slope is a right triangle: its rise is the run × pitch ÷ 12, and its rafter length is the run × √(144 + pitch²) ÷ 12 — the same unit-length method used for common rafters. The lower section runs from the wall to the break point; the upper section runs from the break to the centre of the span. The ridge height is the two rises added together.",
          "Roof area is 2 × (lower rafter + tail + upper rafter) × building length, and a square is 100 ft². The gable end area is the trapezoid under the lower slopes plus the triangle under the upper slopes, for one end.",
          "Limits: lengths are line lengths, before plumb cuts, birdsmouths and any ridge board deduction. The page doesn't size rafters, gussets or collar ties. A gambrel pushes outward at the break and at the walls, so its framing and connections need design under your building code. Everything runs in your browser.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I calculate gambrel rafter lengths?", answer: "Treat each slope as its own right triangle: rafter = run × √(144 + pitch²) ÷ 12. A 4 ft run at 24/12 is 8.94 ft; an 8 ft run at 6/12 is 8.94 ft too." },
        { question: "What pitches are used on a gambrel roof?", answer: "That's a design choice; the lower slope is steep and the upper shallow. The page calculates whatever pitches you enter." },
        { question: "Where should the break be?", answer: "Moving the break outward lowers the loft's side walls; inward raises them. Try different runs and watch the height." },
        { question: "How many squares of roofing do I need?", answer: "The page shows roof area ÷ 100; add your own allowance for waste, starter and ridge." },
        { question: "Does it include the overhang?", answer: "Yes, as a tail on the lower rafter, included in its length and in the roof area." },
        { question: "Can it do an asymmetric gambrel?", answer: "No — both sides are assumed to be the same." },
      ]}
    >
      <GambrelRoofTool />
    </ToolPageLayout>
  );
}
