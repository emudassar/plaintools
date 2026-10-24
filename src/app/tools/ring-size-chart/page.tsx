import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import RingSizeTool from "@/components/RingSizeTool";
import { requireTool } from "@/config/tools";

const SLUG = "ring-size-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Ring Size Chart and Converter: US, UK, EU, mm",
  description:
    "Convert ring sizes between US, UK and Australia letters, ISO (EU) circumference, Swiss and German sizes, or find your size from a ring's inside diameter.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function RingSizeChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find and convert a ring size",
        steps: [
          { name: "Choose what you know", text: "A US or UK size, ISO circumference, Swiss size, or a ring's inner diameter." },
          { name: "Enter it", text: "US quarter sizes and UK half sizes are fine." },
          { name: "Read every system", text: "And the circumference and diameter in mm." },
          { name: "Check the chart", text: "US sizes 3 to 13 with UK letters and measurements." },
        ],
      }}
      uses={{
        heading: "10 times a ring size conversion helps",
        items: [
          { title: "Buying an engagement ring abroad", body: "A buyer converts a US 6 to a UK letter for a London jeweller." },
          { title: "Surprise rings", body: "Someone measures a ring that fits and finds its size." },
          { title: "Online jewellery shops", body: "A shopper converts EU sizes on a European site." },
          { title: "Wedding bands", body: "A couple converts sizes for a jeweller in another country." },
          { title: "Smart rings", body: "A buyer checks a size before ordering." },
          { title: "Resizing", body: "Someone tells a jeweller the size to resize to." },
          { title: "Gift sets", body: "A gift giver converts a size from a list." },
          { title: "Measuring with string", body: "A finger circumference in mm gives the ISO size." },
          { title: "Selling rings", body: "A seller lists a ring's size in several systems." },
          { title: "Comparing charts", body: "Someone checks a store chart against the standard." },
        ],
      }}
      dataSection={{
        heading: "How the ring sizes are converted",
        paragraphs: [
          "The page works from the ring's inner circumference. ISO 8653 sizes are the inner circumference in mm. US, Canada and Mexico sizes follow circumference = 2.55 × size + 36.5 mm. UK, Ireland and Australia use letters: since BS 6820:1987 each letter is 1.25 mm of circumference, with C = 40 mm. Italian, Spanish and Swiss sizes are circumference − 40; German and Dutch sizes are the inner diameter in mm. These relations are given in the Wikipedia article on ring size.",
          "Limits: sizing tools differ slightly between jewellers. India, Japan and China use non-linear scales not converted here. Fingers change size with temperature and time of day; a jeweller's sizer is the most reliable measure.",
        ],
        sources: [
          { label: "Wikipedia — Ring size", href: "https://en.wikipedia.org/wiki/Ring_size" },
        ],
      }}
      faqs={[
        { question: "What is a US size 7 in UK?", answer: "N½, about 54.4 mm inner circumference." },
        { question: "How do I find my ring size at home?", answer: "Measure the inside diameter of a ring that fits, or wrap string around the finger and measure its length in mm (the ISO size)." },
        { question: "Can I convert Indian or Japanese ring sizes?", answer: "Not here. Those scales do not change in equal steps, so they cannot be converted with a formula." },
        { question: "What is EU size 52 in US?", answer: "About US 6." },
        { question: "How do I convert ring diameter to size?", answer: "Choose 'Inner diameter' and enter it in mm." },
        { question: "Are Swiss and Italian sizes the same?", answer: "Yes, both are the circumference minus 40." },
      ]}
    >
      <RingSizeTool />
    </ToolPageLayout>
  );
}
