import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import AlcoholDilutionTool from "@/components/AlcoholDilutionTool";
import { requireTool } from "@/config/tools";
import { PROOF_URL, OPENSTAX_DILUTION_URL } from "@/lib/dilution";

const SLUG = "alcohol-dilution-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Alcohol Dilution Calculator: Water to Add for Target ABV or Proof",
  description:
    "Enter the starting and target strength in ABV or proof and how much spirit you have or how much you want, and get exactly how much water to add — with the volume-shrinkage caveat explained.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function AlcoholDilutionPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to dilute alcohol to a target strength",
        steps: [
          { name: "Choose ABV or proof", text: "US proof is twice the ABV." },
          { name: "Enter the starting and target strength", text: "The target must be lower than the start." },
          { name: "Enter the amount", text: "How much strong spirit you have, or how much finished drink you want." },
          { name: "Add the water", text: "Add slowly, mix, let it rest and check with a hydrometer." },
        ],
      }}
      uses={{
        heading: "10 situations where an alcohol dilution calculator helps",
        items: [
          { title: "Cask-strength whisky to drinking strength", body: "Bring a 60% bottle down to 40% for a tasting." },
          { title: "Infusions and liqueurs", body: "Plan the water and syrup to reach a final ABV." },
          { title: "Homemade vanilla extract", body: "Dilute a high-proof spirit to the strength your recipe calls for." },
          { title: "Tinctures", body: "Work out the water for a target alcohol percentage." },
          { title: "Cleaning alcohol", body: "Dilute 99% isopropyl to a lower percentage for a recipe — same arithmetic." },
          { title: "Cocktail batching", body: "Pre-dilute a batched cocktail to the strength of a stirred drink." },
          { title: "Converting proof to ABV", body: "The page shows both scales for every figure." },
          { title: "Scaling a recipe", body: "Enter the amount you want and get how much spirit to start with." },
          { title: "Labelling a home infusion", body: "Know the approximate strength of what you made." },
          { title: "Teaching C1V1 = C2V2", body: "A practical example of the dilution equation." },
        ],
      }}
      dataSection={{
        heading: "How it's worked out — and why the result is approximate",
        paragraphs: [
          "Diluting with water keeps the amount of alcohol the same, so C₁ × V₁ = C₂ × V₂ — the dilution relation taught in OpenStax Chemistry 2e §3.3. The water to add is V₂ − V₁.",
          "US proof is defined in federal law: 26 U.S.C. §5002(a)(10) defines proof spirits as liquid containing one-half its volume of ethyl alcohol, so 100 proof = 50% ABV and proof = 2 × ABV.",
          "Why it's approximate: ethanol and water contract when mixed, so the finished volume is a little less than spirit plus water, and the strength ends up slightly above the target. Strength is also defined at a reference temperature. For an exact figure, measure with a hydrometer at the correct temperature and correct as needed.",
          "This page is for diluting spirits you already have. It says nothing about distilling, which requires federal permits in the United States. Everything runs in your browser.",
        ],
        sources: [
          { label: "26 U.S.C. §5002 — Definitions (proof spirits)", href: PROOF_URL, note: "Proof spirits = one-half ethyl alcohol by volume" },
          { label: "OpenStax Chemistry 2e — 3.3 Molarity (Dilution of Solutions)", href: OPENSTAX_DILUTION_URL, note: "C₁V₁ = C₂V₂" },
        ],
      }}
      faqs={[
        { question: "How much water do I add to bring 60% down to 40%?", answer: "For 750 ml at 60%, the finished volume is 750 × 60 ÷ 40 = 1,125 ml, so add about 375 ml of water." },
        { question: "What is proof?", answer: "In the US, twice the alcohol by volume: 80 proof = 40% ABV, per 26 U.S.C. §5002(a)(10)." },
        { question: "Why is my final volume less than expected?", answer: "Alcohol and water contract when mixed, so the total is slightly less than the two added together." },
        { question: "Can I use this for isopropyl alcohol?", answer: "The volume arithmetic is the same for any strength given as percent by volume." },
        { question: "Can I raise the strength?", answer: "No — adding water only lowers it. The page asks for a target below the starting strength." },
        { question: "Should I add water all at once?", answer: "Adding gradually and checking with a hydrometer lets you correct for the shrinkage." },
      ]}
    >
      <AlcoholDilutionTool />
    </ToolPageLayout>
  );
}
