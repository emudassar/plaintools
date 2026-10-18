import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GpsConverterTool from "@/components/GpsConverterTool";
import { requireTool } from "@/config/tools";

const SLUG = "gps-coordinate-converter";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "GPS Coordinate Converter: DMS, Decimal, UTM, MGRS, Plus Code",
  description:
    "Convert GPS coordinates between decimal degrees, degrees-minutes-seconds, decimal minutes, UTM, MGRS, Plus Codes and geohash. Paste any format; convert one point or a list to CSV.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert GPS coordinates",
        steps: [
          { name: "Paste the coordinate", text: "Type or paste it in any common format. The page recognises the format by itself and says which one it read." },
          { name: "Read every format", text: "Decimal degrees, DMS, decimal minutes, UTM, MGRS, Plus Code and geohash appear together, each with a Copy button." },
          { name: "Check the map", text: "The pin shows where the coordinate lands, so a swapped latitude and longitude or a missing minus sign is obvious." },
          { name: "Convert a list", text: "Switch to 'A list', paste one coordinate per line (formats can be mixed) and download a CSV with every format." },
        ],
      }}
      uses={{
        heading: "When you need to convert coordinates",
        items: [
          { title: "Entering a point into a GPS unit", body: "Handheld GPS and marine plotters often want degrees and decimal minutes; maps give decimal degrees." },
          { title: "Search and rescue or military grids", body: "Teams report positions in MGRS or UTM; converting to decimal degrees puts them on a phone map." },
          { title: "Geocaching", body: "Cache listings use degrees and decimal minutes (N 40° 44.906 W 073° 59.140)." },
          { title: "Survey and GIS data", body: "Survey and engineering files are often in UTM metres; web maps and spreadsheets want latitude and longitude." },
          { title: "Sharing a spot without an address", body: "A Plus Code is short enough to read out and works where there are no street addresses." },
          { title: "Database keys", body: "Geohashes group nearby points under a shared prefix for indexing." },
          { title: "Checking a coordinate from a photo or document", body: "Paste whatever format it came in and see the point on a map." },
          { title: "Cleaning a spreadsheet of mixed formats", body: "Paste the column into list mode and download one consistent CSV." },
        ],
      }}
      dataSection={{
        heading: "How the conversions work",
        paragraphs: [
          "Every format here describes a position on WGS84, the datum GPS uses. Degrees, minutes and seconds are just other ways of writing the same angle: 1° = 60′ and 1′ = 60″.",
          "UTM divides the world into 60 zones 6° of longitude wide and projects each with a Transverse Mercator projection, scale 0.9996 on the central meridian, 500,000 m false easting and 10,000,000 m false northing in the southern hemisphere. This page uses Krüger's series to fourth order as published by Karney (2011), which is accurate to well under a millimetre within a zone. MGRS adds 100 km square letters to the UTM grid, following NGA's lettering scheme (as documented in GeographicLib).",
          "A Plus Code (Open Location Code) and a geohash are both grid codes: each extra character narrows the cell. The page shows how big a cell a pasted code stands for and places the pin at its centre.",
          "All conversion happens in your browser; nothing you paste is sent anywhere except map tiles for the area shown. Coordinates on older datums such as NAD27 or ED50 are not shifted and can be off by up to a few hundred metres when read as WGS84.",
        ],
        sources: [
          { label: "Karney (2011), Transverse Mercator with an accuracy of a few nanometers", href: "https://arxiv.org/abs/1002.1417" },
          { label: "GeographicLib: MGRS", href: "https://geographiclib.sourceforge.io/C++/doc/classGeographicLib_1_1MGRS.html" },
          { label: "Open Location Code specification", href: "https://github.com/google/open-location-code/blob/main/docs/specification.md" },
          { label: "Geohash", href: "https://en.wikipedia.org/wiki/Geohash" },
        ],
      }}
      faqs={[
        { question: "Which comes first, latitude or longitude?", answer: "Latitude (north–south) first, then longitude (east–west). If the pin lands in the ocean or the wrong continent, the two are probably swapped or a minus sign is missing." },
        { question: "How do I write south and west?", answer: "Either as negative numbers in decimal degrees (-33.86, 151.21 is Sydney) or with S and W letters in DMS and DMM." },
        { question: "What does a UTM letter like 18T mean?", answer: "18 is the zone (6° of longitude). T is the latitude band; letters C–M are south of the equator and N–X are north. Some people write N or S for the hemisphere instead — the UTM tab lets you choose the hemisphere explicitly." },
        { question: "How precise is each format?", answer: "Six decimal places of a degree is about 0.1 m. A 10-character geohash is about 1 m by 0.6 m; an 11-character Plus Code about 3 m by 3 m; a 10-digit MGRS reference 1 m." },
        { question: "Why are my UTM numbers a little different from another site?", answer: "Rounding, or a different datum. This page uses WGS84 and gives eastings and northings to the metre in the summary." },
        { question: "Does it work near the poles?", answer: "Decimal, DMS, Plus Codes and geohash work everywhere. UTM and MGRS stop at 84° N and 80° S; the polar UPS grid is not covered." },
        { question: "Is my data uploaded?", answer: "No. Conversions run in your browser." },
      ]}
    >
      <GpsConverterTool />
    </ToolPageLayout>
  );
}
