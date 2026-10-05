import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import TruckCostPerMileTool from "@/components/TruckCostPerMileTool";
import { requireTool } from "@/config/tools";

const SLUG = "truck-cost-per-mile-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Truck Cost Per Mile Calculator: Fixed, Variable and Fuel",
  description:
    "Work out your truck's cost per mile and per loaded mile from your own costs, fuel and miles, split into fixed, variable and fuel — compared with ATRI's 2025 industry average of $2.336 per mile.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function TruckCostPerMileCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out cost per mile for a truck",
        steps: [
          {
            name: "Pick a period",
            text: "Use one month, quarter or year, and make sure every cost and the miles all cover that same period.",
          },
          {
            name: "Enter fixed costs",
            text: "Truck and trailer payments, insurance, permits and fees — costs you pay whether or not the truck moves.",
          },
          {
            name: "Enter variable costs and fuel",
            text: "Driver pay, repairs, tires, tolls and other running costs. Fuel can be a dollar amount, or worked out from MPG and the price per gallon.",
          },
          {
            name: "Enter miles and deadhead",
            text: "Total miles driven in the period, and the percentage driven empty. Deadhead gives the cost per loaded (paid) mile.",
          },
          {
            name: "Read the result",
            text: "Cost per mile = total cost ÷ miles. The card also shows each cost per mile and compares the total with ATRI's industry average.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where cost per mile matters",
        items: [
          {
            title: "Owner-operators checking a load offer",
            body: "A load paying less per mile than your cost per loaded mile loses money before anything else is counted.",
          },
          {
            title: "Starting a new authority",
            body: "Before the first load, estimated monthly costs and miles give a first cost-per-mile figure to plan around.",
          },
          {
            title: "Seeing the effect of deadhead",
            body: "At 15% deadhead, every paid mile carries the cost of 1.18 miles driven. The loaded-mile figure shows it.",
          },
          {
            title: "Comparing fuel prices",
            body: "Changing the price per gallon or MPG shows how much fuel moves the total per mile.",
          },
          {
            title: "Reviewing a lease-purchase",
            body: "Entering the truck payment as a fixed cost shows its share of every mile at your expected mileage.",
          },
          {
            title: "Small fleet budgeting",
            body: "A fleet manager can run each truck's month and compare cost per mile across units.",
          },
          {
            title: "Spotting rising repair costs",
            body: "Repair and maintenance per mile, tracked month to month, shows when a truck is getting expensive to run.",
          },
          {
            title: "Benchmarking against the industry",
            body: "The result is set next to ATRI's industry average, with and without fuel.",
          },
          {
            title: "Planning fewer or more miles",
            body: "Fixed costs per mile fall as miles rise. Changing the miles shows how much.",
          },
          {
            title: "Preparing for a lender or broker",
            body: "A cost-per-mile breakdown from real figures is a clear way to show what the operation costs to run.",
          },
        ],
      }}
      dataSection={{
        heading: "How the figures are worked out",
        paragraphs: [
          "Cost per mile is the total of the costs you enter for a period divided by the miles driven in that period. Fuel is either the amount you enter or miles ÷ MPG × price per gallon. Cost per loaded mile divides the same total by the miles that were not deadhead: miles × (1 − deadhead %). Fixed costs are those paid regardless of miles; variable costs rise with driving. Nothing you enter is sent anywhere.",
          "The benchmark is from the American Transportation Research Institute (ATRI), the trucking industry's not-for-profit research organisation. Its 15 July 2026 release on the 2026 Analysis of the Operational Costs of Trucking says the industry-average cost to operate a truck in 2025 was $2.336 per mile, 3.4 percent higher than the previous year, and that excluding fuel costs rose 4.2 percent to $1.854 per mile.",
          "The limits: ATRI's figure is an average across the carriers it surveyed, and its release reports differences by sector and fleet size. The calculator's answer covers only the costs entered, and it is a cost, not a freight rate — it does not include profit, taxes or the owner's own pay unless you enter them.",
        ],
        sources: [
          {
            label: "ATRI — New ATRI Report Details Accelerating Costs and Low Profitability Despite Cuts (15 July 2026)",
            href: "https://truckingresearch.org/2026/07/new-atri-report-details-accelerating-costs-and-low-profitability-despite-cuts/",
            note: "Industry-average $2.336 per mile in 2025; $1.854 excluding fuel",
          },
        ],
      }}
      faqs={[
        {
          question: "How do I calculate cost per mile for a truck?",
          answer:
            "Add up every cost for a period — payments, insurance, driver pay, fuel, repairs, tires, tolls and the rest — and divide by the miles driven in that period. $16,000 of costs over 10,000 miles is $1.60 per mile.",
        },
        {
          question: "What is the average cost per mile for trucking?",
          answer:
            "ATRI's 2026 report puts the industry-average cost to operate a truck in 2025 at $2.336 per mile, or $1.854 per mile excluding fuel.",
        },
        {
          question: "What is cost per loaded mile?",
          answer:
            "The cost spread over only the miles that earned revenue. With 15% deadhead, 10,000 miles driven is 8,500 loaded miles, so $16,000 of costs is $1.88 per loaded mile.",
        },
        {
          question: "What counts as a fixed cost?",
          answer:
            "Costs that do not change with miles in the period, such as truck and trailer payments, insurance and permits. Fuel, driver pay per mile, repairs, tires and tolls rise with driving.",
        },
        {
          question: "How do I work out fuel cost per mile?",
          answer: "Price per gallon ÷ MPG. At $3.90 a gallon and 6.5 MPG, fuel is $0.60 per mile.",
        },
        {
          question: "Is my cost per mile the rate I should charge?",
          answer:
            "It is what the truck costs to run, not a rate. A rate also has to cover deadhead, profit and anything not entered here.",
        },
      ]}
    >
      <TruckCostPerMileTool />
    </ToolPageLayout>
  );
}
