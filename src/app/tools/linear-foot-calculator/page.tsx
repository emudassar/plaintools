import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import LinearFootTool from "@/components/LinearFootTool";
import { requireTool } from "@/config/tools";

const SLUG = "linear-foot-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Linear Foot Calculator: Square Feet to Linear Feet and Back",
  description:
    "Convert square feet to linear feet of boards using the board's coverage width, add up pieces into total linear feet, or convert linear feet back to square feet, with waste, pieces and cost.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function LinearFootPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate linear feet",
        steps: [
          { name: "Pick the conversion", text: "Square feet to linear feet, pieces to linear feet, or linear feet to square feet." },
          { name: "Enter the coverage width", text: "The face each board covers once installed, in inches. For tongue-and-groove or lap boards this is less than the board's full width." },
          { name: "Add allowance and stock length", text: "Optional: a waste percentage and the length of the boards you will buy for a piece count." },
          { name: "Read the result", text: "Linear feet, pieces and cost if you entered a price." },
        ],
      }}
      uses={{
        heading: "10 situations where a linear foot calculator helps",
        items: [
          { title: "Ordering shiplap or paneling", body: "Wall area in square feet becomes the linear feet a lumber yard sells by." },
          { title: "Reclaimed wood priced per linear foot", body: "Convert the wall or floor area into the unit on the price list." },
          { title: "Fence boards", body: "Turn a fence face area into linear feet of pickets of a given width." },
          { title: "Adding up a cut list", body: "Several rows of pieces at different lengths become one total to buy." },
          { title: "Trim and molding", body: "Total linear feet for casing, baseboard or crown from a list of pieces." },
          { title: "Decking boards", body: "Deck area ÷ board coverage width (plus gap) gives the linear feet of decking." },
          { title: "Checking a quote", body: "Compare a supplier's linear-foot quantity with your area." },
          { title: "What a bundle covers", body: "Reverse mode turns a bundle's linear feet into the square feet it will cover." },
          { title: "Countertop edge or banding", body: "Add up edge pieces for edge banding or laminate trim." },
          { title: "Metric conversion", body: "Pieces mode also gives metres and yards." },
        ],
      }}
      dataSection={{
        heading: "How the conversion works",
        paragraphs: [
          "A linear foot is a foot of length regardless of width. To cover an area with boards you need area ÷ board width: square feet × 12 ÷ coverage width in inches. A 5.5 in wide board covers 0.458 ft² per linear foot, so 100 ft² needs about 218 linear feet. Reverse mode multiplies instead.",
          "Coverage width is the part of each board you see once installed. Tongue-and-groove, shiplap and lap siding overlap, so their coverage is less than their full width; decking with gaps covers board width plus gap. Measure an installed board or use the coverage figure the supplier gives.",
          "The piece count divides the total by the stock length and rounds up. It assumes offcuts are used and does not plan where joints fall. Any waste allowance is your own figure.",
          "Everything runs in your browser; nothing is sent or stored.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I convert square feet to linear feet?", answer: "Multiply the square feet by 12 and divide by the board's coverage width in inches. 200 ft² of 6 in coverage boards is 400 linear feet." },
        { question: "Is a linear foot the same as a foot?", answer: "Yes. 'Linear' just says the length is measured along the piece, without regard to width or thickness." },
        { question: "What's the difference between linear feet and board feet?", answer: "Board feet measure volume (a board foot is 144 cubic inches). Linear feet measure only length." },
        { question: "Which width should I use for tongue and groove?", answer: "The exposed face after the boards are joined, not the full width including the tongue." },
        { question: "How many linear feet are in a square foot?", answer: "It depends on the width: 12 ÷ width in inches. For a 4 in board, 3 linear feet cover one square foot." },
        { question: "Can I use it for fabric or carpet?", answer: "Yes — any material sold off a roll by length with a fixed width converts the same way; enter the width in inches." },
      ]}
    >
      <LinearFootTool />
    </ToolPageLayout>
  );
}
