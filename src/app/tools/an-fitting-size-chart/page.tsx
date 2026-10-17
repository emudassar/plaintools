import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import AnFittingTool from "@/components/AnFittingTool";
import { requireTool } from "@/config/tools";
import { HAMLET_URL } from "@/lib/an-fitting";

const SLUG = "an-fitting-size-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "AN Fitting Size Chart: Dash Sizes, Threads and Tube OD",
  description:
    "37° flare dash sizes -2 to -32 with tube outside diameter, straight thread size, pipe size and pressure ratings from a SAE J514 catalog — and identify a fitting by measuring its male thread.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function AnFittingPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to identify an AN or 37° flare fitting size",
        steps: [
          { name: "Measure the male thread", text: "Outside diameter across the thread crests, with calipers." },
          { name: "Enter it", text: "In inches or millimetres." },
          { name: "Read the closest dash size", text: "And the next closest, in case the thread is worn." },
          { name: "Confirm the pitch", text: "Check threads per inch with a pitch gauge against the chart." },
        ],
      }}
      uses={{
        heading: "10 situations where an AN fitting size chart helps",
        items: [
          { title: "Fuel line plumbing", body: "Match a -6 or -8 line to the right fittings and adapters." },
          { title: "Identifying an unknown fitting", body: "Measure the thread and find the dash size." },
          { title: "Buying adapters", body: "Know the thread on each end before ordering." },
          { title: "Oil cooler and turbo lines", body: "Dash sizes for oil feed and return." },
          { title: "Brake lines", body: "Small sizes like -3 and -4." },
          { title: "Hydraulic tube work", body: "37° flare (SAE J514) is common on hydraulic systems." },
          { title: "Converting to pipe thread", body: "The chart lists the nominal pipe size used with each dash size." },
          { title: "Checking pressure ratings", body: "One maker's working pressures for each size." },
          { title: "Metric measurements", body: "Enter millimetres from metric calipers." },
          { title: "Telling 37° from 45° flare", body: "If nothing matches, the fitting may be a different flare system." },
        ],
      }}
      dataSection={{
        heading: "Where the chart comes from",
        paragraphs: [
          "The table is Table 2 of Ham-Let's 'SAE37 Flare 3-Piece Tube Assembly' catalog (2025), whose fittings are described as 'compliant with SAE J514 standard'. It lists, for each nominal SAE dash size, the nominal tube outside diameter, the 37° flare straight thread, the nominal pipe size, and Ham-Let's allowable working pressures for union and bulkhead fittings and for fittings with pipe threads. Values are copied as printed.",
          "The dash number is the tube's outside diameter in sixteenths of an inch: -6 is 6/16 = 3/8 in tube. The identifier compares a measured thread diameter with the nominal major diameter of each thread in the table.",
          "Limits: the pressure ratings are one manufacturer's figures for its 316/316L stainless steel fittings, and the catalog itself says they 'should not be construed as guaranteed minimum'. AN (military) parts are specified in separate documents; check your parts' specifications where it matters. A 45° SAE flare fitting can share a thread size with a 37° part but will not seal against it. Everything runs in your browser.",
        ],
        sources: [{ label: "Ham-Let — SAE37 Flare 3-Piece Tube Assembly catalog (SAE J514)", href: HAMLET_URL, note: "Table 2: dash size, tube O.D., thread, pipe size, pressure" }],
      }}
      faqs={[
        { question: "What thread is -6 AN?", answer: "In the SAE J514 37° flare table used here, -6 is 9/16-18 for 3/8 in tube." },
        { question: "What does the dash number mean?", answer: "Tube outside diameter in sixteenths of an inch: -8 = 8/16 = 1/2 in." },
        { question: "What thread is -8?", answer: "3/4-16 for 1/2 in tube." },
        { question: "How do I measure an AN fitting?", answer: "Measure the outside diameter of the male thread with calipers, then confirm threads per inch with a pitch gauge." },
        { question: "Are AN and JIC the same?", answer: "Both are 37° flare systems with the same dash sizes. Military AN parts have their own specifications, so check yours where it matters." },
        { question: "Can I connect a 37° fitting to a 45° flare?", answer: "No. The flare angles don't seal against each other even when the threads match." },
      ]}
    >
      <AnFittingTool />
    </ToolPageLayout>
  );
}
