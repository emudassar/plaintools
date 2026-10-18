import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BatchLookupTool from "@/components/BatchLookupTool";
import { requireTool } from "@/config/tools";

const SLUG = "coordinates-to-country";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Coordinates to Country: Find the Country for Latitude and Longitude (Bulk)",
  description:
    "Paste one latitude/longitude pair or up to 200 and get the country name and ISO 3166-1 alpha-2 code for each. Points at sea are flagged, not guessed. Download as CSV.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the country for a set of coordinates",
        steps: [
          { name: "Paste coordinates", text: "One pair per line, latitude first. Decimal and degrees-minutes-seconds formats are both read." },
          { name: "Press Look up", text: "Each point is checked in turn and the table fills in as results arrive." },
          { name: "Read the country and code", text: "Each row gives the country name and its two-letter ISO 3166-1 code." },
          { name: "Check the yellow rows", text: "Points with no country within 25 km — open sea, or a typo — are flagged rather than assigned to the nearest coast." },
          { name: "Download CSV", text: "Export the input, coordinates, country, code and status for your spreadsheet." },
        ],
      }}
      uses={{
        heading: "Why convert coordinates to a country",
        items: [
          { title: "Tagging app users or orders by country", body: "Logged coordinates become a country column for reporting or tax rules." },
          { title: "Checking shipping paperwork", body: "Confirm which country a warehouse or pickup point's coordinates are in." },
          { title: "Cleaning scientific sample data", body: "Field records often carry coordinates only; journals ask for the country." },
          { title: "Finding swapped coordinates", body: "A point that lands in the wrong country is a quick sign that latitude and longitude are reversed." },
          { title: "Labelling flight or ship positions", body: "Name the country under a list of positions, with points over open water flagged." },
          { title: "Adding a country filter to a dataset", body: "An ISO code column lets data be grouped or joined to other country tables." },
          { title: "Checking points near a border", body: "See which side of a border each point falls on, as OpenStreetMap records it." },
          { title: "Travel logs", body: "Turn camera GPS tags into a list of countries visited." },
          { title: "Geofencing tests", body: "Check test coordinates near borders before using them in an app." },
          { title: "Event monitoring", body: "Event feeds with coordinates get a country name for sorting." },
        ],
      }}
      dataSection={{
        heading: "How the country is found",
        paragraphs: [
          "Each pair is sent to Photon, an open reverse geocoder on OpenStreetMap data, which returns the nearest mapped feature with its country and ISO 3166-1 alpha-2 country code. The tool shows those two fields.",
          "If Photon's nearest feature is more than 25 km from the point, the row is marked as having no country rather than named after the nearest coast. A point a few kilometres offshore may still return the coastal country, while one far out returns nothing.",
          "Borders follow OpenStreetMap. Where a border is disputed, OpenStreetMap records the line of actual control on the ground, which may differ from a particular government's position. This is a data lookup, not a statement about sovereignty.",
          "Lines are looked up one at a time with a short pause between them. Nothing is stored by this site; the coordinates go only to Photon.",
        ],
        sources: [
          { label: "Photon geocoder", href: "https://photon.komoot.io", note: "reverse geocoding" },
          { label: "ISO 3166 country codes", href: "https://www.iso.org/iso-3166-country-codes.html" },
          { label: "OpenStreetMap wiki: Disputed territories", href: "https://wiki.openstreetmap.org/wiki/Disputed_territories" },
          { label: "OpenStreetMap copyright and licence", href: "https://www.openstreetmap.org/copyright" },
        ],
      }}
      faqs={[
        { question: "What is the ISO code?", answer: "The two-letter country code from the ISO 3166-1 standard, such as US, GB or JP — the codes used in internet domains and most databases." },
        { question: "Why does a point at sea show no country?", answer: "The page only names a country when a mapped feature is within 25 km. Far out at sea there is none, so it says so instead of guessing the nearest coast." },
        { question: "How are disputed areas handled?", answer: "They follow OpenStreetMap, which maps the situation on the ground. That may not match a given government's official position." },
        { question: "Can I convert a long list?", answer: "Up to 200 lines per run. Longer lists can be pasted in batches." },
        { question: "Does it accept degrees, minutes and seconds?", answer: "Yes — for example 35°39′31″N 139°42′1″E — as well as decimal degrees and decimal minutes." },
        { question: "Are my coordinates kept?", answer: "No. They are sent to Photon for the lookup and are not stored here." },
      ]}
    >
      <BatchLookupTool mode="country" />
    </ToolPageLayout>
  );
}
