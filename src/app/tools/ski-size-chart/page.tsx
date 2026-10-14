import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SkiSizeTool from "@/components/SkiSizeTool";
import { requireTool } from "@/config/tools";

const SLUG = "ski-size-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Ski Size Chart: Ski Length by Height for Adults and Kids",
  description:
    "Enter height (and a child's weight) and get the suggested ski length range in cm from Nordica's adult and junior size charts, plus which end of the range to lean toward.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function SkiSizeChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find your ski length",
        steps: [
          { name: "Pick adult or child", text: "The child chart covers ages 3 to 14 and uses weight as well as height." },
          { name: "Enter height", text: "In feet and inches or centimetres, measured without ski boots." },
          { name: "Add a child's weight", text: "If a child's height falls between two rows, weight decides which row Nordica says to use." },
          { name: "Tick what applies", text: "Ability, turn style, terrain and ski shape decide whether to lean to the short or long end of the range." },
        ],
      }}
      uses={{
        heading: "10 situations where a ski size chart helps",
        items: [
          { title: "Buying a first pair of skis", body: "A beginner on skis that are too long struggles to turn; the chart gives a range and says which end beginners sit at." },
          { title: "Checking a rental shop's suggestion", body: "Know the range before you get to the counter, so a 180 cm ski handed to a 5'4\" beginner gets questioned." },
          { title: "Buying used skis online", body: "Second-hand listings give a length and nothing else. Check it falls in your range before paying." },
          { title: "Sizing a growing child", body: "Nordica says not to go longer than the child's suggested range, even for room to grow." },
          { title: "Choosing between two lengths of the same model", body: "If a ski comes in 163 and 170, the go-shorter / go-longer reasons say which way to go." },
          { title: "Moving from intermediate to advanced", body: "Advanced skiers sit toward the long end — see how much longer your next pair could be." },
          { title: "Buying a powder or rockered ski", body: "Nordica says skis with a lot of rocker are sized up to keep them stable." },
          { title: "Converting a height in feet to centimetres", body: "Ski lengths are always in cm; the chart lines up both units." },
          { title: "Kitting out a family trip", body: "Size every adult and child in a couple of minutes before booking rentals." },
          { title: "Settling a disagreement", body: "Chin, nose or top of the head? The chart shows where each rule of thumb lands for your height." },
        ],
      }}
      dataSection={{
        heading: "Where the lengths come from",
        paragraphs: [
          "Both charts are Nordica's published Ski Sizer, read on the date shown on the result. The adult chart lists heights from 4'0\" (122 cm) to 6'2\" and over (188 cm), each with a suggested ski length range in centimetres. Nordica's general rule: skis 'somewhere between your chin and the top of your head', with expert skiers 'often choosing skis slightly above their head'.",
          "The child chart lists ages 3 to 14 with a height, a weight and a ski length range. Nordica notes the heights and weights are 'based off 50th percentile for children', and that junior skis should measure 'between the child's chest and nose'. If a child's height falls between two rows, Nordica says to use the shorter row for a child who is light for their height and the taller row for one who is heavy. This page judges 'light' or 'heavy' by comparing the weight you enter with the chart's weight read in a straight line between the two rows.",
          "For adults, the chart steps every two inches; this page uses the nearest row. The go-shorter and go-longer reasons are Nordica's own lists. The page counts how many you tick on each side and points to that end of the range — it does not invent a single 'correct' length.",
          "Limits: this is one manufacturer's general guide. Individual models, especially wide rockered skis and race skis, carry their own size ranges, and other brands' charts differ. Nothing here replaces the size range printed for the exact ski, or a fitting by someone who can watch you ski.",
        ],
        sources: [
          { label: "Nordica — Ski Sizer (PDF)", href: "https://www.nordica.com/assets/downloads/ski-sizer_en.pdf", note: "Adult chart, child chart and the go-shorter / go-longer reasons" },
        ],
      }}
      faqs={[
        { question: "What size skis do I need for my height?", answer: "On Nordica's chart a 5'8\" (173 cm) adult has a range of 160–180 cm, and a 6'0\" (183 cm) adult 170–185 cm. Enter your own height for your range." },
        { question: "Should beginners use shorter skis?", answer: "Nordica's chart says to go shorter, closer to the chin, if you are a beginner–intermediate skier, and longer, closer to the top of the head, if you are advanced–expert." },
        { question: "How do I size skis for a child?", answer: "Use the child's height and weight. On Nordica's chart an 8-year-old at 50 in (127 cm) and 57 lb has a range of 110–120 cm. Junior skis should come between the chest and the nose." },
        { question: "Does my weight change my ski length?", answer: "Yes, within the range. Nordica lists weighing more than average for your height as a reason to go longer, and less than average as a reason to go shorter." },
        { question: "What if I'm taller than 6'2\"?", answer: "Nordica's adult chart has one row for 6'2\" and over: 175–193 cm. Very tall skiers may need a brand or model that comes longer." },
        { question: "Should I buy kids' skis a size up to grow into?", answer: "Nordica lists room to grow as a reason to lean long, but says it does not recommend going longer than the child's suggested range." },
        { question: "Are all ski brands sized the same?", answer: "No. This is Nordica's general chart. Check the range printed for the exact model, especially for rockered powder skis." },
      ]}
    >
      <SkiSizeTool />
    </ToolPageLayout>
  );
}
