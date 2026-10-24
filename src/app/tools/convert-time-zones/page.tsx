import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ConvertTimeZonesTool from "@/components/ConvertTimeZonesTool";
import { requireTool } from "@/config/tools";

const SLUG = "convert-time-zones";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Convert Time Zones: City to City Time Converter",
  description:
    "Pick a time and date in one city and see the same moment in another, with daylight saving and next-day or previous-day changes handled. Any city worldwide.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ConvertTimeZonesPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert a time between time zones",
        steps: [
          { name: "Choose the 'from' city", text: "Quick-pick a city or type any city or town and press Find." },
          { name: "Choose the 'to' city", text: "The same way." },
          { name: "Set the date and time", text: "Enter the time as it reads in the first city." },
          { name: "Read the converted time", text: "The same moment in the second city, with the day change and the hour difference." },
        ],
      }}
      uses={{
        heading: "10 times you need to convert a time between cities",
        items: [
          { title: "Scheduling a video call", body: "A manager in Chicago sets a 9 AM meeting and checks what time it is for a colleague in London." },
          { title: "Catching a live event", body: "A fan in Karachi works out when a 7 PM New York game starts locally." },
          { title: "Calling family abroad", body: "Someone in Dubai checks it is not the middle of the night in Toronto before calling." },
          { title: "Flight arrival times", body: "A traveller converts a departure time to see the local time at the destination." },
          { title: "Webinar invitations", body: "An organiser lists a webinar's time in several cities." },
          { title: "Remote job interviews", body: "A candidate converts an interview time given in the employer's zone." },
          { title: "Trading hours", body: "An investor checks when a foreign stock exchange opens in their own time." },
          { title: "Online classes", body: "A student abroad converts a lecture time from their university's time zone." },
          { title: "Customer support hours", body: "A shopper checks whether an overseas support line is open now." },
          { title: "Daylight-saving weeks", body: "Someone checks the gap between US and European cities during the weeks when only one has changed clocks." },
        ],
      }}
      dataSection={{
        heading: "Where the time-zone rules come from",
        paragraphs: [
          "The conversion uses the IANA time-zone database built into your browser, which holds each zone's offset from UTC and its daylight-saving rules, past and scheduled. The page finds the UTC instant for your date and time in the first city, then shows that instant in the second city.",
          "Quick-pick cities need no lookup. A typed city is found with Photon (OpenStreetMap geocoding) and its time zone with Open-Meteo; only the place name and its coordinates are sent.",
          "Limits: a time that does not exist on a spring-forward night is moved to the first valid time. If a government changes its time-zone rules at short notice, your browser's copy of the database may not have the change yet.",
        ],
        sources: [
          { label: "IANA — Time zone database", href: "https://www.iana.org/time-zones" },
          { label: "Open-Meteo — time zone lookup", href: "https://open-meteo.com/en/docs" },
        ],
      }}
      faqs={[
        { question: "How do I convert a time from one time zone to another?", answer: "Find the UTC time for the first zone, then apply the second zone's offset. Pick both cities and the time here and the page does it, including daylight saving." },
        { question: "Does it handle daylight saving time?", answer: "Yes, for the date you choose, in both cities." },
        { question: "Why does the result say 'next day'?", answer: "When the second city is far enough ahead, the same moment falls on the next calendar day there." },
        { question: "What is the difference between EST and EDT?", answer: "EST is UTC−5, used in winter; EDT is UTC−4, used in summer. The result shows which applies on your date." },
        { question: "Can I convert to UTC or GMT?", answer: "Yes, pick 'UTC / GMT' in the quick list." },
        { question: "How is this different from the time difference calculator?", answer: "This page converts one time between two cities. The time difference calculator compares the current time across several cities at once." },
      ]}
    >
      <ConvertTimeZonesTool />
    </ToolPageLayout>
  );
}
