import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ZipMapMakerTool from "@/components/ZipMapMakerTool";
import { requireTool } from "@/config/tools";

const SLUG = "zip-code-map-maker";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "ZIP Code Map Maker: Map a List of ZIP Codes With Boundaries",
  description:
    "Paste a list of ZIP codes and see their boundaries on a map, coloured by group or shaded by a number, with a legend. Download as GeoJSON or KML. Up to 300 ZIP codes.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to make a ZIP code map",
        steps: [
          { name: "Paste your ZIP codes", text: "One per line. Add a group name (territory, rep, zone) or a number after a comma." },
          { name: "Make the map", text: "The real ZIP boundaries are fetched from the Census Bureau and drawn." },
          { name: "Read the legend", text: "Groups get their own colours; numbers are shaded light to dark." },
          { name: "Download", text: "GeoJSON or KML for GIS or Google Earth." },
        ],
      }}
      uses={{
        heading: "Why map ZIP codes",
        items: [
          { title: "Sales territories", body: "Colour ZIPs by rep." },
          { title: "Delivery zones", body: "Show the ZIPs each fee covers." },
          { title: "Customer density", body: "Shade ZIPs by number of customers." },
          { title: "Direct mail", body: "Check a mailing list's coverage." },
          { title: "Franchise areas", body: "Show protected territories." },
          { title: "Service areas", body: "Publish the ZIPs a business serves." },
        ],
      }}
      dataSection={{
        heading: "Where the ZIP boundaries come from",
        paragraphs: [
          "ZIP codes are mail delivery routes, not areas. The Census Bureau draws ZIP Code Tabulation Areas (ZCTAs) by assigning each Census block to the most common ZIP code of its addresses. This page fetches the 2020 ZCTA outlines from the Bureau's TIGERweb map service, simplified to about 50 m.",
          "PO-box-only ZIPs, single-business ZIPs and new or retired ZIPs have no ZCTA and are listed as missing.",
          "Only the five-digit numbers are sent to TIGERweb; your group names and values stay in your browser. Numbers are shaded in seven quantile classes.",
        ],
        sources: [
          { label: "Census Bureau: ZIP Code Tabulation Areas", href: "https://www.census.gov/programs-surveys/geography/guidance/geo-areas/zctas.html" },
          { label: "Census TIGERweb", href: "https://tigerweb.geo.census.gov/tigerwebmain/TIGERweb_main.html" },
          { label: "ColorBrewer", href: "https://colorbrewer2.org/" },
        ],
      }}
      faqs={[
        { question: "Why is my ZIP missing?", answer: "It has no ZCTA — usually a PO-box-only or single-business ZIP." },
        { question: "Are these exact USPS boundaries?", answer: "No. USPS does not publish ZIP boundaries; ZCTAs are the Census Bureau's close approximation." },
        { question: "How many ZIPs can I map?", answer: "Up to 300 at once." },
        { question: "Can I open the result in Google Earth?", answer: "Yes, download KML." },
        { question: "Can I shade ZIPs by sales?", answer: "Yes — put the number after each ZIP." },
      ]}
    >
      <ZipMapMakerTool />
    </ToolPageLayout>
  );
}
