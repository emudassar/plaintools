import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GoldPriceTool from "@/components/GoldPriceTool";
import { requireTool } from "@/config/tools";

const SLUG = "gold-price-per-gram";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Gold Price per Gram Today (24k, 22k, 18k, 14k) in Your Currency",
  description:
    "Live gold and silver spot price per gram, tola and ounce for 24k, 22k, 21k, 18k, 14k and sterling silver, converted to your city's currency — USD, PKR, INR, AED and more.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function GoldPricePerGramPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to see today's gold price per gram",
        steps: [
          { name: "Pick gold or silver", text: "Then the purity: 24k, 22k, 18k, 14k, or sterling." },
          { name: "Pick your city or currency", text: "Karachi, Mumbai, Dubai, London, New York and many more." },
          { name: "Optional: enter a weight", text: "In grams, tola, troy ounces or kilograms." },
          { name: "Read the price", text: "Per gram, tola and ounce for every purity." },
        ],
      }}
      uses={{
        heading: "10 reasons to check the gold price per gram",
        items: [
          { title: "Selling old jewellery", body: "Someone checks the metal value of a 14k chain before visiting a buyer." },
          { title: "Buying wedding jewellery", body: "A family in Lahore checks the 22k price per tola before shopping." },
          { title: "Comparing shop prices", body: "A buyer in Dubai compares a shop's rate with the spot value." },
          { title: "Zakat calculation", body: "Someone checks the value of the gold they hold." },
          { title: "Scrap silver", body: "A collector values sterling silver cutlery by weight." },
          { title: "Gifts", body: "A relative prices a gold coin gift in rupees." },
          { title: "Insurance", body: "An owner records the metal value of jewellery." },
          { title: "Investment tracking", body: "A saver tracks the value of bullion in their own currency." },
          { title: "Pawn loans", body: "A borrower checks the metal value before a pawn loan." },
          { title: "School projects", body: "A student compares gold and silver prices." },
        ],
      }}
      dataSection={{
        heading: "Where the price comes from",
        paragraphs: [
          "The spot price in US dollars per troy ounce comes live from gold-api.com. Currency conversion uses the open exchange rates from ExchangeRate-API, which update once a day. The page converts: price per gram = spot ÷ 31.1034768 × exchange rate × purity.",
          "Purity is karat ÷ 24 (22k = 91.7%, 18k = 75%, 14k = 58.3%); sterling silver is 92.5%. A troy ounce is 31.1034768 g (NIST Handbook 44); a tola is 11.6638 g (180 grains).",
          "Limits: this is the value of the pure metal content at the international spot price. Jewellers' selling prices add a premium and making charges, buyers pay below spot, and local taxes are extra, so a city's posted rate differs from this figure. Spot prices move constantly. Do not use the page as a trading price.",
        ],
        sources: [
          { label: "gold-api.com", href: "https://gold-api.com/" },
          { label: "ExchangeRate-API (open access)", href: "https://www.exchangerate-api.com/docs/free" },
          { label: "NIST Handbook 44", href: "https://www.nist.gov/pml/owm/nist-handbook-44-current-edition" },
          { label: "Wikipedia — Tola (unit)", href: "https://en.wikipedia.org/wiki/Tola_(unit)" },
        ],
      }}
      faqs={[
        { question: "What is the gold price per gram today?", answer: "The page shows it live at the top for the purity and currency you pick." },
        { question: "How is the price per gram worked out from the ounce price?", answer: "Divide the price per troy ounce by 31.1034768." },
        { question: "What is the 14k gold price per gram?", answer: "The 24k price × 14 ÷ 24, about 58.3% of pure gold's value." },
        { question: "How many grams are in a tola?", answer: "11.6638 grams." },
        { question: "Why is the shop rate in my city different?", answer: "Shops add a premium, making charges and taxes to the spot value, and their buying price is below spot." },
        { question: "How often does the price update?", answer: "The spot price is fetched each time you load or refresh; exchange rates update once a day." },
        { question: "What is 22k gold?", answer: "Gold that is 22 parts in 24 pure, or 91.7%." },
      ]}
    >
      <GoldPriceTool />
    </ToolPageLayout>
  );
}
