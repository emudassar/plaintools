import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CrowFliesTool from "@/components/CrowFliesTool";
import { requireTool } from "@/config/tools";

const SLUG = "as-the-crow-flies-distance-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "As the Crow Flies Distance Calculator (Miles & km)",
  description:
    "Get the straight-line distance between any two places in miles, kilometres and nautical miles — measured on the WGS84 ellipsoid, with the compass bearing and the route drawn on a map.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function CrowFliesPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to measure a distance as the crow flies",
        steps: [
          { name: "Enter the two places", text: "Cities, addresses or coordinates in the form 40.71, -74.01." },
          { name: "Check the matched names", text: "The result shows which place each entry matched; add a state or country if a name was ambiguous." },
          { name: "Read the distance", text: "Miles, kilometres and nautical miles, plus the starting compass bearing." },
          { name: "Adjust on the map", text: "Click the map to move point A, then B, and the distance updates." },
        ],
      }}
      uses={{
        heading: "10 reasons to measure a straight-line distance",
        items: [
          { title: "Checking a 'within X miles' rule", body: "Leases, school catchments and non-compete clauses sometimes use straight-line distance." },
          { title: "Flight planning for a drone or light aircraft", body: "Straight-line distance and bearing are the starting point before wind and airspace." },
          { title: "Comparing a road trip with the direct distance", body: "See how much longer the road is than the straight line." },
          { title: "Radio and antenna range", body: "Line-of-sight range questions start from the distance between two sites." },
          { title: "Hiking and orienteering", body: "Distance and bearing between two points for a map-and-compass leg." },
          { title: "Boating between two harbours", body: "Nautical miles and initial bearing for a crossing." },
          { title: "Settling a pub argument", body: "Is Reno really west of Los Angeles? The bearing answers it." },
          { title: "Delivery or service-area checks", body: "Whether a customer falls inside a straight-line service radius." },
          { title: "Long-haul flight curiosity", body: "Why the flight path on the seat-back map curves north — it is the straight line." },
          { title: "Geography homework", body: "Distances between capitals with the method stated." },
        ],
      }}
      dataSection={{
        heading: "How the distance is calculated",
        paragraphs: [
          "The distance is the geodesic — the shortest path over the surface of the WGS84 ellipsoid, the model of the Earth's shape used by GPS — calculated with Thaddeus Vincenty's 1975 inverse formula. The same formula gives the initial bearing (the compass direction to set off in, from true north) and the bearing on arrival. For comparison, the page also shows the great-circle distance on a sphere of the mean Earth radius (6,371.0088 km), the simpler 'haversine' model many calculators use.",
          "Place names are turned into coordinates by the Photon geocoder (OpenStreetMap). A city is matched to a single point, usually its centre as mapped in OpenStreetMap, so city-to-city distances are centre to centre. Everything else runs in your browser.",
          "Limits: this ignores roads, terrain, height above sea level and airspace — it is the straight line over the surface. Driving, walking and flight-route distances are longer. For nearly opposite points on the globe Vincenty's formula does not converge; the page then uses the sphere and says so.",
        ],
        sources: [
          { label: "Vincenty (1975), Survey Review — NOAA NGS copy", href: "https://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf" },
          { label: "Photon geocoder", href: "https://photon.komoot.io", note: "OpenStreetMap place coordinates" },
        ],
      }}
      faqs={[
        { question: "What does 'as the crow flies' mean?", answer: "The straight-line distance between two points over the Earth's surface, ignoring roads and terrain." },
        { question: "How accurate is this distance?", answer: "The ellipsoid calculation itself is accurate to well under a metre; the real limit is where each place name is placed on the map. For exact points, paste coordinates." },
        { question: "Why is the line curved on the map?", answer: "Flat web maps stretch the globe. The shortest path on the round Earth appears as a curve on them — it is still the straight line." },
        { question: "What is the difference from the 'sphere' figure?", answer: "The Earth is slightly flattened at the poles. The sphere figure treats it as a perfect ball; the headline uses the flattened WGS84 shape, which GPS also uses." },
        { question: "What is the bearing?", answer: "The compass direction from the first place toward the second at the start, in degrees clockwise from true north. On a long route the direction changes along the way." },
        { question: "Can I use coordinates?", answer: "Yes. Type them as latitude, longitude in decimal degrees, for example 51.5074, -0.1278." },
        { question: "Is this the flight distance?", answer: "It is close to the great-circle distance airlines quote, but actual flight paths follow airways and winds and are usually longer." },
      ]}
    >
      <CrowFliesTool />
    </ToolPageLayout>
  );
}
