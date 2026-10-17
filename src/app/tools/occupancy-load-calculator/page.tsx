import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import OccupancyLoadTool from "@/components/OccupancyLoadTool";
import { requireTool } from "@/config/tools";
import { IBC_CH10_URL } from "@/lib/occupancy-load";

const SLUG = "occupancy-load-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Occupancy Load Calculator (IBC Table 1004.5)",
  description:
    "Pick the function of each space — restaurant seating, business, classroom, mercantile and more — enter its floor area and get the occupant load from IBC 2021 Table 1004.5, space by space and in total.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function OccupancyLoadPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate occupant load",
        steps: [
          { name: "Split the building into spaces", text: "One entry per function: dining, kitchen, offices, storage." },
          { name: "Pick each function", text: "From IBC Table 1004.5; each has a factor in square feet per occupant, gross or net." },
          { name: "Enter each area", text: "Gross or net, as the factor says." },
          { name: "Read the load", text: "Occupants per space, rounded up, and the total." },
        ],
      }}
      uses={{
        heading: "10 situations where an occupancy load calculator helps",
        items: [
          { title: "Opening a restaurant", body: "Dining with tables and chairs is 15 ft² net per person; the kitchen 200 gross." },
          { title: "Event venues", body: "Standing space at 5 ft² net per person gives a much higher load." },
          { title: "Office leases", body: "Business areas at 150 ft² gross per person." },
          { title: "Retail stores", body: "Mercantile sales floor at 60 ft² gross." },
          { title: "Gyms", body: "Exercise rooms at 50 ft² gross." },
          { title: "Classrooms and training rooms", body: "20 ft² net per student." },
          { title: "Posting a room's capacity", body: "Assembly spaces must post their occupant load; get the starting number." },
          { title: "Planning exits", body: "Occupant load drives exit count and width — start here, then read the code." },
          { title: "Comparing layouts", body: "Chairs-only vs tables-and-chairs changes the load sharply." },
          { title: "Due diligence on a building", body: "Rough capacity of each floor before talking to the building department." },
        ],
      }}
      dataSection={{
        heading: "Where the factors come from",
        paragraphs: [
          "The factors are Table 1004.5, 'Maximum Floor Area Allowances per Occupant', of the 2021 International Building Code, read on the ICC's public code site. Section 1004.5 says the occupant load 'shall be not less than that number determined by dividing the floor area under consideration by the occupant load factor assigned to the function of the space'. Factors are in square feet per occupant and are either gross (inside the exterior walls, including corridors, toilets and the like) or net (the occupied area only).",
          "Each space's result is rounded up to a whole person. Section 1004.5.1 lets the building official approve a higher load, but never more than one occupant per 7 ft² of occupiable floor space; the page shows that ceiling for reference. Section 1004.8 sets concentrated business use at no less than one occupant per 50 ft² gross.",
          "Limits: spaces with fixed seating (counted by seats, §1004.6) and covered mall buildings (§402.8.2) use other rules and aren't included. Your jurisdiction may use another code edition or amendments, and the building official decides the function of a space. Use this for planning, not for a permit. Everything runs in your browser.",
        ],
        sources: [{ label: "2021 International Building Code — Chapter 10, Section 1004 and Table 1004.5", href: IBC_CH10_URL, note: "Occupant load factors, gross and net" }],
      }}
      faqs={[
        { question: "How do I calculate occupancy load?", answer: "Divide the floor area by the occupant load factor for its use from IBC Table 1004.5, and round up. 1,200 ft² of tables and chairs at 15 ft² net is 80 people." },
        { question: "What is the occupant load factor for a restaurant?", answer: "Dining with tables and chairs (unconcentrated assembly) is 15 ft² net per person; a commercial kitchen 200 ft² gross." },
        { question: "What's the difference between gross and net?", answer: "Gross includes everything inside the exterior walls; net counts only the occupied area, excluding corridors, toilets, closets and similar spaces." },
        { question: "What is the occupant load factor for an office?", answer: "Business areas: 150 ft² gross per occupant." },
        { question: "Can the occupant load be increased?", answer: "The building official may approve more, but not above one occupant per 7 ft² of occupiable floor space (IBC §1004.5.1)." },
        { question: "Does my city use this table?", answer: "Most US jurisdictions adopt the IBC, sometimes with amendments or a different edition; check with your building department." },
      ]}
    >
      <OccupancyLoadTool />
    </ToolPageLayout>
  );
}
