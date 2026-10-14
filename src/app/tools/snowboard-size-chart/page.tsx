import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SnowboardSizeTool from "@/components/SnowboardSizeTool";
import { requireTool } from "@/config/tools";

const SLUG = "snowboard-size-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Snowboard Size Chart: Board Length by Weight, and Wide Boards",
  description:
    "Enter your weight and boot size and get the snowboard length from Jones Snowboards' adult and kids charts, the 'middle size' when you fall in two ranges, and whether you need a wide board.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function SnowboardSizeChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find your snowboard size",
        steps: [
          { name: "Enter your weight", text: "Jones's chart sizes boards by rider weight, in pounds or kilograms." },
          { name: "Pick ability and style", text: "These add Jones's notes on going a little shorter or longer." },
          { name: "Add your boot size", text: "Optional — it tells you whether you need a wide board, and the minimum waist width." },
          { name: "Read the middle size", text: "If your weight falls in two overlapping ranges, Jones says to pick the middle size." },
        ],
      }}
      uses={{
        heading: "10 situations where a snowboard size chart helps",
        items: [
          { title: "Buying a first board", body: "Beginners on a board that is too long struggle to turn; Jones notes beginners often go 1–2 cm shorter." },
          { title: "Avoiding toe drag with big feet", body: "Above Men's US 10, a regular board can let toes and heels catch the snow mid-carve; the chart gives the minimum waist width." },
          { title: "Choosing between two lengths of one model", body: "If a board comes in 154 and 157, the middle size for your weight points the way." },
          { title: "Buying a used board", body: "Second-hand listings rarely give a weight range; check the length against yours." },
          { title: "Sizing a child's board", body: "Jones's kids chart starts at a 70–80 cm board and warns against sizing up too much." },
          { title: "Picking a powder board", body: "Jones gives the option of 2–3 cm longer for float." },
          { title: "Picking a park board", body: "Freestyle riders can go 2–3 cm shorter for spins, or longer for big landings." },
          { title: "Riders whose weight and height don't match", body: "Jones sizes by weight, so a light tall rider and a heavy short rider get different answers." },
          { title: "Checking a rental board", body: "Know your size before you reach the rental counter." },
          { title: "Women riding men's or unisex boards", body: "Jones uses one weight chart for men and women; width depends on boot size." },
        ],
      }}
      dataSection={{
        heading: "Where the sizes come from",
        paragraphs: [
          "The charts are from Jones Snowboards' published size guide, read on the date shown on the result. The men's and women's chart lists overlapping rider-weight ranges in pounds and kilograms, each with a recommended board size in centimetres, from 137–143 cm for riders under about 100 lbs to 165 cm and longer for riders over 225 lbs. The kids and youth chart runs from a 70–80 cm board for 20–45 lb riders.",
          "Because the weight ranges overlap, most weights fall in two or more rows. Jones's rule is: 'When your weight falls into multiple size ranges, select the middle size.' This page takes the centre of the matched ranges as that middle size and shows the full span. Weights are matched in the unit you enter, because the chart's pound and kilogram columns are rounded separately.",
          "The width answer uses Jones's wide-board chart. At or below Men's US 10, Women's US 11.5, UK 9 or EU 44, Jones says a regular-width board works; above that it lists a recommended minimum waist width, from 25.9 cm up to 27.8 cm. A boot size between two rows uses the larger row.",
          "Limits: the last row of Jones's kids chart is printed as '130-45', which is evidently a misprint, so this page shows only its lower end. This is one maker's general chart: each board model carries its own weight range per length, and other brands' charts differ. Check the chart for the exact board you are buying.",
        ],
        sources: [
          { label: "Jones Snowboards — Complete size guide and charts", href: "https://www.jonessnowboards.com/base-camp/blog/jones-snowboards-sizing-guidelines.html", note: "Weight charts, wide-board chart, middle-size rule, style and skill notes" },
        ],
      }}
      faqs={[
        { question: "What size snowboard do I need for my weight?", answer: "On Jones's chart a 165 lb rider falls in the 152–157 and 154–159 cm ranges, so the middle size is about 155.5 cm. Enter your weight for your size." },
        { question: "Should I size a snowboard by height or weight?", answer: "Jones's chart uses weight only. Weight decides how much the board flexes under you, which is why two riders of the same height can need different lengths." },
        { question: "When do I need a wide snowboard?", answer: "Jones says riders above Men's US 10, Women's US 11.5, UK 9 or EU 44 will want a wide board to avoid toe and heel drag, and gives a minimum waist width for each size." },
        { question: "What if my weight is in two size ranges?", answer: "Jones: 'select the middle size.' Go shorter for a more playful board, longer for stability and float." },
        { question: "Should beginners get a shorter snowboard?", answer: "Jones notes beginners often prefer slightly shorter (1–2 cm) or softer-flexing boards, and intermediate to advanced riders the recommended size." },
        { question: "Should I buy my child a bigger board to grow into?", answer: "Jones warns against sizing up too much: a board that is too big makes first turns harder and slows progression." },
        { question: "Do all snowboard brands use the same chart?", answer: "No. This is Jones's general chart. Each brand, and each model, publishes its own weight range per length." },
      ]}
    >
      <SnowboardSizeTool />
    </ToolPageLayout>
  );
}
