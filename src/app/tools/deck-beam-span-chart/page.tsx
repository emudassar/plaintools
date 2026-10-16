import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DeckBeamSpanTool from "@/components/DeckBeamSpanTool";
import { requireTool } from "@/config/tools";

const SLUG = "deck-beam-span-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Deck Beam Span Chart: IRC Table R507.5 by Species and Joist Span",
  description:
    "Pick lumber species, load, joist span and joist cantilever and get the maximum deck beam span for 1-, 2- and 3-ply 2×6 to 2×12 beams from IRC 2024 Table R507.5, plus the allowed beam cantilever.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function DeckBeamSpanChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to read the deck beam span chart",
        steps: [
          { name: "Pick the beam species", text: "Southern pine; Douglas fir-larch, Hem-fir or Spruce-pine-fir; or Redwood, Western cedars, Ponderosa or Red pine." },
          { name: "Pick the load", text: "40 psf live load, or the 50, 60 or 70 psf ground snow load table." },
          { name: "Pick the joist span and cantilever", text: "The length of the joists the beam carries and how far they overhang past it — the pairs printed in the table header." },
          { name: "Read the beam spans", text: "The maximum post-to-post span for every built-up beam, 1–2×6 to 3–2×12." },
          { name: "Optional: enter your span", text: "Enter the post spacing you want and the chart marks which beams are tabulated at that span or more." },
        ],
      }}
      uses={{
        heading: "10 situations where the beam span chart helps",
        items: [
          { title: "Spacing deck posts", body: "The beam span is the post spacing; the chart shows how far apart posts can be for each beam." },
          { title: "Choosing between a 2-ply and 3-ply beam", body: "Compare how many posts each would need along the same beam line." },
          { title: "Drawing a deck permit plan", body: "Permit drawings list beam size and post spacing; the table is what most US plan reviewers check against." },
          { title: "Checking a contractor's design", body: "See whether a quoted beam size and post spacing appear in the code table." },
          { title: "Lengthening the joists", body: "Longer joists load the beam more; the chart shows how much the beam span drops." },
          { title: "Adding a joist overhang", body: "A joist cantilever changes the column the table uses; the chart switches with it." },
          { title: "Building in snow country", body: "The 50, 60 and 70 psf ground-snow tables give shorter spans for the same beam." },
          { title: "Comparing lumber species", body: "Southern pine beams span further than the incised fir group in the same size." },
          { title: "Planning a beam cantilever", body: "The table limits the beam's overhang past a post to a quarter of the adjacent span; the chart works it out." },
          { title: "Estimating a materials list", body: "Beam size and post count feed straight into lumber and footing quantities." },
        ],
      }}
      dataSection={{
        heading: "Where the spans come from",
        paragraphs: [
          "The spans are the International Residential Code 2024 Tables R507.5(1) to R507.5(4), 'Maximum Deck Beam Span', for a 40 psf live load and 50, 60 and 70 psf ground snow loads, read on the ICC's public code website on the date shown on the result. The 2024 tables key each column to a pair of joist span and joist cantilever; this page reproduces those pairs and the cells as printed. The footnotes to the same table, as printed in the 2021 edition, include: interpolation permitted, extrapolation not permitted; beams supporting a single span of joists with or without cantilever; dead load 10 psf with L/Δ = 360 at the main span and 180 at a cantilever; No. 2 grade with the wet service factor included; beam depth at least the depth of a flush-connected joist; and beam cantilevers limited to the adjacent beam's span divided by 4.",
          "Every cell was cross-checked against the 2021 edition, which prints the same values keyed by 'effective joist span'. All seven of its columns matched the corresponding 2024 columns, apart from a few cells where the 2021 web text is visibly garbled (for example '604'). Three 2024 cells break the table's own ordering — a beam spanning further than the next-larger beam, or further than the column to its left — and have no 2021 counterpart. Those cells are shown as 'check printed table' rather than repeated or guessed.",
          "The lookup runs in your browser; nothing is sent or stored.",
          "Limits: the table covers solid-sawn built-up beams of No. 2 grade in the listed species only — not glulam, LVL or steel, not beams carrying point loads, hot tubs or roofs, and not decks outside the IRC's prescriptive scope. Many jurisdictions amend the IRC or adopt an older edition. This page reports what the table says; it is not a design or an approval, and the local building department decides what is permitted.",
        ],
        sources: [
          { label: "IRC 2024 — Chapter 5 Floors (Table R507.5)", href: "https://codes.iccsafe.org/content/IRC2024P2/chapter-5-floors", note: "Maximum deck beam span tables and footnotes" },
          { label: "IRC 2021 — Chapter 5 Floors (Table R507.5)", href: "https://codes.iccsafe.org/content/IRC2021P2/chapter-5-floors", note: "Used for the cell-by-cell cross-check" },
          { label: "AWC — DCA 6 Prescriptive Residential Wood Deck Construction Guide", href: "https://web-media.awc.org/wp-content/uploads/2022/02/17210514/AWC-DCA62015-DeckGuide-1804.pdf", note: "The American Wood Council's companion deck guide" },
        ],
      }}
      faqs={[
        { question: "How far can a 2-ply 2×10 deck beam span?", answer: "It depends on the species, load and joists it carries. For Southern pine at 40 psf with 12 ft joists and no cantilever, IRC Table R507.5(1) gives 9 ft 0 in." },
        { question: "What is the 'joist span and cantilever' choice?", answer: "The 2024 table's columns are keyed to the length of the joists the beam carries plus how far they overhang past the beam. A longer joist or bigger overhang means more load on the beam and a shorter beam span." },
        { question: "How far can a deck beam cantilever past a post?", answer: "The table's footnote limits beam cantilevers to the adjacent beam's span divided by 4. The chart shows that figure for each beam." },
        { question: "Can I interpolate between columns?", answer: "The table's footnote permits interpolation and forbids extrapolation. This page shows only the tabulated values." },
        { question: "Why does a cell say 'check printed table'?", answer: "The value on the code website breaks the table's own ordering and could not be confirmed against the 2021 edition, so it is not repeated here." },
        { question: "Does this cover LVL or glulam beams?", answer: "No. Table R507.5 covers solid-sawn built-up beams. Engineered beams use the manufacturer's span tables." },
        { question: "Is this the same as the AWC DCA 6 table?", answer: "DCA 6 is the American Wood Council's deck guide and has its own beam table. This page uses the IRC 2024 table, which is what many jurisdictions adopt." },
      ]}
    >
      <DeckBeamSpanTool />
    </ToolPageLayout>
  );
}
