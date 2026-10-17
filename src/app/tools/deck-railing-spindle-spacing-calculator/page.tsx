import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BalusterSpacingTool from "@/components/BalusterSpacingTool";
import { requireTool } from "@/config/tools";
import { IRC_CH3_URL } from "@/lib/baluster-spacing";

const SLUG = "deck-railing-spindle-spacing-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Deck Railing Spindle Spacing Calculator (4 Inch Rule)",
  description:
    "Enter the clear space between posts and your spindle width and get the fewest spindles that keep every gap under the IRC 4-inch sphere limit (4-3/8 in on stairs), the exact gap and where each spindle goes.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function SpindleSpacingPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to space deck railing spindles",
        steps: [
          { name: "Measure between posts", text: "The clear distance from one post face to the other, in inches." },
          { name: "Enter the spindle width", text: "1.5 in for a 2×2, or the slimmest point of a turned or metal baluster." },
          { name: "Choose the limit", text: "4 in for deck and floor guards; 4-3/8 in on the open side of stairs." },
          { name: "Read the count and gap", text: "The fewest spindles that keep every gap under the limit, spaced equally." },
          { name: "Mark the centres", text: "Use the list of centre positions measured from the left post." },
        ],
      }}
      uses={{
        heading: "10 situations where a spindle spacing calculator helps",
        items: [
          { title: "Passing a deck inspection", body: "A gap even slightly over 4 in fails the sphere test; get a count that keeps every gap under it." },
          { title: "Ordering balusters", body: "Multiply by the number of identical sections for a total." },
          { title: "Even spacing without a spacer block guess", body: "Get the exact gap to cut a spacer to." },
          { title: "Stair railings", body: "Use the 4-3/8 in limit for the open side of stairs." },
          { title: "Metal balusters", body: "Enter the bar width; the narrow profile changes the count." },
          { title: "Turned spindles", body: "Enter the slimmest point, where the opening is widest." },
          { title: "Replacing a few balusters", body: "Check whether old spacing still meets today's limit." },
          { title: "Short and long sections", body: "Each post-to-post run gets its own equal spacing." },
          { title: "Interior stair and balcony guards", body: "The same 4 in rule applies to required guards indoors." },
          { title: "Tighter design spacing", body: "Use a custom limit if your plans call for a smaller gap." },
        ],
      }}
      dataSection={{
        heading: "The rule and the arithmetic",
        paragraphs: [
          "2021 IRC Section R312.1.3, Opening limitations: 'Required guards shall not have openings from the walking surface to the required guard height that allow passage of a sphere 4 inches (102 mm) in diameter.' Exception 2 allows 4-3/8 in on the open side of stairs, and exception 1 a 6 in sphere for the triangle formed by the riser, tread and bottom rail. Read on the ICC's public code site.",
          "With n spindles of width w between posts a clear distance L apart there are n + 1 equal gaps, each (L − n·w) ÷ (n + 1). The page finds the smallest n that makes the gap strictly less than the limit — a gap of exactly 4 in would let a 4 in sphere through — then spaces them equally.",
          "Limits: the page checks spacing only. Guard height, post and rail strength, the bottom-rail gap and the stair triangle are separate requirements. Local codes can amend the IRC, so check with your building department. Everything runs in your browser.",
        ],
        sources: [{ label: "2021 International Residential Code — Chapter 3, R312.1.3 Opening limitations", href: IRC_CH3_URL, note: "4 in sphere; 4-3/8 in on open side of stairs" }],
      }}
      faqs={[
        { question: "What is the 4 inch rule for deck railings?", answer: "IRC R312.1.3 says required guards must not have openings that let a 4 in sphere pass, from the walking surface up to the required guard height." },
        { question: "How many spindles do I need for a 6 ft section?", answer: "For 72 in between posts with 1.5 in spindles, 13 spindles give 3.75 in gaps — the fewest that stay under 4 in." },
        { question: "What gap should I use between spindles?", answer: "Anything under the limit. The page uses equal gaps just under it with the fewest spindles; choose more spindles for tighter gaps." },
        { question: "Is it different on stairs?", answer: "Yes: the IRC allows openings up to a 4-3/8 in sphere on the open side of stairs, and 6 in for the riser-tread-bottom rail triangle." },
        { question: "Do I measure at the spindle's widest or narrowest point?", answer: "The opening is largest where the spindle is slimmest, so enter the narrowest width." },
        { question: "Does my town use the IRC?", answer: "Most US jurisdictions adopt the IRC, sometimes amended. Your building department can tell you which edition and changes apply." },
      ]}
    >
      <BalusterSpacingTool />
    </ToolPageLayout>
  );
}
