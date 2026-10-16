import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BaseboardTool from "@/components/BaseboardTool";
import { requireTool } from "@/config/tools";

const SLUG = "baseboard-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Baseboard Calculator: Linear Feet, Pieces and Cost",
  description:
    "Enter the room size or wall lengths, doorways and stock length and get the linear feet of baseboard, how many 8, 12 or 16 ft pieces to buy with your waste allowance, and the cost.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function BaseboardCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out how much baseboard you need",
        steps: [
          { name: "Measure the walls", text: "Enter a rectangular room's length and width, or list each wall run in feet." },
          { name: "Count the doorways", text: "Enter the number of openings and their width; baseboard stops at the casing." },
          { name: "Choose the stock length", text: "The length of the pieces you will buy — commonly 8, 12 or 16 ft." },
          { name: "Set a waste allowance", text: "Your own percentage for miters, scarf joints and mistakes." },
          { name: "Read the pieces and cost", text: "Net feet, feet with allowance, pieces rounded up, and cost if you enter a price." },
        ],
      }}
      uses={{
        heading: "10 situations where a baseboard calculator helps",
        items: [
          { title: "One trip to the store", body: "Buy the right number of pieces the first time instead of running short on the last wall." },
          { title: "Comparing 8 ft and 16 ft stock", body: "Longer pieces mean fewer joints; the count shows the trade-off in pieces and cost." },
          { title: "Pricing a flooring job", body: "New floors usually mean new baseboard; the linear feet go straight into a quote." },
          { title: "Whole-house trim estimates", body: "List every wall run to total a house's baseboard." },
          { title: "L-shaped and irregular rooms", body: "The wall-list mode takes any number of runs." },
          { title: "Budgeting expensive profiles", body: "Hardwood or tall profiles are priced per foot; the cost line shows the total." },
          { title: "Checking a contractor's materials list", body: "Compare their footage with your own measurement." },
          { title: "Spotting walls that need a joint", body: "The result counts walls longer than one stock piece." },
          { title: "Quarter round and shoe molding", body: "The same footage applies to shoe or quarter round along the base." },
          { title: "Rental turnovers", body: "Repeatable rooms can be estimated once and reused." },
        ],
      }}
      dataSection={{
        heading: "How the numbers are worked out",
        paragraphs: [
          "This is plain arithmetic with no outside data. The page adds up the wall lengths (for a rectangular room, 2 × (length + width)), subtracts the number of doorways times their width, and adds your waste allowance as a percentage. Dividing by the stock length and rounding up gives the number of pieces; the cost is pieces × price per piece, or pieces × stock length × price per foot.",
          "The waste allowance is your own figure. There is no published standard for it, and how much you need depends on the number of corners, the joints you accept and how the pieces cut.",
          "Everything runs in your browser; nothing is sent or stored.",
          "Limits: the piece count assumes offcuts can be used elsewhere in the room. A room with many short returns, or a rule of no joints on a wall, can need more pieces. The page does not lay out cuts, account for outside corners, or check that a profile is in stock in the length you chose.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I calculate baseboard for a room?", answer: "Add the wall lengths (2 × (length + width) for a rectangle), subtract the doorway widths, add a waste allowance and divide by the length of the pieces you'll buy, rounding up." },
        { question: "How much baseboard for a 12 × 12 room?", answer: "The walls total 48 ft. With one 3 ft doorway that is 45 ft net; with a 10% allowance, 49.5 ft — four 16 ft pieces or seven 8 ft pieces." },
        { question: "Should I subtract doorways?", answer: "Baseboard stops at the door casing, so doorways are subtracted. Closet openings with no baseboard across them are too." },
        { question: "How much extra should I buy?", answer: "That is your call — the page uses whatever percentage you enter. Rooms with many corners and joints use more." },
        { question: "8 ft, 12 ft or 16 ft pieces?", answer: "Longer pieces mean fewer joints on long walls but are harder to transport. Enter each stock length to compare the piece count." },
        { question: "Does it work in metres?", answer: "Enter all lengths in the same unit and read the results in that unit; only the labels say feet." },
      ]}
    >
      <BaseboardTool />
    </ToolPageLayout>
  );
}
