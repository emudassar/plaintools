import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DrywallScrewsTool from "@/components/DrywallScrewsTool";
import { requireTool } from "@/config/tools";

const SLUG = "how-many-screws-per-sheet-of-drywall";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "How Many Screws per Sheet of Drywall? (IRC Spacing Calculator)",
  description:
    "Pick the sheet size, wall or ceiling, thickness and stud spacing and get the number of screws per sheet of drywall — and for the whole job — at the maximum spacing in IRC Table R702.3.5.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function DrywallScrewsPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out screws per sheet of drywall",
        steps: [
          { name: "Choose wall or ceiling", text: "Ceilings use a tighter screw spacing than walls in the code table." },
          { name: "Pick the sheet and thickness", text: "4 × 8, 4 × 10, 4 × 12 or 54 in × 12 ft; 3/8, 1/2 or 5/8 in." },
          { name: "Set the framing", text: "Stud or joist spacing, and whether the sheet runs across or along the framing." },
          { name: "Read the count", text: "Framing members under the sheet × screws along each member at the maximum spacing." },
          { name: "Multiply for the job", text: "Enter the number of sheets for the total." },
        ],
      }}
      uses={{
        heading: "10 situations where a drywall screw count helps",
        items: [
          { title: "Buying screws for a room", body: "Turn a sheet count into a screw count before buying boxes." },
          { title: "Ceilings versus walls", body: "Ceilings take more screws per sheet; the count shows how many more." },
          { title: "Checking a hanger's pattern", body: "Compare screws actually in a sheet with the count the maximum spacing requires." },
          { title: "Passing a drywall inspection", body: "Where nail/screw inspections happen, the table's spacing is what is usually checked." },
          { title: "24-inch framing", body: "At 24 in on center the wall spacing tightens to 12 in; the count reflects it." },
          { title: "Choosing horizontal or vertical hanging", body: "See how orientation changes the number of framing lines and screws." },
          { title: "Bidding a drywall job", body: "Screw counts per sheet go straight into a materials estimate." },
          { title: "Garage ceilings under living space", body: "The Type X garage-ceiling row requires 6 in spacing — far more screws." },
          { title: "Spotting combinations the table doesn't list", body: "3/8 in board at 24 in framing, for example, has no row; the page says so." },
          { title: "Teaching a new hanger", body: "The breakdown shows where every screw in the count goes." },
        ],
      }}
      dataSection={{
        heading: "Where the spacing comes from",
        paragraphs: [
          "The screw spacing is from the International Residential Code 2024, Table R702.3.5, 'Application without adhesive', column 'Maximum spacing of fasteners — Screws', read on the ICC's public code website on the date shown on the result. For 1/2 and 5/8 in board it gives 12 in on ceilings, 16 in on walls framed at 16 in on center, and 12 in on walls framed at 24 in. 3/8 in board is listed only at 16 in framing, and only perpendicular on ceilings. The 5/8 in Type X row for garage ceilings beneath habitable rooms gives 6 in. Section R702.3.5.1 calls for Type W or Type S screws to ASTM C1002, penetrating wood framing at least 5/8 in.",
          "The count is this page's arithmetic, not a figure from the code: the number of framing members under one sheet (dimension across the framing ÷ framing spacing, plus one, with the sheet's edges on framing) times the screws along each member (dimension along the framing ÷ screw spacing, rounded up, plus one so there is a screw at each end).",
          "Everything runs in your browser; nothing is sent or stored.",
          "Limits: the table gives a maximum spacing, so the count is the fewest screws that meet it; many hangers use more. Adhesive application, fire-rated and shear-wall assemblies, steel framing and manufacturer instructions can set different patterns, and local codes may amend the IRC. The page does not count screws for blocking, corners or cut pieces.",
        ],
        sources: [
          { label: "IRC 2024 — Chapter 7 Wall Covering (Table R702.3.5)", href: "https://codes.iccsafe.org/content/IRC2024P2/chapter-7-wall-covering", note: "Maximum fastener spacing for gypsum board" },
        ],
      }}
      faqs={[
        { question: "How many screws per 4 × 8 sheet of drywall on a wall?", answer: "At 16 in stud spacing and the IRC's 16 in maximum spacing, 28 screws: 4 studs × 7 screws hung vertically, or 7 studs × 4 screws hung horizontally." },
        { question: "How many screws per 4 × 8 sheet on a ceiling?", answer: "At 16 in joist spacing and the 12 in ceiling maximum, hung across the joists: 7 joists × 5 screws = 35." },
        { question: "How far apart should drywall screws be?", answer: "IRC Table R702.3.5 gives a maximum of 12 in on ceilings and 16 in on walls at 16 in framing (12 in on walls at 24 in framing) for 1/2 and 5/8 in board without adhesive." },
        { question: "Why does the count go up at 24 in framing?", answer: "On walls the table's maximum screw spacing drops from 16 in to 12 in when framing is 24 in on center." },
        { question: "Can I use more screws than this?", answer: "Yes. The table sets a maximum spacing; closer spacing still meets it." },
        { question: "Why is there no answer for 3/8 in board at 24 in?", answer: "Table R702.3.5 lists 3/8 in board only for 16 in framing, so there is no spacing to apply." },
        { question: "Does this apply to steel studs?", answer: "No. The count assumes wood framing; the table and R702.3.5.1 treat cold-formed steel separately." },
      ]}
    >
      <DrywallScrewsTool />
    </ToolPageLayout>
  );
}
