import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import TableTopEpoxyTool from "@/components/TableTopEpoxyTool";
import { requireTool } from "@/config/tools";

const SLUG = "table-top-epoxy-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Table Top Epoxy Calculator: Gallons for Any Tabletop",
  description:
    "How much epoxy for a tabletop or bar top: enter the size, coat thickness and number of coats to get gallons, quarts and the resin/hardener split, with edges and an allowance for drips.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function TableTopEpoxyCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out epoxy for a tabletop",
        steps: [
          { name: "Enter the top's size", text: "Pick rectangle or round and enter the length and width, or the diameter, in inches, feet or centimetres." },
          { name: "Set the coats", text: "Choose the thickness of each coat (1/8 inch is the usual self-levelling flood coat) and how many coats you plan." },
          { name: "Add edges and an allowance", text: "Tick edges if the resin will run down the sides, and add a percentage for what soaks in, stays in the cup and drips off." },
          { name: "Read the quantity", text: "The result is the mixed volume in gallons, quarts, ounces and litres, split into resin and hardener at your product's ratio." },
        ],
      }}
      uses={{
        heading: "10 situations where a table top epoxy calculation helps",
        items: [
          { title: "Buying the right kit size for a dining table", body: "A 72 × 36 inch top at 1/8 inch needs about 1.4 gallons per coat, so a 1-gallon kit falls short and a second trip to the store mid-pour is avoided." },
          { title: "Coating a bar top", body: "Long, narrow bar tops have a lot of edge; including edges shows how much more resin runs down the sides." },
          { title: "Planning a seal coat plus flood coats", body: "Entering the number of coats gives the total for the whole job, not just one pour." },
          { title: "Sealing a round café table", body: "The round option uses the diameter so the area isn't overestimated as a square." },
          { title: "Pricing a commission", body: "A woodworker can turn the gallons into a materials cost before quoting a client." },
          { title: "Working in metric", body: "Enter centimetres and read litres for products sold by the litre." },
          { title: "Checking a 2:1 product", body: "Products with other ratios get the right split of resin and hardener." },
          { title: "Avoiding too-thick pours", body: "The tool flags coats thicker than the 1/4-inch maximum TotalBoat gives for a flood coat." },
          { title: "Coating a countertop or desk", body: "Any flat rectangular surface works the same way as a table." },
          { title: "Comparing one thick coat with two thin ones", body: "Changing coat thickness and count shows the volume difference straight away." },
        ],
      }}
      dataSection={{
        heading: "How the quantity is worked out",
        paragraphs: [
          "Volume = coated area × coat thickness × number of coats. The area is length × width for a rectangle or π × diameter² ÷ 4 for a round top, plus perimeter × edge height if you coat the edges. One U.S. gallon is 231 cubic inches (NIST Handbook 44, Appendix C).",
          "This reproduces a manufacturer's published figure: TotalBoat lists its 1-gallon TableTop Epoxy kit as covering 12.8 square feet at 1/8 inch thick, and 231 ÷ (144 × 0.125) = 12.83 square feet. TotalBoat's guide also says each flood coat should be no thicker than 1/4 inch to prevent overheating or distortion, which is why thicker coats are flagged.",
          "Mix ratios vary between products; TotalBoat's is 1:1 by volume, which is the default. Change it to match your product's label. Everything is calculated in your browser and nothing is stored.",
          "Limits: raw or open-grain wood absorbs resin, some resin stays in the mixing cup and some runs off — none of these has a published figure, so the extra allowance is yours to set. This is not a substitute for your product's instructions on depth, temperature and cure.",
        ],
        sources: [
          { label: "TotalBoat TableTop Epoxy — product page", href: "https://www.totalboat.com/products/table-top-epoxy-crystal-clear-resin", note: "12.8 sq ft per gallon at 1/8 in; 1:1 by volume; up to 1/4 in for surface coatings" },
          { label: "TotalBoat — How to epoxy a table top", href: "https://www.totalboat.com/pages/how-to-epoxy-table-top-guide", note: "Seal coat plus flood coats; each flood coat no thicker than 1/4 in" },
          { label: "NIST Handbook 44, Appendix C", href: "https://www.nist.gov/pml/owm/publications/nist-handbooks/handbook-44", note: "1 gallon = 231 cubic inches" },
        ],
      }}
      faqs={[
        { question: "How much epoxy do I need for a table top?", answer: "Multiply the area in square inches by the coat thickness in inches and the number of coats, then divide by 231 to get gallons. A 6 × 3 ft table at 1/8 inch takes about 1.4 gallons per coat." },
        { question: "How many square feet does a gallon of epoxy cover?", answer: "At 1/8 inch thick, one gallon covers 231 ÷ 18 = about 12.8 square feet, which matches TotalBoat's published figure." },
        { question: "How thick should a table top epoxy coat be?", answer: "Self-levelling table top epoxy is typically poured as a 1/8-inch flood coat. TotalBoat's guide says each flood coat should be no thicker than 1/4 inch." },
        { question: "Do I need a seal coat?", answer: "TotalBoat's guide recommends a seal coat plus one or two flood coats, the seal coat blocking air from the wood that would otherwise cause bubbles. Add it as an extra coat in the calculator." },
        { question: "How much extra epoxy should I mix?", answer: "There is no single published figure. Open-grain wood, edges and cup residue all use extra, so set the allowance to suit your job." },
        { question: "How do I split the resin and hardener?", answer: "Use your product's ratio by volume. The calculator divides the total by the ratio you enter; 1:1 is the default." },
        { question: "Can I use this for a river table?", answer: "Not for the river itself — that is a deep pour, measured as a volume, and needs a deep-pour product. This page is for surface coats." },
      ]}
    >
      <TableTopEpoxyTool />
    </ToolPageLayout>
  );
}
