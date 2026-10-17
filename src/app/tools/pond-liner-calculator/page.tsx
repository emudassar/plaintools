import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PondLinerTool from "@/components/PondLinerTool";
import { requireTool } from "@/config/tools";
import { APS_URL } from "@/lib/pond-liner";

const SLUG = "pond-liner-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Pond Liner Calculator: What Size Liner Do I Need?",
  description:
    "Enter your pond's longest length, widest width and deepest point and get the liner and underlay size to buy, including the edge overlap, in feet or metres.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PondLinerPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out pond liner size",
        steps: [
          { name: "Measure the longest length", text: "End to end at the widest point of the hole." },
          { name: "Measure the widest width", text: "Side to side." },
          { name: "Measure the deepest point", text: "Even if only one area is that deep." },
          { name: "Set the edge overlap", text: "All Pond Solutions uses 2 ft (0.6 m) each side to anchor the liner." },
          { name: "Read the liner size", text: "Length × width to buy, and the same for underlay." },
        ],
      }}
      uses={{
        heading: "10 situations where a pond liner calculator helps",
        items: [
          { title: "Digging a new garden pond", body: "Buy the right liner before you dig too far." },
          { title: "Replacing a leaking liner", body: "Measure the existing hole and get the new size." },
          { title: "Koi ponds", body: "Deeper ponds need much more liner per foot of length." },
          { title: "Wildlife ponds", body: "Shallow, sloped ponds still use the deepest point." },
          { title: "Ordering underlay", body: "Underlay is cut to the same size." },
          { title: "Comparing EPDM and PVC prices", body: "Enter a price per square foot or metre." },
          { title: "Metric liners", body: "Work in metres for liners sold by the metre." },
          { title: "Stream and waterfall pools", body: "Each pool is sized the same way." },
          { title: "Raised ponds", body: "Use the inside height as depth." },
          { title: "Choosing a stock size", body: "Round up to the next size the supplier sells." },
        ],
      }}
      dataSection={{
        heading: "How the size is worked out",
        paragraphs: [
          "A flexible liner has to cover the bottom, go down one side and up the other, and lie flat past the edge so it can be held in place. All Pond Solutions gives the formula as overlap + depth + width + depth + overlap for the width, and the same with the length, and says overlap 'should always be 0.6m (2 feet)' so the liner can be secured — otherwise it 'will sink into the pond' when filling. They also advise rounding totals up.",
          "Using the maximum depth on both sides means sloped sides and shelves are covered with some to spare. A 10 × 8 ft pond, 3 ft deep, with 2 ft overlap needs a 20 × 18 ft liner.",
          "Limits: very irregular shapes and steep pleats can need more. Liner material, thickness and UV rating are separate choices. Liners are sold in stock sizes, so round up to the next one available. Everything runs in your browser.",
        ],
        sources: [{ label: "All Pond Solutions — Calculating the size of your pond liner", href: APS_URL, note: "Overlap + depth + dimension + depth + overlap; 0.6 m / 2 ft overlap" }],
      }}
      faqs={[
        { question: "How do I calculate pond liner size?", answer: "Liner length = pond length + 2 × depth + 2 × overlap; liner width = pond width + 2 × depth + 2 × overlap." },
        { question: "What size liner for a 10 × 8 pond?", answer: "At 3 ft deep with a 2 ft overlap: 20 × 18 ft." },
        { question: "How much overlap should I leave?", answer: "All Pond Solutions uses 2 ft (0.6 m) on each edge; the page lets you change it." },
        { question: "Do I use the average or maximum depth?", answer: "The maximum — the liner has to reach the deepest point." },
        { question: "Does underlay need to be the same size?", answer: "Yes, it goes under the whole liner." },
        { question: "What if my pond has shelves?", answer: "Measure to the deepest point; shelves are covered within that." },
      ]}
    >
      <PondLinerTool />
    </ToolPageLayout>
  );
}
