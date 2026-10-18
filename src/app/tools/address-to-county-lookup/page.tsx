import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BatchLookupTool from "@/components/BatchLookupTool";
import { requireTool } from "@/config/tools";

const SLUG = "address-to-county-lookup";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Address to County Lookup: What County Is This Address In?",
  description:
    "Find the county for any US address, or paste a list of up to 200 addresses and get each county name and FIPS code from 2020 Census blocks. Download the results as CSV.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to look up the county for an address",
        steps: [
          { name: "Paste the addresses", text: "One per line, up to 200. Coordinates work too." },
          { name: "Press Look up", text: "Each address is found on the map, then its county is read from the Census block it falls in." },
          { name: "Check the matches", text: "The 'Matched place' column shows what each address was matched to." },
          { name: "Download", text: "Save the county names and FIPS codes as CSV." },
        ],
      }}
      uses={{
        heading: "When you need the county for an address",
        items: [
          { title: "Sales tax and property tax", body: "Many tax rates are set by county." },
          { title: "Voter and court records", body: "Elections and courts are run by county." },
          { title: "Customer lists", body: "Add county and FIPS codes to a mailing list." },
          { title: "Health and research data", body: "Join addresses to county-level statistics by FIPS code." },
          { title: "Insurance and lending", body: "County-based rating and reporting." },
          { title: "Permits", body: "Unincorporated addresses fall under county rules." },
          { title: "Shipping", body: "County-based delivery zones." },
          { title: "Real estate", body: "Find the county recorder for a property." },
        ],
      }}
      dataSection={{
        heading: "Where the county comes from",
        paragraphs: [
          "Each address is located with the Photon geocoder, built on OpenStreetMap data. The resulting point is then sent to the FCC Area API, which returns the 2020 Census block that contains it, and with it the county name and five-digit FIPS code.",
          "Because the county comes from the Census block the point falls in, it is the legal county — even where the mailing city is in a different county.",
          "Accuracy depends on the geocoder finding the right spot. Check the matched place column; a vague address may be placed at the centre of a town or street.",
        ],
        sources: [
          { label: "FCC Area API", href: "https://geo.fcc.gov/api/census/" },
          { label: "Photon geocoder", href: "https://photon.komoot.io" },
          { label: "Census Bureau: FIPS codes", href: "https://www.census.gov/library/reference/code-lists/ansi.html" },
        ],
      }}
      faqs={[
        { question: "What is a county FIPS code?", answer: "A five-digit code: two digits for the state and three for the county. 17031 is Cook County, Illinois." },
        { question: "Why does my address show a different county than its city?", answer: "Postal city names often cross county lines. The county here comes from the exact point of the address." },
        { question: "How many addresses can I look up?", answer: "Up to 200 at a time, looked up one by one." },
        { question: "What about Connecticut?", answer: "Since 2022 Connecticut's county-equivalents for Census purposes are nine planning regions; those are what the FCC returns." },
        { question: "Does it work for territories?", answer: "Puerto Rico and other territories return their municipio or district equivalents." },
        { question: "Is my list stored?", answer: "No. Each address is sent only to the geocoder and the FCC lookup." },
      ]}
    >
      <BatchLookupTool mode="county" />
    </ToolPageLayout>
  );
}
