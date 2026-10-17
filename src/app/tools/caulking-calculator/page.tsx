import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CaulkTool from "@/components/CaulkTool";
import { requireTool } from "@/config/tools";
import { TREMCO_URL } from "@/lib/caulk";

const SLUG = "caulking-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Caulking Calculator: Tubes of Caulk or Sealant Needed",
  description:
    "Enter the joint length, width and depth (or a corner bead size) and get the sealant volume and how many 10.1 oz cartridges, 20 oz sausages, 300 ml tubes or gallons to buy, with a waste factor.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function CaulkingPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate how much caulk you need",
        steps: [
          { name: "Add up the joint length", text: "Total linear feet of every joint or bead." },
          { name: "Measure width and depth", text: "Depth is to the backer rod or bond breaker; for a corner bead, enter the leg size." },
          { name: "Set a waste factor", text: "Tremco suggests 20–25% for new applicators, 10–15% for average, 0–5% for very experienced." },
          { name: "Read the containers", text: "Cartridges, sausages, metric tubes and gallon pails." },
        ],
      }}
      uses={{
        heading: "10 situations where a caulking calculator helps",
        items: [
          { title: "Re-caulking a bathtub", body: "A corner bead around the tub — usually well under one cartridge." },
          { title: "Windows and doors on a house", body: "Add up every perimeter and see how many tubes to buy." },
          { title: "Siding and trim", body: "Long runs of small joints add up quickly." },
          { title: "Concrete expansion joints", body: "Wide joints with backer rod use a lot of sealant per foot." },
          { title: "Commercial curtain wall", body: "Sausages or pails for large jobs." },
          { title: "Comparing package sizes", body: "Feet per container for each size side by side." },
          { title: "Bidding a sealant job", body: "Material quantity with a stated waste factor." },
          { title: "Kitchen backsplash edge", body: "The joint between counter and backsplash." },
          { title: "Metric cartridges", body: "300 ml and 600 ml containers are included." },
          { title: "Checking a coverage chart", body: "The result matches published charts for the same joint size." },
        ],
      }}
      dataSection={{
        heading: "How the quantity is worked out",
        paragraphs: [
          "The method follows Tremco's guidance on sealant calculators: the joint is treated as 'a rectangular prism that is later tooled to an hourglass shape', with depth measured 'from the top of your joint to the top of your backer rod or bond breaker'. Volume per foot = width × depth × 12 cubic inches. A corner bead is treated as a right triangle with equal legs: width² ÷ 2 × 12.",
          "Containers are converted with US units (1 gallon = 231 cubic inches = 128 fluid ounces), so a 10.1 fl oz cartridge holds 18.2 in³ and a 20 fl oz sausage 36.1 in³. For a ¼ × ¼ in joint that is 24.3 ft per cartridge and 48.1 ft per sausage.",
          "Tremco recommends an inefficiency factor by the applicator's skill: 20–25% for new applicators, 10–15% for average applicators ('a safe estimate'), and 0–5% for highly experienced ones.",
          "Limits: the page sizes quantity, not the joint design — joint width, width-to-depth ratio, backer rod and movement capability come from the sealant's data sheet. Some sealant stays in the nozzle and container. Everything runs in your browser.",
        ],
        sources: [{ label: "Tremco — How to Use Sealant Calculators to Estimate Product Needs", href: TREMCO_URL, note: "Rectangular joint method, depth to backer rod, inefficiency factors" }],
      }}
      faqs={[
        { question: "How many feet does a tube of caulk cover?", answer: "It depends on the bead: a 10.1 oz cartridge runs about 24 ft at ¼ × ¼ in, 11 ft at 3/8 × 3/8, and 6 ft at ½ × ½." },
        { question: "How do I calculate caulk for a joint?", answer: "Width × depth × 12 gives cubic inches per foot; multiply by the length and divide by the cartridge's cubic inches." },
        { question: "How much extra should I buy?", answer: "Tremco suggests 10–15% if you don't know the applicator's experience, more for beginners." },
        { question: "How deep should a sealant joint be?", answer: "That's set by the sealant's data sheet and the joint design; the page uses whatever depth you enter." },
        { question: "What about a bead in a corner?", answer: "Choose 'corner bead' and enter the leg size; it's treated as a triangle." },
        { question: "Does it work for silicone, polyurethane and acrylic?", answer: "Yes, the volume is the same for any sealant in the same container size." },
      ]}
    >
      <CaulkTool />
    </ToolPageLayout>
  );
}
