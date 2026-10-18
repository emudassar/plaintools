import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import AntipodeTool from "@/components/AntipodeTool";
import { requireTool } from "@/config/tools";

const SLUG = "antipode-finder";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Antipode Finder: What Is on the Opposite Side of the Earth?",
  description:
    "Find the antipode of any address, city or your location: the exact opposite point on Earth, whether it is land or ocean, and a world map of where land lies opposite land.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find your antipode",
        steps: [
          { name: "Choose a starting point", text: "Search a place, press 'Find my antipode', or click anywhere on the map." },
          { name: "Read the opposite point", text: "The antipode's coordinates appear with whether it is land or water and the nearest named place." },
          { name: "Turn on the land overlay", text: "Tick the box to draw every continent flipped to its antipode. Where orange overlaps land, land lies opposite land." },
          { name: "Try other spots", text: "Click the map to move the start point; the result updates each time." },
        ],
      }}
      uses={{
        heading: "Why people look up antipodes",
        items: [
          { title: "Settling 'if I dug straight through'", body: "From most of the US and Europe the answer is open ocean. The Dig Through the Earth Map tool follows a plumb line instead." },
          { title: "Finding antipodal city pairs", body: "Spain and New Zealand, or Argentina and China, are among the few places where cities sit opposite each other." },
          { title: "Geography lessons", body: "The overlay shows how little land is opposite land." },
          { title: "Travel bucket lists", body: "Some travellers aim to stand on both ends of an antipode." },
          { title: "Radio and satellite trivia", body: "Antipodal points are the farthest apart on Earth, half a meridian (about 20,004 km) over the surface." },
          { title: "Checking a coordinate", body: "Paste coordinates to see their exact opposite in decimal and DMS." },
          { title: "Puzzle and game design", body: "Antipodes come up in geography games and quizzes." },
          { title: "Teaching latitude and longitude", body: "The antipode is just the latitude flipped and the longitude moved 180°." },
        ],
      }}
      dataSection={{
        heading: "How the antipode is found",
        paragraphs: [
          "The antipode of latitude φ and longitude λ is latitude −φ and longitude λ ± 180°. Because the WGS84 ellipsoid is symmetric about its centre, this is exact, and the straight line between the two points passes through the Earth's centre.",
          "Whether the antipode is land or water comes from the Copernicus GLO-90 elevation model through Open-Meteo: open water reads 0 m. The nearest named place comes from OpenStreetMap through the Photon geocoder; if the nearest named feature is more than 25 km away the page says how far it is rather than naming it as the location.",
          "The land overlay redraws Natural Earth's 1:110 million country outlines at their antipodes. At that scale small islands are left out, so check a specific spot by clicking it.",
          "Your starting point comes from your device (only when you press the button), the place you type, or a map click. Nothing is stored by this site.",
        ],
        sources: [
          { label: "Copernicus DEM GLO-90", href: "https://doi.org/10.5270/ESA-c5d3d65" },
          { label: "Open-Meteo elevation API", href: "https://open-meteo.com/en/docs/elevation-api" },
          { label: "Natural Earth 1:110m countries", href: "https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/" },
          { label: "Photon geocoder", href: "https://photon.komoot.io" },
        ],
      }}
      faqs={[
        { question: "What is an antipode?", answer: "The point on the Earth's surface directly opposite another, so that a straight line between them passes through the centre of the Earth." },
        { question: "Is the antipode of the US in China?", answer: "No. The antipodes of the contiguous US are almost all in the southern Indian Ocean, southwest of Australia. China's antipodes are mostly in Argentina and Chile." },
        { question: "How far away is my antipode?", answer: "About 20,004 km (12,430 mi) over the surface along a meridian, and between 12,714 and 12,756 km straight through the centre, depending on latitude." },
        { question: "Is this the same as digging straight down?", answer: "Not quite. A plumb line follows the local vertical, which misses the centre by up to about 21 km at mid-latitudes, so a straight-down tunnel comes out a few tens of kilometres from the antipode. The Dig Through the Earth Map tool computes that point." },
        { question: "Why does it say 'water' when there is a small island?", answer: "The elevation model is on a 90 m grid and the land overlay is coarse. Click the island itself to check it." },
        { question: "Is my location stored?", answer: "No. It is sent only to the elevation and place-name services named on the result." },
      ]}
    >
      <AntipodeTool />
    </ToolPageLayout>
  );
}
