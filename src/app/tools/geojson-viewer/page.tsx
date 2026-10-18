import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GeoFileViewerTool from "@/components/GeoFileViewerTool";
import { requireTool } from "@/config/tools";

const SLUG = "geojson-viewer";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "GeoJSON Viewer Online: View GeoJSON on a Map",
  description:
    "View a GeoJSON file on a map in your browser: every feature with its properties, lengths and areas. Convert GeoJSON to KML, GPX or CSV. Files are never uploaded.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to view a GeoJSON file",
        steps: [
          { name: "Open the file", text: "Drop a .geojson or .json file, or choose it." },
          { name: "Check the map", text: "Points, lines and polygons are drawn and the view fits to them." },
          { name: "Inspect properties", text: "The table lists each feature's properties; click a row to highlight it." },
          { name: "Convert", text: "Download as KML, GPX or CSV." },
        ],
      }}
      uses={{
        heading: "When a GeoJSON viewer helps",
        items: [
          { title: "Debugging an API response", body: "See whether coordinates land where expected." },
          { title: "Checking an export", body: "Inspect GeoJSON from QGIS, Mapshaper or a database." },
          { title: "Swapped coordinates", body: "GeoJSON is longitude first — a misplaced map shows the mistake at once." },
          { title: "Converting for Google Earth", body: "GeoJSON to KML." },
          { title: "Loading into a GPS", body: "Lines to GPX tracks." },
          { title: "Quick sharing", body: "Look at a file someone sent without installing GIS software." },
        ],
      }}
      dataSection={{
        heading: "How the file is read",
        paragraphs: [
          "The file is read in your browser according to RFC 7946: FeatureCollections, single Features and bare geometries, including Point, MultiPoint, LineString, MultiLineString, Polygon and MultiPolygon. Features with invalid coordinates are skipped and counted.",
          "GeoJSON coordinates are longitude, latitude (in that order) on WGS84. Lengths are geodesics; areas are ellipsoidal.",
          "Nothing is uploaded.",
        ],
        sources: [
          { label: "GeoJSON specification (RFC 7946)", href: "https://www.rfc-editor.org/rfc/rfc7946" },
          { label: "OGC KML standard", href: "https://www.ogc.org/standards/kml/" },
          { label: "GPX 1.1 schema", href: "https://www.topografix.com/GPX/1/1/" },
        ],
      }}
      faqs={[
        { question: "My data appears in Antarctica or the ocean.", answer: "The coordinates are probably latitude-first. GeoJSON must be longitude first." },
        { question: "Does it support TopoJSON?", answer: "No, only GeoJSON." },
        { question: "Are coordinate systems other than WGS84 supported?", answer: "RFC 7946 requires WGS84; projected coordinates (metres) will not display correctly." },
        { question: "Is my file uploaded?", answer: "No." },
        { question: "How many features can it show?", answer: "Thousands; very large files may be slow to draw." },
      ]}
    >
      <GeoFileViewerTool format="geojson" />
    </ToolPageLayout>
  );
}
