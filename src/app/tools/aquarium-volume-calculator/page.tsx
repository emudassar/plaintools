import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import AquariumVolumeTool from "@/components/AquariumVolumeTool";
import { requireTool } from "@/config/tools";

const SLUG = "aquarium-volume-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Aquarium Volume Calculator: Gallons and Litres for Any Tank Shape",
  description:
    "Work out a fish tank's volume in gallons and litres — rectangle, bow front, cylinder, hexagon or corner — with the real water level after substrate and the gap below the rim, plus the water's weight.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function AquariumVolumeCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate aquarium volume",
        steps: [
          { name: "Pick the shape", text: "Choose rectangle, bow front, cylinder, hexagon, quarter-circle corner or pentagon corner." },
          { name: "Measure inside the glass", text: "Enter inside dimensions in inches or centimetres; outside measurements include the glass and overstate the volume." },
          { name: "Allow for water level and substrate", text: "Enter the gap between the water and the rim and the depth of sand or gravel." },
          { name: "Read gallons, litres and weight", text: "The result is the water volume in US gallons and litres, the full-to-rim volume, and the water's weight." },
        ],
      }}
      uses={{
        heading: "10 situations where an aquarium volume calculation helps",
        items: [
          { title: "Dosing medication or water conditioner", body: "Doses are per gallon or litre; dosing by the label's nominal size instead of the real water volume can overdose fish." },
          { title: "Checking a second-hand tank's size", body: "A tank with no label can be measured and its real capacity worked out." },
          { title: "Sizing a filter or heater", body: "Equipment is rated by tank volume; the real figure avoids an undersized heater." },
          { title: "Planning a stand or floor load", body: "Water alone weighs 8.34 lb per gallon, so a 55-gallon tank holds over 400 lb of water before glass and rock." },
          { title: "Working out a bow front tank", body: "The curved front adds a circular segment that simple length × width misses." },
          { title: "Measuring a cylinder or hexagon tank", body: "Odd shapes are where guesses go most wrong." },
          { title: "Water changes", body: "Knowing the true volume turns a 25% change into a number of gallons or buckets." },
          { title: "Salt mixing for a marine tank", body: "Salt is mixed per gallon; the water volume after substrate is what matters." },
          { title: "Converting between gallons and litres", body: "European tanks in litres and US equipment in gallons, shown side by side." },
          { title: "Building a custom tank or sump", body: "Try dimensions before ordering glass to hit a target volume." },
        ],
      }}
      dataSection={{
        heading: "How the volume is worked out",
        paragraphs: [
          "Volume is the footprint area times the water height, divided by 231 cubic inches per US gallon. One gallon is 3.785411784 litres. Both conversions are from NIST Handbook 44, Appendix C. The water's weight uses 8.34 pounds per gallon, the figure the USGS Water Science School gives; the metric weight takes one litre of fresh water as one kilogram.",
          "Footprints: rectangle = length × width; cylinder = π × diameter² ÷ 4; regular hexagon measured flat to flat = (√3 ÷ 2) × width²; bow front = length × depth at the ends plus the circular segment formed by the bow; quarter-circle corner = π × side² ÷ 4; pentagon corner = side² minus the two triangles cut off the front, side² − cut² ÷ 2.",
          "The water height is the tank height minus the gap below the rim and the substrate depth. Everything is calculated in your browser.",
          "Limits: rock, wood, plants and equipment displace water, so the real volume is lower still. Glass thickness matters if you measure outside. Saltwater is denser than fresh water, so it weighs a little more than shown.",
        ],
        sources: [
          { label: "NIST Handbook 44, Appendix C", href: "https://www.nist.gov/pml/owm/publications/nist-handbooks/handbook-44", note: "1 gallon = 231 in³ = 3.785411784 L" },
          { label: "USGS Water Science School — A Million Gallons of Water", href: "https://www.usgs.gov/water-science-school/science/a-million-gallons-water-how-much-it", note: "8.34 pounds per gallon" },
        ],
      }}
      faqs={[
        { question: "How do I calculate the volume of a fish tank in gallons?", answer: "Multiply length × width × water height in inches and divide by 231. A 48 × 13 × 21 in tank holds 56.7 gallons filled to the rim." },
        { question: "How do I calculate aquarium volume in litres?", answer: "Multiply length × width × height in centimetres and divide by 1,000. A 100 × 40 × 50 cm tank is 200 litres." },
        { question: "Should I measure inside or outside the glass?", answer: "Inside. Outside measurements include the glass and make the tank seem larger than it is." },
        { question: "How much does a full aquarium weigh?", answer: "Water alone weighs about 8.34 lb per gallon, so 50 gallons of water is about 417 lb, plus the glass, stand, substrate and rock." },
        { question: "Does substrate reduce the water volume?", answer: "Yes. The calculator subtracts the substrate depth and the gap below the rim from the height." },
        { question: "How do I work out a bow front tank?", answer: "Take the rectangle up to the ends of the bow, then add the curved segment: the calculator does this from the length, end depth and how far the front bows out." },
        { question: "Why is my tank's real volume less than its label?", answer: "Labels are usually nominal and measured outside; the water level, substrate and decorations all take space." },
      ]}
    >
      <AquariumVolumeTool />
    </ToolPageLayout>
  );
}
