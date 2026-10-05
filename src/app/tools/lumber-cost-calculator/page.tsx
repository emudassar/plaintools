import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import LumberCostTool from "@/components/LumberCostTool";
import { requireTool } from "@/config/tools";

const SLUG = "lumber-cost-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Lumber Cost Calculator: Board Feet and Total Price",
  description:
    "Enter a cut list — pieces, nominal size, length and price per piece, linear foot, board foot or MBF — and get board feet, cost per board foot and the total with waste and tax.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function LumberCostCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out lumber cost",
        steps: [
          { name: "List each size", text: "Add one line per size and length: the number of pieces, the nominal size (or a custom thickness and width) and the length in feet." },
          { name: "Enter the price as quoted", text: "Pick how the yard quotes it — per piece, per linear foot, per board foot, or per MBF (1,000 board feet) — and type the price." },
          { name: "Add waste and tax", text: "Enter a waste allowance for offcuts and mistakes, and your sales tax rate if you want it included." },
          { name: "Read the total", text: "The result shows the total, the board feet, and the cost per board foot so quotes in different units can be compared." },
        ],
      }}
      uses={{
        heading: "10 situations where a lumber cost calculation helps",
        items: [
          { title: "Comparing a per-piece price with a per-board-foot quote", body: "One yard prices 2×6s by the piece and another by the MBF; converting both to cost per board foot shows which is cheaper." },
          { title: "Budgeting a deck before ordering", body: "Joists, beams and decking go in as separate lines, so the total reflects every size on the plan." },
          { title: "Buying hardwood by the board foot", body: "Hardwood dealers quote per board foot, and a cabinet project's cut list turns into a dollar figure before the trip." },
          { title: "Checking a contractor's materials line", body: "A homeowner can rebuild the lumber line of a quote from the cut list and today's prices." },
          { title: "Pricing a fence", body: "Posts, rails and pickets are different sizes and often priced differently; the tool totals them together." },
          { title: "Seeing what a waste allowance adds", body: "Changing waste from 5% to 15% shows how much the offcut allowance costs on a large order." },
          { title: "Converting an MBF price list", body: "Wholesale price sheets quote per thousand board feet; the tool converts that to what each piece costs." },
          { title: "Costing a shed or playhouse kit list", body: "A plan's materials list goes in line by line to see the lumber total before committing." },
          { title: "Estimating for a woodworking class", body: "An instructor can price a set of blanks per student from the board feet involved." },
          { title: "Re-pricing when lumber prices move", body: "Keep the same cut list and update the prices to see how much the job changed." },
        ],
      }}
      dataSection={{
        heading: "Where the numbers come from",
        paragraphs: [
          "The board foot is defined in NIST Handbook 130, the uniform weights-and-measures regulations adopted by U.S. states: 'A board foot is the volume of a board 1 ft long, 1 ft wide, and 1 in thick or its equivalent (144 in³ of wood).' So board feet = thickness in inches × width in inches × length in feet ÷ 12. An MBF is 1,000 board feet.",
          "The same handbook explains nominal sizes: they are customary descriptions 'always greater than the actual or minimum dressed dimensions; thus, a dry 2 × 4 is surfaced to the actual dimensions of 1 1/2 in × 3 1/2 in'. The size list in the calculator shows the dry dressed size from the handbook's Table 1 next to each nominal size. Board feet are calculated from whatever thickness and width you choose, so you can use nominal or actual figures to match how your supplier counts.",
          "Everything is arithmetic in your browser. The page holds no lumber prices — the prices are the ones you type — and nothing you enter is sent anywhere.",
          "Limits: the result is only as good as the prices and cut list entered. It does not include delivery, cutting charges or fasteners, and it does not decide which size a structure needs; spans and sizes come from the plan, the building code or an engineer.",
        ],
        sources: [
          { label: "NIST Handbook 130 (2026), Uniform Regulation for the Method of Sale of Commodities", href: "https://doi.org/10.6028/NIST.HB.130-2026", note: "§2.12.1.1 board foot; §2.10 and Table 1 softwood nominal and dressed sizes" },
        ],
      }}
      faqs={[
        { question: "How do I calculate the cost of lumber?", answer: "Work out the board feet or linear feet of each size, multiply by the price in the same unit, add the lines together, then add any waste allowance and sales tax." },
        { question: "How many board feet are in a 2×4×8?", answer: "Using nominal dimensions, 2 × 4 × 8 ÷ 12 = 5.33 board feet. Using the dry dressed size of 1 1/2 × 3 1/2, it is 3.5 board feet." },
        { question: "What is a board foot?", answer: "A volume of 144 cubic inches — a board 1 foot long, 1 foot wide and 1 inch thick, or any equivalent." },
        { question: "What does MBF mean on a lumber price?", answer: "MBF means 1,000 board feet. A price of $900 per MBF is $0.90 per board foot." },
        { question: "Should I use nominal or actual size?", answer: "It depends on how the price you were quoted is counted. Lumber is usually described by nominal size; the calculator accepts either, and shows the dry dressed size from NIST Handbook 130 next to each nominal size." },
        { question: "How much waste should I add?", answer: "There is no single published figure; it depends on the cut list and the material. The calculator lets you enter any percentage and shows what it adds." },
        { question: "Does the calculator know current lumber prices?", answer: "No. It has no price data. Enter the prices from your supplier." },
      ]}
    >
      <LumberCostTool />
    </ToolPageLayout>
  );
}
