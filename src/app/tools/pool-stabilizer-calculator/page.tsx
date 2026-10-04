import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PoolStabilizerTool from "@/components/PoolStabilizerTool";
import { requireTool } from "@/config/tools";

const SLUG = "pool-stabilizer-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Pool Stabilizer Calculator: How Much Cyanuric Acid to Add",
  description:
    "Enter pool gallons and your current and target stabilizer (CYA) and get the ounces or pounds of cyanuric acid to add — or how much water to replace if it is too high. From a state health department dose table. Free.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PoolStabilizerCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out a stabilizer dose",
        steps: [
          {
            name: "Enter the pool volume",
            text: "The source figure is for 10,000 gallons and scales directly with volume. Litres are converted.",
          },
          {
            name: "Test and enter the current stabilizer (CYA)",
            text: "Enter the cyanuric acid reading in ppm. Enter 0 for a freshly filled pool that has never had stabilizer or stabilized chlorine.",
          },
          {
            name: "Enter the target",
            text: "Use the level from your pool professional, product label or health department. The tool does not choose one.",
          },
          {
            name: "Read the amount",
            text: "Below target, the result is the weight of cyanuric acid to add, from 13 oz per 10 ppm per 10,000 gallons. Above target, it is the share of water to replace with fresh water, because nothing can be added to lower stabilizer.",
          },
          {
            name: "Retest after it dissolves",
            text: "Re-test once the product has dissolved and the water has circulated, before adding more.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where a stabilizer figure matters",
        items: [
          {
            title: "Stabilizing a newly filled outdoor pool",
            body: "A fresh fill reads 0 ppm. Knowing the full dose for your volume — for example 39 oz to reach 30 ppm in 10,000 gallons — tells you how much to buy before opening.",
          },
          {
            title: "Topping up after a partial drain",
            body: "Draining and refilling dilutes stabilizer. The top-up for the measured shortfall avoids guessing.",
          },
          {
            title: "Working out a drain when stabilizer is too high",
            body: "The source says the only way to lower cyanuric acid is to drain and refill. The tool shows what share of the water that means — half the pool to halve the level.",
          },
          {
            title: "Planning a big drain before it happens",
            body: "Seeing that a correction means replacing thousands of gallons helps decide timing, water cost and whether it is worth a professional retest first.",
          },
          {
            title: "Avoiding an overdose that cannot be undone by chemicals",
            body: "Because high stabilizer can only be diluted, adding the measured amount rather than a whole bag matters more than with most pool chemicals.",
          },
          {
            title: "Dosing a small pool or spa",
            body: "For a few hundred gallons the amount is a few ounces; grams are shown too, for a kitchen scale.",
          },
          {
            title: "Checking a pool store printout",
            body: "Enter the same volume and readings to see whether a printed recommendation and the published figure agree.",
          },
          {
            title:
              "Understanding why a retest reads higher than expected after draining",
            body: "The source notes that cyanuric acid residue remains in plaster, filters and pipes. The tool repeats that on drain results so a higher-than-calculated retest is not a surprise.",
          },
          {
            title: "Following the order of adjustments",
            body: "The guide gives an order for adjusting chemicals — chlorine, alkalinity, pH, then cyanuric acid for outdoor pools. The result quotes it.",
          },
          {
            title: "Working in litres and grams",
            body: "Outside the US, pools are measured in litres and stabilizer sold by the kilogram. The tool accepts litres and reports grams.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the stabilizer figure comes from",
        paragraphs: [
          "The dose comes from the Indiana Department of Health's guide 'Adjusting Chemical Levels in a Swimming Pool'. Its Water Chemistry Adjustment Guide lists cyanuric acid at 13 oz to raise 10,000 gallons by 10 ppm, 2.5 lb for 30 ppm and 4.1 lb for 50 ppm. The guide states the table was adapted from the National Swimming Pool Foundation's Pool & Spa Operator Handbook and that amounts are rounded.",
          "The page scales the 10 ppm figure with the guide's own formula, amount × (gallons ÷ 10,000) × (ppm change ÷ 10), which gives 2.44 lb for 30 ppm and 4.06 lb for 50 ppm — the printed figures rounded. When the reading is above target, the page uses dilution arithmetic: the share of water to replace is 1 − target ÷ current, assuming the refill water has no stabilizer. The guide's footnote says draining and refilling is the only way to lower it.",
          "Everything is calculated in your browser; nothing is sent or stored.",
          "The limits: the dose assumes granular cyanuric acid as in the source table and an accurate test reading. The guide also notes that cyanuric acid residue remains in plaster, filter media and heater scale, so after a drain the level can read higher than the dilution arithmetic predicts.",
          "This page does not choose a stabilizer target or say whether stabilizer suits your pool, and it is not a substitute for the product label or a professional water test.",
        ],
        sources: [
          {
            label:
              "Indiana Department of Health — Adjusting Chemical Levels in a Swimming Pool (PDF)",
            href: "https://www.in.gov/health/eph/files/Chemical_adjustment_pool.pdf",
            note: "Increase Stabilizer row, the drain-and-refill footnote and the order of adjustments",
          },
          {
            label: "Pool & Hot Tub Alliance",
            href: "https://www.phta.org/",
            note: "Publisher of the operator handbook the table was adapted from",
          },
        ],
      }}
      faqs={[
        {
          question: "How much stabilizer do I need for a 10,000-gallon pool?",
          answer:
            "13 oz of cyanuric acid raises 10,000 gallons by 10 ppm, according to the Indiana Department of Health guide. Raising it by 30 ppm takes about 2.5 lb, and by 50 ppm about 4.1 lb.",
        },
        {
          question: "How do I lower stabilizer?",
          answer:
            "By draining some water and refilling with fresh water — the source says that is the only way. The tool shows the share of water to replace: 1 − target ÷ current.",
        },
        {
          question: "Why is my CYA still high after draining?",
          answer:
            "The guide notes that cyanuric acid residue remains in plaster, filter elements, media and scale in heaters and pipes, which can raise the reading again after a refill.",
        },
        {
          question: "What level should stabilizer be?",
          answer:
            "This page does not set one. Pool professionals, product labels and health departments give ranges; enter your target and the tool works out the amount.",
        },
        {
          question: "Is stabilizer the same as cyanuric acid?",
          answer:
            "The source table lists the stabilizer adjustment as 'Increase Stabilizer — Cyanuric Acid', and that is the chemical this page doses. Check your product's label for its active ingredient.",
        },
        {
          question: "Do indoor pools need stabilizer?",
          answer:
            "The guide lists the cyanuric acid adjustment specifically for outdoor pools in its order of adjustments. This page calculates a dose for whatever target you enter and does not decide whether a pool needs it.",
        },
      ]}
    >
      <PoolStabilizerTool />
    </ToolPageLayout>
  );
}
