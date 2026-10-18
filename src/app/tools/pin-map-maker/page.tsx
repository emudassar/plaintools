import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PinMapTool from "@/components/PinMapTool";
import { requireTool } from "@/config/tools";

const SLUG = "pin-map-maker";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Pin Map Maker: Make a Map With Multiple Pins and Share It",
  description:
    "Make a map with pins: add places by address or click, label and colour each pin, then share it with a link or download KML, GeoJSON or CSV. Free, no account.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to make a pin map",
        steps: [
          { name: "Add pins", text: "Search an address or place, use your location, or click the map." },
          { name: "Label and colour them", text: "Edit each pin's label and colour in the list." },
          { name: "Share", text: "Make a share link — the pins travel in the link itself." },
          { name: "Download", text: "KML for Google Earth or My Maps, GeoJSON for GIS, CSV for spreadsheets." },
        ],
      }}
      uses={{
        heading: "What people pin",
        items: [
          { title: "Places to visit", body: "A trip wish-list map." },
          { title: "Customer or member locations", body: "See where people are." },
          { title: "Event venues", body: "Pins for each venue with labels." },
          { title: "Real-estate shortlist", body: "Houses you are viewing." },
          { title: "Restaurant lists", body: "Share favourite spots with friends." },
          { title: "Field sites", body: "Survey or sampling points." },
          { title: "Store locations", body: "A simple locator map." },
          { title: "Teaching", body: "Places from a lesson." },
        ],
      }}
      dataSection={{
        heading: "How the map works",
        paragraphs: [
          "Addresses are found with the Photon geocoder from OpenStreetMap data; the map is OpenStreetMap. Pins are WGS84 coordinates.",
          "The share link stores the pins after the # in the web address. Browsers never send that part to the server, so this site stores nothing and anyone with the link sees the same pins.",
          "Downloads are standard KML, GeoJSON and CSV that open in Google Earth, Google My Maps, QGIS and spreadsheets.",
        ],
        sources: [
          { label: "Photon geocoder", href: "https://photon.komoot.io" },
          { label: "OGC KML standard", href: "https://www.ogc.org/standards/kml/" },
          { label: "GeoJSON specification (RFC 7946)", href: "https://www.rfc-editor.org/rfc/rfc7946" },
        ],
      }}
      faqs={[
        { question: "Do I need an account?", answer: "No. The map lives in the link and the files you download." },
        { question: "How many pins can I add?", answer: "Up to 300 in a share link." },
        { question: "Can I import pins into Google My Maps?", answer: "Yes, download KML or CSV and import it into a My Maps layer." },
        { question: "Is my map private?", answer: "Only people with the link can see it, and the pins are not stored on this site." },
        { question: "Can I add pins from a spreadsheet?", answer: "Use CSV to Map for many rows at once." },
      ]}
    >
      <PinMapTool />
    </ToolPageLayout>
  );
}
