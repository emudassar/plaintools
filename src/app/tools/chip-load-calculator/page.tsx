import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ChipLoadTool from "@/components/ChipLoadTool";
import { requireTool } from "@/config/tools";
import { HAAS_URL } from "@/lib/chip-load";

const SLUG = "chip-load-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Chip Load Calculator: Feed per Tooth, Feed Rate and SFM",
  description:
    "Enter spindle RPM, number of flutes and feed rate to get chip load per tooth — or a chip load to get the feed rate — plus feed per revolution and surface speed, in inch or metric.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ChipLoadPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate chip load",
        steps: [
          { name: "Choose inch or metric", text: "Feeds in in/min or mm/min." },
          { name: "Pick what to find", text: "Chip load from a feed rate, or a feed rate from a target chip load." },
          { name: "Enter RPM and flutes", text: "Spindle speed and the cutter's number of teeth." },
          { name: "Add tool diameter", text: "Optional, for surface speed." },
        ],
      }}
      uses={{
        heading: "10 situations where a chip load calculator helps",
        items: [
          { title: "CNC router feeds", body: "Turn a cutter maker's chip load into a feed rate for your spindle speed." },
          { title: "Checking a CAM program", body: "Confirm the chip load a programmed feed and RPM actually give." },
          { title: "Changing spindle speed", body: "Keep chip load constant when RPM changes." },
          { title: "Switching cutters", body: "A 2-flute and a 4-flute need different feeds for the same chip load." },
          { title: "Avoiding rubbing", body: "Too small a chip load rubs and heats the tool; see what you're running." },
          { title: "Metric machines", body: "mm/min and mm per tooth." },
          { title: "Surface speed checks", body: "SFM or m/min from RPM and diameter." },
          { title: "Learning machining", body: "The feed formulas, worked." },
          { title: "Shop setup sheets", body: "Record feed per tooth and feed per rev." },
          { title: "Comparing tool recommendations", body: "Put different makers' data on the same basis." },
        ],
      }}
      dataSection={{
        heading: "The formulas",
        paragraphs: [
          "Haas Automation's 'Mill — Speeds and Feeds Formulas' reference gives feed rate in inches per minute as feed per tooth × number of teeth × RPM, feed rate as feed per revolution × RPM, and spindle speed as SFM × 3.82 ÷ tool diameter. Rearranged, chip load = feed rate ÷ (RPM × teeth). Surface speed from RPM is RPM × π × diameter ÷ 12 (the 3.82 in Haas's formula is 12 ÷ π). Metric uses mm and m/min.",
          "Limits: the right chip load depends on the cutter, material, depth and width of cut and machine rigidity, and comes from the tool maker's chart. On light side cuts the actual chip is thinner than the programmed chip load (radial chip thinning), which this page doesn't adjust for. Everything runs in your browser.",
        ],
        sources: [{ label: "Haas Automation — Mill Speeds and Feeds Formulas (inch)", href: HAAS_URL, note: "IPM = feed per tooth × teeth × RPM; RPM = SFM × 3.82 ÷ D" }],
      }}
      faqs={[
        { question: "How do I calculate chip load?", answer: "Chip load = feed rate ÷ (RPM × number of flutes). 60 in/min at 10,000 RPM with 3 flutes is 0.002 in per tooth." },
        { question: "How do I calculate feed rate from chip load?", answer: "Feed rate = chip load × flutes × RPM." },
        { question: "What chip load should I use?", answer: "Use the cutter maker's recommendation for your material and tool diameter." },
        { question: "What is SFM?", answer: "Surface feet per minute — how fast the cutting edge moves: RPM × π × diameter ÷ 12." },
        { question: "Does it work for routers and mills?", answer: "Yes, the same formulas apply to any rotating multi-tooth cutter." },
        { question: "What is chip thinning?", answer: "On cuts narrower than half the tool, the real chip is thinner than the programmed chip load; this page uses the programmed value." },
      ]}
    >
      <ChipLoadTool />
    </ToolPageLayout>
  );
}
