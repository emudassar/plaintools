import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import RafterLengthTool from "@/components/RafterLengthTool";
import { requireTool } from "@/config/tools";
import { GRIFFITH_RAFTER_URL } from "@/lib/rafter-length";

const SLUG = "rafter-length-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Rafter Length Calculator: Common Rafter in Feet and Inches",
  description:
    "Enter the building span, roof pitch, overhang and ridge board thickness and get the common rafter length to the nearest 1/16 in, the rise, the roof angle and the stock length to buy.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function RafterLengthPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate common rafter length",
        steps: [
          { name: "Measure the span", text: "From the outside of one wall plate to the outside of the other." },
          { name: "Enter the pitch", text: "Inches of rise per 12 in of run, e.g. 6 for a 6/12 roof." },
          { name: "Enter the overhang", text: "The level distance the tail runs past the wall." },
          { name: "Enter the ridge thickness", text: "1.5 in for a 2× ridge board; the page takes half of it off the run." },
          { name: "Read the length", text: "Plate-to-ridge length, tail length and total, in feet and inches." },
        ],
      }}
      uses={{
        heading: "10 situations where a rafter length calculator helps",
        items: [
          { title: "Shed roof framing", body: "Get the rafter length for a gable shed before buying lumber." },
          { title: "Choosing stock length", body: "The result names the shortest even-foot board that covers each rafter." },
          { title: "Garage or addition", body: "Check rafter lengths for a new gable before ordering a load." },
          { title: "Comparing pitches", body: "Change the pitch to see how much longer each rafter and the total rise get." },
          { title: "Adding an overhang", body: "See what a deeper eave adds to every rafter." },
          { title: "Cross-checking a framing square", body: "The length per foot of run matches the figure on a rafter table." },
          { title: "Porch roof", body: "A small gable over a porch uses the same calculation." },
          { title: "Checking a plan's numbers", body: "Verify the rafter lengths on a set of drawings." },
          { title: "Teaching carpentry", body: "Each step — run, rise, unit length — is shown, so students can follow it." },
          { title: "Ridge height", body: "The total rise tells you how high the ridge sits above the plates." },
        ],
      }}
      dataSection={{
        heading: "Where the method comes from",
        paragraphs: [
          "The method is from Ira S. Griffith's 'Carpentry' (§17, 'To Find the Length of a Common Rafter'), a public-domain textbook: the length of a common rafter is the hypotenuse of a right triangle whose legs are the rise and the run. Because the ratio of rise to run is fixed for a pitch, the length per foot of run is a constant, √(12² + rise²) inches, and the rafter length is that constant times the run in feet. Griffith's own example — 25 ft span, quarter pitch, 13.42 in per foot of run, 13.98 ft — is reproduced exactly by this page.",
          "Griffith adds the run of the tail to the run of the rafter when there is an overhang; this page does the same. The ridge board deduction takes half the ridge thickness off the level run, so the rafter ends at the face of the ridge rather than at its centre.",
          "Limits: lengths are along the rafter's measuring line, before the birdsmouth, plumb cut and tail cut are laid out. The page does not size rafters or check spans — that comes from the span tables in your building code and the snow, wind and dead loads where you build. Cut and test one pattern rafter first.",
          "Everything runs in your browser; nothing is sent or stored.",
        ],
        sources: [{ label: "Ira S. Griffith — Carpentry, §17 To Find the Length of a Common Rafter", href: GRIFFITH_RAFTER_URL, note: "Length = run × length per foot of run; 25 ft span example" }],
      }}
      faqs={[
        { question: "How do I calculate rafter length?", answer: "Multiply the run in feet by √(144 + rise²) ÷ 12. For a 24 ft span at 6/12: run 12 ft × 13.416 ÷ 12 = 13.42 ft before overhang and ridge deduction." },
        { question: "What is the run of a rafter?", answer: "Half the span — the level distance from the outside of the wall plate to the centre of the ridge." },
        { question: "Why subtract half the ridge board?", answer: "The rafter stops at the face of the ridge board, so the level run is shorter by half its thickness." },
        { question: "Does it include the overhang?", answer: "Yes. Enter the level overhang; its length along the slope is shown and added to the total." },
        { question: "What does 6/12 pitch mean?", answer: "6 inches of rise for every 12 inches of level run — about 26.6°." },
        { question: "Can this tell me what size rafter I need?", answer: "No. Size and spacing come from the rafter span tables in your building code for your loads and lumber grade." },
      ]}
    >
      <RafterLengthTool />
    </ToolPageLayout>
  );
}
