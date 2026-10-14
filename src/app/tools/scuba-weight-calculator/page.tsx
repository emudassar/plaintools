import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ScubaWeightTool from "@/components/ScubaWeightTool";
import { requireTool } from "@/config/tools";

const SLUG = "scuba-weight-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Scuba Weight Calculator: How Much Dive Weight to Start With",
  description:
    "Enter your body weight, suit, water and tank and get a starting dive weight from PADI's and DAN's percentage guidelines, with the tank offset and Scuba Diving magazine's fresh-water and steel-tank adjustments.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ScubaWeightCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to estimate your dive weight",
        steps: [
          { name: "Enter your body weight", text: "In pounds or kilograms." },
          { name: "Pick your suit", text: "3 mm wetsuit, 5–7 mm full wetsuit or dry suit — PADI gives 5%, 10% and 15% of body weight." },
          { name: "Pick water and tank", text: "Fresh water and a steel tank each reduce the weight; the breakdown shows by how much." },
          { name: "Do a buoyancy check", text: "Use the number as a starting point and adjust it in the water." },
        ],
      }}
      uses={{
        heading: "10 situations where a dive weight estimate helps",
        items: [
          { title: "Your first dive after certification", body: "Rental shops ask how much weight you want; a starting figure beats a guess." },
          { title: "Switching from a 3 mm to a 7 mm suit", body: "PADI's guideline doubles the starting weight for the thicker suit." },
          { title: "Diving a lake after ocean dives", body: "Fresh water needs less lead; the 2.5% rule shows how much less." },
          { title: "Trying a dry suit", body: "PADI suggests starting at 15% of body weight or more." },
          { title: "Changing from aluminum to steel tanks", body: "A high-pressure steel 80 can let you drop up to 6 lb, per Scuba Diving magazine." },
          { title: "Packing weights for a shore dive", body: "Bring roughly the right amount instead of the whole bin." },
          { title: "Avoiding over-weighting", body: "Too much lead makes buoyancy harder to control and uses more air." },
          { title: "Diving after a big change in body weight", body: "Re-estimate before the next trip." },
          { title: "Helping a new buddy", body: "Show them how the starting figure is built up, step by step." },
          { title: "Logging your setup", body: "Note suit, tank and water with the weight that worked, so next time starts closer." },
        ],
      }}
      dataSection={{
        heading: "Where the estimate comes from",
        paragraphs: [
          "The starting point is PADI's guideline for the most common setup, an aluminum 80 in salt water: 10% of body weight with a full 5–7 mm wetsuit, 5% with a 3 mm wetsuit, and 15% or more with a dry suit, then 'add two kilograms (four to five pounds) to offset the buoyancy of the tank at the end of the dive.' DAN's Alert Diver gives the same 10% (6 mm) and 5% (3 mm) baselines and calls them 'simply starting points'.",
          "Two adjustments come from Scuba Diving magazine's buoyancy calculator article. Going from salt to fresh water, multiply the whole package — diver, equipment and weights — by 0.025 and take that off; its example gear is an aluminum 80 at 32 lb, a 7 mm wetsuit at about 8 lb and regulator, mask and fins at about 15 lb, which is the default here. And a diver who switches from an aluminum 80 to a high-pressure steel 80 'could theoretically take six pounds off' — this page applies that full 6 lb when you choose the steel tank.",
          "Each step is listed on the result so you can see what drives the number. Nothing is stored or sent anywhere; the arithmetic runs in your browser.",
          "Limits: percentage rules ignore body composition, the inherent buoyancy of your BC and suit, and how you breathe — all of which can move the right number by several pounds. The estimate is for recreational single-tank diving. It is not a substitute for an in-water buoyancy check or for an instructor's guidance, and nothing here is advice on how much weight you should dive with.",
        ],
        sources: [
          { label: "PADI — Why Proper Weighting is Important When Scuba Diving", href: "https://blog.padi.com/diving-overweighted/", note: "5% / 10% / 15% and the 2 kg tank offset" },
          { label: "DAN Alert Diver — Weight Up!", href: "https://dan.org/alert-diver/article/weight-up/", note: "10% (6 mm) and 5% (3 mm) baselines" },
          { label: "Scuba Diving — Buoyancy Calculator", href: "https://www.scubadiving.com/buoyancy-calculator-how-figure-out-how-much-weight-you-need-scuba-diving", note: "Fresh/salt 2.5% rule, gear weights, steel tank saving" },
        ],
      }}
      faqs={[
        { question: "How much weight do I need for scuba diving?", answer: "PADI's starting point with an aluminum 80 in salt water is 10% of your body weight in a 5–7 mm wetsuit (5% in a 3 mm suit, 15% or more in a dry suit), plus 2 kg (4–5 lb). A 170 lb diver in a 7 mm suit starts at about 21 lb." },
        { question: "How much less weight do I need in fresh water?", answer: "Scuba Diving magazine: about 2.5% of the total of you, your gear and your weights. For 250 lb in total that is about 6 lb less." },
        { question: "Why add weight for the tank?", answer: "An aluminum 80 gets lighter as you breathe the air out and ends the dive buoyant. PADI adds 2 kg (4–5 lb) so you can still hold a safety stop with a near-empty tank." },
        { question: "Do I need less weight with a steel tank?", answer: "Usually. Steel tanks stay negatively buoyant; Scuba Diving magazine says a diver moving from an aluminum 80 to a high-pressure steel 80 could theoretically drop 6 lb." },
        { question: "How do I check my weighting?", answer: "PADI: at the surface, float at eye level holding a full breath; when you exhale you should sink slowly. At the end of a dive, hand weights to your buddy and see if you can still descend — no deeper than 6 m (20 ft)." },
        { question: "Is the 10% rule accurate for everyone?", answer: "No. DAN calls these percentages starting points; body composition and gear change the answer, so the in-water check decides." },
      ]}
    >
      <ScubaWeightTool />
    </ToolPageLayout>
  );
}
