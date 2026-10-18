import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CityTool from "@/components/CityTool";
import { requireTool } from "@/config/tools";

const SLUG = "what-city-am-i-in";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "What City Am I In? Find Your City (and Whether You're Inside City Limits)",
  description:
    "Find the city or town you are in from your device's location or an address. In the US, see whether the spot is inside incorporated city limits, a Census-designated place or an unincorporated area.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find what city you are in",
        steps: [
          { name: "Share your location or type an address", text: "Press 'Find my city' and allow location access, or type an address, place name or coordinates." },
          { name: "Read the headline", text: "It names the city or town. In the US it also says whether the point is inside that city's legal limits." },
          { name: "Check the boundary rows", text: "US results list the incorporated place, the Census Designated Place and the township or county subdivision that contain the point." },
          { name: "Compare with your mailing address", text: "If your address names a different city, the warning explains why — postal city names often reach beyond city limits." },
          { name: "Click the map", text: "Click anywhere on the map to check another spot, such as the other side of a road." },
        ],
      }}
      uses={{
        heading: "When it matters which city you are in",
        items: [
          { title: "Working out which city's taxes apply", body: "City sales tax and some income taxes apply only inside incorporated limits; an address with a city's name can sit outside them." },
          { title: "Knowing who to call about permits", body: "Building and zoning permits come from the city inside its limits and from the county outside them." },
          { title: "Checking whether you can vote in a city election", body: "Only residents inside the city limits vote for a mayor or city council." },
          { title: "Finding the right police or fire department", body: "Unincorporated areas are usually served by the county sheriff, not city police." },
          { title: "Comparing a house listing with its real jurisdiction", body: "Listings use the postal city name; this shows whether the lot is actually inside that city." },
          { title: "Filling in a form that asks for your city", body: "Travelling or newly moved, you can confirm the town name for the spot you are standing in." },
          { title: "Telling a delivery driver or rideshare where you are", body: "A town name plus coordinates helps when the street address is not obvious." },
          { title: "Settling which town a landmark belongs to", body: "Click the landmark on the map to see whose city limits it falls inside." },
          { title: "Planning a business licence", body: "City business licences apply inside city limits; outside them, county rules apply." },
          { title: "Travelling abroad", body: "Outside the US the tool reports the town OpenStreetMap records for the point." },
        ],
      }}
      dataSection={{
        heading: "Where the answer comes from",
        paragraphs: [
          "In the United States the page asks the Census Bureau's TIGERweb map service which boundaries contain your point: incorporated places (cities, towns, villages and boroughs with their own government), Census Designated Places (named communities with no city government, defined for statistics) and county subdivisions (townships, New England towns and census county divisions). These are the boundaries from the Bureau's current Boundary and Annexation Survey, which local governments report each year.",
          "Everywhere, the point is also sent to Photon, an open geocoder built on OpenStreetMap, which returns the city, county, state, country and postcode recorded for the nearest mapped feature. Outside the US, that is the answer shown. If the nearest named feature is more than 25 km away the page says so instead of naming it.",
          "Your coordinates come from your device's location service, asked only when you press the button, or from the address you type. Nothing is stored by this site; the coordinates are sent to the services named on the result.",
          "Limits: device positions can be off by tens of metres, and a point within that distance of a city line could fall on either side. Annexations take effect before they reach the Census files. A Census Designated Place is a statistical area, not a government. This page reports which boundary a point falls in; it is not a legal determination of residence, tax status or jurisdiction — the city or county clerk is the authority for that.",
        ],
        sources: [
          { label: "US Census Bureau TIGERweb", href: "https://tigerweb.geo.census.gov/tigerwebmain/TIGERweb_main.html", note: "incorporated places, CDPs and county subdivisions" },
          { label: "Census Bureau: Boundary and Annexation Survey", href: "https://www.census.gov/programs-surveys/bas.html", note: "how city boundaries are reported" },
          { label: "Photon geocoder", href: "https://photon.komoot.io", note: "OpenStreetMap place names" },
          { label: "OpenStreetMap copyright and licence", href: "https://www.openstreetmap.org/copyright" },
        ],
      }}
      faqs={[
        { question: "Why does my address say one city but this says I'm unincorporated?", answer: "The city in a postal address is the name the post office uses for a delivery area, which often stretches beyond any city's legal limits. The Census boundaries show the legal city limits, and many addresses with a city's name are outside them." },
        { question: "What is a Census Designated Place?", answer: "A named community that has no city government, which the Census Bureau defines so it can publish statistics for it. Being in a CDP means you live in an unincorporated area served by the county." },
        { question: "Does this use my IP address?", answer: "No. It uses your device's location (with your permission) or the address you type. IP-based location often names the wrong city because it reflects your internet provider." },
        { question: "How accurate is it near a city line?", answer: "The boundaries are the Census Bureau's; the uncertainty is your position. Phones are often accurate to 5–20 m outdoors but can be much worse indoors. Near a line, click the map on each side to see where it runs." },
        { question: "Does it work outside the United States?", answer: "Yes, using OpenStreetMap's place names. The city-limits check is US-only because it relies on Census boundaries." },
        { question: "Is this an official determination of my city?", answer: "No. It reports which Census boundary contains the point. For taxes, voting or permits, the city or county office decides." },
        { question: "Is my location saved?", answer: "No. The coordinates go only to the lookup services named on the result and are not stored by this site." },
      ]}
    >
      <CityTool />
    </ToolPageLayout>
  );
}
