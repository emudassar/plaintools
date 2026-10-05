import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import HipRoofTool from "@/components/HipRoofTool";
import { requireTool } from "@/config/tools";

const SLUG = "hip-roof-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Hip Roof Calculator: Area, Squares, Ridge and Hip Rafter Length",
  description:
    "Hip roof area in square feet and roofing squares from length, width, pitch and overhang — plus ridge length, roof height, common rafter and hip rafter lengths, with the arithmetic shown.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HipRoofCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate a hip roof",
        steps: [
          {
            name: "Measure the building",
            text: "Measure the length and width at the wall plates. The calculator treats the longer side as the length.",
          },
          {
            name: "Enter the pitch",
            text: "Pitch is the rise in inches for every 12 inches of horizontal run — 6 for a 6/12 roof. The roof pitch calculator on this site can find it from a rise and run.",
          },
          {
            name: "Add the overhang",
            text: "Enter the horizontal eave overhang in inches. It enlarges the roof area and lengthens the rafters, but does not change the ridge.",
          },
          {
            name: "Read the area and squares",
            text: "Every face of a hip roof has the same pitch, so the roof area is the plan area times the slope factor. A roofing square is 100 sq ft.",
          },
          {
            name: "Read the framing lengths",
            text: "The ridge is length minus width. The hip rafter is the common rafter run times √(2 × 12² + rise²) ÷ 12 — the framing square's 17-inch unit.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where a hip roof calculation helps",
        items: [
          {
            title: "Getting a rough re-roof quantity",
            body: "A homeowner with a 40 × 24 ft hip roof at 6/12 can see it is about 10.7 squares before overhangs, to compare against a contractor's figure.",
          },
          {
            title: "Comparing quotes",
            body: "Roofers price by the square. Knowing the roof surface area makes it easier to see how much waste and extra each quote assumes.",
          },
          {
            title: "Laying out hip rafters",
            body: "Framers get the theoretical hip length from the common run and pitch, before taking off the ridge allowance.",
          },
          {
            title: "Planning a pyramid roof",
            body: "When length equals width, the ridge is zero and all four faces are triangles of the same area.",
          },
          {
            title: "Ordering hip and ridge cap",
            body: "The tool totals the four hips and the ridge, which together make up the run of cap material needed.",
          },
          {
            title: "Sizing a shed or gazebo roof",
            body: "Small hip roofs on outbuildings use the same geometry; the result shows each face's area for cutting sheathing.",
          },
          {
            title: "Converting to metres",
            body: "Buildings measured in metres can be entered directly; the area is also given in square metres.",
          },
          {
            title: "Checking a steeper pitch",
            body: "Changing the pitch shows how quickly area and rafter length grow — a 12/12 roof has about 41% more surface than its footprint.",
          },
          {
            title: "Estimating roof height",
            body: "The height from the wall plate to the ridge line is half the width times the pitch over 12.",
          },
          {
            title: "Teaching roof framing",
            body: "The arithmetic is shown step by step, including where the framing square's 17 inches comes from.",
          },
        ],
      }}
      dataSection={{
        heading: "How the numbers are worked out",
        paragraphs: [
          "Pitch is stated the US way, as inches of rise per 12 inches of run. The slope factor is √(12² + rise²) ÷ 12. Because a regular hip roof has the same pitch on all four faces, its surface area is simply the plan area (outside the overhang) times that factor. The two hip ends are triangles and the two long sides trapezoids in plan, and each is reported separately.",
          "The common rafter run is half the building width, and the ridge is the length minus the width. A hip rafter runs diagonally, so for every 12 inches of common run it travels 12 × √2 = 16.97 inches in plan — the '17 on the tongue' of the framing square. Its length per foot of common run is √(2 × 12² + rise²). Ira S. Griffith's Carpentry (§23) describes the same method: multiply the hip's unit length per foot of run of common rafter by the total run of common rafter.",
          "Lengths are theoretical line lengths in feet and inches to the nearest 1/8 inch. Nothing is taken off for a ridge board and no allowance is made for cuts. Metres are converted at 0.3048 m per foot. Nothing is fetched while you use the page.",
          "The limits: the geometry assumes a rectangular building with equal pitch on all sides and a level wall plate. It does not handle L-shaped plans, valleys, dormers or unequal pitches, and it does not size rafters, check loads or give material waste factors — those come from the code, an engineer, or the product's installation instructions.",
        ],
        sources: [
          {
            label: "Ira S. Griffith — Carpentry, §23 Determining Length of Hip or Valley Rafter",
            href: "https://chestofbooks.com/home-improvement/woodworking/Ira-S-Griffith/Carpentry/23-Determining-Length-Of-Hip-Or-Valley-Rafter.html",
            note: "Hip length from unit length per foot of common-rafter run; 17 on the tongue",
          },
        ],
      }}
      faqs={[
        {
          question: "How do I calculate the area of a hip roof?",
          answer:
            "Multiply the plan area (length × width, including the overhang) by the slope factor √(12² + rise²) ÷ 12. A 40 × 24 ft building at 6/12 with no overhang: 960 × 1.118 = 1,073 sq ft.",
        },
        {
          question: "How many squares is my hip roof?",
          answer: "Divide the roof area by 100. 1,073 sq ft is 10.73 squares. Material orders usually add waste on top; the product's maker or your roofer gives that figure.",
        },
        {
          question: "How long is the ridge on a hip roof?",
          answer: "Building length minus building width, for equal pitches. A 40 × 24 ft roof has a 16 ft ridge; a square building has no ridge at all (a pyramid hip).",
        },
        {
          question: "How do I find the hip rafter length?",
          answer:
            "Multiply the common rafter run (half the width) by √(2 × 12² + rise²) ÷ 12. At 6/12 that is 18 ÷ 12 = 1.5, so a 12 ft run gives an 18 ft hip, before any ridge deduction.",
        },
        {
          question: "Why 17 inches for a hip rafter?",
          answer:
            "The hip sits at 45° in plan, so each 12 inches of common run is 12 × √2 = 16.97 inches of hip run. Framing squares round it to 17.",
        },
        {
          question: "Does the overhang change the ridge length?",
          answer: "No. The overhang adds the same amount to the length and the width, so length minus width stays the same. It does add roof area and rafter length.",
        },
        {
          question: "Does this work for an L-shaped house?",
          answer:
            "Not directly. It handles one rectangle with equal pitches. An L-shaped roof can be split into rectangles, but the valleys where they meet need separate figures.",
        },
      ]}
    >
      <HipRoofTool />
    </ToolPageLayout>
  );
}
