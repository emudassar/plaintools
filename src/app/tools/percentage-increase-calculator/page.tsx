import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PercentIncreaseTool from "@/components/PercentIncreaseTool";
import { requireTool } from "@/config/tools";

const SLUG = "percentage-increase-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Percentage Increase Calculator (and Decrease)",
  description:
    "Enter an old and new value and get the percentage increase or decrease. Also add or subtract a percentage from a number, or find the original before a change.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PercentageIncreaseCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate a percentage increase",
        steps: [
          { name: "Pick the calculation", text: "Percent change, add or subtract a percent, or original before a percent." },
          { name: "Enter the values", text: "The original and new values, or a value and a percentage." },
          { name: "Read the result", text: "The percentage, the difference and the ratio." },
        ],
      }}
      uses={{
        heading: "10 everyday percentage changes",
        items: [
          { title: "Pay raises", body: "An employee sees that $52,000 to $55,000 is a 5.77% raise." },
          { title: "Rent increases", body: "A tenant works out the percentage of a rent rise." },
          { title: "Price changes", body: "A shopper compares a product's old and new price." },
          { title: "Sales growth", body: "A shop owner sees month-on-month growth." },
          { title: "Weight change", body: "Someone tracks a percentage change in weight." },
          { title: "Stock prices", body: "An investor sees a share's percentage move." },
          { title: "Discounts", body: "A shopper subtracts 25% from a price." },
          { title: "Price before tax or markup", body: "A seller works back to the price before a 20% markup." },
          { title: "Population or survey data", body: "A student calculates percentage change between years." },
          { title: "Utility bills", body: "A household compares this winter's bill with last year's." },
        ],
      }}
      dataSection={{
        heading: "How the percentages are worked out",
        paragraphs: [
          "Percentage change = (new − original) ÷ |original| × 100. A positive result is an increase, a negative one a decrease.",
          "Adding p%: value × (1 + p ÷ 100). Subtracting p%: value × (1 − p ÷ 100). The original before a change: new ÷ (1 ± p ÷ 100) — not the new value minus the same percentage.",
          "Limits: a change from 0 has no percentage. Percentage points (5% to 7%) are different from percent change (a 40% increase).",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I calculate percentage increase?", answer: "Subtract the old value from the new, divide by the old value and multiply by 100." },
        { question: "What is the percentage increase from 80 to 100?", answer: "25%." },
        { question: "What is the percentage decrease from 100 to 80?", answer: "20%. Decreases and increases between the same numbers differ because the base differs." },
        { question: "How do I add 15% to a number?", answer: "Multiply by 1.15." },
        { question: "How do I find the original price before a 20% increase?", answer: "Divide by 1.2." },
        { question: "What is a percentage point?", answer: "The simple difference between two percentages: 5% to 7% is 2 percentage points." },
      ]}
    >
      <PercentIncreaseTool />
    </ToolPageLayout>
  );
}
