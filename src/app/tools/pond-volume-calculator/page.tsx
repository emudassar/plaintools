import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PondVolumeTool from "@/components/PondVolumeTool";
import { requireTool } from "@/config/tools";
import { PSU_POND_URL } from "@/lib/pond-volume";

const SLUG = "pond-volume-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Pond Volume Calculator: Gallons, Litres and Acre-Feet",
  description:
    "Enter your pond's shape, dimensions and average or maximum depth and get the volume in US gallons, litres, cubic feet and acre-feet, using Penn State Extension's pond measurement method.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PondVolumePage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate pond volume",
        steps: [
          { name: "Pick the shape", text: "Rectangle or irregular (average length × width), oval, circle, a round pond measured by its shoreline, or a trapezoid." },
          { name: "Enter the dimensions", text: "In feet or metres. For an irregular pond, average several measurements." },
          { name: "Enter the depth", text: "Average depth, or maximum depth for a bowl-shaped pond (the page uses 0.4 × maximum)." },
          { name: "Read the volume", text: "Gallons, litres, cubic feet and acre-feet." },
        ],
      }}
      uses={{
        heading: "10 situations where a pond volume calculator helps",
        items: [
          { title: "Dosing a pond treatment", body: "Algaecides, dyes and bacteria are dosed per gallon or per acre-foot; the label rate needs the volume." },
          { title: "Sizing a pump", body: "Pump and filter makers express turnover as gallons per hour against the pond's gallons." },
          { title: "Stocking fish", body: "Stocking guides are often given per gallon or per surface acre." },
          { title: "Filling a new liner pond", body: "Know how much water the fill will take from a well or the mains." },
          { title: "Farm pond water supply", body: "Acre-feet tell you how much stored water a farm pond holds." },
          { title: "Comparing water bills", body: "Convert gallons to the units on your water bill before filling." },
          { title: "Planning a dig", body: "Try depths and sizes to see the volume a design will hold." },
          { title: "Irregular backyard ponds", body: "Average lengths and widths give a fair estimate without surveying." },
          { title: "Round ponds you can't cross", body: "Walk the shoreline with a tape or wheel and enter the distance." },
          { title: "Metric pond kits", body: "Enter metres and get litres directly." },
        ],
      }}
      dataSection={{
        heading: "Where the method comes from",
        paragraphs: [
          "The method is Penn State Extension's 'Pond Measurements: Area, Volume, and Residence Time' (Bryan Swistock and Tom McCarty, updated May 19, 2025). Volume in acre-feet is the surface area in acres times the average depth in feet. For a typical bowl-shaped pond, Penn State estimates the average depth as 0.4 times the maximum depth; that is what the 'maximum depth' option does.",
          "Surface area: a rectangle or an irregular pond uses length × width (averages for an irregular shape); a trapezoid uses the average of the two unequal sides times the width; a round pond measured by its shoreline uses shoreline² ÷ 547,390 to get acres, as Penn State gives it; a circle uses π × radius²; an oval uses π ÷ 4 × length × width.",
          "Gallons are cubic feet × 7.4805 (a US gallon is 231 cubic inches). The page also shows gallons from acre-feet × 325,851, Penn State's figure, as a cross-check; the two agree to within rounding.",
          "Limits: the result is only as good as the average depth. Steep-sided, flat-bottomed or shelved ponds differ from the 0.4 rule. For an expensive treatment, take depth readings along several lines across the pond and average them, as Penn State suggests. Everything runs in your browser.",
        ],
        sources: [{ label: "Penn State Extension — Pond Measurements: Area, Volume, and Residence Time", href: PSU_POND_URL, note: "Acre-feet = acres × average depth; average ≈ 0.4 × maximum; 325,851 gal per acre-foot" }],
      }}
      faqs={[
        { question: "How do I calculate how many gallons are in my pond?", answer: "Multiply surface area in square feet by average depth in feet to get cubic feet, then multiply by 7.48. A 20 × 12 ft pond averaging 2.5 ft holds about 4,490 gallons." },
        { question: "How do I find the average depth?", answer: "Take several depth readings across the pond and average them. For a bowl-shaped pond, Penn State estimates the average as 0.4 × the deepest point." },
        { question: "What is an acre-foot?", answer: "The water that would cover one acre one foot deep: 325,851 gallons according to Penn State Extension." },
        { question: "How do I measure an irregular pond?", answer: "Measure the length in a few places and the width in a few places, average each, and use the rectangle option." },
        { question: "How accurate is the 0.4 rule?", answer: "It's an estimate for a typical bowl shape. Ponds with steep sides hold more than it suggests; shallow-edged ponds hold less." },
        { question: "Can I use metres?", answer: "Yes — choose metres; the result includes litres and cubic metres." },
      ]}
    >
      <PondVolumeTool />
    </ToolPageLayout>
  );
}
