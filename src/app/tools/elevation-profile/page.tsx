import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ElevationProfileTool from "@/components/ElevationProfileTool";
import { requireTool } from "@/config/tools";

const SLUG = "elevation-profile";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Elevation Profile: Climb and Descent Along a Path or Route",
  description:
    "Draw a path or route between two places and get an elevation profile chart with total climb and descent, highest and lowest points and the steepest grade. Download as CSV.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to get an elevation profile",
        steps: [
          { name: "Draw or route", text: "Click points along your path on the map, or switch tabs and enter two places to follow roads or trails." },
          { name: "Get the profile", text: "The page reads ground elevation at 200 evenly spaced points." },
          { name: "Read the chart", text: "Move along the chart to see the elevation at each distance." },
          { name: "Check the totals", text: "Total climb, total descent, lowest and highest points and the steepest stretch; download the samples as CSV." },
        ],
      }}
      uses={{
        heading: "When an elevation profile helps",
        items: [
          { title: "Hiking", body: "How much climbing is on a trail before you go." },
          { title: "Cycling", body: "Where the hills are on a ride and how steep they get." },
          { title: "Running", body: "Compare the elevation of race courses." },
          { title: "Driving with a trailer or RV", body: "Spot long grades on a route." },
          { title: "Drainage and pipelines", body: "Check the fall along a planned line." },
          { title: "Radio links", body: "See whether terrain blocks a line between two antennas." },
          { title: "Property", body: "The slope across a lot." },
          { title: "Geography lessons", body: "Profile across a valley or mountain range." },
        ],
      }}
      dataSection={{
        heading: "Where the elevations come from",
        paragraphs: [
          "Elevations come from the Copernicus GLO-90 digital elevation model (European Space Agency), a worldwide grid of ground height at about 90 m spacing, served by Open-Meteo's elevation API.",
          "The path is divided into 200 equal steps along geodesics and the elevation is read at each one. Total climb adds every rise between samples; total descent adds every drop. The steepest stretch is the largest grade between neighbouring samples more than 30 m apart.",
          "A 90 m grid smooths small features: bridges and tunnels show the ground under them, cliffs are softened, and climbs shorter than about 100 m can be missed. GPS watches and barometric altimeters usually report more total climb. Routes between two places come from OSRM over OpenStreetMap on the FOSSGIS servers.",
        ],
        sources: [
          { label: "Copernicus DEM GLO-90", href: "https://doi.org/10.5270/ESA-c5d3d65" },
          { label: "Open-Meteo elevation API", href: "https://open-meteo.com/en/docs/elevation-api" },
          { label: "OSRM API documentation", href: "https://project-osrm.org/docs/v5.24.0/api/" },
          { label: "FOSSGIS routing service", href: "https://routing.openstreetmap.de/about.html" },
        ],
      }}
      faqs={[
        { question: "Why is my total climb lower than my GPS watch says?", answer: "The 90 m elevation grid smooths small ups and downs that a barometer or GPS records, and watches also add measurement noise." },
        { question: "What does a 10% grade mean?", answer: "10 m of rise for every 100 m of horizontal distance." },
        { question: "Does it show bridges?", answer: "No. The elevation model is the ground surface, so a bridge shows the valley below it." },
        { question: "How many points can I draw?", answer: "As many as you like; the profile is always sampled at 200 points." },
        { question: "Is it accurate enough for engineering?", answer: "No. It is a 90 m global model; use survey or lidar data for design." },
        { question: "Can I use it outside the US?", answer: "Yes, the elevation model covers the whole world's land." },
      ]}
    >
      <ElevationProfileTool />
    </ToolPageLayout>
  );
}
