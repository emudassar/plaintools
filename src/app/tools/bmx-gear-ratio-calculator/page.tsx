import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BikeGearTool from "@/components/BikeGearTool";
import { requireTool } from "@/config/tools";
import { SHELDON_GAIN_URL } from "@/lib/bike-gear";

const SLUG = "bmx-gear-ratio-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "BMX Gear Ratio Calculator: Gear Inches, Rollout and Speed",
  description:
    "Enter your BMX sprocket and driver teeth and wheel size and get the gear ratio, gear inches, rollout, development and speed at your cadence, with a gear-inch chart for common setups.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function BmxGearPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out BMX gearing",
        steps: [
          { name: "Enter the sprocket", text: "Front sprocket teeth, e.g. 25." },
          { name: "Enter the driver", text: "Rear cog or driver teeth, e.g. 9." },
          { name: "Enter the wheel size", text: "Diameter with the tyre, in inches." },
          { name: "Add crank length and cadence", text: "For gain ratio and speed." },
          { name: "Compare setups", text: "Read gear inches and check the chart." },
        ],
      }}
      uses={{
        heading: "10 situations where a BMX gear calculator helps",
        items: [
          { title: "Matching a gear you like", body: "Find other sprocket/driver combinations with the same gear inches." },
          { title: "Switching to a smaller sprocket", body: "25/9 and 28/10 are close; see exactly how close." },
          { title: "Racing gear choice", body: "Compare gear inches for different tracks." },
          { title: "Changing tyre size", body: "A bigger tyre raises gear inches." },
          { title: "24 in cruisers", body: "Enter the bigger wheel to see the difference." },
          { title: "Speed at a cadence", body: "How fast a gear goes at 90 or 120 rpm." },
          { title: "Crank length changes", body: "Gain ratio shows the effect of longer or shorter cranks." },
          { title: "Freecoaster and cassette drivers", body: "Small drivers like 9T and 10T in one table." },
          { title: "Kids' bikes", body: "Small wheels and gearing for young riders." },
          { title: "Fixed and single-speed bikes", body: "The same maths works for any single gear." },
        ],
      }}
      dataSection={{
        heading: "Where the formulas come from",
        paragraphs: [
          "Sheldon Brown's 'Gain Ratios' article describes the gear inch system as the drive wheel diameter multiplied by the sprocket ratio, and development as 'wheel diameter in meters x front sprocket x pi / rear sprocket' — the distance travelled per pedal revolution. Rollout is the same distance in inches (gear inches × π). Brown's gain ratio divides the wheel radius by the crank length and multiplies by the sprocket ratio, so it accounts for crank length too.",
          "Speed at a cadence is development × pedal revolutions per minute, converted to mph or km/h.",
          "Limits: results depend on the wheel diameter you enter; tyre width and pressure change the real diameter, so measure it (or measure rollout directly) for accuracy. Which gear suits you is up to your riding. Everything runs in your browser.",
        ],
        sources: [{ label: "Sheldon Brown — Gain Ratios", href: SHELDON_GAIN_URL, note: "Gear inches, development, gain ratio" }],
      }}
      faqs={[
        { question: "What is 25/9 in gear inches?", answer: "On a 20 in wheel, 25 ÷ 9 × 20 = 55.6 gear inches." },
        { question: "How do I calculate BMX gear ratio?", answer: "Divide the front sprocket teeth by the rear driver teeth: 25/9 = 2.78." },
        { question: "What is rollout?", answer: "The distance the bike moves per pedal turn: gear inches × π." },
        { question: "Is 28/10 the same as 25/9?", answer: "Close: 28/10 is 2.80 and 25/9 is 2.78 — about 0.4 gear inches apart on a 20 in wheel." },
        { question: "Does tyre size matter?", answer: "Yes — gear inches scale with the actual wheel diameter including the tyre." },
        { question: "What is gain ratio?", answer: "Sheldon Brown's measure that also includes crank length: wheel radius ÷ crank length × gear ratio." },
      ]}
    >
      <BikeGearTool />
    </ToolPageLayout>
  );
}
