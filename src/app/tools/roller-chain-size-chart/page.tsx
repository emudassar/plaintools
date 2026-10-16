import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import RollerChainTool from "@/components/RollerChainTool";
import { requireTool } from "@/config/tools";

const SLUG = "roller-chain-size-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Roller Chain Size Chart: Identify ANSI Chain by Pitch (25 to 240)",
  description:
    "Measure a roller chain's pitch, roller diameter and inner width and identify its ANSI number, with a full size chart for #25 to #240 — pitch, roller, width, pin, plate, tensile strength and weight.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function RollerChainSizeChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to measure roller chain size",
        steps: [
          { name: "Measure the pitch", text: "Measure from the centre of one pin to the centre of another several links away — 10 pitches (11 pins) is easy to divide." },
          { name: "Enter the length and the number of pitches", text: "The page divides one by the other to get the pitch." },
          { name: "Add the roller diameter", text: "Optional: calipers across a roller help confirm the size." },
          { name: "Add the inner width", text: "Optional: the gap between the inner plates separates chains that share a pitch, such as 40 and 41." },
          { name: "Read the ANSI number", text: "The match appears at the top and is highlighted in the chart." },
        ],
      }}
      uses={{
        heading: "10 situations where a chain size chart helps",
        items: [
          { title: "Replacing a worn chain", body: "An unmarked chain on a machine can be identified from a tape-measure reading." },
          { title: "Buying sprockets", body: "Sprockets are sold by chain number; the chain's size sets the sprocket you need." },
          { title: "Go-karts and mini bikes", body: "Most use #35, #40 or #41; the pitch and width tell them apart." },
          { title: "Telling #40 from #41", body: "Both are 1/2 in pitch; #41 is narrower and lighter. The inner width settles it." },
          { title: "Farm and conveyor equipment", body: "Larger drives use #60 to #120; the chart lists their dimensions and weight." },
          { title: "Ordering by length", body: "Pitch × number of links gives the chain length to order." },
          { title: "Comparing chain strength", body: "The chart lists the ISO 606 minimum tensile strength for each size." },
          { title: "Estimating weight for shipping", body: "Mass per metre is listed for each size." },
          { title: "Checking a parts listing", body: "Compare a listing's dimensions with the standard for that number." },
          { title: "Learning chain numbering", body: "The leading digits of the ANSI number give the pitch in eighths of an inch." },
        ],
      }}
      dataSection={{
        heading: "Where the dimensions come from",
        paragraphs: [
          "The chart is Tsubaki Europe's published single-strand table for its ANSI G8 standard roller chain, read on the date shown on the result: pitch, roller diameter, inner width, pin diameter, link plate thickness and height, ISO 606 minimum tensile strength and approximate mass, for sizes #25 to #240. Values are in millimetres as printed; inch figures are conversions at 25.4 mm per inch. Two Tsubaki-specific sizes in that table (RS37 and RS38) are left out; #41 is the standard light-duty ANSI size.",
          "The page divides the length you measure by the number of pitches it spans to get the pitch, picks the ANSI size with the nearest pitch, and — where two sizes share a pitch — uses the roller diameter and inner width to rank them. A measured pitch more than 5% from every listed size is reported as no match.",
          "Everything runs in your browser; nothing is sent or stored.",
          "Limits: the table is one manufacturer's figures for ANSI standard chain; other makers' dimensions can differ slightly, and heavy, double-pitch, metric (ISO/BS) and motorcycle chains are not covered. Worn chain measures longer than new. Tensile strength is a minimum breaking load, not a working load — selecting a chain for a drive needs the maker's selection procedure.",
        ],
        sources: [
          { label: "Tsubaki Europe — ANSI G8 standard roller chain", href: "https://tsubaki.eu/products/chain/drive-chain/standard-roller-chain/ansi-g8/", note: "Single-strand dimension and strength tables" },
        ],
      }}
      faqs={[
        { question: "How do I tell what size roller chain I have?", answer: "Measure the pitch — the distance between pin centres. 1/4 in is #25, 3/8 in #35, 1/2 in #40 or #41, 5/8 in #50, 3/4 in #60 and 1 in #80." },
        { question: "What is the difference between #40 and #41 chain?", answer: "Both have a 1/2 in pitch. In Tsubaki's table #40 has a 7.95 mm inner width and 7.92 mm rollers; #41 has a 6.38 mm inner width and 7.77 mm rollers and is lighter." },
        { question: "What does the chain number mean?", answer: "The digits before the last give the pitch in eighths of an inch: #40 is 4/8 = 1/2 in, #80 is 8/8 = 1 in." },
        { question: "What is the pitch of #35 chain?", answer: "3/8 in (9.525 mm), with a 5.08 mm roller and 4.78 mm inner width." },
        { question: "Why measure over 10 links?", answer: "Small errors average out. 10 pitches of #40 chain measure 5 in." },
        { question: "Does this cover motorcycle chain like 420 or 530?", answer: "No. Motorcycle chains share pitches with ANSI sizes but have their own widths; this chart covers ANSI standard chain only." },
        { question: "How strong is #40 chain?", answer: "Tsubaki lists a 15.2 kN minimum tensile strength to ISO 606 for single-strand RS40. That is a breaking figure, not a working load." },
      ]}
    >
      <RollerChainTool />
    </ToolPageLayout>
  );
}
