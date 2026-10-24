import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import HoursWorkedTool from "@/components/HoursWorkedTool";
import { requireTool } from "@/config/tools";

const SLUG = "hours-worked-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Hours Worked Calculator: Weekly Timesheet with Overtime",
  description:
    "Enter start and end times and unpaid breaks for each day and get total hours worked in hours and minutes and decimal, overtime over 40 hours, and gross pay.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HoursWorkedCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate hours worked in a week",
        steps: [
          { name: "Enter each day's start and end", text: "Use 9:00 AM, 9am or 09:00. Leave days off blank." },
          { name: "Add unpaid breaks", text: "Minutes of unpaid lunch or breaks each day." },
          { name: "Set pay and overtime", text: "Optional hourly rate; 40-hour threshold and 1.5× multiplier by default." },
          { name: "Read the totals", text: "Hours per day, weekly total, regular and overtime hours, and gross pay." },
        ],
      }}
      uses={{
        heading: "10 reasons to add up hours worked",
        items: [
          { title: "Checking a paycheck", body: "An hourly worker compares their own total with the hours on the pay stub." },
          { title: "Filling in a paper timesheet", body: "A part-time worker converts clock times into decimal hours for the form." },
          { title: "Overnight shifts", body: "A security guard working 10 PM to 6 AM gets the right total across midnight." },
          { title: "Freelance invoicing", body: "A contractor adds up the week's hours before billing a client." },
          { title: "Overtime disputes", body: "A worker sees how many hours went over 40 in a workweek." },
          { title: "Small business payroll", body: "An owner checks an employee's weekly hours before running payroll." },
          { title: "Babysitters and caregivers", body: "A nanny totals the week's hours to bill a family." },
          { title: "Second jobs", body: "Someone working two jobs tracks hours at each." },
          { title: "Unpaid lunch deductions", body: "A worker sees how much a 30-minute unpaid break takes off each day." },
          { title: "Planning a schedule", body: "A manager checks a draft rota stays under the overtime threshold." },
        ],
      }}
      dataSection={{
        heading: "How the hours and overtime are worked out",
        paragraphs: [
          "Each day's hours are end time minus start time, plus 24 hours if the shift crosses midnight, minus the unpaid break. Days are added for the weekly total, shown in hours and minutes and as decimal hours.",
          "Overtime is the hours over the weekly threshold. Under the federal Fair Labor Standards Act, covered non-exempt employees must be paid at least one and a half times the regular rate for hours over 40 in a workweek (U.S. Department of Labor, Fact Sheet #23). The threshold and multiplier are inputs because some states and contracts differ.",
          "Limits: gross pay before tax. Daily overtime rules (such as California's), double time, exemptions, paid breaks and punch-rounding policies are not applied. The page does not decide whether overtime is owed.",
        ],
        sources: [
          { label: "U.S. DOL — Fact Sheet #23: Overtime Pay Requirements of the FLSA", href: "https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime" },
        ],
      }}
      faqs={[
        { question: "How do I calculate hours worked?", answer: "End time minus start time, minus unpaid breaks, for each day, then add the days." },
        { question: "How do I convert minutes to decimal hours?", answer: "Divide by 60: 45 minutes is 0.75 hours, 30 minutes is 0.5." },
        { question: "How are overnight shifts handled?", answer: "If the end time is earlier than the start time, the shift is counted as crossing midnight." },
        { question: "When does overtime start?", answer: "Under the federal FLSA, after 40 hours in a workweek for covered non-exempt employees. Some states add daily rules." },
        { question: "Is overtime always 1.5 times pay?", answer: "Federal law sets at least 1.5 times the regular rate; employers and states can require more." },
        { question: "Are breaks paid?", answer: "Enter only unpaid breaks. Under federal rules, short breaks are generally counted as work time, while bona fide meal periods usually are not." },
      ]}
    >
      <HoursWorkedTool />
    </ToolPageLayout>
  );
}
