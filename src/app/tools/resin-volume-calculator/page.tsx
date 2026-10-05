import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ResinVolumeTool from "@/components/ResinVolumeTool";
import { requireTool } from "@/config/tools";

const SLUG = "resin-volume-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Resin Volume Calculator: How Much Resin to Fill a Mold",
  description:
    "Enter a mold's shape and size (or the water it holds) and get the resin needed in ml and fl oz, its weight in grams and ounces, and the part A / part B split.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ResinVolumeCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out resin for a mold",
        steps: [
          { name: "Pick the mold shape", text: "Choose box, cylinder, sphere, dome or cone, or pick 'measured with water' if you filled the mold with water and measured it." },
          { name: "Enter the inside size", text: "Use the inside dimensions and the depth you will actually pour, in centimetres, millimetres or inches." },
          { name: "Choose the resin", text: "Pick the closest product type for the weight, or enter the specific gravity from your own resin's data sheet." },
          { name: "Read the amount", text: "The result is the mixed volume in ml and fluid ounces, its weight, and the split into part A and part B at your mix ratio." },
        ],
      }}
      uses={{
        heading: "10 situations where a resin volume calculation helps",
        items: [
          { title: "Mixing for a set of coasters", body: "Four 10 cm round coasters 1 cm deep need about 345 ml with a 10% allowance, so one batch can be mixed instead of guessing and running short." },
          { title: "Filling a sphere mold", body: "A sphere holds two thirds of the cylinder around it; the tool works it out from the diameter alone." },
          { title: "Weighing a 100:30 epoxy", body: "Products mixed by weight need grams, not ml; the weight basis splits the total into grams of each part." },
          { title: "Pricing a craft order", body: "Grams of resin per piece turn straight into a material cost per item." },
          { title: "Odd-shaped silicone molds", body: "Fill the mold with water, measure it, and enter the ml; that beats approximating a complex shape." },
          { title: "Choosing a kit size", body: "Comparing the total with kit sizes in fl oz or litres shows which one covers the project." },
          { title: "Planning a dome paperweight", body: "The half-sphere option covers dome molds without doubling a sphere by hand." },
          { title: "Casting a block for a knife handle or pen blank", body: "A box mold with its pour depth gives the volume of a stabilising cast." },
          { title: "Working in inches", body: "Enter inches and read cubic inches alongside ml and fluid ounces." },
          { title: "Batch production", body: "The pieces field multiplies one mold by a whole run of identical casts." },
        ],
      }}
      dataSection={{
        heading: "How the amount is worked out",
        paragraphs: [
          "Volume is ordinary solid geometry: length × width × depth for a box, π × r² × depth for a cylinder, 4/3 π r³ for a sphere, half that for a dome and one third of π r² × height for a cone. One cubic centimetre is one millilitre. The total is multiplied by the number of pieces and by your extra allowance.",
          "Weight is volume × specific gravity (grams per millilitre). The presets come from the makers' own technical data sheets: Smooth-On EpoxAcast 690 at 1.10 and EpoxAcast 692 Deep Pour at 1.08, Smooth-Cast 300 polyurethane at 1.05, and West System 105/207 at 1.15 (cured). As a check, Smooth-On prints a specific volume of 25 cubic inches per pound for EpoxAcast 690, and 27.68 ÷ 1.10 = 25.2 — the same figure.",
          "The part A / part B split uses the ratio you enter, either by volume (ml) or by weight (grams). A volume ratio and a weight ratio for the same product are different numbers, because the two parts have different densities; use the one your label gives. Everything is calculated in your browser and nothing is stored.",
          "Limits: the shapes are ideal solids. Rounded corners, draft angles and embedded objects reduce what a real mold holds, and a detailed mold is best measured with water. This page does not cover how deep a product can be poured in one go or how hot it gets; those are on your product's own instructions.",
        ],
        sources: [
          { label: "Smooth-On EpoxAcast 690 / 692 technical bulletin", href: "https://www.smooth-on.com/tb/files/EPOXACAST_690_TB.pdf", note: "Mixed SG 1.10 / 1.08; specific volume 25 / 25.7 cu in per lb; 100A:30B / 100A:40B by weight" },
          { label: "Smooth-On Smooth-Cast 300 series technical bulletin", href: "https://www.smooth-on.com/tb/files/Smooth-Cast_300q,_300,_305___310.pdf", note: "SG 1.05; 26.4 cu in per lb; 1A:1B by volume" },
          { label: "West System 105/207 technical data sheet", href: "https://www.westsystem.com/app/uploads/2022/12/105-207-Epoxy-Resin.pdf", note: "Cured specific gravity 1.15; 3:1 by volume" },
        ],
      }}
      faqs={[
        { question: "How do I calculate how much resin I need for a mold?", answer: "Work out the mold's inside volume in cubic centimetres — that is the ml of resin. For a box, multiply length × width × depth; for a round mold, π × radius² × depth. Add a little for what stays in the cup." },
        { question: "How do I measure an irregular mold?", answer: "Fill it with water, pour the water into a measuring jug, and enter the ml. Dry the mold completely before pouring resin." },
        { question: "How many grams is 100 ml of resin?", answer: "It depends on the product's specific gravity. Most epoxy and polyurethane casting resins in the makers' data sheets used here are 1.05 to 1.15, so 100 ml weighs about 105 to 115 g." },
        { question: "Why don't my weight and volume ratios match?", answer: "Part A and part B have different densities, so a 1:1 volume ratio is not 1:1 by weight. Smooth-Cast 300, for example, is 1A:1B by volume or 100A:90B by weight." },
        { question: "How many fluid ounces of resin do I need?", answer: "Divide the ml by 29.57. The result shows fluid ounces next to ml." },
        { question: "Is this the same as the table top epoxy calculator?", answer: "No. This page fills a mold (a volume). Coating a flat surface is a thickness over an area; the table top epoxy calculator handles that." },
        { question: "Where do I find my resin's specific gravity?", answer: "On the technical data sheet, usually listed as specific gravity or density in g/cc for the mixed product. Choose 'Other' and enter it." },
      ]}
    >
      <ResinVolumeTool />
    </ToolPageLayout>
  );
}
