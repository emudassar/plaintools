import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DrawOnMapTool from "@/components/DrawOnMapTool";
import { requireTool } from "@/config/tools";

const SLUG = "draw-on-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Draw on Map: Sketch Lines, Shapes and Markers and Measure Them",
  description:
    "Draw on a map online: freehand, lines, shapes and markers, with lengths and areas measured. Label your drawing and download it as GeoJSON, KML or GPX. No sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to draw on a map",
        steps: [
          { name: "Go to the place", text: "Search an address or use your location." },
          { name: "Pick a drawing tool", text: "Freehand (press and drag), line or shape (click points), or marker." },
          { name: "Choose a colour and width", text: "Then draw. Finish lines and shapes with the button." },
          { name: "Label and measure", text: "Each item gets a label field and its length or area." },
          { name: "Download", text: "Save the drawing as GeoJSON, KML (Google Earth) or GPX, or open a file to keep editing." },
        ],
      }}
      uses={{
        heading: "What people draw on maps",
        items: [
          { title: "Planning a route", body: "Sketch a walking, running or cycling route and see its length." },
          { title: "Marking a property", body: "Outline a lot and read its acreage." },
          { title: "Explaining directions", body: "Draw the way to a hidden entrance or parking spot." },
          { title: "Event layouts", body: "Mark stages, tents and parking on a site." },
          { title: "Hunting and fishing spots", body: "Mark areas and points to load into a GPS." },
          { title: "Classroom maps", body: "Students trace rivers, borders or routes." },
          { title: "Delivery zones", body: "Draw the area you serve." },
          { title: "Field notes", body: "Sketch where something was seen." },
        ],
      }}
      dataSection={{
        heading: "How the drawing is measured and saved",
        paragraphs: [
          "The map is OpenStreetMap. Every point you draw is a latitude and longitude on WGS84, the GPS datum, so the downloaded file lines up in Google Earth, GIS software and GPS devices.",
          "Line lengths are summed geodesic distances (Vincenty). Shape areas are computed on the ellipsoid with authalic latitudes, so they are not distorted by the map's Mercator projection.",
          "Freehand strokes are thinned to drop points that are almost on top of each other. Nothing is uploaded: the drawing stays in your browser until you download it.",
        ],
        sources: [
          { label: "GeoJSON specification (RFC 7946)", href: "https://www.rfc-editor.org/rfc/rfc7946" },
          { label: "OGC KML standard", href: "https://www.ogc.org/standards/kml/" },
          { label: "GPX 1.1 schema", href: "https://www.topografix.com/GPX/1/1/" },
          { label: "Snyder (1987), Map Projections — A Working Manual", href: "https://doi.org/10.3133/pp1395" },
        ],
      }}
      faqs={[
        { question: "How do I move the map while freehand drawing?", answer: "Switch to another tool (line, shape or marker) to drag the map, then switch back." },
        { question: "Can I open the drawing in Google Earth?", answer: "Yes, download KML and open it in Google Earth or import it into Google My Maps." },
        { question: "Will my drawing be saved?", answer: "Only if you download it. Reloading the page clears it." },
        { question: "Can I edit an existing file?", answer: "Yes — open a GeoJSON, KML or GPX file and draw on top of it." },
        { question: "How accurate are the measurements?", answer: "As accurate as where you click. Zoom in for precise corners." },
      ]}
    >
      <DrawOnMapTool />
    </ToolPageLayout>
  );
}
