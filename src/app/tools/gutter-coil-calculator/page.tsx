import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GutterCoilTool from "@/components/GutterCoilTool";
import { requireTool } from "@/config/tools";

const SLUG = "gutter-coil-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Gutter Coil Calculator: Pounds to Feet and Feet to Pounds",
  description:
    "How many feet in a gutter coil: 11-7/8\" .027\" aluminum yields 2.65 ft per lb (0.377 lb/ft), so a 350 lb coil is about 927 ft. Aluminum, copper and Galvalume, 11-3/4\" to 15\".",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function GutterCoilCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out gutter coil footage",
        steps: [
          {
            name: "Pick the coil width",
            text: "Choose 11-3/4\", 11-7/8\" or 15\" — the width of flat stock the seamless gutter machine forms.",
          },
          {
            name: "Pick the material and thickness",
            text: ".027\" or .032\" aluminum, 16 or 20 oz. copper, or 26 gauge Galvalume.",
          },
          {
            name: "Choose what you know",
            text: "Enter a coil's weight to get its length in feet, or enter the feet of gutter you need to get the pounds of coil.",
          },
          {
            name: "Read the result",
            text: "The tool multiplies by the supplier's published feet per pound or pounds per foot and also shows how much of a 350 lb full coil that is.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where coil yield matters",
        items: [
          {
            title: "Checking what's left on a partial coil",
            body: "A gutter installer can weigh a part-used coil and see roughly how many feet remain before starting a job.",
          },
          {
            title: "Ordering coil for a job",
            body: "Entering the total feet of gutter gives the pounds of coil to order, since coil is often sold by weight.",
          },
          {
            title: "Comparing .027 and .032 aluminum",
            body: "Thicker .032\" coil weighs more per foot, so the same weight yields fewer feet — 2.24 ft per lb instead of 2.65 for 11-7/8\".",
          },
          {
            title: "Pricing a copper gutter job",
            body: "Copper is much heavier per foot than aluminum. Converting the run to pounds shows how much metal the job needs.",
          },
          {
            title: "Planning 6-inch gutters on wider coil",
            body: "Wider 15\" coil yields fewer feet per pound than 11-7/8\" in the same material.",
          },
          {
            title: "Estimating a full coil's length",
            body: "Using the supplier's approximate 350 lb full-coil weight, the tool shows the footage a full coil gives.",
          },
          {
            title: "Converting a supplier's quote",
            body: "When one supplier quotes per pound and another per foot, the factors put them on the same basis.",
          },
          {
            title: "Loading a truck",
            body: "The pounds of coil for a day's work help estimate the weight being carried.",
          },
          {
            title: "Training a new crew member",
            body: "The chart shows every width and material side by side.",
          },
          {
            title: "Using Galvalume instead of aluminum",
            body: "26 gauge Galvalume is about twice the weight per foot of .027\" aluminum at the same width.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the yields come from",
        paragraphs: [
          "The factors are from Gutter Supply's 'Coil Yields' spec sheet, linked from its aluminum gutter coil product page. The sheet has one table for 'if you know how many feet' (pounds per foot) and one for 'if you know how many pounds' (feet per pound), for 11.75\", 11.875\" and 15\" coil in .027\" and .032\" aluminum, 16 oz. and 20 oz. copper and 26 gauge Galvalume. The product page gives a full coil as approximately 350 lbs.",
          "Each direction uses the factor the sheet prints for it. The two are reciprocals to the printed precision except one: 15\" .027\" aluminum is printed as 0.476 lb per foot but 2.08 feet per pound (1 ÷ 0.476 = 2.10). The page keeps both as printed and points the difference out. The sheet prints the same factors for 11.75\" and 11.875\" coil.",
          "As an independent check, AZoM lists aluminum alloy 3105 at 0.0939–0.101 lb per cubic inch; at 0.098, 11.875\" × 0.027\" × 12\" × 0.098 ≈ 0.377 lb per foot, the sheet's figure. 16 oz. copper weighs 1 lb per square foot, and 11.875\" is 0.99 sq ft per foot, matching 0.99. Nothing is fetched while you use the page.",
          "The limits: these are one supplier's approximate figures. Coil from other mills can differ slightly in thickness and coating, a weighed coil includes its core and packaging, and the footage is flat coil length, not finished gutter after miters, end caps and waste.",
        ],
        sources: [
          {
            label: "Gutter Supply — Coil Yields spec sheet (PDF)",
            href: "https://guttersupply.asset.akeneo.cloud/Resources/media/SpecSheet_1584396442.pdf",
            note: "Pounds per foot and feet per pound by width and material",
          },
          {
            label: "AZoM — Aluminium / Aluminum 3105 Alloy (UNS A93015)",
            href: "https://www.azom.com/article.aspx?ArticleID=6620",
            note: "Density 2.6–2.8 g/cm³ (0.0939–0.101 lb/in³), used only as a cross-check",
          },
          {
            label: "Gutter Supply — Aluminum gutter coil",
            href: "https://www.guttersupply.com/p/aluminum-gutter-coils",
            note: "Widths, thicknesses and approximate 350 lb full coil",
          },
        ],
      }}
      faqs={[
        {
          question: "How many feet are in a coil of gutter aluminum?",
          answer:
            "At 2.65 ft per lb for 11-7/8\" .027\" aluminum, a 350 lb coil is about 927 feet. In .032\" (2.24 ft per lb) it is about 784 feet.",
        },
        {
          question: "How much does gutter coil weigh per foot?",
          answer:
            "For 11-7/8\" coil: 0.377 lb (.027\" aluminum), 0.446 lb (.032\" aluminum), 0.99 lb (16 oz. copper), 1.25 lb (20 oz. copper) and 0.768 lb (26 gauge Galvalume), by Gutter Supply's chart.",
        },
        {
          question: "How many pounds of coil do I need for 150 feet of gutter?",
          answer: "150 × 0.377 = 56.6 lb of 11-7/8\" .027\" aluminum. Add whatever the job needs for miters, end caps and waste.",
        },
        {
          question: "Why do 11-3/4\" and 11-7/8\" give the same answer?",
          answer:
            "The supplier's sheet prints identical factors for both widths. The real difference in weight is about 1%, below the chart's rounding.",
        },
        {
          question: "Is .032 aluminum heavier than .027?",
          answer: "Yes — about 18% heavier per foot (0.446 vs 0.377 lb for 11-7/8\"), so a coil of the same weight is shorter.",
        },
        {
          question: "How heavy is a full coil?",
          answer:
            "Gutter Supply lists a full aluminum coil as approximately 350 lb. Coils from other suppliers can be heavier or lighter, so weigh yours or check its label.",
        },
      ]}
    >
      <GutterCoilTool />
    </ToolPageLayout>
  );
}
