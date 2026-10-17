import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PtoAccrualTool from "@/components/PtoAccrualTool";
import { requireTool } from "@/config/tools";
import { DOL_URL } from "@/lib/pto-accrual";

const SLUG = "pto-accrual-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "PTO Accrual Calculator: Hours per Paycheck and Balance",
  description:
    "Enter a fixed yearly PTO allowance or a 1-hour-per-X-hours policy, your hours and pay schedule, and get the PTO earned each paycheck, per hour worked, per year, and your future balance with a cap.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PtoAccrualPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate PTO accrual",
        steps: [
          { name: "Pick the policy type", text: "A fixed number of hours a year, or one hour earned for every X hours worked." },
          { name: "Enter your hours and pay schedule", text: "Hours worked per week and how often you are paid." },
          { name: "Add a cap if your policy has one", text: "Accrual stops while the balance sits at the cap." },
          { name: "Project the balance", text: "Enter your current balance, the pay periods ahead and the hours you plan to take." },
        ],
      }}
      uses={{
        heading: "10 situations where a PTO accrual calculator helps",
        items: [
          { title: "Checking a paystub", body: "If your stub shows 3.08 hours a period and the policy says 80 hours a year on a biweekly schedule, the figures agree." },
          { title: "Planning a long trip", body: "Project how many pay periods it takes to save the hours for a two-week vacation." },
          { title: "Avoiding the cap", body: "See the pay period where accrual stops, so you can take time before earning stops." },
          { title: "Comparing job offers", body: "Turn '15 days a year' and '1 hour per 25 worked' into the same unit." },
          { title: "Part-time hours", body: "Per-hour policies give part-time staff fewer hours; enter actual weekly hours to see how many." },
          { title: "Writing a small-business policy", body: "Test what a proposed rate costs per employee per year before putting it in a handbook." },
          { title: "Payroll setup", body: "Get the per-period figure to type into a payroll system." },
          { title: "Leaving a job", body: "Estimate the balance on your last day to compare with the final paycheck." },
          { title: "Switching pay frequency", body: "Moving from biweekly to semimonthly changes the per-paycheck figure but not the yearly total." },
          { title: "Converting hours to days", body: "Change the workday length for 10-hour or 12-hour shifts." },
        ],
      }}
      dataSection={{
        heading: "How the accrual is worked out",
        paragraphs: [
          "There is no federal accrual rate to apply. The U.S. Department of Labor's Vacation Leave page states that the Fair Labor Standards Act does not require payment for time not worked, such as vacations, and that such benefits are matters of agreement between an employer and an employee. Every rate on this page is therefore the one you enter from your own policy.",
          "For a yearly allowance, accrual per pay period is the yearly hours divided by the number of pay periods (52 weekly, 26 every two weeks, 24 twice a month, 12 monthly). For a per-hour policy, yearly accrual is weekly hours × 52 divided by the hours needed to earn one hour. The projection adds one period's accrual at a time, holds the balance at the cap if you entered one, and subtracts the hours you plan to take spread evenly over the period.",
          "Limits: real policies often add rules this page does not model — waiting periods for new hires, overtime excluded from accrual, carry-over limits at year end, payout rules at separation, and front-loading on January 1. Several states and cities require paid sick leave with their own accrual rates and caps; this page does not check them.",
          "Everything runs in your browser; nothing is sent or stored. For a dispute about pay, the written policy and your state labor department are the authorities, not this calculator.",
        ],
        sources: [{ label: "U.S. Department of Labor — Vacation Leave", href: DOL_URL, note: "FLSA does not require paid vacation; it is a matter of agreement" }],
      }}
      faqs={[
        { question: "How do I calculate PTO accrual per pay period?", answer: "Divide the yearly PTO hours by the number of pay periods. 80 hours a year paid every two weeks is 80 ÷ 26 = 3.08 hours per paycheck." },
        { question: "What does '1 hour for every 30 hours worked' come to in a year?", answer: "At 40 hours a week, 2,080 hours ÷ 30 = 69.3 hours a year, or about 8.7 eight-hour days." },
        { question: "Is my employer required to give PTO?", answer: "Not under federal law: the DOL says the FLSA does not require payment for time not worked such as vacations. Some states and cities require paid sick leave; check your state labor department." },
        { question: "What happens when I hit the cap?", answer: "In the projection, accrual stops while the balance is at the cap and resumes once hours are used. Check how your own policy words it." },
        { question: "Why does my paystub differ by a few hundredths?", answer: "Payroll systems round each period's accrual, often to two decimals, so totals can drift slightly from the exact figure." },
        { question: "Can I enter days instead of hours?", answer: "Convert days to hours first using your workday length; the result is also shown in days." },
      ]}
    >
      <PtoAccrualTool />
    </ToolPageLayout>
  );
}
