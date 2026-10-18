import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import MapAreaTool from "@/components/MapAreaTool";
import { requireTool } from "@/config/tools";

const SLUG = "map-area-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Map Area Calculator: Measure Acres and Square Feet on a Map",
  description:
    "Measure the area of a field, lot, roof or any shape by clicking its corners on a map. Get acres, square feet, hectares, square miles and the perimeter, measured on the Earth's ellipsoid.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to measure an area on a map",
        steps: [
          { name: "Find the place", text: "Search an address or use your location; the map zooms in close." },
          { name: "Click each corner", text: "Go around the edge in order. The shape closes itself and fills in." },
          { name: "Read the area", text: "Acres or square miles in the headline, every unit in the table, with the perimeter." },
          { name: "Fix mistakes", text: "Undo the last corner or clear and start again. Export the shape as GeoJSON or KML." },
        ],
      }}
      uses={{
        heading: "What people measure",
        items: [
          { title: "Property and lot size", body: "Check the acreage of a lot before buying or fencing." },
          { title: "Lawn and garden", body: "Square feet of lawn for seed, fertiliser or sod." },
          { title: "Fields and pasture", body: "Acres for seeding rates, rent or stocking rates." },
          { title: "Roofs", body: "Footprint area of a roof seen from above (add the pitch factor for the real surface)." },
          { title: "Driveways and patios", body: "Square feet for paving or sealing." },
          { title: "Ponds and lakes", body: "Surface area for treatment doses." },
          { title: "Solar arrays", body: "Usable ground or roof area." },
          { title: "Parks and land parcels", body: "Rough area of any outline you can see on the map." },
        ],
      }}
      dataSection={{
        heading: "How the area is measured",
        paragraphs: [
          "The corners you click are latitude and longitude points on the WGS84 ellipsoid. The area is computed with the polygon-area sum of Chamberlain and Duquette (NASA JPL, 2007), applied on the authalic sphere using authalic latitudes from Snyder's Map Projections manual. Because that mapping preserves area, the result is the area on the ellipsoid itself, not on the flat map — so a field in Alaska is not inflated by the map projection.",
          "The perimeter adds up the geodesic length of each edge (Vincenty).",
          "The result is horizontal (plan) area: a sloping field or roof has more surface than its footprint. Accuracy depends on how carefully you click; zoom in to place the corners. For legal acreage, a licensed survey is the authority.",
        ],
        sources: [
          { label: "Chamberlain & Duquette (2007), Some Algorithms for Polygons on a Sphere", href: "https://hdl.handle.net/2014/41271" },
          { label: "Snyder (1987), Map Projections — A Working Manual (USGS PP 1395)", href: "https://doi.org/10.3133/pp1395" },
          { label: "OpenStreetMap copyright", href: "https://www.openstreetmap.org/copyright" },
        ],
      }}
      faqs={[
        { question: "How accurate is it?", answer: "The calculation is exact for the points you click. The error comes from placing the points; zoomed in at street level a click is within about a metre." },
        { question: "How many square feet are in an acre?", answer: "43,560 square feet (4,046.86 m²)." },
        { question: "Can I measure a roof?", answer: "You get the footprint. Multiply by the roof's pitch factor for the actual surface (e.g. 1.118 for a 6/12 pitch)." },
        { question: "Why is the map imagery a street map, not a satellite photo?", answer: "The map uses OpenStreetMap tiles, which are free to use. Building outlines are drawn on them at high zoom." },
        { question: "Can I save the shape?", answer: "Download it as GeoJSON or KML and open it in Google Earth or a GIS program." },
        { question: "Does it handle holes?", answer: "No — draw the outer shape and subtract a separate measurement for any hole." },
      ]}
    >
      <MapAreaTool />
    </ToolPageLayout>
  );
}
