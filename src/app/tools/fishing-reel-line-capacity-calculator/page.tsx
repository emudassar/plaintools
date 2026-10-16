import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ReelLineCapacityTool from "@/components/ReelLineCapacityTool";
import { requireTool } from "@/config/tools";

const SLUG = "fishing-reel-line-capacity-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Fishing Reel Line Capacity Calculator (Braid, Mono, Backing)",
  description:
    "Enter your reel's rated line capacity and your line's diameter and get how many yards or metres of that line the spool holds — including braid on top of mono backing.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ReelLineCapacityPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out reel capacity for a different line",
        steps: [
          { name: "Read the reel's rating", text: "Printed on the spool or in the specs, e.g. 0.30 mm/150 m or 10 lb/120 yd." },
          { name: "Enter the rated diameter and length", text: "For a pound-test rating, enter the diameter of a line of that test." },
          { name: "Enter your line's diameter", text: "From your line's spool label, in the same unit." },
          { name: "Add backing if you use it", text: "The backing's diameter and length come off the capacity first." },
          { name: "Read the length", text: "The estimated yards or metres of your line the spool will hold." },
        ],
      }}
      uses={{
        heading: "10 situations where a line capacity calculator helps",
        items: [
          { title: "Switching from mono to braid", body: "Thin braid fits far more length on the same spool; see roughly how much." },
          { title: "Deciding how much backing to use", body: "Find how much backing leaves room for the length of braid you bought." },
          { title: "Buying the right spool of line", body: "Avoid buying 300 yd when the reel holds 180, or running short." },
          { title: "Comparing two reels", body: "Run both ratings against the same line to compare real capacity." },
          { title: "Heavier line than the rating", body: "Going up in diameter cuts capacity faster than people expect — it scales with the square." },
          { title: "Fly reels and backing", body: "The same volume arithmetic applies to backing under fly line, given diameters." },
          { title: "Saltwater and long runs", body: "Check there is enough line for species that run a long way." },
          { title: "Ratings in the 'wrong' unit", body: "Convert a metric rating to yards or the other way round." },
          { title: "Topping up an old spool", body: "Estimate how much new line goes on over what is left." },
          { title: "Setting up kids' reels", body: "Work out a sensible fill for small spools with light line." },
        ],
      }}
      dataSection={{
        heading: "How the estimate is worked out",
        paragraphs: [
          "This is cylinder geometry, not a published table. A spool holds a fixed volume of line, and a length of line with diameter d occupies π/4 × d² × length. So for the same spool, rated diameter² × rated length = your diameter² × your length: halving the diameter fits four times the length. Backing takes its own diameter² × length out of the spool's capacity first.",
          "Reels are rated as a diameter and length or a pound test and length. Pound test alone does not fix a diameter — it varies by brand and line type — so the calculator asks for diameters, which are printed on most line spools.",
          "Everything runs in your browser; nothing is sent or stored.",
          "Limits: the result is an estimate. Line does not pack like a perfect cylinder: braid flattens, mono can stretch or bed in, spools taper, and winding tension changes how much fits. Manufacturers' ratings also assume their own fill level. Treat the number as a guide and leave some room below the spool lip.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I work out how much braid fits on my reel?", answer: "Use the reel's rated diameter and length and your braid's diameter: length = rated diameter² × rated length ÷ braid diameter². 150 m of 0.30 mm becomes about 337 m of 0.20 mm." },
        { question: "Why does a slightly thicker line reduce capacity so much?", answer: "Capacity depends on the square of the diameter. Line 20% thicker fits about 31% less length." },
        { question: "My reel is rated in pound test, not diameter. What do I enter?", answer: "The diameter of a line at that pound test — ideally the line type the rating was made with, usually mono. Diameters vary by brand, which adds uncertainty." },
        { question: "How much backing should I use?", answer: "That is your choice. Enter a backing length and the page shows the room left for the main line and the share of the spool the backing uses." },
        { question: "Is this exact?", answer: "No. It assumes line packs the same way at any diameter. Braid and mono pack differently, so expect some difference on the real spool." },
        { question: "Does it work for fly reels?", answer: "Only for round lines with a known diameter, such as backing. Tapered fly line does not have a single diameter." },
      ]}
    >
      <ReelLineCapacityTool />
    </ToolPageLayout>
  );
}
