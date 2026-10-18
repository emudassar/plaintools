import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import TzMapTool from "@/components/TzMapTool";
import { requireTool } from "@/config/tools";

const SLUG = "world-time-zone-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "World Time Zone Map: Current Time Around the World",
  description:
    "A live world time zone map coloured by each zone's current UTC offset. Hover any country or ocean for its local time, offset and daylight saving status.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to use the world time zone map",
        steps: [
          { name: "Look at the colours", text: "Zones with the same clock time right now share a colour." },
          { name: "Hover a zone", text: "See its IANA name, local time, abbreviation and UTC offset." },
          { name: "Read the offset strip", text: "Below the map: every offset in use now with its current time." },
          { name: "Click to pin", text: "Click a zone to keep its full date and time on screen." },
        ],
      }}
      uses={{
        heading: "What a world time zone map is for",
        items: [
          { title: "International calls and meetings", body: "See at a glance who is awake." },
          { title: "Travel", body: "Plan arrival times across many zones." },
          { title: "Odd offsets", body: "Spot the half- and quarter-hour zones (India, Nepal, Newfoundland, parts of Australia)." },
          { title: "Countries with many zones", body: "Russia, the US and Australia span many; China uses one." },
          { title: "The date line", body: "See where it is already tomorrow." },
          { title: "Teaching", body: "How time zones follow politics as much as longitude." },
        ],
      }}
      dataSection={{
        heading: "Where the zones come from",
        paragraphs: [
          "Boundaries are from timezone-boundary-builder (built from OpenStreetMap), including the nautical time zones over the oceans, drawn in the Robinson projection and simplified.",
          "Each zone's current offset, abbreviation and daylight saving status come from the IANA time zone database in your browser, refreshed every 30 seconds. Colours follow the current offset, so they change when countries switch to or from daylight saving.",
        ],
        sources: [
          { label: "timezone-boundary-builder", href: "https://github.com/evansiroky/timezone-boundary-builder" },
          { label: "IANA time zone database", href: "https://www.iana.org/time-zones" },
        ],
      }}
      faqs={[
        { question: "How many time zones are there?", answer: "About 38 different UTC offsets are in use, but the IANA database lists several hundred named zones because their histories differ." },
        { question: "Why does China have one time zone?", answer: "By national decision, all of China uses UTC+08:00 even though it spans about five hours of longitude." },
        { question: "What are the zones over the ocean?", answer: "Nautical time zones, one hour wide by longitude, used at sea." },
        { question: "Where is it already tomorrow?", answer: "The zones just west of the International Date Line, such as Kiribati at UTC+14, are first into each new day." },
        { question: "Why do colours change in March and November?", answer: "Many countries switch to or from daylight saving then, changing their offset." },
      ]}
    >
      <TzMapTool which="world" />
    </ToolPageLayout>
  );
}
