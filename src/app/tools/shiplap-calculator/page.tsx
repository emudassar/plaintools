import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ShiplapTool from "@/components/ShiplapTool";
import { requireTool } from "@/config/tools";

const SLUG = "shiplap-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Shiplap Calculator: How Many Boards Do I Need?",
  description:
    "Enter your walls, the board's exposed face width and length and get how many shiplap boards to buy, counted row by row and by area, with the courses per wall, linear feet and cost.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ShiplapPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate shiplap",
        steps: [
          { name: "Measure each wall", text: "Width and height in feet." },
          { name: "Enter the exposed face", text: "What each board shows after the overlap, in inches." },
          { name: "Enter the board length", text: "8, 12 or 16 ft — whatever you'll buy." },
          { name: "Subtract openings and add waste", text: "Window and door area, and an allowance." },
          { name: "Read the boards", text: "A row-by-row count and an area count, with linear feet." },
        ],
      }}
      uses={{
        heading: "10 situations where a shiplap calculator helps",
        items: [
          { title: "Accent wall behind a TV or bed", body: "Exact boards for one wall." },
          { title: "Whole-room shiplap", body: "Add each wall and get one total." },
          { title: "Ceiling planks", body: "Treat the ceiling as a wall: length × width." },
          { title: "Choosing board length", body: "Compare 8 ft and 16 ft boards by count and joints." },
          { title: "Real vs nominal width", body: "Enter the exposed face so the count isn't short." },
          { title: "Bathroom wainscot in shiplap", body: "Set the height to your wainscot height." },
          { title: "Pricing per board", body: "Boards × price for a budget." },
          { title: "Checking a kit", body: "Compare a panel kit's coverage with the boards needed." },
          { title: "Exterior shiplap siding", body: "Courses per wall for a shed or cabin." },
          { title: "Planning joints", body: "Courses per wall show how many rows to lay out." },
        ],
      }}
      dataSection={{
        heading: "How the boards are counted",
        paragraphs: [
          "This is arithmetic with no outside data. Boards run horizontally, so each wall needs ceil(height ÷ exposed face) rows (courses), and each course needs ceil(wall width ÷ board length) boards. That course-by-course count assumes every row starts with fresh boards.",
          "The area count is the other bound: net area (walls minus openings) × 12 ÷ exposed face gives linear feet, ÷ board length gives boards, assuming every offcut gets used somewhere. Real jobs land between the two; your waste allowance is applied to both.",
          "Exposed face matters: shiplap boards overlap, so a nominal 1×6 covers less than 5½ in. Measure an installed board or check the product's coverage. Limits: the page doesn't plan stagger, cuts around outlets or where openings fall. Everything runs in your browser.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How many shiplap boards do I need for a wall?", answer: "Rows = height ÷ exposed face (rounded up); boards per row = width ÷ board length (rounded up). A 12 × 8 ft wall with 5.125 in exposure and 8 ft boards is 19 rows × 2 = 38 boards." },
        { question: "What width is shiplap?", answer: "It varies by product; enter the exposed face after the overlap, not the nominal size." },
        { question: "Why are there two counts?", answer: "One assumes no offcuts are reused (more boards), the other that all are (fewer). Real needs sit between." },
        { question: "Should I subtract windows?", answer: "The area count subtracts the openings you enter; the row count doesn't, because rows usually run past small openings." },
        { question: "How much extra should I buy?", answer: "Your call — the allowance you enter is applied to both counts." },
        { question: "Can I use this for a ceiling?", answer: "Yes, enter the ceiling's length and width as one wall." },
      ]}
    >
      <ShiplapTool />
    </ToolPageLayout>
  );
}
