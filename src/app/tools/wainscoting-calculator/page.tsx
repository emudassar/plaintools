import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import WainscotingTool from "@/components/WainscotingTool";
import { requireTool } from "@/config/tools";

const SLUG = "wainscoting-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Wainscoting Calculator: Panels, Sheets, Trim and Layout",
  description:
    "Enter your walls, doors and wainscot height and get the square footage, the number of 4 × 8 panel sheets when cut into strips, the cap and base trim pieces, and an even raised-panel layout for any wall.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function WainscotingPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate wainscoting",
        steps: [
          { name: "List the walls", text: "Each wall length in feet, and the total width of doors and openings." },
          { name: "Set the height", text: "The finished wainscot height in inches." },
          { name: "Enter the sheet size", text: "4 × 8 ft (48 × 96 in) is common for beadboard and MDF panels." },
          { name: "Read sheets and trim", text: "Sheets cut into strips, and the pieces for each trim line." },
          { name: "Lay out panels", text: "For picture-frame or raised panels, get an even panel width for each wall." },
        ],
      }}
      uses={{
        heading: "10 situations where a wainscoting calculator helps",
        items: [
          { title: "Beadboard in a bathroom", body: "See how many 4 × 8 sheets a 32 or 36 in wainscot needs when each sheet is cut into strips." },
          { title: "Dining room picture-frame molding", body: "Get an equal box width on each wall from the number of boxes and the stile width." },
          { title: "Choosing a height", body: "At 32 in a 96 in sheet gives three strips; at 36 in only two — see what that does to sheet count." },
          { title: "Cap rail and baseboard", body: "Linear feet and pieces for each trim line." },
          { title: "Hallways", body: "Long runs with few doors use sheets efficiently." },
          { title: "Budgeting panels vs boards", body: "Compare sheet goods against individual boards using the area." },
          { title: "Mudroom walls", body: "Taller wainscots over 48 in show when strips stop fitting two to a sheet." },
          { title: "Checking a contractor's quote", body: "Compare their sheet and trim count with yours." },
          { title: "Raised panel spacing", body: "Panels and stiles that come out exactly to the wall width." },
          { title: "Kids' rooms and playrooms", body: "Durable lower-wall paneling estimated in minutes." },
        ],
      }}
      dataSection={{
        heading: "How the quantities are worked out",
        paragraphs: [
          "This is arithmetic with no outside data. The wall run is the sum of the wall lengths minus the openings. Area is run × height.",
          "Sheets: a sheet installed with its length vertical is cut across into strips as tall as the wainscot, so one sheet yields floor(sheet length ÷ height) strips, each as wide as the sheet. The run divided by the sheet width (rounded up, with your allowance) gives the strip columns, and columns ÷ strips per sheet (rounded up) gives sheets. If the wainscot is taller than a sheet, sheets are stacked.",
          "Trim: each trim line (cap or chair rail, baseboard) is the length of the run; pieces = run × allowance ÷ stock length, rounded up. Panel layout: with n panels and stiles of width s at both ends and between, each panel is (wall − (n + 1) × s) ÷ n wide.",
          "Limits: the sheet count is for the room as a whole, so leftover strips are assumed reusable on other walls. Real panels have a usable face slightly smaller than nominal, and outlets, windows and corners change the cuts. Everything runs in your browser.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How many sheets of beadboard do I need?", answer: "For a 12 × 14 ft room with one 3 ft door and a 32 in wainscot: 49 ft of wall, 13 columns of 48 in strips, three strips per 96 in sheet, so 5 sheets before any allowance." },
        { question: "What height is wainscoting?", answer: "It's a design choice; the page uses whatever height you enter." },
        { question: "How do I calculate wainscot square footage?", answer: "Wall run (walls minus openings) × height in feet." },
        { question: "How do I space picture-frame boxes evenly?", answer: "Use the panel layout: panel width = (wall − (panels + 1) × stile) ÷ panels." },
        { question: "Does it count the chair rail?", answer: "Yes — each trim line is the run length; buy that many pieces for each line you install." },
        { question: "Can it handle a wainscot taller than the sheet?", answer: "Yes. It stacks sheets in each column and counts them that way." },
      ]}
    >
      <WainscotingTool />
    </ToolPageLayout>
  );
}
