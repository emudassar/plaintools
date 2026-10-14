import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SkiBootSizeTool from "@/components/SkiBootSizeTool";
import { requireTool } from "@/config/tools";

const SLUG = "ski-boot-size-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Ski Boot Size Chart: Mondopoint to US, EU and UK Sizes",
  description:
    "Convert a Mondopoint ski boot size to US men's, women's, kids', EU and UK shoe sizes, or the other way round, from Nordica's official sizing chart — with standard and performance fit.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function SkiBootSizeChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert a ski boot size",
        steps: [
          { name: "Pick what you know", text: "A Mondopoint size or foot length, or a US, EU or UK shoe size." },
          { name: "Enter the size", text: "Mondopoint can be typed in centimetres (26.5) or millimetres (265)." },
          { name: "Read both fits", text: "Adult sizes give a Standard fit and a tighter Performance fit Mondopoint." },
          { name: "Check the row", text: "The matching rows of Nordica's chart are listed, and the full chart is one click away." },
        ],
      }}
      uses={{
        heading: "10 situations where a ski boot size chart helps",
        items: [
          { title: "Reading the number on a boot shell", body: "A boot marked 27.5 or 275 is Mondopoint 27.5 — US men's 9.5 standard fit on Nordica's chart." },
          { title: "Buying used boots online", body: "Listings give Mondopoint only; convert it to a shoe size you recognise before paying." },
          { title: "Ordering boots from a European shop", body: "Line up EU and UK shoe sizes with the Mondopoint the shop lists." },
          { title: "Sizing a child's first boots", body: "Kids' shoe sizes run in child and youth sizes; the junior chart covers both." },
          { title: "Booking rental boots", body: "Rental forms ask for Mondopoint or a shoe size — have both ready." },
          { title: "Choosing between a comfort and a tight fit", body: "Nordica lists a Standard fit and a Performance fit size for each adult shoe size." },
          { title: "Women buying men's or unisex boots", body: "Compare the two tables to see which men's size matches a women's size." },
          { title: "Checking a hand-me-down boot will fit", body: "Turn the shell size into a shoe size and compare." },
          { title: "Making sense of half sizes", body: "A foot that measures 26.3 cm sits between two Mondopoint sizes; both are shown." },
          { title: "Understanding a boot fitter's recommendation", body: "See where the size they suggest falls against your shoe size." },
        ],
      }}
      dataSection={{
        heading: "Where the sizes come from",
        paragraphs: [
          "The chart is Nordica's published Ski Boot Sizing Chart, read on the date shown on the result. Its men's and women's tables give US, Euro and UK foot sizes alongside two Mondopoint recommendations: Standard Fit, which Nordica recommends for beginner to intermediate skiers who ski less often and at lower speeds, and Performance Fit, for intermediate to advanced skiers who ski regularly and at higher speeds. A junior table gives US child, US youth and UK sizes with one Mondopoint size.",
          "Nordica describes Mondopoint as the length of the foot in centimetres, heel to big toe, measured standing with the foot fully weighted. When you enter a Mondopoint size, this page finds every row of the three tables where that size appears. Where a foot length falls between two half sizes, both are shown, because the chart does not say which way to round. Some EU sizes appear on more than one row (EU 41 is on three men's rows); all are listed.",
          "Where the chart prints a dash — no Standard fit size for men's 15 and 15.5, no Performance fit for women's 4.5 and 5 — this page shows a dash too.",
          "Limits: Mondopoint describes length only. Width, instep height and flex decide whether a boot fits, and shoe sizes differ between shoe brands. Other boot makers' conversion charts can differ by half a size. This is not boot sole length (BSL), which is a separate number moulded on the heel and used to set bindings.",
        ],
        sources: [
          { label: "Nordica — Ski Boot Sizing Chart (PDF)", href: "https://www.nordica.com/assets/downloads/size-boot-sl.pdf", note: "Men's, women's and junior tables; Mondopoint and fit definitions" },
        ],
      }}
      faqs={[
        { question: "What is Mondopoint?", answer: "The ski boot sizing system based on foot length in centimetres, heel to big toe. A 26.5 cm foot is Mondopoint 26.5; boots are often labelled in millimetres, so 265." },
        { question: "What is ski boot size 21.5 in US sizes?", answer: "On Nordica's chart Mondopoint 21.5 is US women's 4.5 (standard fit) or 5.5 (performance fit), US men's 4.5 (performance fit), and US youth 3.5 / UK 2.5 on the junior chart." },
        { question: "What Mondopoint is a US men's 10?", answer: "Nordica gives Mondopoint 28 for a standard fit and 27 for a performance fit." },
        { question: "What is the difference between standard and performance fit?", answer: "Performance fit is one full Mondopoint smaller, for a snugger boot. Nordica recommends it for intermediate to advanced skiers who ski regularly and fast, and standard fit for less frequent, slower skiers." },
        { question: "Should I convert my shoe size or measure my foot?", answer: "Nordica says it is best to measure the actual length of your foot in centimetres, because shoe sizes vary from company to company." },
        { question: "Is Mondopoint the same as boot sole length?", answer: "No. Boot sole length (BSL) is the outside length of the boot sole in millimetres, used for binding settings, and is longer than the Mondopoint size." },
        { question: "Do all ski boot brands convert sizes the same way?", answer: "Not exactly. This is Nordica's chart; other brands' charts can differ by half a size, and every brand's shells fit differently." },
      ]}
    >
      <SkiBootSizeTool />
    </ToolPageLayout>
  );
}
