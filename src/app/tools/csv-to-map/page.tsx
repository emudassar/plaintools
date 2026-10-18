import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CsvToMapTool from "@/components/CsvToMapTool";
import { requireTool } from "@/config/tools";

const SLUG = "csv-to-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "CSV to Map: Plot Spreadsheet Data on a Map",
  description:
    "Turn a CSV or spreadsheet into a map: plot rows from latitude/longitude columns or addresses, colour points by any column and export to GeoJSON or KML. Runs in your browser.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to map a CSV file",
        steps: [
          { name: "Open or paste the CSV", text: "Save your spreadsheet as CSV; the first row must be column names." },
          { name: "Check the columns", text: "Latitude and longitude columns are detected automatically; or choose an address column." },
          { name: "Find addresses if needed", text: "Up to 200 addresses are looked up one at a time." },
          { name: "Style the map", text: "Pick a label column and a column to colour by." },
          { name: "Export", text: "GeoJSON for GIS or KML for Google Earth." },
        ],
      }}
      uses={{
        heading: "What people map from spreadsheets",
        items: [
          { title: "Customer lists", body: "See where customers are." },
          { title: "Store or branch locations", body: "A quick map from a list." },
          { title: "Field data", body: "Survey points with categories." },
          { title: "Event attendees", body: "Where people are coming from." },
          { title: "Real estate", body: "Listings by price band." },
          { title: "Research", body: "Sites colour-coded by type." },
        ],
      }}
      dataSection={{
        heading: "How the CSV is read",
        paragraphs: [
          "The file is parsed in your browser according to RFC 4180; commas, semicolons and tabs are detected from the first line. Nothing is uploaded unless you choose to look up addresses.",
          "Coordinates may be decimal degrees or degrees-minutes-seconds on WGS84 (GPS). Address lookups use the Photon geocoder (OpenStreetMap), one row at a time, up to 200 rows.",
          "Colouring uses up to 12 distinct values of the chosen column.",
        ],
        sources: [
          { label: "RFC 4180: CSV format", href: "https://www.rfc-editor.org/rfc/rfc4180" },
          { label: "Photon geocoder", href: "https://photon.komoot.io" },
          { label: "GeoJSON specification (RFC 7946)", href: "https://www.rfc-editor.org/rfc/rfc7946" },
        ],
      }}
      faqs={[
        { question: "Which column names are recognised?", answer: "lat, latitude, y and lon, lng, long, longitude, x (and a few variants). You can also choose columns yourself." },
        { question: "My points are in the wrong place.", answer: "Check that latitude and longitude are not swapped and that western longitudes are negative." },
        { question: "Can I map an Excel file?", answer: "Save it as CSV first (File → Save As → CSV)." },
        { question: "How many rows can it handle?", answer: "Thousands of rows with coordinates; address lookups are limited to 200." },
        { question: "Is my data uploaded?", answer: "No, except the address text when you ask for addresses to be found." },
      ]}
    >
      <CsvToMapTool />
    </ToolPageLayout>
  );
}
