import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BatchLookupTool from "@/components/BatchLookupTool";
import { requireTool } from "@/config/tools";

const SLUG = "coordinates-to-city";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Coordinates to City: Convert Latitude and Longitude to City Name (Bulk)",
  description:
    "Paste latitude/longitude pairs — one or up to 200 — and get the city, county, state and country for each from OpenStreetMap. Accepts decimal and DMS formats; download the results as CSV.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert coordinates to a city name",
        steps: [
          { name: "Paste your coordinates", text: "One pair per line. Decimal (30.2672, -97.7431), degrees-minutes-seconds and decimal minutes all work." },
          { name: "Press Look up", text: "Each line is looked up in turn; the table fills in as results arrive." },
          { name: "Check flagged rows", text: "Rows shaded yellow could not be read or are not near any mapped place — usually points at sea." },
          { name: "See them on the map", text: "Every point is pinned on the map below the table, so a swapped latitude and longitude stands out." },
          { name: "Download CSV", text: "The file has your input, the parsed coordinates, the city, county, state and country, and a status column." },
        ],
      }}
      uses={{
        heading: "What a coordinate-to-city lookup is used for",
        items: [
          { title: "Labelling GPS points from a phone or camera", body: "Photo metadata stores coordinates, not town names; this turns a list of them into places." },
          { title: "Cleaning a spreadsheet of customer locations", body: "App sign-ups often store latitude and longitude; sales wants the city." },
          { title: "Summarising field survey points by town", body: "Group hundreds of survey or sample sites by the city they fall in." },
          { title: "Checking delivery drop points", body: "Confirm that the coordinates a driver logged are in the expected town." },
          { title: "Reading coordinates from a news report", body: "An incident given as coordinates can be named in one step." },
          { title: "Tagging sensor readings", body: "Stations reporting coordinates get a readable place name for dashboards." },
          { title: "Listing the towns on a trip", body: "Paste the stop coordinates from a GPS log to list the towns along the way." },
          { title: "Preparing data for a chart", body: "Charts by city need city names, not decimal degrees." },
          { title: "Spotting bad coordinates", body: "A point named as a town on another continent shows a swapped or mistyped value." },
          { title: "Hiking and geocaching logs", body: "Name the nearest town for each summit or cache in a logbook." },
        ],
      }}
      dataSection={{
        heading: "How the cities are found",
        paragraphs: [
          "Each pair of coordinates is sent to Photon, an open reverse geocoder run by Komoot on OpenStreetMap data. Photon returns the nearest mapped feature and the city, county, state and country recorded for it, and the page shows those fields in one row per line you pasted.",
          "Lines are looked up one at a time with a short pause between them, so a list of 200 takes a minute or two. If the nearest named feature is more than 25 km from your point the row is flagged instead of naming a place that is not really there — the usual cause is a point in the sea or a swapped latitude and longitude.",
          "What 'city' means depends on the country and on how OpenStreetMap contributors tagged the area: it can be a city, town, village or municipality, and for a rural point it is the settlement the area is attached to. For US points, the What City Am I In? tool on this site checks Census city-limit boundaries instead.",
          "Coordinates are sent to Photon and nothing is stored by this site. Results are for convenience and data cleaning, not for legal or official address determination.",
        ],
        sources: [
          { label: "Photon geocoder", href: "https://photon.komoot.io", note: "reverse geocoding API" },
          { label: "OpenStreetMap copyright and licence", href: "https://www.openstreetmap.org/copyright", note: "ODbL — results are OpenStreetMap data" },
          { label: "OpenStreetMap wiki: Key:place", href: "https://wiki.openstreetmap.org/wiki/Key:place", note: "what city, town and village mean in the data" },
        ],
      }}
      faqs={[
        { question: "Which coordinate formats can I paste?", answer: "Decimal degrees (40.7484, -73.9857), degrees-minutes-seconds (40°44′54″N 73°59′8″W) and degrees-decimal-minutes (N 40 44.904 W 73 59.14). Separate latitude and longitude with a comma, a space or a tab." },
        { question: "Why is a row empty?", answer: "Either the line could not be read as coordinates, or the nearest mapped place is more than 25 km away — usually a point at sea, or latitude and longitude typed the wrong way round." },
        { question: "How many coordinates can I convert at once?", answer: "Up to 200 lines per run. They are looked up one at a time so the free service is not overloaded; split longer lists into batches." },
        { question: "Why does it name a nearby town rather than the city I expected?", answer: "OpenStreetMap attaches each area to the settlement mapped there. Suburbs that are separate municipalities get their own name, not the big city's." },
        { question: "Is the result the official city?", answer: "It is OpenStreetMap's place name. For US legal city limits use the What City Am I In? tool, which checks Census boundaries." },
        { question: "Are my coordinates stored?", answer: "No. They are sent to Photon to be looked up and are not stored by this site." },
      ]}
    >
      <BatchLookupTool mode="city" />
    </ToolPageLayout>
  );
}
