import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import RoofTrussTool from "@/components/RoofTrussTool";
import { requireTool } from "@/config/tools";
import { IRC_CH8_URL } from "@/lib/roof-truss";

const SLUG = "roof-truss-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Roof Truss Calculator: How Many Trusses Do I Need?",
  description:
    "Enter the building length, truss spacing, span and pitch and get the number of trusses including both gable ends, the closing space, the top chord length and the rise.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function RoofTrussPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out how many roof trusses you need",
        steps: [
          { name: "Measure the building length", text: "The wall length the trusses are spaced along, from gable end to gable end." },
          { name: "Enter the spacing", text: "On-centre spacing in inches; 24 in is common for trusses." },
          { name: "Enter span and pitch", text: "Used for the outline: top chord length and rise." },
          { name: "Read the count", text: "Includes a truss at each end and a shorter closing space if the length doesn't divide evenly." },
        ],
      }}
      uses={{
        heading: "10 situations where a roof truss calculator helps",
        items: [
          { title: "Requesting a truss quote", body: "Know the count, span and pitch before calling a truss supplier." },
          { title: "Pole barn or garage", body: "Count trusses for a long building at 24 in or wider spacing." },
          { title: "Shed kits", body: "Check a kit's truss count against your own length." },
          { title: "Budgeting", body: "Multiply the count by a quoted price per truss." },
          { title: "Comparing spacings", body: "See how many fewer trusses 24 in spacing needs than 16 in." },
          { title: "Delivery planning", body: "The count and top chord length help plan how the load is handled on site." },
          { title: "Checking a closing space", body: "When the length isn't a multiple of the spacing, see the size of the last bay." },
          { title: "Overhang decisions", body: "See how the overhang lengthens each top chord." },
          { title: "Rise for headroom", body: "The rise at the ridge shows how much attic height a pitch gives." },
          { title: "Comparing with stick framing", body: "Use alongside the rafter length calculator for a stick-framed alternative." },
        ],
      }}
      dataSection={{
        heading: "What this calculates — and what only a truss designer can",
        paragraphs: [
          "The count is arithmetic: one truss at each end, one at every spacing along the length, and one extra when a shorter closing space is left so no space is wider than the spacing you entered. The outline uses the same right-triangle geometry as a common rafter: run = span ÷ 2, rise = run × pitch ÷ 12, and the top chord's line length per side = (run + overhang) × √(144 + pitch²) ÷ 12.",
          "Trusses are engineered products. The 2021 International Residential Code requires truss design drawings to be provided to the building official and approved before installation (R802.10.1), requires wood trusses to be designed in accordance with accepted engineering practice, with metal-plate-connected trusses complying with ANSI/TPI 1 (R802.10.2), and prohibits cutting, notching, drilling, splicing or otherwise altering truss members without approval (R802.10.4).",
          "So this page is for counting, budgeting and talking to a supplier. It does not size chords or webs, choose a truss type, set heel heights, check loads or produce anything a building official will accept.",
          "Everything runs in your browser; nothing is sent or stored.",
        ],
        sources: [{ label: "2021 International Residential Code — Chapter 8, Roof-Ceiling Construction (R802.10)", href: IRC_CH8_URL, note: "Truss design drawings, design, and alterations" }],
      }}
      faqs={[
        { question: "How many trusses do I need for a 40 ft building?", answer: "At 24 in on centre, 40 ft is 20 spaces, so 21 trusses including both ends." },
        { question: "How do I calculate truss count?", answer: "Divide the length in inches by the spacing, round down, add one, and add one more if there's a leftover shorter space." },
        { question: "Are gable end trusses included?", answer: "Yes, the count includes a truss at each end. Gable-end trusses are often a different design; tell your supplier." },
        { question: "What spacing are roof trusses?", answer: "24 in on centre is common, but the spacing is set by the truss design for your loads." },
        { question: "Can I design my own trusses with this?", answer: "No. The IRC requires engineered truss design drawings approved before installation." },
        { question: "What is the top chord length?", answer: "The sloped member from the heel to the peak, here including the overhang, measured along its line before cuts." },
      ]}
    >
      <RoofTrussTool />
    </ToolPageLayout>
  );
}
