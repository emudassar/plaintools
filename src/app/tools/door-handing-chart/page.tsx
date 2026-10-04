import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DoorHandingTool from "@/components/DoorHandingTool";
import { requireTool } from "@/config/tools";

const SLUG = "door-handing-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Door Handing Chart: LH, RH, LHR or RHR in Three Questions",
  description:
    "Answer three questions — which side you're on, where the hinges are, which way the door swings — and get the door hand (LH, RH, LHR or RHR) by the rule in Allegion's handing procedures, with the full chart.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function DoorHandingChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out a door's hand",
        steps: [
          {
            name: "Decide which side is the outside",
            text: "For an exterior door, the street side. For a room door, the corridor or key side. The handing rule is defined from that side.",
          },
          {
            name: "Say where you are standing",
            text: "You can answer from either side. If you are inside, the tool flips your answers to the outside view.",
          },
          {
            name: "Note the hinge side",
            text: "Facing the door, are the hinges on your left or your right?",
          },
          {
            name: "Note the swing",
            text: "Does the door open away from you (you push) or toward you (you pull)?",
          },
          {
            name: "Read the hand",
            text: "Hinges left and swinging away is LH; right and away is RH; left and toward is LHR; right and toward is RHR, all from the outside.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the door hand matters",
        items: [
          { title: "Ordering a replacement door", body: "Prehung and slab doors are sold by hand. Ordering the wrong one means a return and a wasted trip." },
          { title: "Buying a lever lockset", body: "Some levers are handed. Schlage notes that the end of the lever should point toward the hinge side." },
          { title: "Ordering a door closer or exit device", body: "Commercial hardware is often specified by hand, including reverse hands for outswing doors." },
          { title: "Filling in a hardware schedule", body: "Door and frame schedules list the hand of each opening; the tool gives the standard abbreviation." },
          { title: "Reading a contractor's spec sheet", body: "LHR and RHR are easy to mix up. The chart shows exactly what each means." },
          { title: "Answering from inside a room", body: "If you can only stand inside, the tool converts your view to the outside view the rule uses." },
          { title: "Checking a steel door and frame order", body: "Steel frames are handed too. Getting the hand right before fabrication avoids a remake." },
          { title: "Replacing an exterior door", body: "Outswing exterior doors are reverse hands. The swing question catches that." },
          { title: "Teaching apprentices", body: "Three questions and a chart make the convention easy to explain on site." },
          { title: "Settling a disagreement on the job", body: "When two people name the same door differently, the manufacturer's written rule settles it." },
        ],
      }}
      dataSection={{
        heading: "Where the handing rule comes from",
        paragraphs: [
          "The rule is from Allegion's Steelcraft Technical Data Manual, Section 1, 'Handing procedures': view the door from the outside; the side the hinges are on is the hand of the door. If the door swings away from the viewer, it is a regular hand (right or left hand). If it swings toward the viewer, it is a reverse swing (right hand reverse or left hand reverse). Schlage's lever handing instruction (P509-664), also from Allegion, says the hand is determined by the direction of swing viewed from 'the outside, or corridor side of the door.'",
          "The tool applies that rule to your three answers. If you are standing inside, the hinges appear on the opposite side and the swing is reversed, so both are flipped before the rule is applied.",
          "Everything runs in your browser; nothing is sent or stored.",
          "The limits: deciding which face is the 'outside' is part of the convention — the street side for an exterior door, the corridor or key side for a room door. Manufacturers sometimes use other labels, such as reverse bevel (LHRB/RHRB), and some hardware is non-handed or reversible.",
          "This page names the hand. Check the hand against the specific product's ordering instructions, which govern that product.",
        ],
        sources: [
          {
            label: "Allegion — Steelcraft Technical Data Manual, Section 1 General Information (PDF)",
            href: "https://us.allegion.com/content/dam/allegion-us-2/web-files/steelcraft/technical-documents/Tech_Data_Manual_Section__1__General_Information_110552.pdf",
            note: "Handing procedures",
          },
          {
            label: "Allegion — Schlage handing instruction for lever lock installation (PDF)",
            href: "https://us.allegion.com/content/dam/allegion-us-2/web-files/schlage/installation-documents/Schlage_Lever_Locks_Door_Handing_Guide_108266.pdf",
            note: "Outside / corridor side definition and lever orientation",
          },
        ],
      }}
      faqs={[
        { question: "What is a left hand door?", answer: "Viewed from the outside, the hinges are on the left and the door swings away from you." },
        { question: "What is a left hand reverse door?", answer: "Viewed from the outside, the hinges are on the left and the door swings toward you — an outswing door." },
        { question: "Which side is the outside of an interior door?", answer: "Schlage's guide uses the corridor side. For a room off a hallway, stand in the hallway." },
        { question: "Can I work it out from inside the room?", answer: "Yes. Choose 'inside' and the tool flips the hinge side and swing to the outside view before naming the hand." },
        { question: "Is LHR the same as LHRB?", answer: "Schlage's lever guide uses 'Left Hand Reverse Bevel' (LRB) for the reverse-swing case. Check which term a product's catalog uses." },
        { question: "Does every lock need a hand?", answer: "No. Some hardware is non-handed or reversible. The product's instructions say whether a hand must be specified." },
      ]}
    >
      <DoorHandingTool />
    </ToolPageLayout>
  );
}
