import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import HoneyProductionTool from "@/components/HoneyProductionTool";
import { requireTool } from "@/config/tools";

const SLUG = "honey-production-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Honey Production Calculator: Pounds and Value by State (USDA 2025)",
  description:
    "Estimate an apiary's honey production and its value from the number of colonies and USDA's 2025 yield per colony and honey price for your state — or your own yield and price.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HoneyProductionCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to estimate honey production",
        steps: [
          { name: "Pick your state", text: "Choose one of the 20 states USDA publishes, 'Other States', or the U.S. average." },
          { name: "Enter your colonies", text: "Type the number of colonies you expect to harvest from." },
          { name: "Use the state yield or your own", text: "Leave the yield blank to use USDA's 2025 pounds per colony for that state, or enter your own records." },
          { name: "Choose a price", text: "Value the crop at the state's average price, the U.S. wholesale or retail price, or your own price." },
        ],
      }}
      uses={{
        heading: "10 situations where a honey production estimate helps",
        items: [
          { title: "Writing a beekeeping business plan", body: "A lender wants a production figure with a source; colonies × the state's USDA yield gives one." },
          { title: "Deciding how many colonies to run", body: "See how production and value scale as colonies are added." },
          { title: "Comparing states", body: "USDA's 2025 yields range from 27 lb per colony in Oregon to 89 in Mississippi." },
          { title: "Valuing a crop wholesale vs retail", body: "USDA's 2025 U.S. price was $2.45 per pound wholesale and $7.15 retail — the same crop, a very different value." },
          { title: "Budgeting buckets and drums", body: "The gallon figure says how much storage a season needs." },
          { title: "Checking your own yield", body: "Enter your records and compare the value with the state average." },
          { title: "Insurance or loss claims", body: "A state average from USDA is a documented reference point." },
          { title: "Teaching agricultural economics", body: "Students can see how yield and price multiply into value." },
          { title: "Planning a farmers' market season", body: "Estimate how much honey there will be to sell." },
          { title: "Talking to a landowner about hive placement", body: "Show what a set of colonies might produce on their land." },
        ],
      }}
      dataSection={{
        heading: "Where the numbers come from",
        paragraphs: [
          "Yields and prices come from USDA's National Agricultural Statistics Service report 'Honey', released March 13, 2026, which covers the 2025 crop. Its state table gives honey-producing colonies, yield per colony, production and average price per pound for 20 states, 'Other States' combined, and the United States: in 2025, 2.41 million colonies averaged 48.0 pounds each for 116 million pounds, at an average $3.05 per pound.",
          "The report's U.S. price by marketing channel gives $2.45 per pound for co-op and private sales and $7.15 for retail in 2025. NASS notes that colonies producing honey in more than one state were counted in each state, so the U.S. yield per colony may be understated, and that only colonies from which honey was harvested are counted.",
          "Production = colonies × yield per colony; value = production × price; gallons use the National Honey Board's figure of about 12 pounds per gallon. Nothing you enter leaves your browser.",
          "Limits: these are one year's state averages. Your own colonies may produce far more or less, and prices vary with colour class, quality and where you sell.",
        ],
        sources: [
          { label: "USDA NASS — Honey (released March 13, 2026)", href: "https://esmis.nal.usda.gov/sites/default/release-files/795818/hony0326.pdf", note: "2025 colonies, yield, production and price by state; U.S. price by channel" },
          { label: "National Honey Board — FAQ", href: "https://honey.com/faq", note: "A gallon of honey weighs approximately 12 pounds" },
        ],
      }}
      faqs={[
        { question: "How much honey does one colony produce?", answer: "USDA NASS put the 2025 U.S. average at 48.0 pounds per honey-producing colony, with state averages from 27 to 89 pounds." },
        { question: "Which state has the highest honey yield per colony?", answer: "In USDA's 2025 figures, Mississippi had the highest published yield at 89 pounds per colony, followed by Montana at 85." },
        { question: "Which state produces the most honey?", answer: "North Dakota, with 30.8 million pounds from 460,000 colonies in 2025." },
        { question: "What is honey worth per pound?", answer: "USDA's 2025 U.S. average was $3.05 per pound across all channels: $2.45 for co-op and private sales and $7.15 retail." },
        { question: "How much honey will 10 hives make?", answer: "At the 2025 U.S. average of 48.0 pounds per colony, 10 colonies would make about 480 pounds. Real yields vary a lot." },
        { question: "How is this different from the honey yield calculator?", answer: "This page estimates production from averages before the season. The honey yield calculator measures what you actually harvested by weighing your supers." },
      ]}
    >
      <HoneyProductionTool />
    </ToolPageLayout>
  );
}
