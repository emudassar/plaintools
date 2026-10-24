import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import TakeHomeTool from "@/components/TakeHomeTool";
import { requireTool } from "@/config/tools";

const SLUG = "take-home-pay-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Take-Home Pay Calculator 2026: Paycheck After Tax by State",
  description:
    "Enter your salary and state and get 2026 take-home pay per paycheck after federal income tax, Social Security, Medicare and state income tax, with each line shown.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function TakeHomePayCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to estimate your take-home pay",
        steps: [
          { name: "Enter gross yearly pay", text: "Salary, or hourly rate × hours × weeks." },
          { name: "Pick your state and filing status", text: "Single or married filing jointly." },
          { name: "Add pre-tax deductions", text: "401(k) or 403(b) and section 125 health deductions, per year." },
          { name: "Choose how often you are paid", text: "The result shows each paycheck and the year." },
        ],
      }}
      uses={{
        heading: "10 decisions a take-home pay estimate helps with",
        items: [
          { title: "Comparing job offers in two states", body: "A nurse weighing an offer in Texas against one in California sees the state tax difference on the same salary." },
          { title: "Budgeting for rent", body: "A new graduate works out monthly take-home pay before signing a lease." },
          { title: "Raise or promotion", body: "An employee sees how much of a $5,000 raise reaches the bank account." },
          { title: "Moving states", body: "A remote worker relocating from New York to Florida estimates the change in pay." },
          { title: "401(k) contribution choices", body: "Someone sees how raising retirement contributions changes each paycheck." },
          { title: "Second household income", body: "A couple filing jointly estimates combined take-home pay." },
          { title: "Checking a first paycheck", body: "A new hire compares the estimate with their first pay stub." },
          { title: "Salary negotiation", body: "A candidate works out the gross salary needed for a target monthly income." },
          { title: "Loan applications", body: "Someone estimates net monthly income before applying for a mortgage." },
          { title: "Part-time to full-time", body: "A worker sees take-home pay at full-time hours." },
        ],
      }}
      dataSection={{
        heading: "Where the tax figures come from, and what is left out",
        paragraphs: [
          "Federal income tax uses the 2026 standard deduction ($16,100 single, $32,200 married filing jointly) and brackets from the IRS release on 2026 inflation adjustments, including the One, Big, Beautiful Bill amendments. Social Security is 6.2% of wages up to the 2026 wage base of $184,500 and Medicare 1.45% of all wages (IRS Topic 751); Additional Medicare tax of 0.9% applies above $200,000 single or $250,000 joint (IRS Topic 560).",
          "State income tax uses the Tax Foundation's 2026 table of state brackets, standard deductions and personal exemptions or exemption credits, applied to wages after your pre-tax deductions. 401(k)/403(b) contributions reduce income tax but not Social Security and Medicare; section 125 deductions reduce both.",
          "Limits: this is an estimate. It does not apply tax credits (child tax credit, earned income credit and others), itemized deductions, local income taxes, state disability or paid-leave payroll taxes, or the phase-outs and special rules in the Tax Foundation table's footnotes. Withholding on your payslip follows your Form W-4 and can differ from the tax you finally owe. Do not use it to file a tax return.",
        ],
        sources: [
          { label: "IRS — 2026 inflation adjustments", href: "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill" },
          { label: "IRS — Topic 751, Social Security and Medicare withholding", href: "https://www.irs.gov/taxtopics/tc751" },
          { label: "IRS — Topic 560, Additional Medicare tax", href: "https://www.irs.gov/taxtopics/tc560" },
          { label: "Tax Foundation — 2026 State Income Tax Rates and Brackets", href: "https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/" },
        ],
      }}
      faqs={[
        { question: "How is take-home pay calculated?", answer: "Gross pay minus pre-tax deductions, federal income tax, Social Security, Medicare and state (and sometimes local) income tax." },
        { question: "What is the 2026 standard deduction?", answer: "$16,100 for single filers and $32,200 for married couples filing jointly, per the IRS." },
        { question: "Which states have no income tax on wages?", answer: "Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas and Wyoming. Washington taxes capital gains only." },
        { question: "Does a 401(k) lower my taxes?", answer: "Traditional 401(k) contributions lower federal and most state income tax, but Social Security and Medicare are still charged on them." },
        { question: "What is the Social Security wage base for 2026?", answer: "$184,500. Wages above that are not charged the 6.2% Social Security tax." },
        { question: "Why is my paycheck different from this estimate?", answer: "Withholding follows your W-4, benefits deductions, local taxes and credits, which this page does not see." },
        { question: "Does it work for married couples?", answer: "Choose married filing jointly and enter the household's combined wages." },
      ]}
    >
      <TakeHomeTool />
    </ToolPageLayout>
  );
}
