import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CapsuleSizeTool from "@/components/CapsuleSizeTool";
import { requireTool } from "@/config/tools";

const SLUG = "capsule-size-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Capsule Size Chart: 000 to 5 Volume, mg Capacity and Dimensions",
  description:
    "Capsule sizes 000 to 5 with volume in ml, fill capacity in mg at any powder density, length and diameter — size 00 holds 0.91 ml, size 0 0.68 ml — plus the smallest size for your fill, from Capsugel's published specifications.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function CapsuleSizeChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to read a capsule size",
        steps: [
          {
            name: "Pick the size number",
            text: "Capsule sizes run from 000 (largest) to 5 (smallest). 'el' sizes are elongated versions with a longer body and more volume.",
          },
          {
            name: "Read the volume",
            text: "The volume in millilitres is the space inside the closed capsule, as the manufacturer specifies it.",
          },
          {
            name: "Turn volume into milligrams",
            text: "Capacity in mg is volume × powder density × 1,000. The card shows it at the four densities the specification sheet prints: 0.6, 0.8, 1.0 and 1.2 g/ml.",
          },
          {
            name: "Find the size for a fill weight",
            text: "Enter the fill per capsule and your powder's density. The tool returns the smallest size whose calculated capacity holds it, and the larger sizes that would too.",
          },
          {
            name: "Check against real capsules",
            text: "Calculated capacity assumes the powder fills the volume at that density. Weigh a few filled capsules to see what you actually get.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the capsule size matters",
        items: [
          {
            title: "Buying empty capsules for a hand-held filling machine",
            body: "Filling machines are made for one size. Ordering 00 capsules for a size 0 machine means a box of capsules that do not fit the plate.",
          },
          {
            title: "Working out how much powder fits in a 00",
            body: "Size 00 is 0.91 ml. At 0.6 g/ml that is about 546 mg; at 1.0 g/ml about 910 mg. The card shows both, so a fill target can be checked before buying.",
          },
          {
            title: "Choosing between 0 and 00 for a fill weight",
            body: "If 600 mg of a powder at 0.8 g/ml is the target, size 0 holds about 544 mg and 00 about 728 mg. The finder shows the first size that holds it.",
          },
          {
            title: "Seeing when a fill needs two capsules",
            body: "Some fills do not fit any single capsule at a given density. The tool says so and shows how many size 000 capsules the fill would split into.",
          },
          {
            title: "Matching a capsule to a blister pack or bottle",
            body: "Packaging is sized to the closed capsule length and cap diameter. Both are listed in millimetres and inches for every size.",
          },
          {
            title: "Comparing elongated sizes",
            body: "00el holds 1.02 ml against 0.91 ml for 00, and 0el 0.78 ml against 0.68 ml for 0. The full chart lays them side by side.",
          },
          {
            title: "Converting a fill quoted in ml to mg",
            body: "A recipe or formula that gives capsule volume rather than weight can be converted at your own powder density.",
          },
          {
            title: "Comparing how long two capsule sizes are",
            body: "Overall length is the number people compare when a capsule feels too large. Size 000 is 26.1 mm closed; size 1 is 19.4 mm.",
          },
          {
            title: "Over-encapsulating a tablet",
            body: "A tablet has to fit inside the body diameter. The body and cap diameters for each size are listed to two decimal places.",
          },
          {
            title: "Teaching dosage-form basics",
            body: "The chart shows how volume, density and fill weight relate across the whole size range in one table.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the sizes come from",
        paragraphs: [
          "Every figure is taken from page 16, 'Properties and specifications', of Capsugel's Coni-Snap® hard gelatin capsule brochure (BAS 255). Capsugel is now part of Lonza. The table lists 14 sizes from 000 to 5 with empty weight and tolerance, capsule volume, body and cap length, body and cap external diameter, and overall closed length. One 0el variant is marked 'Europe only' and is shown with an asterisk; the size finder leaves it out.",
          "The brochure prints capsule capacity in mg at powder densities of 0.6, 0.8, 1.0 and 1.2 g/ml. Each of those 56 printed figures equals volume × density × 1,000, so the page uses that same formula for any density you enter. Everything is worked out in your browser and nothing is sent anywhere.",
          "One slip in the source is flagged rather than corrected: the standard 0el overall closed length is printed as 0.909 in and 23.5 mm, and 0.909 in is 23.1 mm. Both are shown as printed.",
          "The limits: capacity is theoretical. The real fill depends on how the powder flows and how firmly it is tamped, which is why the result should be checked by weighing filled capsules. These are one manufacturer's gelatin capsule specifications; other makers' capsules, and vegetarian (HPMC) capsules, with the same size number can differ slightly — use the supplier's own sheet when it matters. Capsugel's brochure notes its specifications are subject to change.",
          "This page reports capsule sizes and arithmetic only. It says nothing about what dose of any substance is appropriate, safe or effective; that is a question for a pharmacist or doctor and the product's labelling.",
        ],
        sources: [
          {
            label: "Capsugel — Coni-Snap® Hard Gelatin Capsules brochure (PDF)",
            href: "https://euromar.co.il/wp-content/uploads/2021/01/ConiSnap_brochure_full.pdf",
            note: "Page 16, Properties and specifications. Copy hosted by a Capsugel distributor",
          },
          {
            label: "Capsugel — Coni-Snap® hard gelatin capsules product page",
            href: "https://www.capsugel.com/pharmaceutical-solutions/hard-empty-capsules/hard-gelatin-capsules",
            note: "Manufacturer's current product page",
          },
        ],
      }}
      faqs={[
        {
          question: "How many mg does a size 00 capsule hold?",
          answer:
            "Size 00 has a volume of 0.91 ml. That works out to about 546 mg at 0.6 g/ml, 728 mg at 0.8 g/ml, 910 mg at 1.0 g/ml and 1,092 mg at 1.2 g/ml — the same figures Capsugel prints.",
        },
        {
          question: "How many mg does a size 0 capsule hold?",
          answer:
            "Size 0 is 0.68 ml: about 408 mg at 0.6 g/ml, 544 mg at 0.8 g/ml, 680 mg at 1.0 g/ml and 816 mg at 1.2 g/ml.",
        },
        {
          question: "Which capsule size is the biggest?",
          answer:
            "In this chart, 000: 1.37 ml and 26.1 mm long closed. Size 5 is the smallest at 0.13 ml and 11.1 mm.",
        },
        {
          question: "Why does the same capsule hold different amounts of different powders?",
          answer:
            "A capsule has a fixed volume, not a fixed weight. A fluffy powder (low density) weighs less per ml than a dense one, so the mg that fit depend on the powder. That is why capacity is given per density.",
        },
        {
          question: "How do I find my powder's density?",
          answer:
            "A simple estimate is to weigh a level, untapped volume of the powder — for example 10 ml — and divide grams by millilitres. Tapping or tamping packs it more densely, which raises how much fits in a capsule.",
        },
        {
          question: "What does 'el' mean in a capsule size?",
          answer:
            "Elongated. An 'el' size has the same diameter class as its standard size but a longer body, so it holds more — 0el is 0.78 ml against 0.68 ml for size 0.",
        },
        {
          question: "Are vegetarian capsules the same sizes?",
          answer:
            "They use the same size numbers, but this chart is Capsugel's gelatin specification. Check the supplier's sheet for HPMC (vegetarian) capsules; dimensions and volume can differ slightly.",
        },
      ]}
    >
      <CapsuleSizeTool />
    </ToolPageLayout>
  );
}
