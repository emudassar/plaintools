import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import TimeDifferenceTool from "@/components/TimeDifferenceTool";
import { requireTool } from "@/config/tools";

const SLUG = "time-difference-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Time Difference Calculator: Compare Times Between Cities",
  description:
    "Find the time difference between cities: see the current time in several places, how many hours ahead or behind each is, convert a time, and plan a meeting across time zones.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to compare times between places",
        steps: [
          { name: "Add places", text: "Type a city, address or time zone name; four common cities are there to start." },
          { name: "Read the difference", text: "Each row shows its time now and how far ahead or behind the first place it is." },
          { name: "Change the reference", text: "Press 'Make reference' to compare everything with another place." },
          { name: "Convert a time", text: "Pick a date and a time in the reference place to see it everywhere else." },
          { name: "Plan a meeting", text: "The 24-hour grid shows working hours in green and marks the hours that suit everyone." },
        ],
      }}
      uses={{
        heading: "When time differences matter",
        items: [
          { title: "Scheduling calls", body: "Find an hour that is daytime for everyone." },
          { title: "Remote teams", body: "See colleagues' working hours side by side." },
          { title: "Calling family abroad", body: "Avoid waking anyone." },
          { title: "Travel and jet lag", body: "Know the difference before you fly." },
          { title: "Live events", body: "When a launch or match happens in your time." },
          { title: "Trading hours", body: "Market opening times in your zone." },
          { title: "Daylight saving changes", body: "Differences shift for a few weeks each spring and autumn when countries change on different dates." },
          { title: "Freelancing", body: "Agree deadlines in the client's time." },
        ],
      }}
      dataSection={{
        heading: "Where the times come from",
        paragraphs: [
          "Offsets and daylight saving rules come from the IANA time zone database built into your browser, through the standard Intl.DateTimeFormat interface. Differences are worked out for the date you pick, so they stay right across daylight saving changes.",
          "Cities and addresses are matched to their time zone with the Photon geocoder (OpenStreetMap) and Open-Meteo's time zone lookup; you can also type an IANA zone name such as Europe/Berlin.",
        ],
        sources: [
          { label: "IANA time zone database", href: "https://www.iana.org/time-zones" },
          { label: "Open-Meteo API documentation", href: "https://open-meteo.com/en/docs" },
          { label: "Photon geocoder", href: "https://photon.komoot.io" },
        ],
      }}
      faqs={[
        { question: "Why does the difference change during the year?", answer: "Places change their clocks for daylight saving on different dates or not at all. For example, the US and Europe change on different Sundays, so for a few weeks the gap is an hour smaller." },
        { question: "Why is India 30 minutes off?", answer: "India uses UTC+05:30. Nepal uses +05:45 and parts of Australia +09:30; the tool shows the exact minutes." },
        { question: "Can I compare more than two places?", answer: "Yes, up to eight." },
        { question: "What is UTC?", answer: "Coordinated Universal Time, the reference all time zones are measured from." },
        { question: "Does it work offline?", answer: "Times for the places already added keep updating; adding a city needs the internet." },
      ]}
    >
      <TimeDifferenceTool />
    </ToolPageLayout>
  );
}
