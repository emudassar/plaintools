import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import VoltageDropTool from "@/components/VoltageDropTool";
import { requireTool } from "@/config/tools";
import { NBS100_URL } from "@/lib/voltage-drop";

const SLUG = "dc-voltage-drop-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "DC Voltage Drop Calculator (12V, 24V, 48V Copper Wire)",
  description:
    "Enter the DC voltage, current, one-way wire length and copper AWG size and get the voltage drop in volts and percent, the voltage at the load, the watts lost, and the thinnest wire that stays within your limit.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function DcVoltageDropPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate DC voltage drop",
        steps: [
          { name: "Enter voltage and current", text: "The supply voltage and the current the load draws." },
          { name: "Enter the one-way length", text: "From the source to the load. The return conductor is added automatically." },
          { name: "Pick the wire size", text: "Copper AWG from 4/0 to 30." },
          { name: "Set a temperature and a limit", text: "20 °C is the reference; enter your own maximum acceptable drop in percent." },
          { name: "Read the drop", text: "Volts, percent, voltage at the load, watts lost and the thinnest gauge within your limit." },
        ],
      }}
      uses={{
        heading: "10 situations where a DC voltage drop calculator helps",
        items: [
          { title: "Solar panel to charge controller", body: "A long run at low voltage loses charging power; see how much." },
          { title: "Battery to inverter cables", body: "High current at 12 V makes even short cables drop noticeably." },
          { title: "Boat wiring", body: "Bilge pumps, windlasses and electronics far from the battery." },
          { title: "RV and van builds", body: "Size the runs from the house battery to fridges and fans." },
          { title: "LED strip lighting", body: "Long 12 V or 24 V strips dim at the far end when the feed is undersized." },
          { title: "Trolling motor leads", body: "Large currents over the length of a boat." },
          { title: "Choosing 12 V vs 24 V", body: "Doubling voltage halves current; compare the drop for the same power." },
          { title: "Low-voltage landscape lights", body: "Runs across a yard at 12 V." },
          { title: "Automotive accessories", body: "Winches, light bars and audio amplifiers." },
          { title: "Checking a wiring diagram", body: "Confirm the gauge on a plan gives an acceptable drop." },
        ],
      }}
      dataSection={{
        heading: "Where the copper figures come from",
        paragraphs: [
          "Resistance comes from NBS Handbook 100, 'Copper Wire Tables' (National Bureau of Standards, now NIST): the international annealed copper standard of 10.371 ohm-circular mil per foot at 20 °C (1.7241 microhm-cm), with a temperature coefficient of 0.00393 per °C. Wire sizes follow the American Wire Gage definition in the same Handbook — No. 0000 is 0.4600 in and No. 36 is 0.0050 in, with sizes between in geometric progression. The results match the Handbook's own table, for example No. 10 at 0.9988 ohm per 1,000 ft at 20 °C.",
          "A two-wire DC circuit carries current out and back, so the resistance is per-foot resistance × 2 × the one-way length, and the drop is current × that resistance. Percent drop is the drop ÷ the supply voltage.",
          "Limits: this is voltage drop only. Whether a wire may carry the current safely (ampacity) depends on insulation, bundling, temperature and installation, and comes from the electrical code, ABYC standards for boats, or the cable maker. Stranded and tinned conductors differ slightly from solid annealed copper. Aluminium is not offered. Everything runs in your browser.",
        ],
        sources: [{ label: "NBS Handbook 100 — Copper Wire Tables (NIST)", href: NBS100_URL, note: "Annealed copper resistivity, temperature coefficient, AWG definition and table" }],
      }}
      faqs={[
        { question: "How do I calculate voltage drop on a DC circuit?", answer: "Drop = current × resistance per foot × 2 × one-way length. 15 A over 25 ft of 10 AWG copper drops about 0.75 V." },
        { question: "What is an acceptable voltage drop?", answer: "That's a design choice and depends on the equipment and the standard you follow; enter your own limit and the page finds the thinnest wire that meets it." },
        { question: "Why is the length doubled?", answer: "Current flows out on one conductor and back on the other, so both lengths count." },
        { question: "Does temperature matter?", answer: "Yes. Copper's resistance rises about 0.39% per °C, so warm wire drops more than the 20 °C reference." },
        { question: "Can this tell me the right wire size for the current?", answer: "Only for voltage drop. The wire must also be rated to carry the current, which this page doesn't check." },
        { question: "Does it work for AC?", answer: "For short low-voltage AC runs with resistive loads it is close, but it ignores reactance and power factor." },
      ]}
    >
      <VoltageDropTool />
    </ToolPageLayout>
  );
}
