import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ChronologicalAgeTool from "@/components/ChronologicalAgeTool";
import { requireTool } from "@/config/tools";

const SLUG = "chronological-age-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Chronological Age Calculator (Years, Months, Days)",
  description:
    "Enter a date of birth and a test or other date and get exact chronological age in years, months and days, plus total months, weeks and days and the next birthday.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ChronologicalAgeCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate chronological age",
        steps: [
          { name: "Enter the date of birth", text: "Use the date picker or type it." },
          { name: "Enter the age-at date", text: "It starts at today; set it to a test, assessment or event date." },
          { name: "Read the age", text: "Years, months and days, also written as years;months;days, plus totals." },
        ],
      }}
      uses={{
        heading: "10 situations that need an exact age",
        items: [
          { title: "Psychological and educational testing", body: "An examiner needs a child's age in years, months and days on the test date to look up the right norms table." },
          { title: "Speech and occupational therapy", body: "A therapist records chronological age at each assessment." },
          { title: "School entry cut-offs", body: "A parent checks whether a child is old enough on the district's cut-off date." },
          { title: "Sports age groups", body: "A coach confirms a player's age on the league's reference date." },
          { title: "Retirement and benefits", body: "Someone works out their exact age on the date a benefit begins." },
          { title: "Visa and passport forms", body: "An applicant fills in age on the date of application." },
          { title: "Medical records", body: "A nurse notes an infant's age in months and days at a check-up." },
          { title: "Birthday trivia", body: "Someone finds the day of the week they were born and their age in days." },
          { title: "Insurance quotes", body: "An applicant confirms age on a policy's start date." },
          { title: "Genealogy", body: "A family historian works out an ancestor's age at a recorded event." },
        ],
      }}
      dataSection={{
        heading: "How chronological age is calculated",
        paragraphs: [
          "The page counts the most whole months from the birth date that do not pass the second date, shows them as years and months, then counts the remaining days. When a birth date falls on the 29th, 30th or 31st, a month added to it lands on the last day of a shorter month (31 January + 1 month = 28 February).",
          "Totals: months = years × 12 + months; weeks and days are whole calendar days divided out. Decimal years = days ÷ 365.2425, the average Gregorian year.",
          "Limits: some standardised test manuals give their own borrowing rule, for example treating every month as 30 days, and their own rounding of days to months. Those can differ from this page by a day or two; when scoring a test, follow the manual. A 29 February birthday falls on 28 February in common years here.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "What is chronological age?", answer: "A person's exact age measured from their date of birth to a given date, usually written in years, months and days." },
        { question: "How do you write chronological age?", answer: "Often as years;months;days, for example 8;4;12 for 8 years, 4 months and 12 days." },
        { question: "How do test manuals calculate it?", answer: "Many subtract the birth date from the test date column by column, borrowing 12 months for a year and 30 days for a month. Check your manual's rule; the result can differ from the calendar method by a day or two." },
        { question: "What if the person was born on 29 February?", answer: "In common years the birthday is taken as 28 February, a widely used convention. Some laws use 1 March instead." },
        { question: "Can I get age on a past or future date?", answer: "Yes. Set the second date to any date after the birth date." },
        { question: "How is the next birthday counted?", answer: "As whole days from the age-at date to the next anniversary of the birth date." },
      ]}
    >
      <ChronologicalAgeTool />
    </ToolPageLayout>
  );
}
