import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ElevationTool from "@/components/ElevationTool";
import { requireTool } from "@/config/tools";

const SLUG = "what-is-my-elevation";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "What Is My Elevation? Height Above Sea Level Right Now",
  description:
    "Find your current elevation above sea level in feet and metres from your device's location or any address — USGS 3DEP and the Copernicus 90 m model side by side, plus your GPS altitude.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function WhatIsMyElevationPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find your elevation",
        steps: [
          { name: "Share your location or type a place", text: "Press the button and allow location access, or enter an address, city or coordinates." },
          { name: "Read the elevation", text: "The headline is the ground height above sea level, in feet and metres." },
          { name: "Compare the two models", text: "In the US, USGS 3DEP and the worldwide Copernicus model are shown side by side; a large gap means steep or complex ground." },
          { name: "Fine-tune on the map", text: "Click your exact spot on the map to read the elevation there." },
        ],
      }}
      uses={{
        heading: "10 situations where knowing your elevation helps",
        items: [
          { title: "Adjusting a recipe for altitude", body: "Baking times, boiling points and canning times change with height; you need the number before you look up the adjustment." },
          { title: "Checking a flood-risk claim", body: "Compare a property's ground height with a published flood level before trusting a listing's description." },
          { title: "Setting a barometer or altimeter", body: "A home weather station or watch altimeter asks for the local elevation to show sea-level pressure." },
          { title: "Planning a hike's climb", body: "Look up the trailhead and the summit to see how much height a route gains." },
          { title: "Filling in a permit or survey form", body: "Some septic, well and building forms ask for the site's approximate elevation." },
          { title: "Checking altitude before a high trip", body: "Know how high a destination sits before planning activity on the first day." },
          { title: "Calibrating a drone or GPS track", body: "Compare the ground model with what a device logged, which is usually height above the ellipsoid, not sea level." },
          { title: "Sizing a pump lift", body: "The height difference between a well, tank and house matters for pump selection." },
          { title: "Settling a 'which house is higher' question", body: "Compare two addresses on the same street from the same elevation model." },
          { title: "Teaching map reading", body: "Click around a valley on the map and watch the elevation change." },
        ],
      }}
      dataSection={{
        heading: "Where the elevation comes from",
        paragraphs: [
          "Two public elevation models are queried for the same point. The USGS Elevation Point Query Service returns a value from the 3D Elevation Program (3DEP), the US national elevation dataset, much of it derived from lidar; it covers the United States and parts of Canada and Mexico. The Open-Meteo Elevation API returns a value from the Copernicus DEM GLO-90, a worldwide model with 90 m grid cells from the European Space Agency and Airbus. Where USGS has data, its figure is the headline because its grid is finer.",
          "Both return the height of the ground surface above mean sea level for the point, in metres; this page converts to feet (1 ft = 0.3048 m). If you use your device's location, the browser may also report a GPS altitude. The W3C Geolocation standard defines that as height above the WGS84 ellipsoid, which is a different reference from sea level, so it is shown separately and never used as the answer.",
          "Limits: a 90 m model cell is an average, so summits read low and narrow valleys read high. Neither model knows the height of a building floor, a bridge deck or the top of a tree. Over open sea USGS returns nothing and Copernicus returns 0 m, which the page flags as water. Do not use these figures as a surveyed elevation — for a legal or engineering elevation, a licensed surveyor or an official benchmark is the source.",
        ],
        sources: [
          { label: "USGS Elevation Point Query Service", href: "https://apps.nationalmap.gov/epqs/", note: "3D Elevation Program" },
          { label: "Open-Meteo Elevation API", href: "https://open-meteo.com/en/docs/elevation-api", note: "Copernicus DEM GLO-90" },
          { label: "Copernicus DEM (DOI)", href: "https://doi.org/10.5270/ESA-c5d3d65" },
          { label: "W3C Geolocation API", href: "https://www.w3.org/TR/geolocation/", note: "altitude is above the WGS84 ellipsoid" },
        ],
      }}
      faqs={[
        { question: "What is my elevation right now?", answer: "Press 'Find my elevation' and allow location access. The page sends your coordinates to the USGS and Copernicus elevation models and shows the ground height above sea level for that point." },
        { question: "Why are the USGS and Copernicus numbers different?", answer: "They are different models. USGS 3DEP uses a much finer grid in the US, while Copernicus averages 90 m cells, so on slopes, ridges and riverbanks the two can differ by several metres or more." },
        { question: "Why doesn't my phone's GPS altitude match?", answer: "Browsers report altitude above the WGS84 ellipsoid, a mathematical surface, not above mean sea level. The difference depends on where you are, and phone altitude readings are also less precise than horizontal position." },
        { question: "Can I find the elevation of an address?", answer: "Yes. Type the address and press Look up, or click any spot on the map after a first lookup." },
        { question: "Does this work outside the United States?", answer: "Yes. USGS covers the US and nearby border areas; everywhere else the Copernicus GLO-90 value is shown." },
        { question: "Why does it say I am at 0 m?", answer: "If USGS has no data and Copernicus returns exactly 0 m, the point is almost always open water. Check that the right place was matched." },
        { question: "Is this my height or the ground's?", answer: "The ground's. Add your floor height or the height of whatever you are standing on." },
      ]}
    >
      <ElevationTool />
    </ToolPageLayout>
  );
}
