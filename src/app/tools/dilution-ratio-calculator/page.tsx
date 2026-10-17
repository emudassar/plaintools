import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DilutionRatioTool from "@/components/DilutionRatioTool";
import { requireTool } from "@/config/tools";

const SLUG = "dilution-ratio-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Dilution Ratio Calculator: How Much Product and Water",
  description:
    "Enter a 1:N dilution ratio and how much mix you want (or how much concentrate you have) and get the exact amounts of product and water in ounces, cups, gallons, ml or litres, plus ounces per gallon.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function DilutionRatioPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to mix a dilution ratio",
        steps: [
          { name: "Enter N from the ratio", text: "For 1:10, enter 10." },
          { name: "Choose how the label reads", text: "Usually 1 part product + N parts water; some labels mean 1 part in N total." },
          { name: "Enter the amount", text: "How much finished mix you want, or how much concentrate you have." },
          { name: "Pick units", text: "Enter in one unit and read the result in another — e.g. a 32 oz spray bottle with results in ml." },
        ],
      }}
      uses={{
        heading: "10 situations where a dilution ratio calculator helps",
        items: [
          { title: "Filling a spray bottle", body: "A 1:10 cleaner in a 32 oz bottle needs 2.9 oz of product." },
          { title: "Car detailing chemicals", body: "All-purpose cleaners and shampoos list several ratios for different jobs." },
          { title: "Janitorial mixing", body: "Make up a gallon or a bucket of a concentrate at the label rate." },
          { title: "Pressure washer soap", body: "Work out how much detergent goes into the tank." },
          { title: "Garden concentrates", body: "Mix a measured batch from a concentrate labelled as a ratio." },
          { title: "Photo or darkroom chemistry", body: "Developers are often given as 1:N stock dilutions." },
          { title: "Ounces per gallon", body: "Convert a ratio into the 'oz per gallon' some labels use." },
          { title: "Small test batches", body: "Mix 100 ml to test on a hidden spot before a big batch." },
          { title: "How far a jug goes", body: "Enter the concentrate you have to see how much finished mix it makes." },
          { title: "Settling which reading is right", body: "See both readings of '1:4' side by side by switching the label setting." },
        ],
      }}
      dataSection={{
        heading: "How the amounts are worked out",
        paragraphs: [
          "A ratio of 1:N is a count of parts. Read as 1 part product plus N parts water, the mix has 1 + N parts, so product = finished volume ÷ (1 + N) and water = the rest. Read as 1 part in N total, product = finished volume ÷ N. The two readings differ — 1:4 is 20% product one way and 25% the other — which is why the page asks.",
          "Unit conversions use the U.S. customary definitions in NIST Handbook 44: 1 US gallon = 128 US fluid ounces = 3.785411784 litres. 'Ounces per gallon' is 128 ÷ total parts.",
          "Limits: all amounts are by volume. The page does not know whether a ratio is right for your surface or material, and it cannot say whether two products are safe to combine. The product label and its safety data sheet are the authorities for that.",
          "Everything runs in your browser; nothing is sent or stored.",
        ],
        sources: [{ label: "NIST Handbook 44", href: "https://www.nist.gov/pml/owm/publications/nist-handbooks/handbook-44", note: "U.S. customary volume units" }],
      }}
      faqs={[
        { question: "What does a 1:10 dilution ratio mean?", answer: "Usually 1 part product to 10 parts water — 11 parts in all. For 32 oz of mix that is 2.9 oz of product and 29.1 oz of water." },
        { question: "Is 1:4 the same as one in four?", answer: "Not necessarily. 1:4 as 'parts' means 1 + 4 = 5 parts (20% product); 'one in four' means 4 parts total (25%). Switch the reading to match your label." },
        { question: "How many ounces per gallon is 1:32?", answer: "128 ÷ 33 = 3.88 fl oz of product per gallon of mix, reading 1:32 as 1 part plus 32 parts water." },
        { question: "How do I dilute a concentrate I already have?", answer: "Choose 'how much product you have'; the page multiplies it out to the finished amount and the water to add." },
        { question: "Does it work in metric?", answer: "Yes — choose millilitres or litres for input or output." },
        { question: "Is this right for medicines or lab solutions?", answer: "It does volume arithmetic only. For anything dosed by concentration, use the formula and units your protocol specifies." },
      ]}
    >
      <DilutionRatioTool />
    </ToolPageLayout>
  );
}
