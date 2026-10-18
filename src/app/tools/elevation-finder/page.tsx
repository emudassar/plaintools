import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ElevationFinderTool from "@/components/ElevationFinderTool";
import { requireTool } from "@/config/tools";

const SLUG = "elevation-finder";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Elevation Finder: Get the Elevation of Any Point on a Map (Up to 50 Points)",
  description:
    "Click points on a map or paste places and coordinates to get the ground elevation of each in feet and metres, see the highest and lowest, and the height difference — worldwide, with CSV download.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the elevation of points on a map",
        steps: [
          { name: "Add points", text: "Click the map, or type places or coordinates — one per line — and press Add." },
          { name: "Read each elevation", text: "The table lists every point in feet and metres." },
          { name: "Compare them", text: "The headline gives the highest point, the lowest and the difference; the 'vs #1' column compares each point with the first." },
          { name: "Spot them on the map", text: "The highest point is red and the lowest blue." },
          { name: "Download", text: "Save the points and elevations as CSV, or clear and start again." },
        ],
      }}
      uses={{
        heading: "Why compare elevations of several points",
        items: [
          { title: "Choosing a house site on a sloping lot", body: "Click the corners to see how much the ground drops across the plot." },
          { title: "Checking which way water will drain", body: "Compare a yard, a road and a creek to see which is lowest." },
          { title: "Planning a hike or bike ride", body: "Compare trailhead, summit and campsite heights before you go." },
          { title: "Comparing towns for a move", body: "Check the altitude of several cities — relevant for climate and for anyone sensitive to altitude." },
          { title: "Flood awareness", body: "See how a property compares with a nearby river or coast." },
          { title: "Radio and antenna planning", body: "Compare the ground height of two sites before looking at line of sight." },
          { title: "Pipe and irrigation layout", body: "A rough height difference between a source and a field helps size a pump." },
          { title: "Geography lessons", body: "Click across a mountain range or a valley to see the profile in numbers." },
          { title: "Drone and kite flying", body: "Know the ground height at the launch point and nearby high ground." },
          { title: "Comparing summits", body: "Paste the coordinates of several peaks to rank them." },
        ],
      }}
      dataSection={{
        heading: "Where the elevations come from",
        paragraphs: [
          "Every point is looked up in the Copernicus DEM GLO-90, a worldwide digital elevation model released by the European Space Agency under the Copernicus programme, through the Open-Meteo elevation API. All points go in one request (up to 100 at a time), so the answers are consistent with each other.",
          "The model gives one height for each cell of a roughly 90 m grid, measured to the surface the radar saw — bare ground in open country, but often the tops of dense trees or buildings. Heights are relative to the EGM2008 geoid, which is close to mean sea level. Open water reads 0 m.",
          "Places you type are found with Photon (OpenStreetMap). Coordinates you paste can be decimal or degrees-minutes-seconds. Nothing is stored here; the points go to Open-Meteo and, for typed names, Photon.",
          "Limits: a 90 m cell averages the ground, so summits read lower than their true height and narrow valleys higher — the model gives Everest's cell as about 8,724 m against a surveyed 8,849 m. For a single US point with finer data, the What Is My Elevation? tool adds USGS 3DEP. Do not use these figures for flood insurance, construction or aviation; use a survey or official flood map.",
        ],
        sources: [
          { label: "Open-Meteo elevation API", href: "https://open-meteo.com/en/docs/elevation-api" },
          { label: "Copernicus DEM (ESA)", href: "https://doi.org/10.5270/ESA-c5d3d65", note: "GLO-90 dataset" },
          { label: "Photon geocoder", href: "https://photon.komoot.io", note: "place search" },
        ],
      }}
      faqs={[
        { question: "How accurate are the elevations?", answer: "The Copernicus model is accurate to a few metres on open, gentle ground, but each value is a 90 m average, so peaks read low, pits read high and forests or buildings can add height." },
        { question: "Why is my point 0?", answer: "The model sets open water to 0 m. A point on a lake shore or coast can fall in a water cell." },
        { question: "Is this height above sea level?", answer: "Approximately: heights are above the EGM2008 geoid, the standard model of mean sea level." },
        { question: "How many points can I add?", answer: "Up to 50 at a time." },
        { question: "Why does it differ from my GPS?", answer: "GPS altitude is measured from the ellipsoid, a smooth mathematical shape, and is less precise vertically than horizontally. Differences of tens of metres are normal." },
        { question: "Can I get an elevation profile along a line?", answer: "Yes — use the Elevation Profile tool, which samples points along a path you draw." },
      ]}
    >
      <ElevationFinderTool />
    </ToolPageLayout>
  );
}
