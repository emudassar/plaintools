import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import MoonPhaseCalendarTool from "@/components/MoonPhaseCalendarTool";
import { requireTool } from "@/config/tools";

const SLUG = "moon-phase-calendar";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Moon Phase Calendar: Moon Phases by Month and Year",
  description:
    "Moon phase calendar for any month or year: the moon's shape and illumination every day, and the exact date and time of each new moon, first quarter, full moon and last quarter in your time zone.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to use the moon phase calendar",
        steps: [
          { name: "Pick the month and year", text: "Any month from 1900 to 2100." },
          { name: "Choose your time zone", text: "Phase times are shown in it, with daylight saving." },
          { name: "Read the calendar", text: "Each day shows the moon's shape and how much is lit at local noon; the four main phases are highlighted." },
          { name: "See a whole year", text: "Switch to the year list and download it as CSV." },
          { name: "Southern hemisphere?", text: "Tick the box to flip the moon as it looks from there." },
        ],
      }}
      uses={{
        heading: "Who uses a moon calendar",
        items: [
          { title: "Gardeners", body: "Some plant by the moon's phases." },
          { title: "Photographers", body: "Plan full-moon shots." },
          { title: "Stargazers", body: "Dark skies around new moon." },
          { title: "Fishing and hunting", body: "Many plan trips by phase." },
          { title: "Religious calendars", body: "Months that start with the new moon or full moon." },
          { title: "Events", body: "Full-moon walks and festivals." },
        ],
      }}
      dataSection={{
        heading: "How the phases are calculated",
        paragraphs: [
          "The phases are the moments when the moon's ecliptic longitude is 0°, 90°, 180° and 270° from the sun's (new moon, first quarter, full moon, last quarter), found by solving Paul Schlyter's lunar and solar position method for those angles. For October–December 2026 every phase time was within 10 minutes of the US Naval Observatory's table.",
          "The daily picture and percentage are the illuminated fraction at local noon. The lit side is on the right while the moon waxes as seen from the northern hemisphere, and on the left from the southern.",
          "Calculated in your browser; times are converted with the IANA time zone database built into it.",
        ],
        sources: [
          { label: "US Naval Observatory: moon phases", href: "https://aa.usno.navy.mil/data/MoonPhases" },
          { label: "Paul Schlyter: How to compute planetary positions", href: "https://stjarnhimlen.se/comp/ppcomp.html" },
          { label: "IANA time zone database", href: "https://www.iana.org/time-zones" },
        ],
      }}
      faqs={[
        { question: "How long is a lunar cycle?", answer: "About 29.53 days on average from one new moon to the next." },
        { question: "Why is the full moon date different in another time zone?", answer: "Phases are instants; when it falls near midnight, it lands on different dates in different zones." },
        { question: "What is a blue moon?", answer: "Usually the second full moon in a calendar month; the year view shows when that happens." },
        { question: "Why does the moon look different in Australia?", answer: "Seen from the southern hemisphere it appears upside down, so the lit side is reversed." },
        { question: "How accurate are the times?", answer: "Within minutes of the US Naval Observatory for the period tested." },
      ]}
    >
      <MoonPhaseCalendarTool />
    </ToolPageLayout>
  );
}
