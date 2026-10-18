import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import MoonPositionTool from "@/components/MoonPositionTool";
import { requireTool } from "@/config/tools";

const SLUG = "moon-position-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Moon Position Map: Where Is the Moon Right Now?",
  description:
    "Where is the moon now? See the point on Earth where it is overhead, where it is above the horizon, its path for the next 24 hours, its phase and distance, and its direction from any place.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find where the moon is",
        steps: [
          { name: "Look at the map", text: "The marker is where the moon is overhead; the unshaded half of the Earth can see it." },
          { name: "Follow the dashed line", text: "Where the moon will be overhead over the next day." },
          { name: "Choose a place", text: "Search or click to see the moon's altitude and compass direction there, and today's moonrise and moonset." },
          { name: "Read the details", text: "Phase, illumination, age, distance and the dates of the next four phases." },
        ],
      }}
      uses={{
        heading: "Why find the moon's position",
        items: [
          { title: "Moon photography", body: "Know where it will rise and how high it is." },
          { title: "Stargazing", body: "Avoid nights when a bright moon is up." },
          { title: "Fishing and hunting", body: "Many plan around moonrise and moonset." },
          { title: "Tides", body: "The moon's position drives the tides." },
          { title: "Teaching", body: "Why the moon rises about 50 minutes later each day." },
          { title: "Curiosity", body: "Who can see the moon right now?" },
        ],
      }}
      dataSection={{
        heading: "How the moon's position is calculated",
        paragraphs: [
          "The moon's position comes from Paul Schlyter's method for computing planetary positions, including the main perturbation terms of the lunar orbit. Checked against JPL Horizons it was within about a minute of arc, and its phase times were within 10 minutes of the US Naval Observatory's for October–December 2026.",
          "The point overhead is the moon's geocentric declination and the longitude where its right ascension matches the local sidereal time. Altitude and azimuth for a place are geocentric; moonrise and moonset use the moon's upper limb with standard refraction and parallax.",
          "A place's time zone comes from Open-Meteo. Everything else is calculated in your browser, refreshed every minute.",
        ],
        sources: [
          { label: "Paul Schlyter: How to compute planetary positions", href: "https://stjarnhimlen.se/comp/ppcomp.html" },
          { label: "JPL Horizons", href: "https://ssd.jpl.nasa.gov/horizons/" },
          { label: "US Naval Observatory: moon phases", href: "https://aa.usno.navy.mil/data/MoonPhases" },
        ],
      }}
      faqs={[
        { question: "Why does the moon rise later each day?", answer: "It moves about 13° east along its orbit each day, so the Earth must turn about 50 extra minutes before it rises again." },
        { question: "Can the moon be seen in daytime?", answer: "Yes, whenever it is above the horizon and not too close to the sun — often in the afternoon around first quarter." },
        { question: "Why is there sometimes no moonrise on a date?", answer: "Because it rises later each day, one day a month the rise falls after midnight and that date has none." },
        { question: "How far away is the moon?", answer: "About 356,000 to 407,000 km, centre to centre; the page shows today's distance." },
        { question: "Is the altitude exact?", answer: "It is geocentric and ignores refraction, so near the horizon it can differ by about a degree from what you see." },
      ]}
    >
      <MoonPositionTool />
    </ToolPageLayout>
  );
}
