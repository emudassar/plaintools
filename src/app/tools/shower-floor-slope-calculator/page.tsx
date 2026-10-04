import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ShowerFloorSlopeTool from "@/components/ShowerFloorSlopeTool";
import { requireTool } from "@/config/tools";

const SLUG = "shower-floor-slope-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Shower Floor Slope Calculator: Height at the Wall from the Drain",
  description:
    "Enter the distance from the shower drain to the farthest wall and get how high the floor must rise there under the 2021 IRC's ¼ to ½ inch per foot rule — in fractions and mm — and check a planned slope and curb depth.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ShowerFloorSlopeCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out a shower floor slope",
        steps: [
          {
            name: "Measure from the drain to the farthest edge",
            text: "Take the horizontal distance from the drain to the point of the floor furthest from it — usually a back corner for a centre drain, or the far wall for a linear drain.",
          },
          {
            name: "Read the height range",
            text: "The IRC requires the floor to slope at least ¼ inch and at most ½ inch per foot toward the drain. The tool turns your distance into the height that edge must sit above the drain, in fractions and millimetres.",
          },
          {
            name: "Optionally check a planned height",
            text: "Enter the height you plan to build the edge to and the tool works out its slope per foot and whether it is inside the range.",
          },
          {
            name: "Optionally check the curb",
            text: "The IRC requires the curb to be 2 to 9 inches deep, measured from the top of the curb to the top of the drain.",
          },
          {
            name: "Confirm with your local code",
            text: "These are 2021 IRC figures. Your jurisdiction's adopted code and your inspector decide what applies.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the shower slope figure matters",
        items: [
          {
            title: "Floating a mortar bed for a tiled shower",
            body: "With the drain 30 inches from the far corner, the bed must rise at least 5/8 inch and no more than 1¼ inch there. Those are the screed heights to set.",
          },
          {
            title: "Planning a linear drain at one wall",
            body: "The run is the full depth of the shower, so a 48-inch shower needs 1 to 2 inches of rise at the opposite wall.",
          },
          {
            title: "Passing a rough or final inspection",
            body: "Knowing the code range before the bed is placed is cheaper than finding out at inspection.",
          },
          {
            title: "Fixing a shower where water pools",
            body: "When water pools, measuring the actual rise at the edge and entering it shows whether the floor meets the code minimum.",
          },
          {
            title: "Keeping a floor comfortable to stand on",
            body: "The ½ inch per foot maximum caps how steep the floor can be. A planned height that exceeds it is flagged.",
          },
          {
            title: "Setting the curb height",
            body: "The 2- to 9-inch curb depth from curb top to drain top is checked when you enter it.",
          },
          {
            title: "Working in millimetres",
            body: "Enter the run in mm or cm and the rise is given in millimetres as well as inches.",
          },
          {
            title: "Converting a rule to fractions on a tape",
            body: "Decimal inches are rounded to the nearest 1/16 so the figure can be read straight off a tape measure.",
          },
          {
            title: "Quoting a shower pan job",
            body: "A tile setter can show a client the measured run and the height range the code requires.",
          },
          {
            title: "Understanding a remodel's limits",
            body: "When floor height is tight, the minimum rise over the run tells you how much depth the slope will take before tile is added.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the slope rule comes from",
        paragraphs: [
          "The rule is Section P2709.1 of the 2021 International Residential Code: 'The finished floor shall slope uniformly toward the drain not less than 1/4 unit vertical in 12 units horizontal (2-percent slope) nor more than 1/2 unit vertical per 12 units horizontal (4-percent slope).' The same section says a finished curb threshold must be at least 1 inch below the sides and back of the receptor, and that the curb must be 2 to 9 inches deep measured from the top of the curb to the top of the drain. The text was read on the ICC's free public code viewer.",
          "The page multiplies your run, in feet, by ¼ inch and by ½ inch to get the minimum and maximum height of the floor's edge above the drain. A planned height is converted back to inches per foot and percent and compared with the range. Fractions are rounded to the nearest 1/16 inch. Note that ¼ inch per foot is 2.08% exactly; the code text calls it 2 percent.",
          "Everything is calculated in your browser; nothing is sent or stored.",
          "The limits: these are the model 2021 IRC figures. States and cities adopt different editions, use the Uniform Plumbing Code, or amend sections, and an inspector's reading governs. For commercial work the International Plumbing Code applies; its Section 421.5.2 requires shower liners to be pitched ¼ inch in 12 toward the drain. Prefabricated receptors and membrane systems also come with their manufacturer's requirements.",
          "This page reports what the code text and arithmetic give. It is not a design or an inspection, and it does not cover waterproofing, accessibility (curbless) requirements or drain sizing.",
        ],
        sources: [
          {
            label: "ICC — 2021 International Residential Code, Chapter 27 Plumbing Fixtures",
            href: "https://codes.iccsafe.org/content/IRC2021P2/chapter-27-plumbing-fixtures",
            note: "Section P2709.1 shower floor slope and curb depth",
          },
          {
            label: "ICC — 2021 International Plumbing Code, Chapter 4",
            href: "https://codes.iccsafe.org/content/IPC2021P2/chapter-4-fixtures-faucets-and-fixture-fittings",
            note: "Section 421.5.2 shower liner pitch",
          },
        ],
      }}
      faqs={[
        {
          question: "What slope does a shower floor need?",
          answer:
            "Under the 2021 IRC, not less than ¼ inch per foot and not more than ½ inch per foot toward the drain (Section P2709.1).",
        },
        {
          question: "How much higher should the wall be than the drain?",
          answer:
            "Distance in feet × ¼ inch for the minimum, × ½ inch for the maximum. For a wall 3 feet from the drain, that is ¾ inch to 1½ inches.",
        },
        {
          question: "Do I measure to the nearest wall or the farthest?",
          answer:
            "Use the farthest point of the floor from the drain — that edge needs the most rise to keep the whole floor at or above the minimum slope.",
        },
        {
          question: "How deep should a shower curb be?",
          answer:
            "IRC P2709.1 requires 2 to 9 inches measured from the top of the curb to the top of the drain, and a finished curb threshold at least 1 inch below the sides and back of the receptor.",
        },
        {
          question: "Is ¼ inch per foot the same as 2 percent?",
          answer:
            "Nearly — ¼ inch in 12 inches is 2.08%. The code text labels it 2-percent slope; the page shows both.",
        },
        {
          question: "Does the liner under the mortar bed need a slope too?",
          answer:
            "The International Plumbing Code (Section 421.5.2) requires shower liners to be pitched ¼ inch in 12 toward the drain. Check the code your jurisdiction uses for residential work.",
        },
      ]}
    >
      <ShowerFloorSlopeTool />
    </ToolPageLayout>
  );
}
