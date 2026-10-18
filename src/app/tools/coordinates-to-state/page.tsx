import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BatchLookupTool from "@/components/BatchLookupTool";
import { requireTool } from "@/config/tools";

const SLUG = "coordinates-to-state";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Coordinates to State: US State and County From Latitude/Longitude (Bulk)",
  description:
    "Paste one or up to 200 latitude/longitude pairs and get the US state, two-letter code, county and FIPS codes for each from 2020 Census blocks via the FCC Area API. Download CSV.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the state for coordinates",
        steps: [
          { name: "Paste US coordinates", text: "One pair per line, latitude first — decimal, DMS or decimal minutes." },
          { name: "Press Look up", text: "Each point is checked against 2020 Census blocks." },
          { name: "Read state and county", text: "Each row gives the state name, postal code, county and the state and county FIPS codes." },
          { name: "Check flagged rows", text: "Points outside the US, or in water outside any block, are flagged." },
          { name: "Download CSV", text: "Export everything, including FIPS codes for joining to Census or other government data." },
        ],
      }}
      uses={{
        heading: "Why convert coordinates to a state",
        items: [
          { title: "Assigning sales tax by state", body: "Orders logged with coordinates need a state before tax can be worked out." },
          { title: "Joining points to Census data", body: "State and county FIPS codes let you merge records with Census and BLS tables." },
          { title: "Checking licensing territory", body: "Professionals licensed by state can check that job sites fall inside their state." },
          { title: "Cleaning research data", body: "Wildlife sightings or soil samples with coordinates get state and county columns." },
          { title: "Routing leads to regional teams", body: "Leads captured with a location go to the team covering that state." },
          { title: "Fuel-tax trip records", body: "Reporting miles by state starts from where trucks actually were." },
          { title: "Points near a state line", body: "Each point is checked against Census blocks rather than guessed from a city name." },
          { title: "Spotting bad data", body: "A record that lands in the wrong state reveals a typo or swapped values." },
          { title: "Insurance and incident reports", body: "Locations given as coordinates need a state for jurisdiction." },
          { title: "Counting events per state", body: "Turn a list of coordinates into state totals." },
        ],
      }}
      dataSection={{
        heading: "Where the state and county come from",
        paragraphs: [
          "Each pair is sent to the Federal Communications Commission's Area API, which returns the 2020 Census block containing the point together with that block's state, county and FIPS codes. Because the answer comes from Census block geography, it follows the state and county lines used by the Census Bureau.",
          "The API covers the 50 states, the District of Columbia and Puerto Rico, plus the Island Areas, where it returns codes but sometimes no county name. Points outside the US, or in water that no block covers, come back empty and are flagged.",
          "Lines are looked up one at a time. Coordinates go only to the FCC service; nothing is stored here.",
          "Limits: the answer is only as accurate as your coordinates — a point a few metres from a line can belong to either side if the coordinates are rounded. The result reports Census geography; it is not a legal determination of where a property is for tax or jurisdiction purposes.",
        ],
        sources: [
          { label: "FCC Area API", href: "https://geo.fcc.gov/api/census/", note: "Census block lookup by latitude/longitude" },
          { label: "Census Bureau: ANSI and FIPS codes", href: "https://www.census.gov/library/reference/code-lists/ansi.html", note: "state and county code lists" },
          { label: "Census Bureau: what are census blocks?", href: "https://www.census.gov/newsroom/blogs/random-samplings/2011/07/what-are-census-blocks.html" },
        ],
      }}
      faqs={[
        { question: "What are FIPS codes?", answer: "Federal Information Processing Standard codes: 2 digits for a state and 5 for a county (state plus 3). Most US government datasets use them to identify areas." },
        { question: "Does it work outside the US?", answer: "No. Points outside US Census geography return no result and are flagged." },
        { question: "Why is the county name missing for some points?", answer: "For some Island Areas the service returns the FIPS code but no county name; the code is still shown." },
        { question: "How accurate is it near state lines?", answer: "The lines are the Census Bureau's. Accuracy depends on your coordinates: rounded values can move a point across a nearby line." },
        { question: "How many points can I check?", answer: "Up to 200 per run, one at a time." },
        { question: "Is this a legal determination of location?", answer: "No. It reports the Census block's state and county. For tax or legal questions, official records decide." },
      ]}
    >
      <BatchLookupTool mode="state" />
    </ToolPageLayout>
  );
}
