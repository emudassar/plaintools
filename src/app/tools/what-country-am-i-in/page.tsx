import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CountryTool from "@/components/CountryTool";
import { requireTool } from "@/config/tools";

const SLUG = "what-country-am-i-in";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "What Country Am I In? Check From Your Location, Not Your IP",
  description:
    "See which country you are in right now from your device's location — not your IP address or VPN — with the ISO country code, region and city from OpenStreetMap.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function WhatCountryAmIInPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to check which country you are in",
        steps: [
          { name: "Share your location", text: "Press 'Find my country' and allow location access, or type any place or coordinates." },
          { name: "Read the country", text: "The headline is the country recorded in OpenStreetMap at that point, with its two-letter ISO code." },
          { name: "Compare with your device settings", text: "Your device's time zone and language are listed underneath — useful if an app thinks you are elsewhere." },
          { name: "Check another spot", text: "Click anywhere on the map to see which country it falls in." },
        ],
      }}
      uses={{
        heading: "10 situations where you need to know the country you are in",
        items: [
          { title: "Checking a VPN is not fooling you", body: "Streaming and banking apps often go by IP address; this shows where you actually are." },
          { title: "Crossing a land border without noticing", body: "On a train or a mountain road in Europe, see whether you have crossed yet before roaming charges apply." },
          { title: "Knowing which emergency number to call", body: "Emergency numbers differ by country; first confirm which country you are in." },
          { title: "At sea near a coast", body: "On a ferry or boat, see whether the point is still on land in OpenStreetMap or out in open water." },
          { title: "Filling in a customs or travel form", body: "Forms that ask for your current country, answered from your real position." },
          { title: "Exclaves and enclaves", body: "In places like Baarle-Nassau/Baarle-Hertog, borders run between houses; click the map to check each side." },
          { title: "Checking an app's region lock", body: "When an app says it is not available in your country, confirm what your actual location is." },
          { title: "Geography games", body: "Drop a point anywhere on the map and see which country it lands in." },
          { title: "Travel logging", body: "Note the country code at each stop of a trip." },
          { title: "Remote work rules", body: "Some contracts care which country work is done from; check your position, not your network." },
        ],
      }}
      dataSection={{
        heading: "Where the country comes from",
        paragraphs: [
          "Your coordinates are sent to Photon, a free reverse geocoder built on OpenStreetMap data, which returns the nearest mapped feature and the country, region, county and city it sits in. The two-letter code is OpenStreetMap's ISO 3166-1 country code for that country.",
          "This is different from IP-based 'where am I' sites. Those show where your internet provider or VPN exit appears to be, which can be in another city or another country. This page uses your device's own position (GPS, Wi-Fi or cell towers, depending on the device), so it answers where the device is.",
          "Limits: OpenStreetMap is built by volunteers and is very complete for borders, but disputed areas are recorded following its 'on the ground' approach, which may not match a particular government's position. If the nearest named feature is far away (more than 25 km), the page does not name a country, because the point is probably at sea or in unmapped land. A country name here is a location fact, not a statement about legal jurisdiction or residency.",
        ],
        sources: [
          { label: "Photon geocoder", href: "https://photon.komoot.io", note: "OpenStreetMap data" },
          { label: "OpenStreetMap: disputed territories", href: "https://wiki.openstreetmap.org/wiki/Disputed_territories" },
          { label: "ISO 3166 country codes", href: "https://www.iso.org/iso-3166-country-codes.html" },
        ],
      }}
      faqs={[
        { question: "What country am I in right now?", answer: "Press 'Find my country' and allow location access. The page reads the country OpenStreetMap records at your coordinates." },
        { question: "Why does a website think I am in another country?", answer: "Most sites go by your IP address, which reflects your network or VPN rather than your position. This page uses your device's location instead." },
        { question: "Does a VPN change the answer here?", answer: "No. A VPN changes your IP address, not the position your device reports." },
        { question: "What does the two-letter code mean?", answer: "It is the ISO 3166-1 alpha-2 country code, such as US, GB or FR, as recorded in OpenStreetMap." },
        { question: "Why doesn't it name a country at sea?", answer: "When the nearest mapped place is more than 25 km away, the point is probably in open water. Naming the nearest coastline's country would be misleading, so the page says so instead." },
        { question: "How are disputed borders handled?", answer: "They follow OpenStreetMap, which records the situation on the ground. That may differ from what a particular government recognises." },
      ]}
    >
      <CountryTool />
    </ToolPageLayout>
  );
}
