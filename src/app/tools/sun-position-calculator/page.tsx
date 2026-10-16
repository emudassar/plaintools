import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SunPositionTool from "@/components/SunPositionTool";
import { requireTool } from "@/config/tools";

const SLUG = "sun-position-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Sun Position Calculator: Sun Angle, Azimuth, Sunrise & Sunset",
  description:
    "Get the sun's elevation angle and compass azimuth for any place, date and time, plus sunrise, sunset, solar noon, day length and shadow length — NOAA solar equations, local time.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function SunPositionPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the sun's position",
        steps: [
          { name: "Pick a place", text: "Use your location or type an address, city or coordinates. The local time zone is looked up for you." },
          { name: "Set the date and time", text: "It starts at the current local time there; change either, or press Now." },
          { name: "Read elevation and azimuth", text: "How high the sun is above the horizon and its compass direction from true north." },
          { name: "Read the day", text: "Sunrise, solar noon, sunset, day length and a chart of the sun's height through the day." },
        ],
      }}
      uses={{
        heading: "10 reasons to look up the sun's position",
        items: [
          { title: "Planning a photo at golden hour", body: "See when the sun sits low in the direction your subject faces." },
          { title: "Placing solar panels", body: "Check the sun's noon height in winter and summer for a roof or ground mount." },
          { title: "Choosing a garden bed's spot", body: "See how high the sun gets and where it sets, before planting sun-loving crops in a shaded yard." },
          { title: "Checking glare on a commute", body: "Find the dates and times the sun sits low along a road's direction." },
          { title: "Positioning a patio umbrella or shade sail", body: "Shadow direction and length for an afternoon gathering." },
          { title: "Buying a house with good light", body: "See where the sun is at breakfast time in December for the listing's windows." },
          { title: "Planning a hike's finish before dark", body: "Sunset time and day length for a date and place." },
          { title: "Astronomy and science lessons", body: "Declination and the equation of time, worked from NOAA's equations." },
          { title: "Prayer or ritual times that depend on the sun", body: "Solar noon and sunset as a starting point; follow your own tradition's rules for the times themselves." },
          { title: "Drone and film shoots abroad", body: "Local-time sunrise and sun direction for a location you have never visited." },
        ],
      }}
      dataSection={{
        heading: "Where the numbers come from",
        paragraphs: [
          "The calculations follow the NOAA Global Monitoring Laboratory solar calculator spreadsheets, which implement equations from Jean Meeus's Astronomical Algorithms: the sun's geometric mean longitude and anomaly, the equation of centre, apparent longitude, obliquity, declination and the equation of time. From those, the page computes the hour angle, the solar zenith and elevation, and the azimuth. Sunrise and sunset use a zenith of 90.833°, NOAA's 0.833° allowance for atmospheric refraction, and the elevation shown is corrected with NOAA's banded refraction model.",
          "NOAA states that its sunrise and sunset results are theoretically accurate to within a minute between ±72° latitude and within 10 minutes beyond it, and that its spreadsheets are valid for 1901-2099, which is the date range this page accepts. NOAA also notes that the calculator is no longer actively maintained. The place's time zone comes from the Open-Meteo API so times are shown in local time with daylight saving applied; the sun calculation itself runs in your browser. As a check, the page's sunrise and sunset for New York on 16 October 2026 agree with Open-Meteo's own figures to within a minute.",
          "Limits: real sunrise depends on your horizon — hills, buildings and your height above the ground move it by minutes — and on the weather's effect on refraction. Azimuth is from true north, not magnetic north. NOAA says its results are for research and recreational use and cannot be certified for legal purposes.",
        ],
        sources: [
          { label: "NOAA GML: Solar calculation details", href: "https://gml.noaa.gov/grad/solcalc/calcdetails.html" },
          { label: "NOAA Solar Calculator", href: "https://gml.noaa.gov/grad/solcalc/" },
          { label: "Open-Meteo", href: "https://open-meteo.com/en/docs", note: "time zone for the place" },
        ],
      }}
      faqs={[
        { question: "What is the sun's elevation angle?", answer: "Its height above the horizon in degrees: 0° on the horizon, 90° directly overhead, negative when it is below the horizon." },
        { question: "What is solar azimuth?", answer: "The sun's compass direction, in degrees clockwise from true north: 90° is due east, 180° due south, 270° due west." },
        { question: "What is solar noon?", answer: "The moment the sun is highest in the sky that day. It is rarely exactly 12:00 because of time zones, daylight saving and the equation of time." },
        { question: "How accurate are the sunrise and sunset times?", answer: "NOAA gives about one minute between 72° north and south and about 10 minutes nearer the poles, for a flat sea-level horizon." },
        { question: "How long is a shadow?", answer: "An upright object's shadow is its height divided by the tangent of the sun's elevation. The page shows it for a 1-unit object; multiply by your object's height." },
        { question: "Does it handle daylight saving time?", answer: "Yes. Times use the place's own time zone, so daylight saving is applied on the dates it is in force." },
        { question: "Does it work near the poles?", answer: "Yes. When the sun does not rise or set, the page says 'polar night' or 'midnight sun' instead of giving a time." },
      ]}
    >
      <SunPositionTool />
    </ToolPageLayout>
  );
}
