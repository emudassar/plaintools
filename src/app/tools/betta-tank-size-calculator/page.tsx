import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BettaTankTool from "@/components/BettaTankTool";
import { requireTool } from "@/config/tools";

const SLUG = "betta-tank-size-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Betta Tank Size Calculator: Is My Tank Big Enough?",
  description:
    "Enter your betta tank's dimensions or volume and see its real water volume in litres and gallons, compared with the RSPCA's 10-litre minimum and 20-litre ideal and a 2024 welfare study's figure.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function BettaTankSizeCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to check a betta tank's size",
        steps: [
          { name: "Enter the tank", text: "Type the volume printed on the box, or better, measure the inside length, width and height of the tank or bowl." },
          { name: "Allow for water level and gravel", text: "Enter the gap between the water and the rim and the depth of gravel; both reduce the water the fish actually has." },
          { name: "Read the volume", text: "The result is the water volume in litres and US gallons." },
          { name: "Compare with the published figures", text: "The table shows the tank against the RSPCA's 10-litre minimum and 20-litre ideal, and the 5.6-litre figure from a 2024 welfare study." },
        ],
      }}
      uses={{
        heading: "10 situations where checking a betta tank's size helps",
        items: [
          { title: "Buying a first betta tank", body: "Many tanks sold for bettas are small; checking the real water volume before buying avoids replacing it a month later." },
          { title: "Checking a bowl or vase", body: "Round bowls hold less than their size suggests once the water is below the rim." },
          { title: "Comparing a 2.5- and 5-gallon tank", body: "2.5 gallons is about 9.5 litres, under the RSPCA's 10-litre minimum; 5 gallons is about 19 litres." },
          { title: "Upgrading a betta's home", body: "See how far a current tank is from the RSPCA's 20-litre ideal." },
          { title: "Checking a tank labelled in litres", body: "European tanks are sold in litres; the tool shows both units." },
          { title: "Accounting for gravel", body: "An inch of gravel in a small tank removes a noticeable share of the water." },
          { title: "Setting up a classroom tank", body: "A teacher can check a tank against an animal-welfare body's published figure." },
          { title: "Dosing a small tank", body: "The real water volume is also the number to dose conditioner by." },
          { title: "Choosing between two tanks in a shop", body: "Measure both and compare them on the same figures." },
          { title: "Understanding the research", body: "The 2024 study's 5.6-litre figure was for shop display; it recommends larger tanks at home." },
        ],
      }}
      dataSection={{
        heading: "Where the figures come from",
        paragraphs: [
          "The RSPCA Australia Knowledgebase article on caring for Siamese fighting fish (updated 1 May 2024) says tanks ideally should be 20 litres or more to allow normal activity, with 10 litres being the absolute minimum. It also says two males should never be kept in the same tank, that small bowls are usually too small to fit a heater, and gives a water temperature of 24 to 26 °C.",
          "Clark-Shen, Tariel-Adam, Gajanur and Brown (2024), 'Life beyond a jar', in the journal Animal Welfare, studied tank size and furnishings. They recommend a minimum of 5.6 litres for display and sale in shops, and tanks larger than that for keeping bettas at home. Their 5.6-litre tank measured 22 × 15 × 17 cm, which this calculator gives as 5.61 litres.",
          "Volume is worked out from inside dimensions: area × water height ÷ 231 cubic inches per US gallon, and 3.785 litres per gallon (NIST Handbook 44). The water height is the tank height minus the gap below the rim and the gravel depth. Nothing is sent anywhere.",
          "Limits: the page compares a volume with published figures; it is not a full care assessment. Other organisations publish other figures, and decorations displace some water.",
        ],
        sources: [
          { label: "RSPCA Australia — How should I care for my Siamese fighting fish?", href: "https://kb.rspca.org.au/categories/companion-animals/fish/how-should-i-care-for-my-siamese-fighting-fish", note: "20 L or more ideally; 10 L absolute minimum" },
          { label: "Clark-Shen et al. (2024), Animal Welfare — Life beyond a jar", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11704571", note: "5.6 L minimum for display and sale; larger at home" },
        ],
      }}
      faqs={[
        { question: "What size tank does a betta need?", answer: "The RSPCA says ideally 20 litres or more, with 10 litres as the absolute minimum. A 2024 welfare study recommends at least 5.6 litres for shop display and larger tanks at home." },
        { question: "Is a 5-gallon tank big enough for a betta?", answer: "A 5-gallon tank holds about 18.9 litres when full — above the RSPCA's 10-litre minimum and just under its 20-litre ideal. After gravel and a gap below the rim it holds less." },
        { question: "Is a 2.5-gallon tank OK for a betta?", answer: "2.5 US gallons is about 9.5 litres when full, slightly under the RSPCA's 10-litre absolute minimum." },
        { question: "How many litres is a gallon?", answer: "One US gallon is 3.785 litres." },
        { question: "Can two male bettas share a tank?", answer: "The RSPCA says two males should never be placed in the same tank, because they will fight." },
        { question: "Can a betta live in a bowl?", answer: "The RSPCA says small bowls are usually too small to fit a heater and do not give enough space for the fish's needs." },
        { question: "What temperature should a betta tank be?", answer: "The RSPCA gives 24 to 26 °C." },
      ]}
    >
      <BettaTankTool />
    </ToolPageLayout>
  );
}
