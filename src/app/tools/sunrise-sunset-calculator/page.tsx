import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SunriseSunsetTool from "@/components/SunriseSunsetTool";
import { requireTool } from "@/config/tools";

const SLUG = "sunrise-sunset-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Sunrise Sunset Calculator: Times for Any Place and Month",
  description:
    "Sunrise and sunset times for any place and any month, with civil, nautical and astronomical dawn and dusk, solar noon, day length and its daily change. In local time; download as CSV.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to get sunrise and sunset times",
        steps: [
          { name: "Choose the place", text: "Type a city or address, or use your location. Its time zone is found for you." },
          { name: "Pick the month and year", text: "Any month from 1900 to 2100." },
          { name: "Read today's times", text: "The headline shows today's sunrise, sunset and day length (or the first of the month)." },
          { name: "Scan the month", text: "Every day's dawn, sunrise, solar noon, sunset, dusk and day length, with how much the day grew or shrank." },
          { name: "Download", text: "Save the month as CSV for a spreadsheet or planner." },
        ],
      }}
      uses={{
        heading: "Who needs sunrise and sunset times",
        items: [
          { title: "Photographers", body: "Golden-hour planning starts from sunrise, sunset and civil twilight." },
          { title: "Hikers and hunters", body: "Legal shooting hours and safe return times are tied to sunrise and sunset." },
          { title: "Pilots and sailors", body: "Civil and nautical twilight mark lighting and navigation rules." },
          { title: "Religious observances", body: "Prayer and fasting times often start at dawn or sunset." },
          { title: "Gardening and farming", body: "Day length drives flowering and growth." },
          { title: "Outdoor events", body: "Schedule a wedding or match before the light goes." },
          { title: "Seasonal mood", body: "Watch the days lengthen after the winter solstice." },
          { title: "Travel", body: "Know how long the days will be at a destination." },
        ],
      }}
      dataSection={{
        heading: "How the times are calculated",
        paragraphs: [
          "The times come from the solar position equations published by NOAA's Global Monitoring Laboratory (the method behind the NOAA Solar Calculator), computed in your browser for the place's latitude and longitude.",
          "Sunrise and sunset are when the sun's upper edge meets a flat horizon, allowing for standard atmospheric refraction (the sun's centre 0.833° below the horizon). Civil, nautical and astronomical twilight begin and end when the sun's centre is 6°, 12° and 18° below the horizon. NOAA gives the method's accuracy as within a minute for latitudes between 72° N and 72° S; nearer the poles, where the sun skims the horizon, times can be off by more.",
          "Times are shown in the place's own time zone, found with Open-Meteo from timezone-boundary-builder data, with daylight saving applied from the IANA tz database in your browser. Mountains, buildings and unusual atmospheric conditions change what you actually see.",
        ],
        sources: [
          { label: "NOAA: solar calculation details", href: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
          { label: "NOAA Solar Calculator", href: "https://gml.noaa.gov/grad/solcalc/" },
          { label: "IANA time zone database", href: "https://www.iana.org/time-zones" },
          { label: "Open-Meteo API documentation", href: "https://open-meteo.com/en/docs" },
        ],
      }}
      faqs={[
        { question: "What is civil twilight?", answer: "The time before sunrise and after sunset when the sun is less than 6° below the horizon. There is usually enough light for most outdoor activities without lights." },
        { question: "Why isn't the earliest sunset on the shortest day?", answer: "Because the length of the solar day varies through the year (the equation of time), the earliest sunset comes some days before the winter solstice and the latest sunrise some days after." },
        { question: "What does 'no sunset' mean?", answer: "Inside the Arctic or Antarctic circles the sun can stay up all day (midnight sun) or not rise at all (polar night)." },
        { question: "Does elevation change sunrise?", answer: "Yes — from a mountaintop or plane the sun rises earlier. These times are for a flat sea-level horizon." },
        { question: "Are these times in daylight saving time?", answer: "Yes, when the place observes it on that date." },
        { question: "How far ahead can I look?", answer: "Any month from 1900 to 2100." },
      ]}
    >
      <SunriseSunsetTool />
    </ToolPageLayout>
  );
}
