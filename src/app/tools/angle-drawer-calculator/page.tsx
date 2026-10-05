import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import AngleDrawerTool from "@/components/AngleDrawerTool";
import { requireTool } from "@/config/tools";

const SLUG = "angle-drawer-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Angle Drawer Calculator: Draw Any Angle in Standard Position",
  description:
    "Type an angle in degrees or radians (like 3π/4) and see it drawn in standard position, with its quadrant, reference angle, coterminal angles, radians and sin/cos/tan.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function AngleDrawerCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to draw an angle in standard position",
        steps: [
          { name: "Enter the angle", text: "Type the angle in degrees, or switch to radians and type a value such as 3π/4, -pi/6 or 2.1." },
          { name: "Start on the positive x-axis", text: "The initial side always lies along the positive x-axis with the vertex at the origin." },
          { name: "Rotate", text: "Positive angles turn counterclockwise and negative angles clockwise; angles beyond 360° make full turns, shown as a spiral." },
          { name: "Read the results", text: "The drawing shows the terminal side; the card gives the quadrant, reference angle, coterminal angles and trig values." },
        ],
      }}
      uses={{
        heading: "10 situations where drawing an angle helps",
        items: [
          { title: "Checking trig homework", body: "A student can confirm that −210° ends in quadrant II before working out its sine, avoiding a sign error on every later step." },
          { title: "Finding a reference angle", body: "The reference angle is drawn and given in degrees and radians." },
          { title: "Listing coterminal angles", body: "The positive and negative coterminal angles are shown, plus how to get more." },
          { title: "Converting degrees to radians exactly", body: "135° shows as 3π/4, not just a decimal." },
          { title: "Seeing large angles", body: "An angle like 750° is drawn as two full turns plus 30°." },
          { title: "Preparing class slides", body: "A teacher can draw any angle quickly for an example." },
          { title: "Understanding negative angles", body: "The drawing makes the clockwise rotation visible." },
          { title: "Spotting quadrantal angles", body: "Angles on an axis are labelled, and the tool says why they have no reference angle." },
          { title: "Checking sin, cos and tan signs", body: "The values show which are positive or negative in each quadrant." },
          { title: "Studying for a placement test", body: "Rapid practice with many angles, each drawn instantly." },
        ],
      }}
      dataSection={{
        heading: "Definitions used",
        paragraphs: [
          "The definitions are from OpenStax Precalculus 2e, section 5.1 'Angles' (CC BY-NC-SA 4.0). An angle is in standard position when its vertex is at the origin and its initial side lies along the positive x-axis. Counterclockwise rotation is positive and clockwise is negative.",
          "Quadrantal angles have their terminal side on an axis (0°, 90°, 180°, 270°). Coterminal angles share a terminal side and are found by adding or subtracting 360° (2π). The reference angle is the smallest positive acute angle between the terminal side and the horizontal axis — so a quadrantal angle has none. Degrees and radians are related by θ/180 = θ_R/π.",
          "Radians are written as an exact multiple of π when the angle in degrees is a whole or half number; otherwise as a decimal. Sine, cosine and tangent are computed numerically; tangent is undefined when the terminal side is on the y-axis. Everything runs in your browser.",
          "Limits: decimal results are rounded for display. The drawing is to scale for direction; the spiral used for multiple turns grows slightly each turn so the turns can be told apart.",
        ],
        sources: [{ label: "OpenStax — Precalculus 2e, 5.1 Angles", href: "https://openstax.org/books/precalculus-2e/pages/5-1-angles", note: "Standard position, coterminal and reference angles, degree–radian conversion" }],
      }}
      faqs={[
        { question: "How do you draw an angle in standard position?", answer: "Put the vertex at the origin and the initial side along the positive x-axis, then rotate counterclockwise for a positive angle or clockwise for a negative one to reach the terminal side." },
        { question: "What is a reference angle?", answer: "The smallest positive acute angle between the terminal side and the x-axis. For 135° it is 45°; for 210° it is 30°." },
        { question: "How do I find coterminal angles?", answer: "Add or subtract 360° (or 2π radians). 135° is coterminal with −225° and 495°." },
        { question: "What quadrant is a negative angle in?", answer: "Rotate clockwise from the positive x-axis. −45° ends in quadrant IV, −120° in quadrant III." },
        { question: "How do I convert degrees to radians?", answer: "Multiply by π/180. 135° × π/180 = 3π/4." },
        { question: "Why doesn't 90° have a reference angle?", answer: "Its terminal side lies on an axis. A reference angle must be acute, and the angle to the x-axis here is 90°, so quadrantal angles have none." },
        { question: "Can I enter radians with π?", answer: "Yes. Switch the unit to radians and type values like 5pi/6, -π/4 or 2pi." },
      ]}
    >
      <AngleDrawerTool />
    </ToolPageLayout>
  );
}
