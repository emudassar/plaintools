import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GoKartGearTool from "@/components/GoKartGearTool";
import { requireTool } from "@/config/tools";

const SLUG = "go-kart-gear-ratio-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Go Kart Gear Ratio Calculator: Ratio, Top Speed and Gear Chart",
  description:
    "Enter clutch and axle sprocket teeth, tyre size and engine RPM and get the gear ratio, theoretical top speed in mph and km/h, and a gear ratio chart — with jackshaft support. Works for mini bikes too.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function GoKartGearRatioPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out a go-kart's gear ratio and top speed",
        steps: [
          { name: "Count the teeth", text: "On the clutch (engine) sprocket and the axle sprocket." },
          { name: "Measure the drive tyre", text: "Its height when inflated, in inches or centimetres." },
          { name: "Enter the engine's top RPM", text: "A governed small engine is often around 3,600 RPM; use your engine's figure." },
          { name: "Read the result and chart", text: "The ratio, theoretical top speed, and a chart of other sprocket combinations." },
        ],
      }}
      uses={{
        heading: "10 situations where a gear ratio calculator helps",
        items: [
          { title: "Choosing an axle sprocket", body: "See the top speed each sprocket size gives before buying one." },
          { title: "Making a kids' kart slower", body: "A bigger axle sprocket raises the ratio and lowers top speed — see by how much." },
          { title: "Swapping to bigger tyres", body: "Larger tyres raise top speed at the same ratio; the calculator shows the change." },
          { title: "Planning a jackshaft", body: "Two stages multiply; enter both to get the overall ratio." },
          { title: "Gearing a mini bike", body: "The same chain-drive arithmetic applies to mini bikes." },
          { title: "After raising engine RPM", body: "Re-run the numbers when the engine's top RPM changes." },
          { title: "Comparing clutch sprockets", body: "The chart lines up 10- to 14-tooth clutches against common axle sizes." },
          { title: "Checking a seller's speed claim", body: "A listing's sprockets, tyres and RPM give a theoretical maximum." },
          { title: "Track days and racing classes", body: "Find a ratio that suits a short, tight track versus a long straight." },
          { title: "Learning how gearing works", body: "The breakdown shows wheel RPM and tyre circumference behind the number." },
        ],
      }}
      dataSection={{
        heading: "How the numbers are worked out",
        paragraphs: [
          "The method is the formula chain published with CSG Network's go-kart speed calculator, read on the date shown on the result: the tyre's circumference is π × diameter; the gear ratio is axle teeth ÷ clutch (engine) teeth; wheel RPM is engine RPM ÷ ratio; and speed is circumference × wheel RPM, converted from inches per minute to miles per hour (63,360 inches to a mile, 60 minutes to an hour). CSG's default — a 6-inch tyre, 3,600 RPM and a 60/12 ratio of 5 — gives 'just under 13 miles per hour'; this page gives 12.85 mph for the same inputs.",
          "With a jackshaft, the drive has two stages: clutch to jackshaft, then jackshaft to axle. Their ratios multiply to give the overall ratio. The chart under the result applies your RPM and tyre size to direct-drive combinations of 10–14-tooth clutches and 50–80-tooth axle sprockets.",
          "The arithmetic runs in your browser; nothing is stored or sent.",
          "Limits: the speed is theoretical. It assumes the engine reaches the RPM entered at full speed, which it may not do against wind, rolling resistance and a heavy rider. Tyres also grow or squash at speed. Torque converters vary their ratio, so a fixed-ratio figure does not describe them. Nothing here is a statement about what speed is safe for a rider, a kart or a track.",
        ],
        sources: [
          { label: "CSG Network — Go Kart Speed Calculator", href: "http://www.csgnetwork.com/kartpotentialspeedcalc.html", note: "Formula chain and worked default" },
        ],
      }}
      faqs={[
        { question: "How do I calculate a go-kart gear ratio?", answer: "Divide the axle sprocket's teeth by the clutch sprocket's teeth. 60 axle teeth and 12 clutch teeth is 5:1." },
        { question: "What gear ratio gives the most top speed?", answer: "A numerically lower ratio — fewer axle teeth, or more clutch teeth — gives more top speed and less acceleration, as long as the engine can still reach its RPM." },
        { question: "How fast will a 212cc go-kart go?", answer: "It depends on gearing, tyres and RPM. At 3,600 RPM with 11-inch tyres and a 60/12 (5:1) ratio, the theoretical top speed is about 23.6 mph." },
        { question: "How do I calculate gear ratio with a jackshaft?", answer: "Work out each stage — jackshaft input ÷ clutch, then axle ÷ jackshaft output — and multiply them." },
        { question: "Why is my real top speed lower than the calculator?", answer: "The figure is theoretical: wind, rolling resistance, rider weight and the engine not reaching full RPM all take speed off." },
        { question: "Does this work for mini bikes?", answer: "Yes — any single-speed chain drive. Use the rear wheel's tyre diameter." },
        { question: "Does it work with a torque converter?", answer: "Not directly. A torque converter changes its ratio as speed rises, so a fixed-ratio calculation only gives an estimate at one ratio." },
      ]}
    >
      <GoKartGearTool />
    </ToolPageLayout>
  );
}
