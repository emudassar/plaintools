import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import TipPoolTool from "@/components/TipPoolTool";
import { requireTool } from "@/config/tools";

const SLUG = "tip-pool-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Tip Pool Calculator: Split Tips by Hours or Points",
  description:
    "Split pooled tips by hours worked, by hours × points, or equally. Every share is worked to the cent and adds up to the pool exactly, with each person's tips per hour.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function TipPoolCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to split a tip pool",
        steps: [
          {
            name: "Enter the total tips",
            text: "Add up the cash and card tips going into the pool for the shift or pay period.",
          },
          {
            name: "Choose how to split",
            text: "By hours gives each person a share in proportion to hours worked. Hours × points weights roles (for example 1 point for servers, 0.5 for bussers). Equal gives everyone the same.",
          },
          {
            name: "Enter each person's hours",
            text: "Add a row for each person in the pool. Points are used only in the hours × points split.",
          },
          {
            name: "Read the shares",
            text: "Each share is pool × that person's weight ÷ the total weight, in whole cents that add up to the pool exactly. Tips per hour are shown for comparison.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where a tip pool split helps",
        items: [
          {
            title: "Closing out a restaurant shift",
            body: "A shift lead can split the night's pooled tips between servers by the hours each worked.",
          },
          {
            title: "Weighting support staff",
            body: "A house that gives bussers or runners half a point per hour can enter that and see the weighted shares.",
          },
          {
            title: "Splitting a bar's tip jar",
            body: "Bartenders sharing a jar across staggered shifts can divide it fairly by hours.",
          },
          {
            title: "Coffee shop weekly tips",
            body: "Baristas pooling card tips for a week can enter each person's weekly hours.",
          },
          {
            title: "Catering and event gratuities",
            body: "A single gratuity for an event can be split among the staff who worked it.",
          },
          {
            title: "Checking a manager's math",
            body: "Staff can confirm the split they were given adds up from the same hours.",
          },
          {
            title: "Avoiding the stray cent",
            body: "Dividing by hours rarely comes out even. The tool decides where each leftover cent goes so the total matches.",
          },
          {
            title: "Comparing split methods",
            body: "Switching between hours, points and equal shows how much each method changes each person's share.",
          },
          {
            title: "Salon and spa tip sharing",
            body: "Teams that pool tips can divide them by hours or a points scheme they agree on.",
          },
          {
            title: "Delivery and valet teams",
            body: "Crews pooling tips over a shift can split them by hours on the clock.",
          },
        ],
      }}
      dataSection={{
        heading: "How the split is worked out",
        paragraphs: [
          "Each person gets the pool times their weight divided by the total weight. The weight is their hours (split by hours), their hours times their points (split by hours × points), or 1 (equal split). Shares are worked in whole cents: everyone first gets the cents their exact share contains, and any cents left over go one each to the people whose exact share was closest to the next cent. The shares therefore always add up to the pool. Nothing you type is sent anywhere.",
          "The rules about who may share in a tip pool are not part of the arithmetic, but they matter. The U.S. Department of Labor's Wage and Hour Division Fact Sheet #15 says an employer may not receive tips from a tip pool and may not allow managers and supervisors to receive tips from the pool. Where the employer takes a tip credit, a mandatory tip pool is limited to employees in occupations in which they customarily and regularly receive tips, such as waiters, bellhops, counter personnel who serve customers, bussers and service bartenders. Where the employer pays at least the full $7.25 federal minimum wage and takes no tip credit, the fact sheet says a mandatory pool may also include employees who do not customarily receive tips, such as cooks and dishwashers.",
          "The limits: this page does not decide who belongs in your pool, what points a role should get, or how tips must be paid out. State and local laws can be stricter than federal law, and the employer is responsible for following them.",
        ],
        sources: [
          {
            label: "U.S. Department of Labor — Fact Sheet #15: Tipped Employees Under the FLSA",
            href: "https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa",
            note: "Who may participate in a tip pool; managers, supervisors and employers",
          },
        ],
      }}
      faqs={[
        {
          question: "How do you split tips by hours?",
          answer:
            "Divide the pool by the total hours to get tips per hour, then multiply by each person's hours. $600 over 18 hours is $33.33 an hour, so 8 hours earns $266.67, 6 hours $200.00 and 4 hours $133.33.",
        },
        {
          question: "How does a points system work?",
          answer:
            "Each role gets a number of points, and each person's weight is hours × points. Someone on 1 point for 5 hours gets twice the share of someone on 0.5 points for 5 hours.",
        },
        {
          question: "Why doesn't it divide evenly?",
          answer:
            "Most splits produce fractions of a cent. The tool gives each leftover cent to the person whose exact share was closest to the next cent, so the shares add up to the pool exactly.",
        },
        {
          question: "Can managers take from the tip pool?",
          answer:
            "The DOL's Fact Sheet #15 says an employer may not allow managers and supervisors to receive tips from a tip pool. It says a manager or supervisor may keep only tips they receive directly from a customer for service they directly and solely provide.",
        },
        {
          question: "Can cooks and dishwashers be in the tip pool?",
          answer:
            "Under the FLSA as described in Fact Sheet #15, only if the employer pays a cash wage of at least $7.25 an hour and takes no tip credit. With a tip credit, the pool is limited to employees in customarily tipped occupations. State law may differ.",
        },
        {
          question: "Is anything I enter saved?",
          answer: "No. The names and numbers stay in your browser and disappear when you close the page.",
        },
      ]}
    >
      <TipPoolTool />
    </ToolPageLayout>
  );
}
