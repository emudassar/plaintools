import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import WindowTintTool from "@/components/WindowTintTool";
import { requireTool } from "@/config/tools";
import { MADICO_URL } from "@/lib/window-tint";

const SLUG = "window-tint-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Window Tint Calculator: Net VLT of Film on Glass",
  description:
    "Enter your glass's VLT and the film's VLT and get the combined light transmission, check it against your state's minimum, and find the darkest film that keeps your glass at the limit.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function WindowTintPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate net window tint VLT",
        steps: [
          { name: "Enter the glass VLT", text: "The light transmission of the glass without film — a tint meter reading is best." },
          { name: "Enter the film VLT", text: "From the film's box, e.g. 35%. For film over existing film, list both." },
          { name: "Add your state's minimum", text: "Optional: the legal minimum for that window." },
          { name: "Read the net VLT", text: "And the darkest film that keeps that glass at the limit." },
        ],
      }}
      uses={{
        heading: "10 situations where a window tint calculator helps",
        items: [
          { title: "Choosing a film shade", body: "A '35%' film on factory glass ends up darker than 35%; see the real number." },
          { title: "Staying within your state's limit", body: "Find the darkest film that keeps the combined figure legal on your glass." },
          { title: "Cars with factory privacy glass", body: "Rear glass is often already tinted; add film and see the result." },
          { title: "Layering film over old film", body: "Enter both layers to see how dark it gets." },
          { title: "Tint shops quoting customers", body: "Show the net figure before the install." },
          { title: "After a ticket", body: "Understand why a meter read lower than the film's label." },
          { title: "Home and office windows", body: "The same multiplication applies to residential film on glass." },
          { title: "Comparing films side by side", body: "The table shows several common film shades on your glass." },
          { title: "Buying a used car with tint", body: "Estimate what film was used from a meter reading." },
          { title: "Night visibility decisions", body: "See how much light actually gets through." },
        ],
      }}
      dataSection={{
        heading: "How net VLT is worked out",
        paragraphs: [
          "VLT (visible light transmission) is the share of visible light a layer lets through. Light that passes the glass and then the film keeps the fraction each one transmits, so the combined figure is the product: a 35% film on 75% glass gives 0.35 × 0.75 = 26.25%. That's why the meter reading is darker than the film's label.",
          "The combined figure is what matters in most places. The film maker Madico notes that 'the majority of states measure the VLT in terms of the combined light transmittance of both the film and the glass itself.'",
          "Limits: the product ignores light that bounces between the layers, so a meter can read a point or two different, and meters themselves have tolerances. Laws differ by state and by window — front sides, rear sides, back glass and the windshield strip — and some states also regulate reflectivity or colour. This page doesn't hold any state's law; check your state's vehicle code. Everything runs in your browser.",
        ],
        sources: [{ label: "Madico — Car window tinting laws: what you need to know", href: MADICO_URL, note: "Most states measure the combined film-and-glass VLT" }],
      }}
      faqs={[
        { question: "How do I calculate net VLT?", answer: "Multiply the glass VLT by the film VLT as fractions. 70% glass with 35% film is 0.70 × 0.35 = 24.5%." },
        { question: "Why does my 35% tint read darker on a meter?", answer: "Because the glass itself blocks some light; the meter reads the combination." },
        { question: "What tint percentage is legal?", answer: "It depends on your state and the window. Enter your state's figure as the limit to check." },
        { question: "What is VLT?", answer: "Visible light transmission — the percentage of visible light that passes through. Lower means darker." },
        { question: "Can I put film over existing tint?", answer: "The page will show the combined figure if you list both layers; whether it's allowed is up to your state's law." },
        { question: "Does this apply to house windows?", answer: "Yes, the arithmetic is the same for any film on glass." },
      ]}
    >
      <WindowTintTool />
    </ToolPageLayout>
  );
}
