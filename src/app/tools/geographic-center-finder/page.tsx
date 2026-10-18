import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GeoCenterTool from "@/components/GeoCenterTool";
import { requireTool } from "@/config/tools";

const SLUG = "geographic-center-finder";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Geographic Center Finder: Midpoint of Multiple Locations",
  description:
    "Find the geographic center of several places — the midpoint and the center of minimum distance, with optional weights — or the area-weighted center of any US state or country.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the geographic center of several places",
        steps: [
          { name: "List the places", text: "Paste coordinates one per line, with an optional label before a semicolon, or click the map to add points." },
          { name: "Add weights if some count more", text: "Put a third number after the coordinates — for example how many people live at each address." },
          { name: "Read the centres", text: "The geographic midpoint, the centre of minimum distance and the plain average are listed and marked on the map." },
          { name: "Or pick a state or country", text: "Switch to the second tab to see the area-weighted centre of any US state or country." },
        ],
      }}
      uses={{
        heading: "When you need a centre point",
        items: [
          { title: "Choosing a fair meeting place", body: "The centre of minimum distance is the spot with the least total travel for everyone." },
          { title: "Siting a warehouse or office", body: "Weight each customer or employee location by how often they travel." },
          { title: "Family reunions", body: "Find a central town between relatives in several states." },
          { title: "Sales territory planning", body: "Find the middle of a cluster of accounts." },
          { title: "School assignments", body: "See the centre of a set of student addresses." },
          { title: "Geography questions", body: "Where is the centre of Kansas, or of Canada including its islands?" },
          { title: "Event planning", body: "Pick a venue central to the attendee list." },
          { title: "Research and teaching", body: "Compare three common definitions of a 'centre' on real data." },
        ],
      }}
      dataSection={{
        heading: "Three kinds of centre",
        paragraphs: [
          "Geographic midpoint (centre of gravity): every point becomes an arrow from the Earth's centre, the arrows are averaged (multiplied by any weights), and the average arrow is extended back to the surface. This is the balance point of the places on a globe.",
          "Centre of minimum distance: the point whose total straight-line (great-circle) distance to all the places is smallest — the geometric median. It is found with Weiszfeld's iterative method on a sphere and refined by a local search. Unlike the midpoint, one far-away place pulls it only a little.",
          "Average latitude and longitude: the arithmetic mean of the numbers. It is simple but distorted, because a degree of longitude shrinks toward the poles.",
          "State and country centres were computed for this site from Census Bureau 2024 cartographic boundaries (states) and Natural Earth 1:10m countries: each shape is cut into 3,000 strips of latitude, integrated exactly on a sphere, and the mean surface vector turned back into a point. Where a place has scattered islands, the centre of its largest piece is shown too.",
        ],
        sources: [
          { label: "Geometric median (Weiszfeld's algorithm)", href: "https://en.wikipedia.org/wiki/Geometric_median" },
          { label: "Census Bureau cartographic boundary files", href: "https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html" },
          { label: "Natural Earth 1:10m countries", href: "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/" },
        ],
      }}
      faqs={[
        { question: "Which centre should I use for a meeting place?", answer: "The centre of minimum distance — it minimises the total straight-line distance everyone travels. Road distances can differ; check driving times from the chosen spot." },
        { question: "Why is the centre of minimum distance sometimes exactly on one of my places?", answer: "If one place lies 'between' the others strongly enough (in a triangle, at an angle of 120° or more), the best compromise is that place itself." },
        { question: "How do weights work?", answer: "A point with weight 3 counts like three points at the same spot. Use population, number of visits or anything proportional to importance." },
        { question: "Why doesn't the state centre match the official marker?", answer: "Official markers were set by older methods — the classic one balances a flat cut-out of the shape. This page uses the area-weighted centre on the globe, and includes islands." },
        { question: "How many points can I enter?", answer: "Hundreds work quickly; everything is calculated in your browser." },
        { question: "Are my locations uploaded?", answer: "No. Calculations run in your browser; only map tiles are downloaded." },
      ]}
    >
      <GeoCenterTool />
    </ToolPageLayout>
  );
}
