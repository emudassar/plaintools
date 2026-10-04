import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import AsphaltTonnageTool from "@/components/AsphaltTonnageTool";
import { requireTool } from "@/config/tools";

const SLUG = "asphalt-tonnage-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Asphalt Tonnage Calculator: Tons of Hot Mix for Your Area",
  description:
    "Enter the area and compacted thickness and get the tons of hot-mix asphalt, using the 110 lb per square yard per inch spread rate from the Asphalt Institute's magazine — or a state DOT rate (Illinois 112, Tennessee 106). Free.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function AsphaltTonnageCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to estimate asphalt tonnage",
        steps: [
          {
            name: "Enter the area",
            text: "As length × width in feet or metres, or as a total in square feet, square yards or square metres. For irregular areas, add up rectangles first.",
          },
          {
            name: "Enter the compacted thickness",
            text: "The thickness of the finished, rolled mat, in inches or millimetres. For two lifts, calculate each lift separately, as the source's example does.",
          },
          {
            name: "Choose the spread rate",
            text: "110 lb per square yard per inch is the source's typical rule of thumb. It also cites Illinois DOT (112) and Tennessee DOT (106). Use your mix design's figure if you have one.",
          },
          {
            name: "Read the tons",
            text: "Tons = square yards × inches × spread rate ÷ 2,000. Metric tonnes and pounds are shown too.",
          },
          {
            name: "Allow for your job",
            text: "The formula covers the planned area and thickness only. Waste, irregular edges and base corrections are for the estimator to add.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where an asphalt tonnage estimate matters",
        items: [
          {
            title: "Quoting a residential driveway",
            body: "A 50 × 20 ft driveway at 2 inches is 111 sq yd, or about 12.2 tons at 110 lb/sq yd/in. That figure goes straight into a quote.",
          },
          {
            title: "Ordering from the plant",
            body: "Plants sell by the ton. Ordering close to the real quantity avoids paying for leftover mix or running short mid-pour.",
          },
          {
            title: "Planning a parking lot overlay",
            body: "Enter the lot's area in square yards and the overlay thickness to get the tonnage for the bid.",
          },
          {
            title: "Checking a contractor's quantity",
            body: "If a quote lists 40 tons for a job the formula puts at 25, that is a reasonable question to ask before signing.",
          },
          {
            title: "Bidding public work to a state DOT's yield",
            body: "Illinois and Tennessee use their own spread rates; selecting them changes the tonnage to match the agency's basis.",
          },
          {
            title: "Estimating each lift separately",
            body: "A base course and a surface course of different thicknesses are two calculations. The source's own example does exactly that.",
          },
          {
            title: "Working in metric units",
            body: "Enter metres and millimetres; the result includes metric tonnes.",
          },
          {
            title: "Scheduling trucks",
            body: "Tonnage divided by truck capacity gives the number of loads to schedule from the plant.",
          },
          {
            title: "Patch and pothole repair",
            body: "Small areas still benefit from the arithmetic — a few square yards at 3 inches is a fraction of a ton.",
          },
          {
            title: "Teaching estimating",
            body: "The page shows the source's equation and every step, including its worked example.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the spread rate comes from",
        paragraphs: [
          "The method is Equation 1 in 'Five handy rules of thumb for successful asphalt pavement construction' by Danny Gierhart and Jason Wielinski (Asphalt magazine, the Asphalt Institute's publication, 11 September 2023): project area in square yards × lift thickness in inches × spread rate in pounds per square yard per inch ÷ 2,000 pounds = required tons. Its rule 3 states: 'The typical application spread rate for asphalt mixtures is 110 lbs. per square yard per inch of thickness.'",
          "The article's worked example paves 2 miles × 24 feet (28,160 square yards) at 2.5 inches and gets 3,872 tons; this page gives the same answer. Its second line, at 1.5 inches, prints 2,322.2 tons — the same equation gives 2,323.2, so the article contains a small arithmetic slip, and this page follows the equation.",
          "Everything is calculated in your browser; nothing is sent or stored.",
          "The limits are the source's own: 110 is a rule of thumb. It names local variations (Illinois DOT 112, Tennessee DOT 106) and notes that mixes with heavier aggregate, such as steel slag SMA, weigh more — Indiana DOT applies an adjustment factor for that. The real weight per square yard per inch depends on the specific mix design.",
          "This page gives an estimate for planning and quoting. It does not include waste or base corrections, and it does not replace the quantities in a project specification or a mix design's yield.",
        ],
        sources: [
          {
            label: "Asphalt magazine — Five handy rules of thumb for successful asphalt pavement construction (2023)",
            href: "https://www.asphaltmagazine.com/5rulespavementconstruction/",
            note: "Equation 1, the 110 lb/sq yd/in rule of thumb and the IDOT/TDOT variations",
          },
          {
            label: "Asphalt Institute",
            href: "https://www.asphaltinstitute.org/",
            note: "Publisher of Asphalt magazine",
          },
        ],
      }}
      faqs={[
        {
          question: "How many tons of asphalt do I need?",
          answer:
            "Square yards × compacted inches × 110 ÷ 2,000, using the typical spread rate from the source. For 1,000 square feet at 2 inches, that is about 12.2 tons.",
        },
        {
          question: "How much does a ton of asphalt cover?",
          answer:
            "At 110 lb per square yard per inch, one ton covers about 164 square feet at 1 inch, half that at 2 inches. The result card shows the coverage for your thickness.",
        },
        {
          question: "Why do some estimates use 112 or 106 instead of 110?",
          answer:
            "Agencies set their own yield. The source notes Illinois DOT uses 112 and Tennessee DOT uses 106 for most dense-graded mixtures. Pick the one that matches your project.",
        },
        {
          question: "Is the thickness before or after rolling?",
          answer: "After — the spread rate is per inch of compacted thickness.",
        },
        {
          question: "Does this include waste?",
          answer: "No. It is the quantity for the planned area and thickness. How much to add for waste or base irregularities is the estimator's call.",
        },
        {
          question: "How do I convert to metric tonnes?",
          answer: "The result shows metric tonnes alongside US tons (2,000 lb). One US ton is about 0.907 metric tonnes.",
        },
      ]}
    >
      <AsphaltTonnageTool />
    </ToolPageLayout>
  );
}
