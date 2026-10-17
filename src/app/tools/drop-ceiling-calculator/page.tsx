import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DropCeilingTool from "@/components/DropCeilingTool";
import { requireTool } from "@/config/tools";
import { ARMSTRONG_URL } from "@/lib/drop-ceiling";

const SLUG = "drop-ceiling-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Drop Ceiling Calculator: Tiles, Main Beams, Cross Tees and Wire",
  description:
    "Enter the room size and choose 2×4 or 2×2 panels and get the panels, main beams, 4 ft and 2 ft cross tees, wall molding and hanger wires, with balanced border panels worked out the way Armstrong's guide does it.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function DropCeilingPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to plan a drop ceiling",
        steps: [
          { name: "Find the joist direction", text: "Main beams run across the joists, so you need to know which way they go." },
          { name: "Enter both room sides", text: "The side across the joists and the side along them, in feet." },
          { name: "Pick the panel size", text: "2 × 4 or 2 × 2 ft." },
          { name: "Check piece lengths", text: "Main beam and wall molding lengths from the packs you'll buy." },
          { name: "Read the list", text: "Panels, mains, tees, molding, wires and the border panel sizes." },
        ],
      }}
      uses={{
        heading: "10 situations where a drop ceiling calculator helps",
        items: [
          { title: "Finishing a basement", body: "A full materials list before the trip to the store." },
          { title: "Even border panels", body: "Borders the same size on opposite walls, worked out from Armstrong's method." },
          { title: "2 × 2 or 2 × 4", body: "See how the tee and panel counts change with panel size." },
          { title: "Replacing old tiles", body: "Count panels for an existing grid by room size." },
          { title: "Light fixtures", body: "Add four wires for each drop-in light, as the guide says." },
          { title: "Budgeting a remodel", body: "Multiply counts by pack prices for a materials budget." },
          { title: "Offices and shops", body: "Same grid rules for small commercial rooms." },
          { title: "Checking a kit", body: "Compare a ceiling kit's contents with your room." },
          { title: "Marking the first main beam", body: "The border distance tells you where the first cross tee slot must fall." },
          { title: "Planning around ducts", body: "Know the grid lines before you decide where to drop the ceiling." },
        ],
      }}
      dataSection={{
        heading: "Where the layout rules come from",
        paragraphs: [
          "The rules are from Armstrong's homeowner instructions, 'How to Install Your Suspended Ceiling': main beams run the opposite direction of the joists on 4 ft centres, cross tees go 2 ft apart, a 2 × 2 grid adds tees at the midpoint of the 4 ft cross tees, wire fasteners go 4 ft apart, and lights get an extra wire at each corner. The minimum drop is 3 in.",
          "Border panels follow Armstrong's worksheet: divide the room side by the panel dimension, add the remainder to one panel dimension, and halve it. Armstrong's sample — 2 × 4 panels in a 9 ft × 10 ft 6 in room — gives borders of 2 ft 6 in and 1 ft 3 in; this page reproduces both. As printed, the formula gives half-size borders even when a side divides exactly, which keeps opposite borders equal.",
          "Counts: grid lines across each side = (side − 2 × border) ÷ module + 1; panels = cells × cells, one panel for each border piece; 4 ft cross tees = cross-tee lines × (main beam lines + 1); main beam pieces = lines × the pieces needed to span the room. Piece lengths are yours to enter — check the packaging.",
          "Limits: the page doesn't know about ducts, pipes, beams, fire-rated assemblies or local rules, and border panels can sometimes be cut two from one panel, so the panel count may be generous. Everything runs in your browser.",
        ],
        sources: [{ label: "Armstrong — How to Install Your Suspended Ceiling", href: ARMSTRONG_URL, note: "Main beams 4 ft on centre, cross tees 2 ft, border worksheet" }],
      }}
      faqs={[
        { question: "Which way do main beams run in a drop ceiling?", answer: "Across the joists — Armstrong's guide says 'Main beams run the opposite direction of the joists', on 4 ft centres." },
        { question: "How do I calculate border tiles?", answer: "Divide the room side by the panel size, add the remainder to one panel size, and halve it. A 9 ft side with 4 ft panels gives 2 ft 6 in borders." },
        { question: "How many cross tees do I need?", answer: "One 4 ft tee in every bay between main beams on each cross-tee line; the page counts them, plus 2 ft tees for a 2 × 2 grid." },
        { question: "How many hanger wires?", answer: "About one every 4 ft along each main beam, plus one at each corner of a drop-in light." },
        { question: "How much space do I need above a drop ceiling?", answer: "Armstrong's guide gives a minimum drop of 3 in, plus 2 in more than the height of any drop-in light." },
        { question: "2 × 2 or 2 × 4 panels?", answer: "A design choice. 2 × 2 needs extra 2 ft tees; switch the panel size to compare counts." },
      ]}
    >
      <DropCeilingTool />
    </ToolPageLayout>
  );
}
