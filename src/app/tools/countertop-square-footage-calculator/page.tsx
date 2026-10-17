import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CountertopTool from "@/components/CountertopTool";
import { requireTool } from "@/config/tools";

const SLUG = "countertop-square-footage-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Countertop Square Footage Calculator (with Backsplash)",
  description:
    "Enter each countertop section in inches, your backsplash height and any sink or cooktop cut-outs and get the gross and net square footage, section by section, and the cost at a price per square foot.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function CountertopPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to measure countertop square footage",
        steps: [
          { name: "Split the counter into rectangles", text: "An L or U shape is two or three rectangles; measure so the corner is counted only once." },
          { name: "Measure length and depth", text: "In inches, to the finished edge including overhang." },
          { name: "Mark backsplash sections", text: "And enter the backsplash height." },
          { name: "Add cut-outs if you want a net figure", text: "Sink and cooktop openings." },
          { name: "Read the area and cost", text: "Gross area is what's usually priced; net area is also shown." },
        ],
      }}
      uses={{
        heading: "10 situations where a countertop calculator helps",
        items: [
          { title: "Getting granite or quartz quotes", body: "Shops price per square foot; know your number before you call." },
          { title: "Kitchen islands", body: "Enter the island as its own section with its real depth." },
          { title: "Comparing materials", body: "Change the price per square foot to compare laminate, quartz and granite." },
          { title: "Backsplash in the same stone", body: "Include a 4 in or full-height backsplash in the area." },
          { title: "Bathroom vanities", body: "Small tops priced per square foot, often from remnants." },
          { title: "Checking a fabricator's quote", body: "Compare their area with your measurement." },
          { title: "Butcher block and concrete", body: "Area for ordering slabs or estimating sealer." },
          { title: "L-shaped kitchens", body: "Break the L into two rectangles so the corner isn't doubled." },
          { title: "Remodel budgets", body: "Countertops are a big line item; the cost line gives a figure." },
          { title: "Outdoor kitchens", body: "The same arithmetic for an outdoor counter." },
        ],
      }}
      dataSection={{
        heading: "How the area is worked out",
        paragraphs: [
          "This is arithmetic with no outside data: each section is length × depth in inches ÷ 144 = square feet. Backsplash area is the length of the sections you mark × the backsplash height ÷ 144. Cut-outs are subtracted only from the net figure.",
          "The cost uses the gross area (counters plus backsplash) because fabricators usually charge for the stone used; cut-outs often carry their own charge instead of a credit.",
          "Limits: the page does not lay out slabs. Fabricators fit pieces onto real slab sizes and decide where seams go, so the slab area you pay for can be larger than the counter area. Edge profiles, cut-out fees and installation are priced differently by every shop. Everything runs in your browser.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I calculate countertop square footage?", answer: "Multiply length by depth in inches and divide by 144 for each rectangle, then add them up." },
        { question: "How do I measure an L-shaped countertop?", answer: "Measure one leg full length to the wall, and the other leg from the edge of the first leg, so the corner is counted once." },
        { question: "Should I include the backsplash?", answer: "If it's the same material, yes — tick the sections with backsplash and enter its height." },
        { question: "Do I subtract the sink cut-out?", answer: "For pricing, usually not: shops price the stone used. The page shows both gross and net." },
        { question: "What's a standard countertop depth?", answer: "Measure yours; the page uses whatever depth you enter." },
        { question: "How many slabs do I need?", answer: "That depends on slab size and seam layout, which only the fabricator can plan." },
      ]}
    >
      <CountertopTool />
    </ToolPageLayout>
  );
}
