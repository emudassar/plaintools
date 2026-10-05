import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DrawerSizeTool from "@/components/DrawerSizeTool";
import { requireTool } from "@/config/tools";

const SLUG = "drawer-size-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Drawer Size Calculator: Cabinet Drawer Box from the Opening",
  description:
    "Enter the cabinet opening and get the drawer box width, height and length for Blum TANDEM 563H undermount or Accuride 3832EC side-mount slides, using each maker's published clearances.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function DrawerSizeCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to size a cabinet drawer box",
        steps: [
          { name: "Pick the slide", text: "Choose Blum TANDEM 563H undermount, Accuride 3832EC side mount, or enter another slide's width clearance from its instructions." },
          { name: "Measure the opening", text: "Measure the width and height of the opening the drawer fits in, and the inside depth of the cabinet." },
          { name: "Enter the side thickness", text: "For Blum, the outside width deduction depends on the drawer side thickness. For side mount, the side thickness gives the inside width." },
          { name: "Read the box size", text: "The result is the outside width, inside width, height and length, in fractions and millimetres." },
        ],
      }}
      uses={{
        heading: "10 situations where a drawer size calculation helps",
        items: [
          { title: "Building kitchen drawer boxes for undermount slides", body: "Blum's inside width must be the opening minus 42 mm or the runners won't align; getting it wrong means rebuilding the box." },
          { title: "Replacing a broken drawer", body: "Measure the existing opening and get a box size that fits the slides you're buying." },
          { title: "Ordering drawer boxes from a supplier", body: "Box makers ask for outside dimensions; the tool turns your opening into them." },
          { title: "Choosing a runner length", body: "The inside depth decides the longest Blum runner or Accuride slide that fits." },
          { title: "Building a dresser with side-mount slides", body: "Accuride 3832EC needs 1/2 inch per side, so the box is 1-1/16 inch narrower than the opening." },
          { title: "Working in metric", body: "Enter millimetres for European plans; results show both units." },
          { title: "Checking side thickness before milling", body: "With Blum, thinner sides mean a larger deduction; the tool shows the effect." },
          { title: "Making shallow drawers", body: "Accuride lists a 1-7/8 inch minimum drawer height, which the tool flags." },
          { title: "Avoiding a too-wide drawer", body: "Accuride says the drawer width should not exceed slide length — the tool warns when it does." },
          { title: "Using a different slide brand", body: "Enter that slide's total width clearance from its instructions." },
        ],
      }}
      dataSection={{
        heading: "Where the clearances come from",
        paragraphs: [
          "Blum TANDEM plus BLUMOTION 563H: the specification sheet says the inside drawer width must equal the opening width minus 42 mm (1-21/32 in) for the runners to align. The outside width is the opening minus 10, 12, 14, 16 or 18 mm for drawer sides 16, 15, 14, 13 or 12 mm thick; Blum's own example is a 21 in opening with 5/8 in sides giving a 20-19/32 in drawer, which this tool reproduces. Maximum drawer height is the opening minus 20 mm. Drawer length equals runner length, and the sheet lists minimum inside cabinet depths of 557, 480, 404 and 328 mm for the 21, 18, 15 and 12 in runners.",
          "Accuride 3832EC: the quick reference gives side space of 1/2 in + 1/32 in per side and says to construct the drawer 1-1/16 in (27.0 mm) less than the cabinet opening, that slides may not function properly with less than 0.50 in side space, that drawer width should not exceed slide length, and a minimum drawer height of 1-7/8 in. Slides come in 14 to 28 in lengths; the tool picks the longest that is no longer than the inside depth you enter. Accuride gives no top or bottom clearance, so that is left to you.",
          "For any other slide, enter its total width clearance from its own instructions. All calculation is in your browser.",
          "Limits: these are two specific slide models. Other models, even from the same makers, differ. The result assumes a square opening; measure at the front and back and at several heights, and use the smallest.",
        ],
        sources: [
          { label: "Blum TANDEM plus BLUMOTION 563H specifications (PDF)", href: "https://d2.blum.com/services/BEC003/tdm563h_ma_dok_bus_$sen-us_$aof_$v4.pdf", note: "Opening − 42 mm inside width; side-thickness deductions; height − 20 mm; runner lengths and depths" },
          { label: "Accuride 3832EC quick reference (PDF)", href: "https://www.accuride.com/media/amasty/amfile/attach/lsENsMwHMdlHk0OlD2EpkPTjq1u8ZoYw.pdf", note: "1/2 in side space; drawer 1-1/16 in less than opening; 14–28 in lengths" },
        ],
      }}
      faqs={[
        { question: "How do I calculate drawer size for a cabinet?", answer: "Start from the opening and subtract the slide's clearance. For Blum TANDEM 563H the inside width is the opening minus 42 mm; for Accuride 3832EC side-mount slides the drawer is 1-1/16 inch narrower than the opening." },
        { question: "How much smaller than the opening should a drawer be?", answer: "It depends on the slide. Side-mount Accuride 3832EC: 1-1/16 inch narrower. Blum TANDEM 563H with 5/8 inch sides: 13/32 inch narrower outside, 42 mm narrower inside." },
        { question: "How tall can a drawer be with Blum TANDEM?", answer: "Blum gives the maximum drawer height as the opening minus 20 mm (25/32 inch)." },
        { question: "What length drawer for an undermount slide?", answer: "With Blum TANDEM the drawer length equals the runner length, and each runner needs a minimum inside cabinet depth — 557 mm for the 21 inch runner." },
        { question: "How much side clearance do side-mount slides need?", answer: "Accuride 3832EC needs 1/2 inch per side and may not work with less." },
        { question: "Do these numbers work for other slides?", answer: "No — every model has its own clearances. Use the 'other slide' option and enter the figure from your slide's instructions." },
      ]}
    >
      <DrawerSizeTool />
    </ToolPageLayout>
  );
}
