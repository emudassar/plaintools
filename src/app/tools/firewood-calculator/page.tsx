import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import FirewoodTool from "@/components/FirewoodTool";
import { requireTool } from "@/config/tools";

const SLUG = "firewood-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Firewood Calculator: Cords, Face Cords and Price per Cord",
  description:
    "Enter a woodpile's length, height and depth and get its volume in full cords (128 cubic feet), face cords and cubic metres — plus the real price per full cord when wood is sold by the face cord or rick.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function FirewoodCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to measure firewood in cords",
        steps: [
          { name: "Measure the stack", text: "Length and height of the stacked wood, in feet, inches or metres." },
          { name: "Measure the depth", text: "Usually the length of one piece — commonly 16 inches for a face cord." },
          { name: "Add identical stacks", text: "If the delivery is several stacks of the same size, enter how many." },
          { name: "Read the volume", text: "Cubic feet ÷ 128 gives full cords; the stack's face area ÷ 32 ft² gives face cords." },
          { name: "Compare prices", text: "Enter a price per face cord, per cord or for the load to see the price per full cord." },
        ],
      }}
      uses={{
        heading: "10 situations where a firewood calculator helps",
        items: [
          { title: "Checking a delivery", body: "Stack it, measure it, and see whether the cords you paid for actually arrived." },
          { title: "Comparing a face cord to a full cord", body: "A 16-inch face cord is a third of a cord; the price per full cord shows which offer is cheaper." },
          { title: "Pricing a 'rick' of wood", body: "Rick and face cord are regional terms for the same 4 × 8 ft face; the depth decides how much wood it really is." },
          { title: "Planning a winter's supply", body: "Turn a target in cords into the length of woodshed or rack you need." },
          { title: "Selling firewood", body: "Work out how many cords a stack holds before listing it, in the units states require." },
          { title: "Sizing a firewood rack", body: "A rack's length, height and depth tell you how many cords it holds." },
          { title: "Odd-sized stacks", body: "Short, long or tall stacks still convert to cords from their measurements." },
          { title: "Splitting a load between neighbours", body: "Measure each share's stack to split costs by real volume." },
          { title: "Metric buyers and sellers", body: "Cubic metres are shown alongside cords." },
          { title: "Checking an ad's wording", body: "NIST Handbook 130, as adopted by many states, says wood must be sold by the cord, fractions of a cord or the cubic metre." },
        ],
      }}
      dataSection={{
        heading: "Where the cord definition comes from",
        paragraphs: [
          "The cord is defined in NIST Handbook 130, the model weights-and-measures regulation that most US states adopt. Section 2.4 (Fireplace and Stove Wood), as reproduced in Connecticut's firewood regulations, defines a cord as 'the amount of wood that is contained in a space of 128 cubic feet when the wood is ranked and well stowed' — pieces placed in a row, touching and parallel, stacked compactly. It requires wood to be sold using the term cord and fractional parts of a cord, or the cubic metre, and says terms such as face cord, rack, pile and truckload shall not be used when advertising, offering for sale or selling wood for fuel.",
          "This page multiplies length × height × depth (× the number of stacks) to get cubic feet and divides by 128 for cords. The face-cord figure is the stack's face area divided by 32 ft² (a 4 ft × 8 ft face) at whatever depth you measured; one such face cord is depth ÷ 4 ft of a full cord — a third of a cord at 16 inches. Cubic metres use 1 ft = 0.3048 m exactly.",
          "Everything runs in your browser; nothing is sent or stored.",
          "Limits: the definition assumes tightly stacked wood. A loose, thrown pile holds less wood than its outside dimensions suggest, and the page cannot correct for gaps, crooked pieces or uneven stacks. It says nothing about moisture, species or heat output. State rules vary — some states have their own definitions — so check your state's weights-and-measures office for local requirements.",
        ],
        sources: [
          { label: "Connecticut DCP — Firewood and Stove Wood Regulations", href: "https://portal.ct.gov/dcp/food-and-standards-division/food--standards/firewood-and-stove-wood-regulations", note: "Reproduces NIST Handbook 130 section 2.4" },
          { label: "NIST Office of Weights and Measures — Handbooks", href: "https://www.nist.gov/pml/owm/owm-products-and-services/publications-and-documentary-standards/handbooks", note: "Handbook 130, current edition" },
        ],
      }}
      faqs={[
        { question: "How big is a cord of wood?", answer: "128 cubic feet of ranked and well-stowed wood — commonly a stack 4 ft high, 8 ft long and 4 ft deep, or any other dimensions with the same volume." },
        { question: "How much is a face cord?", answer: "A 4 × 8 ft face, one piece-length deep. At 16-inch pieces that is 42.7 ft³, one third of a full cord. It is not a legal sales unit under NIST Handbook 130." },
        { question: "What is a rick of wood?", answer: "A regional name for the same 4 × 8 ft face stack as a face cord. Its volume depends on piece length, so measure the depth." },
        { question: "How many face cords are in a cord?", answer: "Three at 16-inch pieces, about 2.7 at 18 inches and 4 at 12 inches — 4 ft divided by the piece length." },
        { question: "How do I compare a price per face cord with a price per cord?", answer: "Enter the face-cord price and the piece length; the page divides by the face cord's share of a full cord to give the price per full cord." },
        { question: "Does a loose pile count?", answer: "Not directly. The cord is defined for wood that is ranked and well stowed, so a thrown pile's outside measurements overstate the wood." },
        { question: "Is half a cord 64 cubic feet?", answer: "Yes — fractions of a cord are fractions of 128 cubic feet." },
      ]}
    >
      <FirewoodTool />
    </ToolPageLayout>
  );
}
