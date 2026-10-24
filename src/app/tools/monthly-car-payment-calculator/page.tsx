import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CarPaymentTool from "@/components/CarPaymentTool";
import { requireTool } from "@/config/tools";

const SLUG = "monthly-car-payment-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Monthly Car Payment Calculator with Tax, Trade-In and APR",
  description:
    "Enter the car price, down payment, trade-in, sales tax, fees, APR and loan term and get your monthly car payment, total interest and a year-by-year schedule.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function MonthlyCarPaymentCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate a monthly car payment",
        steps: [
          { name: "Enter the price and money down", text: "Vehicle price, cash down payment and trade-in value." },
          { name: "Add tax and fees", text: "Your sales tax rate and any fees rolled into the loan." },
          { name: "Enter APR and term", text: "The loan's annual percentage rate and length in months." },
          { name: "Read the payment", text: "Monthly payment, total interest, other terms compared and a yearly schedule." },
        ],
      }}
      uses={{
        heading: "10 decisions a car payment calculation helps with",
        items: [
          { title: "Setting a budget before the dealership", body: "A buyer works out the most car a $450 monthly payment covers." },
          { title: "Comparing loan terms", body: "Someone sees how much more interest a 72-month loan costs than a 48-month one." },
          { title: "Dealer financing versus a credit union", body: "A buyer compares the payment at two different APRs." },
          { title: "How much to put down", body: "A buyer sees how an extra $2,000 down changes the payment." },
          { title: "Trade-in value", body: "Someone checks what their trade-in is worth in monthly terms." },
          { title: "Used car purchases", body: "A first-time buyer prices a used car loan." },
          { title: "Refinancing", body: "An owner enters the remaining balance and a new APR to compare payments." },
          { title: "Lease versus buy", body: "A shopper gets the buy-side payment to compare with a lease quote." },
          { title: "Checking a contract", body: "A buyer checks the payment on the paperwork against their own figures." },
          { title: "0% APR offers", body: "Someone compares a 0% deal with a cash rebate and a normal APR." },
        ],
      }}
      dataSection={{
        heading: "How the payment is calculated",
        paragraphs: [
          "The amount financed is price + sales tax + fees − down payment − trade-in. Sales tax is on the price after the trade-in when the box is ticked (many states), or on the full price when it is not.",
          "The monthly payment uses the standard amortizing-loan formula: payment = P × r ÷ (1 − (1 + r)^−n), where P is the amount financed, r the APR ÷ 12 and n the number of months. At 0% APR the payment is P ÷ n. The schedule applies each payment to that month's interest first.",
          "Limits: lenders may differ by a few cents through rounding, first-payment timing and daily interest. Insurance, warranties, gap coverage and add-ons are not included. The APR you are offered depends on the lender.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How is a car payment calculated?", answer: "With the amortizing loan formula: payment = P × r ÷ (1 − (1 + r)^−n), using the amount financed, monthly interest rate and number of months." },
        { question: "What is the payment on a $30,000 car loan at 6% for 60 months?", answer: "About $579.98 a month." },
        { question: "Does a longer loan lower the payment?", answer: "Yes, but it raises the total interest. The term comparison table shows both." },
        { question: "Is sales tax included in the loan?", answer: "Here it is added to the amount financed. Some buyers pay it up front instead." },
        { question: "Does a trade-in reduce sales tax?", answer: "In many states the tax is charged on the price minus the trade-in; in some it is not. Use the checkbox." },
        { question: "What is APR?", answer: "The annual percentage rate: the yearly cost of the loan, including interest and some fees, as a percentage." },
      ]}
    >
      <CarPaymentTool />
    </ToolPageLayout>
  );
}
