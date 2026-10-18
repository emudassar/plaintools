import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CoordsToAddressTool from "@/components/CoordsToAddressTool";
import { requireTool } from "@/config/tools";

const SLUG = "coordinates-to-address";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Coordinates to Address: Reverse Geocode Latitude and Longitude",
  description:
    "Enter GPS coordinates in decimal or degrees-minutes-seconds, or click a map, and get the nearest street address with city, postcode and country — plus the elevation and local time zone at that point.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to turn coordinates into an address",
        steps: [
          { name: "Enter the coordinates", text: "Type or paste latitude and longitude in decimal degrees, degrees-minutes-seconds or decimal minutes." },
          { name: "Press Find address", text: "Or click anywhere on the map, or use your device's location." },
          { name: "Read the address", text: "The headline is the nearest mapped address, with its distance from your point." },
          { name: "Check the extras", text: "The table adds the postcode, region, ground elevation and the time zone with the local time now." },
          { name: "Watch the distance", text: "If the matched feature is far from the point, the warning tells you the address belongs somewhere else." },
        ],
      }}
      uses={{
        heading: "When you have coordinates and need an address",
        items: [
          { title: "A friend shares a GPS pin", body: "Turn a dropped pin's coordinates into a street address to type into a taxi app." },
          { title: "Reading a photo's location", body: "Camera GPS tags become the address where a photo was taken." },
          { title: "Finding a trailhead or campsite", body: "Guidebooks give coordinates; this shows the nearest road address." },
          { title: "Checking a delivery drop point", body: "See which address a driver's logged coordinates correspond to." },
          { title: "Filling in an incident report", body: "An accident location recorded as coordinates needs a street address on the form." },
          { title: "Verifying a property's coordinates", body: "Check that coordinates in a listing or survey point to the right lot." },
          { title: "Planning a drone or survey flight", body: "Note the address and ground elevation at a launch point." },
          { title: "Scheduling calls with someone abroad", body: "The time zone row gives the local time at their coordinates." },
          { title: "Geocaching", body: "Find the nearest street to a cache's published coordinates." },
          { title: "Data cleaning", body: "Spot-check a coordinate column by turning a few rows into addresses." },
        ],
      }}
      dataSection={{
        heading: "Where the address, elevation and time zone come from",
        paragraphs: [
          "The address comes from Photon, an open reverse geocoder run by Komoot on OpenStreetMap data. It returns the nearest mapped feature — a building, a street or a place — and the address parts OpenStreetMap records for it. The page shows how far that feature is from your point, because 'nearest' can be a long way off in the countryside.",
          "Ground elevation comes from the USGS 3D Elevation Program where it has data (the US and parts of Canada and Mexico) and otherwise from the Copernicus 90 m digital elevation model via Open-Meteo. The time zone is the IANA zone Open-Meteo reports for the point; the current local time is worked out in your browser from that zone's rules.",
          "Coordinates are read in decimal degrees, degrees-minutes-seconds or decimal minutes, with N/S/E/W letters or minus signs. They are sent only to the services named on the result.",
          "Limits: house numbers are mapped unevenly, so the result may be a street or neighbourhood rather than a building. Elevation models give the ground surface averaged over a grid cell, not the height of a roof or a summit. Do not use the address for emergency dispatch or legal descriptions.",
        ],
        sources: [
          { label: "Photon geocoder", href: "https://photon.komoot.io" },
          { label: "USGS Elevation Point Query Service", href: "https://apps.nationalmap.gov/epqs/" },
          { label: "Open-Meteo elevation API", href: "https://open-meteo.com/en/docs/elevation-api", note: "Copernicus DEM GLO-90" },
          { label: "OpenStreetMap copyright and licence", href: "https://www.openstreetmap.org/copyright" },
        ],
      }}
      faqs={[
        { question: "What coordinate formats work?", answer: "Decimal degrees (40.748817, -73.985428), degrees-minutes-seconds (40°44′55.7″N 73°59′07.5″W) and decimal minutes (N 40 44.929 W 73 59.126)." },
        { question: "Why is the address a street and not a house number?", answer: "OpenStreetMap only has house numbers where volunteers have added them. Where none are mapped, the nearest street or place is the best match." },
        { question: "Why does it warn that the address is far away?", answer: "In remote areas the nearest mapped feature can be kilometres away. The warning appears when it is more than 2 km from your point." },
        { question: "Is the elevation exact?", answer: "No. It is the ground height from a gridded elevation model — about 1–10 m cells from USGS in the US, 90 m cells from Copernicus elsewhere." },
        { question: "Why is latitude first?", answer: "Latitude, longitude is the usual order. If your source gives longitude first, swap them, or add N/S and E/W letters and the order is worked out for you." },
        { question: "Are my coordinates stored?", answer: "No. They go to the lookup services named on the result and are not stored here." },
      ]}
    >
      <CoordsToAddressTool />
    </ToolPageLayout>
  );
}
