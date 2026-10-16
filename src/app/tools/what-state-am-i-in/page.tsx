import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CensusAreaTool from "@/components/CensusAreaTool";
import { requireTool } from "@/config/tools";

const SLUG = "what-state-am-i-in";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "What State Am I In? Find Your US State Right Now",
  description:
    "Find which US state or territory you are in right now from your device's location, or for any address — with the county, FIPS codes and a warning when you are close to a state line.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function WhatStateAmIInPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find out what state you are in",
        steps: [
          { name: "Share your location or type a place", text: "Press 'Find my state' and allow location access, or enter an address, city or coordinates." },
          { name: "Read the state", text: "The headline is the state or territory, with its postal code and the county you are in." },
          { name: "Check the state-line warning", text: "If your device's accuracy circle reaches into another state, the page names it." },
          { name: "Check other spots", text: "Click the map to look up any other point." },
        ],
      }}
      uses={{
        heading: "10 times it matters which state you are in",
        items: [
          { title: "Driving through a border area", body: "Speed limits, hands-free phone rules and fireworks rules change at the line." },
          { title: "Calling for help near a state line", body: "Knowing the state helps you reach the right state police or agency." },
          { title: "Buying a lottery ticket or placing a legal bet", body: "Online gaming apps check that you are physically inside a permitted state." },
          { title: "Working remotely across states", body: "Some employers and tax rules care which state the work was done in on a given day." },
          { title: "Checking hunting or fishing licence coverage", body: "A licence covers one state; on a border lake or river, the line matters." },
          { title: "Ordering something with state-specific rules", body: "Some products cannot be shipped to or sold in certain states." },
          { title: "Settling a 'which state is this?' argument", body: "At a Four Corners-style border, see which side of the line a point falls on." },
          { title: "Filling in a form on the road", body: "Forms and apps that ask for your current state, answered from your actual position." },
          { title: "Choosing which state's emergency alerts apply", body: "Weather and public-safety alerts are issued by state and county." },
          { title: "Teaching US geography", body: "Students can click around a map and see the state change at each line." },
        ],
      }}
      dataSection={{
        heading: "Where the state comes from",
        paragraphs: [
          "The coordinates are sent to the FCC Area API, which returns the 2020 Census block containing the point. Every block lies inside one county and one state, so the block's state is the state of the point. It covers the 50 states, the District of Columbia, Puerto Rico and the US Island Areas (for the Island Areas the service gives the code but not the name of the county equivalent).",
          "With your device's location, the browser reports how accurate the fix is. When that radius is 25 m or more, the page checks four points on the edge of the circle and warns you if any of them is in another state. Typed places are converted to coordinates by the Photon geocoder (OpenStreetMap).",
          "Limits: an indoor phone fix can be off by hundreds of metres, and a geocoded address may sit at the street centreline. Boundaries are the Census Bureau's 2020 boundaries. Outside the covered area there is no Census block; the page then shows OpenStreetMap's region names, which are not Census data. This page is a location lookup, not a legal opinion about which state's law applies to you.",
        ],
        sources: [
          { label: "FCC Area API", href: "https://geo.fcc.gov/api/census/", note: "2020 Census blocks" },
          { label: "US Census Bureau: Geography glossary", href: "https://www.census.gov/programs-surveys/geography/about/glossary.html" },
          { label: "Census FIPS / ANSI codes", href: "https://www.census.gov/library/reference/code-lists/ansi.html" },
        ],
      }}
      faqs={[
        { question: "What state am I in right now?", answer: "Press 'Find my state' and allow location access. The page looks up the 2020 Census block at your coordinates and shows its state." },
        { question: "Why does my phone say a different state?", answer: "Apps that use your IP address show where your network appears to be. This page uses your device's own position, which near a state line can be the more accurate answer." },
        { question: "What if I am right on the state line?", answer: "The page checks the edge of your device's accuracy circle and tells you if it reaches another state. Move outdoors for a better fix, or click your exact spot on the map." },
        { question: "Does it include Puerto Rico and DC?", answer: "Yes. Both are covered by the Census blocks the FCC service uses." },
        { question: "Does it work for other US territories?", answer: "Yes for the territory itself: Guam, the US Virgin Islands, American Samoa and the Northern Mariana Islands all return a Census block. The service does not name their county equivalents, so only the code is shown." },
        { question: "Can I check the state for an address?", answer: "Yes. Type the address and press Look up." },
      ]}
    >
      <CensusAreaTool mode="state" />
    </ToolPageLayout>
  );
}
