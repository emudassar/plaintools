import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DayNightMapTool from "@/components/DayNightMapTool";
import { requireTool } from "@/config/tools";

const SLUG = "day-night-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Day and Night Map: Where Is It Day Right Now?",
  description:
    "A live world map of day and night: the line between them, civil, nautical and astronomical twilight, and the points where the sun and moon are overhead. Pick any date and time.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to read the day and night map",
        steps: [
          { name: "See the shading", text: "The darker the band, the deeper the night: past sunset, then civil, nautical and astronomical twilight, then full night." },
          { name: "Find the sun and moon", text: "Markers show where each is directly overhead." },
          { name: "Change the time", text: "Use the date box, the hour buttons or the slider to move up to 12 hours either way." },
          { name: "Check a place", text: "Search a place or click the map to see whether it is day, twilight or night there." },
        ],
      }}
      uses={{
        heading: "Why look at a day and night map",
        items: [
          { title: "Calling abroad", body: "Is it daytime where they are?" },
          { title: "Ham radio", body: "The grey line along the terminator is prized for long-distance contacts." },
          { title: "Photography", body: "See where golden hour is happening now." },
          { title: "Teaching seasons", body: "Watch the night cap the poles at the solstices." },
          { title: "Flights", body: "See whether you will land in daylight." },
          { title: "Astronomy", body: "Where it is dark enough for the stars." },
        ],
      }}
      dataSection={{
        heading: "How the map is calculated",
        paragraphs: [
          "The point where the sun is overhead comes from NOAA's solar position equations (declination and equation of time). The sun's altitude anywhere follows from that point, and the map shades each 1° column of longitude where the altitude is below −0.833° (sunset, with refraction), −6°, −12° and −18° (the ends of civil, nautical and astronomical twilight).",
          "The moon's position comes from Paul Schlyter's method for planetary positions with the main lunar perturbations.",
          "The web map stops at about 85° latitude, so the poles are not drawn. Everything is calculated in your browser.",
        ],
        sources: [
          { label: "NOAA: solar calculation details", href: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
          { label: "Paul Schlyter: How to compute planetary positions", href: "https://stjarnhimlen.se/comp/ppcomp.html" },
        ],
      }}
      faqs={[
        { question: "What is the grey line?", answer: "The band of twilight along the boundary between day and night." },
        { question: "Why is half the Earth not exactly lit?", answer: "Refraction and the sun's width extend daylight slightly, and twilight adds a broad band on the night side." },
        { question: "Why is the line curved?", answer: "It is a great circle on the globe; the flat map's projection curves it, most of all near the solstices." },
        { question: "Can I see a past or future date?", answer: "Yes, enter any date and time." },
        { question: "Is the moon shown at the right place?", answer: "It marks where the moon is overhead, from a method accurate to about a minute of arc." },
      ]}
    >
      <DayNightMapTool />
    </ToolPageLayout>
  );
}
