import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import MuriaticAcidTool from "@/components/MuriaticAcidTool";
import { requireTool } from "@/config/tools";

const SLUG = "muriatic-acid-pool-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Muriatic Acid Pool Calculator: How Much Acid to Lower Alkalinity",
  description:
    "Enter pool gallons and your current and target total alkalinity and get how much 31.4% muriatic acid to add — plus how many separate additions the one-quart-per-10,000-gallon limit means. From a state health department guide.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function MuriaticAcidPoolCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out how much muriatic acid to add",
        steps: [
          {
            name: "Enter the pool volume",
            text: "The guide's figure is per 10,000 gallons, so the dose scales with your volume. Litres are converted to US gallons.",
          },
          {
            name: "Test and enter the current total alkalinity",
            text: "Total alkalinity (TA) is the reading this dose is based on, in ppm. A pH reading is a different measurement and is not what this calculation uses.",
          },
          {
            name: "Enter the target alkalinity",
            text: "Use the target from your pool professional or health department. The tool works out how much acid reaches the number you enter; it does not choose one.",
          },
          {
            name: "Read the total and the number of additions",
            text: "The source caps a single addition at one quart per 10,000 gallons and says to retest 12 hours later before adding more. If your total is larger, the tool shows how many rounds that implies.",
          },
          {
            name: "Retest between additions",
            text: "Each retest may show a different remaining need, so the later rounds are worked out again from the new reading rather than added blindly.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the acid figure matters",
        items: [
          {
            title: "Bringing down high alkalinity that keeps pushing pH up",
            body: "The source notes that alkalinity which is far off makes pH hard to control. Knowing the acid for a measured TA drop gives a starting dose rather than a splash from the jug.",
          },
          {
            title: "Knowing how many days a big correction will take",
            body: "A 50 ppm drop in 20,000 gallons is about 260 fl oz, but the one-quart-per-10,000-gallon limit makes that five separate additions with retests between them. That is a schedule, not a single afternoon.",
          },
          {
            title: "Avoiding an overcorrection",
            body: "Adding the whole amount at once can overshoot. The guide's own advice is to make slight adjustments and retest, and the tool shows exactly where the per-addition limit sits.",
          },
          {
            title: "Buying the right number of jugs",
            body: "Muriatic acid is sold by the gallon. Seeing the total in gallons and quarts before going to the store avoids a second trip or a spare jug in the shed.",
          },
          {
            title: "Correcting alkalinity after adding too much baking soda",
            body: "An overdose of sodium bicarbonate raises TA past the target. The acid figure for the excess is the measured way back.",
          },
          {
            title: "Converting the dose to millilitres",
            body: "Outside the US, pools are in litres and acid is measured in millilitres. The result shows both systems.",
          },
          {
            title: "Planning a pool service visit",
            body: "A technician can show a customer the reading, the target and the arithmetic behind the acid added, and why a big correction is split over visits.",
          },
          {
            title: "Checking a pool store's acid recommendation",
            body: "Enter the same volume and readings to see whether a printed recommendation and the published per-10-ppm figure agree.",
          },
          {
            title: "Understanding why pH needs a different test",
            body: "Many people search this to lower pH. The source says acid for pH is set with an acid demand test, and the page explains why a pH reading alone cannot give a dose.",
          },
          {
            title: "Training new staff on safe acid handling",
            body: "The result card quotes the source's dilution and 'always add acid to water' instructions alongside the amount.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the acid figure comes from",
        paragraphs: [
          "The dose comes from the Indiana Department of Health's guide 'Adjusting Chemical Levels in a Swimming Pool'. Its Water Chemistry Adjustment Guide lists 26 fl oz of 31.4% muriatic acid to lower total alkalinity by 10 ppm in 10,000 gallons, with 2.4 quarts for 30 ppm and 1 gallon for 50 ppm. The guide says the table was adapted from the National Swimming Pool Foundation's Pool & Spa Operator Handbook and that its amounts are rounded.",
          "The page scales the 10 ppm figure with the guide's own formula: amount × (pool gallons ÷ 10,000) × (ppm change ÷ 10). For 10,000 gallons that gives 78 fl oz for 30 ppm and 130 fl oz for 50 ppm, against the printed 2.4 quarts (76.8 fl oz) and 1 gallon (128 fl oz) — the difference is the source's rounding, and both are shown on the result. The per-addition limit and the 12-hour retest are quoted from the same guide.",
          "Everything runs in your browser. Nothing is sent or stored.",
          "The limits are deliberate. Only the 31.4% strength the table prints is supported, because converting to diluted acids needs density figures the source does not give. The page does not calculate acid for a pH change, because the source says that amount comes from an acid demand test of your water. The result also assumes your test reading is accurate.",
          "This page reports a published dose and arithmetic. It is not a substitute for the product label, a professional water test, or the safety data sheet for the acid. The source's handling rules — dilute in a bucket, always add acid to water, never mix chemicals — apply to every addition.",
        ],
        sources: [
          {
            label: "Indiana Department of Health — Adjusting Chemical Levels in a Swimming Pool (PDF)",
            href: "https://www.in.gov/health/eph/files/Chemical_adjustment_pool.pdf",
            note: "Decrease Total Alkalinity table, the one-quart limit, dilution and acid demand guidance",
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
          question: "How much muriatic acid do I add to lower alkalinity by 10 ppm?",
          answer:
            "26 fl oz of 31.4% acid per 10,000 gallons, according to the Indiana Department of Health guide. For 20,000 gallons that is 52 fl oz; for 5,000 gallons, 13 fl oz.",
        },
        {
          question: "Can this tell me how much acid to lower pH?",
          answer:
            "No. The amount of acid that moves pH depends on how strongly the water is buffered, which a pH reading alone does not show. The source says to use an acid demand test for that.",
        },
        {
          question: "Why does the tool split the dose into several additions?",
          answer:
            "The source says not to add more than one quart of acid per 10,000 gallons at one time, and to retest 12 hours later before adding more. When the total is larger than that, the tool shows how many rounds the limit implies.",
        },
        {
          question: "My acid is a different strength. Can I scale it?",
          answer:
            "The page only calculates for 31.4%, the strength in the source table. Converting to another strength needs figures the source does not give, so the page does not guess. Follow that product's label.",
        },
        {
          question: "Should I dilute the acid first?",
          answer:
            "The source says to dilute by adding one quart of muriatic acid slowly to a gallon of water — always adding acid to water, never water to acid — and to pour it in the deep end.",
        },
        {
          question: "What should total alkalinity be?",
          answer:
            "This page does not set a target. Pool professionals, product labels and health department rules give ranges; enter the number you are aiming for and the tool works out the acid.",
        },
        {
          question: "Can I use sodium bisulfate instead?",
          answer:
            "The same guide lists sodium bisulfate (dry acid) at 2.1 lb per 10 ppm per 10,000 gallons. This page calculates muriatic acid only.",
        },
      ]}
    >
      <MuriaticAcidTool />
    </ToolPageLayout>
  );
}
