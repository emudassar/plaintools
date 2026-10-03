import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import AdaRampTool from "@/components/AdaRampTool";
import { requireTool } from "@/config/tools";

const SLUG = "ada-ramp-calculator";
// Fails the build if the registry entry is missing, so a page can never exist
// without being wired into the nav, footer and sitemap.
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "ADA Ramp Calculator: Ramp Length, Landings and Handrails for Your Rise",
  description:
    "Enter the rise and get the minimum ADA ramp length at 1:12, the number of runs and 60-inch landings, and whether handrails are required — every figure tied to its section of the 2010 ADA Standards. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function AdaRampCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out an ADA ramp",
        steps: [
          {
            name: "Measure the total rise",
            text: "Measure straight up from the lower surface to the upper one — for example from the sidewalk to the top of the door threshold. Use a level and a tape held vertically, not a measurement along a slope.",
          },
          {
            name: "Keep the slope at 1:12 unless an exception applies",
            text: "The standard's maximum running slope is 1:12 — one inch of rise for every 12 inches of length. Steeper 1:10 and 1:8 slopes are allowed only in existing buildings where space limits require them, and only for very small rises (6 inches and 3 inches).",
          },
          {
            name: "Read the length, runs and landings",
            text: "The length is the horizontal distance of sloped ramp. No single run may rise more than 30 inches, so taller rises are split into several runs with a level landing between each. Every run has a landing at the top and the bottom.",
          },
          {
            name: "Add the landings to the footprint",
            text: "The ramp length does not include landings. Each landing is at least 60 inches long, and 60 by 60 inches where the ramp turns. The result gives a straight-line total including landings as a starting point for the footprint.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the ramp numbers decide the plan",
        items: [
          {
            title: "A shop owner adding a ramp to a stepped entrance",
            body: "A 7-inch step needs 84 inches of ramp at 1:12, plus landings, and handrails because the rise is over 6 inches. Knowing the footprint first shows whether it fits on the sidewalk frontage at all.",
          },
          {
            title: "A family planning a ramp before a parent comes home from hospital",
            body: "A private home is usually outside the ADA Standards, but the federal figures are a published, checkable reference point. A 24-inch porch works out to 24 feet of ramp at 1:12 plus two landings, which is why the available space needs measuring before anything is ordered.",
          },
          {
            title: "A contractor quoting a commercial ramp",
            body: "Crossing 30 inches of rise adds a second run, an intermediate landing and more handrail. Getting the run and landing count right at quote time avoids underpricing the job.",
          },
          {
            title: "A church or community hall with a raised floor",
            body: "A hall whose floor sits 40 inches above the ground works out to 40 feet of sloped ramp in two runs with three landings. Seeing that footprint in numbers is what lets a committee compare a ramp with the other accessible-route options the standard lists, such as a platform lift.",
          },
          {
            title: "Checking whether an existing short ramp can stay at 1:10",
            body: "Table 405.2 allows 1:10 in existing facilities only for a total rise of 6 inches or less. A 7-inch rise at 1:10 is outside that table, which the calculator shows immediately.",
          },
          {
            title: "Seeing whether a small threshold needs a ramp at all",
            body: "A change in level of 1/4 inch may be vertical, and up to 1/2 inch may be beveled. Above 1/2 inch it has to be ramped. Measuring a door threshold shows which side of that line it falls on.",
          },
          {
            title: "Deciding when handrails are part of the job",
            body: "Handrails are required on runs that rise more than 6 inches. A ramp rising 6 inches exactly does not trigger them; 6.5 inches does, which changes the materials list.",
          },
          {
            title: "Planning a switchback ramp for a narrow lot",
            body: "When a straight ramp does not fit, runs are turned at landings — and each turning landing must be at least 60 by 60 inches. Knowing the number of runs gives the number of turning landings to fit.",
          },
          {
            title: "An occupational therapist preparing a home-access report",
            body: "A report often needs the rise, the 1:12 length and the landing count stated clearly. Having each figure tied to a section number makes the report easy for a contractor or funder to check.",
          },
          {
            title: "Converting a metric measurement",
            body: "A rise measured in centimetres can be entered directly. The calculation runs in inches, as the standard does, and reports the length in feet and inches.",
          },
        ],
      }}
      dataSection={{
        heading: "Where these numbers come from",
        paragraphs: [
          "Every figure comes from the 2010 ADA Standards for Accessible Design, published by the U.S. Department of Justice, read from ADA.gov on 2026-10-03. Section 405.2 limits the running slope to 1:12, with Table 405.2 allowing slopes between 1:12 and 1:10 for a maximum rise of 6 inches, and between 1:10 and 1:8 for a maximum rise of 3 inches, in existing sites, buildings and facilities where space limitations require it; steeper than 1:8 is prohibited. Section 405.6 limits the rise of any ramp run to 30 inches. Section 405.7 requires a landing at the top and bottom of each run, at least 60 inches long, and 60 by 60 inches where the ramp changes direction. Section 405.8 requires handrails on runs with a rise greater than 6 inches. Section 405.5 sets a 36-inch minimum clear width and 405.3 a 1:48 maximum cross slope. The thresholds below which no ramp is needed come from §303.2–303.4.",
          "The calculation is the slope ratio applied to the rise: at 1:12, the horizontal length is the rise times 12. The number of runs is the rise divided by 30 inches, rounded up, and runs are shown split evenly. It all runs in your browser; nothing you type is sent anywhere or stored.",
          "There are clear limits. The page computes the minimum length of sloped ramp; it does not draw a layout, so turning landings, door maneuvering clearances (§405.7.5) and site constraints are yours to fit. It does not cover curb ramps (§406), edge protection detail (§405.9), handrail design (§505), or any state or local code, which can be stricter. The ADA Standards apply to public accommodations, commercial facilities and state and local government facilities; whether they apply to a particular building is a legal question, and private homes are usually outside them.",
          "This page must not replace a design professional, a building department or a legal opinion on ADA compliance. It reports what the cited sections give for the rise you enter.",
        ],
        sources: [
          {
            label: "ADA.gov — 2010 ADA Standards for Accessible Design",
            href: "https://www.ada.gov/law-and-regs/design-standards/2010-stds/",
            note: "§303 and §405, the source of every figure on this page",
          },
          {
            label: "U.S. Access Board — Guide to the ADA Standards, Chapter 4: Ramps and Curb Ramps",
            href: "https://www.access-board.gov/ada/guides/chapter-4-ramps-and-curb-ramps/",
            note: "the federal Access Board's plain-language guide to the ramp requirements",
          },
        ],
      }}
      faqs={[
        {
          question: "How long does an ADA ramp need to be?",
          answer:
            "At the standard maximum slope of 1:12, one foot of horizontal ramp for every inch of rise. A 24-inch rise needs 24 feet of sloped ramp, and landings at the top and bottom are added on top of that. Any rise over 30 inches must be split into more than one run with level landings between them.",
        },
        {
          question: "What is the maximum slope for an ADA ramp?",
          answer:
            "1:12, which is about 8.33 percent, under §405.2. Steeper slopes of 1:10 and 1:8 are permitted only in existing facilities where space is limited, and only for total rises of up to 6 inches and 3 inches respectively. Steeper than 1:8 is prohibited.",
        },
        {
          question: "How often does a ramp need a landing?",
          answer:
            "At the top and bottom of every run, and no run may rise more than 30 inches. So a 30-inch rise needs one run and two landings; a 45-inch rise needs two runs and three landings. Each landing is at least 60 inches long, and 60 by 60 inches where the ramp turns.",
        },
        {
          question: "When are handrails required on a ramp?",
          answer:
            "On ramp runs with a rise greater than 6 inches, under §405.8. A run that rises exactly 6 inches or less does not require them under that section.",
        },
        {
          question: "Does the ADA apply to a ramp at my house?",
          answer:
            "Usually not — the ADA Standards apply to public accommodations, commercial facilities and state and local government facilities. Local residential codes may have their own ramp rules. The ADA figures can still be used as a reference for a home ramp, but that is a choice, not a requirement this page can confirm.",
        },
        {
          question: "What about the 1:20 slope I have seen mentioned?",
          answer:
            "1:20 is not a ramp minimum. It is the steepest running slope allowed for an ordinary walking surface on an accessible route (§403.3). Section 402.2 lists the parts an accessible route can be made of — walking surfaces no steeper than 1:20, ramps, curb ramps, elevators and platform lifts among them — so on an accessible route, anything steeper than 1:20 has to be one of the other components, such as a ramp meeting §405.",
        },
        {
          question: "Do I need a ramp for a small threshold?",
          answer:
            "Under §303, a change in level of up to 1/4 inch may be vertical, and between 1/4 and 1/2 inch it may be beveled at no steeper than 1:2. Anything over 1/2 inch must be ramped. Enter the threshold height to see which applies.",
        },
      ]}
    >
      <AdaRampTool />
    </ToolPageLayout>
  );
}
