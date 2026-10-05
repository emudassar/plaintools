import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import TrollingMotorTool from "@/components/TrollingMotorTool";
import { requireTool } from "@/config/tools";

const SLUG = "what-size-trolling-motor-do-i-need";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "What Size Trolling Motor Do I Need? Thrust, Volts and Shaft",
  description:
    "Enter your fully loaded boat weight to get the minimum trolling motor thrust, the 12/24/36 V battery setup and Minn Kota's chart row, plus shaft length from your bow or transom height.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function WhatSizeTrollingMotorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to size a trolling motor",
        steps: [
          { name: "Add up the loaded weight", text: "Enter the boat with its engine, the people aboard, and gear, batteries, fuel and water. The rule uses the fully loaded weight." },
          { name: "Read the thrust", text: "The minimum is 2 lb of thrust per 100 lb, with the battery voltage that reaches it and the matching row of Minn Kota's chart." },
          { name: "Measure to the waterline", text: "For shaft length, measure from where the motor mounts on the bow or transom down to the water, and choose the mount." },
          { name: "Allow for rough water", text: "Tick rough water to add 5 inches to the measurement, as Minn Kota's chart says." },
        ],
      }}
      uses={{
        heading: "10 situations where sizing a trolling motor helps",
        items: [
          { title: "Buying a first bow-mount motor", body: "A 2,000 lb loaded bass boat needs at least 40 lb of thrust on the rule, which is a 12 V, one-battery motor." },
          { title: "Deciding between 12 V and 24 V", body: "A boat that needs 60 lb of thrust is past the 55 lb top of the 12 V tier, which means a second battery." },
          { title: "Adding people and gear", body: "Two extra anglers and a cooler can move a boat into the next chart row." },
          { title: "Choosing a shaft for a high bow", body: "A bow 30 inches above the water falls in the 54-72 inch shaft row." },
          { title: "Fitting a transom motor to a jon boat", body: "A transom 12 inches above the water is in the 36 inch row." },
          { title: "Fishing big water", body: "The rough-water allowance lengthens the shaft so the prop stays submerged in waves." },
          { title: "Working in kilograms", body: "Enter kg and the tool converts to pounds for the rule and the chart." },
          { title: "Checking a used motor", body: "Compare the thrust stamped on a second-hand motor with what the loaded boat needs." },
          { title: "Planning the battery bay", body: "The voltage tier tells you whether there is room to find for two or three batteries." },
          { title: "Heavier boats", body: "Over 4,500 lb, the chart's row is 101-112 lb of thrust on 36 V." },
        ],
      }}
      dataSection={{
        heading: "Where the figures come from",
        paragraphs: [
          "Thrust uses Minn Kota's rule from its Motor Size selection guide (Rev. 8.21.2020): at least 2 pounds of thrust for every 100 pounds of fully loaded boat weight, people and gear included. The same guide's chart is shown in full, and the row highlighted is the first one at or above your weight. The rule reproduces the chart's thrust for the 1,500, 2,000, 2,500, 3,500 and 4,000 lb rows; for 4,500 lb or more the chart lists 101-112 lb, more than the rule gives.",
          "Battery voltage uses Minn Kota's buying guide tiers: 55 lb of thrust or less = 12 V, one battery; 68-80 lb = 24 V, two batteries; 101-115 lb = 36 V, three batteries. The tool shows the smallest tier that reaches your minimum thrust.",
          "Shaft length uses the bow and transom charts in the same guide, measured from the mounting surface to the waterline. They are copied exactly, including a gap: the bow chart has no row for 10 to 16 inches, so a measurement there is reported as not covered, with the rows either side. The guide's footnotes are applied or shown: add 5 inches for rough water; add 9 inches for bow-mount Hand Control motors; the aim is the prop or motor centre at least 12 inches under the surface.",
          "Limits: these are one maker's published guidelines. Wind, current, hull shape and how you fish change what feels like enough; Minn Kota itself says to add thrust where wind or current are major factors. Other makers' motors and shaft charts may differ.",
        ],
        sources: [
          { label: "Minn Kota Motor Size selection guide / boat size chart (PDF, Rev. 8.21.2020)", href: "https://minnkota.johnsonoutdoors.com/sites/default/files/2023-02/min_productmanual_motor-select-guide.pdf", note: "2 lb per 100 lb; weight/length/thrust/battery chart; bow and transom shaft charts and footnotes" },
          { label: "Minn Kota trolling motor buying guide", href: "https://minnkota.johnsonoutdoors.com/us/learn/buying-guide/trolling-motors", note: "12 / 24 / 36 V thrust tiers; one battery per 12 V" },
        ],
      }}
      faqs={[
        { question: "What size trolling motor do I need for my boat?", answer: "Minn Kota's rule is at least 2 lb of thrust for every 100 lb of fully loaded boat weight. A 2,000 lb loaded boat needs at least 40 lb of thrust." },
        { question: "Does boat weight include people and gear?", answer: "Yes. The rule uses the fully loaded weight: hull, engine, people, gear, batteries, fuel and water." },
        { question: "Do I need a 12 V, 24 V or 36 V trolling motor?", answer: "In Minn Kota's buying guide, 55 lb of thrust or less is 12 V (one battery), 68-80 lb is 24 V (two batteries) and 101-115 lb is 36 V (three batteries)." },
        { question: "How much thrust for a 16 ft boat?", answer: "Length is only a guide; weight decides. Minn Kota's chart puts boats up to 14 ft at 1,500 lb or less and 30 lb of thrust, and 17-18 ft boats at 2,000 lb and 40-45 lb." },
        { question: "What shaft length do I need?", answer: "Measure from the mounting surface to the waterline. On Minn Kota's bow chart, 16-22 inches is a 42-45 inch shaft; on the transom chart, 10-16 inches is a 36 inch shaft." },
        { question: "Why does my bow measurement say it isn't covered?", answer: "Minn Kota's bow chart jumps from 0-10 inches (36 inch shaft) to 16-22 inches (42-45 inch shaft) with no row in between. The tool shows both neighbouring rows rather than inventing one." },
        { question: "Is more thrust better?", answer: "Minn Kota's guidance is that the rule is a minimum and that extra thrust helps where wind or current are major factors." },
      ]}
    >
      <TrollingMotorTool />
    </ToolPageLayout>
  );
}
