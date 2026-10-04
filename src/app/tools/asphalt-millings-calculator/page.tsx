import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import AsphaltMillingsTool from "@/components/AsphaltMillingsTool";
import { requireTool } from "@/config/tools";

const SLUG = "asphalt-millings-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Asphalt Millings Calculator: Cubic Yards and Tons",
  description:
    "Enter the area and compacted depth and get the cubic yards of asphalt millings and a tons range from FHWA's published weight for reclaimed asphalt — or use your supplier's weight per yard. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function AsphaltMillingsCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out how many millings to order",
        steps: [
          {
            name: "Enter the area",
            text: "Length × width in feet or metres, or a total in square feet or square metres. Split odd shapes into rectangles and add them.",
          },
          {
            name: "Enter the compacted depth",
            text: "The finished thickness you want after rolling, in inches or millimetres.",
          },
          {
            name: "Read the cubic yards",
            text: "Volume is area × depth. If your supplier sells by the cubic yard, this is the figure to order by.",
          },
          {
            name: "Read the tons range",
            text: "If they sell by the ton, The tool applies FHWA's compacted unit weight for reclaimed asphalt, 100–125 lb per cubic foot, so you get a low and high estimate.",
          },
          {
            name: "Use your supplier's weight if you have it",
            text: "Weight varies with the aggregate and moisture. If the supplier quotes a weight per cubic yard or cubic foot, tick the box and enter it for a single figure.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where a millings quantity matters",
        items: [
          {
            title: "Surfacing a long rural driveway",
            body: "A 60 × 12 ft driveway at 4 inches compacted is about 8.9 cubic yards — 12 to 15 tons by FHWA's compacted weight range.",
          },
          {
            title: "Ordering by the ton when the yard sells by weight",
            body: "Some yards quote per ton. The range shows what to ask for, and the supplier's own figure narrows it.",
          },
          {
            title: "Building a farm lane or equipment pad",
            body: "For a lane or pad, the volume for the planned depth is the starting point for the order.",
          },
          {
            title: "Planning truckloads",
            body: "Dividing the tonnage by a truck's load capacity tells you roughly how many deliveries to expect.",
          },
          {
            title: "Comparing millings with gravel",
            body: "The cubic yards here are the same volume any aggregate order needs, so the figure can be priced against gravel too.",
          },
          {
            title: "Patching potholes in a millings drive",
            body: "Small repairs still benefit from the arithmetic — a few square feet at 3 inches is a fraction of a yard.",
          },
          {
            title: "Estimating a parking area for a small business",
            body: "Enter the lot's square footage and depth to get a quantity to quote from local suppliers.",
          },
          {
            title: "Working in metric",
            body: "Enter metres and millimetres; the result includes cubic metres and metric tonnes.",
          },
          {
            title: "Checking a contractor's quantity",
            body: "If a quote lists far more tons than the area and depth support, the arithmetic gives a reason to ask.",
          },
          {
            title: "Converting a supplier's per-yard weight to tons",
            body: "Enter the supplier's pounds per cubic yard and the tool turns the job's volume into tons with their figure.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the weight figures come from",
        paragraphs: [
          "The weights come from the Federal Highway Administration's 'User Guidelines for Waste and Byproduct Materials in Pavement Construction' (FHWA-RD-97-148), in the section on reclaimed asphalt pavement (RAP) — the material sold as asphalt millings. Table 13-2 lists a unit weight of 1,940–2,300 kg/m³ (120–140 lb/ft³) for milled or processed RAP and a compacted unit weight, reported as maximum dry density, of 1,600–2,000 kg/m³ (100–125 lb/ft³).",
          "Because the volume here is the compacted depth you want to end up with, the tons range uses the compacted figures, 100–125 lb/ft³. Volume is area × depth; cubic yards are cubic feet ÷ 27; tons are pounds ÷ 2,000. If you enter a supplier's own weight, it replaces the range.",
          "Everything is calculated in your browser; nothing is sent or stored.",
          "The limits are FHWA's: the weight of milled asphalt depends on the type of aggregate in the old pavement and the moisture in the stockpile, and the source notes that available data on unit weight is limited. That is why the result is a range unless you enter your supplier's figure. The volume is compacted volume; how much more loose material compaction takes depends on the material and the equipment used.",
          "This page estimates quantities. It does not advise on base preparation or whether millings suit a particular use, which can also be subject to local rules.",
        ],
        sources: [
          {
            label: "FHWA — Reclaimed Asphalt Pavement, Material Description (FHWA-RD-97-148)",
            href: "https://www.fhwa.dot.gov/publications/research/infrastructure/structures/97148/rap131.cfm",
            note: "Table 13-2 unit weight and compacted unit weight",
          },
        ],
      }}
      faqs={[
        {
          question: "How many tons of millings do I need?",
          answer:
            "Area × compacted depth gives the volume; multiplying by FHWA's compacted unit weight of 100–125 lb per cubic foot and dividing by 2,000 gives tons. For 720 square feet at 4 inches that is 240 cubic feet, or 12–15 tons.",
        },
        {
          question: "How much does a yard of asphalt millings weigh?",
          answer:
            "By FHWA's compacted figures, 2,700–3,375 lb per cubic yard (100–125 lb per cubic foot × 27). FHWA's figure for milled or processed RAP is 120–140 lb per cubic foot. Suppliers can give the weight of their own material.",
        },
        {
          question: "Why is the answer a range?",
          answer:
            "FHWA says the unit weight depends on the aggregate in the reclaimed pavement and the moisture of the stockpile. Entering your supplier's weight gives a single figure.",
        },
        {
          question: "Should the depth be loose or compacted?",
          answer: "Compacted — the thickness you want after rolling. The tons range uses FHWA's compacted unit weight to match.",
        },
        {
          question: "Can I enter metric units?",
          answer: "Yes. Enter metres and millimetres; the result shows cubic metres and metric tonnes as well.",
        },
        {
          question: "Are millings the same as recycled asphalt?",
          answer: "FHWA's guideline uses 'milled or processed RAP' — reclaimed asphalt pavement — for this material, and its figures are what the page uses.",
        },
      ]}
    >
      <AsphaltMillingsTool />
    </ToolPageLayout>
  );
}
