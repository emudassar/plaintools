import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ZipTool from "@/components/ZipTool";
import { requireTool } from "@/config/tools";

const SLUG = "what-zip-code-am-i-in";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "What ZIP Code Am I In? Find Your ZIP Code From Your Location",
  description:
    "Find the ZIP code you are in from your phone's location or any address, see the ZIP code area outlined on a map, and get its population, median income and home value from Census data.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the ZIP code you are in",
        steps: [
          { name: "Share your location or type an address", text: "Press 'Find my ZIP code' and allow location access, or type an address or coordinates." },
          { name: "Read the ZIP code", text: "The headline is the Census ZIP Code Tabulation Area that contains the point." },
          { name: "See the area", text: "The map shades the whole ZIP code area so you can see where it ends." },
          { name: "Read the local figures", text: "Population, median household income and median home value come from the Census Bureau's American Community Survey." },
          { name: "Check another spot", text: "Click the map anywhere to look up a different point, such as across a busy road where ZIP codes often change." },
        ],
      }}
      uses={{
        heading: "Why people look up the ZIP code where they are",
        items: [
          { title: "Filling in a form away from home", body: "A hotel, hospital or venue form asks for the ZIP code of where you are now." },
          { title: "Ordering delivery to a park or beach", body: "Food apps ask for a ZIP code before showing what delivers to the spot." },
          { title: "Checking which ZIP a new-build street is in", body: "Streets too new for some map apps still fall inside a Census ZIP area." },
          { title: "Finding store or service coverage", body: "Service areas are often listed by ZIP code; this gives the one for the exact spot." },
          { title: "Comparing neighbourhoods when house hunting", body: "Median income and home value for the ZIP area give a first, rough comparison." },
          { title: "Weather and air-quality alerts", body: "Many alert services sign you up by ZIP code." },
          { title: "Emergency forms and insurance claims", body: "A claim form asks for the ZIP code where a loss happened, not your home ZIP." },
          { title: "Telling where a ZIP code boundary runs", body: "The shaded area shows which side of a street belongs to which ZIP area." },
          { title: "Sales territory planning", body: "Territories set by ZIP code need the area, not just a single address." },
          { title: "Travel and road trips", body: "Find the ZIP code at a rest stop or trailhead to look up local services." },
        ],
      }}
      dataSection={{
        heading: "Where the ZIP code and figures come from",
        paragraphs: [
          "The page asks the Census Bureau's TIGERweb service which 2020 Census ZIP Code Tabulation Area (ZCTA) contains your point, and draws the area's outline. ZCTAs are the Bureau's area approximations of USPS ZIP codes: each census block is assigned the ZIP code most of its addresses use, and blocks are grouped into areas.",
          "Population, median household income and median value of owner-occupied homes are American Community Survey 2019–2023 5-year estimates for that ZCTA (tables B01003, B19013 and B25077), read from the Census Bureau's table-based summary file and bundled with this site. Land area comes from the Census Bureau's 2024 Gazetteer file.",
          "Your coordinates come from your device's location service, asked only when you press the button, or from the address you type (looked up with Photon, which uses OpenStreetMap). Coordinates go to the Census Bureau's server; nothing is stored here.",
          "Limits: a ZCTA is not the same as a USPS ZIP code. The Postal Service treats ZIP codes as delivery routes and changes them without regard to the Census areas; PO-box and single-building ZIP codes have no ZCTA; and an address near the edge of an area can use the neighbouring ZIP code. ACS figures are survey estimates with margins of error, especially for small ZCTAs. For mailing, use the USPS ZIP code lookup.",
        ],
        sources: [
          { label: "Census Bureau: ZIP Code Tabulation Areas", href: "https://www.census.gov/programs-surveys/geography/guidance/geo-areas/zctas.html", note: "how ZCTAs are built and how they differ from ZIP codes" },
          { label: "US Census Bureau TIGERweb", href: "https://tigerweb.geo.census.gov/tigerwebmain/TIGERweb_main.html", note: "ZCTA boundaries" },
          { label: "American Community Survey summary file", href: "https://www.census.gov/programs-surveys/acs/data/summary-file.html", note: "2019–2023 5-year estimates" },
          { label: "USPS ZIP Code Lookup", href: "https://tools.usps.com/zip-code-lookup.htm", note: "the official ZIP code for a mailing address" },
        ],
      }}
      faqs={[
        { question: "Is this the same as my postal ZIP code?", answer: "For most addresses, yes. But the result is the Census Bureau's ZIP Code Tabulation Area, built from ZIP codes in each census block. An address near the edge can have the neighbouring ZIP code; check the USPS lookup for mail." },
        { question: "Why does it say there is no ZIP code here?", answer: "ZCTAs cover land where people have addresses. Lakes, large parks, military land and the sea often have none. The page then lists the nearest ZIP areas." },
        { question: "Why is my PO box ZIP code missing?", answer: "ZIP codes used only for PO boxes or a single building have no area of their own, so there is no ZCTA for them." },
        { question: "How accurate are the income and home value figures?", answer: "They are American Community Survey 5-year estimates, which come from a sample and have margins of error — wider in small ZIP areas. Treat them as a rough picture." },
        { question: "Does it use my IP address?", answer: "No. It uses your device's location with your permission, or the address you type." },
        { question: "How current are the ZIP code areas?", answer: "They are the 2020 Census ZCTAs, which the Census Bureau uses until the next decennial census. ZIP codes the Postal Service created later are not in them." },
        { question: "Is my location stored?", answer: "No. Coordinates are sent to the Census Bureau's TIGERweb service to find the area and are not stored by this site." },
      ]}
    >
      <ZipTool />
    </ToolPageLayout>
  );
}
