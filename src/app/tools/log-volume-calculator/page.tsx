import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import LogVolumeTool from "@/components/LogVolumeTool";
import { requireTool } from "@/config/tools";

const SLUG = "log-volume-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Log Volume Calculator: Board Feet (Doyle, International) and Cubic Feet",
  description:
    "Enter a log's small-end diameter and length to get its wood volume in board feet by the Doyle and International 1/4-inch log rules, plus cubic feet and cubic metres.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function LogVolumeCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out the volume of a log",
        steps: [
          { name: "Measure the small end", text: "Measure the diameter inside the bark at the small end of the log, in inches. Log rules are built on this scaling diameter." },
          { name: "Measure the length", text: "Enter the length in feet. The published tables cover 6 to 16 ft; other lengths use the rule's formula." },
          { name: "Add the large end for cubic volume", text: "With both end diameters the cubic volume uses Smalian's formula; with only the small end it is treated as a cylinder." },
          { name: "Compare the rules", text: "Read the board feet under both rules. They often differ a lot, especially for small logs." },
        ],
      }}
      uses={{
        heading: "10 situations where a log volume calculation helps",
        items: [
          { title: "Checking a mill's tally before selling logs", body: "A landowner can see the expected scale of a load under the rule the buyer uses, before the logs leave the property." },
          { title: "Seeing why Doyle pays less for small logs", body: "On a 10-inch, 16-ft log, Doyle gives 36 BF and International 1/4-inch gives 65 BF. Knowing the gap matters when a sale is priced per thousand board feet." },
          { title: "Planning a portable sawmill job", body: "An owner of a few storm-felled trees can estimate how much lumber the logs might yield." },
          { title: "Pricing a single walnut or oak log", body: "Specialty buyers quote per board foot; the volume gives a starting figure for the conversation." },
          { title: "Turning cubic feet into firewood or weight estimates", body: "The cubic volume is the starting point for weight or cord calculations." },
          { title: "Teaching timber measurement", body: "Students can see the published table value next to the formula value." },
          { title: "Checking a load of identical logs", body: "Entering the number of logs multiplies the scale for a uniform batch." },
          { title: "Comparing bucking choices", body: "Running one long log against two shorter ones shows how the rules treat length and taper differently." },
          { title: "Estimating volume in metric", body: "The cubic result is also given in cubic metres for buyers who work in metric." },
          { title: "Settling a disagreement about a log's size", body: "Both parties can see the same published rule values." },
        ],
      }}
      dataSection={{
        heading: "Where the log rules come from",
        paragraphs: [
          "The formulas and tables are from David Briggs, Forest Products Measurements and Conversion Factors (College of Forest Resources, University of Washington, 1994), Chapter 2 'Measurement of Logs' and Appendix 3 'Board Foot Log Rules'.",
          "Doyle: board feet = ((d − 4) ÷ 4)² × L, where d is the small-end diameter in inches and L the length in feet. Briggs explains it squares the log into a cant by taking 4 inches off the diameter, then deducts 25% for kerf and shrinkage, and notes it underscales small logs and overscales large ones. The formula, rounded to whole board feet, reproduces all 150 cells of the Appendix 3 Doyle table (6–30 in, 6–16 ft).",
          "International 1/4-inch: the log is treated as 4-ft cylinders, each ½ inch wider than the last. Each cylinder holds 0.22d² − 0.71d board feet with a 1/8-inch kerf; the 1/4-inch rule is 0.905 times that. Rounded to the nearest 5 BF, this matches 147 of the 150 tabled values; the other three differ by one 5-BF step. So inside the table range the page shows Briggs's published value, and outside it the formula value, labelled. Briggs's text also prints the 1/4-inch cylinder as 0.20d² − 0.71d, but that does not reproduce his own example of 85 BF for a 10-inch, 20-ft log, so it is not used.",
          "Cubic volume uses Briggs's Table 2-1: Smalian's formula 0.005454 × (d² + D²) × L ÷ 2 when both ends are entered, otherwise a cylinder at the small end. Briggs notes Smalian tends to overestimate butt logs. The Scribner Decimal C rule is a diagram rule without a formula and is not included.",
          "Limits: this is gross scale. It makes no deductions for rot, sweep, crook or other defects, and it does not tell you what a mill will pay or actually saw. Everything is calculated in your browser.",
        ],
        sources: [
          { label: "Briggs (1994), Chapter 2: Measurement of Logs (PDF)", href: "http://www.ruraltech.org/projects/conversions/briggs_conversions/briggs_ch02/chapter02_combined.pdf", note: "Doyle and International formulas; Table 2-1 cubic formulas" },
          { label: "Briggs (1994), Appendix 3: Board Foot Log Rules (PDF)", href: "https://www.ruraltech.org/projects/conversions/briggs_conversions/briggs_append3/appendix03_combined.pdf", note: "Published International 1/4-inch and Doyle tables, 6–30 in × 6–16 ft" },
        ],
      }}
      faqs={[
        { question: "How do you calculate the volume of a log?", answer: "Measure the small-end diameter inside the bark and the length. For board feet, apply a log rule such as Doyle ((d − 4) ÷ 4)² × L. For cubic feet, 0.005454 × d² × L treats it as a cylinder; Smalian's formula averages the two end areas." },
        { question: "How many board feet are in a 12-inch, 16-foot log?", answer: "The published tables give 95 BF by the International 1/4-inch rule and 64 BF by Doyle." },
        { question: "Why do Doyle and International give different answers?", answer: "Doyle deducts a flat 4 inches of diameter for slabs and edgings, which is a large share of a small log, so it gives far less on small logs. International models taper and kerf more closely." },
        { question: "Which log rule should I use?", answer: "The one your buyer uses. Doyle is common in the U.S. South, Scribner in the West, and International 1/4-inch in some other regions. This page does not choose one for you." },
        { question: "Do I measure the diameter with or without bark?", answer: "Inside the bark, at the small end. Log rules are built on the small-end scaling diameter." },
        { question: "How do I convert a log's cubic feet to cubic metres?", answer: "Multiply cubic feet by 0.0283168. The calculator shows both." },
        { question: "Does this calculator include Scribner?", answer: "No. Scribner is a diagram rule with no formula, so it is not reproduced here." },
      ]}
    >
      <LogVolumeTool />
    </ToolPageLayout>
  );
}
