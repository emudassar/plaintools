import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DigThroughEarthTool from "@/components/DigThroughEarthTool";
import { requireTool } from "@/config/tools";

const SLUG = "dig-through-the-earth-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Dig Through the Earth Map: Where Would You Come Out?",
  description:
    "Pick a starting point and see where a hole dug straight down would come out on the other side of the world, how long the tunnel is, which layers it crosses and how long a fall through it takes.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to see where you would come out",
        steps: [
          { name: "Choose where you dig", text: "Search a place, use your location, or click the world map." },
          { name: "See the exit point", text: "Two maps show where you start and where a tunnel straight down would come out — and whether that is land or water." },
          { name: "Read the tunnel facts", text: "Length, how close it passes to the centre, the layers it crosses and how long a fall through it would take." },
          { name: "Compare with the antipode", text: "The exact opposite point through the centre is listed too, with the distance between the two." },
        ],
      }}
      uses={{
        heading: "Why people ask where they would come out",
        items: [
          { title: "Answering a classic childhood question", body: "From the US you would not reach China — you would surface in the Indian Ocean." },
          { title: "Science lessons on Earth's interior", body: "See how much of the trip is crust, mantle, liquid outer core and solid inner core." },
          { title: "Physics of a gravity tunnel", body: "The fall time is a famous textbook result; the page shows it with the assumption stated." },
          { title: "Understanding 'down'", body: "Straight down follows the local vertical, which does not point exactly at the centre — the page shows by how much." },
          { title: "Geography trivia", body: "Try Madrid, Buenos Aires or Hong Kong — some places do have land on the other side." },
          { title: "Writing fiction or games", body: "Get a believable exit point and tunnel length for a story." },
        ],
      }}
      dataSection={{
        heading: "How the tunnel is worked out",
        paragraphs: [
          "'Straight down' is taken as the direction a plumb line hangs: perpendicular to the WGS84 ellipsoid, the shape GPS uses for the Earth. Because the Earth is slightly flattened, that line passes the centre at a distance (up to about 21 km at 45° latitude) and comes out a few tens of kilometres from the true antipode. The exit is found by following the line through the ellipsoid in Earth-centred coordinates.",
          "The layers use the boundaries of the Preliminary Reference Earth Model (Dziewonski and Anderson, 1981), the standard one-dimensional model of the Earth's interior: a crust 24.4 km thick on average, the mantle down to the core at 3,480 km from the centre, the liquid outer core, and the solid inner core of radius 1,221.5 km. Real crust is about 5–10 km thick under oceans and 30–70 km under continents.",
          "The fall time assumes no air, no friction and an Earth of uniform density, where the fall is simple harmonic motion lasting π√(R³/GM) ≈ 42 minutes. With the real density increasing toward the core, Klotz (2015) found about 38 minutes.",
          "Whether the exit is land or water comes from the Copernicus GLO-90 elevation model via Open-Meteo; the nearest place name from OpenStreetMap via Photon.",
        ],
        sources: [
          { label: "Dziewonski & Anderson (1981), Preliminary Reference Earth Model", href: "https://doi.org/10.1016/0031-9201(81)90046-7" },
          { label: "Klotz (2015), The gravity tunnel in a non-uniform Earth", href: "https://doi.org/10.1119/1.4898780" },
          { label: "Open-Meteo elevation API", href: "https://open-meteo.com/en/docs/elevation-api" },
          { label: "Photon geocoder", href: "https://photon.komoot.io" },
        ],
      }}
      faqs={[
        { question: "If I dig straight down from the US, do I reach China?", answer: "No. From the contiguous US you come out in the southern Indian Ocean, southwest of Australia. China's opposite side is mostly in Argentina and Chile." },
        { question: "Why isn't the exit exactly at the antipode?", answer: "The Earth is an ellipsoid, slightly wider at the equator. 'Down' is perpendicular to its surface, which points exactly at the centre only on the equator and at the poles. Elsewhere the tunnel misses the centre and comes out a little away from the antipode." },
        { question: "How deep has anyone actually dug?", answer: "The deepest borehole, the Kola Superdeep Borehole in Russia, reached about 12.3 km — a tiny fraction of the 12,700 km tunnel." },
        { question: "Why does it take 42 minutes to fall through?", answer: "Inside a uniform sphere, gravity grows weaker in proportion to your distance from the centre, which gives simple harmonic motion. Half an oscillation takes about 42 minutes for any straight tunnel, not just one through the centre." },
        { question: "Is my location stored?", answer: "No. Only the exit point is sent to the elevation and place-name services." },
      ]}
    >
      <DigThroughEarthTool />
    </ToolPageLayout>
  );
}
