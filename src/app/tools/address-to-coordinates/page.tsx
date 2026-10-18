import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BatchLookupTool from "@/components/BatchLookupTool";
import { requireTool } from "@/config/tools";

const SLUG = "address-to-coordinates";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Address to Coordinates: Convert Addresses to Latitude and Longitude (Bulk)",
  description:
    "Convert one address or a list of up to 200 into latitude and longitude with the matched place name, using OpenStreetMap data. See every point on a map and download the results as CSV.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert addresses to coordinates",
        steps: [
          { name: "Paste addresses", text: "One per line: a street address, a city, a postcode or a landmark name." },
          { name: "Press Look up", text: "Each line is geocoded in turn and the table fills in." },
          { name: "Check the matched place", text: "The 'Matched place' column shows what each line was matched to, so you can catch a wrong town." },
          { name: "Look at the map", text: "Every result is pinned; an outlier usually means an ambiguous address." },
          { name: "Download CSV", text: "Export input, latitude, longitude and the matched place." },
        ],
      }}
      uses={{
        heading: "What address geocoding is used for",
        items: [
          { title: "Mapping a customer or member list", body: "Mapping tools need coordinates; this turns a column of addresses into them." },
          { title: "Planning delivery or sales routes", body: "Route planners and distance calculators work from coordinates." },
          { title: "Entering a destination in a GPS or drone app", body: "Some devices accept only latitude and longitude." },
          { title: "Preparing data for a GIS project", body: "Turn an address table into points for QGIS or ArcGIS." },
          { title: "Event and wedding planning", body: "Plot guest hotels and venues to see how far apart they are." },
          { title: "Comparing properties", body: "Map a shortlist of houses with coordinates for each." },
          { title: "Remote or rural addresses", body: "Give visitors precise coordinates where the address alone is hard to find." },
          { title: "Research and journalism", body: "Geocode a list of incidents or facilities from a public report." },
          { title: "Checking an address exists", body: "If nothing matches, the address may be misspelled or too new for the map." },
          { title: "Building a store locator", body: "Get coordinates for each branch to load into a map." },
        ],
      }}
      dataSection={{
        heading: "How addresses are matched",
        paragraphs: [
          "Each line is sent to Photon, an open geocoder run by Komoot on OpenStreetMap data. Photon returns the best-matching mapped feature and its coordinates; the tool shows the coordinates and a label built from the feature's name, street, city, state and postcode, so you can see exactly what was matched.",
          "OpenStreetMap coverage of house numbers varies: in many places a street address matches the building, elsewhere only the street or the town. When a query is just a place name, the page prefers a settlement over a point of interest with a similar name. Coordinates are WGS84 decimal degrees to six places, which is more precise than the match itself.",
          "Lines are looked up one at a time with a short pause, so 200 addresses take a minute or two. Addresses go to Photon only; nothing is stored here.",
          "Limits: an ambiguous line ('Springfield') matches one place among many — add the state or country. Results are approximate and must not be used where a surveyed location is required, such as property boundaries or emergency dispatch.",
        ],
        sources: [
          { label: "Photon geocoder", href: "https://photon.komoot.io" },
          { label: "OpenStreetMap copyright and licence", href: "https://www.openstreetmap.org/copyright", note: "ODbL" },
          { label: "OpenStreetMap wiki: Addresses", href: "https://wiki.openstreetmap.org/wiki/Addresses", note: "how house numbers are mapped" },
        ],
      }}
      faqs={[
        { question: "How accurate are the coordinates?", answer: "As accurate as the OpenStreetMap feature matched: a building where house numbers are mapped, otherwise the street or the centre of the town. The 'Matched place' column shows which." },
        { question: "Why did my address match the wrong town?", answer: "Many place names repeat. Add the state, county or country to the line, or a postcode." },
        { question: "What format are the coordinates in?", answer: "Decimal degrees on the WGS84 datum — the format used by GPS, Google Maps and most mapping software." },
        { question: "How many addresses can I convert?", answer: "Up to 200 per run. Paste longer lists in batches." },
        { question: "Can I geocode addresses outside the US?", answer: "Yes. Photon covers the whole world, with detail that depends on local OpenStreetMap mapping." },
        { question: "Are my addresses stored?", answer: "No. They are sent to Photon to be matched and are not kept by this site." },
      ]}
    >
      <BatchLookupTool mode="geocode" />
    </ToolPageLayout>
  );
}
