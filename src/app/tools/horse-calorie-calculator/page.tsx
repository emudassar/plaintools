import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import HorseCalorieTool from "@/components/HorseCalorieTool";
import { requireTool } from "@/config/tools";

const SLUG = "horse-calorie-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Horse Calorie Calculator: Daily Energy Needs (Mcal DE)",
  description:
    "How many calories does a horse need? Enter body weight and workload to get daily digestible energy in Mcal and kcal from the NRC (2007) equations, and check a hay and grain ration against it.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HorseCalorieCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out a horse's daily calories",
        steps: [
          { name: "Enter body weight", text: "Use a weigh tape or scale, in pounds or kilograms." },
          { name: "Pick the activity level", text: "Maintenance for an easy, average or hard keeper, or light, moderate, heavy or very heavy work as Merck describes them." },
          { name: "Read the requirement", text: "The result is digestible energy in Mcal per day (1 Mcal = 1,000 kcal), with every level for comparison." },
          { name: "Optionally check a ration", text: "Enter pounds of hay and concentrate and their energy from a hay test or feed tag to see how they compare." },
        ],
      }}
      uses={{
        heading: "10 situations where a horse calorie estimate helps",
        items: [
          { title: "Checking whether hay alone is enough", body: "A tested hay's Mcal per pound shows whether the forage covers maintenance before buying grain the horse may not need." },
          { title: "Adjusting feed when work increases", body: "Moving from light to moderate work raises the estimate by about 17%." },
          { title: "Feeding an easy keeper", body: "Merck gives 0.03 Mcal/kg for easy keepers versus 0.04 for hard keepers — a third more for the same weight." },
          { title: "Comparing two feeds", body: "Feed tags give energy per pound; the ration check shows what a change does to the total." },
          { title: "Planning for a weight-loss horse", body: "Knowing the maintenance figure is the starting point for a vet's reduced-energy plan." },
          { title: "Working in kilograms", body: "Enter weight in kg or lb." },
          { title: "Explaining Mcal to new owners", body: "The result shows both Mcal and the more familiar kcal." },
          { title: "Preparing for a competition season", body: "See the jump in energy from moderate to heavy work." },
          { title: "Budgeting feed", body: "Energy needs drive how many pounds of feed a horse eats, which drives cost." },
          { title: "Studying for a horse judging or 4-H exam", body: "The NRC equations behind the numbers are shown." },
        ],
      }}
      dataSection={{
        heading: "Where the equations come from",
        paragraphs: [
          "The equations are from the Merck Veterinary Manual's 'Nutritional Requirements of Horses and Other Equids' (last updated February 2026), which draws on the National Research Council's Nutrient Requirements of Horses, 6th edition (2007).",
          "For maintenance Merck gives an average of 0.03 Mcal of digestible energy per kg of body weight, from 0.03 for easy keepers to 0.04 for hard keepers; its table lists maintenance as 0.033 × kg body weight, used here for 'average'. For work: light (1–3 hours a week) = (0.0333 × kg) × 1.2; moderate (3–5 hours) × 1.4; heavy (4–5 hours) × 1.6; and very heavy work (race training, elite three-day event) = (0.0363 × kg) × 1.9. The table notes these are for horses of 200–600 kg body weight; outside that range the result is flagged.",
          "The optional ration check multiplies pounds of each feed by its energy in Mcal DE per pound, which comes from a hay analysis or the feed's tag. Nothing is sent anywhere.",
          "Limits: these are estimates for an average adult horse. Growth, pregnancy, lactation, age, cold weather and individual metabolism change the requirement, and body condition over time is the real check. This is not a ration formulation; a veterinarian or equine nutritionist should set feeding for a horse with health problems.",
        ],
        sources: [
          { label: "Merck Veterinary Manual — Nutritional Requirements of Horses and Other Equids", href: "https://www.merckvetmanual.com/management-and-nutrition/nutrition-horses/nutritional-requirements-of-horses-and-other-equids", note: "Maintenance 0.03–0.04 Mcal/kg; work multipliers 1.2/1.4/1.6/1.9 (NRC 2007)" },
        ],
      }}
      faqs={[
        { question: "How many calories does a horse need per day?", answer: "For maintenance, about 0.0333 Mcal of digestible energy per kg of body weight. A 500 kg (1,100 lb) horse needs about 16.7 Mcal, or 16,650 kcal, a day." },
        { question: "What is a Mcal?", answer: "A megacalorie: 1,000 kilocalories. The 'calories' on food labels are kilocalories." },
        { question: "How much more energy does a working horse need?", answer: "Merck's table multiplies maintenance by 1.2 for light work, 1.4 for moderate, 1.6 for heavy, and uses 0.0363 × kg × 1.9 for very heavy work." },
        { question: "What counts as light, moderate or heavy work?", answer: "Merck describes light work as 1–3 hours a week, moderate as 3–5, heavy as 4–5 hours (for example ranch work, barrel racing or polo), and very heavy as race training or elite three-day eventing." },
        { question: "How do I find the calories in my hay?", answer: "A forage analysis reports digestible energy, usually in Mcal per pound or per kg. Feed tags for concentrates often list it too." },
        { question: "Does this work for foals or broodmares?", answer: "No. Growing, pregnant and lactating horses have separate requirements that this calculator does not cover." },
      ]}
    >
      <HorseCalorieTool />
    </ToolPageLayout>
  );
}
