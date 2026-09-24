import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SoilTool from "@/components/SoilTool";
import { requireTool } from "@/config/tools";

const SLUG = "what-soil-type-is-my-property";
// Fails the build if the registry entry is missing, so a page can never exist
// without being wired into the nav, footer and sitemap.
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "What Soil Type Is My Property? Free USDA Soil Lookup by Address",
  description:
    "Enter a US address and get the USDA soil series, texture, drainage class, pH, depth to water table and septic rating recorded for that exact spot. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function WhatSoilTypeIsMyPropertyPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the soil type for your property",
        steps: [
          {
            name: "Enter your address",
            text: "Type a US street address, or paste a latitude and longitude pair if you already have coordinates for the exact spot you care about.",
          },
          {
            name: "Wait for the USDA lookup",
            text: "Your address is turned into coordinates, then the USDA soil survey is queried for the map unit covering that point. This normally takes a few seconds; USDA's service is occasionally slow, and the tool tells you when it is waiting.",
          },
          {
            name: "Read the headline texture",
            text: "The top of the result card shows the surface texture USDA records for the dominant soil at that point, along with the soil series name and how much of the map unit it accounts for.",
          },
          {
            name: "Check the map unit properties",
            text: "Below that are drainage class, hydrologic group, flooding frequency, shallowest water table, depth to bedrock, farmland classification and the septic absorption field rating, each exactly as USDA recorded it.",
          },
          {
            name: "Read the layer table",
            text: "The layer table gives depth ranges with texture, the sand, silt and clay split, pH and organic matter for each horizon, so you can see how the soil changes with depth rather than only at the surface.",
          },
          {
            name: "If it says no profile was recorded, read why",
            text: "Built-up addresses are usually mapped as Urban land or disturbed ground with no profile at all. The tool explains why the fields are blank, shows what USDA still records, and lists the nearest named soils as surrounding context.",
          },
        ],
      }}
      uses={{
        heading: "10 practical uses for a soil lookup on your address",
        items: [
          {
            title: "Checking shrink-swell risk before you buy a house",
            body: "Soils high in certain clays expand when wet and contract when dry, and that movement is a known cause of cracked slabs, sticking doors and damaged foundations. The layer table shows the clay percentage at each depth and the texture class for the soil under the property, which tells you whether this is a question worth paying an engineer to look at before you exchange contracts.",
          },
          {
            title: "Estimating whether a rural lot can take a septic system",
            body: "A septic permit usually hinges on how fast the soil absorbs water and how high the water table sits. USDA publishes a rating for septic tank absorption fields and a shallowest-water-table figure for most rural map units. Seeing \"Very limited\" before you make an offer on a lot with no sewer connection is the difference between negotiating and discovering later that the only workable system costs five figures.",
          },
          {
            title: "Working out why one corner of a garden never dries out",
            body: "A patch that stays waterlogged for weeks after rain is often sitting on a poorly drained map unit or a seasonal water table close to the surface. The drainage class and shallowest water table depth for your point will usually tell you whether this is a drainage problem you can fix by regrading or a property of the ground itself.",
          },
          {
            title: "Knowing the soil pH before you buy amendments",
            body: "Lime and sulphur are applied to shift pH, and the amount needed depends on where the soil starts. The layer table gives the pH recorded for each depth, so you can see whether your soil is genuinely acidic before spending money on a correction it may not need — and whether the subsoil differs from the topsoil, which matters for deep-rooted plants.",
          },
          {
            title: "Deciding where to put raised beds on a new plot",
            body: "If the mapped soil is sand, it will drain fast and hold few nutrients; if it is clay, water will sit. Knowing which you have before you build tells you whether raised beds with imported soil are worth the cost or whether the existing ground is fine once you know how it behaves.",
          },
          {
            title: "Judging whether a basement is likely to be wet",
            body: "A shallowest water table of 30 cm means the water table comes within about a foot of the surface at some point in a normal year. A basement below that level will be fighting groundwater, not just rain. This figure gives you a reason to ask the seller specific questions, or to budget for a sump before you find out the hard way.",
          },
          {
            title: "Checking depth to bedrock before digging",
            body: "Shallow bedrock turns a simple job — fence posts, a pool, a trench for a service line, a tree that needs rooting depth — into a hire-a-breaker job. Where USDA recorded a depth to bedrock, it is shown, so you can find out before the quote is written rather than after the digger arrives.",
          },
          {
            title: "Seeing whether rural land is classed as prime farmland",
            body: "USDA's farmland classification marks land as prime farmland, farmland of statewide importance, or not prime. That classification is used in conservation programmes and in some local planning decisions, and it can affect what you are permitted to do with a parcel. It is shown for every point the tool can answer for.",
          },
          {
            title: "Sizing a soakaway or driveway drainage",
            body: "The hydrologic soil group (A to D) is the input that runoff calculations start from — group A soils absorb water readily, group D shed almost all of it. Having the group for your specific point means a drainage contractor's assumption can be checked against what the survey actually records.",
          },
          {
            title: "Getting the soil series name before you order a perc test",
            body: "Turning up to a conversation with a contractor, a county office or an agronomist already knowing that your ground is mapped as a named series, and what USDA records about it, changes the conversation. It also lets you read the official series description, which is far more detailed than anything a lookup can show.",
          },
        ],
      }}
      dataSection={{
        heading: "The data behind this soil lookup",
        paragraphs: [
          "Every figure on the result card comes from SSURGO, the Soil Survey Geographic Database, published by the USDA Natural Resources Conservation Service. SSURGO is the digitised form of the county soil surveys that USDA field scientists have been producing since the early twentieth century. Surveyors dug and described soil profiles, mapped the boundaries between them, and recorded properties such as texture, pH, drainage and water table depth for each mapped unit. It covers the overwhelming majority of US land, and it is the same dataset behind USDA's own Web Soil Survey.",
          "This page queries USDA's Soil Data Access service directly from your browser at the moment you press the button. Your address is first converted to coordinates by Photon, an open geocoder built on OpenStreetMap data; those coordinates are then used to find the soil map unit containing that point, and a second query pulls the components, soil layers and interpretations for that map unit. Nothing is cached or stored by this site, and the retrieval date shown on the result card is the moment the query ran. Both services receive your query directly, as the privacy policy sets out.",
          "The most important limitation is resolution. SSURGO maps areas, not points. A map unit can cover many hectares and is named for the soil that dominates it, but it routinely contains other soils as inclusions — the result card shows every component USDA lists and what share of the unit each accounts for. The values in the layer table are representative values for the map unit as a whole, not measurements taken at your address, so your actual soil can differ, especially near a boundary between two units. Survey dates also vary by county, some data is decades old, and any soil imported, removed or compacted since the survey will not appear at all.",
          "The second limitation is coverage, and for most people it is the one they meet. USDA maps built-up ground as Urban land, Udorthents or similar disturbed-ground units, which carry no soil profile — no texture, no pH, no drainage class. This is not an edge case: it is the normal result for a large share of residential addresses, including ordinary suburbs as well as city centres. Where that happens the tool says so explicitly, explains why the fields are blank, still shows what USDA does record for the unit, and lists the nearest mapped soils that do have profiles. Those nearby soils describe the surrounding ground and are labelled as such — they are not your parcel's data, and ground that has been built on is frequently nothing like the soil next to it.",
          "What this must not be used for: any decision that requires a physical test of your actual soil. A septic permit needs a percolation test or a soil evaluation conducted on site by a licensed evaluator, and no published rating substitutes for one. A foundation design needs a geotechnical investigation with boreholes. A nutrient plan needs a laboratory test of a sample from your own ground, because pH and organic matter change with management and the survey figure may be decades old. This tool tells you what the national soil survey recorded for the area your address falls in, which is a good reason to ask better questions and a poor basis for a decision that a professional should be making.",
        ],
        sources: [
          {
            label: "USDA NRCS Web Soil Survey",
            href: "https://websoilsurvey.nrcs.usda.gov/app/WebSoilSurvey.aspx",
            note: "USDA's own official interface to the same SSURGO data, including full reports and printable maps",
          },
          {
            label: "Soil Data Access",
            href: "https://sdmdataaccess.sc.egov.usda.gov/",
            note: "the public query service this page uses, with its documentation and query schema",
          },
          {
            label: "Official Soil Series Descriptions",
            href: "https://soilseries.sc.egov.usda.gov/osdname.aspx",
            note: "the full official description for any named series returned above",
          },
          {
            label: "USDA Soil Texture Calculator",
            href: "https://www.nrcs.usda.gov/resources/education-and-teaching-materials/soil-texture-calculator",
            note: "the texture triangle used to derive a class from sand, silt and clay percentages",
          },
        ],
      }}
      faqs={[
        {
          question: "Is this the same data as USDA Web Soil Survey?",
          answer:
            "Yes. Both read SSURGO through USDA's Soil Data Access service, so the figures should match. Web Soil Survey does far more than this page does — it draws maps, builds custom reports over an area you outline, and exposes hundreds of properties and interpretations. This page answers one question quickly for a single address. When you need the complete record, use Web Soil Survey; the result card links straight to it.",
        },
        {
          question: "Why does it say no soil profile was recorded for my address?",
          answer:
            "Because USDA maps your point as Urban land, Udorthents or a similar disturbed-ground unit. Where a site has been graded, built on, paved or filled, surveyors could not describe a natural soil profile, so no texture, pH or drainage was recorded. This is the normal outcome for a great many residential addresses, not a fault in the lookup. The tool still shows what USDA does record for the unit — flooding frequency, farmland class and so on — and lists the nearest mapped soils that do carry profiles.",
        },
        {
          question: "How accurate is this for my specific garden or building plot?",
          answer:
            "Treat it as accurate for the area, not for the point. Map units are large and are named for their dominant soil, while containing other soils as inclusions. The layer values are representative figures for the unit rather than measurements at your address. Accuracy is weakest near a boundary between two map units, on a small parcel, and anywhere the ground has been disturbed since the survey. If your plot sits near a boundary, look at the neighbouring unit too.",
        },
        {
          question: "Can I use this instead of a percolation test for a septic permit?",
          answer:
            "No. The septic rating shown is USDA's general assessment of the map unit, and permitting authorities do not accept it in place of a site evaluation. A permit requires a percolation test or soil evaluation carried out on your actual ground by a licensed evaluator, usually with test pits at the proposed drainfield. The rating here is useful for spotting a likely problem early and for deciding whether to investigate before you commit, and that is all.",
        },
        {
          question: "What does the drainage class actually mean?",
          answer:
            "It describes how quickly water leaves the soil under natural conditions, on a scale running from excessively drained through well drained and somewhat poorly drained to very poorly drained. It reflects the soil's own properties, not your guttering or landscaping. A somewhat poorly drained soil holds water near the surface for part of the year, which is why the shallowest water table figure is worth reading alongside it.",
        },
        {
          question: "Why does the texture shown sometimes differ from the sand, silt and clay percentages?",
          answer:
            "The texture label is the one USDA's surveyor assigned to that layer, and it sometimes carries a modifier the percentages alone cannot produce — \"very fine sandy loam\" or \"gravelly silt loam\", for instance. The percentages are a separately aggregated representative estimate. We show USDA's own label wherever it exists and only calculate a class from the percentages when no label was recorded, in which case the result card says so.",
        },
        {
          question: "Does this work outside the United States?",
          answer:
            "No. SSURGO is a US dataset, so the tool only answers for US locations. A point over open water, or anywhere outside US survey coverage, returns a clear message saying there is no coverage rather than a blank or a guess.",
        },
        {
          question: "Can I reuse the data this returns?",
          answer:
            "The underlying SSURGO data is produced by USDA NRCS and is in the public domain as a US government work, so it can generally be reused, including commercially. Check USDA's current terms for anything substantial, and cite USDA NRCS as the source along with the retrieval date, since the survey is revised over time. Geocoding comes from OpenStreetMap data via Photon and is subject to the Open Database Licence.",
        },
      ]}
    >
      <SoilTool />
    </ToolPageLayout>
  );
}
