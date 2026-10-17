import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import WallpaperTool from "@/components/WallpaperTool";
import { requireTool } from "@/config/tools";
import { DUNLOP_URL } from "@/lib/wallpaper";

const SLUG = "wallpaper-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Wallpaper Calculator: How Many Rolls Do I Need? (With Repeat)",
  description:
    "Enter your wall widths, height, roll width and length and the pattern repeat and get the drops you need, how many full drops each roll gives, and the number of rolls to buy, using a wallpaper maker's method.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function WallpaperPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate wallpaper rolls",
        steps: [
          { name: "Measure each wall", text: "Corner to corner; treat doors and windows as wall." },
          { name: "Measure the height", text: "The height you'll paper." },
          { name: "Read the label", text: "Roll width, roll length and pattern repeat (0 for random match)." },
          { name: "Add trim and allowance", text: "A trim allowance for top and bottom, and a percentage for waste." },
          { name: "Read drops and rolls", text: "Drops needed, full drops per roll, and rolls to buy." },
        ],
      }}
      uses={{
        heading: "10 situations where a wallpaper calculator helps",
        items: [
          { title: "Ordering a whole batch at once", body: "Rolls from different batches can differ slightly in colour; order enough the first time." },
          { title: "Large pattern repeats", body: "A big repeat wastes paper on every drop; see how many drops a roll really gives." },
          { title: "Accent wall", body: "One wall's drops and rolls." },
          { title: "Comparing papers", body: "Change the repeat and roll size to compare two designs' cost." },
          { title: "US and European rolls", body: "Work in feet and inches or metres and centimetres." },
          { title: "Tall rooms", body: "A taller wall can drop a roll from three drops to two." },
          { title: "Random match papers", body: "Set the repeat to 0 for papers that don't need matching." },
          { title: "Checking a decorator's quote", body: "Compare their roll count with yours." },
          { title: "Ceilings and stairwells", body: "Enter the strip widths and the length of each drop." },
          { title: "Budgeting", body: "Rolls × price per roll before you shop." },
        ],
      }}
      dataSection={{
        heading: "Where the method comes from",
        paragraphs: [
          "The method follows the wallpaper and textile maker James Dunlop's guide 'How to calculate wallpaper requirements'. Divide each wall's width by the roll width to get the drops (widths) for that wall, counting part-widths as full widths, because paper shouldn't be turned fully into a corner. Each drop's length is the height plus a trim allowance (their example uses 30 cm, 15 cm top and bottom) plus the pattern repeat; for random or free-match papers no repeat is added. Divide the roll length by the drop length and count only full drops. Rolls = drops needed ÷ drops per roll.",
          "James Dunlop's worked example is reproduced exactly: a 3.5 m wall with 52 cm paper needs 7 drops; at 2.5 m high with a 52 cm repeat each drop is 3.32 m, so a 10 m roll gives 3 full drops. They recommend adding 10% (up to a full roll) for pattern matches up to 26 cm, and 15–20% above that. They also recommend treating walls with doors and windows as full walls.",
          "Limits: pattern match type, very out-of-square walls and unusual rooms can use more. Buy all rolls from the same batch. Everything runs in your browser.",
        ],
        sources: [{ label: "James Dunlop Textiles — How to calculate wallpaper requirements", href: DUNLOP_URL, note: "Drops, drop length with trim and repeat, drops per roll, allowance" }],
      }}
      faqs={[
        { question: "How do I calculate how many rolls of wallpaper I need?", answer: "Count the drops (wall width ÷ roll width, rounded up), work out how many full drops one roll gives (roll length ÷ (height + trim + repeat), rounded down), and divide." },
        { question: "How does pattern repeat affect it?", answer: "Each drop has to be cut long enough to match the pattern, so a larger repeat means fewer drops per roll and more rolls." },
        { question: "Should I subtract doors and windows?", answer: "James Dunlop recommends treating them as full wall, because cutting around them uses about as much paper." },
        { question: "How much extra should I buy?", answer: "James Dunlop suggests 10% for repeats up to 26 cm and 15–20% above that; the page applies the percentage you enter." },
        { question: "How big is a roll of wallpaper?", answer: "It varies — read the label. James Dunlop's rolls are 10 m long and 52 or 72 cm wide; US rolls are often given in feet." },
        { question: "What is a random match?", answer: "A paper with no pattern to line up, so no repeat is added to each drop. Enter 0 for the repeat." },
      ]}
    >
      <WallpaperTool />
    </ToolPageLayout>
  );
}
