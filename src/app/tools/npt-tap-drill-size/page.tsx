import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import NptTapDrillTool from "@/components/NptTapDrillTool";
import { requireTool } from "@/config/tools";

const SLUG = "npt-tap-drill-size";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "NPT Tap Drill Size Chart: 1/16 to 3 Inch Pipe Threads",
  description:
    "NPT tap drill sizes from 1/16\" to 3\" — 1/8-27 NPT takes an R drill (0.339\"), 1/4-18 a 7/16\" — with decimal and mm equivalents and the NPS straight-thread drill, from a tap manufacturer's chart.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function NptTapDrillSizePage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the tap drill for a pipe thread",
        steps: [
          {
            name: "Pick the nominal pipe size",
            text: "Pipe threads are named by nominal pipe size, not the hole diameter — a 1/8\" NPT hole is about a third of an inch across.",
          },
          {
            name: "Read the NPT drill",
            text: "The result gives the drill as the chart prints it (a letter or a fraction), plus its decimal size in inches and millimetres.",
          },
          {
            name: "Check the threads per inch",
            text: "The TPI is shown alongside, so you can confirm you have the right tap — 27, 18, 14, 11-1/2 or 8 TPI depending on size.",
          },
          {
            name: "Use the NPS figure for straight pipe threads",
            text: "For a straight (NPS) pipe tap of the same size the chart lists a different, slightly larger drill. It is shown where the chart gives one.",
          },
          {
            name: "Confirm against your tap maker",
            text: "The values are one manufacturer's published chart. If your tap's maker lists a different drill, theirs applies to their tap.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the NPT drill size is needed",
        items: [
          {
            title: "Adding a 1/8\" NPT port for a gauge or sensor",
            body: "When a gauge, sender or fitting has a 1/8\" NPT thread, the chart's R drill (0.339\") is the hole to drill before tapping.",
          },
          {
            title: "Tapping an air compressor manifold",
            body: "1/4\" NPT fittings need a 7/16\" drill by this chart — a standard fractional bit most shops have.",
          },
          {
            title: "Machining a hydraulic or fuel block",
            body: "Fabricators tapping 3/8\" or 1/2\" NPT ports need 37/64\" and 23/32\" drills, sizes that are easy to confuse without a chart.",
          },
          {
            title: "Converting a letter drill to decimal",
            body: "Letter drills such as D and R are not obvious; the tool shows them as 0.246\" and 0.339\" and in millimetres.",
          },
          {
            title: "Working with metric drill sets",
            body: "The millimetre equivalent helps pick the nearest metric drill when a letter or fractional size is not available — then check it against the tap maker.",
          },
          {
            title: "Telling NPT from NPS drill sizes",
            body: "Straight pipe threads use a slightly larger drill than tapered ones of the same nominal size. Seeing both side by side avoids drilling the wrong one.",
          },
          {
            title: "Buying the right drills before a job",
            body: "A plumbing or fabrication job with several pipe sizes needs several drills. The full chart lists them all at once.",
          },
          {
            title: "Repairing a stripped pipe thread port",
            body: "Moving up a pipe size means a new drill and tap. The chart shows what the next size needs.",
          },
          {
            title: "Teaching machining or plumbing students",
            body: "The chart shows the relationship between nominal pipe size, threads per inch and drill size in one table.",
          },
          {
            title: "Checking a drill size quoted on a forum",
            body: "Forum answers sometimes give different drills for the same NPT size. A manufacturer's chart is a fixed reference to compare against.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the drill sizes come from",
        paragraphs: [
          "The sizes are taken from Sowa Tool's published 'Tap & Drill Charts', from its sections for taper pipe taps (NPT) and straight pipe taps (NPS). For NPT it lists: 1/16-27 D, 1/8-27 R, 1/4-18 7/16\", 3/8-18 37/64\", 1/2-14 23/32\", 3/4-14 59/64\", 1-11-1/2 1-5/32\", 1-1/4-11-1/2 1-1/2\", 1-1/2-11-1/2 1-47/64\", 2-11-1/2 2-7/32\", 2-1/2-8 2-5/8\" and 3-8 3-1/4\". Letter-drill decimals (D 0.2460\", R 0.3390\", S 0.3480\") come from the same document's decimal-equivalents table.",
          "Fractional sizes are converted to decimals exactly, and millimetres are inches × 25.4. Nothing is fetched while you use the page.",
          "The limits: this is one tap maker's chart. Other manufacturers' charts sometimes give a slightly different drill for the same pipe thread, and when that happens the maker of the tap you are using is the authority. The hole size is a starting point — material, tap wear and how far the tap is run in all affect the finished thread, which is checked with a thread gauge or the mating fitting.",
          "This page lists published sizes; it is not a machining procedure, and it does not cover NPTF dryseal threads, BSPT or metric pipe threads.",
        ],
        sources: [
          {
            label: "Sowa Tool — Tap & Drill Charts (PDF)",
            href: "https://www.sowatool.com/INTERSHOP/static/WFS/Sowa-Webshop_US-Site/-/Sowa-Webshop_CA/en_US/Download%20Centre/Speeds%20and%20Feeds/TapAndDrill-Charts.pdf",
            note: "Taper Pipe Taps (NPT), Straight Pipe Taps (NPS) and decimal equivalents",
          },
        ],
      }}
      faqs={[
        {
          question: "What size drill for 1/8 NPT?",
          answer: "An R drill, 0.339\" (8.61 mm), according to Sowa Tool's chart. 1/8\" NPT has 27 threads per inch.",
        },
        {
          question: "What size drill for 1/4 NPT?",
          answer: "7/16\" (0.4375\", 11.11 mm). 1/4\" NPT has 18 threads per inch.",
        },
        {
          question: "What size drill for 3/8 NPT and 1/2 NPT?",
          answer: "3/8\"-18 NPT takes a 37/64\" drill (0.5781\") and 1/2\"-14 NPT a 23/32\" drill (0.7188\"), by the same chart.",
        },
        {
          question: "Why is the hole so much bigger than the pipe size?",
          answer:
            "Pipe thread sizes are nominal names, not hole diameters. The chart's drill for a 1/8\" NPT thread is 0.339\" and for a 1/2\" thread 0.7188\" — always look the drill up rather than reading it off the size.",
        },
        {
          question: "Is the NPS drill the same as NPT?",
          answer:
            "No. In the chart, straight pipe taps (NPS) use a slightly larger drill than taper pipe taps (NPT) of the same size — for 1/8\" it is S (0.348\") instead of R (0.339\").",
        },
        {
          question: "Another chart gives a different drill. Which is right?",
          answer:
            "Tap makers publish their own recommendations, and they do not always agree exactly. Use the figure from the maker of the tap in your hand.",
        },
      ]}
    >
      <NptTapDrillTool />
    </ToolPageLayout>
  );
}
