import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import TileTool from "@/components/TileTool";
import { requireTool } from "@/config/tools";

const SLUG = "tile-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Tile Calculator: How Many Tiles and Boxes Do I Need?",
  description:
    "Enter the area, tile size and grout joint width and get the number of tiles and boxes to buy with your waste allowance, plus the cost. Works in feet and inches or metric.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function TileCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out how many tiles you need",
        steps: [
          { name: "Measure the area", text: "Multiply length by width for each floor or wall section. Enter several areas separated by commas." },
          { name: "Enter the tile size", text: "Use the actual size printed on the box, in inches or millimetres." },
          { name: "Enter the grout joint", text: "The joint width you plan to use, such as 1/8 in (0.125) or 3 mm." },
          { name: "Set a waste allowance", text: "Your own percentage for cuts and breakage." },
          { name: "Read tiles and boxes", text: "Add tiles per box and a price to get the boxes to buy and the cost." },
        ],
      }}
      uses={{
        heading: "10 situations where a tile calculator helps",
        items: [
          { title: "Ordering a discontinued tile once", body: "If the line may not be restocked, running short means a mismatched patch; the count tells you how much to buy up front." },
          { title: "Comparing tile sizes on cost", body: "A 12×24 and a 24×48 cover the same floor with very different counts and box prices; change the size to compare." },
          { title: "Pricing a bathroom remodel", body: "Floor plus shower walls entered as separate areas give one total for a quote." },
          { title: "Checking a contractor's material list", body: "Compare their tile count with your own measurement before you pay for the order." },
          { title: "Backsplash in a few sections", body: "Enter each run between cabinets and windows as its own area." },
          { title: "Seeing how much the joint matters", body: "On small mosaic tiles a wide joint takes a real share of the surface; the result shows that share." },
          { title: "Planning returns", body: "Knowing the exact count with a stated allowance helps decide how many spare boxes to keep." },
          { title: "Metric tile in an imperial room", body: "Switch to metric when the box lists 300 × 600 mm and measure the room in metres." },
          { title: "Budgeting a rental turnover", body: "The same unit layout can be estimated once and reused across units." },
          { title: "Patio or porch tile", body: "Outdoor porcelain is counted the same way; enter the porch area and paver-style tile size." },
        ],
      }}
      dataSection={{
        heading: "How the tile count is worked out",
        paragraphs: [
          "This is arithmetic with no outside data. Each tile occupies its own face plus one grout joint in each direction, so the area per tile laid is (tile length + joint) × (tile width + joint). The area to cover divided by that figure is the number of tiles before any allowance. Your waste percentage is added and the total is rounded up to whole tiles; dividing by tiles per box and rounding up gives boxes.",
          "Everything runs in your browser; nothing is sent or stored.",
          "Limits: the count treats offcuts as usable somewhere else. Patterns such as diagonal, herringbone or a large-format tile in a small room can leave pieces that cannot be reused, which needs a bigger allowance than a straight lay. Nominal and actual tile sizes can differ by a few millimetres; use the size on the box. The waste allowance is your own figure — there is no published standard for it.",
          "This page counts tiles only. It does not size thinset, grout, backer board or trowel notches, and it says nothing about whether a floor is flat or stiff enough for tile.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I calculate how many tiles I need?", answer: "Divide the area by the area one tile covers including one grout joint, add a waste allowance and round up. For 100 ft² of 12×12 tile with no joint that is 100 tiles before allowance." },
        { question: "Does the grout joint change the count?", answer: "Yes, slightly. With 12×12 tile and a 1/8 in joint each tile covers 12.125 × 12.125 in, so 100 ft² needs about 98 tiles instead of 100. On small tiles the difference is larger." },
        { question: "How much extra tile should I buy?", answer: "That is your call; the calculator uses whatever percentage you enter. Rooms with many cuts, diagonal layouts and large tiles generally use more." },
        { question: "How many boxes of tile do I need?", answer: "Enter the tiles per box from the label. The page divides the tile count by it and rounds up." },
        { question: "Can I enter an L-shaped room?", answer: "Split it into rectangles, work out each area, and enter them separated by commas." },
        { question: "Does it work for wall tile?", answer: "Yes. Enter the wall area after subtracting windows, doors and anything the tile will not cover." },
        { question: "Does it work in metric?", answer: "Switch the units to metres and millimetres; areas are then in m² and tile sizes in mm." },
      ]}
    >
      <TileTool />
    </ToolPageLayout>
  );
}
