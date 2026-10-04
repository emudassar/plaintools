import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PoolSaltTool from "@/components/PoolSaltTool";
import { requireTool } from "@/config/tools";

const SLUG = "pool-salt-calculator";
// Fails the build if the registry entry is missing.
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Pool Salt Calculator: Pounds of Salt to Add for Your Pool",
  description:
    "Enter pool gallons, your current salt reading and the target ppm and get the exact pounds (and bags) of salt to add — with the arithmetic shown and checked against Hayward's own salt table. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PoolSaltCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out how much salt your pool needs",
        steps: [
          {
            name: "Enter the pool's volume",
            text: "Use gallons or litres. The answer scales directly with volume, so a volume that is 20% too high gives 20% too much salt — a measured or builder-supplied figure beats a guess.",
          },
          {
            name: "Enter the current salt reading",
            text: "Use the ppm figure from a salt test strip, a pool store test or your generator's display. Enter 0 for a pool that has just been filled with fresh water.",
          },
          {
            name: "Enter the target level from your generator's manual",
            text: "Each salt chlorine generator states its own operating range. Hayward's AquaRite manual gives 2,700–3,400 ppm with 3,200 ppm as optimal, which is the default here; change it if your unit's manual says otherwise.",
          },
          {
            name: "Read the pounds, kilograms and bag count",
            text: "The result is the weight of salt that raises the whole body of water to the target, worked out as gallons × change in ppm × 8.34 ÷ 1,000,000, with the arithmetic printed underneath.",
          },
          {
            name: "If the reading is above target, read the drain figure instead",
            text: "Salt does not evaporate, so it can only be lowered by replacing water. The tool shows what share of the water, refilled with fresh water, brings the level back to the target.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the salt figure matters",
        items: [
          {
            title: "Starting up a salt system on a newly filled pool",
            body: "A fresh fill reads close to 0 ppm, so the first dose is the largest the pool will ever need — several hundred pounds on a typical backyard pool. Buying the right number of bags avoids a second trip and a generator that sits idle on a low-salt warning.",
          },
          {
            title: "Clearing a low-salt warning on the generator",
            body: "Many generators flag low salt and cut chlorine output. Entering the reading and the manual's target gives a measured top-up rather than a bag thrown in to see whether the light goes off.",
          },
          {
            title: "Topping up after heavy rain or a backwash",
            body: "Rain overflow and draining remove salty water and replace it with fresh water, lowering ppm. A small, calculated top-up keeps the level inside the generator's range.",
          },
          {
            title: "Avoiding an overdose that shuts the generator down",
            body: "Hayward's manual notes that a high salt level can shut the unit down and can start to taste salty. Dosing to the target, not past it, avoids a drain-and-refill to undo the mistake.",
          },
          {
            title: "Working out how much water to replace when salt is too high",
            body: "Above target there is nothing to add; the only fix is dilution. The drain share is the honest answer to how much to drop the level before refilling.",
          },
          {
            title: "Converting an existing chlorine pool to salt",
            body: "Owners switching to a salt chlorine generator need the full initial dose for their volume. Knowing it is, say, 400 lb rather than '4 bags' changes how the salt is bought and delivered.",
          },
          {
            title: "Quoting salt for a pool service customer",
            body: "A pool technician can show a customer the gallons, reading and arithmetic behind the number of bags on an invoice, instead of a figure that looks arbitrary.",
          },
          {
            title: "Dosing a salt-water spa or hot tub",
            body: "The same arithmetic works for small volumes, where an extra pound is a large overshoot. Entering the spa's gallons gives a figure small enough to measure out by weight.",
          },
          {
            title: "Checking a pool store's recommendation",
            body: "If a store's printout calls for a number of bags, the pounds here, for the same reading and volume, show whether the recommendation and the arithmetic agree.",
          },
          {
            title: "Working in litres and kilograms",
            body: "Outside the US, salt is sold by the kilogram and pools are measured in litres. The tool takes litres and reports kilograms alongside pounds.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the numbers come from",
        paragraphs: [
          "The calculation is a mass balance. Salt concentration in pools is reported in ppm — parts per million by weight — and one US gallon of water weighs about 8.34 pounds. Raising a volume of water by a given number of ppm therefore needs gallons × ppm increase × 8.34 ÷ 1,000,000 pounds of salt. In litres the same idea is simpler: one litre of water is about one kilogram, so kilograms = litres × ppm increase ÷ 1,000,000.",
          "The formula is cross-checked against Hayward's AquaRite Operation and Installation Manual, which prints a table of the pounds of salt needed to reach 3,200 ppm for pools from 8,000 to 40,000 gallons. Every cell of that table's starting-from-0-ppm row that is legible in the published PDF agrees with this formula to within one pound — 213 lb for 8,000 gallons, 267 lb for 10,000, 1,067 lb for 40,000 — and the result card shows that comparison side by side. The default 3,200 ppm target and the 2,700–3,400 ppm range are quoted from the same manual.",
          "Everything runs in your browser. Nothing you type is sent anywhere or stored.",
          "The limits come from the inputs. The answer can only be as accurate as the volume and salt reading entered, and test strips, store tests and generator displays can disagree. The calculation assumes the salt fully dissolves and mixes through the whole body of water, and the drain figure assumes the refill water contains no salt. Different generator makers publish different target ranges, so the target that matters is the one in your own unit's manual.",
          "This page reports arithmetic. It does not diagnose a generator fault, does not cover chlorine, pH, alkalinity or stabilizer, and is not a substitute for a professional water test before a large salt addition — a step Hayward's own manual advises.",
        ],
        sources: [
          {
            label: "Hayward — AquaRite Electronic Chlorine Generator manual (PDF)",
            href: "https://hayward.com/media/wysiwyg/pdf/aqua_rite_product_manual.pdf",
            note: "Salt level range, salt type, and the 'pounds of salt needed for 3200 ppm' table used as the cross-check",
          },
          {
            label: "Hayward — How much salt does the system require?",
            href: "https://www.hayward.com/knowledge-base/how-much-salt-does-the-system-require/",
            note: "Manufacturer knowledge-base page on salt requirements",
          },
        ],
      }}
      faqs={[
        {
          question: "How much salt do I need for a 10,000-gallon pool?",
          answer:
            "Starting from fresh water (0 ppm) and aiming for 3,200 ppm, about 267 pounds: 10,000 × 3,200 × 8.34 ÷ 1,000,000. Hayward's own table prints the same 267 lb. If the pool already reads, for example, 2,400 ppm, only the 800 ppm difference is needed, which is about 67 pounds.",
        },
        {
          question: "What salt level should my pool be?",
          answer:
            "That depends on the generator. Hayward's AquaRite manual states 2,700–3,400 ppm with 3,200 ppm optimal. Other makers publish their own ranges, and the figure in your unit's manual is the one that applies to it.",
        },
        {
          question: "How do I lower the salt level?",
          answer:
            "By replacing some of the water with fresh water — Hayward's manual says that is the only way. When the reading is above your target, this tool shows the share of the water to replace, worked out as 1 − target ÷ current.",
        },
        {
          question: "Does salt evaporate from a pool?",
          answer:
            "No. Hayward's manual states that salt is not lost due to evaporation. Levels fall when salty water leaves the pool — splash-out, backwashing, draining, or rain overflowing the edge — and fresh water replaces it.",
        },
        {
          question: "Can I use any kind of salt?",
          answer:
            "Hayward's manual specifies sodium chloride that is more than 99% pure, and says not to use rock salt, salt with yellow prussiate of soda, salt with anti-caking additives, or iodized salt. Check your own generator's manual for its requirements.",
        },
        {
          question: "Why does my generator display disagree with my test strip?",
          answer:
            "Readings from strips, store tests and generator cells often differ. This tool calculates from whichever reading you enter, so a reading that is off by 500 ppm gives a dose that is off by the same proportion. A professional test before a large addition removes that doubt.",
        },
        {
          question: "Is the bag count rounded?",
          answer:
            "Yes — up to the next whole bag of the size you enter. The pounds and kilograms figures are the exact calculation, so for a small top-up you can weigh out part of a bag rather than adding all of it.",
        },
      ]}
    >
      <PoolSaltTool />
    </ToolPageLayout>
  );
}
