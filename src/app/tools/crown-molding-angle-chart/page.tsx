import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CrownMoldingTool from "@/components/CrownMoldingTool";
import { requireTool } from "@/config/tools";

const SLUG = "crown-molding-angle-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Crown Molding Angle Chart: Miter and Bevel for Any Corner",
  description:
    "Enter the corner angle and the crown's spring angle (38° or 45°) and get the miter and bevel settings for cutting crown molding flat on a compound miter saw — with a full chart from 60° to 170° corners.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function CrownMoldingAngleChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find crown molding miter and bevel angles",
        steps: [
          { name: "Measure the corner", text: "The angle between the two walls — 90° for a square corner. An angle finder or protractor gives odd corners." },
          { name: "Find the spring angle", text: "The angle the molding sits off the wall; most crown is sold as 38° (52/38) or 45° (45/45)." },
          { name: "Read the saw settings", text: "The miter and bevel for cutting the molding lying flat on a compound miter saw." },
          { name: "Bay windows and polygons", text: "Enter the number of sides of a regular shape to get its corner angle." },
          { name: "Test on scrap", text: "Real corners and moldings vary; a test cut confirms the fit." },
        ],
      }}
      uses={{
        heading: "10 situations where a crown molding angle chart helps",
        items: [
          { title: "Out-of-square corners", body: "A 92° corner needs different settings from a 90° one; type the measured angle." },
          { title: "Bay windows", body: "A three-sided bay has 135° corners; the chart lists them." },
          { title: "Octagonal rooms and turrets", body: "Enter 8 sides for a regular octagon's 135° corners." },
          { title: "Cutting flat instead of nested", body: "Cutting crown flat needs a miter and a bevel; the page gives both." },
          { title: "45° crown profiles", body: "Not all crown is 38°; 45/45 crown needs different settings." },
          { title: "Cabinet crown", body: "Small cabinet crown uses the same geometry at the cabinet's corners." },
          { title: "Vaulted-ceiling transitions", body: "Wide-angle corners like 150° or 160° are in the chart." },
          { title: "Checking a saw's detents", body: "Many compound saws carry 31.6° and 33.9° detents for 38° crown at 90°; the chart shows where those come from." },
          { title: "Uncommon spring angles", body: "Type any spring angle for moldings that are not 38° or 45°." },
          { title: "Printing a shop chart", body: "The full table covers common corners for both standard spring angles." },
        ],
      }}
      dataSection={{
        heading: "How the angles are worked out",
        paragraphs: [
          "The settings come from the compound-miter formulas for crown molding given in the Wikipedia article 'Crown molding': miter = arctan(sin(spring angle) ÷ tan(wall angle ÷ 2)) and bevel = arcsin(cos(spring angle) × cos(wall angle ÷ 2)), where the wall angle is the angle between the two walls and the spring angle is the molding's angle off the wall.",
          "Checked by hand: a 38° spring at a 90° corner gives a 31.6° miter and 33.9° bevel — the settings many compound miter saws mark with detents — and a 45° spring at 90° gives 35.3° and 30.0°. A straight wall (180°) gives 0° and 0°, as it should. For a regular polygon, the corner angle is 180° × (sides − 2) ÷ sides.",
          "Everything runs in your browser; nothing is sent or stored.",
          "Limits: the angles are exact geometry for the angles entered. Real corners are rarely exact, drywall and plaster are not flat, and a molding's real spring angle can differ from its label, so cuts may need adjusting. The page does not say which direction to tilt or swing a particular saw, which depends on the corner, the piece and the saw. Coped joints and the nested (upside-down) method are not covered.",
        ],
        sources: [
          { label: "Wikipedia — Crown molding", href: "https://en.wikipedia.org/wiki/Crown_molding", note: "Miter and bevel formulas from spring angle and wall angle" },
        ],
      }}
      faqs={[
        { question: "What angle do I cut crown molding for a 90° corner?", answer: "For 38° (52/38) crown cut flat: miter 31.6°, bevel 33.9°. For 45° crown: miter 35.3°, bevel 30.0°." },
        { question: "What is the spring angle?", answer: "The angle the back of the molding makes with the wall when installed. Most crown is sold as 38° or 45°; if unsure, hold it in place and measure." },
        { question: "Are inside and outside corners different angles?", answer: "The numbers are the same; what changes is which side of the blade the piece sits and which way the saw swings and tilts." },
        { question: "What about a 135° corner?", answer: "For 38° crown: miter 14.3°, bevel 17.6°. For 45° crown: miter 16.3°, bevel 15.7°." },
        { question: "Why don't my cuts close up?", answer: "Corners are often not exactly the angle assumed, and moldings vary. Measure the corner with an angle finder and test-cut scrap." },
        { question: "Does this work for cutting crown nested upside down?", answer: "No. Nested cutting uses only a miter. These settings are for cutting the molding flat on a compound miter saw." },
      ]}
    >
      <CrownMoldingTool />
    </ToolPageLayout>
  );
}
