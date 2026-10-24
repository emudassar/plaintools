import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import HourlySalaryTool from "@/components/HourlySalaryTool";
import { requireTool } from "@/config/tools";

const SLUG = "hourly-to-salary-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Hourly to Salary Calculator (and Salary to Hourly)",
  description:
    "Turn an hourly wage into yearly, monthly, biweekly, weekly and daily pay for your hours and paid weeks, or a salary back into an hourly rate.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HourlyToSalaryCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert hourly pay to salary",
        steps: [
          { name: "Enter the pay", text: "An hourly rate, or a weekly, monthly or yearly amount." },
          { name: "Set hours per week", text: "40 for full time, or your own hours." },
          { name: "Set paid weeks per year", text: "52 if you are paid all year, fewer if some time off is unpaid." },
          { name: "Read every pay period", text: "Hourly, daily, weekly, every two weeks, twice a month, monthly and yearly." },
        ],
      }}
      uses={{
        heading: "10 times you need to convert hourly pay and salary",
        items: [
          { title: "Comparing an hourly and a salaried offer", body: "A worker weighs $28 an hour against a $55,000 salary." },
          { title: "Rental applications", body: "A tenant shows a landlord annual income from an hourly wage." },
          { title: "Part-time jobs", body: "A student working 20 hours a week sees yearly earnings." },
          { title: "Freelance rates", body: "A freelancer works out the hourly rate a target annual income needs." },
          { title: "Loan and credit forms", body: "An applicant converts hourly pay to monthly income." },
          { title: "Raise requests", body: "An employee sees what a $1 an hour raise is worth in a year." },
          { title: "Overtime-exempt salary", body: "A salaried worker who puts in 50 hours sees the effective hourly rate." },
          { title: "Budgeting by paycheck", body: "Someone paid biweekly sees what each check is before tax." },
          { title: "Federal pay comparisons", body: "A job seeker compares a federal salary using OPM's 2,087-hour divisor." },
          { title: "Seasonal work", body: "A worker paid for only 40 weeks a year sees the real yearly total." },
        ],
      }}
      dataSection={{
        heading: "How the conversion works",
        paragraphs: [
          "Yearly pay = hourly rate × hours per week × paid weeks per year. With 40 hours and 52 weeks that is 2,080 hours. Monthly = yearly ÷ 12; twice a month = yearly ÷ 24; every two weeks = weekly × 2.",
          "For reference, the U.S. federal government computes hourly rates by dividing annual basic pay by 2,087 hours, the average number of work hours in a year (OPM fact sheet). The page shows that figure too.",
          "Limits: gross pay before tax. Overtime, bonuses, tips and shift differentials are not included. For pay after tax, use the take-home pay calculator.",
        ],
        sources: [
          { label: "OPM — Computing hourly rates of pay using the 2,087-hour divisor", href: "https://www.opm.gov/policy-data-oversight/pay-leave/pay-administration/fact-sheets/computing-hourly-rates-of-pay-using-the-2087-hour-divisor/" },
        ],
      }}
      faqs={[
        { question: "How much is $25 an hour per year?", answer: "$52,000 at 40 hours a week for 52 weeks." },
        { question: "How do I convert salary to hourly?", answer: "Divide the yearly salary by hours worked in a year — 2,080 for 40 hours × 52 weeks." },
        { question: "How many work hours are in a year?", answer: "2,080 at 40 hours for 52 weeks. OPM uses 2,087 to average leap years." },
        { question: "What is biweekly pay?", answer: "Pay every two weeks, 26 times a year." },
        { question: "Is biweekly the same as twice a month?", answer: "No. Twice a month is 24 paychecks a year; biweekly is 26." },
        { question: "Does this include taxes?", answer: "No, it is gross pay. Use the take-home pay calculator for pay after tax." },
      ]}
    >
      <HourlySalaryTool />
    </ToolPageLayout>
  );
}
