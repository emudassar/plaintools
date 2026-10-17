import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BulkMaterialTool from "@/components/BulkMaterialTool";
import { requireTool } from "@/config/tools";
import { NM_URL } from "@/lib/bulk-material";

const SLUG = "river-rock-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "River Rock Calculator: How Much River Rock Do I Need?",
  description:
    "Enter the size of the bed and the depth and get the river rock you need in cubic yards, tons and bags, with the published weight factor shown and editable for larger stone.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function RiverRockPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate how much river rock you need",
        steps: [
          { name: "Measure the bed", text: "Length and width, a circle's diameter, or the total area." },
          { name: "Enter the depth", text: "For river rock this is usually at least the size of the stones so the ground is covered." },
          { name: "Check the weight factor", text: "1.42 tons per cubic yard is the published row for gravel ¼–2 in; larger cobbles weigh differently, so use your supplier's figure for them." },
          { name: "Read yards, tons and bags", text: "Add prices to compare a bulk load with bags." },
        ],
      }}
      uses={{
        heading: "10 situations where a river rock calculator helps",
        items: [
          { title: "Dry creek bed", body: "Work out the rock for a long, narrow channel by entering its length and average width." },
          { title: "Mulch replacement around a house", body: "Measure each bed along the foundation and add up the volume before ordering." },
          { title: "Downspout splash areas", body: "Small areas are easiest in bags; the count is ready for the store." },
          { title: "Comparing a delivered load", body: "Quotes come per ton; the tons figure lets you compare suppliers." },
          { title: "Truck trips", body: "The weight shows whether a pickup can haul it in one load or needs several." },
          { title: "Round tree rings", body: "Use the circle shape and the ring's outer diameter, then subtract the trunk area if it matters." },
          { title: "Xeriscape conversions", body: "Replacing a lawn with rock is a big order; the yards figure is what landscapers quote by." },
          { title: "Pond and water-feature edges", body: "Estimate the decorative rock to finish the edge of a liner." },
          { title: "Budgeting before a design", body: "Try depths and areas to see what the material alone will cost." },
          { title: "Metric projects", body: "Enter metres and centimetres; get cubic metres and tonnes too." },
        ],
      }}
      dataSection={{
        heading: "Where the weight figure comes from",
        paragraphs: [
          "Volume is area × depth, with 27 cubic feet per cubic yard. Bags are the volume divided by the bag size printed on the bag, rounded up.",
          "The default weight factor is 1.42 short tons per cubic yard, the 'Gravel ¼\" – 2\"' row of the New Mexico Energy, Minerals and Natural Resources Department's 'Conversion Factors for Construction Materials and Common Minerals', which states it is adapted from the BLM's Handbook for Mineral Examiners (H-3890-1). Small river rock and pebbles fall in that size range. Cobbles larger than 2 in are outside it — use the weight your supplier gives for the size you buy.",
          "Limits: larger stones leave bigger voids and do not settle into a neat layer, so the volume for a given visible coverage is less certain than for small gravel. The result assumes an even depth on a flat area and does not include fabric, edging or a base layer.",
          "Everything runs in your browser; nothing is sent or stored.",
        ],
        sources: [{ label: "New Mexico EMNRD — Conversion Factors for Construction Materials and Common Minerals", href: NM_URL, note: "Gravel ¼–2 in = 1.42 short tons per cubic yard (adapted from BLM H-3890-1)" }],
      }}
      faqs={[
        { question: "How much does a ton of river rock cover?", answer: "At 1.42 tons per cubic yard, a ton is about 0.70 cubic yards (19 cubic feet) — roughly 76 ft² at 3 in deep. Larger rock with different density will cover a different amount." },
        { question: "How many bags of river rock are in a yard?", answer: "54 bags of 0.5 cu ft, since a cubic yard is 27 cubic feet." },
        { question: "How deep should river rock be?", answer: "This page does not set a depth; it calculates the one you enter. Many people choose a depth at least equal to the stone size so soil does not show." },
        { question: "Is river rock heavier than pea gravel?", answer: "Both sit in the same published gravel row here. Real loads differ with the stone, the size mix and moisture, so use a supplier's figure for a firm weight." },
        { question: "Can I use it for large cobbles?", answer: "For volume, yes. For weight, replace the factor with your supplier's figure, because stones over 2 in are outside the published row used as the default." },
        { question: "Does it work in metric?", answer: "Yes — choose metres and centimetres." },
      ]}
    >
      <BulkMaterialTool materialName="River rock" defaultDepth="3" sizeNote="The default weight factor covers stone ¼–2 in. For cobbles larger than 2 in, enter your supplier's tons per cubic yard. The result updates as you type." />
    </ToolPageLayout>
  );
}
