import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CensusAreaTool from "@/components/CensusAreaTool";
import { requireTool } from "@/config/tools";

const SLUG = "what-county-am-i-in";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "What County Am I In? Find Your County Right Now",
  description:
    "Find the county you are in right now from your device's location, or the county for any US address — with the state, FIPS codes and a warning when you are near a county line. 2020 Census data.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function WhatCountyAmIInPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find out what county you are in",
        steps: [
          { name: "Share your location or type an address", text: "Press 'Find my county' and allow location access, or enter a street address, city or ZIP code." },
          { name: "Read the county", text: "The headline is the county (or parish, borough or municipio) the point falls in, with its state." },
          { name: "Check the line warning", text: "If your device's accuracy circle crosses into another county, the page says which one." },
          { name: "Copy the codes", text: "The county FIPS and state FIPS codes are shown for forms and spreadsheets." },
        ],
      }}
      uses={{
        heading: "10 reasons people need to know their county",
        items: [
          { title: "Reporting a problem to the right sheriff", body: "Calling the wrong county's non-emergency line wastes time when you are near a border." },
          { title: "Filing at the right courthouse", body: "Deeds, small claims and marriage licences go to the county where the property or event is." },
          { title: "Finding the right property tax office", body: "A mailing address can name a city in one county while the house sits in another." },
          { title: "Checking a burn ban", body: "Burn bans and fire restrictions are often issued county by county." },
          { title: "Registering to vote", body: "Election offices are run by county, so you need the right one for registration and polling places." },
          { title: "Filling in a form that asks for county or FIPS", body: "Insurance, grants and government forms often ask for the county name or code." },
          { title: "Following a weather warning", body: "Severe-weather warnings name counties; knowing yours tells you whether a warning covers you." },
          { title: "Checking which health department applies", body: "Well, septic and restaurant inspections are often county functions." },
          { title: "Settling a travel question", body: "On a road trip, see which county you are driving through right now." },
          { title: "Buying land near a county line", body: "Zoning, taxes and permits change at the line; confirm which side a parcel's coordinates fall on." },
        ],
      }}
      dataSection={{
        heading: "Where the county comes from",
        paragraphs: [
          "The page sends the coordinates to the FCC Area API, a free public service from the Federal Communications Commission that returns the 2020 Census block containing a point, along with the block's county, state and FIPS codes. Census blocks are the smallest areas the Census Bureau maps and they nest inside counties, so the county of the block is the county of the point.",
          "When you use your device's location, the browser also reports an accuracy radius. If it is 25 m or more, the page checks four points on the edge of that circle (north, east, south and west) and warns you if any of them is in a different county. Typed addresses are turned into coordinates by the Photon geocoder (OpenStreetMap); check the matched address on the result.",
          "Limits: the answer is only as good as the coordinates. A geocoder can place an address at the street centreline or the middle of a ZIP area, and a phone indoors can be off by hundreds of metres. Boundaries are the Census Bureau's 2020 boundaries; a county line changed since then would not be reflected. For a legal determination such as which county a parcel is taxed in, the county assessor's records are the authority.",
        ],
        sources: [
          { label: "FCC Area API", href: "https://geo.fcc.gov/api/census/", note: "2020 Census blocks" },
          { label: "US Census Bureau: Geography glossary", href: "https://www.census.gov/programs-surveys/geography/about/glossary.html", note: "county and county equivalents" },
          { label: "Census FIPS / ANSI codes", href: "https://www.census.gov/library/reference/code-lists/ansi.html" },
        ],
      }}
      faqs={[
        { question: "What county am I in right now?", answer: "Press 'Find my county' and allow location access. The page looks up the 2020 Census block at your coordinates and shows its county and state." },
        { question: "How do I find out what county an address is in?", answer: "Type the address and press Look up. The address is turned into coordinates and the county is read from the Census block at that point." },
        { question: "Can I find my county by ZIP code?", answer: "You can type a ZIP code, but the page uses the centre point the geocoder returns for it. ZIP codes are postal routes and many cross county lines, so a street address gives a more reliable answer." },
        { question: "Why does it say I may be near a county line?", answer: "Your device's position has an accuracy radius. If part of that circle falls in another county, the page names it so you can move outdoors for a better fix or click your exact spot on the map." },
        { question: "What is a county FIPS code?", answer: "A five-digit code from the Census Bureau: two digits for the state and three for the county. Many forms and datasets use it instead of the name." },
        { question: "Does it work in Louisiana, Alaska and Puerto Rico?", answer: "Yes. Parishes, Alaska's boroughs and census areas, and Puerto Rico's municipios are county equivalents in Census data and are shown the same way." },
        { question: "Does it work outside the US?", answer: "No. Outside the 50 states, DC, Puerto Rico and the US Island Areas there is no Census block, and the page says so and shows OpenStreetMap's region name instead." },
      ]}
    >
      <CensusAreaTool mode="county" />
    </ToolPageLayout>
  );
}
