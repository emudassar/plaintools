import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import HorseBlanketTool from "@/components/HorseBlanketTool";
import { requireTool } from "@/config/tools";

const SLUG = "horse-blanket-size-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Horse Blanket Size Chart: Inches, Feet, cm and Euro Sizes",
  description:
    "Enter your horse's chest-to-rump measurement and get the blanket size in US inches, UK feet and centimetres, plus the Euro back-seam size — with the full size chart.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HorseBlanketSizeChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to size a horse blanket",
        steps: [
          { name: "Measure the body length", text: "Run a soft tape from the centre of the chest, along the side, to the end of the rump." },
          { name: "Enter it", text: "Type the measurement in inches or centimetres." },
          { name: "Round up between sizes", text: "Sizes go up in 3-inch steps; if the horse is between two, the chart's maker says to choose the bigger one." },
          { name: "Read every size system", text: "The result gives US inches, UK feet and inches, centimetres and the Euro back-seam size." },
        ],
      }}
      uses={{
        heading: "10 situations where a horse blanket size chart helps",
        items: [
          { title: "Buying a first blanket", body: "Measuring and rounding up avoids a blanket that rubs the shoulders or slips back." },
          { title: "Buying a UK-sized rug in the US", body: "UK rugs are sized in feet and inches — 6'3\" is a 75-inch blanket." },
          { title: "Buying a European rug", body: "European sizes use the back seam in centimetres; the chart lines it up with US inches." },
          { title: "Fitting a horse between sizes", body: "The tool says which way to go and shows the size either side." },
          { title: "Ordering online", body: "With no chance to try it on, the chart is the best check before buying." },
          { title: "Sizing a pony or miniature", body: "The chart runs down to 36 inches (3'0\")." },
          { title: "Checking an old blanket's label", body: "Turn a size on a label into a measurement to see if it should fit." },
          { title: "Buying for a growing youngster", body: "Re-measure and see how far the horse is from the next size." },
          { title: "Lending or selling a blanket", body: "Describe its size in every system a buyer might use." },
          { title: "Reading letter sizes", body: "WeatherBeeta's X Small to X Large sizes are matched to back-seam centimetres." },
        ],
      }}
      dataSection={{
        heading: "Where the chart comes from",
        paragraphs: [
          "The chart is WeatherBeeta's published horse blanket size guide, read on the date shown on the result. It gives each size as a body length in feet and inches, inches and centimetres, with the matching Euro back-seam size in centimetres, and maps back seams of 125–165 cm to letter sizes X Small to X Large.",
          "WeatherBeeta's measuring instructions: body length is measured 'from the center of the chest to the end of rump', and back seam 'from the wither to the top of the tail'. Its blankets are 'sized in 3 inch increments, if your horse is between sizes, then choose the bigger size' — so the calculator picks the smallest size that is at least your measurement. The chart includes a 6'5\" (77-inch, 195 cm) size between 6'3\" and 6'6\", which is kept as printed.",
          "When you enter centimetres the comparison uses the chart's centimetre column, and inches use the inch column, because the two columns are rounded separately.",
          "Limits: this is one maker's chart. Other brands size and cut differently, and neck style, shoulder gussets and the horse's build all affect fit.",
        ],
        sources: [{ label: "WeatherBeeta — Horse Blanket Size Guide", href: "https://www.weatherbeeta.com/horse-blanket-size-guide", note: "Size chart, measuring instructions and the 'choose the bigger size' rule" }],
      }}
      faqs={[
        { question: "How do I measure my horse for a blanket?", answer: "Measure from the centre of the chest, along the side, to the end of the rump. That body length in inches is the US blanket size." },
        { question: "What size blanket does my horse need if it measures 73 inches?", answer: "WeatherBeeta's sizes run 72 then 75 inches, and it says to choose the bigger size, so 75\" (6'3\")." },
        { question: "How do UK rug sizes compare with US sizes?", answer: "UK sizes are the same length in feet and inches: 6'0\" is 72 inches and 6'6\" is 78 inches." },
        { question: "What is a Euro back-seam size?", answer: "The length in centimetres from the withers to the top of the tail. On WeatherBeeta's chart a 75-inch blanket is a 140 cm back seam." },
        { question: "What is the average horse blanket size?", answer: "The chart doesn't give an average; sizes run from 36 to 87 inches. Measure your own horse." },
        { question: "Are all brands sized the same?", answer: "No. This is WeatherBeeta's chart; always check the chart of the brand you are buying." },
      ]}
    >
      <HorseBlanketTool />
    </ToolPageLayout>
  );
}
