import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ThreePhaseTool from "@/components/ThreePhaseTool";
import { requireTool } from "@/config/tools";
import { KUPHALDT_YD_URL, KUPHALDT_PF_URL } from "@/lib/three-phase";

const SLUG = "three-phase-power-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Three Phase Power Calculator: kW, kVA, Amps",
  description:
    "Enter the line voltage, current and power factor and get kW, kVA and kVAR for a balanced three-phase or single-phase load — or enter the power and get the line current in amps.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ThreePhasePage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate three-phase power",
        steps: [
          { name: "Choose three-phase or single-phase", text: "Three-phase assumes a balanced load." },
          { name: "Enter the voltage", text: "Line-to-line voltage, such as 208, 480 or 600 V." },
          { name: "Enter the power factor", text: "1 for resistive loads like heaters; motor power factor from its nameplate." },
          { name: "Enter current or power", text: "Get power from amps, or amps from kW." },
        ],
      }}
      uses={{
        heading: "10 situations where a three-phase power calculator helps",
        items: [
          { title: "Motor current from kW", body: "Turn a load's kW into line amps at your voltage." },
          { title: "Clamp-meter readings to kW", body: "Measured amps and voltage give the real power." },
          { title: "Generator sizing conversations", body: "Generators are rated in kVA and kW; see both." },
          { title: "Heater banks", body: "Resistive loads at PF 1 — kW straight from amps." },
          { title: "208 V vs 240 V single-phase", body: "Compare current for the same load." },
          { title: "Power factor correction", body: "kVAR shows the reactive part that capacitors offset." },
          { title: "Comparing 208 and 480 V service", body: "Higher voltage, lower current for the same power." },
          { title: "Horsepower output", body: "Add the motor efficiency to estimate shaft hp." },
          { title: "Exam and coursework checks", body: "Verify hand calculations of √3 V I PF." },
          { title: "Transformer loading", body: "kVA of the load compared with a transformer's rating." },
        ],
      }}
      dataSection={{
        heading: "The formulas and where they come from",
        paragraphs: [
          "In a balanced three-phase system each of the three phases carries the same power, so total power is three times one phase. Kuphaldt's open textbook 'Lessons In Electric Circuits' (Vol. II, ch. 10) shows that in a Y connection the line voltage is the phase voltage times the square root of 3 while line and phase currents are equal, and in a delta the line current is √3 × the phase current. Either way, apparent power S = √3 × V(line) × I(line). For single phase, S = V × I.",
          "Real power P = S × power factor, and reactive power Q = S × sin(arccos PF); power factor is the ratio of true power to apparent power (ch. 11). Horsepower output = kW × efficiency ÷ 0.7457.",
          "Limits: the formulas assume a balanced, sinusoidal load. Unbalanced loads need each phase worked separately, and harmonics change the picture. Sizing wire, breakers and transformers follows the electrical code and equipment data, not just this arithmetic. Everything runs in your browser.",
        ],
        sources: [
          { label: "Kuphaldt — Lessons In Electric Circuits Vol. II, ch. 10: Three-phase Y and Delta Configurations", href: KUPHALDT_YD_URL, note: "√3 relations between line and phase" },
          { label: "Kuphaldt — Lessons In Electric Circuits Vol. II, ch. 11: Calculating Power Factor", href: KUPHALDT_PF_URL, note: "True power = apparent power × power factor" },
        ],
      }}
      faqs={[
        { question: "What is the three-phase power formula?", answer: "P (W) = √3 × V(line) × I(line) × power factor. At 480 V, 30 A and PF 0.85: 21.2 kW." },
        { question: "How do I calculate amps from kW for three-phase?", answer: "I = kW × 1000 ÷ (√3 × V × PF). 20 kW at 480 V and PF 0.85 is 28.3 A." },
        { question: "What's the difference between kW and kVA?", answer: "kVA is apparent power (V × I); kW is the real power that does work, kVA × power factor." },
        { question: "What power factor should I use?", answer: "1 for resistive loads. For motors, use the nameplate or measured value; it changes with load." },
        { question: "Why √3?", answer: "In a balanced three-phase system line voltage and phase voltage (or line and phase current) differ by √3, so total power works out to √3 × V(line) × I(line)." },
        { question: "Does this work for unbalanced loads?", answer: "No — each phase has to be calculated separately and added." },
      ]}
    >
      <ThreePhaseTool />
    </ToolPageLayout>
  );
}
