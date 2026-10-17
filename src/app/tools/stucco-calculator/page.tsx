import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import StuccoTool from "@/components/StuccoTool";
import { requireTool } from "@/config/tools";
import { QK_BASE_URL, QK_FINISH_URL } from "@/lib/stucco";

const SLUG = "stucco-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Stucco Calculator: Bags of Stucco per Coat",
  description:
    "Enter the wall area, openings and the thickness of the scratch, brown and finish coats and get how many 80 lb bags of stucco to buy for each coat, from Quikrete's published yields and coverage.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function StuccoPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate stucco",
        steps: [
          { name: "Measure the wall area", text: "Length × height of each wall, added up." },
          { name: "Subtract openings", text: "Windows and doors in square feet." },
          { name: "Choose the coats", text: "Three coats, base plus finish, or one coat, with each coat's thickness." },
          { name: "Set a waste allowance", text: "Stucco that falls or is left in the mixer." },
          { name: "Read the bags", text: "80 lb bags per coat and in total." },
        ],
      }}
      uses={{
        heading: "10 situations where a stucco calculator helps",
        items: [
          { title: "Three-coat stucco over lath", body: "Bags for scratch, brown and finish separately." },
          { title: "Patching a wall", body: "A small area at a known thickness." },
          { title: "Re-coating with a finish coat", body: "Finish coat only, at 1/8 in." },
          { title: "Comparing thicknesses", body: "See how a 1/2 in brown coat changes the count." },
          { title: "Ordering a pallet", body: "Total bags for a whole house wall." },
          { title: "Garden walls", body: "Stucco over block for a courtyard wall." },
          { title: "Checking a quote", body: "Compare a contractor's material count." },
          { title: "Planning mixer loads", body: "Bags per coat tells you how many batches." },
          { title: "Budgeting", body: "Bags × price before you start." },
          { title: "Comparing with Quikrete's chart", body: "The page shows the bag range from Quikrete's printed coverage alongside." },
        ],
      }}
      dataSection={{
        heading: "Where the yields come from",
        paragraphs: [
          "Quikrete's Scratch and Brown Base Coat Stucco (No. 1139) data sheet states that an 80 lb bag yields approximately 0.75 ft³, and lists coverage per bag of 20–24 ft² at 3/8 in, 15–18 ft² at 1/2 in and 10–12 ft² at 3/4 in, noting that 'All coverages are approximate and vary with thickness, waste, etc.' The Finish Coat Stucco (No. 1201) data sheet states the same 0.75 ft³ yield and approximately 70 ft² at 1/8 in.",
          "The page works out each coat's volume (net area × thickness) and divides by 0.75 ft³, rounding up after your allowance. For thicknesses Quikrete lists, it also shows the bag range from Quikrete's printed coverage. The yield method lands at the top of that range (0.75 ft³ at 3/8 in covers 24 ft²).",
          "Limits: a stucco system also needs lath, weep screed, flashing and proper curing, governed by ASTM C926 and C1063 and your local code; the number and thickness of coats come from your plans. Texture and wall flatness change real coverage. Everything runs in your browser.",
        ],
        sources: [
          { label: "QUIKRETE — Scratch and Brown Base Coat Stucco (1139) data sheet", href: QK_BASE_URL, note: "0.75 ft³ per 80 lb; coverage at 3/8, 1/2, 3/4 in" },
          { label: "QUIKRETE — Finish Coat Stucco (1201) data sheet", href: QK_FINISH_URL, note: "0.75 ft³ per 80 lb; ≈70 ft² at 1/8 in" },
        ],
      }}
      faqs={[
        { question: "How many bags of stucco do I need?", answer: "Area × thickness ÷ 0.75 ft³ per 80 lb bag for each coat. 240 ft² at 3/8 in is 10 bags." },
        { question: "How much does a bag of stucco cover?", answer: "Quikrete's base coat: 20–24 ft² at 3/8 in, 15–18 at 1/2 in, 10–12 at 3/4 in per 80 lb bag; finish coat about 70 ft² at 1/8 in." },
        { question: "How thick is each coat?", answer: "That comes from your plans and local code; the page uses the thicknesses you enter." },
        { question: "Should I subtract windows and doors?", answer: "Yes — enter their area to subtract it." },
        { question: "How much extra should I order?", answer: "Your choice; some stucco is always lost. The allowance you enter is applied before rounding." },
        { question: "Does it work for other brands?", answer: "Only if their yield matches; check the yield on the bag." },
      ]}
    >
      <StuccoTool />
    </ToolPageLayout>
  );
}
