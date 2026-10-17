import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ScfmTool from "@/components/ScfmTool";
import { requireTool } from "@/config/tools";
import { OPENSTAX_GAS_URL, PDB_URL } from "@/lib/scfm";

const SLUG = "scfm-to-cfm-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "SCFM to CFM Calculator: Standard to Actual Airflow",
  description:
    "Convert SCFM to actual CFM (ACFM), or back, for compressed air at your gauge pressure, temperature and barometric pressure, with the standard reference conditions shown and selectable.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ScfmPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert SCFM to CFM",
        steps: [
          { name: "Choose the direction", text: "SCFM to actual CFM, or actual to SCFM." },
          { name: "Pick the standard", text: "The reference conditions your rating uses, or enter your own." },
          { name: "Enter the actual conditions", text: "Gauge pressure, barometric pressure and temperature where the air is." },
          { name: "Read the flow", text: "With the pressure and temperature ratios shown." },
        ],
      }}
      uses={{
        heading: "10 situations where an SCFM to CFM converter helps",
        items: [
          { title: "Matching a tool to a compressor", body: "Tool ratings and compressor ratings may use different bases." },
          { title: "Sizing piping", body: "Pipe velocity depends on actual volume at line pressure." },
          { title: "Blowers at altitude", body: "Lower barometric pressure means more actual volume per SCFM." },
          { title: "Hot inlet air", body: "Warm air takes more volume for the same mass." },
          { title: "Flow meter readings", body: "Turn a meter's actual reading into standard flow." },
          { title: "Comparing spec sheets", body: "Put two compressors on the same basis." },
          { title: "Pneumatic conveying", body: "Actual velocity in a line from standard flow." },
          { title: "Aeration and process air", body: "Blower selection starts from actual inlet flow." },
          { title: "Air receivers", body: "Volume calculations at tank pressure." },
          { title: "Learning gas laws", body: "A practical example of the combined gas law." },
        ],
      }}
      dataSection={{
        heading: "How the conversion works",
        paragraphs: [
          "SCFM is a flow measured at reference ('standard') pressure and temperature; ACFM is the volume the same air occupies at the actual conditions. By the combined gas law (OpenStax Chemistry 2e §9.2), P₁V₁/T₁ = P₂V₂/T₂ with absolute pressure and absolute temperature, so ACFM = SCFM × (P standard ÷ P actual) × (T actual ÷ T standard). Actual absolute pressure is the gauge reading plus barometric pressure; temperatures are converted to degrees Rankine (°F + 459.67).",
          "There is no single standard. One preset is 14.7 psia and 68 °F, the CAGI/ASME basis given in the Roots 'SCFM vs ACFM' guidebook as reproduced by PD Blowers (which also specifies 36% relative humidity); another is 14.696 psia and 60 °F. Choose the one your rating uses, or enter custom values.",
          "Limits: this is a dry-air, ideal-gas calculation. Humidity, which the full Roots formula includes, isn't corrected, and that can matter for blowers on hot, humid days. Other gases, filter and hose pressure drops, and compressibility at very high pressure aren't covered. Everything runs in your browser.",
        ],
        sources: [
          { label: "OpenStax Chemistry 2e — 9.2 Relating Pressure, Volume, Amount, and Temperature", href: OPENSTAX_GAS_URL, note: "Combined gas law" },
          { label: "PD Blowers — SCFM vs ACFM with sample calculation (Roots guidebook)", href: PDB_URL, note: "Standard conditions 14.7 psia, 68 °F, 36% RH" },
        ],
      }}
      faqs={[
        { question: "What is the difference between SCFM and CFM?", answer: "SCFM is flow at standard reference conditions; CFM (ACFM) is the actual volume at the real pressure and temperature." },
        { question: "How do I convert SCFM to ACFM?", answer: "ACFM = SCFM × (standard psia ÷ actual psia) × (actual °R ÷ standard °R). 100 SCFM at 100 psig and 68 °F is about 12.8 ACFM." },
        { question: "What are standard conditions?", answer: "They vary by standard — commonly 14.7 psia and 68 °F, or 14.696 psia and 60 °F. Use your rating's basis." },
        { question: "Why does altitude matter?", answer: "Barometric pressure falls with altitude, so the same standard flow occupies more actual volume." },
        { question: "Does humidity matter?", answer: "Yes, somewhat; this calculation is for dry air and doesn't correct for it." },
        { question: "Is gauge pressure the same as absolute?", answer: "No: absolute = gauge + barometric pressure (about 14.7 psi at sea level)." },
      ]}
    >
      <ScfmTool />
    </ToolPageLayout>
  );
}
