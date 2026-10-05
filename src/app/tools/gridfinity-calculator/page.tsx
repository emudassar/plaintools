import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GridfinityTool from "@/components/GridfinityTool";
import { requireTool } from "@/config/tools";

const SLUG = "gridfinity-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Gridfinity Calculator: Drawer Grid Size, Bin Height and Baseplates",
  description:
    "Enter your drawer's inside size to get how many 42 mm Gridfinity units fit, the leftover margin, the tallest bin in 7 mm height units, and how to split the baseplate for your print bed.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function GridfinityCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to plan Gridfinity for a drawer",
        steps: [
          { name: "Measure the drawer inside", text: "Measure the inside width, depth and height at the narrowest point, in millimetres or inches." },
          { name: "Enter your print bed", text: "Give the usable width of your printer's bed so the baseplate can be split into printable pieces." },
          { name: "Set the bin options", text: "Tick the stacking lip if your bins have it, and enter any floor thickness under the bins, such as a solid or magnet baseplate." },
          { name: "Read the layout", text: "The result is the grid in units, the leftover margin on each side, the tallest bin that fits, and the baseplate pieces to print." },
        ],
      }}
      uses={{
        heading: "10 situations where a Gridfinity calculation helps",
        items: [
          { title: "Planning a kitchen drawer before printing", body: "Knowing it's 11 × 10 units first avoids printing a baseplate that is one unit too wide to go in." },
          { title: "Splitting a baseplate for a small printer", body: "A 220 mm bed fits 5 units a side, so an 11-unit row becomes pieces of 4 + 4 + 3." },
          { title: "Choosing bin heights for a shallow drawer", body: "The height result says whether 3u or 6u bins will close in the drawer." },
          { title: "Organising a toolbox or IKEA Alex drawer", body: "Measure the drawer, and the margin result shows how much spacer is needed to stop the grid sliding." },
          { title: "Accounting for magnet baseplates", body: "Thicker baseplates take height from the bins; enter the floor thickness." },
          { title: "Working from inch measurements", body: "Enter inches and the tool converts to the 42 mm grid." },
          { title: "Estimating print time and filament", body: "The number of units and plates is the starting point for how much to print." },
          { title: "Checking a desk drawer for stackable bins", body: "Turning the lip on or off shows how much height the stacking lip costs." },
          { title: "Designing a custom spacer", body: "The leftover on each side is the width a filler piece must be." },
          { title: "Comparing drawers", body: "Run each drawer to see which gives the best use of whole units." },
        ],
      }}
      dataSection={{
        heading: "Where the dimensions come from",
        paragraphs: [
          "Gridfinity is an open, modular storage system designed by Zack Freedman. The dimensions used here are from the Gridfinity Design Reference v5 published on gridfinity.xyz (graphic by willtree8, licensed CC BY-NC-SA): a 42 × 42 mm baseplate unit, bins of 41.5 × 41.5 mm (0.5 mm tolerance), a height unit of 7 mm where each extra unit adds 7 mm, a stacking lip of about 4.4 mm, and a baseplate about 5 mm tall. The page itself says the specification is a work in progress.",
          "Units across = drawer width ÷ 42 mm, rounded down; the same for depth. The leftover is split equally between the two sides. The tallest bin is the drawer height, less any floor under the bins and the lip if used, divided by 7 mm and rounded down. Baseplate pieces are split into the fewest near-equal pieces that fit the print bed.",
          "Height is counted from the drawer floor with bins seated in an open frame baseplate. A solid-floor or magnet baseplate raises the bins by its floor thickness, which you can enter. Everything is calculated in your browser.",
          "Limits: real prints vary with printer calibration and material shrinkage, and some designs (half-grid, lite baseplates) change the numbers. Leave a little slack and test-print one piece first.",
        ],
        sources: [
          { label: "Gridfinity — specification (Design Reference v5)", href: "https://gridfinity.xyz/specification/", note: "42 mm grid, 41.5 mm bins, 7 mm height unit, ~4.4 mm lip, ~5 mm baseplate" },
        ],
      }}
      faqs={[
        { question: "How big is a Gridfinity unit?", answer: "42 × 42 mm on the baseplate. Bins are 41.5 × 41.5 mm, leaving 0.5 mm of tolerance." },
        { question: "How tall is a Gridfinity height unit?", answer: "7 mm. Each extra unit adds 7 mm, and a stacking lip adds about 4.4 mm on top." },
        { question: "How many Gridfinity units fit in my drawer?", answer: "Divide the inside width and depth by 42 mm and round down. A 500 × 420 mm drawer fits 11 × 10 units." },
        { question: "What do I do with the leftover space?", answer: "The calculator shows the margin on each side. Many people print spacers or let the grid sit to one side; the spec does not define fillers." },
        { question: "How do I split a baseplate for my printer?", answer: "Divide the bed size by 42 mm to get the most units per side, then split each direction into near-equal pieces no larger than that." },
        { question: "What bin height fits my drawer?", answer: "Subtract the lip (if your bins have one) and any floor under the bins from the drawer height, divide by 7 mm, and round down." },
      ]}
    >
      <GridfinityTool />
    </ToolPageLayout>
  );
}
