import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BearingTool from "@/components/BearingTool";
import { requireTool } from "@/config/tools";

const SLUG = "bearing-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Bearing Calculator: True and Magnetic Bearing Between Two Points",
  description:
    "Get the bearing from one place to another: true and magnetic initial bearing, final bearing, back bearing and the constant-heading rhumb line, with today's magnetic declination from WMM2025.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the bearing between two points",
        steps: [
          { name: "Enter both places", text: "Type addresses, place names or coordinates for A and B, then press 'Get bearing'. Or click the map twice." },
          { name: "Read the true bearing", text: "The headline gives the direction to set off from A, in degrees clockwise from true north, with its compass point." },
          { name: "Use the magnetic bearing with a compass", text: "It subtracts today's magnetic declination at A, from the World Magnetic Model." },
          { name: "Check the other bearings", text: "The arrival bearing, the back bearing and the constant-heading rhumb line are listed below." },
        ],
      }}
      uses={{
        heading: "When you need a bearing",
        items: [
          { title: "Taking a compass heading on a hike", body: "Use the magnetic bearing; the compass needle points to magnetic north, not true north." },
          { title: "Aiming a satellite dish or antenna", body: "The initial true bearing is the azimuth to the other station along the shortest path." },
          { title: "Boating and flying", body: "The rhumb line is the single heading that gets you there without turning; the great-circle bearing is shorter but changes." },
          { title: "Orienteering and map work", body: "Compare the map bearing with the magnetic one before setting the compass." },
          { title: "Surveying a property line", body: "Get the bearing between two corner coordinates." },
          { title: "Ham radio beam headings", body: "Point a directional antenna toward a distant station." },
          { title: "Solar and wind site planning", body: "Find the direction from a site to a landmark or obstruction." },
          { title: "Drone flight planning", body: "Set a heading between two waypoints." },
        ],
      }}
      dataSection={{
        heading: "How the bearings are calculated",
        paragraphs: [
          "The initial and final bearings come from Vincenty's inverse formula on the WGS84 ellipsoid — the shortest path over the surface (a geodesic). Bearings are measured clockwise from true north, 0° to 360°.",
          "Magnetic declination is the angle between true north and the direction a compass needle points. It is computed for point A at sea level and today's date from the World Magnetic Model 2025, the model published by NOAA's National Centers for Environmental Information and the British Geological Survey and used by GPS receivers and smartphones. Magnetic bearing = true bearing − declination, with east declination positive. Local rocks, buildings and vehicles can deflect a real compass beyond the model.",
          "The rhumb line keeps one compass heading the whole way. It is a straight line on a Mercator chart but longer than the shortest path, especially at high latitudes and over long distances. It is computed with the spherical formulas in Ed Williams' Aviation Formulary.",
          "All calculations run in your browser. Place names are looked up with the Photon geocoder (OpenStreetMap).",
        ],
        sources: [
          { label: "Vincenty (1975), Direct and inverse solutions of geodesics on the ellipsoid", href: "https://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf" },
          { label: "NOAA NCEI: World Magnetic Model", href: "https://www.ncei.noaa.gov/products/world-magnetic-model" },
          { label: "Aviation Formulary (Ed Williams)", href: "https://edwilliams.org/avform147.htm" },
        ],
      }}
      faqs={[
        { question: "What is the difference between true and magnetic bearing?", answer: "A true bearing is measured from true (geographic) north. A magnetic bearing is measured from where a compass needle points, which differs by the magnetic declination — from zero to more than 20° depending on where you are." },
        { question: "Why is the bearing on arrival different?", answer: "The shortest path over a sphere or ellipsoid curves relative to the meridians, so the heading changes along the way. Only routes along a meridian or the equator keep the same bearing." },
        { question: "What is a back bearing?", answer: "The bearing from B back to A along the same path. It is the arrival bearing plus 180°." },
        { question: "Which bearing should I follow?", answer: "For short distances they are nearly the same. Over long distances, a constant heading (rhumb line) is simpler to steer but longer; great-circle routes are shorter but need the heading updated as you go." },
        { question: "How accurate is the magnetic declination?", answer: "WMM2025 models the Earth's main field, which changes slowly; local anomalies from rocks, steel and power lines are not in the model and can be larger than its own error. Near the magnetic poles compasses are unreliable and the page warns you." },
        { question: "Does it account for elevation?", answer: "No. Bearings are on the ellipsoid surface; height makes no practical difference to the direction." },
      ]}
    >
      <BearingTool />
    </ToolPageLayout>
  );
}
