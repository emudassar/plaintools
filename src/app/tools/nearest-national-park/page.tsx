import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import NearestParkTool from "@/components/NearestParkTool";
import { requireTool } from "@/config/tools";

const SLUG = "nearest-national-park";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Nearest National Park to Me: All 63 Ranked by Distance",
  description:
    "Find the national park nearest you: all 63 US national parks ranked by distance from your location or any address, with driving distance and time to the three closest.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the nearest national park",
        steps: [
          { name: "Share your location or type an address", text: "Press 'Find parks near me', type a city or address, or click the map." },
          { name: "Read the nearest park", text: "The headline names it with the straight-line distance and direction." },
          { name: "Check the driving distance", text: "The three nearest parks get driving distance and time." },
          { name: "Browse the full list", text: "All 63 parks are ranked by distance, with size and establishment date." },
        ],
      }}
      uses={{
        heading: "Why look up the nearest national park",
        items: [
          { title: "Weekend trips", body: "Which park is within a day's drive." },
          { title: "Park passport goals", body: "Plan which park to visit next." },
          { title: "Road-trip planning", body: "Parks near your route's cities." },
          { title: "Moving", body: "How far a new home is from the outdoors." },
          { title: "Teaching", body: "Where the national parks are." },
          { title: "Travel with kids", body: "Pick the shortest drive." },
        ],
      }}
      dataSection={{
        heading: "Where the park list comes from",
        paragraphs: [
          "The 63 parks are the units of the US National Park System designated 'National Park', from Wikipedia's list of national parks of the United States, which gives a representative coordinate, establishment date and area (National Park Service acreage) for each. The National Park Service manages more than 400 other units — monuments, seashores, historic sites — which are not included here.",
          "Distances are measured to each park's single representative point, not to its boundary or nearest entrance, so a large park can be closer than shown.",
          "Driving distances and times for the three nearest parks come from OSRM over OpenStreetMap roads on the FOSSGIS servers, at typical speeds with no traffic.",
        ],
        sources: [
          { label: "List of national parks of the United States", href: "https://en.wikipedia.org/wiki/List_of_national_parks_of_the_United_States" },
          { label: "National Park Service: the National Park System", href: "https://www.nps.gov/aboutus/national-park-system.htm" },
          { label: "OSRM API documentation", href: "https://project-osrm.org/docs/v5.24.0/api/" },
        ],
      }}
      faqs={[
        { question: "How many national parks are there?", answer: "63 designated National Parks in the list used here. The wider National Park System has more than 400 units." },
        { question: "Why is the distance to a big park so large?", answer: "It is measured to one representative point inside the park. The nearest entrance can be much closer." },
        { question: "Are monuments and seashores included?", answer: "No, only units designated National Park." },
        { question: "Does it work outside the US?", answer: "Yes, but the list is US national parks only." },
        { question: "Is the drive time accurate?", answer: "It assumes typical speeds and no traffic; park roads are often slower." },
      ]}
    >
      <NearestParkTool />
    </ToolPageLayout>
  );
}
