import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import LatLonFinderTool from "@/components/LatLonFinderTool";
import { requireTool } from "@/config/tools";

const SLUG = "latitude-longitude-finder";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Latitude and Longitude Finder: Get Coordinates by Clicking a Map",
  description:
    "Click any spot on a map, search an address or use your location to get its latitude and longitude in decimal degrees, DMS and decimal minutes — plus UTM and MGRS — with one-click copy.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the latitude and longitude of a place",
        steps: [
          { name: "Find the place", text: "Search an address or landmark, use your device's location, or pan and zoom the map." },
          { name: "Click the exact spot", text: "Click the map where you want the coordinates — a doorway, a field corner, a dock." },
          { name: "Read the coordinates", text: "The headline gives latitude and longitude in decimal degrees to six places." },
          { name: "Pick a format", text: "The table also gives degrees-minutes-seconds, decimal minutes, UTM and MGRS." },
          { name: "Copy", text: "Use the Copy button next to the format your app or form needs." },
        ],
      }}
      uses={{
        heading: "Reasons people need exact coordinates",
        items: [
          { title: "Giving a meeting point with no address", body: "A trailhead, a festival gate or a beach spot can be shared as exact coordinates." },
          { title: "Setting a drone or survey waypoint", body: "Flight-planning apps and GPS units take coordinates, not addresses." },
          { title: "Filling in a permit or grant form", body: "Agency forms often ask for the latitude and longitude of a site." },
          { title: "Marking a property corner or well", body: "Record the approximate position of features for your own records." },
          { title: "Geotagging photos after the fact", body: "Add coordinates to photos taken with a camera that has no GPS." },
          { title: "Boating and fishing spots", body: "Save a mark as decimal minutes, the format most chartplotters use." },
          { title: "Search and rescue information", body: "Hiking plans left with family should include coordinates of the route and camps." },
          { title: "Adding a location to a spreadsheet or app", body: "Developers and analysts need coordinates for test data." },
          { title: "Military-style grid references", body: "MGRS is used by some search teams and on topographic maps." },
          { title: "Teaching latitude and longitude", body: "Students can click places and see how the numbers change." },
        ],
      }}
      dataSection={{
        heading: "How the coordinates are worked out",
        paragraphs: [
          "The map uses OpenStreetMap tiles in the Web Mercator projection. When you click, the page converts the pixel you clicked back to latitude and longitude with the standard slippy-map formulas, so the coordinates are on the WGS84 datum used by GPS and by Google, Apple and Bing maps.",
          "Degrees-minutes-seconds and decimal minutes are the same position written differently. UTM and MGRS are calculated in your browser with Krüger's series as given by Karney (2011), the method behind the GeographicLib library, and match the PROJ library to the millimetre in our tests.",
          "Searches use Photon, an open geocoder on OpenStreetMap data; your device location is asked only when you press the button. The nearest place name under the coordinates also comes from Photon. Nothing is stored here.",
          "Limits: a click is only as precise as the zoom — at street level one pixel is about a metre, at country level it is kilometres. Map imagery can be slightly offset in some places. For boundary, construction or legal work, use a survey-grade GPS or a licensed surveyor.",
        ],
        sources: [
          { label: "OpenStreetMap wiki: Slippy map tilenames", href: "https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames", note: "pixel to latitude/longitude" },
          { label: "Karney (2011), Transverse Mercator with an accuracy of a few nanometers", href: "https://arxiv.org/abs/1002.1417", note: "UTM formulas" },
          { label: "GeographicLib: MGRS", href: "https://geographiclib.sourceforge.io/C++/doc/classGeographicLib_1_1MGRS.html", note: "MGRS grid conventions" },
          { label: "Photon geocoder", href: "https://photon.komoot.io" },
        ],
      }}
      faqs={[
        { question: "Which coordinate format should I use?", answer: "Decimal degrees (40.748817, -73.985428) work in almost every app. Use degrees-minutes-seconds for older maps and forms, decimal minutes for marine GPS, and UTM or MGRS for topographic maps." },
        { question: "What does a negative number mean?", answer: "Negative latitude is south of the Equator; negative longitude is west of Greenwich. So the US has negative longitudes and Australia negative latitudes." },
        { question: "How precise are the coordinates?", answer: "They are shown to six decimals (about 10 cm) so nothing is lost when copying, but your click is only as precise as the map zoom — zoom in for accuracy." },
        { question: "Are these the same coordinates Google Maps uses?", answer: "Yes. Both use WGS84 latitude and longitude, so you can paste them into Google Maps." },
        { question: "Why doesn't UTM show near the poles?", answer: "UTM covers 80°S to 84°N. Polar areas use a different grid (UPS), which this tool does not compute." },
        { question: "Is my location saved?", answer: "No. Your device location stays in your browser; only searches and the nearest-place lookup are sent to Photon." },
      ]}
    >
      <LatLonFinderTool />
    </ToolPageLayout>
  );
}
