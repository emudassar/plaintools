import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import TimeZoneFinderTool from "@/components/TimeZoneFinderTool";
import { requireTool } from "@/config/tools";

const SLUG = "time-zone-finder";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Time Zone Finder: What Time Zone Is This Address In?",
  description:
    "Find the time zone of any address, city or map point, or your own location: IANA zone name, local time now, UTC offset, whether daylight saving time is in effect, and the next clock change.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the time zone of a place",
        steps: [
          { name: "Choose a place", text: "Type an address, city or coordinates, or press 'Find my time zone' to use your device's location." },
          { name: "Read the zone", text: "The headline shows the IANA zone name (such as America/Chicago) and the local time, ticking live." },
          { name: "Check the offset and daylight saving", text: "The table gives today's UTC offset, its abbreviation and whether summer time is in effect." },
          { name: "See the next clock change", text: "If the zone changes its clocks within the next 13 months, the date, time and direction are shown." },
          { name: "Click the map", text: "Click any other spot to look up its zone — useful near a zone boundary." },
        ],
      }}
      uses={{
        heading: "When you need a place's time zone",
        items: [
          { title: "Scheduling a call with someone far away", body: "Find their zone and offset so the meeting time lands where you mean it to." },
          { title: "Setting the zone in software", body: "Calendars, servers and databases ask for an IANA name like Europe/Berlin, not an abbreviation." },
          { title: "Places near a zone line", body: "Parts of Indiana, Kentucky, Tennessee and the Dakotas sit in different zones from their neighbours; click both sides." },
          { title: "Checking whether a place uses daylight saving", body: "Arizona (mostly), Hawaii and much of the world keep one offset all year." },
          { title: "Planning travel", body: "See how far ahead or behind your device a destination is, and whether its clocks change while you are there." },
          { title: "Booking a delivery or pickup window", body: "Confirm the local time at the other end before agreeing a slot." },
          { title: "Reading a timestamp from another place", body: "Know the offset to convert a log, receipt or ticket time back to your own." },
          { title: "Broadcast and live-event timing", body: "Work out when an event starts locally in each market." },
          { title: "Odd offsets", body: "India (+05:30), Nepal (+05:45) and the Chatham Islands (+12:45) are not whole hours; the page shows the exact offset." },
          { title: "Checking the next DST date", body: "Clock changes differ between the US, Europe and the southern hemisphere; the next one is shown to the minute." },
        ],
      }}
      dataSection={{
        heading: "Where the answer comes from",
        paragraphs: [
          "Which zone a point is in comes from Open-Meteo's forecast service, asked with timezone=auto. Open-Meteo looks the point up in timezone-boundary-builder, an open dataset of time zone boundaries drawn from OpenStreetMap, and returns the IANA zone name.",
          "Everything about that zone — the current offset, abbreviation, whether daylight saving time applies and when the clocks next change — is read from the IANA time zone database built into your browser, through the standard Intl.DateTimeFormat interface. Nothing is hard-coded on this page, so it follows the tz release your browser ships; a very old browser can miss a rule change made after it was released.",
          "Your coordinates come from your device's location service (asked only when you press the button) or from the address you type, geocoded by Photon from OpenStreetMap. Nothing is stored by this site.",
          "Limits: boundaries are mapped from OpenStreetMap and can lag a legal change. Some places legally observe a different zone than their neighbours by local custom (for example some border towns); the page reports the zone the boundary data assigns.",
        ],
        sources: [
          { label: "IANA time zone database", href: "https://www.iana.org/time-zones", note: "offsets and daylight saving rules" },
          { label: "Open-Meteo API documentation", href: "https://open-meteo.com/en/docs", note: "timezone=auto lookup" },
          { label: "timezone-boundary-builder", href: "https://github.com/evansiroky/timezone-boundary-builder", note: "zone boundaries from OpenStreetMap" },
          { label: "Photon geocoder", href: "https://photon.komoot.io", note: "address search" },
        ],
      }}
      faqs={[
        { question: "What is an IANA time zone name?", answer: "A name like America/New_York or Asia/Kolkata from the IANA time zone database, which records every change to each region's clocks. Computers use these names because abbreviations like CST are ambiguous (US Central, China and Cuba all use CST)." },
        { question: "Why does the page say 'GMT+5:30' instead of an abbreviation?", answer: "Your browser shows a short name only where one is in common use for your language; otherwise it shows the offset. The offset row is always exact." },
        { question: "Does it account for daylight saving time?", answer: "Yes. The offset shown is the one in force right now, and the table says whether daylight saving is active and when the next change happens." },
        { question: "Why does a place near me show a different zone?", answer: "Zone boundaries follow county and state lines, not straight lines. Click the map on each side of a boundary to see where it runs." },
        { question: "Can I use it for a place at sea?", answer: "Yes. Over open ocean the data assigns nautical zones such as Etc/GMT+5, which are whole-hour offsets by longitude." },
        { question: "Is my location stored?", answer: "No. The coordinates go only to the lookup services named on the result." },
        { question: "How current are the rules?", answer: "They are the tz database release built into your browser. Keeping the browser up to date keeps the rules current." },
      ]}
    >
      <TimeZoneFinderTool />
    </ToolPageLayout>
  );
}
