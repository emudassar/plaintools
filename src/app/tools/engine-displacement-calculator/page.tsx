import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import EngineDisplacementTool from "@/components/EngineDisplacementTool";
import { requireTool } from "@/config/tools";
import { DISPLACEMENT_URL } from "@/lib/engine-displacement";

const SLUG = "engine-displacement-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Engine Displacement Calculator: Cubic Inches, CC and Liters",
  description:
    "Enter the bore, stroke and number of cylinders in inches or millimetres and get engine displacement in cubic inches, cc and litres, the bore-to-stroke ratio, and the bore needed for a target displacement.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function EngineDisplacementPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate engine displacement",
        steps: [
          { name: "Choose units", text: "Inches or millimetres." },
          { name: "Enter bore and stroke", text: "Cylinder diameter and piston travel, from a spec sheet or measurement." },
          { name: "Enter the cylinders", text: "4, 6, 8 — any whole number." },
          { name: "Read the displacement", text: "Cubic inches, cc and litres; optionally find the bore for a target size." },
        ],
      }}
      uses={{
        heading: "10 situations where an engine displacement calculator helps",
        items: [
          { title: "Planning an overbore", body: "See what a .030 or .060 overbore does to cubic inches." },
          { title: "Stroker builds", body: "Change the stroke to see the displacement of a stroker crank." },
          { title: "Checking a spec sheet", body: "Confirm a quoted displacement from bore and stroke." },
          { title: "Converting cc to cubic inches", body: "Compare a metric engine with an American one." },
          { title: "Motorcycle and small engines", body: "Single and twin cylinders in millimetres." },
          { title: "Racing class limits", body: "Check a build stays under a class's displacement cap." },
          { title: "Registration or insurance forms", body: "Some ask for cc; get it from bore and stroke." },
          { title: "Bore-to-stroke ratio", body: "See whether an engine is oversquare or undersquare." },
          { title: "Choosing pistons", body: "Find the bore needed for a target displacement." },
          { title: "Learning engine basics", body: "A worked example of swept volume." },
        ],
      }}
      dataSection={{
        heading: "The formula",
        paragraphs: [
          "Engine displacement is the volume swept by all the pistons: stroke × π × (bore ÷ 2)² × number of cylinders, as given in the Wikipedia article 'Engine displacement'. A cubic inch is exactly 16.387064 cubic centimetres (1 in = 2.54 cm), and a litre is 1,000 cc.",
          "Example: a 4.00 in bore and 3.48 in stroke V8 is 3.48 × π × 2² × 8 = 349.9 cubic inches — the familiar '350' — or 5.73 litres. An 86 × 86 mm four-cylinder is 1,998 cc.",
          "Limits: displacement says nothing about whether a block can safely be overbored, or what power a build makes. Advertised displacements are often rounded, so computed figures differ slightly. Combustion chamber volume, needed for compression ratio, isn't part of displacement. Everything runs in your browser.",
        ],
        sources: [{ label: "Wikipedia — Engine displacement", href: DISPLACEMENT_URL, note: "Displacement = stroke × π × (bore/2)² × cylinders" }],
      }}
      faqs={[
        { question: "How do I calculate engine displacement?", answer: "Multiply π × (bore ÷ 2)² × stroke for one cylinder, then by the number of cylinders." },
        { question: "How many cubic inches is a 350?", answer: "4.00 in bore × 3.48 in stroke × 8 cylinders = 349.9 cubic inches." },
        { question: "How do I convert cc to cubic inches?", answer: "Divide cc by 16.387064. 5,000 cc is 305 cubic inches." },
        { question: "What does a .030 overbore add?", answer: "Enter the bore plus 0.030 in and compare — on a 350 it goes from 349.9 to about 355 cubic inches." },
        { question: "What does oversquare mean?", answer: "The bore is larger than the stroke (ratio above 1)." },
        { question: "Does this give compression ratio?", answer: "No — that needs combustion chamber, gasket and piston volumes too." },
      ]}
    >
      <EngineDisplacementTool />
    </ToolPageLayout>
  );
}
