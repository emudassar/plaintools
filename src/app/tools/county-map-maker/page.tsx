import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import MapPainterTool from "@/components/MapPainterTool";
import { requireTool } from "@/config/tools";

const SLUG = "county-map-maker";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "County Map Maker: Color US Counties and Make a County Map",
  description:
    "Make a custom county map of the US or any state. Click counties to colour them or paste county names or FIPS codes with groups or numbers. Add a legend; download PNG, SVG or PDF.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to make a county map",
        steps: [
          { name: "Choose the map", text: "All US counties, or the counties of one state." },
          { name: "Colour counties", text: "Click to paint them with the selected colour." },
          { name: "Or paste data", text: "County names or FIPS codes with a group name, colour or number." },
          { name: "Add a title and legend", text: "Label each colour; numbers get a shaded legend automatically." },
          { name: "Download", text: "PNG, SVG or a PDF for print." },
        ],
      }}
      uses={{
        heading: "What county maps are used for",
        items: [
          { title: "Sales and service territories", body: "Assign counties to reps or branches." },
          { title: "Coverage maps", body: "Where an insurer, ISP or utility operates." },
          { title: "Election results", body: "Shade counties by result." },
          { title: "Public health and research", body: "Map county-level rates from a spreadsheet." },
          { title: "Real estate", body: "Counties where you hold licences." },
          { title: "Genealogy", body: "Counties where records were found." },
          { title: "Emergency management", body: "Declared counties." },
          { title: "Teaching", body: "County geography exercises." },
        ],
      }}
      dataSection={{
        heading: "Where the county outlines come from",
        paragraphs: [
          "County outlines are the Census Bureau's 2024 cartographic boundary files at 1:500,000, simplified for the web. The all-county map uses an Albers equal-area projection with Alaska and Hawaii moved and rescaled; single-state maps use a simple equirectangular projection scaled for the state's latitude.",
          "Counties are matched by five-digit FIPS code or by name. Names like 'Cook County' or 'Cook' work on a state map; on the all-counties map add the state (Cook County, IL) because many names repeat.",
          "Since 2022 Connecticut's county-equivalents are nine planning regions, which is what the 2024 files contain. Everything is drawn in your browser; nothing is uploaded.",
        ],
        sources: [
          { label: "Census Bureau cartographic boundary files", href: "https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html" },
          { label: "Census Bureau: ANSI and FIPS codes", href: "https://www.census.gov/library/reference/code-lists/ansi.html" },
          { label: "ColorBrewer", href: "https://colorbrewer2.org/" },
        ],
      }}
      faqs={[
        { question: "What is a FIPS code?", answer: "A five-digit county code: two digits for the state, three for the county. 06037 is Los Angeles County." },
        { question: "Why did some counties not match?", answer: "Check spelling and add the state on the all-counties map. Independent cities in Virginia are named like 'Richmond city'." },
        { question: "Can I shade by a number?", answer: "Yes — paste county and number; the map uses seven quantile classes." },
        { question: "Can I map Puerto Rico?", answer: "Yes, its 78 municipios are a separate choice in the list." },
        { question: "Can I use the map commercially?", answer: "The Census outlines are public domain and the map you make is yours." },
      ]}
    >
      <MapPainterTool bases={["us-counties", "st:AL", "st:AK", "st:AZ", "st:AR", "st:CA", "st:CO", "st:CT", "st:DE", "st:DC", "st:FL", "st:GA", "st:HI", "st:ID", "st:IL", "st:IN", "st:IA", "st:KS", "st:KY", "st:LA", "st:ME", "st:MD", "st:MA", "st:MI", "st:MN", "st:MS", "st:MO", "st:MT", "st:NE", "st:NV", "st:NH", "st:NJ", "st:NM", "st:NY", "st:NC", "st:ND", "st:OH", "st:OK", "st:OR", "st:PA", "st:RI", "st:SC", "st:SD", "st:TN", "st:TX", "st:UT", "st:VT", "st:VA", "st:WA", "st:WV", "st:WI", "st:WY", "st:PR"]} initial="us-counties" dataHint="One county per line: a 5-digit FIPS code or a name (on the all-counties map add the state, e.g. Cook County, IL), then a comma and a group name, a colour like #e31a1c, or a number." />
    </ToolPageLayout>
  );
}
