import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ChainsawFileTool from "@/components/ChainsawFileTool";
import { requireTool } from "@/config/tools";

const SLUG = "chainsaw-file-size-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Chainsaw File Size Chart: By Pitch and Drive-Link Number",
  description:
    "Chainsaw file sizes by chain pitch — 1/4\" and 3/8\" low profile 5/32\", .325\" 3/16\", 3/8\" and .404\" 7/32\" — with filing angles and depth-gauge settings from Oregon's chart, plus STIHL's own sizes.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ChainsawFileSizeChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the right file for your chainsaw chain",
        steps: [
          {
            name: "Read the number on a drive link",
            text: "Oregon stamps a number on the chain's drive links (the links that ride in the bar groove), such as 72, 91 or 20. It identifies the pitch and gauge. If you know the pitch instead, pick that.",
          },
          {
            name: "Pick the chain type if you know it",
            text: "The letters after the number (LPX, DPX, CJ…) name the cutter type. They change the angles; for round-ground chain they do not change the file size within a pitch, except 90PX/90SG.",
          },
          {
            name: "Read the file size",
            text: "The headline gives the round file diameter Oregon prints for that chain, with its size in millimetres.",
          },
          {
            name: "Set the angles and depth gauge",
            text: "The result lists the top-plate, down and side-plate angles and the depth-gauge setting from the same chart, for hand filing and for a grinder.",
          },
          {
            name: "Check the maker if it is not Oregon chain",
            text: "STIHL publishes its own file sizes, and for full 3/8\" chain it is a different size (13/64\"). The card shows STIHL's figure where STIHL lists one.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the chainsaw file size matters",
        items: [
          {
            title: "Buying a file for a new saw",
            body: "A homeowner with a new 3/8\" low-profile saw needs a 5/32\" file by Oregon's chart, not the 7/32\" sold for larger saws.",
          },
          {
            title: "Reading an unmarked chain",
            body: "When the box is gone, the number on the drive link (for example 91 or 72) leads straight to the file size.",
          },
          {
            title: "Sharpening a .325\" chain",
            body: "Oregon lists a 3/16\" file for its .325\" chains — a size between the small and large files people usually own.",
          },
          {
            title: "Setting a file guide's angle",
            body: "File guides are marked with angles. The chart's top-plate angle (25° or 30° for most chains) is the line to keep parallel with the chain.",
          },
          {
            title: "Lowering the depth gauges",
            body: "The depth-gauge setting (.025\" or .030\") tells you how far below the cutter the gauge should sit after several sharpenings.",
          },
          {
            title: "Sharpening ripping chain",
            body: "Ripping chains such as 72RD and 27R use a 10° top-plate angle, very different from crosscut chain. The chart lists them separately.",
          },
          {
            title: "Switching between STIHL and Oregon chain",
            body: "A 3/8\" STIHL chain takes STIHL's 13/64\" file while Oregon lists 7/32\" for its 3/8\" chain. Seeing both avoids using the wrong one.",
          },
          {
            title: "Setting up a bench grinder",
            body: "The grinding rows give the wheel thickness and the angles to dial in, which differ from the hand-filing side-plate figures.",
          },
          {
            title: "Recognising square-ground chain",
            body: "Chisel chain such as 72CJ or 75CL is square-ground. The chart prints no round file for it, and the page says so instead of guessing.",
          },
          {
            title: "Stocking files for a crew",
            body: "A landscaping or arborist crew with several saws can see every pitch's file size at once in the full chart.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the file sizes come from",
        paragraphs: [
          "File sizes and angles come from Oregon's saw chain catalog page FOR 149, 'Filing Angles' and 'Grinding Angles'. Its columns are the top-plate angle, down angle, side-plate angle and depth-gauge setting. In summary it prints: 1/4\" (25AP) 5/32\"; .325\" Low Profile (80TXL) 5/32\"; 3/8\" Low Profile 5/32\" (91 chains) and 4.5 mm (90PX, 90SG); .325\" 3/16\"; 3/8\" and .404\" 7/32\". Square-ground chisel chains (CJ, CK, CL) have no round file size; the chart's footnote says the file is held at 45° top-plate and 45° down angle.",
          "The drive-link numbers come from Oregon's Maintenance and Safety Manual, 'Chain Drive-Link Number Identification', which says the number stamped on the drive links indicates the chain's pitch and gauge. That manual is older than chains 68 and 80, so their pitch is taken from the chart's own grouping and no gauge is shown for them. Some numbers in the manual (11, 16, 18, 33–35, 50–52) have no row in the current chart, and the page says so rather than giving a file size.",
          "STIHL's sizes are from its saw chain files product page: 5/32\" (4.0 mm) for 1/4\" and 3/8\" P chain, 3/16\" (4.8 mm) for .325\" and 13/64\" (5.16 mm) for 3/8\". Millimetre figures for Oregon's inch sizes are inches × 25.4. Nothing is fetched while you use the page.",
          "The limits: these are two makers' published specifications. Other brands publish their own, and the maker of the chain on your saw is the authority. The page does not assess your chain's condition and is not a sharpening or safety procedure — the chain maker's instructions and your saw's manual are.",
        ],
        sources: [
          {
            label: "Oregon — Saw Chain Filing / Grinding Angles (catalog p. FOR 149, PDF)",
            href: "https://www.oregonproducts.com/medias/2020-FilingGrindingAngles.pdf?context=bWFzdGVyfHJvb3R8NDA2MDY0fGFwcGxpY2F0aW9uL3BkZnxoNjUvaGJmLzg4NTMxOTkzODg3MDIucGRmfGQ4MmNmZWZjZDA5MWQ3MmM0NmY0OTM4ZmFhN2MxZWUwMDA2MzgzM2Q4Y2U1MzgyYjQwMzZmYzZhZmY3ZWMzNjQ&attachment=true",
            note: "File sizes, angles and depth-gauge settings for each Oregon chain type",
          },
          {
            label: "Oregon — Maintenance and Safety Manual (PDF)",
            href: "https://apps.oregonproducts.com/pro/pdf/maintenance_manual/ms_02.pdf",
            note: "Chain drive-link number identification (pitch and gauge)",
          },
          {
            label: "STIHL — Saw chain files",
            href: "https://shop.stihl.ca/products/saw-chain-files",
            note: "STIHL's file sizes for its own chains",
          },
        ],
      }}
      faqs={[
        {
          question: "What size file for a 3/8 chainsaw chain?",
          answer:
            "Oregon lists a 7/32\" (5.56 mm) file for its full-size 3/8\" round-ground chains. STIHL lists 13/64\" (5.16 mm) for its own 3/8\" chain. 3/8\" Low Profile chain is different again — 5/32\".",
        },
        {
          question: "What size file for a .325 chain?",
          answer: "3/16\" (4.76 mm) for Oregon's .325\" chains, and STIHL also lists 3/16\" (4.8 mm) for its .325\" chain.",
        },
        {
          question: "What size file for 3/8 low profile chain?",
          answer:
            "5/32\" for Oregon's 91-series chains. The 90PX and 90SG chains are the exception: the chart prints a 4.5 mm file.",
        },
        {
          question: "How do I tell my chain's pitch?",
          answer:
            "Read the number stamped on a drive link and pick it in the tool. Oregon's manual also defines pitch as the distance between any three consecutive rivets, divided by two.",
        },
        {
          question: "What angle do I file a chainsaw chain at?",
          answer:
            "It depends on the chain. Most Oregon chains in the chart use a 25° or 30° top-plate angle; ripping chains use 10°; low-profile 91 and 90 chains use a 0° down angle where most others use 10°.",
        },
        {
          question: "What is the depth-gauge setting?",
          answer:
            "How far the depth gauge sits below the cutter's top. The chart gives .025\" for most chains and .030\" for some .404\" chains.",
        },
        {
          question: "Why doesn't my chain number show a file size?",
          answer:
            "Some chain numbers in Oregon's manual, mostly older and harvester chains, are not in the current filing chart. The page reports the pitch it can confirm and leaves the file size to the chain's maker.",
        },
      ]}
    >
      <ChainsawFileTool />
    </ToolPageLayout>
  );
}
