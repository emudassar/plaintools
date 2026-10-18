import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import TzMapTool from "@/components/TzMapTool";
import { requireTool } from "@/config/tools";

const SLUG = "us-time-zone-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "US Time Zone Map With Current Times",
  description:
    "Map of US time zones — Eastern, Central, Mountain, Pacific, Alaska and Hawaii — with the current time in each, abbreviations, UTC offsets and the areas that skip daylight saving.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to read the US time zone map",
        steps: [
          { name: "Find the area", text: "Each colour is a standard time zone; state lines are drawn for reference." },
          { name: "Hover for the local time", text: "Any area shows its zone, local time, abbreviation and offset." },
          { name: "Read the table", text: "The current time in each zone, with abbreviation (EST/EDT and so on)." },
          { name: "Check daylight saving", text: "Areas that stay on standard time all year, like most of Arizona, say so on hover." },
        ],
      }}
      uses={{
        heading: "Why look at a US time zone map",
        items: [
          { title: "Calling across the country", body: "Is it too early in California?" },
          { title: "States split between zones", body: "Parts of Florida, Indiana, Kentucky, Tennessee, Texas, the Dakotas, Nebraska, Kansas, Idaho and Oregon are in a different zone from the rest of their state." },
          { title: "Arizona's exception", body: "Most of Arizona skips daylight saving; the Navajo Nation observes it." },
          { title: "Travel planning", body: "Know when you cross a zone line on a road trip." },
          { title: "Scheduling a broadcast", body: "Plan for viewers in every zone." },
          { title: "Teaching", body: "How the country is divided by time." },
        ],
      }}
      dataSection={{
        heading: "Where the zones come from",
        paragraphs: [
          "Zone boundaries are from timezone-boundary-builder, an open dataset built from OpenStreetMap that defines the area of every IANA time zone, clipped to the US and simplified. State lines are from the Census Bureau's cartographic boundary files. Both are drawn in the Albers equal-area projection with Alaska and Hawaii moved and rescaled.",
          "The current offset, abbreviation and daylight saving status of each zone come from the IANA time zone database in your browser and update every 30 seconds.",
          "Some areas follow a neighbouring zone by local custom (unofficially); the map shows the zone the boundary data assigns.",
        ],
        sources: [
          { label: "timezone-boundary-builder", href: "https://github.com/evansiroky/timezone-boundary-builder" },
          { label: "IANA time zone database", href: "https://www.iana.org/time-zones" },
          { label: "US Department of Transportation: time zones", href: "https://www.transportation.gov/regulations/time-zones" },
          { label: "Census Bureau cartographic boundary files", href: "https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html" },
        ],
      }}
      faqs={[
        { question: "How many time zones does the US have?", answer: "Six cover the 50 states (Hawaii-Aleutian, Alaska, Pacific, Mountain, Central, Eastern); territories add Atlantic, Samoa and Chamorro time." },
        { question: "Which states do not observe daylight saving?", answer: "Hawaii and most of Arizona. The territories also stay on standard time." },
        { question: "Who sets the time zone boundaries?", answer: "The US Department of Transportation, under the Uniform Time Act." },
        { question: "Why are there several zones with the same colour?", answer: "The map colours by standard zone. The IANA database splits zones by history (for example several Indiana zones), but they share today's clock time." },
        { question: "Is Arizona on Pacific or Mountain time?", answer: "Mountain Standard Time all year. In summer that matches Pacific Daylight Time." },
      ]}
    >
      <TzMapTool which="us" />
    </ToolPageLayout>
  );
}
