import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BreakEvenRoasTool from "@/components/BreakEvenRoasTool";
import { requireTool } from "@/config/tools";

const SLUG = "break-even-roas-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Break-Even ROAS Calculator (and Break-Even ACoS)",
  description:
    "Enter your selling price and per-order costs, or your profit margin, and get the break-even ROAS and ACoS, the ROAS you need for a target profit, the maximum cost per sale, and what your current ROAS earns per ad dollar.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function BreakEvenRoasPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate break-even ROAS",
        steps: [
          { name: "Work out your margin", text: "Enter price, product cost, shipping and fees, or a margin you already know." },
          { name: "Read break-even ROAS", text: "1 ÷ margin: the revenue each ad dollar must bring in to cover itself." },
          { name: "Add a profit target", text: "Optional: the profit you want left after ads." },
          { name: "Compare your actual ROAS", text: "See profit or loss per ad dollar at the ROAS you're getting." },
        ],
      }}
      uses={{
        heading: "10 situations where a break-even ROAS calculator helps",
        items: [
          { title: "Setting a target ROAS bid", body: "Know the floor below which a campaign loses money." },
          { title: "Judging a campaign report", body: "A 3× ROAS can be a loss on a thin margin; check against break-even." },
          { title: "Amazon ACoS targets", body: "Break-even ACoS equals your margin." },
          { title: "Pricing a product for ads", body: "See how raising the price lowers the ROAS you need." },
          { title: "Free shipping decisions", body: "Shipping costs eat margin and raise break-even ROAS." },
          { title: "Comparing products", body: "High-margin items can be advertised at lower ROAS." },
          { title: "Agency reporting", body: "Explain to a client why their ROAS target is what it is." },
          { title: "Maximum cost per acquisition", body: "The most you can pay for a sale and not lose money." },
          { title: "Scaling decisions", body: "Profit per ad dollar shows whether more spend helps." },
          { title: "Planning a promotion", body: "Discounts cut margin; see the new break-even." },
        ],
      }}
      dataSection={{
        heading: "How it's worked out",
        paragraphs: [
          "This is arithmetic with no outside data. ROAS (return on ad spend) is revenue ÷ ad spend. A sale breaks even on ads when the gross profit it earns equals what the ads cost to get it. With a profit margin m before ads, that happens at ROAS = 1 ÷ m. ACoS (advertising cost of sale) is the inverse of ROAS, so break-even ACoS equals the margin.",
          "For a profit target t (as a share of revenue after ads), the needed ROAS is 1 ÷ (m − t). Profit per ad dollar at an actual ROAS r is r × m − 1. When you enter price and costs, the profit per order is also the maximum cost per acquisition that breaks even.",
          "Limits: this is first-order break-even. It ignores repeat purchases and customer lifetime value (which can justify a lower ROAS), returns and refunds, and fixed overhead (which needs a higher one). What to include in 'costs' is your choice. Everything runs in your browser.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I calculate break-even ROAS?", answer: "Divide 1 by your profit margin before ads. At a 40% margin, break-even ROAS is 2.5." },
        { question: "What is a good ROAS?", answer: "Anything above your break-even ROAS is profitable on the first order; how far above you need depends on your goals and overhead." },
        { question: "What's the difference between ROAS and ACoS?", answer: "ROAS = revenue ÷ ad spend; ACoS = ad spend ÷ revenue. One is the inverse of the other." },
        { question: "What is break-even ACoS?", answer: "Your profit margin before ads. A 35% margin breaks even at 35% ACoS." },
        { question: "What costs should I include?", answer: "Everything per order that ads don't cover: product cost, shipping, packaging, payment and platform fees." },
        { question: "Why would I accept a ROAS below break-even?", answer: "If customers buy again, the lifetime value can make a first-order loss worthwhile; this page shows first-order break-even only." },
      ]}
    >
      <BreakEvenRoasTool />
    </ToolPageLayout>
  );
}
