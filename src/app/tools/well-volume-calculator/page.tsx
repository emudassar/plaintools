import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import WellVolumeTool from "@/components/WellVolumeTool";
import { requireTool } from "@/config/tools";

const SLUG = "well-volume-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Well Volume Calculator: Gallons in a Well Casing",
  description:
    "Enter the casing diameter, total well depth and static water level and get the gallons of water standing in the well, gallons per foot, and the bleach needed for a chlorine concentration you choose.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function WellVolumePage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate the water in a well",
        steps: [
          { name: "Find the casing diameter", text: "The inside diameter, commonly 4 or 6 in on drilled wells." },
          { name: "Enter the well depth", text: "Total depth from the top of the casing, from the well log or a measurement." },
          { name: "Enter the static water level", text: "Depth from the top of the casing down to the water when the pump hasn't run." },
          { name: "Optional: a chlorine target", text: "Enter the ppm from your health department's instructions and your bleach's strength." },
        ],
      }}
      uses={{
        heading: "10 situations where a well volume calculator helps",
        items: [
          { title: "Shock chlorinating a well", body: "The bleach amount depends on how much water is in the casing." },
          { title: "Purging before a water test", body: "Sampling procedures often ask for a number of well volumes to be pumped first; know one volume in gallons." },
          { title: "Reading a well log", body: "Turn depth and static level into stored water." },
          { title: "Comparing 4 in and 6 in casings", body: "A 6 in casing holds 2.25 times as much per foot." },
          { title: "Drought checks", body: "See how much the stored column shrinks as the static level falls." },
          { title: "Planning a pump replacement", body: "Know the water you'll displace or pump out." },
          { title: "Treating a well with a product dosed per gallon", body: "Get the gallons for the label rate." },
          { title: "Metric well data", body: "Enter depths in metres; litres are shown." },
          { title: "Buying a property with a well", body: "Understand the numbers on the well report." },
          { title: "Teaching groundwater basics", body: "A worked cylinder-volume example with real units." },
        ],
      }}
      dataSection={{
        heading: "How the volume is worked out",
        paragraphs: [
          "The water standing in a well is a cylinder: the casing's cross-section times the height of the water column. Gallons per foot = π × (inside diameter ÷ 2)² × 12 ÷ 231, because a US gallon is 231 cubic inches (NIST Handbook 44). A 6 in casing holds 1.469 gallons per foot; a 4 in casing 0.653. The water column is the total depth minus the static water level.",
          "Bleach: a concentration in ppm is milligrams of chlorine per litre of water. With bleach of P % available chlorine (treated as mass per volume, as labels state it), the bleach volume for C ppm is water gallons × C ÷ (P × 10,000). The target concentration and the procedure are yours to take from your state or local health department.",
          "Limits: only the open casing column is counted — not water in the gravel pack or rock around the well, the pressure tank or the household plumbing, which a full disinfection also has to reach. Casing walls make the inside diameter slightly less than the nominal size. Everything runs in your browser.",
        ],
        sources: [{ label: "NIST Handbook 44", href: "https://www.nist.gov/pml/owm/publications/nist-handbooks/handbook-44", note: "US gallon = 231 cubic inches" }],
      }}
      faqs={[
        { question: "How many gallons per foot in a 6 inch well?", answer: "About 1.47 gallons per foot of water column." },
        { question: "How many gallons per foot in a 4 inch well?", answer: "About 0.65 gallons per foot." },
        { question: "How do I find the static water level?", answer: "From the well log, or by measuring down the casing with a well sounder or tape when the pump hasn't run for a while." },
        { question: "How much bleach to shock a well?", answer: "Enter the concentration your health department's procedure specifies and your bleach strength; the page does the arithmetic. It doesn't set a concentration." },
        { question: "Does this include the water in my pressure tank?", answer: "No — only the water standing in the casing." },
        { question: "Why does the casing size matter so much?", answer: "Volume grows with the square of the diameter, so doubling the diameter quadruples the gallons per foot." },
      ]}
    >
      <WellVolumeTool />
    </ToolPageLayout>
  );
}
