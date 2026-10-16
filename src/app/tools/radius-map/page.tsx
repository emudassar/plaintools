import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import RadiusMapTool from "@/components/RadiusMapTool";
import { requireTool } from "@/config/tools";

const SLUG = "radius-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Radius Map: Draw a Mile or km Radius Around Any Address",
  description:
    "Draw up to four true-distance circles in miles or kilometres around any address or your location, see the area each covers, check whether a place is inside, and share the map link.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function RadiusMapPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to draw a radius on a map",
        steps: [
          { name: "Enter the radius", text: "One number, or up to four separated by commas, such as 5, 10, 25. Choose miles or kilometres." },
          { name: "Set the centre", text: "Use your location, type an address or coordinates, or click the map." },
          { name: "Read the circles", text: "The table gives each circle's area, circumference and diameter." },
          { name: "Check a place", text: "Type an address to see its distance from the centre and which circles it falls inside." },
          { name: "Share it", text: "The page address updates with the centre and radii, so you can copy and send it." },
        ],
      }}
      uses={{
        heading: "10 reasons to draw a radius on a map",
        items: [
          { title: "Checking a delivery or service area", body: "See which neighbourhoods fall inside a 10-mile delivery radius before promising a customer." },
          { title: "House hunting within a commute limit", body: "Draw 15 and 30 miles around the office to narrow down where to look." },
          { title: "Checking a non-compete or radius clause", body: "Contracts sometimes forbid working within a set distance; see what that circle covers." },
          { title: "Planning a store or franchise territory", body: "Overlapping circles show where two locations would compete." },
          { title: "Drone and model-aircraft distance limits", body: "Visualise a maximum range around a launch point." },
          { title: "A 'how far can I go today' travel ring", body: "Rings at 50, 100 and 200 miles for picking a weekend trip." },
          { title: "Event or wedding guest travel", body: "See which guests are within an hour's radius of the venue." },
          { title: "School or club catchment questions", body: "Check whether an address falls inside a published distance rule." },
          { title: "Emergency planning drills", body: "Draw an evacuation or alert distance around a site for a tabletop exercise." },
          { title: "Running and cycling loops", body: "See how far a 5 km radius from home reaches for planning routes." },
        ],
      }}
      dataSection={{
        heading: "How the circles are drawn",
        paragraphs: [
          "Each circle is made of 180 points that are all exactly the chosen distance from the centre, measured over the WGS84 ellipsoid with Vincenty's direct formula. That makes it a true ground radius. On the map's Web Mercator projection, shapes are stretched more the further they are from the equator, so a large circle can look slightly egg-shaped even though every point is the same distance away.",
          "The area and circumference in the table use a sphere of the mean Earth radius (a spherical cap), which for everyday radii matches the flat πr² and 2πr to the digits shown. The 'is a place inside' check measures the straight-line distance from the centre to the place with Vincenty's inverse formula and compares it to each radius. Map images are OpenStreetMap tiles; addresses are found with Photon (OpenStreetMap).",
          "Limits: a radius is a straight-line distance, not a travel distance — rivers, mountains and road layouts make the distance by road longer, often much longer. Address positions come from OpenStreetMap and can be at the street or the middle of a town. For a legal radius rule, check how the rule itself defines the measurement.",
        ],
        sources: [
          { label: "Vincenty (1975), Survey Review — NOAA NGS copy", href: "https://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf" },
          { label: "OpenStreetMap copyright and licence", href: "https://www.openstreetmap.org/copyright", note: "map tiles and data" },
          { label: "OpenStreetMap wiki: Slippy map tilenames", href: "https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames", note: "Web Mercator tile maths" },
        ],
      }}
      faqs={[
        { question: "How do I draw a radius around an address?", answer: "Type the radius, then enter the address and press 'Set centre'. The circle is drawn on the map with its area and circumference." },
        { question: "Can I draw more than one circle?", answer: "Yes. Enter up to four radii separated by commas, for example 5, 10, 20." },
        { question: "Why does my circle look oval?", answer: "Web maps stretch distances away from the equator. The circle is still a true radius on the ground; the map projection distorts its shape." },
        { question: "Is the radius the driving distance?", answer: "No. It is the straight-line distance. Driving distance to the edge of the circle is almost always longer." },
        { question: "How do I check if a place is within the radius?", answer: "Use 'Is a place inside the radius?' and type the address. The page shows its distance from the centre and which circles contain it." },
        { question: "Can I share my radius map?", answer: "Yes. The page address updates with the centre and radii; copy it from your browser's address bar." },
        { question: "Can I use kilometres?", answer: "Yes. Choose kilometres in the unit menu." },
      ]}
    >
      <RadiusMapTool />
    </ToolPageLayout>
  );
}
