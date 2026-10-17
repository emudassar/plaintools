import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PottingSoilTool from "@/components/PottingSoilTool";
import { requireTool } from "@/config/tools";

const SLUG = "potting-soil-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Potting Soil Calculator: Quarts, Cubic Feet and Bags",
  description:
    "Enter your round or square pots, planters or raised beds and get the potting mix needed in dry quarts, cubic feet and litres, and how many bags to buy.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PottingSoilPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate potting soil",
        steps: [
          { name: "Measure each container", text: "Inside top and bottom size and height, in inches." },
          { name: "Enter how many", text: "Identical containers count once with a quantity." },
          { name: "Set the headspace", text: "How far below the rim you fill." },
          { name: "Enter the bag size", text: "In dry quarts, cubic feet or litres, from the bag." },
          { name: "Read the amount", text: "Dry quarts, cubic feet, litres and bags." },
        ],
      }}
      uses={{
        heading: "10 situations where a potting soil calculator helps",
        items: [
          { title: "Spring repotting", body: "Add up all your pots before the garden-centre trip." },
          { title: "Raised beds", body: "A 4 × 8 ft bed 12 in deep takes 32 cu ft." },
          { title: "Patio planters", body: "Rectangular planters by length, width and depth." },
          { title: "Tapered pots", body: "Sloped sides hold less than a cylinder; the page measures the taper." },
          { title: "Bags labelled in quarts", body: "Convert cubic inches to the dry quarts on the bag." },
          { title: "Comparing bag sizes", body: "Change the bag size to see which is cheaper per pot." },
          { title: "Seed-starting trays", body: "Small cells add up; enter the count." },
          { title: "Houseplant collections", body: "List several pot sizes at once." },
          { title: "Nursery 'gallon' pots", body: "Measure them — trade sizes aren't true gallons." },
          { title: "Metric bags", body: "Choose litres for bags labelled that way." },
        ],
      }}
      dataSection={{
        heading: "How the volume is worked out",
        paragraphs: [
          "Round pots with sloped sides are a truncated cone (frustum): volume = π × h ÷ 3 × (R² + R·r + r²), where R and r are the top and bottom radii. Square pots use the square frustum h ÷ 3 × (A² + A·a + a²); planters and raised beds are length × width × height. The fill stops at your headspace, and the top size is reduced to match the fill height.",
          "Bagged potting mix is sold by volume, often in dry quarts. A US dry quart is 67.200625 cubic inches (NIST Handbook 44, Appendix C) — larger than a liquid quart. A cubic foot is 1,728 in³ and a litre 61.024 in³.",
          "Limits: potting mix settles after watering and is packed loosely in bags, so you may want a little extra; nothing is added automatically. Everything runs in your browser.",
        ],
        sources: [{ label: "NIST Handbook 44", href: "https://www.nist.gov/pml/owm/publications/nist-handbooks/handbook-44", note: "US dry quart = 67.200625 in³" }],
      }}
      faqs={[
        { question: "How much potting soil for a 12 inch pot?", answer: "It depends on depth and taper; a 12 in pot 9 in across the bottom and 11 in tall, filled to 1 in below the rim, holds about 13 dry quarts." },
        { question: "How many quarts are in a cubic foot?", answer: "About 25.7 dry quarts (1,728 ÷ 67.2)." },
        { question: "How much soil for a 4 × 8 raised bed?", answer: "At 12 in deep, 32 cubic feet." },
        { question: "Is a dry quart the same as a liquid quart?", answer: "No: a US dry quart is 67.2 in³; a liquid quart is 57.75 in³." },
        { question: "How big is a 1 gallon nursery pot?", answer: "Nursery sizes are trade names and vary by maker; measure the pot." },
        { question: "Should I buy extra?", answer: "Mix settles, so a little extra is common; the page doesn't add any by itself." },
      ]}
    >
      <PottingSoilTool />
    </ToolPageLayout>
  );
}
