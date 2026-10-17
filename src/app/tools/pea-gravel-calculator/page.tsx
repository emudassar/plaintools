import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BulkMaterialTool from "@/components/BulkMaterialTool";
import { requireTool } from "@/config/tools";
import { NM_URL } from "@/lib/bulk-material";

const SLUG = "pea-gravel-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Pea Gravel Calculator: Cubic Yards, Tons and Bags",
  description:
    "Enter the length, width (or diameter) and depth and get how much pea gravel you need in cubic yards, tons and 0.5 cu ft bags, using a published state conversion factor you can change.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PeaGravelPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate how much pea gravel you need",
        steps: [
          { name: "Measure the area", text: "Length and width of a rectangle, the diameter of a circle, or the total area if you already know it." },
          { name: "Choose the depth", text: "The finished depth of gravel, in inches (or cm)." },
          { name: "Check the weight factor", text: "1.42 tons per cubic yard is the published figure for gravel ¼–2 in; replace it with your supplier's if they give one." },
          { name: "Pick the bag size", text: "Bagged gravel is sold by volume; 0.5 cu ft is common." },
          { name: "Read yards, tons and bags", text: "Add prices per ton or per bag to compare bulk delivery with bags." },
        ],
      }}
      uses={{
        heading: "10 situations where a pea gravel calculator helps",
        items: [
          { title: "Ordering a bulk delivery", body: "Quarries sell by the ton or the yard; you need both numbers to order and to compare quotes." },
          { title: "Bags or bulk?", body: "Enter both prices to see where a delivered load beats a car full of bags." },
          { title: "Patio and path base", body: "Work out the gravel for a pea gravel patio or a walkway between stepping stones." },
          { title: "Round fire-pit area", body: "Switch to circle and enter the diameter of the seating area." },
          { title: "Dog run", body: "Price out a run before deciding on gravel versus another surface." },
          { title: "Checking a truck's payload", body: "The weight tells you whether a pickup can carry the load in one trip." },
          { title: "Drainage trench backfill", body: "Length × trench width × depth gives the volume of gravel around a pipe." },
          { title: "Playground or garden bed edge", body: "Small beds are quicker in bags; the bag count is ready to take to the store." },
          { title: "Metric plans", body: "Enter metres and centimetres and get cubic metres and tonnes alongside yards and tons." },
          { title: "Topping up an old area", body: "Enter only the depth you are adding to get a top-up quantity." },
        ],
      }}
      dataSection={{
        heading: "Where the weight figure comes from",
        paragraphs: [
          "Volume is plain geometry: area × depth, with 27 cubic feet in a cubic yard. Bags are the volume divided by the bag size printed on the bag, rounded up.",
          "Weight needs a density. The default of 1.42 short tons per cubic yard is the 'Gravel ¼\" – 2\"' row of the New Mexico Energy, Minerals and Natural Resources Department table 'Conversion Factors for Construction Materials and Common Minerals', which states it is adapted from the Bureau of Land Management publication H-3890-1, Handbook for Mineral Examiners. Pea gravel, typically around 3/8 in, falls inside that size range. The factor is editable because the true figure depends on the stone, how it is graded and how wet it is.",
          "Limits: the result assumes an even depth over a flat area. It does not allow for a compacted base, landscape fabric, edging, settling or material lost into soft soil; add your own allowance for those. A supplier's own tons-per-yard figure for the product they deliver is more reliable than any general table.",
          "Everything runs in your browser; nothing is sent or stored.",
        ],
        sources: [{ label: "New Mexico EMNRD — Conversion Factors for Construction Materials and Common Minerals", href: NM_URL, note: "Gravel ¼–2 in = 1.42 short tons per cubic yard (adapted from BLM H-3890-1)" }],
      }}
      faqs={[
        { question: "How much does a yard of pea gravel weigh?", answer: "The published state figure used here for gravel ¼–2 in is 1.42 short tons per cubic yard (about 2,840 lb). Your supplier's figure for their stone may differ." },
        { question: "How many bags of pea gravel in a yard?", answer: "A cubic yard is 27 cubic feet, so 54 bags of 0.5 cu ft." },
        { question: "How much pea gravel do I need for a 10 × 10 area 3 inches deep?", answer: "25 cubic feet, or 0.93 cubic yards — about 1.3 tons at 1.42 tons per yard, or 50 half-cubic-foot bags." },
        { question: "How deep should pea gravel be?", answer: "That depends on the use and is a design choice; this page calculates whatever depth you enter rather than recommending one." },
        { question: "Why do suppliers quote different weights?", answer: "Density changes with the rock type, the size mix and moisture. That is why the factor on this page can be changed." },
        { question: "Does it work in metric?", answer: "Yes. Choose metres and centimetres; results include cubic metres and tonnes." },
      ]}
    >
      <BulkMaterialTool materialName="Pea gravel" defaultDepth="3" sizeNote="Pea gravel is small rounded stone, commonly around 3/8 in, inside the published ¼–2 in gravel row. The result updates as you type." />
    </ToolPageLayout>
  );
}
