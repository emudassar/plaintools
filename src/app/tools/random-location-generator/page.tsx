import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import RandomLocationTool from "@/components/RandomLocationTool";
import { requireTool } from "@/config/tools";

const SLUG = "random-location-generator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Random Location Generator: Truly Random Coordinates",
  description:
    "Generate uniformly random coordinates anywhere on Earth, inside a lat/lon box or within a radius of a place — up to 100 at once, with open sea skipped and every point on a map.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function RandomLocationPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to generate a random location",
        steps: [
          { name: "Choose the area", text: "Anywhere on Earth, a latitude/longitude box, or a radius around a place." },
          { name: "Choose how many", text: "One point or up to 100." },
          { name: "Decide about water", text: "Leave 'Skip open sea' on to drop points that land in the ocean." },
          { name: "Generate", text: "Read the coordinates and nearest place names, open any point in OpenStreetMap, or copy them all as CSV." },
        ],
      }}
      uses={{
        heading: "10 uses for random coordinates",
        items: [
          { title: "A spontaneous day trip", body: "Pick a random point within 50 miles and go and see what is there." },
          { title: "Geography and map-reading games", body: "Generate a point and have players guess the country or terrain before revealing it." },
          { title: "Sampling for a field survey", body: "Random points inside a study box, chosen fairly so no area is over-represented." },
          { title: "Testing location software", body: "Feed an app realistic coordinates from all over the world." },
          { title: "Writing and worldbuilding prompts", body: "Set a story wherever the point lands." },
          { title: "Photography challenges", body: "Photograph whatever is nearest to a random point in your city." },
          { title: "Fair random selection of a meeting area", body: "Let chance pick the region instead of an argument." },
          { title: "Teaching probability on a sphere", body: "Show why naive random latitudes crowd at the poles and this method does not." },
          { title: "Seeding a simulation", body: "Uniform starting positions for a model, exported as CSV." },
          { title: "Choosing a random walk or run start", body: "A random point within a few miles of home to start a new route." },
        ],
      }}
      dataSection={{
        heading: "How the random points are chosen",
        paragraphs: [
          "Picking latitude and longitude as plain random numbers is a common mistake: equal steps of latitude near the poles cover much less ground than near the equator, so points crowd towards the poles. Wolfram MathWorld's 'Sphere Point Picking' gives the correct method: choose longitude uniformly and set latitude to the arcsine of a uniform number between -1 and 1. Every square kilometre is then equally likely. The same idea gives uniform points inside a latitude/longitude box and inside a circle (a spherical cap) around a centre.",
          "The random numbers come from your browser's Web Crypto API rather than a simple pseudo-random function. With 'Skip open sea' on, candidate points are sent to the Open-Meteo Elevation API and any point where the Copernicus DEM records exactly 0 m is replaced with a new one; up to five names of nearby places are looked up with Photon (OpenStreetMap).",
          "Limits: the sea filter is approximate — some coasts and lakes also read 0 m, and lakes above sea level are not skipped. A random point may land on private property, in a restricted area or somewhere dangerous; the page gives coordinates only, not permission or a safe route to get there.",
        ],
        sources: [
          { label: "Wolfram MathWorld: Sphere Point Picking", href: "https://mathworld.wolfram.com/SpherePointPicking.html" },
          { label: "Open-Meteo Elevation API", href: "https://open-meteo.com/en/docs/elevation-api", note: "Copernicus DEM GLO-90, sea filter" },
          { label: "Photon geocoder", href: "https://photon.komoot.io", note: "nearest place names" },
        ],
      }}
      faqs={[
        { question: "Are these locations truly random?", answer: "Yes, within the area you choose, every part of the surface is equally likely, using the sphere point picking method and your browser's cryptographic random number generator." },
        { question: "Why not just pick a random latitude?", answer: "Because the ground between two latitudes shrinks towards the poles. Random latitudes would put far too many points in the Arctic and Antarctic." },
        { question: "Can I get a random location near me?", answer: "Yes. Choose 'Within a radius of a place', enter your town or coordinates and a radius." },
        { question: "Can I avoid the ocean?", answer: "Leave 'Skip open sea' on. Points the Copernicus elevation model records at exactly 0 m are replaced. Most of the Earth's surface is ocean, so without the filter most world points land at sea." },
        { question: "Can I generate a random location in the US?", answer: "Choose 'Inside a lat/lon box'. The default box roughly covers the contiguous United States; it includes some of Canada, Mexico and the sea at the edges." },
        { question: "Can I download the points?", answer: "With more than one point, open 'Copy as CSV' to copy latitude and longitude columns." },
      ]}
    >
      <RandomLocationTool />
    </ToolPageLayout>
  );
}
