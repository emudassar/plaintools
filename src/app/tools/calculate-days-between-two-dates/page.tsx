import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DaysBetweenTool from "@/components/DaysBetweenTool";
import { requireTool } from "@/config/tools";

const SLUG = "calculate-days-between-two-dates";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Calculate Days Between Two Dates (Weekdays Too)",
  description:
    "Pick two dates and get the exact number of days between them, with weekdays, weekend days, weeks and years-months-days. Option to include the end date.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function CalculateDaysBetweenTwoDatesPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate the days between two dates",
        steps: [
          { name: "Pick the start date", text: "It starts at today; change it to any date from 1900 to 2200." },
          { name: "Pick the end date", text: "If it is earlier than the start, the two are swapped for you." },
          { name: "Choose whether to count the end date", text: "Tick the box to count both the first and the last day." },
          { name: "Read the result", text: "Days, weeks and days, years-months-days, weekdays and weekend days." },
        ],
      }}
      uses={{
        heading: "10 reasons to count the days between two dates",
        items: [
          { title: "Notice periods", body: "An employee working out how many days are left between handing in notice and their last day." },
          { title: "Visa and travel limits", body: "A traveller checking the days spent in a country between arrival and departure stamps." },
          { title: "Rental deposits and returns", body: "A tenant counting the days a landlord has taken since the move-out date." },
          { title: "Project timelines", body: "A project manager seeing how many working days sit between kickoff and a launch date." },
          { title: "Pregnancy and baby milestones", body: "Parents counting the days since a birth or until a due date." },
          { title: "Warranty and return windows", body: "A shopper checking whether a 90-day return window has closed." },
          { title: "Court and filing deadlines", body: "Someone counting calendar days to a filing date, then checking the court's own counting rule." },
          { title: "Anniversaries", body: "A couple counting the days they have been together." },
          { title: "Habit streaks", body: "Someone tracking how many days since they started a new habit." },
          { title: "Invoice ageing", body: "A small business owner seeing how many days an invoice has been unpaid." },
        ],
      }}
      dataSection={{
        heading: "How the days are counted",
        paragraphs: [
          "Dates are counted as whole calendar days in the Gregorian calendar, including leap days. By default the count excludes the end date (1 March to 2 March is 1 day); tick the box to include both ends (2 days).",
          "Weekdays are Monday to Friday. The years-months-days figure counts whole months first — a month added to 31 January lands on 28 or 29 February — then the days left.",
          "Limits: weekday counts do not remove public holidays, and a law, contract or court rule may count days differently (excluding the first day, rolling past weekends). Use this page for the arithmetic and that rule for the deadline itself.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I calculate the days between two dates?", answer: "Subtract the earlier date from the later one in whole days. This page does it for you, leap years included." },
        { question: "Does it include the end date?", answer: "Not by default. Tick 'Include the end date' to count both the first and the last day, which adds one." },
        { question: "How many days are in a year?", answer: "365, or 366 in a leap year. 2028 is the next leap year." },
        { question: "How are business days counted?", answer: "The weekday count is Monday to Friday. Public holidays are not removed, because they differ by country, state and employer." },
        { question: "Can the end date be before the start date?", answer: "Yes. The page swaps them and tells you it did." },
        { question: "How far back can I go?", answer: "From 1900 to 2200." },
      ]}
    >
      <DaysBetweenTool />
    </ToolPageLayout>
  );
}
