import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import RadiusListTool from "@/components/RadiusListTool";
import { requireTool } from "@/config/tools";

const SLUG = "zip-codes-within-radius";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "ZIP Codes Within a Radius: Find All ZIPs Within X Miles",
  description:
    "Find every ZIP code within a radius of an address or ZIP code — 5, 10, 25 miles or any distance — with each ZIP's distance, population and income. Copy the list or download CSV.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find ZIP codes within a radius",
        steps: [
          { name: "Set the radius", text: "Type a distance and choose miles or kilometres (up to 250 miles)." },
          { name: "Choose the centre", text: "Type an address or place, enter a ZIP code, use your location, or click the map." },
          { name: "Read the list", text: "ZIP codes inside the circle, nearest first, with population and median household income." },
          { name: "Copy or download", text: "Copy the comma-separated ZIP list, or download everything as CSV." },
        ],
      }}
      uses={{
        heading: "What a ZIP radius list is for",
        items: [
          { title: "Direct mail", body: "Pick the ZIP codes around a store for a mailing." },
          { title: "Ad targeting", body: "Most ad platforms accept a list of ZIP codes." },
          { title: "Service areas", body: "Publish the ZIPs a business serves." },
          { title: "Delivery and pricing zones", body: "Group ZIPs by distance band." },
          { title: "Franchise territories", body: "List the ZIPs within a set distance of a location." },
          { title: "Market research", body: "Total population and incomes around a site." },
          { title: "Recruiting", body: "Target job ads to ZIPs within commuting distance." },
          { title: "Real estate", body: "Comparable areas around a property." },
        ],
      }}
      dataSection={{
        heading: "Where the ZIP codes come from",
        paragraphs: [
          "ZIP codes are lists of delivery addresses, not areas, so the Census Bureau builds ZIP Code Tabulation Areas (ZCTAs) from them. This page uses the 33,791 ZCTAs of the Census 2024 Gazetteer, each with an internal point inside it.",
          "A ZIP is counted as within the radius when its internal point is inside the circle, measured with straight-line (geodesic) distance on the WGS84 ellipsoid. A large rural ZIP can overlap the edge of the circle without being listed, and a ZIP that is listed can extend beyond the circle.",
          "Population and median household income are American Community Survey 2019–2023 five-year estimates.",
        ],
        sources: [
          { label: "Census Bureau: ZIP Code Tabulation Areas", href: "https://www.census.gov/programs-surveys/geography/guidance/geo-areas/zctas.html" },
          { label: "Census Bureau Gazetteer files", href: "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html" },
          { label: "American Community Survey summary file", href: "https://www.census.gov/programs-surveys/acs/data/summary-file.html" },
        ],
      }}
      faqs={[
        { question: "Is a ZCTA the same as a ZIP code?", answer: "Nearly. ZCTAs are built from the ZIP codes of the addresses in each Census block. PO-box-only and single-business ZIPs have no ZCTA and will not appear." },
        { question: "Is the radius a driving distance?", answer: "No, a straight line. Driving distances are longer; try the Drive Time Map for travel-based areas." },
        { question: "How are ZIPs on the edge handled?", answer: "By their internal point: inside the circle means listed. Large rural ZIPs on the edge can go either way." },
        { question: "Can I use a ZIP code as the centre?", answer: "Yes — type it in the ZIP box and press Go; the centre is that ZIP's internal point." },
        { question: "What is the largest radius?", answer: "250 miles." },
        { question: "Is the population current?", answer: "It is the latest five-year ACS estimate (2019–2023)." },
      ]}
    >
      <RadiusListTool mode="zip" />
    </ToolPageLayout>
  );
}
