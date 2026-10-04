import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SineBarTool from "@/components/SineBarTool";
import { requireTool } from "@/config/tools";

const SLUG = "sine-bar-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Sine Bar Calculator: Gauge Block Height or Angle",
  description:
    "Enter the sine bar length and an angle in degrees, minutes and seconds to get the gauge block stack height — or enter block heights to get the angle. Inches or mm, with the formula shown. Free.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function SineBarCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to set up a sine bar",
        steps: [
          {
            name: "Enter the sine bar length",
            text: "Use the distance between the centres of the two rolls — 5 in, 10 in, 100 mm or whatever your bar is marked — not its overall length.",
          },
          {
            name: "Choose what you want to find",
            text: "The block height for an angle you need, or the angle that a stack you already have produces.",
          },
          {
            name: "Enter the angle or the stacks",
            text: "Angles can be entered in degrees, minutes and seconds. For the reverse calculation, enter the stack under each roll; use 0 for a roll resting on the surface plate.",
          },
          {
            name: "Read the result",
            text: "Height = length × sin(angle); angle = asin(height difference ÷ length). The arithmetic is printed with the answer.",
          },
          {
            name: "Build the nearest stack",
            text: "Wring together the gauge blocks that make up the height as closely as your set allows, and place them under one roll on a clean surface plate.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where a sine bar calculation is needed",
        items: [
          {
            title: "Setting up a part to grind an angle",
            body: "A 5-inch sine bar for a 15° face needs a 1.2941\" stack. Getting the stack right is the difference between an angle that checks and one that does not.",
          },
          {
            title: "Checking a machined angle on the surface plate",
            body: "Set the bar to the nominal angle, put the part on it, and indicate across the face. The tool gives the stack for the nominal angle.",
          },
          {
            title: "Finding the angle a known stack produces",
            body: "With a 1.500\" stack under a 5-inch bar, the angle is 17° 27′ 27″. Useful when inspecting a set-up someone else built.",
          },
          {
            title: "Working to an angle in degrees, minutes and seconds",
            body: "Drawings often call out angles like 12° 30′. The tool converts and returns the stack directly.",
          },
          {
            title: "Using a metric sine bar",
            body: "For a 100 mm bar at 12° 30′, the stack is 21.644 mm. Enter mm and the result stays in mm.",
          },
          {
            title: "Setting up a sine plate or sine vise",
            body: "The same formula applies to sine plates and sine vises; enter the roll-centre distance of the plate.",
          },
          {
            title: "Raising both rolls on blocks",
            body: "When the low roll also sits on a stack, the angle depends on the difference between the stacks. Enter both heights.",
          },
          {
            title: "Teaching precision measurement",
            body: "The page shows the formula and the source's own table of common angles for a 5-inch bar.",
          },
          {
            title: "Preparing a set-up sheet",
            body: "Calculate the stacks for each angle a job needs before going to the surface plate.",
          },
          {
            title: "Double-checking a mental calculation",
            body: "A quick sin × length check avoids building the wrong stack from a mistyped calculator entry.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the formula comes from",
        paragraphs: [
          "The method is from the open textbook Manufacturing Processes 4-5 (Virasak), Unit 3: Sine Bar, published on Workforce LibreTexts under a CC BY licence: to set a sine bar to an angle, take the sine of the angle and multiply it by the sine bar length — the distance between the centres of the gauge pins. The unit's worked example sets a 5.0-inch bar to 30°: sin 30° = 0.5000, × 5.0 = 2.5000 inches. It also gives sin θ = H / L for finding an angle, and (H1 − H2) / L when both rolls sit on blocks.",
          "The unit's Table 1 lists common angles for a 5-inch bar — 0.4358\" at 5°, 1.2941\" at 15°, 2.5000\" at 30°, 3.5355\" at 45°, 4.3301\" at 60°, and others. This page reproduces every row of that table to four decimal places, and the table is shown under the tool.",
          "Everything is calculated in your browser; nothing is sent or stored.",
          "The arithmetic is exact, but a physical set-up is only as good as the bar's roll spacing, the gauge blocks and the surface plate. Results are rounded to 0.0001 inch or 0.001 mm.",
          "This page is a calculation aid. It does not choose gauge blocks for you or replace inspection of the finished set-up.",
        ],
        sources: [
          {
            label: "Workforce LibreTexts — Manufacturing Processes 4-5, Unit 3: Sine Bar (CC BY)",
            href: "https://workforce.libretexts.org/Bookshelves/Manufacturing/Book%3A_Manufacturing_Processes_4-5_(Virasak)/01%3A_Milling_Machines/01.4%3A_Unit_3%3A_Sine_Bar",
            note: "Formula, worked example and the 5-inch common-angle table",
          },
        ],
      }}
      faqs={[
        {
          question: "What is the sine bar formula?",
          answer: "Gauge block height = sine bar length × sin(angle), where the length is the distance between the roll centres. For the angle: sin(angle) = height ÷ length.",
        },
        {
          question: "What height for 30° on a 5-inch sine bar?",
          answer: "2.5000 inches, because sin 30° is exactly 0.5. The source uses this as its worked example.",
        },
        {
          question: "Is the length the overall bar length?",
          answer: "No. It is the distance between the centres of the two rolls — the figure the bar is sold by, such as 5 in or 100 mm.",
        },
        {
          question: "How do I enter an angle like 12° 30′?",
          answer: "Enter 12 in degrees, 30 in minutes and 0 in seconds. The tool converts to decimal degrees for the calculation.",
        },
        {
          question: "What if both rolls are on blocks?",
          answer: "Choose the angle mode and enter both stacks. The angle is asin((H1 − H2) ÷ L), as the source gives.",
        },
        {
          question: "Can I use this for a sine plate?",
          answer: "Yes — the same relationship applies. Enter the plate's roll-centre distance as the length.",
        },
      ]}
    >
      <SineBarTool />
    </ToolPageLayout>
  );
}
