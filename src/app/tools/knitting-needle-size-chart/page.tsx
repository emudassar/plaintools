import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import KnittingNeedleTool from "@/components/KnittingNeedleTool";
import { requireTool } from "@/config/tools";

const SLUG = "knitting-needle-size-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Knitting Needle Size Chart: mm to US Sizes (Craft Yarn Council)",
  description:
    "Convert knitting needle sizes between millimetres and US numbers with the Craft Yarn Council standard chart — 1.5 mm (US 000) to 35 mm (US 70), including the sizes that share a US number.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function KnittingNeedleSizeChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert a knitting needle size",
        steps: [
          { name: "Choose what you have", text: "A millimetre size (printed on most needles and packages) or a US number from a pattern." },
          { name: "Enter or pick the size", text: "Type the mm size, or choose the US number from the list." },
          { name: "Read the match", text: "The equivalent size appears at the top and is highlighted in the full chart." },
          { name: "Watch for shared numbers", text: "Some US numbers cover two mm sizes — 3, 6, 9, 10 and 17. The mm size is the exact one." },
        ],
      }}
      uses={{
        heading: "10 situations where a needle size chart helps",
        items: [
          { title: "A US pattern and metric needles", body: "The pattern says US 8; the needles say 5 mm. The chart confirms they match." },
          { title: "A European pattern and US needles", body: "A pattern written in mm needs converting to the US numbers on an older set." },
          { title: "Unmarked needles in a stash", body: "Measured with a gauge, an unmarked needle's mm size can be matched to its US number." },
          { title: "Buying a replacement needle", body: "Matching the mm size avoids buying a 'US 6' that is 4 mm when the set is 4.25 mm." },
          { title: "Interchangeable tip sets", body: "Sets are labelled in either system; the chart lines them up." },
          { title: "Going up or down a size for gauge", body: "The chart shows the next size either side in both systems." },
          { title: "Sizes with no US number", body: "3 mm and 7 mm have no US equivalent in the standard, which explains why a pattern may only give mm." },
          { title: "Teaching a beginner", body: "One chart in both systems answers the most common needle question." },
          { title: "Ordering from another country", body: "A shop listing only mm sizes can be matched to US needles you already own." },
          { title: "Jumbo needles for chunky knits", body: "The chart runs up to 35 mm (US 70) for arm-knitting-scale projects." },
        ],
      }}
      dataSection={{
        heading: "Where the sizes come from",
        paragraphs: [
          "The chart is the knitting needle table from the Craft Yarn Council's 'Hooks & Needles' standard, read from the council's website on the date shown on the result. It pairs metric sizes from 1.5 mm to 35 mm with US numbers from 000 to 70. Two sizes, 3 mm and 7 mm, have no US number in the table.",
          "Several US numbers cover two metric sizes in the standard: US 3 (3.125 and 3.25 mm), US 6 (4 and 4.25 mm), US 9 (5.25 and 5.5 mm), US 10 (5.75 and 6 mm) and US 17 (12.5 and 12.75 mm). The council's own advice is that letter and number sizing vary from company to company, so the package millimetre size is the accurate one.",
          "The lookup runs in your browser; nothing is sent or stored.",
          "Limits: this page covers mm and US sizes only. UK and old imperial gauge numbers are not part of the council's table and are not shown. Matching a needle size does not guarantee matching a pattern's gauge — that depends on yarn and tension, which the chart does not cover.",
        ],
        sources: [
          { label: "Craft Yarn Council — Hooks & Needles standard", href: "https://www.craftyarncouncil.com/standards/hooks-and-needles", note: "Knitting needle mm ↔ US table" },
        ],
      }}
      faqs={[
        { question: "What size is a US 8 knitting needle in mm?", answer: "5 mm, in the Craft Yarn Council standard." },
        { question: "What is a 4 mm needle in US sizes?", answer: "US 6. The standard also lists 4.25 mm as US 6." },
        { question: "Why do two mm sizes have the same US number?", answer: "The standard lists both under one US number (for example 3.125 and 3.25 mm are both US 3). The council notes number sizing varies by maker and recommends relying on the mm size." },
        { question: "What US size is 1.5 mm?", answer: "US 000 — the smallest size in the chart." },
        { question: "What US size is 3 mm or 7 mm?", answer: "The standard lists no US number for either size." },
        { question: "Does this include UK needle sizes?", answer: "No. UK and old imperial sizes are not part of the Craft Yarn Council table, so they are not shown." },
        { question: "If I match the needle size, will I match the pattern's gauge?", answer: "Not necessarily. Gauge depends on yarn and how you knit; the chart only converts needle sizes." },
      ]}
    >
      <KnittingNeedleTool />
    </ToolPageLayout>
  );
}
