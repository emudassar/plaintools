import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CommissionTool from "@/components/CommissionTool";
import { requireTool } from "@/config/tools";

const SLUG = "real-estate-commission-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Real Estate Commission Calculator: Splits and Seller Net",
  description:
    "Enter the sale price and the commission rate or flat fee and get the total commission, the listing and buyer sides, the agent's share after the brokerage split, and the seller's net.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function CommissionPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate a real estate commission",
        steps: [
          { name: "Enter the sale price", text: "The contract price of the home." },
          { name: "Enter the rate or fee", text: "The total percentage or flat fee from your agreement." },
          { name: "Enter the splits", text: "How the commission divides between listing and buyer sides, and the agent's split with the brokerage." },
          { name: "Add costs and payoff", text: "Optional, to estimate what the seller takes home." },
        ],
      }}
      uses={{
        heading: "10 situations where a commission calculator helps",
        items: [
          { title: "Comparing listing offers", body: "Put two agents' proposed rates side by side in dollars." },
          { title: "Flat fee or percentage", body: "Switch modes to see which costs less at your expected price." },
          { title: "Seller net sheet", body: "Subtract commission, closing costs and payoff for a rough take-home figure." },
          { title: "Seller paying only the listing side", body: "Set the listing share to 100% to see that arrangement." },
          { title: "Agents checking a paycheck", body: "Apply the brokerage split to see the agent's share of a side." },
          { title: "Negotiating a price reduction", body: "See how much commission changes with the price." },
          { title: "Buyer agent compensation", body: "See the buyer side in dollars when it's a percentage of the price." },
          { title: "For-sale-by-owner planning", body: "Price out paying only a buyer's agent." },
          { title: "New agents", body: "Learn how a headline rate becomes take-home after splits." },
          { title: "Investors", body: "Include commission in the cost of selling a rental." },
        ],
      }}
      dataSection={{
        heading: "How the numbers are worked out",
        paragraphs: [
          "This is arithmetic only. Total commission is the sale price × the rate (or the flat fee). The listing side receives its percentage share and the buyer side the rest; the listing agent's share is that side × the agent's split, and the brokerage keeps the remainder. Seller net is the price minus commission, other closing costs and mortgage payoff.",
          "No default rate is built in, because there is no standard one: commissions are whatever the written agreements say. Enter the figures from your own listing or buyer representation agreement.",
          "Limits: the seller net is a rough figure. A real settlement statement also has taxes, prorations, title and escrow fees, credits and adjustments that this page does not know about. Rounding on the real statement can differ by a few cents.",
          "Everything runs in your browser; nothing is sent or stored.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do you calculate real estate commission?", answer: "Multiply the sale price by the rate. $400,000 at 5% is $20,000; split 50/50, each side gets $10,000 before the agents' brokerage splits." },
        { question: "What is the standard commission rate?", answer: "There isn't one. The rate is set in the agreement between the client and the brokerage, so this page uses whatever you enter." },
        { question: "Who pays the buyer's agent?", answer: "Whoever the agreements say. Set the listing share to 100% if the seller pays only the listing side." },
        { question: "How much does the agent actually keep?", answer: "Their side's commission × their split with the brokerage. At 70% of a $10,000 side, $7,000 before any fees or taxes." },
        { question: "Is commission charged on the price before or after concessions?", answer: "That depends on your agreement's wording. Enter the price your agreement bases the commission on." },
        { question: "Is the seller net exact?", answer: "No. It leaves out taxes, prorations and other settlement items; use your settlement statement for the final number." },
      ]}
    >
      <CommissionTool />
    </ToolPageLayout>
  );
}
