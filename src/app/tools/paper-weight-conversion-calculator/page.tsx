import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PaperWeightTool from "@/components/PaperWeightTool";
import { requireTool } from "@/config/tools";
import { SYLVAMO_URL } from "@/lib/paper-weight";

const SLUG = "paper-weight-conversion-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Paper Weight Conversion Calculator: lb to gsm and Back",
  description:
    "Convert US paper basis weight in pounds to grams per square metre (gsm) and back for bond, text, cover, index, bristol and tag, and see the same paper's weight in every grade.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PaperWeightPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert paper weight",
        steps: [
          { name: "Choose the direction", text: "Pounds to gsm, or gsm to pounds." },
          { name: "Enter the weight", text: "For example 80 (lb) or 216 (gsm)." },
          { name: "Pick the grade", text: "Bond, text, cover, index, bristol or tag — the pound figure only means something with its grade." },
          { name: "Read the result", text: "gsm, plus the same paper's equivalent in every grade." },
        ],
      }}
      uses={{
        heading: "10 situations where a paper weight converter helps",
        items: [
          { title: "Ordering from an overseas printer", body: "Quotes in gsm; your spec is in pounds." },
          { title: "80 lb text vs 80 lb cover", body: "See why they're very different papers." },
          { title: "Business cards", body: "Compare a cover weight in lb with a card stock in gsm." },
          { title: "Printer paper limits", body: "Printers list maximum media weight in gsm; convert your stock." },
          { title: "Wedding invitations", body: "Match a heavy cardstock across suppliers' units." },
          { title: "Flyers and brochures", body: "Choose a text weight by gsm." },
          { title: "Index cards and tags", body: "Index and tag grades have their own basic sizes." },
          { title: "Comparing office paper", body: "20 lb bond is about 75 gsm." },
          { title: "Spec sheets for clients", body: "Give both units on a print spec." },
          { title: "Learning paper grades", body: "The table shows how one sheet is described in every grade." },
        ],
      }}
      dataSection={{
        heading: "Where the conversion comes from",
        paragraphs: [
          "US paper is weighed by basis weight: the weight in pounds of a 500-sheet ream of the grade's basic size. Each grade has a different basic size, so the same sheet has different pound weights in different grades. Sylvamo's basis weight calculator gives the conversion: multiply the basis weight by 1406.5 and divide by the area of the basic size in square inches. Basic sizes: bond 17 × 22 in, book/text 25 × 38, cover 20 × 26, index 25.5 × 30.5, vellum bristol 22.5 × 28.5, tag 24 × 36.",
          "The page reproduces Sylvamo's own example: 28 lb bond = 105.3 gsm. 1406.5 itself is just units — grams per pound times square inches per square metre, divided by 500 sheets.",
          "Limits: gsm is weight per area, not thickness or stiffness; two papers of the same gsm can differ in caliper and feel. Mills often publish rounded equivalents. Everything runs in your browser.",
        ],
        sources: [{ label: "Sylvamo — Basis weight calculator", href: SYLVAMO_URL, note: "gsm = basis weight × 1406.5 ÷ basic size area; basic sizes by grade" }],
      }}
      faqs={[
        { question: "How do I convert lb to gsm?", answer: "Multiply the basis weight by 1406.5 and divide by the basic size area in square inches. For bond (374 in²), 20 lb = 75.2 gsm." },
        { question: "What is 80 lb cover in gsm?", answer: "About 216 gsm (80 × 1406.5 ÷ 520)." },
        { question: "What is 80 lb text in gsm?", answer: "About 118 gsm (80 × 1406.5 ÷ 950)." },
        { question: "Why is 80 lb text lighter than 80 lb cover?", answer: "Text is weighed on a 25 × 38 in sheet and cover on a smaller 20 × 26 in sheet, so the same 80 lb means a heavier cover paper." },
        { question: "What gsm is normal copy paper?", answer: "20 lb bond is about 75 gsm; 24 lb bond about 90 gsm." },
        { question: "Is gsm the same as thickness?", answer: "No — it's weight per square metre. Thickness (caliper) is measured separately." },
      ]}
    >
      <PaperWeightTool />
    </ToolPageLayout>
  );
}
