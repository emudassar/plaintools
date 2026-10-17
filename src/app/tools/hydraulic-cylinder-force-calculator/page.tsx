import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import HydraulicCylinderTool from "@/components/HydraulicCylinderTool";
import { requireTool } from "@/config/tools";
import { OPENSTAX_PRESSURE_URL } from "@/lib/hydraulic-cylinder";

const SLUG = "hydraulic-cylinder-force-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Hydraulic Cylinder Force Calculator: Push and Pull Force",
  description:
    "Enter the bore and rod diameter and the working pressure and get a hydraulic cylinder's push and pull force in pounds, tons, kN and tonnes — or the pressure needed for a force.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HydraulicCylinderPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate hydraulic cylinder force",
        steps: [
          { name: "Enter the bore", text: "Inside diameter of the barrel (piston diameter)." },
          { name: "Enter the rod", text: "Rod diameter, for the pull (retract) force." },
          { name: "Enter the pressure", text: "Working pressure in psi or bar." },
          { name: "Read push and pull", text: "In lbf, short tons, kN and tonnes-force." },
        ],
      }}
      uses={{
        heading: "10 situations where a cylinder force calculator helps",
        items: [
          { title: "Log splitters", body: "Tons of splitting force from bore and pump pressure." },
          { title: "Choosing a cylinder", body: "Find the bore that gives the force you need at your pressure." },
          { title: "Retract vs extend", body: "Pull force is lower because the rod takes up piston area." },
          { title: "Tractor loader and 3-point work", body: "Estimate lift cylinder force." },
          { title: "Press builds", body: "Shop presses rated in tons." },
          { title: "Dump trailers", body: "Force available to lift a bed." },
          { title: "Metric cylinders", body: "Enter mm and bar; get kN and tonnes." },
          { title: "Two cylinders in parallel", body: "Multiply force by the number working together." },
          { title: "Pressure needed", body: "Work backwards from a force to the pressure." },
          { title: "Teaching hydraulics", body: "A worked example of force = pressure × area." },
        ],
      }}
      dataSection={{
        heading: "How the force is worked out",
        paragraphs: [
          "Pressure is force per unit area (OpenStax College Physics 2e §11.3), so force = pressure × area. Extending, the fluid pushes on the whole piston: area = π × bore² ÷ 4. Retracting, the rod takes up part of the piston, leaving the annulus: area = π × (bore² − rod²) ÷ 4. With psi and square inches the result is pounds-force.",
          "Conversions: 1 bar = 14.5038 psi; 1 lbf = 4.44822 N; a short ton-force is 2,000 lbf and a tonne-force 9,806.65 N.",
          "Limits: this is theoretical force. Seal friction, pressure losses and the relief valve setting reduce real output, and a cylinder, rod, pins and mountings each have their own ratings. A long rod under compression can buckle well below this force. Never exceed the cylinder's rated pressure. Everything runs in your browser.",
        ],
        sources: [{ label: "OpenStax College Physics 2e — 11.3 Pressure", href: OPENSTAX_PRESSURE_URL, note: "P = F/A" }],
      }}
      faqs={[
        { question: "How do I calculate hydraulic cylinder force?", answer: "Force (lbf) = pressure (psi) × piston area (in²). A 3 in bore at 2,500 psi pushes about 17,671 lbf (8.8 tons)." },
        { question: "Why is the pull force lower?", answer: "On retract the rod occupies part of the piston area, so less area sees pressure." },
        { question: "How many tons is my log splitter?", answer: "Bore area × pump pressure ÷ 2,000. A 4 in bore at 3,000 psi is about 18.8 tons." },
        { question: "How do I convert bar to psi?", answer: "Multiply by 14.5038." },
        { question: "What pressure do I need for a given force?", answer: "Force ÷ piston area; use the second calculator on the page." },
        { question: "Is the real force the same?", answer: "It's lower — friction and losses take some, and relief valves limit pressure." },
      ]}
    >
      <HydraulicCylinderTool />
    </ToolPageLayout>
  );
}
