import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CubicYardsTonsTool from "@/components/CubicYardsTonsTool";
import { requireTool } from "@/config/tools";
import { NM_URL } from "@/lib/bulk-material";

const SLUG = "cubic-yards-to-tons-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Cubic Yards to Tons Calculator for Gravel, Sand, Soil and Stone",
  description:
    "Convert cubic yards to tons or tons to cubic yards for gravel, sand, base course, limestone, topsoil, fill dirt, riprap and more, using a published state conversion table or your supplier's figure.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function YardsToTonsPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert cubic yards to tons",
        steps: [
          { name: "Choose the direction", text: "Cubic yards to tons, or tons to cubic yards." },
          { name: "Enter the amount", text: "In cubic yards or short tons." },
          { name: "Pick the material", text: "From the published table, or enter your supplier's tons per cubic yard." },
          { name: "Read the result", text: "Short tons, pounds, tonnes and cubic metres, plus every material in the table." },
        ],
      }}
      uses={{
        heading: "10 situations where a yards-to-tons converter helps",
        items: [
          { title: "Ordering from a quarry", body: "Quarries sell by the ton; your plans are in cubic yards." },
          { title: "Comparing quotes", body: "One supplier quotes per yard, another per ton; convert to compare." },
          { title: "Truck payload", body: "Check that a load won't exceed a truck's rated payload." },
          { title: "Dump truck loads", body: "Turn a truck's ton capacity into how many yards it carries." },
          { title: "Fill dirt for grading", body: "Convert a cut-and-fill volume into tons to haul." },
          { title: "Road base for a driveway", body: "Base course has its own factor in the table." },
          { title: "Riprap for a bank", body: "Large stone weighs differently per yard; the table lists it." },
          { title: "Topsoil for beds", body: "Light material — the factor is much lower than gravel." },
          { title: "Metric projects", body: "See tonnes and cubic metres alongside." },
          { title: "Checking a scale ticket", body: "Compare the delivered tons with the yards you ordered." },
        ],
      }}
      dataSection={{
        heading: "Where the conversion factors come from",
        paragraphs: [
          "The factors are the New Mexico Energy, Minerals and Natural Resources Department table 'Conversion Factors for Construction Materials and Common Minerals', which says to multiply cubic yards by the factor to get short tons and states it is adapted from the Bureau of Land Management publication H-3890-1, Handbook for Mineral Examiners. The values are shown exactly as printed, for example gravel ¼–2 in 1.42, pit-run gravel 1.62, sand 1.45, base course 1.25 and top soil 0.8.",
          "Tons here are short tons of 2,000 lb. Tonnes (metric) = short tons × 0.907185; cubic metres = cubic yards × 0.764555.",
          "Limits: real material weighs more when wet and when compacted, and products differ from one pit to the next. Some rows of a general table will not match a specific product. When a supplier gives its own tons-per-yard figure, choose 'my supplier's figure' and enter it. For billing, the scale ticket is what counts. Everything runs in your browser.",
        ],
        sources: [{ label: "New Mexico EMNRD — Conversion Factors for Construction Materials and Common Minerals", href: NM_URL, note: "Short tons per cubic yard, adapted from BLM H-3890-1" }],
      }}
      faqs={[
        { question: "How many tons are in a cubic yard of gravel?", answer: "The published state figure for gravel ¼–2 in is 1.42 short tons per cubic yard; pit-run gravel is listed at 1.62." },
        { question: "How do I convert cubic yards to tons?", answer: "Multiply cubic yards by the material's tons per cubic yard. 10 yards of sand × 1.45 = 14.5 tons." },
        { question: "How do I convert tons to cubic yards?", answer: "Divide tons by the material's tons per cubic yard." },
        { question: "How much does a yard of topsoil weigh?", answer: "The table lists top soil at 0.8 short tons (1,600 lb) per cubic yard. Moist topsoil can weigh more." },
        { question: "Is a ton 2,000 or 2,204 pounds?", answer: "The table uses short tons of 2,000 lb. A metric tonne is 1,000 kg (2,204.6 lb); the page shows both." },
        { question: "Why does my supplier use a different number?", answer: "Their figure is for their product and moisture. Enter it as 'my supplier's figure' for the most accurate result." },
      ]}
    >
      <CubicYardsTonsTool />
    </ToolPageLayout>
  );
}
