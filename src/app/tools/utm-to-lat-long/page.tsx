import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import UtmTool from "@/components/UtmTool";
import { requireTool } from "@/config/tools";

const SLUG = "utm-to-lat-long";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "UTM to Lat Long Converter (and Lat Long to UTM)",
  description:
    "Convert UTM coordinates (zone, hemisphere, easting, northing) to latitude and longitude on WGS84, convert lat/long back to UTM, or convert a list of UTM points to CSV.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert UTM to latitude and longitude",
        steps: [
          { name: "Enter the zone", text: "The number from 1 to 60. If yours has a letter (like 18T), the letter is the latitude band: C–M means south, N–X north." },
          { name: "Choose the hemisphere", text: "North or south of the equator. A southern northing counts down from 10,000,000 m at the equator." },
          { name: "Enter easting and northing", text: "In metres. Easting is usually six digits, northing up to seven." },
          { name: "Read the result", text: "Latitude and longitude appear at once in decimal degrees and DMS, with the point on a map." },
          { name: "Converting many points?", text: "Use 'A list of UTM' to paste one per line and download a CSV." },
        ],
      }}
      uses={{
        heading: "Where UTM coordinates come from",
        items: [
          { title: "Topographic maps", body: "USGS and many national maps print a UTM grid; read the grid numbers and convert them for a phone map." },
          { title: "Survey and engineering drawings", body: "Site plans and well records are often given in UTM metres." },
          { title: "Field data from a GPS unit set to UTM", body: "Convert the readings to decimal degrees for GIS or a spreadsheet." },
          { title: "Wildlife and environmental records", body: "Sightings and sample sites are often logged in UTM." },
          { title: "Mining claims and land records", body: "Corner positions may be recorded as UTM coordinates." },
          { title: "Search and rescue", body: "Grid positions passed over the radio convert directly to a map pin." },
          { title: "Going the other way", body: "The Lat/long → UTM tab gives zone, easting, northing, grid convergence and scale factor." },
          { title: "Checking a coordinate in a report", body: "The map pin shows whether the easting and northing land where the report says." },
        ],
      }}
      dataSection={{
        heading: "How the conversion works",
        paragraphs: [
          "UTM (Universal Transverse Mercator) splits the world into 60 zones, each 6° of longitude wide, and projects each one flat with a Transverse Mercator projection centred on the zone's middle meridian. The scale on that meridian is 0.9996, the meridian is given an easting of 500,000 m so eastings are always positive, and in the southern hemisphere northings start at 10,000,000 m at the equator.",
          "The conversion uses Krüger's series to fourth order in the ellipsoid's third flattening, as given by Karney (2011). Within a zone it agrees with the exact projection to well under a millimetre. The WGS84 ellipsoid (a = 6,378,137 m, f = 1/298.257223563) is used throughout.",
          "Coordinates on another datum — NAD27 on older US maps, ED50 in Europe — describe slightly different positions; read as WGS84 they can be off by tens to hundreds of metres. This page does not shift datums.",
          "Everything runs in your browser.",
        ],
        sources: [
          { label: "Karney (2011), Transverse Mercator with an accuracy of a few nanometers", href: "https://arxiv.org/abs/1002.1417" },
          { label: "NGA: coordinate systems", href: "https://earth-info.nga.mil/index.php?dir=coordsys&action=coordsys" },
        ],
      }}
      faqs={[
        { question: "What is the difference between a zone letter and N/S?", answer: "Strictly, UTM uses a zone number and a hemisphere. The letters C–X are MGRS latitude bands that are often written after the zone number: C to M are in the southern hemisphere, N to X in the northern. Because N and S are also band letters, '33N' is ambiguous; this page asks for the hemisphere explicitly." },
        { question: "Why does my easting have to be between about 160,000 and 834,000?", answer: "A 6° zone is about 670 km wide at the equator and narrower further north, centred on 500,000 m. Values outside that range belong to a neighbouring zone." },
        { question: "Why is my southern northing so large?", answer: "South of the equator, northings count down from a 'false northing' of 10,000,000 m so they stay positive." },
        { question: "How accurate is the conversion?", answer: "Sub-millimetre within a zone. Real-world error comes from the coordinate itself or a datum mismatch." },
        { question: "Does it handle Norway and Svalbard's special zones?", answer: "Converting UTM to lat/long works for any zone you enter. Converting lat/long to UTM applies the Norway and Svalbard zone exceptions." },
        { question: "Can I convert to MGRS?", answer: "Yes, the result shows the MGRS reference to 1 m. The GPS Coordinate Converter covers every format." },
      ]}
    >
      <UtmTool />
    </ToolPageLayout>
  );
}
