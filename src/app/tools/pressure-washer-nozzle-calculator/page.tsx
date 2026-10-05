import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PressureWasherNozzleTool from "@/components/PressureWasherNozzleTool";
import { requireTool } from "@/config/tools";

const SLUG = "pressure-washer-nozzle-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Pressure Washer Nozzle Calculator: Orifice Size from GPM and PSI",
  description:
    "Nozzle size = GPM × √(4000 ÷ PSI): a 4 GPM, 3,000 PSI washer works out to size 4.62, between 4.5 (3,160 PSI) and 5 (2,560 PSI). From General Pump's nozzle chart.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PressureWasherNozzleCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out a pressure washer nozzle size",
        steps: [
          {
            name: "Find the machine's rating",
            text: "Read the rated flow (GPM) and pressure (PSI) from the label or manual. Convert bar to PSI first if needed (1 bar ≈ 14.5 PSI).",
          },
          {
            name: "Enter GPM and PSI",
            text: "The calculator works out size = GPM × √(4000 ÷ PSI). In General Pump's chart, a nozzle's size number is the flow it passes at 4,000 PSI.",
          },
          {
            name: "Compare the nearest sizes",
            text: "Nozzles come in steps such as 4.0, 4.5 and 5.0. The tool shows the pressure each nearby size would give at your machine's flow.",
          },
          {
            name: "Check the spray angle separately",
            text: "The size sets flow and pressure. The spray angle is a separate choice and does not change the size this calculator gives.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the nozzle size matters",
        items: [
          {
            title: "Replacing a worn nozzle",
            body: "When pressure drops, the replacement needs the right orifice. The tool gives the size for the machine's rated GPM and PSI.",
          },
          {
            title: "Buying a surface cleaner",
            body: "Surface cleaners use two or more nozzles that share the flow. Entering half the machine's GPM gives each nozzle's size for a two-nozzle bar.",
          },
          {
            title: "Setting up a new pump",
            body: "After a pump swap, the nozzle has to match the new pump's flow and pressure.",
          },
          {
            title: "Using a long hose run",
            body: "The chart shows pressure at the nozzle for a given flow, which helps when comparing against what reaches the gun.",
          },
          {
            title: "Reading a nozzle chart",
            body: "The table lists the pressure each nearby size gives at your flow, the same figures a printed nozzle chart holds, worked for your machine.",
          },
          {
            title: "Planning a turbo or rotary nozzle",
            body: "Rotary nozzles are also sold by orifice size. The calculated size is the figure to compare with the maker's sizing for that nozzle.",
          },
          {
            title: "Downstreaming chemicals",
            body: "Soap nozzles have larger orifices to drop pressure. The table shows how much a larger size lowers pressure at your flow.",
          },
          {
            title: "Fleet washing rigs",
            body: "Contractors with several machines can work out the nozzle for each GPM and PSI combination.",
          },
          {
            title: "Diagnosing low pressure",
            body: "If a machine reaches less than its rated pressure with its fitted nozzle, the chart's pressure for that size is a reference point.",
          },
          {
            title: "Metric machines",
            body: "Machines rated in litres per minute and bar can be converted (1 US gal = 3.785 L, 1 bar ≈ 14.5 PSI) and entered.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the sizes come from",
        paragraphs: [
          "The figures come from General Pump's 'General Pump Nozzle Chart' (2021), which lists the flow in gallons per minute for 31 nozzle sizes from 2 to 60 at pressures from 40 to 5,000 PSI, with a reference orifice diameter for each size. In the chart, each size's flow at 4,000 PSI equals its size number, and every other column follows GPM = size × √(PSI ÷ 4000).",
          "We checked that formula against every printed cell: 490 of the 496 are within 0.015 GPM. The six that differ are printing slips — for example size 7 at 2,000 PSI is printed 1.95 GPM where the rest of its row and the formula give 4.95. The calculator uses the formula, so it is not affected by those slips. Rearranged, it gives size = GPM × √(4000 ÷ PSI) and pressure = 4000 × (GPM ÷ size)².",
          "The orifice diameters are shown as the chart prints them; the chart says they are for reference only. Nothing is fetched while you use the page.",
          "The limits: size numbers are a maker's convention. In this chart they mean GPM at 4,000 PSI, but not every catalogue uses that basis — Spraying Systems, for example, lists its WashJet MEG 2540 tip as 4 GPM at 40 PSI — so match the convention of the nozzle you are buying. The chart describes new nozzles. Worn nozzles flow more at lower pressure, and real pressure depends on the pump, unloader, hose and fittings. The equipment makers' ratings and manuals set what a machine can safely run at.",
        ],
        sources: [
          {
            label: "Spraying Systems Co. — WashJet MEG 1/4MEG-2540",
            href: "https://portal.spray.com/en-US/products/1-4meg-2540",
            note: "Rated 4 gpm at 40 psi — a different size convention, cited as a caution",
          },
          {
            label: "General Pump — Nozzle Chart (2021, PDF)",
            href: "https://www.generalpump.com/wp-content/uploads/2021/04/NozzleChart-2021.pdf",
            note: "GPM by nozzle size at 40–5,000 PSI; reference orifice diameters",
          },
        ],
      }}
      faqs={[
        {
          question: "What size nozzle for a 4 GPM 3000 PSI pressure washer?",
          answer:
            "The formula gives 4 × √(4000 ÷ 3000) = 4.62. The nearest chart sizes are 4.5, which gives about 3,160 PSI at 4 GPM, and 5.0, about 2,560 PSI.",
        },
        {
          question: "What size nozzle for 2.5 GPM at 3000 PSI?",
          answer: "2.5 × √(4000 ÷ 3000) = 2.89, between sizes 2.5 (about 4,000 PSI at 2.5 GPM) and 3.0 (about 2,780 PSI).",
        },
        {
          question: "What does the nozzle size number mean?",
          answer:
            "In General Pump's chart, a nozzle's size is the flow in GPM it passes at 4,000 PSI — size 4 passes 4.00 GPM at 4,000 PSI and 2.00 GPM at 1,000 PSI. Not every maker numbers tips this way: Spraying Systems, for example, rates its WashJet MEG 2540 tip at 4 GPM at 40 PSI. Check which convention your nozzle's maker uses.",
        },
        {
          question: "Does a smaller nozzle increase pressure?",
          answer:
            "At the same flow, yes: pressure = 4000 × (GPM ÷ size)². That is why the table shows a higher PSI for each smaller size. The pump and unloader limit what the machine actually reaches.",
        },
        {
          question: "How do I size nozzles for a surface cleaner?",
          answer:
            "The nozzles share the flow, so divide the machine's GPM by the number of nozzles and enter that with the machine's PSI. A 4 GPM, 3,000 PSI machine with two nozzles: 2 GPM each, size 2.31.",
        },
        {
          question: "My machine is rated in bar and L/min. What do I enter?",
          answer: "Convert first: GPM = L/min ÷ 3.785 and PSI = bar × 14.5. For example 15 L/min at 200 bar is about 3.96 GPM at 2,900 PSI.",
        },
      ]}
    >
      <PressureWasherNozzleTool />
    </ToolPageLayout>
  );
}
