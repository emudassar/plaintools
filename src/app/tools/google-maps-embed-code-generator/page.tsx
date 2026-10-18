import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import MapsEmbedTool from "@/components/MapsEmbedTool";
import { requireTool } from "@/config/tools";

const SLUG = "google-maps-embed-code-generator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Google Maps Embed Code Generator (iframe for Your Website)",
  description:
    "Generate Google Maps embed code for your website: a place, search, directions, map view or Street View, with size, responsive layout and accessible title. Copy the iframe and paste it in.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to embed a Google Map on your website",
        steps: [
          { name: "Choose the type", text: "The official Maps Embed API (needs a free key) or a quick embed without a key." },
          { name: "Enter the place or route", text: "An address, business name, search, two places for directions, or coordinates for a view or Street View." },
          { name: "Set the size", text: "Width and height, and whether it should shrink to fit phones." },
          { name: "Copy the code", text: "Paste the iframe into your site's HTML, page builder 'HTML' block or CMS embed field." },
          { name: "Preview", text: "Press Preview to see the map exactly as visitors will." },
        ],
      }}
      uses={{
        heading: "Where people embed a map",
        items: [
          { title: "Contact page", body: "Show your shop or office location." },
          { title: "Event page", body: "Map of the venue with directions." },
          { title: "Real-estate listing", body: "Street View of a property." },
          { title: "Store locator", body: "A search for your brand in a city." },
          { title: "Wedding website", body: "Directions from the ceremony to the reception." },
          { title: "Blog posts", body: "A view of the place you are writing about." },
          { title: "WordPress, Wix and Squarespace", body: "All accept iframe code in an HTML or embed block." },
          { title: "Accessibility", body: "A descriptive title lets screen-reader users know what the frame is." },
        ],
      }}
      dataSection={{
        heading: "How the code is built",
        paragraphs: [
          "The Maps Embed API builds the map from a URL of the form https://www.google.com/maps/embed/v1/MODE?key=KEY&parameters. The modes and parameters used here — place, search, directions, view and streetview, with q, origin, destination, mode, center, zoom, maptype, location, heading, pitch and fov — follow Google's Maps Embed API documentation. Google requires an API key for this API and states that it is offered at no charge.",
          "The 'quick embed' option uses the older maps.google.com link with output=embed. It works without a key today but is not documented by Google, so it may change.",
          "The code adds loading=\"lazy\" so the map loads only when scrolled into view, allowfullscreen, a referrer policy, and a title for screen readers. The responsive version wraps the iframe so it keeps its shape on small screens.",
          "Your key never leaves your browser except inside the code you copy and, if you press Preview, in the request to Google that draws the preview. This site is not affiliated with Google.",
        ],
        sources: [
          { label: "Google: Embedding a map (Maps Embed API)", href: "https://developers.google.com/maps/documentation/embed/embedding-map" },
          { label: "Google: Get an API key for the Maps Embed API", href: "https://developers.google.com/maps/documentation/embed/get-api-key" },
          { label: "Google: Maps Embed API usage and billing", href: "https://developers.google.com/maps/documentation/embed/usage-and-billing" },
        ],
      }}
      faqs={[
        { question: "Do I need an API key?", answer: "For the official Maps Embed API, yes — Google requires one, and states the Embed API is free to use. The quick embed works without a key but is undocumented." },
        { question: "How do I get a key?", answer: "Create a project in Google Cloud, enable the Maps Embed API and create a key. Restrict it to your website's address so nobody else can use it." },
        { question: "Is it safe to put my key in my website?", answer: "Embed keys are visible in page source by design. Restricting the key to your domain and to the Maps Embed API is what protects it." },
        { question: "Why does my map say 'This page can't load Google Maps correctly'?", answer: "The key is missing, not enabled for the Maps Embed API, or restricted to a different domain." },
        { question: "Can I show several pins?", answer: "Not with the Embed API's place mode. Use search mode for a category, or a custom map made in Google My Maps, which has its own embed option." },
        { question: "How do I make it responsive?", answer: "Tick 'Responsive' — the code keeps the map's shape and fills the width of its container." },
      ]}
    >
      <MapsEmbedTool />
    </ToolPageLayout>
  );
}
