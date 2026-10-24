import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import TipTool from "@/components/TipTool";
import { requireTool } from "@/config/tools";

const SLUG = "tip-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Tip Calculator: Tip, Total and Split the Bill",
  description:
    "Enter the bill and tip percentage and get the tip, the total and each person's share, with an option to tip on the pre-tax amount and round up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function TipCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate a tip",
        steps: [
          { name: "Enter the bill", text: "The total on the receipt." },
          { name: "Choose the tip percentage", text: "Type it or tap 10–25%." },
          { name: "Split it", text: "Enter how many people are paying." },
          { name: "Optional", text: "Tip on the pre-tax subtotal, or round each share up to whole dollars." },
        ],
      }}
      uses={{
        heading: "10 times a tip calculator saves the maths",
        items: [
          { title: "Group dinners", body: "Six friends split a $186 bill with an 18% tip evenly." },
          { title: "Tipping on the subtotal", body: "A diner tips on the food before tax." },
          { title: "Delivery orders", body: "Someone works out 15% on a delivery order." },
          { title: "Rounding to cash", body: "A group rounds each share up to whole dollars to pay in cash." },
          { title: "Hair salons and spas", body: "A client works out 20% on a service." },
          { title: "Taxi and rideshare", body: "A rider checks the tip on a fare." },
          { title: "Hotel and travel", body: "A traveller works out a tip in an unfamiliar currency (the maths is the same)." },
          { title: "Comparing percentages", body: "The table shows 10% to 25% side by side." },
          { title: "Large parties", body: "A host checks an automatic gratuity against the bill." },
          { title: "Expense claims", body: "An employee records the tip separately for an expense report." },
        ],
      }}
      dataSection={{
        heading: "How the tip is calculated",
        paragraphs: [
          "Tip = amount × percentage. Total = bill + tip. Each share = total ÷ people. With rounding on, each share is rounded up to the next whole dollar and the tip absorbs the difference, so the effective tip percentage rises slightly; the page shows it.",
          "Everything runs in your browser.",
          "Limits: the percentage is yours to choose; customs differ by country and service, and some bills already include a service charge.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I calculate a 20% tip?", answer: "Multiply the bill by 0.20. On $50 that is $10." },
        { question: "Should I tip on the total or before tax?", answer: "That is your choice. Enter the pre-tax subtotal in the optional box to tip on it." },
        { question: "How do I split a bill with a tip?", answer: "Add the tip to the bill and divide by the number of people." },
        { question: "What does rounding up do?", answer: "Each person's share goes up to the next whole dollar; the extra goes to the tip." },
        { question: "What is 15% of $80?", answer: "$12." },
        { question: "Does it work in other currencies?", answer: "Yes, the arithmetic is the same; the $ sign is only a label." },
      ]}
    >
      <TipTool />
    </ToolPageLayout>
  );
}
