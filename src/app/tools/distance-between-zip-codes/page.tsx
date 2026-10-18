import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DistanceZipTool from "@/components/DistanceZipTool";
import { requireTool } from "@/config/tools";

const SLUG = "distance-between-zip-codes";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Distance Between ZIP Codes: Miles and Driving Time",
  description:
    "Calculate the distance between two ZIP codes in a straight line and by road, or from one ZIP code to a list of thousands at once with a CSV download.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate the distance between ZIP codes",
        steps: [
          { name: "Enter two ZIP codes", text: "Five digits each. ZIP+4 is accepted; the extra digits are ignored." },
          { name: "Read the distance", text: "Straight-line miles and kilometres, and the driving distance and time." },
          { name: "Compare the areas", text: "Each ZIP's population, median household income and land area are listed." },
          { name: "Many at once", text: "Switch to 'One ZIP to many', paste a list and download every distance as CSV." },
        ],
      }}
      uses={{
        heading: "When ZIP-to-ZIP distance helps",
        items: [
          { title: "Service-area pricing", body: "Charge by distance from your ZIP to each customer's ZIP." },
          { title: "Sales territories", body: "Distance from a branch to every ZIP in a lead list." },
          { title: "Shipping zones", body: "Approximate miles between origin and destination ZIPs." },
          { title: "Recruiting", body: "How far applicants live from the job site." },
          { title: "Insurance and healthcare networks", body: "Check distances between members and providers." },
          { title: "Marketing radius lists", body: "Sort a customer list by distance from a store." },
          { title: "Moving", body: "Compare commute distances from candidate neighbourhoods." },
          { title: "Event planning", body: "Distances from attendees' ZIPs to a venue." },
        ],
      }}
      dataSection={{
        heading: "Where the ZIP code points come from",
        paragraphs: [
          "ZIP codes are mail delivery routes, not areas, so the Census Bureau builds ZIP Code Tabulation Areas (ZCTAs) from them. This page uses the 33,791 ZCTAs in the Census 2024 Gazetteer, each with an internal point, land area, and American Community Survey 2019–2023 population and income.",
          "Distances are between those internal points: straight-line with Vincenty's formula on WGS84, and by road with OSRM over OpenStreetMap on the FOSSGIS servers (two-ZIP mode only).",
          "PO-box-only ZIPs, single-business ZIPs and some military ZIPs have no ZCTA and cannot be measured here.",
        ],
        sources: [
          { label: "Census Bureau: ZIP Code Tabulation Areas", href: "https://www.census.gov/programs-surveys/geography/guidance/geo-areas/zctas.html" },
          { label: "Census Bureau Gazetteer files", href: "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html" },
          { label: "OSRM API documentation", href: "https://project-osrm.org/docs/v5.24.0/api/" },
          { label: "FOSSGIS routing service", href: "https://routing.openstreetmap.de/about.html" },
        ],
      }}
      faqs={[
        { question: "Is the distance from the centre of the ZIP code?", answer: "From the Census internal point of the ZIP's tabulation area, which is inside the area near its middle. Large rural ZIPs can stretch many miles from that point." },
        { question: "Why is my ZIP not found?", answer: "It may be a PO-box-only or single-business ZIP, which has no area, or a new ZIP not yet in the Census files." },
        { question: "How many ZIPs can I compare at once?", answer: "Up to 5,000 in 'One ZIP to many'. The list is processed in your browser." },
        { question: "Why no driving distance for lists?", answer: "The free routing service asks for light use, so driving routes are only calculated for a single pair." },
        { question: "Is ZIP 10001 the same as ZCTA 10001?", answer: "Usually it covers nearly the same addresses, but ZCTAs are built from Census blocks and can differ slightly at the edges." },
      ]}
    >
      <DistanceZipTool />
    </ToolPageLayout>
  );
}
