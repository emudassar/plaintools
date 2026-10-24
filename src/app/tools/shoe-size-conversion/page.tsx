import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ShoeSizeTool from "@/components/ShoeSizeTool";
import { requireTool } from "@/config/tools";

const SLUG = "shoe-size-conversion";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Shoe Size Conversion: US, UK, EU and Mondopoint",
  description:
    "Convert adult shoe sizes between US men's, US women's, UK, EU and Mondopoint, or find your size from your foot length in cm or inches, with a size chart.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ShoeSizeConversionPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert a shoe size",
        steps: [
          { name: "Choose what you know", text: "A US, UK or EU size, Mondopoint, or your foot length." },
          { name: "Enter it", text: "Half sizes are fine." },
          { name: "Read every system", text: "US men's and women's, UK, EU and Mondopoint." },
          { name: "Check the chart", text: "Sizes a little either side of yours." },
        ],
      }}
      uses={{
        heading: "10 times you need a shoe size conversion",
        items: [
          { title: "Buying shoes online from Europe", body: "A shopper converts US 9 to EU before ordering." },
          { title: "Men's and women's sizes", body: "Someone buying unisex sneakers converts women's to men's." },
          { title: "UK brands", body: "A buyer converts a UK size for a British brand." },
          { title: "Gifts", body: "A relative converts a known size for a gift abroad." },
          { title: "Ski and work boots", body: "Mondopoint on a ski boot is converted to US." },
          { title: "Measuring feet", body: "Someone measures their foot and finds the size." },
          { title: "Travel", body: "A traveller shops for shoes on holiday." },
          { title: "Resale listings", body: "A seller lists shoes in several systems." },
          { title: "School uniforms", body: "Parents convert an adult size for a teen." },
          { title: "Checking a size label", body: "Someone checks a label printed with only EU sizes." },
        ],
      }}
      dataSection={{
        heading: "How the sizes are converted",
        paragraphs: [
          "The page works from foot length. Using the equations given for adult sizes in the Wikipedia article on shoe size (ISO/TS 19407 section): EU = 3/20 × foot length in mm + 2; UK = 3/25.4 × foot length − 23. In the US customary system men's sizes are one more than UK and women's two more. Mondopoint is the foot length in mm. Results are rounded to the nearest half size.",
          "Converting from a size finds the foot length first, then every other system.",
          "Limits: brands do not all follow these equations, and widths and lasts differ. Use the brand's own chart when you have it, and try shoes on. Children's sizes use different zero points and are not covered.",
        ],
        sources: [
          { label: "Wikipedia — Shoe size", href: "https://en.wikipedia.org/wiki/Shoe_size" },
        ],
      }}
      faqs={[
        { question: "What is a US men's 10 in EU?", answer: "About EU 42.5 by the standard equations. A brand's own chart can differ, so check it when you have it." },
        { question: "How do I convert women's to men's shoe sizes?", answer: "In the US customary system used here, a women's size is one more than the men's size for the same foot: men's 9 = women's 10." },
        { question: "What is a UK 8 in US?", answer: "US men's 9, US women's 10." },
        { question: "How do I measure my foot?", answer: "Stand on paper, mark the heel and longest toe, and measure between them." },
        { question: "What is Mondopoint?", answer: "Foot length in millimetres, used for ski boots and some military footwear." },
        { question: "Why do brands differ?", answer: "Each brand uses its own lasts and allowances, so the same label can fit differently." },
      ]}
    >
      <ShoeSizeTool />
    </ToolPageLayout>
  );
}
