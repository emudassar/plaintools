import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SalesTaxTool from "@/components/SalesTaxTool";
import { requireTool } from "@/config/tools";

const SLUG = "sales-tax-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Sales Tax Calculator by State and City (2026 Rates)",
  description:
    "Pick a state, enter your city's local rate and get the sales tax and total on any price — or take the tax back out of a total. All 50 states and DC, 2026 rates.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function SalesTaxCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate sales tax",
        steps: [
          { name: "Pick the state", text: "The state rate fills in and the local rate starts at the state's average local rate." },
          { name: "Enter your local rate", text: "Your city and county's combined rate, from your state revenue department or a receipt." },
          { name: "Enter the price", text: "Or the total paid, if you want to take the tax out." },
          { name: "Read tax and total", text: "Plus the state's rates from the 2026 table." },
        ],
      }}
      uses={{
        heading: "10 times you need the sales tax on a price",
        items: [
          { title: "Big purchases", body: "A buyer works out the tax on a $1,200 laptop before checkout." },
          { title: "Comparing shopping across a state line", body: "A shopper near a border compares the total in two states." },
          { title: "Small business invoices", body: "A craft seller adds the right tax to an invoice." },
          { title: "Expense reports", body: "An employee splits a receipt total into price and tax." },
          { title: "Reverse sales tax", body: "A bookkeeper takes the tax back out of a tax-inclusive total." },
          { title: "Car and furniture budgets", body: "A family budgets the tax on a sofa or used car." },
          { title: "Travel spending", body: "A traveller sees why prices are higher at the register in another state." },
          { title: "Price tags", body: "A market vendor sets a tax-included price." },
          { title: "Receipts check", body: "Someone checks a receipt charged the right rate." },
          { title: "Moving to a new state", body: "A newcomer compares average combined rates between states." },
        ],
      }}
      dataSection={{
        heading: "Where the rates come from",
        paragraphs: [
          "State rates, population-weighted average local rates and the highest local rate in each state are from the Tax Foundation's 2026 midyear table (rates as of July 1, 2026). The average combined rate is the state rate plus the average local rate.",
          "No free, complete nationwide dataset of city rates exists, so the page asks for your local rate and starts it at the state's average. Your state revenue department's address lookup gives the exact combined rate for a location.",
          "Limits: whether an item is taxable at all depends on the state — groceries, prescription drugs and clothing are often treated differently — and special districts can add tax. Rates change during the year. Use this for estimates, not for filing a sales tax return.",
        ],
        sources: [
          { label: "Tax Foundation — State and Local Sales Tax Rates, Midyear 2026", href: "https://taxfoundation.org/data/all/state/2026-sales-tax-rates/" },
        ],
      }}
      faqs={[
        { question: "How do I calculate sales tax?", answer: "Multiply the price by the tax rate: $100 at 8.25% is $8.25 tax, $108.25 total." },
        { question: "How do I take sales tax out of a total?", answer: "Divide the total by 1 plus the rate: $108.25 ÷ 1.0825 = $100." },
        { question: "Which states have no sales tax?", answer: "Delaware, Montana, New Hampshire and Oregon have no statewide sales tax. Alaska has none statewide, but many local governments charge one." },
        { question: "Which state has the highest sales tax?", answer: "California has the highest state rate, 7.25%. With local taxes, Louisiana has the highest average combined rate in the 2026 table." },
        { question: "Why is my city's rate different?", answer: "Cities, counties and special districts add their own taxes on top of the state rate." },
        { question: "Is the tax on a car different?", answer: "Many states tax vehicles at the sales tax rate, some at a separate rate, and some reduce the taxed price by a trade-in. Check your state's motor vehicle rules." },
      ]}
    >
      <SalesTaxTool />
    </ToolPageLayout>
  );
}
