import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BulkMaterialTool from "@/components/BulkMaterialTool";
import { requireTool } from "@/config/tools";

const SLUG = "gravel-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Gravel Calculator: Cubic Yards and Tons of Gravel",
  description:
    "Enter the area, depth and gravel type and get how many cubic yards, tons and bags of gravel to order, with the published weight factor and its source shown.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function GravelCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate gravel",
        steps: [
          { name: "Pick the gravel type", text: "Gravel ¼–2 in, pit run, base course, crushed limestone or sand." },
          { name: "Enter the area", text: "Rectangle, circle, or a total area." },
          { name: "Enter the depth", text: "In inches (or cm in metric)." },
          { name: "Read yards, tons and bags", text: "Plus cost if you enter prices." },
        ],
      }}
      uses={{
        heading: "10 gravel jobs this sizes",
        items: [
          { title: "Gravel driveway", body: "A homeowner orders base course and top gravel by the ton." },
          { title: "Garden paths", body: "Someone covers a path 3 ft wide and 40 ft long." },
          { title: "Patio base", body: "A DIYer sizes a compacted base under pavers." },
          { title: "Shed pad", body: "A gravel pad for a shed is ordered by the yard." },
          { title: "Drainage trench", body: "A French drain trench is filled with gravel." },
          { title: "Parking area", body: "A small business prices a gravel lot." },
          { title: "Playground or dog run", body: "Someone estimates pea-sized gravel." },
          { title: "Comparing supplier quotes", body: "One supplier sells by the ton, another by the yard; the page gives both." },
          { title: "Bags for small jobs", body: "A renter works out bags for a small bed." },
          { title: "Sand bedding", body: "Someone orders sand for a paver bed." },
        ],
      }}
      dataSection={{
        heading: "How the gravel is worked out",
        paragraphs: [
          "Volume = area × depth (depth in inches ÷ 12) × (1 + allowance); cubic yards = cubic feet ÷ 27; bags = cubic feet ÷ bag size, rounded up.",
          "Weight uses the short tons per cubic yard in the New Mexico Energy, Minerals and Natural Resources Department table 'Conversion Factors for Construction Materials', adapted from BLM Handbook H-3890-1: gravel ¼–2 in 1.42, pit run 1.62, base course 1.25, limestone 1.3, sand 1.45.",
          "Limits: actual weight depends on the stone, its size and moisture, so a supplier's own figure beats any table. Compacted base needs extra material because it settles. The page does not set depths for a driveway or base.",
        ],
        sources: [
          { label: "NM EMNRD — Conversion Factors for Construction Materials (from BLM H-3890-1)", href: "https://www.emnrd.nm.gov/mmd/wp-content/uploads/sites/5/ConvFctrs.pdf" },
        ],
      }}
      faqs={[
        { question: "How much gravel do I need?", answer: "Area × depth ÷ 27 gives cubic yards; multiply by the tons-per-yard factor for tons." },
        { question: "How many tons is a yard of gravel?", answer: "About 1.42 short tons for ¼–2 in gravel in the NM/BLM table; it varies by stone." },
        { question: "How much area does a yard of gravel cover?", answer: "At 3 in deep, 108 sq ft; at 2 in, 162 sq ft." },
        { question: "How many bags of gravel make a yard?", answer: "54 bags of 0.5 cu ft make 27 cu ft." },
        { question: "What depth of gravel do I need?", answer: "That depends on the use and base; the page uses the depth you enter." },
        { question: "Is pea gravel different?", answer: "There is a separate pea gravel calculator; the weight factor is the same table row." },
      ]}
    >
      <BulkMaterialTool materialName="Gravel" defaultDepth="3" materials={["gravel-quarter-2", "gravel-pit-run", "base-course", "limestone", "sand"]} sizeNote="Pick the closest gravel type to set the weight factor, or type your supplier's tons-per-yard figure. The result updates as you type." />
    </ToolPageLayout>
  );
}
