import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GeoFileViewerTool from "@/components/GeoFileViewerTool";
import { requireTool } from "@/config/tools";

const SLUG = "gpx-viewer";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "GPX Viewer: View GPX Tracks With Distance and Elevation",
  description:
    "Open a GPX file and see the track on a map with distance, total climb and descent, time, average speed and an elevation chart. Convert GPX to KML, GeoJSON or CSV. No upload.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to view a GPX track",
        steps: [
          { name: "Open the GPX", text: "From a watch, phone app, bike computer or route planner." },
          { name: "See the track", text: "The route is drawn on the map with any waypoints." },
          { name: "Read the statistics", text: "Distance, climb, descent, highest and lowest points, time and average speed." },
          { name: "Check the elevation chart", text: "Move along it to read the height at each distance." },
          { name: "Convert", text: "Download as KML, GeoJSON or CSV." },
        ],
      }}
      uses={{
        heading: "What a GPX viewer is for",
        items: [
          { title: "Reviewing a hike or ride", body: "See the route and the climbing." },
          { title: "Checking a route before a trip", body: "Open a downloaded GPX from a trail site." },
          { title: "Comparing activities", body: "Distance and climb of two tracks." },
          { title: "Sharing a route", body: "Convert to KML for Google Earth." },
          { title: "Race courses", body: "Look at the elevation profile of a course." },
          { title: "Fixing a file", body: "See whether a track has gaps or spikes." },
        ],
      }}
      dataSection={{
        heading: "How the statistics are worked out",
        paragraphs: [
          "The file is read in your browser according to the GPX 1.1 schema: tracks, routes and waypoints with their elevation and time. Nothing is uploaded.",
          "Distance adds the geodesic (Vincenty) distance between consecutive points on WGS84. Climb and descent add every rise and drop in the recorded heights — GPS heights are noisy, so totals are usually somewhat higher than a barometric altimeter's. Time runs from the first to the last timestamp, including stops; average speed is distance over that time.",
        ],
        sources: [
          { label: "GPX 1.1 schema (Topografix)", href: "https://www.topografix.com/GPX/1/1/" },
          { label: "Vincenty (1975)", href: "https://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf" },
          { label: "OGC KML standard", href: "https://www.ogc.org/standards/kml/" },
        ],
      }}
      faqs={[
        { question: "Why is my climb different from Strava or Garmin?", answer: "Apps smooth or correct elevations differently. This page adds every recorded rise without smoothing." },
        { question: "My track has no elevation chart.", answer: "The file has no <ele> heights. Use the Elevation Profile tool to look them up from a terrain model." },
        { question: "Is moving time shown?", answer: "No — time is first to last point, stops included." },
        { question: "Can I open FIT or TCX files?", answer: "No, only GPX (and KML or GeoJSON). Most apps can export GPX." },
        { question: "Is the file uploaded?", answer: "No." },
      ]}
    >
      <GeoFileViewerTool format="gpx" />
    </ToolPageLayout>
  );
}
