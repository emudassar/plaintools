import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CakePricingTool from "@/components/CakePricingTool";
import { requireTool } from "@/config/tools";

const SLUG = "cake-pricing-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Cake Pricing Calculator: Ingredient Cost, Labour and Profit",
  description:
    "Enter what you paid for each ingredient and how much the recipe uses, your hours, packaging and overhead, and get the cake's real cost, a price at your markup or margin, and the price per serving.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function CakePricingPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to price a cake",
        steps: [
          { name: "Cost each ingredient", text: "Package price, package size and the amount the recipe uses, in the same unit." },
          { name: "Add packaging", text: "Box, board, ribbon, toppers." },
          { name: "Count your time", text: "Baking, decorating, shopping and cleanup, at the hourly rate you want to earn." },
          { name: "Add overhead", text: "A share of power, gas, equipment and platform fees for this cake." },
          { name: "Choose markup or margin", text: "Read the price, profit and price per serving." },
        ],
      }}
      uses={{
        heading: "10 situations where a cake pricing calculator helps",
        items: [
          { title: "Pricing a custom order", body: "Build the quote from this cake's actual recipe instead of a guess." },
          { title: "Finding out you're undercharging", body: "Many home bakers leave out their own time; the labour line makes it visible." },
          { title: "Setting a menu", body: "Price each standard size once and reuse the figures." },
          { title: "Butter or flour price jumps", body: "Update one package price and see the new cost." },
          { title: "Tiered wedding cakes", body: "Add every component and the extra hours for a tiered cake." },
          { title: "Cupcakes and per-serving pricing", body: "Enter the serving count for a per-piece price." },
          { title: "Markup versus margin", body: "See both figures — 30% markup is not 30% margin." },
          { title: "Comparing a cheaper ingredient", body: "Swap one brand's price and size to see the saving per cake." },
          { title: "Market stalls", body: "Include stall fees as overhead spread over the cakes you expect to sell." },
          { title: "Explaining a quote to a customer", body: "The cost breakdown shows where the money goes." },
        ],
      }}
      dataSection={{
        heading: "How the price is worked out",
        paragraphs: [
          "This is costing arithmetic with no outside data. Each ingredient's cost in the cake is its package price ÷ package size × amount used — so weigh or count what the recipe really uses, in the same unit as the package. Add packaging, your hours × your hourly rate, and overhead to get the total cost.",
          "Markup is profit as a percentage of cost: price = cost × (1 + markup). Margin is profit as a percentage of the price: price = cost ÷ (1 − margin). The result shows both so you can compare with how others quote.",
          "Limits: the page knows nothing about what customers near you will pay, or about cottage-food rules, permits, labelling or tax where you live. The starting numbers in the form are only an example — replace them with your own receipts. Everything runs in your browser; nothing is sent or stored.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I calculate the cost of a cake?", answer: "Add the cost of each ingredient used (package price ÷ package size × amount used), packaging, your labour and overhead." },
        { question: "How much should I charge per hour?", answer: "That's your decision; enter the rate you want to earn. Leaving labour out entirely means you work for free." },
        { question: "What's the difference between markup and margin?", answer: "Markup is profit ÷ cost; margin is profit ÷ price. A 50% markup is a 33.3% margin." },
        { question: "How do I price per serving?", answer: "Enter the number of servings; the page divides the price by it." },
        { question: "What counts as overhead?", answer: "Costs that aren't ingredients or packaging: a share of electricity or gas, equipment wear, card or platform fees, stall rent." },
        { question: "Do I need to weigh ingredients?", answer: "It's more accurate. Enter the amount used in the same unit as the package — grams with grams, ounces with ounces, eggs with eggs." },
      ]}
    >
      <CakePricingTool />
    </ToolPageLayout>
  );
}
