import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import OilTankTool from "@/components/OilTankTool";
import { requireTool } from "@/config/tools";

const SLUG = "oil-tank-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Oil Tank Chart: Inches to Gallons for 275, 330, 550 and 1000 Gallon Tanks",
  description:
    "Enter the inches of oil on your dipstick and get the gallons left in a 275 or 330 gallon oval tank (vertical or horizontal), a 500, 550 or 1000 gallon round tank, or your own tank — with the full inch-by-inch chart.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function OilTankChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to read your oil tank in gallons",
        steps: [
          { name: "Pick your tank", text: "A standard 275 or 330 gallon oval tank, standing on end (vertical) or lying flat (horizontal), a round 500, 550 or 1000 gallon tank, or enter your own dimensions." },
          { name: "Stick the tank", text: "Lower a clean wooden stick through the fill pipe to the bottom and read the wet line in inches." },
          { name: "Enter the inches", text: "The gallons, percent full and room left appear at once." },
          { name: "Keep the chart", text: "The full inch-by-inch chart for your tank is listed under the result." },
        ],
      }}
      uses={{
        heading: "10 situations where an oil tank chart helps",
        items: [
          { title: "Ordering a delivery without overfilling", body: "Know how much room is left before the truck arrives, so you order a fill the tank can actually take." },
          { title: "Checking a gauge you don't trust", body: "Float gauges stick. A stick reading and the chart give an independent number." },
          { title: "Avoiding a run-out in a cold snap", body: "Turn inches into gallons and compare with how much you burn per week." },
          { title: "Buying a house with an oil tank", body: "Sellers are often credited for the oil left in the tank; know the gallons, not just 'about a third'." },
          { title: "Checking a delivery ticket", body: "Stick before and after a fill and compare the change with the gallons billed." },
          { title: "Understanding why a vertical tank reads oddly", body: "In an oval tank on end, the first and last inches hold far less oil than the middle ones." },
          { title: "Planning a tank removal", body: "Estimate how much oil has to be pumped out before a tank is taken away." },
          { title: "Comparing a new tank's size", body: "See how much more a 330 holds at the same depth than a 275." },
          { title: "Tracking oil use over a season", body: "Weekly stick readings turned into gallons give a burn rate." },
          { title: "Non-standard tanks", body: "Enter the dimensions of a round, oval or box tank and get a chart for it." },
        ],
      }}
      dataSection={{
        heading: "How the gallons are worked out",
        paragraphs: [
          "There is no single official chart: oil dealers publish their own, built the same way. A tank is treated as a cross-section — an oval (two half-circles joined by straight sides), a circle, or a rectangle — run along its length. The share of the tank that is full is the area of the cross-section below the oil line divided by the whole cross-section, using the standard circular-segment area formula for the rounded parts. That share is multiplied by the tank's rated capacity.",
          "Checked on 2026-10-14 against pickhvac.com's published 275-gallon charts: this method reproduces every row of the vertical chart (44 rows) to within 1.6 gallons, and every row of the horizontal chart (27 rows) to within 2.8 gallons — that chart's own steps are uneven. The geometric volume of the nominal outside dimensions is shown too: a 27\" × 44\" × 60\" oval holds about 268 gallons by geometry against its 275 rating, and a 48\" × 72\" cylinder about 564 gallons against 550.",
          "The preset dimensions are the standard sizes listed by pickhvac.com — 275 and 330 gallon oval tanks 27\" by 44\" and 60\" or 72\" long, and 48\"-diameter cylinders 65\", 72\" and 130\" long for 500, 550 and 1000 gallons — which match Granby's 27\" wide by 44\" tall 330-gallon vertical tank. A tank from another maker may differ by a fraction of an inch.",
          "Limits: the result assumes a level tank, a reading at the centre, and nominal dimensions. Not all of the oil is usable — some sits below the outlet with sludge and water. Nothing here replaces a tank inspection or a dealer's reading for a sale or a dispute.",
        ],
        sources: [
          { label: "pickhvac.com — Oil Tank Standard Sizes", href: "https://www.pickhvac.com/tank/oil-tank-size/", note: "Preset dimensions" },
          { label: "pickhvac.com — 275 Gallon Oil Tank Chart", href: "https://www.pickhvac.com/tank/275-gallon-oil-tank-chart/", note: "Independent chart used to check the method" },
          { label: "Ferguson — Granby 330 gal vertical oil tank", href: "https://www.ferguson.com/product/granby-steel-330-gal-vertical-oil-tank-g205201g/3169312.html", note: "27\" width, 44\" height" },
        ],
      }}
      faqs={[
        { question: "How many gallons are in a 275 gallon oil tank at 10 inches?", answer: "About 51 gallons if the tank stands on end (vertical, 44\" tall), and about 97 gallons if it lies flat (horizontal, 27\" tall)." },
        { question: "How do I know if my 275 tank is vertical or horizontal?", answer: "Vertical tanks stand on their narrow end with the rounded edges at top and bottom and are about 44\" tall. Horizontal tanks lie flat and are about 27\" tall." },
        { question: "Why don't the first few inches hold much oil?", answer: "In a vertical oval tank the bottom is rounded, so the lowest inches are narrow. The middle inches, where the sides are straight, each hold the same amount." },
        { question: "How do I read the gauge on top of my oil tank?", answer: "A float gauge shows roughly how full the tank is (F, ¾, ½, ¼). It is easily stuck; a stick reading converted with the chart is a useful check." },
        { question: "Is a 275 gallon tank really 275 gallons?", answer: "Its rating is 275. The oil you can actually use is less, because you never fill to the very top and some oil stays below the outlet." },
        { question: "How do I stick an oil tank safely?", answer: "Use a clean wooden stick through the fill pipe, keep flames and sparks away, and wipe it before taking it out." },
        { question: "My tank isn't listed. Can I still use this?", answer: "Yes. Choose 'Other' and enter its shape, height, width, length and, if you know it, its rated capacity." },
      ]}
    >
      <OilTankTool />
    </ToolPageLayout>
  );
}
