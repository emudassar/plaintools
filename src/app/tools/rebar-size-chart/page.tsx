import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import RebarChartTool from "@/components/RebarChartTool";
import { requireTool } from "@/config/tools";

const SLUG = "rebar-size-chart";
// Fails the build if the registry entry is missing, so a page can never exist
// without being wired into the nav, footer and sitemap.
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Rebar Size Chart: Diameter, Area and Weight for #3–#11",
  description:
    "Pick a US rebar bar size and get its diameter, cross-sectional area and weight per foot, in US and metric units, from a state DOT's published reinforcement table. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function RebarSizeChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to read a rebar bar size",
        steps: [
          {
            name: "Pick the bar number",
            text: "US rebar is sold by a bar number, #3 through #11 for the sizes this table covers, stamped on the bar itself or specified on drawings as #4, #5, and so on.",
          },
          {
            name: "Read the diameter",
            text: "Diameter increases in roughly 1/8-inch steps for bars #3 through #8 — a #4 bar is nominally 0.500 inch, close to '4 eighths.' Above #8, the numbering switches to being based on equivalent round-bar area rather than a clean fraction of an inch, which is why #9, #10 and #11 have less obviously patterned diameters (1.128, 1.270 and 1.410 inches).",
          },
          {
            name: "Check the cross-sectional area if you're calculating reinforcement ratio",
            text: "Area is what actually matters for strength calculations, not diameter — it's shown in both square inches and square millimetres for whichever the project's drawings use.",
          },
          {
            name: "Enter a length for a total weight",
            text: "Add a length and pick feet or metres to multiply the table's own weight-per-foot (or per-metre) figure by your length, useful for a quick material estimate.",
          },
          {
            name: "Use the full table for a side-by-side comparison",
            text: "The complete #3–#11 table is shown below the selected bar's detail, with the chosen row highlighted, so you can compare adjacent sizes without switching selections repeatedly.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the exact bar dimensions matter",
        items: [
          {
            title: "Checking a delivery ticket's weight against the bar size ordered",
            body: "A load of #5 rebar should weigh close to 1.043 lb per linear foot. Multiplying the delivered length by that figure and comparing it to the ticket catches a wrong-size delivery before it's used.",
          },
          {
            title: "Converting a metric drawing's bar callout to what a US supplier stocks",
            body: "A drawing specifying a 16 mm bar corresponds to a US #5 (15.9 mm nominal diameter), close enough that ordering the wrong US size from a metric spec is an easy, expensive mistake to avoid by checking the table directly.",
          },
          {
            title: "Estimating steel weight for a small footing pour",
            body: "Knowing the total linear feet of #4 bar going into a footing, multiplying by 0.668 lb/ft gives a material weight estimate without a separate spreadsheet or supplier catalog lookup.",
          },
          {
            title: "Settling what '#5 rebar' actually measures between two documents",
            body: "A subcontractor's submittal and an engineer's spec sometimes use slightly different shorthand for the same bar. Checking both against the same cited table settles the diameter and area in one lookup rather than trusting either document's own restatement.",
          },
          {
            title: "Working out reinforcement ratio for a slab section by hand",
            body: "Reinforcement ratio calculations need cross-sectional area, not diameter — pulling the exact 0.196 sq in for a #4 bar rather than approximating from the nominal 0.5-inch diameter avoids compounding a rounding error into a structural check.",
          },
          {
            title: "Deciding whether #9 rebar's diameter is a typo on a drawing",
            body: "1.128 inches looks like an odd number until it's clear that bar sizes above #8 are based on equivalent round-bar area rather than a clean eighth-inch step — seeing the pattern break at #9 in the full table answers the question directly.",
          },
          {
            title: "Comparing #10 and #11 bar weight before choosing between them for a column",
            body: "4.303 lb/ft versus 5.313 lb/ft is a real difference in total steel weight and cost across a whole column schedule, and the table shows both side by side rather than requiring two separate lookups.",
          },
          {
            title: "Checking a fabricator's cut list weight total before accepting a quote",
            body: "A quote listing total tonnage for a mixed order of bar sizes can be spot-checked line by line against this table's weight-per-foot figures, catching a miscounted bar size before it affects the price.",
          },
          {
            title: "Explaining to a homeowner why '#4 rebar' isn't simply '4 inches thick'",
            body: "The bar-number naming convention is unfamiliar outside the trade. Showing the actual 0.500-inch diameter next to the '#4' label the contractor used answers a common point of confusion in plain terms.",
          },
          {
            title: "Cross-checking a DIY project's rebar spacing against a bar size's area",
            body: "A DIY concrete project (a shed slab, a fence post footing) that references a generic 'use rebar' instruction can be checked against the actual area a chosen bar size provides, rather than guessing whether #3 or #4 is enough for the load in question.",
          },
        ],
      }}
      dataSection={{
        heading: "Where these numbers come from",
        paragraphs: [
          "The bar-numbering system for US reinforcing steel — #3 through #18 — is defined by ASTM A615 and ASTM A706, the standard specifications for deformed and plain carbon-steel bars for concrete reinforcement. Those ASTM documents are paywalled and were not read for this page. What every US state highway agency needs, and freely publishes, is the same physical dimensions in its own design standards, because state DOTs write bridge and pavement specifications against these bars every day. This page cites one such publication directly: Illinois Department of Transportation Standard 001001-02, \"Areas of Reinforcement Bars,\" issued 1997 and most recently revised in 2009, which tabulates diameter, cross-sectional area and weight per foot for bars #3 through #11 in both US customary and metric units.",
          "This is a lookup, not a live calculation: the table above is compiled into the page exactly as read from the source PDF, cross-checked by rendering the source page as an image and reading it a second, independent way, and further checked against the geometric relationship between diameter and area (area = π/4 × diameter², which matches every row in the table to within rounding). Only the optional total-weight figure is arithmetic — the table's own weight-per-foot number multiplied by the length you enter — and nothing is fetched from Illinois DOT or anywhere else while you use the tool.",
          "The limits are worth stating plainly. This table gives nominal dimensions only, republished from a state DOT design standard rather than measured or tested here. It does not specify steel grade, yield strength, dimensional tolerance, bend diameter, development length or anything else a real project's own specification and the ASTM standards themselves govern. It also stops at #11: bars #14 and #18 exist under the same ASTM system but aren't covered by the source table used here, so this page doesn't offer them rather than estimating figures for them.",
          "What this page must not be used for is a substitute for a project's structural specification or the ASTM standards that actually govern reinforcing steel. It reports what a cited state DOT table says a given bar number's dimensions are. It does not size reinforcement for a structural application, does not specify grade or coating, and does not replace an engineer's own calculations or a fabricator's certified mill test report for material actually delivered to a job site.",
        ],
        sources: [
          {
            label: "Illinois DOT — Standard 001001-02, Areas of Reinforcement Bars",
            href: "https://idot.illinois.gov/content/dam/soi/en/web/idot/documents/doing-business/standards/highway-standards/pdf/226-001001-02_areasofreinfrebars.pdf",
            note: "the diameter, area and weight figures used in this table",
          },
          {
            label: "ASTM International — A615/A615M",
            href: "https://www.astm.org/a0615_a0615m-24.html",
            note: "the underlying standard specification that defines the bar-numbering system (paywalled; not read for this page)",
          },
        ],
      }}
      faqs={[
        {
          question: "Is this the same as the ASTM standard?",
          answer:
            "Same dimensions, different publisher. ASTM A615 and A706 define the bar-numbering system and are paywalled standards this page doesn't reproduce or claim to quote. Illinois DOT's Standard 001001-02 republishes the same physical dimensions for highway design use, which is what this page actually cites and links.",
        },
        {
          question: "Why does #9 have an oddly specific diameter (1.128 inches)?",
          answer:
            "Bar numbering for sizes #3 through #8 tracks roughly 1/8-inch increments — a #4 bar is close to '4 eighths' of an inch (0.500 in). Above #8, the numbering is instead based on the diameter of an equivalent round bar with the same cross-sectional area as older square-bar sizing, which is why #9, #10 and #11 have less obviously patterned diameters. The table shows the actual figures rather than a rounded approximation.",
        },
        {
          question: "Does this cover metric rebar sizes?",
          answer:
            "No — this table is keyed to US bar numbers #3 through #11, with metric diameter, area and weight shown alongside each US size for reference. It doesn't include soft-metric bar designations (like 15M or 20M) used in some other countries' systems.",
        },
        {
          question: "Why do #14 and #18 not appear in the table?",
          answer:
            "The cited Illinois DOT standard's table stops at #11. Rather than estimate figures for #14 and #18 from a pattern, this page simply doesn't offer them — they exist under the same ASTM system but aren't in the source used here.",
        },
        {
          question: "Can I use this instead of a project's structural specification?",
          answer:
            "No. This page reports nominal dimensions from a cited table — diameter, area and weight per foot. It says nothing about the grade, yield strength, coating, tolerance or bend requirements a real project's specification and the ASTM standards themselves set, all of which matter for what actually gets used on a job.",
        },
        {
          question: "How accurate is the total weight calculation?",
          answer:
            "It's the table's own published weight-per-foot (or per-metre) figure multiplied by the length you enter — arithmetic on a cited number, not a separately estimated figure. Actual delivered weight can vary slightly from nominal due to normal manufacturing tolerance, which is why a fabricator's own mill certificate is the figure to use for a real material acceptance, not this calculation.",
        },
        {
          question: "Can I reuse these figures?",
          answer:
            "The table is a public state government publication and the dimensions are yours to use. Cite Illinois DOT's Standard 001001-02 rather than this page, and check the source PDF directly, since design standards are periodically revised and this page reflects the version retrieved on the date shown on the result.",
        },
      ]}
    >
      <RebarChartTool />
    </ToolPageLayout>
  );
}
