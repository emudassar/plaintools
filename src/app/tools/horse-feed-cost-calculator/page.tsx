import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import HorseFeedCostTool from "@/components/HorseFeedCostTool";
import { requireTool } from "@/config/tools";

const SLUG = "horse-feed-cost-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Horse Feed Cost Calculator: Cost to Feed a Horse per Month and Year",
  description:
    "How much does it cost to feed a horse? Enter hay and grain amounts and your bale and bag prices to get the daily, monthly and yearly feed cost, bales and bags per month, for one horse or several.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HorseFeedCostCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out the cost of feeding a horse",
        steps: [
          { name: "Enter the hay", text: "Pounds of hay per horse per day, and the price and weight of a bale." },
          { name: "Enter the concentrate", text: "Pounds of grain, pellets or balancer per day, and the price and weight of a bag. Leave at zero if none." },
          { name: "Add other monthly costs", text: "Supplements or anything else you want included, per horse per month." },
          { name: "Read the cost", text: "Daily, monthly and yearly cost per horse, totals for all horses, and bales and bags used per month." },
        ],
      }}
      uses={{
        heading: "10 situations where a horse feed cost calculation helps",
        items: [
          { title: "Budgeting before buying a horse", body: "Feed is a recurring cost every day of the year; working it out first avoids a budget that only covered the purchase price." },
          { title: "Comparing bale sizes", body: "Small squares and large bales are priced differently; cost per pound puts them on the same footing." },
          { title: "Deciding whether grain is worth it", body: "Set concentrate to zero to see how much it adds a month." },
          { title: "Ordering hay for winter", body: "Bales per month times the months you need gives the order." },
          { title: "Checking a boarding fee", body: "Compare the board price with what the feed alone would cost." },
          { title: "Running a small barn", body: "Enter the number of horses to get the barn's monthly feed bill." },
          { title: "Comparing feed brands", body: "Swap bag price and weight to compare products." },
          { title: "Estimating hay from body weight", body: "Merck's 1.5–2% of body weight in forage dry matter gives a starting amount if you don't weigh hay." },
          { title: "Explaining costs to a new owner or a child", body: "Daily, monthly and yearly figures are easy to understand." },
          { title: "Planning when prices change", body: "Change the bale price to see the effect of a drought year." },
        ],
      }}
      dataSection={{
        heading: "How the cost is worked out",
        paragraphs: [
          "The calculation is plain arithmetic on your amounts and prices: hay cost per day = pounds per day × bale price ÷ bale weight; concentrate the same with the bag; other costs are spread over a month of 365.25 ÷ 12 days. A year is 365 days. The page holds no feed prices.",
          "If you don't know how much hay your horse eats, the optional guideline uses the Merck Veterinary Manual's statement that horses should receive at least 1.5–2% of their body weight in forage per day on a dry-matter basis. Hay contains some water, so turning dry matter into pounds of hay as fed needs the hay's dry matter percentage from a hay test.",
          "Nothing you enter leaves your browser.",
          "Limits: real use is higher than what the horse eats because of wasted hay. Pasture, board, bedding, farrier and vet costs are not included unless you add them under other costs. The guideline is a minimum for forage, not a full ration.",
        ],
        sources: [{ label: "Merck Veterinary Manual — Nutritional Requirements of Horses and Other Equids", href: "https://www.merckvetmanual.com/management-and-nutrition/nutrition-horses/nutritional-requirements-of-horses-and-other-equids", note: "At least 1.5–2% of body weight in forage per day, dry-matter basis" }],
      }}
      faqs={[
        { question: "How much does it cost to feed a horse per month?", answer: "It depends on your prices. For example, 20 lb of hay a day at $12 per 50-lb bale is $4.80 a day, or about $146 a month, before grain and supplements." },
        { question: "How much hay does a horse eat a day?", answer: "Merck says horses should get at least 1.5–2% of body weight in forage dry matter a day: 16.5–22 lb of dry matter for a 1,100-lb horse." },
        { question: "How many bales of hay does a horse need a month?", answer: "Pounds per day × 30.44 ÷ bale weight. At 20 lb a day and 50-lb bales, about 12 bales a month." },
        { question: "How much does it cost to feed a horse for a year?", answer: "Multiply the daily cost by 365. At $7 a day that is $2,555." },
        { question: "What is dry matter?", answer: "The part of a feed left after removing water. A hay test reports it as a percentage." },
        { question: "Does this include board or vet bills?", answer: "No, only feed and whatever you add under other monthly costs." },
      ]}
    >
      <HorseFeedCostTool />
    </ToolPageLayout>
  );
}
