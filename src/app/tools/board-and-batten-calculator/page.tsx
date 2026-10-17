import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BoardAndBattenTool from "@/components/BoardAndBattenTool";
import { requireTool } from "@/config/tools";

const SLUG = "board-and-batten-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Board and Batten Calculator: Spacing, Layout and Materials",
  description:
    "Enter your wall width, batten width and the gap or number of battens you want and get exactly equal spacing, where each batten goes, and the linear feet and pieces to buy.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function BoardAndBattenPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to lay out a board and batten wall",
        steps: [
          { name: "Measure the wall", text: "Width in inches from corner to corner, and the height of the vertical battens." },
          { name: "Enter the batten width", text: "The actual face width — a 1×4 is 3.5 in, a 1×3 is 2.5 in." },
          { name: "Choose a target gap or a count", text: "The page rounds to the nearest whole number of battens and makes every gap equal." },
          { name: "Add rails and stock length", text: "Count the top rail and any middle rails; enter the board length you will buy." },
          { name: "Mark the positions", text: "Use the list of left-edge positions measured from the left end of the wall." },
        ],
      }}
      uses={{
        heading: "10 situations where a board and batten calculator helps",
        items: [
          { title: "Accent wall behind a bed", body: "Get spacing that comes out exactly even instead of a narrow last gap at the corner." },
          { title: "Choosing between 12 and 16 in gaps", body: "Switch the target gap and see how many battens each needs and what it costs in boards." },
          { title: "Half-height wall in a hallway", body: "Set a 36–48 in batten height with a top rail for a wainscot-style look." },
          { title: "Grid wall", body: "Add middle rails to see the extra linear feet a grid pattern adds." },
          { title: "Buying the right board count", body: "The piece count accounts for battens taller than one board." },
          { title: "Marking without math on the wall", body: "Measure each left edge from the corner instead of adding up gaps and battens." },
          { title: "Exterior board and batten siding", body: "Lay out batten spacing across a gable or shed wall section." },
          { title: "Working around a window", body: "Lay out each wall section between openings separately." },
          { title: "Nursery or playroom wall", body: "Try different batten widths to see which spacing looks balanced." },
          { title: "Pricing a DIY weekend", body: "Linear feet with allowance gives the lumber cost before you go." },
        ],
      }}
      dataSection={{
        heading: "How the spacing is worked out",
        paragraphs: [
          "This is equal-spacing arithmetic with no outside data. With a batten at each end of the wall and N battens in total there are N − 1 gaps, so each gap is (wall width − N × batten width) ÷ (N − 1). The on-centre spacing is gap + batten width, and the left edge of batten k sits at k × on-centre from the left end.",
          "When you enter a target gap, the page picks the whole number of battens that comes closest to it and recalculates the gap so every space is identical. That is why the gap shown can differ slightly from the one you typed.",
          "Material: vertical battens × height, plus each full-width rail × wall width, gives linear feet. The piece count works per batten, so a batten taller than one stock board counts two pieces.",
          "Limits: the layout does not know where studs, outlets, switches, vents or windows are. Walls are rarely perfectly square, so check positions at the top and bottom before nailing. Everything runs in your browser.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I calculate board and batten spacing?", answer: "Subtract the total width of all battens from the wall width, then divide by the number of gaps (battens minus one). A 120 in wall with six 3.5 in battens has 19.8 in gaps." },
        { question: "How far apart should battens be?", answer: "It's a style choice; this page doesn't recommend one. Enter the gap you like and it finds the nearest spacing that comes out exactly even." },
        { question: "Do I put a batten in the corner?", answer: "This layout puts one at each end. If an adjoining wall's batten will cover the corner, measure your wall width to the face of that batten instead." },
        { question: "How many battens do I need?", answer: "Choose 'a target gap' and the page returns the count, or enter a count directly." },
        { question: "What size boards are used for battens?", answer: "Enter the actual face width of whatever you buy; nominal 1×3 and 1×4 boards are 2.5 in and 3.5 in wide." },
        { question: "Does it include the top rail?", answer: "Yes — set 'Full-width horizontal rails' to 1 for a top rail, more for a grid." },
      ]}
    >
      <BoardAndBattenTool />
    </ToolPageLayout>
  );
}
