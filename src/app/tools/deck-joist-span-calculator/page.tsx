import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DeckJoistSpanTool from "@/components/DeckJoistSpanTool";
import { requireTool } from "@/config/tools";

const SLUG = "deck-joist-span-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Deck Joist Span Calculator: IRC Table R507.6 Spans and Cantilevers",
  description:
    "Maximum deck joist span by species, size and spacing — a 2×8 southern pine joist at 16\" spans 11'-10\" at 40 psf — plus the cantilever for your back span and snow loads to 70 psf, from IRC Table R507.6.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function DeckJoistSpanCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to look up a deck joist span",
        steps: [
          {
            name: "Choose the design load",
            text: "Table R507.6 has rows for a 40 psf live load and for 50, 60 and 70 psf ground snow loads. Your building department can say which applies where you are.",
          },
          {
            name: "Pick the species group",
            text: "The table groups lumber into southern pine; Douglas fir-larch, hem-fir and spruce-pine-fir; and redwood, western cedars, ponderosa pine and red pine. The grade stamp on the lumber names the species.",
          },
          {
            name: "Pick the joist size and spacing",
            text: "Choose 2×6 to 2×12 and 12, 16 or 24 inches on center. The headline is the maximum span between supports.",
          },
          {
            name: "Check your own span",
            text: "Enter the span you plan in decimal feet to see whether it is within the table's maximum.",
          },
          {
            name: "Look up the cantilever",
            text: "Enter the back span (the joist span behind the beam) to get the maximum cantilever past the beam. The table allows interpolation between its columns but not extrapolation beyond them.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where a joist span lookup helps",
        items: [
          {
            title: "Sketching a deck before a permit",
            body: "A homeowner planning a 12-ft deep deck can see which joist size and spacing the table allows for that span before drawing the plan.",
          },
          {
            title: "Choosing between 2×8 and 2×10",
            body: "At 16\" on center in southern pine, a 2×8 spans 11'-10\" and a 2×10 14'-0\" at 40 psf — enough to decide whether the bigger joist or an extra beam is needed.",
          },
          {
            title: "Building where it snows",
            body: "Snow-load rows reduce the spans; a 2×10 southern pine joist at 16\" drops from 14'-0\" at 40 psf to 11'-11\" at 70 psf ground snow.",
          },
          {
            title: "Working with cedar or redwood",
            body: "The redwood and cedar group has shorter spans than southern pine for the same size, which matters when the deck is built from naturally durable lumber.",
          },
          {
            title: "Planning a cantilever past the beam",
            body: "The cantilever depends on the back span, not the spacing. The tool reads the right column, or interpolates between two.",
          },
          {
            title: "Answering an inspector's question",
            body: "The table and its footnotes are shown in one place, so the joist choice can be traced to the code table.",
          },
          {
            title: "Reviewing a contractor's bid",
            body: "A homeowner can check that the joist size and spacing in a quote is within the table for the span shown.",
          },
          {
            title: "Switching to 24-inch spacing",
            body: "Wider spacing shortens the span. The tool shows all three spacings side by side, and the code limits spacing further by decking type.",
          },
          {
            title: "Teaching a framing class",
            body: "Students can see how species, size, spacing and load each change the allowable span.",
          },
          {
            title: "Comparing with the DCA 6 guide",
            body: "AWC's DCA 6 deck guide prints the same 40 psf spans; the IRC table adds snow loads and back-span cantilevers.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the spans come from",
        paragraphs: [
          "Every number is from International Residential Code Table R507.6, 'Maximum Deck Joist Spans', read on the International Code Council's public code website in both the 2021 and 2024 editions. All 528 span and cantilever cells are identical in the two editions. Section R507.6 says maximum spans for wood deck joists shall be in accordance with this table and that joist spacing is also limited by the decking (Table R507.7).",
          "The table's footnotes: dead load 10 psf, with snow load not assumed to act at the same time as live load; No. 2 grade with the wet service factor included; deflection L/360 at the main span; L/180 at the cantilever with a 220-pound point load at its end; the Douglas fir-larch, hem-fir and spruce-pine-fir group includes an incising factor and the redwood, cedar and pine group does not; interpolation between back spans is allowed and extrapolation is not. NP means not permitted.",
          "As a cross-check, the 40 psf spans match Table 2 of the American Wood Council's 'Prescriptive Residential Wood Deck Construction Guide' (DCA 6-2015) for every species group, size and spacing. DCA 6 gives overhangs by spacing rather than by back span, so its overhang figures are not used here. Interpolated cantilevers are rounded down to the inch. Nothing is fetched while you use the page.",
          "The limits: this is a span table, not a deck design. It does not size beams, ledgers, posts, footings or connections, and it assumes the lumber, grade and loads in its footnotes. Jurisdictions adopt different editions and amendments; your building department decides what applies and approves the design.",
        ],
        sources: [
          {
            label: "ICC — 2024 International Residential Code, Chapter 5 (Section R507)",
            href: "https://codes.iccsafe.org/content/IRC2024P2/chapter-5-floors",
            note: "Table R507.6 Maximum Deck Joist Spans and footnotes; Table R507.7",
          },
          {
            label: "ICC — 2021 International Residential Code, Chapter 5 (Section R507)",
            href: "https://codes.iccsafe.org/content/IRC2021P2/chapter-5-floors",
            note: "Same Table R507.6",
          },
          {
            label: "American Wood Council — DCA 6-2015 Prescriptive Residential Wood Deck Construction Guide (PDF)",
            href: "https://web-media.awc.org/wp-content/uploads/2022/02/17210514/AWC-DCA62015-DeckGuide-1804.pdf",
            note: "Table 2 Maximum Joist Spans and Overhangs (40 psf cross-check)",
          },
        ],
      }}
      faqs={[
        {
          question: "How far can a 2×8 deck joist span?",
          answer:
            "At 40 psf live load and 16\" on center: 11'-10\" in southern pine, 11'-1\" in Douglas fir-larch, hem-fir or SPF, and 10'-7\" in redwood, western cedars, ponderosa pine or red pine (IRC Table R507.6).",
        },
        {
          question: "How far can a 2×10 deck joist span?",
          answer:
            "At 40 psf and 16\" on center: 14'-0\" southern pine, 13'-7\" Douglas fir-larch / hem-fir / SPF, 13'-0\" redwood and cedar group. At 12\" on center the figures rise to 16'-2\", 15'-8\" and 14'-11\".",
        },
        {
          question: "Is the span measured to the end of the cantilever?",
          answer:
            "No. The allowable span is between supports — for example from the ledger to the beam. The cantilever past the beam is looked up separately from the back span.",
        },
        {
          question: "How far can deck joists cantilever?",
          answer:
            "It depends on the back span and the joist. In the 40 psf table a 2×10 southern pine joist can cantilever 2'-0\" with an 8 ft back span and 3'-0\" with 12 ft; some short or long combinations are NP (not permitted).",
        },
        {
          question: "What joist spacing does my decking allow?",
          answer:
            "The 2024 IRC Table R507.7 limits spacing by decking: for 1-1/4\"-thick wood decking, 12\" (single span) or 16\" (multiple span) perpendicular to the joists and 8\" or 12\" diagonal; for 2\"-thick wood, 24\" perpendicular and 18\" or 24\" diagonal. Plastic composite decking follows its own rules (R507.2).",
        },
        {
          question: "Is this the same as the DCA 6 span table?",
          answer:
            "The 40 psf spans are the same as AWC DCA 6-2015 Table 2. The IRC table adds 50, 60 and 70 psf snow loads and gives cantilevers by back span instead of by spacing.",
        },
        {
          question: "Which species group is pressure-treated lumber?",
          answer:
            "Pick the species named on the lumber's grade stamp. AWC DCA 6 Table 1 lists southern pine, Douglas fir-larch, hem-fir, SPF (above ground only), ponderosa pine, red pine, redwood and western cedars as preservative-treated species.",
        },
      ]}
    >
      <DeckJoistSpanTool />
    </ToolPageLayout>
  );
}
