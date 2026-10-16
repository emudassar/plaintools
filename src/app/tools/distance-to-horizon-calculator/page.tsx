import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import HorizonTool from "@/components/HorizonTool";
import { requireTool } from "@/config/tools";

const SLUG = "distance-to-horizon-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Distance to Horizon Calculator: How Far Can You See?",
  description:
    "Enter your eye height and get the distance to the horizon in miles, km and nautical miles, with and without refraction — plus how far a lighthouse or tower is visible and how much the curve hides.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HorizonPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out the distance to the horizon",
        steps: [
          { name: "Enter your eye height", text: "Height of your eyes above the water or flat ground, including any deck, cliff or building." },
          { name: "Read the horizon distance", text: "With normal atmospheric refraction, and the pure geometric figure." },
          { name: "Add a distant object (optional)", text: "Its height gives the farthest distance at which its top can still be seen." },
          { name: "Add a distance (optional)", text: "Shows how much of an object at that distance is hidden below the horizon." },
        ],
      }}
      uses={{
        heading: "10 reasons to calculate the distance to the horizon",
        items: [
          { title: "Spotting a lighthouse from a boat", body: "How far out its light first appears over the horizon from your deck height." },
          { title: "Choosing a lookout height", body: "How much farther you see from a 30 ft tower than from the beach." },
          { title: "Ham radio and VHF range", body: "Line-of-sight range between two antennas starts from both horizon distances." },
          { title: "Photographing a distant skyline", body: "How much of the buildings will be hidden behind the curve across a lake." },
          { title: "Drone pilots keeping visual line of sight", body: "How far a low aircraft can be before the horizon starts to hide it." },
          { title: "Sailing in poor conditions", body: "When another vessel of known height should come into view." },
          { title: "Answering a curvature question", body: "Work through how much of a far shore should be hidden, using the formula shown." },
          { title: "Hiking viewpoints", body: "How far a summit view reaches over flat ground or the sea." },
          { title: "Search and rescue planning", body: "Rough visibility range of a lookout over open water." },
          { title: "Physics and geometry teaching", body: "The Pythagorean derivation, with real numbers." },
        ],
      }}
      dataSection={{
        heading: "The formulas used",
        paragraphs: [
          "For an observer at height h above a smooth spherical Earth of radius R = 6,371 km, the straight-line distance to the geometric horizon is d = √(2Rh + h²), from Pythagoras (Wikipedia, 'Horizon'). For everyday heights this is about 3.57 km × √h with h in metres.",
          "Air normally bends light slightly downward, so you see a little farther. A. T. Young (San Diego State University) describes the usual allowance: replace R with an effective radius R′ = 7R/6, which gives about 3.86 km × √h. Both results are shown. The farthest distance at which a distant object's top is visible is the sum of the two horizon distances (yours and the object's). The hidden height of an object at a given distance is how far below your grazing line of sight its base sits beyond your horizon, worked with the same model.",
          "Limits: refraction depends strongly on the temperature of the air near the surface. Over cold water in spring it can let you see far beyond these figures; over hot ground it can reduce them and create mirages. Waves, haze and terrain are not modelled. Use the figures as the standard-conditions estimate, not as a guarantee of what you will see.",
        ],
        sources: [
          { label: "Wikipedia: Horizon — distance to the horizon", href: "https://en.wikipedia.org/wiki/Horizon#Distance_to_the_horizon" },
          { label: "A. T. Young: Distance to the Horizon (SDSU)", href: "https://aty.sdsu.edu/explain/atmos_refr/horizon.html" },
        ],
      }}
      faqs={[
        { question: "How far away is the horizon?", answer: "For eyes about 1.7 m (5.6 ft) above the sea, roughly 4.7 km (2.9 mi) geometrically and about 5 km (3.1 mi) with normal refraction." },
        { question: "What is the formula for distance to the horizon?", answer: "d = √(2Rh + h²), where R is the Earth's radius and h your eye height. For small heights, d ≈ 3.57√h km (h in metres), or about 3.86√h km with normal refraction." },
        { question: "Does refraction let you see farther?", answer: "Usually, yes. Air bends light slightly around the curve; the standard allowance is to use 7/6 of the Earth's radius." },
        { question: "How far can I see a lighthouse?", answer: "Enter your eye height and the lighthouse's height. The farthest distance at which its top is visible is your horizon distance plus its horizon distance." },
        { question: "How much of a distant object is hidden by the curve?", answer: "Enter the object's distance. The page shows the hidden height for the geometric and refracted cases." },
        { question: "Does this work for mountains or aircraft?", answer: "Yes for height above a smooth surface. It does not know about the terrain between you and the target." },
      ]}
    >
      <HorizonTool />
    </ToolPageLayout>
  );
}
