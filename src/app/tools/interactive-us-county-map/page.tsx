import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import UsCountyMapTool from "@/components/UsCountyMapTool";
import { requireTool } from "@/config/tools";

const SLUG = "interactive-us-county-map";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Interactive US County Map: Population, Income and Home Values",
  description:
    "An interactive map of all 3,144 US counties coloured by population, density, median household income or median home value. Hover for figures, search any county, download PNG, SVG or CSV.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function Page() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to use the interactive county map",
        steps: [
          { name: "Choose what to colour by", text: "Population, people per square mile, median household income, median home value or land area." },
          { name: "Explore", text: "Hover or tap a county for its figure; zoom with + and drag to pan." },
          { name: "Find a county", text: "Type its name to highlight it and see all its figures." },
          { name: "Download", text: "Save the map as PNG or SVG, or all the figures as CSV." },
        ],
      }}
      uses={{
        heading: "What people use a county map for",
        items: [
          { title: "Comparing places to live", body: "See incomes and home values side by side." },
          { title: "Business expansion", body: "Spot dense, high-income counties." },
          { title: "Reports and presentations", body: "Download a clean map image." },
          { title: "Teaching geography", body: "Where the people are — and are not." },
          { title: "Grant and policy work", body: "County-level context for an application." },
          { title: "Data journalism", body: "A quick choropleth with stated sources." },
        ],
      }}
      dataSection={{
        heading: "Where the map and figures come from",
        paragraphs: [
          "Outlines are the Census Bureau's 2024 cartographic boundary files (1:500,000), simplified and drawn in an Albers equal-area projection, with Alaska and Hawaii moved and rescaled as is usual on US maps.",
          "Population, median household income and median home value are American Community Survey 2019–2023 five-year estimates (tables B01003, B19013 and B25077). Land area is from the 2024 Census Gazetteer. These are survey estimates with margins of error, which are largest for small counties.",
          "Colours use seven quantile classes: each colour holds about the same number of counties.",
        ],
        sources: [
          { label: "Census Bureau cartographic boundary files", href: "https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html" },
          { label: "American Community Survey summary file", href: "https://www.census.gov/programs-surveys/acs/data/summary-file.html" },
          { label: "Census Bureau Gazetteer files", href: "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html" },
          { label: "ColorBrewer", href: "https://colorbrewer2.org/", note: "colour scheme" },
        ],
      }}
      faqs={[
        { question: "How many counties are there?", answer: "3,144 counties and county-equivalents in the 50 states and DC in the 2024 boundaries, including Louisiana parishes, Alaska boroughs and census areas, independent cities and Connecticut's planning regions." },
        { question: "Why are the colour classes uneven?", answer: "They are quantiles: each colour holds roughly one-seventh of the counties, so the map shows rank rather than raw size." },
        { question: "Is the income figure per household?", answer: "Yes, median household income in 2023 inflation-adjusted dollars." },
        { question: "Can I use the map image?", answer: "The underlying data are public Census data. Credit the Census Bureau as the source." },
        { question: "Why is a county grey?", answer: "No estimate is published for it." },
      ]}
    >
      <UsCountyMapTool />
    </ToolPageLayout>
  );
}
