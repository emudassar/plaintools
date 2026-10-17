import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import MiniSplitSizeTool from "@/components/MiniSplitSizeTool";
import { requireTool } from "@/config/tools";
import { ESTAR_URL } from "@/lib/room-ac-size";

const SLUG = "mini-split-size-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Mini Split Size Calculator: BTU per Room and Zone",
  description:
    "Enter each room's size, sun exposure, occupants and kitchen use and get the cooling capacity in BTU/h per zone and in total from ENERGY STAR's sizing chart and adjustments.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function MiniSplitPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to estimate mini split size by room",
        steps: [
          { name: "Add a zone per indoor head", text: "Name it and enter the room's length and width in feet." },
          { name: "Set the sun", text: "Heavily shaded takes 10% off; very sunny adds 10%." },
          { name: "Enter the people", text: "Each person beyond two who regularly uses the room adds 600 BTU/h." },
          { name: "Tick kitchens", text: "A kitchen adds 4,000 BTU/h." },
          { name: "Read BTU per zone and total", text: "With tons for comparing outdoor units." },
        ],
      }}
      uses={{
        heading: "10 situations where a mini split size calculator helps",
        items: [
          { title: "Planning a multi-zone system", body: "Get a figure for each head and the total for the outdoor unit." },
          { title: "Garage or workshop", body: "A starting capacity for a single-zone unit." },
          { title: "Bonus room over a garage", body: "Mark it sunny if it bakes in the afternoon." },
          { title: "Comparing installer quotes", body: "See whether a proposed head is far above or below the chart." },
          { title: "Adding cooling to one room", body: "A bedroom or office that the central system doesn't keep up with." },
          { title: "Kitchens and open plans", body: "The kitchen adjustment is often forgotten." },
          { title: "Home offices with several people", body: "Occupancy adds 600 BTU/h per person beyond two." },
          { title: "Avoiding an oversized unit", body: "ENERGY STAR notes an oversized unit removes less humidity and leaves rooms clammy." },
          { title: "Converting to tons", body: "Outdoor units are often described in tons; 12,000 BTU/h is one." },
          { title: "Budget planning", body: "Total capacity drives equipment cost." },
        ],
      }}
      dataSection={{
        heading: "Where the figures come from — and what they are not",
        paragraphs: [
          "The capacities are ENERGY STAR's sizing chart from its Room Air Conditioners page ('Properly Sized Room Air Conditioners'): area to be cooled in square feet against capacity needed in BTUs per hour, from 5,000 BTU/h for 100–150 ft² to 34,000 BTU/h for 2,000–2,500 ft², 'calculated based on an 8-foot ceiling'. The adjustments are ENERGY STAR's own: reduce 10% if heavily shaded, increase 10% if very sunny, add 600 BTUs for each person beyond two who regularly occupies the room, and add 4,000 BTUs if the unit is used in a kitchen. The page applies the percentage first and then the additions; ENERGY STAR doesn't state an order.",
          "A room whose area falls exactly on a boundary (such as 150 ft²) is given the lower row, since the chart reads '100 up to 150'. Rooms under 100 ft² or over 2,500 ft² are outside the chart and the page says so instead of guessing.",
          "What this is not: ENERGY STAR wrote this chart for room air conditioners. It is a published area-based starting point, not a heat-load calculation. Ductless installers size systems with a load calculation (ACCA Manual J) that accounts for insulation, windows, climate, ceiling height and air leakage, and heating capacity is a separate question entirely. Use these numbers to plan and to sanity-check a quote. Everything runs in your browser.",
        ],
        sources: [{ label: "ENERGY STAR — Room Air Conditioners: Properly Sized Room Air Conditioners", href: ESTAR_URL, note: "Area-to-capacity chart and adjustments" }],
      }}
      faqs={[
        { question: "What size mini split do I need for 500 square feet?", answer: "ENERGY STAR's chart gives 12,000 BTU/h for 450–550 ft², before adjustments for sun, occupants or a kitchen." },
        { question: "How many BTU per square foot?", answer: "The chart isn't a fixed rate: it runs from about 33–50 BTU/h per ft² for small rooms down to under 15 for large areas." },
        { question: "What does one ton mean?", answer: "12,000 BTU per hour of cooling. A 24,000 BTU/h unit is 2 tons." },
        { question: "Should I round up to the next unit size?", answer: "The page doesn't choose equipment. ENERGY STAR warns that an oversized unit is less effective, so compare with a load calculation before buying." },
        { question: "Does it account for high ceilings?", answer: "No. The chart assumes 8 ft ceilings; taller rooms have more air to cool." },
        { question: "Is this a Manual J calculation?", answer: "No. It's ENERGY STAR's area-based chart. A Manual J load calculation is the proper sizing method." },
      ]}
    >
      <MiniSplitSizeTool />
    </ToolPageLayout>
  );
}
