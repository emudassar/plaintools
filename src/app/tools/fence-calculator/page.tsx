import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import FenceTool from "@/components/FenceTool";
import { requireTool } from "@/config/tools";

const SLUG = "fence-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Fence Calculator: Posts, Rails, Pickets and Concrete",
  description:
    "Enter the fence length, post spacing, gates and picket size and get the number of posts, rails, pickets and bags of concrete to set the posts.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function FenceCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate fence materials",
        steps: [
          { name: "Enter the fence length and spacing", text: "Total length and the maximum post spacing." },
          { name: "Add gates", text: "How many and how wide." },
          { name: "Describe the panels", text: "Rails per section and picket width and gap." },
          { name: "Size the post holes", text: "Diameter, depth, post size and bag size for concrete." },
        ],
      }}
      uses={{
        heading: "10 fence projects this sizes",
        items: [
          { title: "Privacy fence", body: "A homeowner orders posts and pickets for a 150 ft backyard fence." },
          { title: "Picket fence", body: "Someone works out picket count with a 2 in gap." },
          { title: "Split-rail fence", body: "Pickets set to 0 gives posts and rails only." },
          { title: "Garden fence", body: "A gardener fences a vegetable plot with one gate." },
          { title: "Dog run", body: "A pet owner prices a small run." },
          { title: "Farm fencing posts", body: "A landowner counts posts for a long run." },
          { title: "Replacing rotten posts", body: "Someone works out concrete bags per post." },
          { title: "Comparing post spacing", body: "6 ft versus 8 ft spacing is compared on post count." },
          { title: "Contractor quotes", body: "A homeowner checks a materials list." },
          { title: "Pool fence planning", body: "Someone sizes posts before checking their local pool code." },
        ],
      }}
      dataSection={{
        heading: "How the fence materials are worked out",
        paragraphs: [
          "Sections = (length − gate widths) ÷ spacing, rounded up; posts = sections + 1 + one extra per gate; rails = sections × rails per section; pickets = fence length in inches ÷ (picket width + gap), rounded up.",
          "Concrete per post = hole volume (π × r² × depth) minus the post's volume in the hole. Bags use the QUIKRETE Concrete Mix No. 1101 yields (50 lb ≈ 0.375 cu ft, 80 lb ≈ 0.60 cu ft).",
          "Limits: spacing, hole size and depth come from your fence design and local code, including frost depth. Corners, ends and gate posts often need heavier posts. Gate hardware and fasteners are not counted. Call 811 before you dig in the US.",
        ],
        sources: [
          { label: "QUIKRETE Concrete Mix No. 1101 data sheet", href: "https://www.quikrete.com/pdfs/data_sheet-concrete%20mix%201101.pdf" },
        ],
      }}
      faqs={[
        { question: "How many fence posts do I need?", answer: "Fence length ÷ post spacing, rounded up, plus one, plus one per gate." },
        { question: "How far apart should fence posts be?", answer: "That depends on the fence design and materials; enter your spacing." },
        { question: "How many pickets per foot?", answer: "12 ÷ (picket width + gap). 5.5 in pickets with 0.5 in gaps need 2 per foot." },
        { question: "How much concrete per fence post?", answer: "A 10 in hole 24 in deep around a 4×4 needs about 1.1 cu ft — three 50 lb bags." },
        { question: "Does it count gate posts?", answer: "Yes, one extra post per gate." },
        { question: "What is a 4×4's actual size?", answer: "3.5 × 3.5 in." },
      ]}
    >
      <FenceTool />
    </ToolPageLayout>
  );
}
