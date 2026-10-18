import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GeoFileViewerTool from "@/components/GeoFileViewerTool";
import { requireTool } from "@/config/tools";

const SLUG = "kml-viewer";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "KML Viewer Online: Open KML Files on a Map",
  description:
    "Open and view KML files online without Google Earth: placemarks, paths and polygons on a map with names, lengths and areas. Convert KML to GeoJSON, GPX or CSV. Nothing is uploaded.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to view a KML file",
        steps: [
          { name: "Open the file", text: "Drop it on the box or choose it. KMZ files must be unzipped first." },
          { name: "See it on the map", text: "Every placemark, path and polygon is drawn." },
          { name: "Browse the features", text: "Click a row to highlight it; names, lengths, areas and data fields are listed." },
          { name: "Convert if needed", text: "Download as GeoJSON, GPX or CSV." },
        ],
      }}
      uses={{
        heading: "When a KML viewer helps",
        items: [
          { title: "No Google Earth installed", body: "Look at a KML on any computer or phone." },
          { title: "Checking a download", body: "See what a KML from a website contains before importing it." },
          { title: "Google My Maps exports", body: "View and convert a My Maps export." },
          { title: "Converting for GIS", body: "KML to GeoJSON for QGIS or web maps." },
          { title: "Loading into a GPS", body: "KML paths to GPX." },
          { title: "Sharing with others", body: "Send the link to this page and the file." },
        ],
      }}
      dataSection={{
        heading: "How the file is read",
        paragraphs: [
          "The file is read in your browser according to the OGC KML 2.2 standard: Placemarks with Point, LineString, Polygon and MultiGeometry, with their names, descriptions and ExtendedData. Nothing is uploaded.",
          "Styles, icons, images, network links, ground overlays and 3D models are not drawn. KMZ is a zipped KML: rename it to .zip, open it and use the doc.kml inside.",
          "Lengths are geodesics on WGS84 and areas are ellipsoidal.",
        ],
        sources: [
          { label: "OGC KML standard", href: "https://www.ogc.org/standards/kml/" },
          { label: "GeoJSON specification (RFC 7946)", href: "https://www.rfc-editor.org/rfc/rfc7946" },
          { label: "GPX 1.1 schema", href: "https://www.topografix.com/GPX/1/1/" },
        ],
      }}
      faqs={[
        { question: "Can it open KMZ?", answer: "Not directly — unzip it first (rename .kmz to .zip) and open the doc.kml inside." },
        { question: "Is my file uploaded?", answer: "No. It is read in your browser." },
        { question: "Why are my icons and colours missing?", answer: "Styles are not drawn; the shapes and data are." },
        { question: "How large a file can it open?", answer: "Up to 50 MB, though very large files can be slow." },
        { question: "Can I convert KML to GPX?", answer: "Yes — paths become tracks and placemarks become waypoints." },
      ]}
    >
      <GeoFileViewerTool format="kml" />
    </ToolPageLayout>
  );
}
