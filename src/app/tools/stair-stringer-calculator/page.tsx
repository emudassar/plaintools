import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import StairStringerTool from "@/components/StairStringerTool";
import { requireTool } from "@/config/tools";

const SLUG = "stair-stringer-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Stair Stringer Calculator: Risers, Run, Length and Throat",
  description:
    "Enter the total rise and tread depth to get the number of risers, riser height, total run, stringer length, angle and throat — checked against the American Wood Council's DCA 6 deck stair rules.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function StairStringerCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to lay out a stair stringer",
        steps: [
          { name: "Measure the total rise", text: "Measure from the finished surface where the stairs land to the finished deck surface, in inches or feet." },
          { name: "Set the riser and tread", text: "Enter the largest riser you will allow (DCA 6 caps it at 7-3/4 in) and the tread depth per step (at least 10 in)." },
          { name: "Enter the stringer board", text: "A 2x12 is 11-1/4 in wide; this sets the throat left after the notches are cut." },
          { name: "Read the layout and checks", text: "The result gives risers, treads, run, slope length, angle and throat, and checks each against DCA 6." },
        ],
      }}
      uses={{
        heading: "10 situations where a stair stringer calculation helps",
        items: [
          { title: "Building deck stairs", body: "Equal risers that stay under 7-3/4 in avoid a failed inspection and a trip hazard from one odd step." },
          { title: "Checking the throat before cutting", body: "DCA 6 requires 5 in of wood left under the notches; the tool computes it for your board and step size." },
          { title: "Seeing if a cut stringer can span the run", body: "Cut stringers are limited to a 6 ft horizontal span in DCA 6; longer runs need a post, a landing or solid stringers." },
          { title: "Planning a landing", body: "Above 12 ft of total rise DCA 6 requires an intermediate landing — the tool flags it." },
          { title: "Counting stringers", body: "Enter the stair width to get the number of cut stringers at 18 in maximum spacing (three minimum)." },
          { title: "Knowing when a handrail is needed", body: "Four or more risers means a handrail under DCA 6." },
          { title: "Buying the right length of 2x12", body: "The slope length tells you the minimum the board must exceed." },
          { title: "Making a shallower stair", body: "Lowering the maximum riser shows how many more steps and how much more run it takes." },
          { title: "Checking a contractor's layout", body: "Compare their riser count and height with the arithmetic." },
          { title: "Planning porch or shed steps", body: "Any short stair from grade to a platform works the same way." },
        ],
      }}
      dataSection={{
        heading: "Where the rules come from",
        paragraphs: [
          "The limits are from the American Wood Council's DCA 6 — Prescriptive Residential Wood Deck Construction Guide (2015 IRC edition), pages 20–21. Figure 27 gives a 7-3/4 in maximum riser, risers that may not differ by more than 3/8 in, a 10 in minimum tread and a 3/4–1-1/4 in nosing. The text requires stringers of at least 2x12; Figure 28 limits a cut stringer to a 6 ft 0 in horizontal span with at least 5 in of throat, and a solid stringer to 13 ft 3 in.",
          "DCA 6 also requires an intermediate landing when the total height exceeds 12 ft, stairs at least 36 in wide with at least three cut stringers at no more than 18 in on center, a handrail for 4 or more risers, and a guard when the total rise is 30 in or more.",
          "The arithmetic: risers = total rise ÷ maximum riser, rounded up, so every riser is equal; treads = risers − 1 because the deck is the top step; run = treads × tread depth; slope length = √(rise² + run²). The throat is the board width minus the depth of each notch measured square to the board, (riser × tread) ÷ √(riser² + tread²). As a check, DCA 6's commentary says cut stringers were analysed with 5.1 in of depth at a 7.75:10 ratio; this formula gives 5.12 in for a 2x12.",
          "Limits: DCA 6 is a prescriptive guide built on the 2015 IRC, and local codes may amend it. The calculator does not account for tread thickness at the bottom cut, or the hardware at the top. It does not check guards, handrail grip size or lighting.",
        ],
        sources: [
          { label: "American Wood Council — DCA 6 Prescriptive Residential Wood Deck Construction Guide", href: "https://web-media.awc.org/wp-content/uploads/2022/02/17210514/AWC-DCA62015-DeckGuide-1804.pdf", note: "Stair Requirements, Figures 27–30, Table 6" },
        ],
      }}
      faqs={[
        { question: "How do I calculate the number of stairs?", answer: "Divide the total rise by the maximum riser height and round up. 48 in ÷ 7.75 = 6.2, so 7 risers of 6-7/8 in each." },
        { question: "How many treads does a stringer have?", answer: "One fewer than the risers when the deck surface is the top step. 7 risers means 6 treads cut into the stringer." },
        { question: "What is the maximum riser height for deck stairs?", answer: "DCA 6 gives 7-3/4 in, with risers not differing from each other by more than 3/8 in." },
        { question: "How long should a stair stringer be?", answer: "At least the slope length √(rise² + run²), plus extra for the end cuts. For 48 in of rise and 60 in of run that is 6 ft 4-13/16 in." },
        { question: "How much wood must be left under the notches?", answer: "DCA 6 Figure 28 shows a 5 in minimum throat for cut stringers." },
        { question: "How far can a cut stringer span?", answer: "6 ft 0 in horizontally in DCA 6. Beyond that it shows a supporting 4x4 post, a landing, or solid stringers up to 13 ft 3 in." },
        { question: "How many stringers do I need?", answer: "At least three cut stringers, spaced no more than 18 in on center, so a 36 in stair needs three and a 48 in stair four." },
        { question: "When do I need a landing?", answer: "DCA 6 requires an intermediate landing when the total vertical height exceeds 12 ft." },
      ]}
    >
      <StairStringerTool />
    </ToolPageLayout>
  );
}
