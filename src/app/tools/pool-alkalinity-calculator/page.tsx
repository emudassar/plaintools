import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PoolAlkalinityTool from "@/components/PoolAlkalinityTool";
import { requireTool } from "@/config/tools";

const SLUG = "pool-alkalinity-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Pool Alkalinity Calculator: Baking Soda or Acid to Reach Your Target",
  description:
    "Enter pool gallons and your current and target total alkalinity and get how much baking soda, soda ash or sesquicarbonate raises it — or how much muriatic acid or dry acid lowers it — from a state health department dose table.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PoolAlkalinityCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out an alkalinity adjustment",
        steps: [
          {
            name: "Enter the pool volume",
            text: "All of the source's figures are for 10,000 gallons and scale directly with volume.",
          },
          {
            name: "Test and enter the current total alkalinity",
            text: "Use the total alkalinity (TA) reading in ppm from a test kit or pool store test.",
          },
          {
            name: "Enter your target",
            text: "Enter the TA you are aiming for. The tool works out whether that means raising or lowering, and by how many ppm.",
          },
          {
            name: "Read the amount for each product",
            text: "Raising lists sodium bicarbonate (baking soda), sodium carbonate (soda ash) and sodium sesquicarbonate. Lowering lists muriatic acid and sodium bisulfate. Each row shows the guide's printed 10, 30 and 50 ppm figures beside your amount.",
          },
          {
            name: "Respect the step limits",
            text: "The source advises raising no more than about 50 ppm at a time, and adding no more than one quart of acid per 10,000 gallons at once. The result flags when your change goes past either.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where an alkalinity dose matters",
        items: [
          {
            title: "Fixing pH that bounces around",
            body: "The source notes that when alkalinity is low, a small amount of acid or soda ash causes a large swing in pH. Bringing TA up to the target is the first step to steadier pH.",
          },
          {
            title: "Buying the right amount of baking soda",
            body: "A 40 ppm rise in 20,000 gallons is about 11 lb of baking soda. Knowing that before shopping means the right bag size, not three trips.",
          },
          {
            title: "Bringing down alkalinity that tests high",
            body: "When a test shows TA above the target, the acid amount for the measured drop is the starting point, split into the additions the guide allows.",
          },
          {
            title: "Choosing between baking soda and soda ash",
            body: "Both raise TA, but the guide says soda ash also raises pH and should be used when both need to rise. Seeing both amounts side by side makes the choice concrete.",
          },
          {
            title: "Catching the low-TA metals warning",
            body: "When TA is at or below 50 ppm, the guide says to test for metals before adding soda ash or baking soda. The tool shows that warning whenever your reading is in that range.",
          },
          {
            title: "Planning a large correction over several days",
            body: "A 100 ppm rise is past the guide's 'about 50 ppm at one time' advice. The tool says how many rounds that implies so the work can be scheduled.",
          },
          {
            title: "Dosing a spa or small pool accurately",
            body: "For a few hundred gallons the amounts are a few ounces, and grams are shown too, which suits a kitchen scale.",
          },
          {
            title: "Checking a pool store printout",
            body: "Enter the same volume and readings to see whether a printed recommendation agrees with the published per-10,000-gallon figures.",
          },
          {
            title: "Using dry acid instead of liquid",
            body: "Some owners prefer sodium bisulfate to muriatic acid. The tool gives the weight of dry acid for the same drop.",
          },
          {
            title: "Teaching a new pool owner the routine",
            body: "Every amount is shown next to the source's printed figure, so the arithmetic can be followed rather than taken on trust.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the amounts come from",
        paragraphs: [
          "All amounts come from the Indiana Department of Health's guide 'Adjusting Chemical Levels in a Swimming Pool'. Its Water Chemistry Adjustment Guide lists, for 10,000 gallons and a 10, 30 or 50 ppm change: sodium bicarbonate 1.4, 4.2 and 7.0 lb; sodium carbonate 0.9, 2.6 and 4.4 lb; sodium sesquicarbonate 1.25, 3.75 and 6.25 lb to raise total alkalinity; and 31.4% muriatic acid 26 fl oz, 2.4 quarts and 1 gallon, or sodium bisulfate 2.1, 6.4 and 10.5 lb, to lower it. The guide says the table was adapted from the National Swimming Pool Foundation's Pool & Spa Operator Handbook.",
          "The page scales the 10 ppm figure using the guide's own formula: amount × (gallons ÷ 10,000) × (ppm change ÷ 10). That reproduces the printed 30 and 50 ppm figures to within the rounding the guide itself notes — for example 4.5 lb of soda ash for 50 ppm against the printed 4.4 lb. The printed figures are shown beside every result.",
          "Everything runs in your browser; nothing is sent or stored.",
          "The limits: the amounts assume the product strengths in the source table and an accurate test reading. The guide says chemical amounts are rounded and that the manufacturer's label must always be followed. Raising or lowering alkalinity also moves pH, which this page does not calculate — the guide says pH dosing uses an acid or base demand test.",
          "This page does not choose a target range or diagnose water problems, and it does not replace a professional water test or a health department's rules for public pools.",
        ],
        sources: [
          {
            label: "Indiana Department of Health — Adjusting Chemical Levels in a Swimming Pool (PDF)",
            href: "https://www.in.gov/health/eph/files/Chemical_adjustment_pool.pdf",
            note: "Increase and Decrease Total Alkalinity rows, the 50 ppm and one-quart limits, the metals warning",
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
          question: "How much baking soda raises alkalinity by 10 ppm?",
          answer:
            "1.4 lb per 10,000 gallons, according to the Indiana Department of Health guide. For 20,000 gallons that is 2.8 lb; for 5,000 gallons, 0.7 lb.",
        },
        {
          question: "Is baking soda the same as soda ash?",
          answer:
            "No. The guide notes that sodium carbonate (soda ash) is not the same as sodium bicarbonate (baking soda). The guide suggests soda ash when both pH and TA need to rise, followed by baking soda for further TA adjustment.",
        },
        {
          question: "How do I lower total alkalinity?",
          answer:
            "With acid — muriatic acid or sodium bisulfate. The guide's figure is 26 fl oz of 31.4% muriatic acid, or 2.1 lb of sodium bisulfate, per 10 ppm per 10,000 gallons, with no more than one quart of acid per 10,000 gallons added at one time.",
        },
        {
          question: "Why does it say to split a big increase?",
          answer:
            "The source says not to raise total alkalinity more than about 50 ppm at one time. When your target is further away than that, the tool shows how many rounds that advice implies.",
        },
        {
          question: "Why is there a warning about metals?",
          answer:
            "The guide says that if TA is at or below 50 ppm, you should test for metals in solution before adding soda ash or baking soda. The page repeats that whenever your current reading is in that range.",
        },
        {
          question: "What should my alkalinity be?",
          answer:
            "This page does not set a range. Your pool professional, product labels or health department give one; enter the target you are aiming for.",
        },
        {
          question: "Will this change my pH too?",
          answer:
            "Usually, yes. The guide notes that sodium bicarbonate also raises pH slightly, and it uses soda ash when pH needs to rise as well. This page calculates alkalinity only; check pH after the water has circulated.",
        },
      ]}
    >
      <PoolAlkalinityTool />
    </ToolPageLayout>
  );
}
