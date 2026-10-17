import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GrainBinTool from "@/components/GrainBinTool";
import { requireTool } from "@/config/tools";
import { IOWA_GRAIN_URL } from "@/lib/grain-bin";

const SLUG = "grain-bin-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Grain Bin Calculator: Bushels in a Round Bin",
  description:
    "Enter the bin diameter and grain depth, with a peaked top or drawn-down cone, and get standard bushels using the Iowa Department of Agriculture's grain measuring method, plus an optional weight.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function GrainBinPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to estimate bushels in a grain bin",
        steps: [
          { name: "Measure the diameter", text: "Inside diameter of the round bin, in feet." },
          { name: "Measure depth at the side wall", text: "From the floor to the grain surface at the wall." },
          { name: "Describe the top", text: "Level, peaked, or drawn down into a cone; enter the height or depth, or leave it blank for Iowa's rule of thumb." },
          { name: "Read the bushels", text: "Standard bushels, bushels per foot and cubic feet." },
        ],
      }}
      uses={{
        heading: "10 situations where a grain bin calculator helps",
        items: [
          { title: "Inventory for a marketing plan", body: "Know how many bushels you have before pricing sales." },
          { title: "Crop insurance and loan paperwork", body: "Measured bushels for program documentation." },
          { title: "Planning harvest space", body: "Bushels per foot shows how much a bin holds per foot of fill." },
          { title: "After unloading part of a bin", body: "The drawn-down cone option subtracts the hollow." },
          { title: "Peaked bins", body: "Add the cone on top, measured or by rule of thumb." },
          { title: "Comparing bins", body: "Try different diameters to see capacity per foot." },
          { title: "Estimating truckloads", body: "With a test weight, get tons to plan hauling." },
          { title: "Landlord or partner splits", body: "A common, documented method for dividing stored grain." },
          { title: "Checking a bin's rated capacity", body: "Compare the manufacturer's figure with the measured volume." },
          { title: "Teaching farm math", body: "Every step of the official method is shown." },
        ],
      }}
      dataSection={{
        heading: "Where the method comes from",
        paragraphs: [
          "The method is the Iowa Department of Agriculture and Land Stewardship Grain Warehouse Bureau's 'Guidelines on measuring grain': diameter × diameter × depth × 0.7854 gives cubic feet, and × 0.80385 gives standard bushels. Bushels per foot of depth = diameter² × 0.7854 × 0.80385.",
          "A peak adds 'the height of the peak above the base divided by 3 and multiplied times the bushels per foot' — the volume of a cone. If the peak height isn't known, Iowa's rule of thumb is 0.4 × the bin's radius for corn and 0.5 × the radius for soybeans. For grain drawn down into a cone-shaped hollow, the same one-third rule is subtracted from the depth measured at the wall.",
          "Limits: standard bushels are a volume measure. Iowa notes that corn over 54 lb per bushel and soybeans over 56 lb per bushel yield more bushels than standard, and that pack charts — available through County Extension — are needed for higher accuracy, because grain packs down in tall bins. Weight here is bushels × the test weight you enter. Everything runs in your browser.",
        ],
        sources: [{ label: "Iowa Department of Agriculture and Land Stewardship — Guidelines on measuring grain", href: IOWA_GRAIN_URL, note: "0.7854 × 0.80385, peak ÷ 3, corn/soybean rules of thumb" }],
      }}
      faqs={[
        { question: "How many bushels are in a 30 ft bin per foot?", answer: "30 × 30 × 0.7854 × 0.80385 = 568 bushels per foot of depth." },
        { question: "How do I calculate bushels in a round bin?", answer: "Diameter² × depth × 0.7854 × 0.80385. Add one-third of the peak height times bushels per foot for a peaked bin." },
        { question: "How do I estimate the peak if I can't measure it?", answer: "Iowa's rule of thumb: 0.4 × the radius for corn, 0.5 × the radius for soybeans." },
        { question: "What's a standard bushel?", answer: "A volume unit; 0.80385 standard bushels per cubic foot in Iowa's method." },
        { question: "Why does my bin hold more than this says?", answer: "Grain packs down in tall bins. Pack factors from Extension tables adjust for that." },
        { question: "Can I get the weight?", answer: "Enter the test weight in pounds per bushel; the page multiplies it out." },
      ]}
    >
      <GrainBinTool />
    </ToolPageLayout>
  );
}
