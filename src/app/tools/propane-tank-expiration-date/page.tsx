import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PropaneTankTool from "@/components/PropaneTankTool";
import { requireTool } from "@/config/tools";

const SLUG = "propane-tank-expiration-date";
// Fails the build if the registry entry is missing, so a page can never exist
// without being wired into the nav, footer and sitemap.
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Propane Tank Expiration Date: When Your Cylinder Needs Requalifying",
  description:
    "Enter the date stamped on your propane cylinder's collar and any requalification mark (none, S or E) and get the month it next needs requalifying under 49 CFR 180.209, with the rule and the arithmetic. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PropaneTankExpirationDatePage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to read the date on a propane tank",
        steps: [
          {
            name: "Find the manufacture date on the collar",
            text: "On a portable cylinder the markings are stamped into the collar (the metal ring around the valve) or the shoulder. The manufacture date is a month and a two-digit year, often with an inspector's mark between them, such as 04 ◆ 19 for April 2019. It is the earliest date stamped there.",
          },
          {
            name: "Look for a later requalification date",
            text: "A requalification date is a month and year with a four-character requalifier number (RIN) set in a square between them. Under 49 CFR 180.213 a plain date means a volumetric expansion test, a trailing S means a proof pressure test, and a trailing E means an external visual inspection. If there are several, use the most recent.",
          },
          {
            name: "Enter the dates and the mark",
            text: "Pick the month, type the four-digit year, and choose which mark the latest requalification carries. A stamped 19 is 2019; a stamped 98 is 1998.",
          },
          {
            name: "Read the due month and how it was counted",
            text: "The result gives the month by which the next requalification is due, how far away (or how long ago) that is, and the paragraph of 49 CFR 180.209 that sets the period. A cylinder with only its manufacture date is counted 12 years from that date.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the stamped date matters",
        items: [
          {
            title: "Checking a grill tank before a refill trip",
            body: "A cylinder stamped 06 ◆ 13 reached its 12-year mark in June 2025. Knowing that before driving to the filling station saves a wasted trip if the filler checks the date and refuses it.",
          },
          {
            title: "Deciding whether a cylinder is worth refilling",
            body: "A refill puts the same cylinder back in your hands. Seeing that it is due for requalification in a few months is a concrete fact to weigh before paying to fill it again.",
          },
          {
            title: "Inspecting cylinders on a used grill or RV before buying it",
            body: "Cylinders that come with a used camper or grill are often well past their date. Reading the collar takes a minute and turns 'two tanks included' into an accurate figure.",
          },
          {
            title: "Reading a cylinder that was requalified once already",
            body: "A cylinder made in 2005 with a later 'E' mark from 2017 is not counted from 2005. The external visual inspection restarts the clock at five years, so it came due in 2022, which a 'manufacture date plus 12' rule of thumb gets wrong.",
          },
          {
            title: "Sorting a stack of forklift cylinders at a warehouse",
            body: "Forklift cylinders change hands constantly. Entering each collar date shows which ones are due this month and which have years left, before a filler or inspector raises it.",
          },
          {
            title: "Checking a 100 lb cylinder on a rural property",
            body: "Larger portable cylinders sit outside for years and are refilled on site. Their requalification date follows the same rule as a grill tank, and knowing it avoids a delivery driver declining to fill.",
          },
          {
            title: "Settling an argument about 10 years versus 12 years",
            body: "Many pages, including an older PHMSA leaflet, say 10 years. The current text of 49 CFR 180.209(e), in force since a 2020 rule, says 12 for the first requalification. The result shows the paragraph so the disagreement is settled by the regulation itself.",
          },
          {
            title: "Understanding an 'S' or 'E' you have never seen before",
            body: "A letter after a requalification date changes when the next one is due: 10 years for S, 5 years for E. Choosing the mark you see gives the right date instead of a guess.",
          },
          {
            title: "Planning when to replace cylinders for a food truck or caterer",
            body: "A business running several cylinders can list each due month and replace or requalify them on a schedule rather than finding out at the filling station on a busy day.",
          },
          {
            title: "Finding out that a yard tank is not covered by this rule",
            body: "A large tank with an ASME data plate is not a DOT specification cylinder. The page says plainly that 49 CFR 180.209 gives no date for it, rather than inventing one.",
          },
        ],
      }}
      dataSection={{
        heading: "Where these dates come from",
        paragraphs: [
          "The periods come from 49 CFR 180.209, the US Department of Transportation regulation (administered by the Pipeline and Hazardous Materials Safety Administration, PHMSA) that says when specification cylinders must be requalified. Paragraph (e) allows a DOT 4B, 4BA, 4BW or 4E cylinder that is protected externally by a corrosion-resistant coating and used only for non-corrosive gas to be requalified by volumetric expansion testing every 12 years instead of every 5. A proof pressure test is the alternative, repeated every 10 years after the initial 12-year period. Paragraph (g) and its Table 2 allow liquefied petroleum gas cylinders to be given an external visual inspection instead of a hydrostatic test, with later inspections every five years. The marks that tell these apart (a plain date, an S, or an E) are set out in 49 CFR 180.213(f).",
          "The 12-year figure is recent. The Federal Register shows that a 2020 PHMSA final rule (85 FR 68790, effective November 30, 2020), issued in response to a petition from the National Propane Gas Association, authorized 12-year initial and subsequent periods for volumetric expansion testing and a 12-year initial period for proof pressure testing, while keeping 10 years for later proof pressure tests. Before that rule the periods were 10 years, which is why older guidance, including a PHMSA leaflet that still ranks in search, says 10.",
          "This page reads the regulation text from eCFR (current as of October 1, 2026) and does the date arithmetic in your browser. Nothing is fetched while you use it and nothing you enter is sent or stored. Dates are counted in whole months, because cylinders are stamped with a month and year only.",
          "Its limits: it assumes the cylinder meets paragraph (e)'s conditions, and shows the 5-year Table 1 date for comparison in case it does not. It covers DOT 4-series cylinders in propane service, not ASME tanks, disposable cylinders, or cylinders for other gases. It cannot see the cylinder. Paragraph (c) requires a cylinder with a leak, corrosion, denting, bulging or a 5 percent loss of tare weight to be requalified before refilling whatever its date, and only a holder of a DOT requalifier identification number can requalify one.",
          "What it must not be used for: deciding that a particular cylinder is safe to fill, use or transport. It reports the date the regulation gives for the marks you entered. The filler or a registered requalifier who examines the cylinder makes that call.",
        ],
        sources: [
          {
            label: "eCFR: 49 CFR 180.209, Requirements for requalification of specification cylinders",
            href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-180/subpart-C/section-180.209",
            note: "Paragraphs (c), (e) and (g): the periods and conditions used here",
          },
          {
            label: "eCFR: 49 CFR 180.213, Requalification markings",
            href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-180/subpart-C/section-180.213",
            note: "How a requalification date, the RIN, and the S and E letters are stamped",
          },
          {
            label: "Federal Register: 85 FR 68790 (October 30, 2020)",
            href: "https://www.federalregister.gov/documents/2020/10/30/2020-22483/hazardous-materials-response-to-an-industry-petition-to-reduce-regulatory-burden-for-cylinder",
            note: "The final rule that set today's 12-year periods",
          },
          {
            label: "PHMSA: Requalification Guidance for Propane Cylinders (PDF)",
            href: "https://www.phmsa.dot.gov/sites/phmsa.dot.gov/files/docs/propane_en_v3.pdf",
            note: "Useful collar diagram; its 10-year periods predate the 2020 rule",
          },
        ],
      }}
      faqs={[
        {
          question: "Do propane tanks expire?",
          answer:
            "Not in the sense of a use-by date. A refillable DOT cylinder has to be requalified (tested or inspected and re-marked) at the intervals in 49 CFR 180.209. For a propane cylinder with only its manufacture date, the first one is due 12 years after that date. A cylinder that is past due for requalification is what people usually mean by an expired tank.",
        },
        {
          question: "Is it 10 years or 12 years?",
          answer:
            "The current text of 49 CFR 180.209(e) says 12 years for the first requalification and for later volumetric expansion tests. It was 10 years until a PHMSA final rule took effect on November 30, 2020 (85 FR 68790). Older pages, and PHMSA's own propane leaflet, still show 10.",
        },
        {
          question: "What does the E or S after a date mean?",
          answer:
            "Under 49 CFR 180.213(f), an E marks a 5-year external visual inspection and an S marks a proof pressure test. A date with no letter marks a volumetric expansion test. Under 180.209 the next requalification is due 5, 10 or 12 years after that date respectively.",
        },
        {
          question: "Why does it ask for a four-digit year?",
          answer:
            "Cylinders are stamped with two-digit years, so 08 could be 1908 or 2008 in principle. Typing the four-digit year avoids a wrong guess. In practice a stamped 19 is 2019 and a stamped 98 is 1998.",
        },
        {
          question: "Does this apply to the big tank in my yard?",
          answer:
            "No. 49 CFR 180.209 covers DOT specification cylinders, the ones with a DOT specification stamped on the collar. A tank identified by an ASME data plate is not one of them, so this page gives no date for it.",
        },
        {
          question: "Can I requalify a cylinder myself?",
          answer:
            "No. Under 49 CFR 180.213, requalification marks are applied by a holder of a DOT requalifier identification number (RIN), or a visual inspection number for an E mark. PHMSA publishes the list of approved holders.",
        },
        {
          question: "If the date is fine, does that mean the cylinder can be filled?",
          answer:
            "Not on its own. 49 CFR 180.209(c) requires a cylinder showing a leak, corrosion, denting, bulging or a 5 percent loss of tare weight to be requalified before it is refilled, whatever its date. This page only works out the date.",
        },
      ]}
    >
      <PropaneTankTool />
    </ToolPageLayout>
  );
}
