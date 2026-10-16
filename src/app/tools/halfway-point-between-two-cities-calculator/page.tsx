import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import HalfwayTool from "@/components/HalfwayTool";
import { requireTool } from "@/config/tools";

const SLUG = "halfway-point-between-two-cities-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Halfway Point Between Two Cities Calculator (Midpoint Map)",
  description:
    "Find the exact halfway point between two cities or addresses, the nearest named place to it and the distance from each side — or slide to meet at any split, like 60/40.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HalfwayPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the halfway point between two places",
        steps: [
          { name: "Enter both places", text: "Two cities, addresses or coordinates." },
          { name: "Read the halfway point", text: "Its coordinates, the nearest named place, and the straight-line distance from each side." },
          { name: "Change the split if you like", text: "Slide to meet closer to one side, for example 60% of the way from the first place." },
          { name: "Check the map", text: "The route and the meeting point are drawn on the map." },
        ],
      }}
      uses={{
        heading: "10 reasons to find a halfway point",
        items: [
          { title: "Meeting a friend from another city", body: "Find a town roughly the same distance from both of you to meet for lunch." },
          { title: "Child-custody exchanges", body: "Parents living apart often agree to hand over at a midpoint; the coordinates make the agreement concrete." },
          { title: "Buying or selling online", body: "Agree a fair meeting place with a buyer two hours away." },
          { title: "Splitting a long drive", body: "Find where to stop overnight near the middle of a trip." },
          { title: "Picking a family reunion venue", body: "Look for a town between two branches of the family." },
          { title: "A fair split for a carpool", body: "When one driver is willing to drive further, slide the split to 60/40." },
          { title: "Choosing a dating meetup spot", body: "Meet somewhere neither person has to travel much more than the other." },
          { title: "Sales territories", body: "Find the midpoint between two offices to see where coverage might switch." },
          { title: "Finding a point a third of the way along", body: "The slider gives any fraction, not only the middle." },
          { title: "Geography questions", body: "What lies halfway between London and New York? (Open Atlantic — the page says so.)" },
        ],
      }}
      dataSection={{
        heading: "How the halfway point is calculated",
        paragraphs: [
          "The page finds the shortest path over the Earth's surface between the two places on the WGS84 ellipsoid using Vincenty's 1975 inverse formula, then walks the chosen share of that distance along the path with Vincenty's direct formula. At 50% the resulting point is the same straight-line distance from both places. The nearest named place is looked up with the Photon reverse geocoder (OpenStreetMap), and its distance from the point is shown so you can see how close it really is.",
          "Place names are turned into coordinates by Photon; a city becomes a single point, usually its mapped centre. The calculation runs in your browser.",
          "Limits: this is the geographic midpoint, not the midpoint by road or by driving time. On a winding route or around a lake, the halfway point by road can be far from this point, and the point itself may be in a field, a forest or the sea. Check the meeting place on a road map before relying on it.",
        ],
        sources: [
          { label: "Vincenty (1975), Survey Review — NOAA NGS copy", href: "https://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf" },
          { label: "Photon geocoder", href: "https://photon.komoot.io", note: "OpenStreetMap place names" },
        ],
      }}
      faqs={[
        { question: "How do I find the halfway point between two cities?", answer: "Enter both cities and press 'Find the halfway point'. The page shows the midpoint's coordinates, the nearest named place and the distance from each city." },
        { question: "Is this the halfway point by car?", answer: "No. It is the halfway point in a straight line over the Earth. The halfway point by road depends on the route and can be somewhere else." },
        { question: "Can I meet closer to one side?", answer: "Yes. Move the slider to choose any share of the way from the first place, from 0% to 100%." },
        { question: "Why is the halfway point not in a town?", answer: "The exact midpoint can land anywhere. The page names the nearest place OpenStreetMap records and shows how far away it is." },
        { question: "Why is the route curved on the map?", answer: "Flat maps stretch the globe; the shortest path on the round Earth draws as a curve." },
        { question: "Does it work between countries?", answer: "Yes, anywhere in the world. For places on nearly opposite sides of the Earth the page falls back to a sphere model and says so." },
      ]}
    >
      <HalfwayTool />
    </ToolPageLayout>
  );
}
