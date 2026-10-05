import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CashDrawerTool from "@/components/CashDrawerTool";
import { requireTool } from "@/config/tools";

const SLUG = "cash-drawer-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Cash Drawer Calculator: Count, Deposit and Over/Short",
  description:
    "Count a cash drawer by bills, rolls and coins, then see the deposit that leaves your starting float, exactly which notes and coins to pull, and whether the drawer is over or short.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function CashDrawerCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to count a cash drawer",
        steps: [
          { name: "Count each denomination", text: "Enter how many of each bill, roll and loose coin are in the drawer." },
          { name: "Enter the starting float", text: "Type the amount the drawer should start the next shift with, such as $150." },
          { name: "Add the register's cash figure", text: "Optionally enter the expected cash sales from the register or POS report to see if the drawer is over or short." },
          { name: "Pull the deposit", text: "The table lists how many of each denomination to pull so exactly the float stays behind." },
        ],
      }}
      uses={{
        heading: "10 situations where a cash drawer calculation helps",
        items: [
          { title: "Closing a register at the end of a shift", body: "A cashier counts once, gets the total and deposit, and avoids a recount when the numbers don't add up." },
          { title: "Leaving the right float for the morning", body: "The pull list leaves the exact starting bank so the opening cashier isn't short of change." },
          { title: "Finding an over or short", body: "Comparing the count with the register's expected cash shows the discrepancy before the manager signs off." },
          { title: "Preparing a bank deposit slip", body: "The deposit total and denomination breakdown are what the slip asks for." },
          { title: "Counting a till for a market stall or event", body: "Volunteers at a fundraiser can balance the cash box against the starting float." },
          { title: "Training new cashiers", body: "The arithmetic is shown, so a trainee can check their own count." },
          { title: "Handling rolled coin", body: "Rolls are counted as rolls at their U.S. Mint contents, without breaking them open." },
          { title: "Swapping drawers mid-shift", body: "A quick count of the outgoing drawer confirms what is handed over." },
          { title: "Checking a petty cash box", body: "Enter the fund's imprest amount as the float to see what has been spent." },
          { title: "Spotting when exact change can't be left", body: "If the drawer's mix can't make the deposit exactly, the tool says by how much, so change can be made from the safe." },
        ],
      }}
      dataSection={{
        heading: "How the count works",
        paragraphs: [
          "Everything is whole-cent arithmetic: each count is multiplied by its value and added up. The deposit is the total minus the starting float, and over/short is the total minus the float and the expected cash from your register report.",
          "Rolled coin uses the contents the U.S. Mint gives: 40 quarters, 50 dimes, 40 nickels and 50 pennies per roll — $10, $5, $2 and $0.50. Half dollars and dollar coins are counted loose only.",
          "To build the pull list the tool takes $20 notes and larger first, then searches for an exact combination of the remaining notes, rolls and coins. Simply taking the biggest pieces first can fail even when an exact mix exists, so if no exact mix is possible the tool says how far off the deposit is rather than pretending.",
          "Limits: the result is only as good as the count. It doesn't know your store's float or cash-handling policy, and nothing you type is stored or sent anywhere.",
        ],
        sources: [
          { label: "U.S. Mint — Coin Count 'n' Roll", href: "https://kids.usmint.gov/resources/coin-activities/coin-count-n-roll", note: "40 quarters, 50 dimes, 40 nickels, 50 pennies per roll" },
        ],
      }}
      faqs={[
        { question: "How do you count a cash drawer?", answer: "Count each denomination, multiply by its value and add them up. Subtract the starting float to get the deposit, and compare with the register's expected cash to find any over or short." },
        { question: "What is a starting float or bank?", answer: "The fixed amount of change a drawer starts each shift with. It stays in the drawer; everything above it goes in the deposit." },
        { question: "How do I work out if my drawer is over or short?", answer: "Over/short = counted cash − (starting float + expected cash sales). A positive number is over, a negative one is short." },
        { question: "How many coins are in a roll?", answer: "The U.S. Mint gives 40 quarters ($10), 50 dimes ($5), 40 nickels ($2) and 50 pennies ($0.50) per roll." },
        { question: "Which notes should I take out for the deposit?", answer: "Usually the largest, leaving smaller notes and coin for change. The calculator pulls large notes first and then finds an exact mix for the rest." },
        { question: "What if I can't leave the exact float?", answer: "If the notes and coins in the drawer can't make the deposit exactly, the tool shows the closest pull and the amount still unmatched." },
      ]}
    >
      <CashDrawerTool />
    </ToolPageLayout>
  );
}
