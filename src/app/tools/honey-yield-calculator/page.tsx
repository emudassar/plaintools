import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import HoneyYieldTool from "@/components/HoneyYieldTool";
import { requireTool } from "@/config/tools";

const SLUG = "honey-yield-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Honey Yield Calculator: Pounds, Gallons and Jars from Your Harvest",
  description:
    "Weigh your supers before and after extraction to get the honey harvested in pounds, kilograms, gallons and full jars, plus the yield per hive against USDA's 2025 U.S. average.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HoneyYieldCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out your honey yield",
        steps: [
          { name: "Weigh the full supers", text: "Weigh the supers you are harvesting, frames and all, before extraction." },
          { name: "Weigh them again after extraction", text: "Weigh the same boxes, frames and comb once the honey is spun out. The difference is the honey you took." },
          { name: "Allow for losses", text: "Enter a percentage for what stays in the strainer, buckets and extractor." },
          { name: "Read the yield", text: "The result is pounds, kilograms, gallons, full jars, and pounds per hive if you entered the number of hives." },
        ],
      }}
      uses={{
        heading: "10 situations where a honey yield calculation helps",
        items: [
          { title: "Ordering jars before bottling", body: "Knowing it's 64 one-pound jars, not 'about 70 lb', avoids running out of jars with honey still in the bucket." },
          { title: "Recording each hive's harvest", body: "Yield per hive over the years shows which colonies and sites produce." },
          { title: "Comparing with the national average", body: "USDA's 2025 U.S. average was 48.0 lb per honey-producing colony." },
          { title: "Pricing honey for sale", body: "Pounds and jar counts are the starting point for a price list." },
          { title: "Working in kilograms", body: "Weigh in kilograms and get both units." },
          { title: "Filling buckets", body: "Gallons tell you how many 5-gallon buckets the harvest fills." },
          { title: "Recipes and mead", body: "Cups and gallons are the units recipes use." },
          { title: "Club and association records", body: "Members can report harvests in the same units." },
          { title: "Seeing what straining costs", body: "Changing the loss percentage shows how much is left in the equipment." },
          { title: "Planning next year's supers", body: "Compare this year's yield with the boxes you put on." },
        ],
      }}
      dataSection={{
        heading: "Where the numbers come from",
        paragraphs: [
          "The honey harvested is measured directly: the weight of the supers before extraction minus the weight of the same supers afterwards. Weighing the same boxes twice cancels out the wood, frames and comb, so no figure for 'honey per frame' is needed.",
          "To turn weight into volume the page uses the National Honey Board's figures: a gallon of honey weighs approximately 12 pounds, and a cup of honey weighs 12 ounces. Jar counts use the net weight on the jar and are rounded down to full jars.",
          "For context, the per-hive figure is shown next to USDA NASS's 2025 U.S. average of 48.0 pounds per honey-producing colony, from the Honey report released March 13, 2026. NASS notes colonies that produced honey in more than one state were counted in each, so its U.S. yield per colony may be understated.",
          "Limits: honey's weight per gallon depends on its moisture content, so the gallon figure is approximate. The page does not say how much honey to leave the colony for winter.",
        ],
        sources: [
          { label: "National Honey Board — FAQ", href: "https://honey.com/faq", note: "A gallon of honey weighs approximately 12 pounds; a cup weighs 12 ounces" },
          { label: "USDA NASS — Honey (March 2026)", href: "https://esmis.nal.usda.gov/sites/default/release-files/795818/hony0326.pdf", note: "2025 yield per colony, 48.0 lb" },
        ],
      }}
      faqs={[
        { question: "How do I calculate how much honey I harvested?", answer: "Weigh the supers before extraction and the same supers afterwards. The difference is the extracted honey." },
        { question: "How much does a gallon of honey weigh?", answer: "About 12 pounds, according to the National Honey Board." },
        { question: "How much honey does a hive produce?", answer: "It varies widely. USDA NASS put the 2025 U.S. average at 48.0 pounds per honey-producing colony, with state averages from 27 to 89 pounds." },
        { question: "How many jars will my honey fill?", answer: "Divide the honey's weight in ounces by the jar's net weight. 60 pounds is 960 ounces, or 60 one-pound jars." },
        { question: "How many cups are in a pound of honey?", answer: "A cup of honey weighs 12 ounces, so a pound is about 1.33 cups." },
        { question: "Does this tell me how much honey to leave for winter?", answer: "No. That depends on climate and colony, and is outside this calculator." },
      ]}
    >
      <HoneyYieldTool />
    </ToolPageLayout>
  );
}
