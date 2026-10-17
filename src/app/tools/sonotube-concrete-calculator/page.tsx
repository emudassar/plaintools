import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SonotubeTool from "@/components/SonotubeTool";
import { requireTool } from "@/config/tools";
import { QUIKRETE_1101_URL, QUIKTUBE_URL } from "@/lib/concrete-bags";

const SLUG = "sonotube-concrete-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Sonotube Concrete Calculator: Yards and Bags per Tube",
  description:
    "Enter the tube form diameter, the depth of concrete and the number of tubes and get the volume in cubic yards and how many 40, 50, 60, 80 or 90 lb bags of concrete mix to buy.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function SonotubePage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate concrete for tube forms",
        steps: [
          { name: "Enter the tube diameter", text: "The inside diameter of the form, e.g. 8, 10 or 12 in." },
          { name: "Enter the depth", text: "How deep the concrete will be in the tube, in inches." },
          { name: "Enter the number of tubes", text: "And an allowance for spillage and uneven hole bottoms." },
          { name: "Add a footing if you have one", text: "A flared or poured footing under the tube, as a diameter and thickness." },
          { name: "Read yards and bags", text: "Cubic yards for a ready-mix order, or bags by size." },
        ],
      }}
      uses={{
        heading: "10 situations where a Sonotube calculator helps",
        items: [
          { title: "Deck footings", body: "Count the bags for a row of 10 or 12 in piers before the store run." },
          { title: "Bags or ready-mix", body: "When the yards add up past a few, compare a short-load delivery with dozens of bags." },
          { title: "Porch and stair landings", body: "A handful of tubes for a small landing." },
          { title: "Pergolas and carports", body: "Four to six deep piers add up quickly in 80 lb bags." },
          { title: "Fence and gate posts set in tubes", body: "Size the concrete per post when a tube is used above grade." },
          { title: "Sheds on piers", body: "Price a pier foundation against a slab." },
          { title: "Flared footings", body: "Add the footing volume under each tube so the order isn't short." },
          { title: "Choosing a bag size", body: "See 60 lb versus 80 lb counts — lighter bags, more trips." },
          { title: "Mixer loads", body: "Bags per tube helps plan batches in a small mixer." },
          { title: "Metric check", body: "The volume is also given in cubic metres." },
        ],
      }}
      dataSection={{
        heading: "Where the bag yields come from",
        paragraphs: [
          "Volume is a cylinder: π × (diameter ÷ 2)² × depth, times the number of tubes, plus any footing, plus your allowance. 27 cubic feet make a cubic yard.",
          "Bag yields are from the QUIKRETE Concrete Mix (No. 1101) data sheet: a 40 lb bag yields approximately 0.30 ft³, 50 lb 0.375 ft³, 60 lb 0.45 ft³, 80 lb 0.60 ft³ and 90 lb 0.675 ft³ (90 lb where regionally available). Bags = volume ÷ yield, rounded up.",
          "As a check, this method reproduces every cell of the bag table on QUIKRETE's own QUIK-Tube data sheet — 6, 8, 10 and 12 in tubes at 1 to 4 ft deep, for 60 lb and 80 lb bags — exactly.",
          "Limits: other products (fast-setting, high-strength, other brands) yield differently; check your bag. The page does not size piers or footings — diameter, depth below frost and footing size depend on loads and soil and are set by your building code or an engineer. Everything runs in your browser.",
        ],
        sources: [
          { label: "QUIKRETE Concrete Mix (No. 1101) data sheet", href: QUIKRETE_1101_URL, note: "Yield per bag size" },
          { label: "QUIKRETE QUIK-Tube data sheet", href: QUIKTUBE_URL, note: "Bags per tube table used as a cross-check" },
        ],
      }}
      faqs={[
        { question: "How many bags of concrete for a 12 inch Sonotube?", answer: "Per foot of depth a 12 in tube holds 0.785 ft³: 2 bags of 80 lb or 2 bags of 60 lb for 1 ft, and 6 × 80 lb or 7 × 60 lb for 4 ft — matching QUIKRETE's QUIK-Tube table." },
        { question: "How much concrete in a 10 inch tube 4 feet deep?", answer: "2.18 ft³ — 4 bags of 80 lb or 5 bags of 60 lb." },
        { question: "How do I convert to cubic yards?", answer: "Divide cubic feet by 27. The page shows yards for a ready-mix order." },
        { question: "Should I add extra?", answer: "Most people add a little for spills and uneven holes; the allowance is your choice and is applied before rounding." },
        { question: "Does it work for other brands?", answer: "The volume does. Bag counts use QUIKRETE Concrete Mix yields; check the yield printed on another brand's bag." },
        { question: "How deep should my piers be?", answer: "That's set by your building code (frost depth, footing size) and your loads, not by this page." },
      ]}
    >
      <SonotubeTool />
    </ToolPageLayout>
  );
}
