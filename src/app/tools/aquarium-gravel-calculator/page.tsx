import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import AquariumGravelTool from "@/components/AquariumGravelTool";
import { requireTool } from "@/config/tools";

const SLUG = "aquarium-gravel-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Aquarium Gravel Calculator: Pounds and Bags for Your Tank",
  description:
    "How much gravel or sand for your fish tank: length × width × depth ÷ 1,728 × the substrate's weight per cubic foot (75–100 lb in CaribSea's list), in pounds, kilograms and bags.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function AquariumGravelCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out how much aquarium gravel you need",
        steps: [
          {
            name: "Measure the inside of the tank",
            text: "Measure the inside length and width of the bottom, in inches or centimetres. Outside measurements include the glass and slightly overstate the area.",
          },
          {
            name: "Choose the bed depth",
            text: "Enter the depth of gravel or sand you want across the bottom, in the same unit.",
          },
          {
            name: "Pick the substrate",
            text: "Choose a substrate from CaribSea's list of approximate weights (75 to 100 lb per cubic foot), or enter the weight per cubic foot from your own bag.",
          },
          {
            name: "Read the weight and bag count",
            text: "The result is length × width × depth ÷ 1,728 (cubic inches in a cubic foot) × the weight per cubic foot, with the bag count rounded up.",
          },
          {
            name: "Compare with the rule of thumb",
            text: "Enter the tank's gallons to see CaribSea's general rule of 1 to 2 lb per gallon next to the measured result.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where a gravel calculation helps",
        items: [
          {
            title: "Setting up a first aquarium",
            body: "A new fishkeeper with a 20-gallon tank can see how many bags to carry home instead of guessing at the shop.",
          },
          {
            title: "Planning a planted tank",
            body: "Planted layouts often use a deeper bed. Changing the depth shows how quickly the weight rises.",
          },
          {
            title: "Choosing between sand and gravel",
            body: "CaribSea lists its cichlid gravels at 75 lb per cubic foot and its cichlid sands at 100, so the same bed needs different weights.",
          },
          {
            title: "Buying crushed coral for a cichlid tank",
            body: "Crushed coral is one of the lighter substrates in the list (75 lb per cubic foot), so it takes fewer pounds for the same depth.",
          },
          {
            title: "Setting up a reef or marine tank",
            body: "Aragonite sands such as Aragalive are listed at 100 lb per cubic foot; the calculator turns that into pounds for your footprint.",
          },
          {
            title: "Working in centimetres",
            body: "Tanks sold in metric sizes can be entered in centimetres; the result also shows kilograms and litres.",
          },
          {
            title: "Topping up an existing bed",
            body: "Entering only the extra depth you want to add gives the weight of the top-up.",
          },
          {
            title: "Checking a shop's estimate",
            body: "The 1 to 2 lb per gallon rule gives a wide range. The measured result shows where in that range your tank sits.",
          },
          {
            title: "Stocking substrate for a fish room",
            body: "Someone setting up several tanks can run each footprint and add up the bags.",
          },
          {
            title: "Using a brand not in the list",
            body: "If the bag gives a weight per cubic foot, entering it uses the same formula with that figure.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the formula and weights come from",
        paragraphs: [
          "The method is from CaribSea's FAQ, under 'How many pounds do I need?'. It gives the general rule of 1 to 2 pounds per gallon and, for a more precise answer, length × width × bed depth in inches, divided by 1,728, multiplied by the substrate's approximate density.",
          "The densities are CaribSea's printed figures in pounds per cubic foot: Super Naturals 100, Eco-Planted 80, Aragalive and Ocean Direct 100, Crushed Coral 75, Special Grade Reef Sand 85, Aragamax 100, Fiji Pink and Special Grade Reef Sand (dry) 90, African Cichlid Sands 100 and African Cichlid Gravels 75. Special Grade Reef Sand appears twice in the FAQ (85, and 90 dry); both are listed as printed.",
          "Centimetres are converted at 2.54 cm per inch, kilograms at 0.4536 kg per pound and litres at 28.317 litres per cubic foot. Bag counts are rounded up to whole bags. Nothing is fetched while you use the page.",
          "The limits: the weights are approximate and specific to CaribSea's products. Other brands and grain sizes differ, and the bag or maker is the authority for theirs. The result assumes an even, flat bed. It is a quantity estimate, not husbandry guidance, and does not say what depth or substrate suits particular fish or plants.",
        ],
        sources: [
          {
            label: "CaribSea, Inc. — FAQ",
            href: "https://caribsea.com/faq/",
            note: "'How many pounds do I need?': rule of thumb, formula and substrate densities",
          },
        ],
      }}
      faqs={[
        {
          question: "How much gravel do I need for a 20 gallon tank?",
          answer:
            "It depends on the footprint and depth, not just the gallons. For a 24 × 12 in bottom at 2 in deep, the formula gives 24 × 12 × 2 ÷ 1,728 = 0.333 cu ft, which is 33.3 lb at 100 lb per cubic foot or 25 lb at 75. CaribSea's general rule of 1 to 2 lb per gallon gives 20–40 lb.",
        },
        {
          question: "Is it really 1 pound of gravel per gallon?",
          answer:
            "CaribSea gives 1 to 2 pounds per gallon as a general rule and the dimensions formula for a more precise figure. Tall tanks hold many gallons over a small footprint, so the rule can overstate what they need.",
        },
        {
          question: "What is the 1,728 in the formula?",
          answer: "The number of cubic inches in a cubic foot (12 × 12 × 12). It turns the bed's volume in cubic inches into cubic feet.",
        },
        {
          question: "Does sand weigh more than gravel?",
          answer:
            "In CaribSea's list, its African Cichlid Sands are 100 lb per cubic foot and its African Cichlid Gravels 75 lb, so the sand needs more pounds for the same bed.",
        },
        {
          question: "My substrate isn't on the list. What do I enter?",
          answer:
            "Choose 'Other' and enter the weight per cubic foot from its bag or maker. If you only know a bag's weight and volume, divide the weight by the volume in cubic feet.",
        },
        {
          question: "Should I measure inside or outside the glass?",
          answer: "Inside. The gravel only covers the inside of the bottom, and outside dimensions include the glass and frame.",
        },
      ]}
    >
      <AquariumGravelTool />
    </ToolPageLayout>
  );
}
