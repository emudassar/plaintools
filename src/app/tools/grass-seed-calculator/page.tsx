import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GrassSeedTool from "@/components/GrassSeedTool";
import { requireTool } from "@/config/tools";
import { AGR52_URL } from "@/lib/grass-seed";

const SLUG = "grass-seed-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Grass Seed Calculator: How Much Seed for a New Lawn",
  description:
    "Enter your lawn's size and grass type and get the pounds of seed to buy at University of Kentucky Extension's new-lawn seeding rates, adjusted for pure live seed from your seed tag, and the number of bags.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function GrassSeedPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate how much grass seed you need",
        steps: [
          { name: "Measure the lawn", text: "Length × width, or the total square footage." },
          { name: "Choose the grass", text: "Kentucky bluegrass, tall fescue, perennial ryegrass, a bluegrass/ryegrass mix, bermudagrass, or your bag's own rate." },
          { name: "Enter the seed tag figures", text: "Purity and germination, to convert pure live seed rates into bagged pounds." },
          { name: "Add a bag size", text: "Optional, for the number of bags." },
        ],
      }}
      uses={{
        heading: "10 situations where a grass seed calculator helps",
        items: [
          { title: "Seeding a new lawn", body: "Buy the right amount for bare soil." },
          { title: "Comparing grass types", body: "Tall fescue is seeded at three times the rate of bluegrass; see the difference in pounds." },
          { title: "Reading a seed tag", body: "Turn purity and germination into how much bagged seed gives the PLS rate." },
          { title: "Buying in bulk", body: "Bag counts for large areas." },
          { title: "Bluegrass with a little ryegrass", body: "The mix rate for quicker cover." },
          { title: "Bermudagrass from seed", body: "Rates for seeded cultivars." },
          { title: "Bare patches", body: "Measure the patch and seed just that area." },
          { title: "Contractor bids", body: "Material quantity for a lawn installation." },
          { title: "Budgeting", body: "Pounds × price per pound." },
          { title: "Using a different rate", body: "Choose 'rate from my seed bag' for blends." },
        ],
      }}
      dataSection={{
        heading: "Where the seeding rates come from",
        paragraphs: [
          "The rates are from University of Kentucky Cooperative Extension publication AGR-52, 'Selecting the Right Grass for Your Kentucky Lawn' (Gregg Munshaw and Trevor Shaddox, issued August 2019), for new lawns: Kentucky bluegrass 2 pounds of pure live seed per 1,000 ft²; turf-type tall fescue 6 pounds per 1,000 ft²; perennial ryegrass 4–6 pounds of pure live seed per 1,000 ft² when broadcast-seeded; bluegrass with about 15% perennial ryegrass by weight as about ¼ pound of ryegrass with 1½ pounds of bluegrass per 1,000 ft²; and seeded bermudagrass 1–2 pounds of pure live seed per 1,000 ft².",
          "Pure live seed (PLS) is the share of a bag that is both the right seed and able to germinate: purity × germination from the seed tag. A PLS rate is divided by that fraction to get pounds of bagged seed. Rates AGR-52 gives as plain pounds are used as they are.",
          "Limits: these are Kentucky's rates for new lawns. Overseeding an existing lawn usually uses less, and other states' extension services publish their own figures — use 'rate from my seed bag' for those or for blends. Which grass suits your yard is outside this page. Everything runs in your browser.",
        ],
        sources: [{ label: "University of Kentucky Extension — AGR-52 Selecting the Right Grass for Your Kentucky Lawn", href: AGR52_URL, note: "New-lawn seeding rates per 1,000 ft²" }],
      }}
      faqs={[
        { question: "How much grass seed do I need per 1,000 square feet?", answer: "It depends on the grass: UK Extension gives 6 lb for tall fescue, 2 lb PLS for Kentucky bluegrass and 4–6 lb PLS for perennial ryegrass for new lawns." },
        { question: "How much seed for a 5,000 sq ft lawn?", answer: "At tall fescue's 6 lb per 1,000 ft², 30 pounds." },
        { question: "What is pure live seed?", answer: "The fraction of the bag that is viable seed of the species: purity × germination. A 2 lb PLS rate at 90% purity and 80% germination is 2.8 lb of bagged seed." },
        { question: "Is overseeding the same rate?", answer: "No — these rates are for new lawns. Check your seed bag or local extension for overseeding." },
        { question: "Can I mix tall fescue with ryegrass?", answer: "AGR-52 advises against mixing tall fescue with perennial ryegrass or fine fescue because of texture and growth differences." },
        { question: "Where do I find purity and germination?", answer: "On the seed analysis tag on the bag." },
      ]}
    >
      <GrassSeedTool />
    </ToolPageLayout>
  );
}
