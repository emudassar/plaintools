import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GoatGestationTool from "@/components/GoatGestationTool";
import { requireTool } from "@/config/tools";

const SLUG = "goat-gestation-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Goat Gestation Calculator: Kidding Date from Breeding Date",
  description:
    "Enter a breeding date, or the dates a buck ran with the does, and get the kidding window from the Merck Veterinary Manual's 145–155-day goat gestation (average 150 days), with a month-by-month chart.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function GoatGestationCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out a kidding date",
        steps: [
          { name: "Enter the breeding date", text: "For a hand-bred or artificially inseminated doe, enter the single date." },
          {
            name: "Or enter a period",
            text: "If the buck ran with the does, tick the box and enter when he went in and when he came out.",
          },
          {
            name: "Read the kidding window",
            text: "The headline counts 145 days from the first date and 155 days from the last — the Merck Veterinary Manual's range applied to your dates.",
          },
          { name: "Check the 150-day date", text: "The manual's average of 150 days is shown as a single planning date." },
          { name: "Use the chart", text: "The gestation chart lists the dates the doe reaches days 30, 60, 90 and 120 and the start of the window." },
        ],
      }}
      uses={{
        heading: "10 situations where a kidding date matters",
        items: [
          { title: "Getting kidding pens ready", body: "Clean, bedded pens need to be ready before the first doe kids — the window's opening date says when." },
          { title: "Planning night checks", body: "Knowing when the window opens and closes avoids starting checks too late or running them weeks too long." },
          { title: "Drying off a dairy doe", body: "Dry-off is timed back from kidding, so an expected date gives the start point to count from." },
          { title: "Timing late-pregnancy feeding", body: "Late-gestation feeding plans count back from kidding; the chart shows the dates for each month." },
          { title: "Scheduling pre-kidding vaccinations", body: "Programs keyed to weeks before kidding need a kidding date to count back from." },
          { title: "Grouping does that ran with one buck", body: "Entering the buck's in and out dates gives the window for that whole group." },
          { title: "Planning around shows and sales", body: "Kid age is counted from birth, so the window gives an early read on when kids reach a target age." },
          { title: "Booking help or time off", body: "Help can be booked against a known window rather than a guess." },
          { title: "Checking whether a doe is past her window", body: "If a doe is beyond 155 days from the breeding date, that is a concrete figure to bring to a veterinarian." },
          { title: "Keeping breeding records", body: "Running each breeding date through the tool gives an expected date to record against each doe." },
        ],
      }}
      dataSection={{
        heading: "Where the gestation figures come from",
        paragraphs: [
          "The figures come from the Merck Veterinary Manual. Its page 'Pregnancy in Goats' (Jamie Lynn Stewart, Virginia-Maryland College of Veterinary Medicine, full review June 2026) states: 'Gestation length in goats is 145–155 days (average 150 days) and can be affected by breed, litter weight, environment, and parity.' The manual's 'Approximate Gestation Periods' table also lists goats at 150 days.",
          "The page adds those numbers of days to the dates you enter, in UTC calendar days so daylight-saving changes never shift a result. For a period, the window runs from 145 days after the first date to 155 days after the last. The month-by-month chart is counted from the first date.",
          "Everything runs in your browser; nothing is sent or stored.",
          "The limits: breed, litter weight, environment and parity all affect gestation length according to the source, and the page does not adjust for any of them. A breeding date or buck period only says when a doe could have conceived, not that she did.",
          "This page counts days. It does not diagnose pregnancy and gives no advice on managing kidding — that is for the keeper and their veterinarian.",
        ],
        sources: [
          {
            label: "Merck Veterinary Manual — Pregnancy in Goats",
            href: "https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-goats/pregnancy-in-goats",
            note: "Gestation 145–155 days, average 150",
          },
          {
            label: "Merck Veterinary Manual — Approximate Gestation Periods (table)",
            href: "https://www.merckvetmanual.com/multimedia/table/approximate-gestation-periods",
            note: "Lists goats at 150 days",
          },
        ],
      }}
      faqs={[
        {
          question: "How long are goats pregnant?",
          answer: "The Merck Veterinary Manual gives 145–155 days, with an average of 150 days — about five months.",
        },
        {
          question: "Why does it give a window instead of one date?",
          answer:
            "Gestation varies by about ten days, and the source names breed, litter weight, environment and parity as factors. With a buck in the herd, the conception date within the period is unknown too.",
        },
        {
          question: "Do Nigerian Dwarf or other small breeds kid earlier?",
          answer:
            "The source says breed affects gestation length but does not give separate figures by breed, so this page does not adjust for breed.",
        },
        {
          question: "Do twins or triplets come earlier?",
          answer: "The source lists litter weight among the factors; it does not give a separate day count, so the page does not adjust for it.",
        },
        {
          question: "Can I use this for sheep?",
          answer: "No. Sheep have their own figures — there is a separate sheep gestation calculator on this site.",
        },
        {
          question: "My doe is past 155 days. What should I do?",
          answer: "This page can't say. It can show how far past the source's range she is; a veterinarian is the person to assess her.",
        },
      ]}
    >
      <GoatGestationTool />
    </ToolPageLayout>
  );
}
