import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PlotCoordinatesTool from "@/components/PlotCoordinatesTool";
import { requireTool } from "@/config/tools";

const SLUG = "plot-coordinates-on-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Plot Coordinates on a Map: Paste a List of Latitude/Longitude Points",
  description:
    "Paste coordinates in decimal or DMS format, with optional labels, and see them pinned on a map. Join them as a route, measure the distance, and download as GeoJSON, KML or CSV.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to plot coordinates on a map",
        steps: [
          { name: "Paste your points", text: "One per line. A label can go before or after the coordinates: 'Home, 40.7, -74.0' or '40.7, -74.0, Home'." },
          { name: "Press Plot", text: "The map zooms to fit every point. Lines it cannot read are listed so you can fix them." },
          { name: "Join as a route", text: "Tick 'Join in order' to draw a line through the points in the order you pasted them." },
          { name: "Read the summary", text: "The straight-line distance through the points and their bounding box appear under the map." },
          { name: "Download", text: "Save the points as GeoJSON or KML for Google Earth and GIS software, or as a cleaned CSV." },
        ],
      }}
      uses={{
        heading: "What people plot coordinates for",
        items: [
          { title: "Checking a column of coordinates", body: "Paste a spreadsheet column to see at once whether any points land in the sea or the wrong country." },
          { title: "Visualising a GPS log or waypoint list", body: "See the stops from a tracker or a guidebook on one map." },
          { title: "Planning a multi-stop trip", body: "Plot hotels, sights and stations and see how they are spread out." },
          { title: "Field survey sites", body: "Show sampling or inspection sites before sending a crew." },
          { title: "Converting a list to KML for Google Earth", body: "Paste the points and download a KML file to open in Google Earth." },
          { title: "Mapping customers or stores", body: "A quick look at where a list of locations clusters." },
          { title: "Teaching coordinates", body: "Students can type coordinates and watch where they land." },
          { title: "Checking a drone flight plan", body: "Plot waypoints to make sure none strays outside the intended area." },
          { title: "Reviewing incident locations", body: "See a list of reported positions together." },
          { title: "Making a GeoJSON test file", body: "Developers can turn a few coordinates into a valid GeoJSON file." },
        ],
      }}
      dataSection={{
        heading: "How the points are read and drawn",
        paragraphs: [
          "Each line is read in your browser. The page accepts decimal degrees, degrees-minutes-seconds and decimal minutes, with N/S/E/W letters or minus signs, and treats any other text on the line as the label. Latitude comes first unless hemisphere letters say otherwise. Up to 1,000 points are drawn.",
          "Points are pinned on OpenStreetMap tiles. With 'Join in order' ticked, the distance shown is the sum of geodesic (shortest over the Earth's surface) distances between consecutive points on the WGS84 ellipsoid, computed with Vincenty's formulas. It is not a road or walking distance.",
          "GeoJSON is written to RFC 7946 (longitude before latitude, WGS84), KML to OGC KML 2.2. Nothing is uploaded: the points stay in your browser, and only map tiles are fetched from OpenStreetMap.",
          "Limits: a point is only as accurate as the coordinates you paste. If your data uses another datum (such as NAD27 or a national grid), convert it to WGS84 first or the pins can be off by tens to hundreds of metres.",
        ],
        sources: [
          { label: "RFC 7946: The GeoJSON Format", href: "https://www.rfc-editor.org/rfc/rfc7946" },
          { label: "OGC KML standard", href: "https://www.ogc.org/standards/kml/" },
          { label: "Vincenty (1975) — NOAA NGS copy", href: "https://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf", note: "distance between points" },
          { label: "OpenStreetMap copyright and licence", href: "https://www.openstreetmap.org/copyright", note: "map tiles" },
        ],
      }}
      faqs={[
        { question: "What format should each line be in?", answer: "Latitude then longitude, separated by a comma, space or tab: 40.6892, -74.0445. Degrees-minutes-seconds such as 40°41′21″N 74°2′40″W also work. Add a label before or after." },
        { question: "My points are in the wrong place. Why?", answer: "Usually latitude and longitude are swapped, or a minus sign is missing — western longitudes and southern latitudes are negative." },
        { question: "How many points can I plot?", answer: "Up to 1,000 at once." },
        { question: "Can I open the result in Google Earth?", answer: "Yes. Download the KML file and open it in Google Earth or Google My Maps." },
        { question: "Is the route distance the driving distance?", answer: "No. It is the straight-line distance between consecutive points. For road distance use the multi-stop distance tool." },
        { question: "Are my coordinates uploaded?", answer: "No. They are read and drawn in your browser; nothing is sent to this site." },
      ]}
    >
      <PlotCoordinatesTool />
    </ToolPageLayout>
  );
}
