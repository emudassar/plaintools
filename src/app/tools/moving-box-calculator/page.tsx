import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import MovingBoxTool from "@/components/MovingBoxTool";
import { requireTool } from "@/config/tools";

const SLUG = "moving-box-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Moving Box Calculator: Total Volume, Cost and Tape",
  description:
    "Enter how many small, medium, large and wardrobe boxes you plan to pack and get the total cubic feet for the truck, the cost of the boxes and the rolls of tape.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function MovingBoxCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to add up your moving boxes",
        steps: [
          { name: "Count boxes by size", text: "Room by room, then enter the totals for each size." },
          { name: "Check the box sizes", text: "Change the dimensions to match the boxes you buy." },
          { name: "Add prices", text: "Optional cost per box." },
          { name: "Read the totals", text: "Boxes, cubic feet, cost and rolls of tape." },
        ],
      }}
      uses={{
        heading: "10 moving decisions this helps with",
        items: [
          { title: "Choosing a truck size", body: "A family compares the boxes' cubic feet with a truck's published cargo volume." },
          { title: "Budgeting for boxes", body: "A student moving out of a dorm prices boxes." },
          { title: "Buying tape", body: "Someone works out how many rolls of tape to buy." },
          { title: "Comparing box kits", body: "A mover compares a kit with buying boxes separately." },
          { title: "Storage units", body: "Someone checks whether boxes fit a storage unit's volume." },
          { title: "Shipping containers", body: "A family moving abroad estimates the space boxes take." },
          { title: "Office moves", body: "An office manager totals file boxes." },
          { title: "Downsizing", body: "A retiree sees how much fewer boxes a smaller home needs." },
          { title: "Moving quotes", body: "A customer gives a mover a box count." },
          { title: "Packing schedules", body: "Someone plans how many boxes to pack each day." },
        ],
      }}
      dataSection={{
        heading: "How the totals are worked out",
        paragraphs: [
          "Each box's volume is length × width × height in inches ÷ 1,728 = cubic feet; multiplied by the count and added. Tape = feet per box × boxes ÷ roll length, rounded up.",
          "The box sizes are starting values; box makers and stores sell different dimensions, so enter the sizes printed on yours.",
          "Limits: there is no published standard for how many boxes a room needs, so the page counts only what you enter. Boxes are only part of a load: furniture and appliances take truck space too, and boxes never fill a truck without gaps.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I calculate the volume of a box?", answer: "Length × width × height in inches ÷ 1,728 gives cubic feet." },
        { question: "How many boxes fit in a truck?", answer: "Divide the truck's cargo volume by the box volume, then allow for gaps and furniture." },
        { question: "How much tape do I need?", answer: "Enter your own feet per box; the page multiplies by the number of boxes." },
        { question: "What sizes are moving boxes?", answer: "They vary by maker; enter the dimensions printed on the boxes you buy." },
        { question: "Does it count furniture?", answer: "No, only boxes." },
        { question: "Why are there no per-room box counts?", answer: "No published standard exists for boxes per room, so the page uses your own count." },
      ]}
    >
      <MovingBoxTool />
    </ToolPageLayout>
  );
}
