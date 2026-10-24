import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SquareFeetTool from "@/components/SquareFeetTool";
import { requireTool } from "@/config/tools";

const SLUG = "square-feet-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Square Feet Calculator: Area of Rooms and Shapes",
  description:
    "Add rectangles, L-shapes, circles, triangles and trapezoids in feet, inches, yards, metres or cm and get the total square feet, square metres, square yards and acres.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function SquareFeetCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate square feet",
        steps: [
          { name: "Pick the unit", text: "Feet, inches, yards, metres or centimetres." },
          { name: "Add each area", text: "Choose its shape and enter its measurements." },
          { name: "Add more areas", text: "Split an irregular space into simple shapes." },
          { name: "Read the total", text: "Square feet, square metres, square yards and acres, plus cost." },
        ],
      }}
      uses={{
        heading: "10 things people measure in square feet",
        items: [
          { title: "Flooring", body: "A homeowner measures an L-shaped living room for new floors." },
          { title: "Carpet", body: "Someone converts square feet to square yards for carpet pricing." },
          { title: "Paint and wallpaper", body: "A DIYer finds the area of a wall." },
          { title: "Rent per square foot", body: "A small business compares retail spaces." },
          { title: "Garden beds", body: "A gardener measures a round bed." },
          { title: "Sod and seed", body: "Someone measures a lawn in several sections." },
          { title: "Roofing estimates", body: "A homeowner measures a gable section." },
          { title: "Concrete pads", body: "A builder measures a trapezoid pad." },
          { title: "Metric plans", body: "Someone converts metres from a floor plan to square feet." },
          { title: "Land in acres", body: "A buyer converts a lot's square feet to acres." },
        ],
      }}
      dataSection={{
        heading: "How the area is worked out",
        paragraphs: [
          "Rectangle = length × width; circle = π × (diameter ÷ 2)²; triangle = base × height ÷ 2; trapezoid = (a + b) ÷ 2 × height; L-shape = the outer rectangle minus the missing corner. Each is converted to feet first.",
          "Conversions: 1 ft = 0.3048 m exactly; 1 square yard = 9 sq ft; 1 acre = 43,560 sq ft (NIST Handbook 44, Appendix C).",
          "Limits: the area of the shapes you enter, measured flat. Real estate listings follow their own measuring standards (what counts as living area), which this page does not apply.",
        ],
        sources: [
          { label: "NIST Handbook 44", href: "https://www.nist.gov/pml/owm/nist-handbook-44-current-edition" },
        ],
      }}
      faqs={[
        { question: "How do I calculate square feet?", answer: "Multiply length by width in feet. A 12 × 15 ft room is 180 sq ft." },
        { question: "How do I measure an L-shaped room?", answer: "Choose L-shape, or split it into two rectangles and add both." },
        { question: "How do I convert square metres to square feet?", answer: "Multiply by 10.7639." },
        { question: "How many square feet in an acre?", answer: "43,560." },
        { question: "How do I find the square feet of a circle?", answer: "π × radius². A 10 ft circle is about 78.5 sq ft." },
        { question: "Can I enter inches?", answer: "Yes, choose inches; the result is still in square feet." },
      ]}
    >
      <SquareFeetTool />
    </ToolPageLayout>
  );
}
