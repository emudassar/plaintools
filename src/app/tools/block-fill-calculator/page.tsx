import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BlockFillTool from "@/components/BlockFillTool";
import { requireTool } from "@/config/tools";
import { TEK42_URL } from "@/lib/block-fill";

const SLUG = "block-fill-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Block Fill Calculator: Grout for Cinder Block Cores",
  description:
    "Enter the wall length and height, block width (6–14 in) and which cells are grouted and get the grout in cubic feet and yards and the bags of preblended grout, from the CMHA (NCMA) TEK 04-02A tables.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function BlockFillPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate grout for block cores",
        steps: [
          { name: "Measure the wall", text: "Length and height in feet; subtract openings." },
          { name: "Pick the block width", text: "6, 8, 10, 12 or 14 in." },
          { name: "Choose the grout spacing", text: "Every cell (solid), or cells at 16, 24, 32, 48 in or more on centre." },
          { name: "Read the grout", text: "Cubic feet, cubic yards and preblended bags." },
        ],
      }}
      uses={{
        heading: "10 situations where a block fill calculator helps",
        items: [
          { title: "Ordering grout for a retaining wall", body: "Solid-grouted walls take a lot; get the yards for a truck order." },
          { title: "Partially grouted walls", body: "Cells at 32 or 48 in on centre need far less." },
          { title: "Bags or ready-mix", body: "Compare preblended bag counts with a delivered load." },
          { title: "Foundation walls", body: "Grout volume for reinforced cells." },
          { title: "Pricing a block wall", body: "Blocks and grout in one estimate." },
          { title: "Garden walls and planters", body: "Small walls in bags." },
          { title: "Comparing block widths", body: "An 8 in wall takes about 40% more grout than a 6 in wall." },
          { title: "Checking a contractor's quote", body: "Compare their grout quantity." },
          { title: "Pump or bucket", body: "Know the volume before deciding how to place it." },
          { title: "Block count", body: "About 119 8 × 16 blocks per 100 ft², waste included." },
        ],
      }}
      dataSection={{
        heading: "Where the figures come from",
        paragraphs: [
          "The grout volumes are Table 3 of TEK 04-02A, 'Estimating Concrete Masonry Materials', from the Concrete Masonry & Hardscapes Association (CMHA, formed from NCMA and ICPI): cubic feet of grout per 100 ft² of hollow single-wythe wall, by wall width (6, 8, 10, 12 and 14 in) and grout spacing from 8 in (every cell) to 120 in. The table 'assumes two-core hollow concrete masonry units and 3% waste'. For example, an 8 in wall grouted solid takes 36.1 ft³ per 100 ft².",
          "Bags use TEK 04-02A Table 4's note that an 80 lb bag of preblended grout yields approximately 0.66 ft³ (a 3,000 lb bulk bag about 25 ft³); the table also lists how many cores one bag fills. The block count uses the TEK's 119 units per 100 ft² (8 × 16 units, 5% waste included).",
          "Limits: TEK 04-02A says walls of 4 in units are not included and it does not recommend grouting them. Bond beams (horizontal grouting) need extra grout. Which cells must be grouted and reinforced is set by the design and your code. Absorbent block and the placing method change real use. Everything runs in your browser.",
        ],
        sources: [{ label: "CMHA — TEK 04-02A Estimating Concrete Masonry Materials", href: TEK42_URL, note: "Table 3 grout volumes; Table 4 bag yields" }],
      }}
      faqs={[
        { question: "How much grout to fill 8 inch block?", answer: "36.1 ft³ per 100 ft² of wall when every cell is filled, per TEK 04-02A — about 1.34 cubic yards." },
        { question: "How many bags of grout per block?", answer: "TEK 04-02A Table 4: one 80 lb bag fills about 2.7 cores of 8 in block." },
        { question: "How do I calculate grout for partially grouted walls?", answer: "Pick the spacing of the grouted cells; the table gives the volume for that spacing." },
        { question: "Does it include waste?", answer: "Table 3 includes 3% waste; add more if you expect losses." },
        { question: "Can I grout 4 inch block?", answer: "TEK 04-02A doesn't include it and doesn't recommend grouting 4 in units." },
        { question: "Does it include bond beams?", answer: "No — horizontal grouting is extra." },
      ]}
    >
      <BlockFillTool />
    </ToolPageLayout>
  );
}
