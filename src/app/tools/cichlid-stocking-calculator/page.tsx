import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CichlidStockingTool from "@/components/CichlidStockingTool";
import { requireTool } from "@/config/tools";

const SLUG = "cichlid-stocking-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Cichlid Stocking Calculator: Adult Sizes vs Tank Volume",
  description:
    "List the cichlids you plan to keep — Malawi, Tanganyika, Central and South American — and see their total adult length from FishBase against a published stocking guideline for your tank's volume.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function CichlidStockingCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to check a cichlid stocking list",
        steps: [
          { name: "Enter the tank volume", text: "Use the real water volume in gallons or litres — after substrate and rock if you can." },
          { name: "Add each species", text: "Pick from 24 common cichlids, grouped by origin, or add another fish with its adult length." },
          { name: "Enter how many", text: "Type the number of each species you plan to keep." },
          { name: "Read the length budget", text: "The total adult length is compared with Practical Fishkeeping's guideline of 2.5 cm of fish per 4.55 litres." },
        ],
      }}
      uses={{
        heading: "10 situations where a cichlid stocking check helps",
        items: [
          { title: "Planning a Malawi mbuna tank", body: "Totalling adult sizes before buying shows how quickly a dozen small juveniles become a crowded tank." },
          { title: "Checking an oscar in a 75-gallon", body: "One oscar's 45.7 cm FishBase maximum takes a large share of a tank's length budget on its own." },
          { title: "Seeing what juveniles grow into", body: "Shops sell cichlids at a few centimetres; the list uses adult sizes." },
          { title: "Comparing two stocking plans", body: "Swap species in and out and watch the percentage change." },
          { title: "Spotting mixed-origin lists", body: "The tool notes when a list mixes lakes or continents." },
          { title: "Checking a frontosa colony", body: "At 33 cm each, frontosa use up a tank's guideline quickly." },
          { title: "Adding a fish not in the list", body: "Enter any fish's adult length to include it." },
          { title: "Working in litres", body: "Volume can be in US gallons or litres." },
          { title: "Finding a species' recorded size", body: "Each name links to its FishBase summary page." },
          { title: "Explaining stocking to a beginner", body: "A plain length budget is an easy first check before the harder compatibility questions." },
        ],
      }}
      dataSection={{
        heading: "Where the numbers come from",
        paragraphs: [
          "The guideline is Practical Fishkeeping's stocking FAQ: for tropical fish, 1 inch per gallon, which the magazine writes as 2.5 cm per 4.55 litres (a UK gallon). The calculator turns your tank volume into a length budget with that ratio. The same article says such guidelines 'fall over' once other factors come in, and that territorial fish such as cichlids fight when their territories overlap.",
          "Adult sizes are the 'Max length' given on each species' FishBase summary page, retrieved on the date shown on the result. FishBase gives some as standard length (SL, nose to the base of the tail) and some as total length (TL, including the tail); the calculator shows which. Maximum recorded sizes are often larger than fish reach in aquariums.",
          "The arithmetic: budget = litres × 2.5 ÷ 4.55 cm; used = sum of count × adult length. Nothing you enter is sent anywhere.",
          "Limits: this is a length budget, not a compatibility checker. Cichlid stocking depends on aggression, territory, sex ratios, rockwork, filtration and maintenance, which a single number cannot capture.",
        ],
        sources: [
          { label: "Practical Fishkeeping — Frequently asked questions on stocking densities", href: "https://www.practicalfishkeeping.co.uk/features/frequently-asked-questions-on-stocking-densities/", note: "Tropicals 1 in per gal / 2.5 cm per 4.55 L" },
          { label: "FishBase — species summaries", href: "https://www.fishbase.se/", note: "Max length for each species (SL or TL)" },
        ],
      }}
      faqs={[
        { question: "How many cichlids can I put in a 55-gallon tank?", answer: "By Practical Fishkeeping's 2.5 cm per 4.55 litres, a 55-gallon (208 L) tank has a budget of about 114 cm of adult fish — for example about 14 electric yellow labs at FishBase's 8.1 cm SL. Whether they get along is a separate question the guideline doesn't answer." },
        { question: "Does the inch-per-gallon rule work for cichlids?", answer: "Practical Fishkeeping itself says such guidelines fall over when other factors come in, and notes that territorial fish like cichlids fight when territories overlap. Treat it as a first check only." },
        { question: "How big do African cichlids get?", answer: "It varies by species. FishBase lists the demasoni at 6.3 cm SL, the electric yellow lab at 8.1 cm SL and the frontosa at 33 cm TL." },
        { question: "How big does an oscar get?", answer: "FishBase gives a maximum length of 45.7 cm TL for Astronotus ocellatus." },
        { question: "What is the difference between SL and TL?", answer: "Standard length runs from the snout to the base of the tail; total length includes the tail. FishBase uses whichever is recorded for the species." },
        { question: "Should I mix Malawi and South American cichlids?", answer: "This page doesn't advise on compatibility; it only notes when a list mixes fish from different lakes or continents." },
      ]}
    >
      <CichlidStockingTool />
    </ToolPageLayout>
  );
}
